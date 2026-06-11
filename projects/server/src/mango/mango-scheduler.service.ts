import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { MangoService } from './mango.service'
import { MangoIntegrationService } from './mango-integration.service'
import { resolveMangoCallConfig } from './mango-config'

const POLL_INTERVAL_MS = 5000
const MAX_RETRIES = 3
const BATCH = 20

/** Полезная нагрузка задачи mango_call (секреты НЕ храним — резолвятся при исполнении). */
export type MangoTaskPayload = {
  requestId: string
  projectId: string
  commandId: string
  toNumber: string
  call: {
    callMode?: string
    managerType?: string
    managerAddress?: string
    clientLineNumber?: string
  }
}

/**
 * Polling-воркер отложенных звонков. Раз в ~5с берёт `mango_call` задачи с `execute_at <= now`,
 * резолвит креды (Фаза 1 — глобальный env; Фаза 2 — ProjectIntegration), инициирует звонок,
 * пишет результат. Логика (`runDueMangoTasks`) отделена от интервала и тестируется изолированно.
 */
@Injectable()
export class MangoSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(MangoSchedulerService.name)
  private timer: ReturnType<typeof setInterval> | undefined
  private busy = false

  constructor(
    private readonly prisma: PrismaService,
    private readonly mango: MangoService,
    private readonly integration: MangoIntegrationService
  ) {}

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => void this.tick(), POLL_INTERVAL_MS)
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer)
  }

  private async tick(): Promise<void> {
    if (this.busy) return
    this.busy = true
    try {
      await this.runDueMangoTasks(new Date())
    } catch (e) {
      this.logger.error(`scheduler tick failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      this.busy = false
    }
  }

  /** Глобальные креды Mango (Фаза 1). Фаза 2 — переопределение из ProjectIntegration по projectId. */
  private envSecrets() {
    return {
      apiKey: process.env.MANGO_VPBX_API_KEY,
      apiSalt: process.env.MANGO_VPBX_API_SALT,
      defaultLineNumber: process.env.MANGO_VPBX_LINE_NUMBER
    }
  }

  async runDueMangoTasks(now: Date): Promise<{ processed: number }> {
    const tasks = await this.prisma.scheduledTask.findMany({
      where: { type: 'mango_call', status: 'pending', executeAt: { lte: now } },
      orderBy: { executeAt: 'asc' },
      take: BATCH
    })

    for (const task of tasks) {
      const p = task.payload as MangoTaskPayload

      // Гибрид: BYO-интеграция проекта приоритетнее глобального env-аккаунта.
      const byo = await this.integration.resolveForProject(p.projectId)
      const env = this.envSecrets()
      const resolved = byo
        ? resolveMangoCallConfig({ secrets: byo.secrets, call: byo.call })
        : resolveMangoCallConfig({
            secrets: { apiKey: env.apiKey, apiSalt: env.apiSalt },
            call: p.call,
            defaultLineNumber: env.defaultLineNumber
          })

      if (!resolved.ok) {
        await this.prisma.scheduledTask.update({
          where: { id: task.id },
          data: { status: 'failed', lastError: resolved.reason }
        })
        continue
      }

      const result = await this.mango.initCall(resolved.config, {
        commandId: p.commandId,
        toNumber: p.toNumber
      })

      if (result.ok) {
        await this.prisma.scheduledTask.update({ where: { id: task.id }, data: { status: 'success' } })
        await this.prisma.request.update({
          where: { id: p.requestId },
          data: { status: 'processed', mangoCommandId: p.commandId }
        })
      } else {
        const retries = task.retries + 1
        const failed = retries >= MAX_RETRIES
        await this.prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            status: failed ? 'failed' : 'pending',
            retries,
            lastError: result.error ?? `code ${result.code}`
          }
        })
      }
    }

    return { processed: tasks.length }
  }
}
