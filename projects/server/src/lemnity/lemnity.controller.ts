import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { LemnityService } from './lemnity.service'
import { CallbackSubscriptionService, parseCallbackSubscriptionPayload } from './callback-subscription.service'
import { ChatSubscriptionService, parseChatSubscriptionPayload } from './chat-subscription.service'
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
    private readonly callbackSub: CallbackSubscriptionService,
    private readonly chatSub: ChatSubscriptionService,
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

    const { refreshToken, ...rest } = await this.auth.loginViaLemnity({
      email: payload.email,
      name: payload.name ?? null,
      lemnityUserId: payload.userId // мост для аккаунтной подписки Callback
    })
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

  /** Список ВСЕХ виджетов пользователя ЛК по email (подпись = hmac(secret, email)). */
  @Get('widgets')
  async widgets(@Query('email') email: string, @Req() req: Request) {
    if (!email || !this.lemnity.verify(email, sigHeader(req))) {
      return { widgets: [] }
    }
    return { widgets: await this.lemnity.listByEmail(email) }
  }

  /**
   * Канонический каталог виджетов для тарифа lmntai (источник набора; цены — на стороне lmntai).
   * Подпись = hmac(secret, "widget-catalog"). Плохая подпись → пустой каталог (soft-200).
   */
  @Get('widget-catalog')
  widgetCatalog(@Req() req: Request) {
    if (!this.lemnity.verify('widget-catalog', sigHeader(req))) {
      return { catalog: [] }
    }
    return { catalog: this.lemnity.getWidgetCatalog() }
  }

  /**
   * Вебхук подписки Callback Widget (модель «база + модули») из lmntai. Аккаунтная подписка
   * по userId. Всегда 200 (как widget-subscription): плохая подпись/тело → { skipped }.
   */
  @Post('callback-subscription')
  async callbackSubscription(@Req() req: RawRequest) {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body ?? {})
    if (!this.lemnity.verify(raw, sigHeader(req))) {
      return { skipped: 'unverified' }
    }
    let payload: unknown
    try {
      payload = JSON.parse(raw)
    } catch {
      return { skipped: 'invalid_json' }
    }
    const input = parseCallbackSubscriptionPayload(payload)
    if (!input) return { skipped: 'bad_payload' }
    return this.callbackSub.apply(input)
  }

  /** Текущая подписка Callback Widget + usage по email (подпись = hmac(secret, email)). */
  @Get('callback-subscription')
  async callbackSubscriptionByEmail(@Query('email') email: string, @Req() req: Request) {
    if (!email || !this.lemnity.verify(email, sigHeader(req))) {
      return { active: false }
    }
    return this.callbackSub.getByEmail(email)
  }

  /**
   * Вебхук подписки «Модуля Чат» из lmntai. Аккаунтная подписка по userId.
   * Всегда 200 (как callback-subscription): плохая подпись/тело → { skipped }.
   */
  @Post('chat-subscription')
  async chatSubscription(@Req() req: RawRequest) {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body ?? {})
    if (!this.lemnity.verify(raw, sigHeader(req))) {
      return { skipped: 'unverified' }
    }
    let payload: unknown
    try {
      payload = JSON.parse(raw)
    } catch {
      return { skipped: 'invalid_json' }
    }
    const input = parseChatSubscriptionPayload(payload)
    if (!input) return { skipped: 'bad_payload' }
    return this.chatSub.apply(input)
  }

  /** Текущая подписка «Модуля Чат» + usage по email (подпись = hmac(secret, email)). */
  @Get('chat-subscription')
  async chatSubscriptionByEmail(@Query('email') email: string, @Req() req: Request) {
    if (!email || !this.lemnity.verify(email, sigHeader(req))) {
      return { active: false }
    }
    return this.chatSub.getByEmail(email)
  }
}
