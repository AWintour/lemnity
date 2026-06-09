import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { LemnityService } from './lemnity.service'
import { AuthService } from '../auth/auth.service'

type RawRequest = Request & { rawBody?: Buffer }

function sigHeader(req: Request): string | null {
  const h = req.headers['x-lemnity-signature']
  return Array.isArray(h) ? (h[0] ?? null) : (h ?? null)
}

@ApiTags('lemnity')
@Controller('lemnity')
export class LemnityController {
  constructor(
    private readonly lemnity: LemnityService,
    private readonly auth: AuthService
  ) {}

  /**
   * SSO-вход из ЛК lemnity.ru: обмен подписанного тикета на сессию app (без логина).
   * Проверяем HMAC → находим/создаём юзера по email → выдаём пару токенов (как /auth/login):
   * refresh — в httpOnly-cookie, access — в ответе (клиент кладёт в authStore).
   */
  @Post('ticket-exchange')
  async ticketExchange(
    @Body() body: { ticket?: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const ticket = typeof body?.ticket === 'string' ? body.ticket : ''
    const payload = this.lemnity.verifyTicket(ticket)
    if (!payload) throw new UnauthorizedException('invalid_ticket')

    const { refreshToken, ...rest } = await this.auth.loginViaLemnity({ email: payload.email })
    this.auth.addRefreshTokenToResponse(res, refreshToken)
    return rest // { user, accessToken }
  }

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
