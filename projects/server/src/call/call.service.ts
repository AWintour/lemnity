import { Injectable, NotFoundException } from '@nestjs/common'
import { subDays } from 'date-fns'
import type { Prisma, WidgetType } from '@lemnity/database'
import { PrismaService } from '../prisma.service'
import { MangoService } from '../mango/mango.service'
import { MangoIntegrationService } from '../mango/mango-integration.service'
import { resolveMangoCallConfig } from '../mango/mango-config'
import { buildCallsSummary, type CallsSummary } from './call-summary'
import type { ListCallsDto } from './dto/list-calls.dto'
import type { CallEntity } from './entities/call.entity'

type CallRow = {
  id: string
  createdAt: Date
  projectId: string
  phone: string | null
  managerId: string | null
  managerName: string | null
  managerType: string | null
  callDurationSec: number | null
  status: string
  callRecordingUrl: string | null
}

const toEntity = (r: CallRow): CallEntity => ({
  id: r.id,
  createdAt: r.createdAt.toISOString(),
  projectId: r.projectId,
  phone: r.phone ?? undefined,
  managerName: r.managerName ?? undefined,
  managerType: r.managerType ?? undefined,
  durationSec: r.callDurationSec ?? undefined,
  status: r.status,
  hasRecording: !!r.callRecordingUrl
})

/**
 * Список звонков и сводка для вкладки «Звонки». Звонки = CALLBACK-заявки с итогом звонка
 * (переиспользуем `Request`). Прослушивание записи — через прокси (записи Mango приватные).
 */
@Injectable()
export class CallService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mango: MangoService,
    private readonly integration: MangoIntegrationService
  ) {}

  async list(
    userId: string,
    query: ListCallsDto
  ): Promise<{ calls: CallEntity[]; total: number; summary: CallsSummary }> {
    const period = query.period ?? '30d'
    const take = query.take ?? 50
    const skip = query.skip ?? 0

    const createdAtFilter = (() => {
      if (period === 'all') return undefined
      if (period === '7d') return { gte: subDays(new Date(), 7) }
      if (period === '90d') return { gte: subDays(new Date(), 90) }
      return { gte: subDays(new Date(), 30) }
    })()

    const where: Prisma.RequestWhereInput = {
      project: { userId },
      widget: { type: 'CALLBACK' as WidgetType },
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {})
    }

    const [items, total, summaryRows] = await Promise.all([
      this.prisma.request.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.request.count({ where }),
      // Сводка — по всему отфильтрованному набору, не по странице.
      this.prisma.request.findMany({
        where,
        select: { managerId: true, managerName: true, status: true, callDurationSec: true }
      })
    ])

    return {
      calls: (items as CallRow[]).map(toEntity),
      total,
      summary: buildCallsSummary(summaryRows)
    }
  }

  /**
   * Получить запись звонка для проигрывания (owner-check). Если сохранён играбельный URL —
   * отдаём его (редирект). Иначе тянем из Mango Server API через `MangoService.fetchRecording`.
   */
  async getRecording(
    userId: string,
    id: string
  ): Promise<{ kind: 'redirect'; url: string } | { kind: 'stream'; body: Buffer; contentType: string } | { kind: 'none' }> {
    const req = await this.prisma.request.findFirst({
      where: { id, project: { userId } },
      select: { callRecordingUrl: true, projectId: true }
    })
    if (!req) throw new NotFoundException('Call not found')
    if (!req.callRecordingUrl) return { kind: 'none' }

    if (/^https?:\/\//i.test(req.callRecordingUrl)) {
      return { kind: 'redirect', url: req.callRecordingUrl }
    }

    // recording — непрямой id: тянем из Mango с кредами проекта (BYO) или глобальными (env).
    const byo = await this.integration.resolveForProject(req.projectId)
    const resolved = byo
      ? resolveMangoCallConfig({ secrets: byo.secrets, call: byo.call })
      : resolveMangoCallConfig({
          secrets: { apiKey: process.env.MANGO_VPBX_API_KEY, apiSalt: process.env.MANGO_VPBX_API_SALT },
          call: { managerAddress: 'x' } // адрес не нужен для запроса записи; заглушка для резолва секретов
        })
    if (!resolved.ok) return { kind: 'none' }

    const rec = await this.mango.fetchRecording(resolved.config, req.callRecordingUrl)
    if (!rec.ok || !rec.body) return { kind: 'none' }
    return { kind: 'stream', body: rec.body, contentType: rec.contentType ?? 'audio/mpeg' }
  }
}
