import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../prisma.service'
import { RequestService } from './request.service'
import type { CreatePublicRequestDto } from './dto/create-public-request.dto'

type CreateMeta = { ip?: string; userAgent?: string; originHost: string | null }

/**
 * Обработка публичной заявки на обратный звонок (Фаза 2).
 * Переиспользует `RequestService.createPublic` (origin-check + создание Request + месячный лимит
 * callback-заявок), затем планирует звонок: `ScheduledTask(mango_call, executeAt=now+delaySeconds)`.
 * Сам звонок инициирует воркер `MangoSchedulerService`. См. plan-wid-call.md, Фаза 2, Стейдж 1.
 */
@Injectable()
export class CallbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requests: RequestService
  ) {}

  async createCallback(
    dto: CreatePublicRequestDto,
    meta: CreateMeta,
    opts?: { now?: Date; commandId?: string }
  ): Promise<{ delaySeconds: number }> {
    const phone = (dto.phone ?? '').trim()
    if (!phone) throw new BadRequestException('phone is required')

    // Лид + origin-check + энфорсмент лимита заявок (переиспользуем).
    const entity = await this.requests.createPublic(dto, meta)

    const widget = await this.prisma.widget.findUnique({
      where: { id: dto.widgetId },
      select: { projectId: true, type: true, config: true }
    })

    const cb =
      ((widget?.config as { widget?: { callback?: Record<string, unknown> } } | null)?.widget
        ?.callback as
        | {
            delaySeconds?: number
            call?: {
              callMode?: string
              managerType?: string
              managerAddress?: string
              clientLineNumber?: string
            }
          }
        | undefined) ?? {}

    const delaySeconds =
      typeof cb.delaySeconds === 'number' && cb.delaySeconds > 0 ? Math.floor(cb.delaySeconds) : 20

    const now = opts?.now ?? new Date()
    const commandId = opts?.commandId ?? randomUUID()
    const call = cb.call ?? {}

    await this.prisma.scheduledTask.create({
      data: {
        type: 'mango_call',
        executeAt: new Date(now.getTime() + delaySeconds * 1000),
        payload: {
          requestId: entity.id,
          projectId: widget?.projectId ?? entity.projectId,
          commandId,
          toNumber: phone,
          call: {
            callMode: call.callMode,
            managerType: call.managerType,
            managerAddress: call.managerAddress,
            clientLineNumber: call.clientLineNumber
          }
        }
      }
    })

    await this.prisma.request.update({
      where: { id: entity.id },
      data: { mangoCommandId: commandId }
    })

    return { delaySeconds }
  }
}
