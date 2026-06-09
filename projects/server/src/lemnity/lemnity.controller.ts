import { Controller, Get, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { LemnityService } from './lemnity.service'

type RawRequest = Request & { rawBody?: Buffer }

function sigHeader(req: Request): string | null {
  const h = req.headers['x-lemnity-signature']
  return Array.isArray(h) ? (h[0] ?? null) : (h ?? null)
}

@ApiTags('lemnity')
@Controller('lemnity')
export class LemnityController {
  constructor(private readonly lemnity: LemnityService) {}

  /**
   * Вебхук из ЛК lemnity.ru после оплаты подписки на виджет.
   * Всегда 200 (как у Точки): неверная подпись/тело → { skipped }, чтобы не зациклить ретраи.
   */
  @Post('widget-subscription')
  async widgetSubscription(@Req() req: RawRequest) {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body ?? {})
    if (!this.lemnity.verify(raw, sigHeader(req))) {
      return { skipped: 'unverified' }
    }
    let payload: Record<string, unknown>
    try {
      payload = JSON.parse(raw) as Record<string, unknown>
    } catch {
      return { skipped: 'invalid_json' }
    }
    if (payload.type !== 'widget_subscription' || typeof payload.widgetId !== 'string') {
      return { skipped: 'bad_payload' }
    }
    return this.lemnity.applySubscription({
      userId: typeof payload.userId === 'string' ? payload.userId : '',
      widgetId: payload.widgetId,
      months: typeof payload.months === 'number' ? payload.months : 1,
      paymentId: typeof payload.paymentId === 'string' ? payload.paymentId : undefined
    })
  }

  /** Список виджетов пользователя ЛК (подпись = hmac(secret, userId)). */
  @Get('widgets')
  async widgets(@Query('userId') userId: string, @Req() req: Request) {
    if (!userId || !this.lemnity.verify(userId, sigHeader(req))) {
      return { widgets: [] }
    }
    return { widgets: await this.lemnity.listByLemnityUser(userId) }
  }
}
