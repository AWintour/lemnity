import { Controller, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { MangoEventsService } from './mango-events.service'
import { isAllowedMangoSource, parseMangoSummaryEvent } from './mango-events'

type RawRequest = Request & { rawBody?: Buffer }

/**
 * Вебхуки статуса звонка Mango (`events/summary`). Mango шлёт form-поле `json` с событием.
 * Всегда 200 (мягко, как у Точки/lemnity) — чтобы не зациклить ретраи. Источник — IP-allowlist Mango
 * (в dev/при MANGO_WEBHOOK_SKIP_IP_CHECK — пропускаем). Идемпотентность — в applyEvent по command_id.
 * ⚠️ Точная форма событий Mango проверяется на боевых вебхуках (на localhost не доходят).
 */
@ApiTags('mango')
@Controller('mango')
export class MangoEventsController {
  constructor(private readonly events: MangoEventsService) {}

  @Post('events')
  async receive(@Req() req: RawRequest): Promise<{ ok?: true; skipped?: string }> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? undefined
    const allowed = isAllowedMangoSource(ip, {
      isProd: process.env.NODE_ENV === 'production',
      skip: process.env.MANGO_WEBHOOK_SKIP_IP_CHECK === 'true'
    })
    if (!allowed) return { skipped: 'ip' }

    const body = req.body as { json?: unknown } | undefined
    const jsonStr =
      typeof body?.json === 'string'
        ? body.json
        : req.rawBody
          ? req.rawBody.toString('utf8')
          : JSON.stringify(req.body ?? {})

    const parsed = parseMangoSummaryEvent(jsonStr)
    if (!parsed) return { skipped: 'unparsed' }

    await this.events.applyEvent(parsed)
    return { ok: true }
  }
}
