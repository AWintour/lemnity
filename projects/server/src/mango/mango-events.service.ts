import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { MangoSummary } from './mango-events'

/**
 * Применение итогового события звонка Mango к заявке. Сопоставление — по `mangoCommandId`.
 * Идемпотентно: повторное событие перезаписывает те же поля. `used` — был разговор,
 * `not_processed` — клиент не взял трубку. См. plan-wid-call.md, Фаза 2, Стейдж 2.
 */
@Injectable()
export class MangoEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async applyEvent(summary: MangoSummary): Promise<{ matched: boolean }> {
    const req = await this.prisma.request.findFirst({
      where: { mangoCommandId: summary.commandId },
      select: { id: true }
    })
    if (!req) return { matched: false }

    const data: {
      status: 'used' | 'not_processed'
      callDurationSec?: number
      callRecordingUrl?: string
    } = { status: summary.answered ? 'used' : 'not_processed' }
    if (typeof summary.durationSec === 'number') data.callDurationSec = summary.durationSec
    if (summary.recordingUrl) data.callRecordingUrl = summary.recordingUrl

    await this.prisma.request.update({ where: { id: req.id }, data })
    return { matched: true }
  }
}
