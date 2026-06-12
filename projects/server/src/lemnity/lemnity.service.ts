import { Injectable } from '@nestjs/common'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { PrismaService } from '../prisma.service'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Связка с ЛК lemnity.ru: приём оплаты подписки на виджет и выдача списка «Мои виджеты».
 * Подпись — HMAC-SHA256 общим секретом WIDGETS_HANDOFF_SECRET (тот же, что в lmntai
 * lib/widgets-handoff.ts). См. plans/plan-wid.md.
 */
@Injectable()
export class LemnityService {
  constructor(private readonly prisma: PrismaService) {}

  private secret(): string | null {
    const s = (process.env.WIDGETS_HANDOFF_SECRET || '').trim()
    return s.length ? s : null
  }

  private safeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    try {
      return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
    } catch {
      return false
    }
  }

  /**
   * Проверка SSO-тикета из ЛК (формат lmntai signWidgetsTicket: `<base64url(json)>.<hmac-hex>`).
   * Возвращает payload или null (плохая подпись / истёк / нет email).
   */
  verifyTicket(
    ticket: string
  ): { userId: string; email: string; name?: string; lemnityProjectId?: string } | null {
    if (typeof ticket !== 'string') return null
    const dot = ticket.indexOf('.')
    if (dot <= 0) return null
    const enc = ticket.slice(0, dot)
    const sig = ticket.slice(dot + 1)
    if (!this.verify(enc, sig)) return null
    let parsed: {
      userId?: string
      email?: string
      name?: string
      lemnityProjectId?: string
      exp?: number
    }
    try {
      parsed = JSON.parse(Buffer.from(enc, 'base64url').toString('utf8')) as {
        userId?: string
        email?: string
        name?: string
        lemnityProjectId?: string
        exp?: number
      }
    } catch {
      return null
    }
    const now = Math.floor(Date.now() / 1000)
    if (typeof parsed.exp !== 'number' || parsed.exp < now) return null
    if (!parsed.userId || !parsed.email) return null
    return {
      userId: parsed.userId,
      email: parsed.email,
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : undefined,
      lemnityProjectId: parsed.lemnityProjectId
    }
  }

  /** Проверка подписи: header === hmac-sha256(secret, signedData). */
  verify(signedData: string, header: string | undefined | null): boolean {
    const s = this.secret()
    if (!s || !header) return false
    const provided = header.trim().replace(/^sha256=/i, '')
    const expected = createHmac('sha256', s).update(signedData).digest('hex')
    return this.safeEqualHex(provided, expected)
  }

  /** Продлить подписку виджета на `months` месяцев. Идемпотентно по paymentId. */
  async applySubscription(input: {
    userId: string
    widgetId: string
    months: number
    paymentId?: string
  }): Promise<{ ok: boolean; reason?: string; duplicate?: boolean }> {
    const widget = await this.prisma.widget.findUnique({
      where: { id: input.widgetId },
      select: { id: true, paidUntil: true, lastPaymentId: true }
    })
    if (!widget) return { ok: false, reason: 'widget_not_found' }
    if (input.paymentId && widget.lastPaymentId === input.paymentId) {
      return { ok: true, duplicate: true }
    }
    const now = Date.now()
    const base =
      widget.paidUntil && widget.paidUntil.getTime() > now ? widget.paidUntil.getTime() : now
    const months = Number.isFinite(input.months) && input.months > 0 ? Math.floor(input.months) : 1
    const paidUntil = new Date(base + months * MONTH_MS)
    await this.prisma.widget.update({
      where: { id: input.widgetId },
      data: {
        paidUntil,
        // userId есть всегда (lmntai его шлёт); если пусто — поле не трогаем (undefined).
        lemnityUserId: input.userId ? input.userId : undefined,
        lastPaymentId: input.paymentId ?? widget.lastPaymentId
      }
    })
    return { ok: true }
  }

  /**
   * Все виджеты пользователя ЛК для «Мои виджеты» (по email — SSO линкует юзера по email).
   * isTrial = идёт бесплатный период (активен, но оплат ещё не было: lastPaymentId пуст).
   */
  async listByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    if (!user) return []
    const widgets = await this.prisma.widget.findMany({
      where: { project: { userId: user.id } },
      select: { id: true, type: true, name: true, paidUntil: true, lastPaymentId: true },
      orderBy: { createdAt: 'desc' }
    })
    const now = Date.now()
    return widgets.map(w => {
      const active = w.paidUntil ? w.paidUntil.getTime() > now : false
      return {
        id: w.id,
        type: w.type,
        name: w.name,
        paidUntil: w.paidUntil ? w.paidUntil.toISOString() : null,
        isTrial: active && !w.lastPaymentId
      }
    })
  }

  /**
   * Канонический каталог виджетов для федерации (lmntai тянет его и накладывает цены).
   * Зеркало клиентского AVAILABLE_WIDGETS (projects/client/src/layouts/Widgets/constants.ts) —
   * при изменении набора держать в синхроне. Цены здесь НЕ хранятся (billing на стороне lmntai).
   */
  getWidgetCatalog(): Array<{ type: string; title: string; isAvailable: boolean; badge?: string }> {
    return [
      { type: 'WHEEL_OF_FORTUNE', title: 'Колесо фортуны', isAvailable: true, badge: 'new' },
      { type: 'CONVEYOR_OF_LUCK', title: 'Конвейер Удачи', isAvailable: true, badge: 'new' },
      { type: 'VIDEO_WIDGET', title: 'Видео виджет', isAvailable: true, badge: 'new' },
      { type: 'ACTION_TIMER', title: 'Лид-форма', isAvailable: true, badge: 'new' },
      { type: 'FAB_MENU', title: 'Мультикнопка', isAvailable: true, badge: 'new' },
      { type: 'ANNOUNCEMENT', title: 'Анонс', isAvailable: true, badge: 'new' },
      { type: 'EVENT_TIMER', title: 'Таймер событий', isAvailable: true, badge: 'new' },
      { type: 'NOTIFICATION', title: 'Уведомления', isAvailable: true, badge: 'new' },
      { type: 'CALLBACK', title: 'Обратный звонок', isAvailable: true, badge: 'new' },
      { type: 'CONVEYOR_OF_GIFTS', title: 'Конвейер подарков', isAvailable: false, badge: 'soon' },
      { type: 'POSTCARD', title: 'Открытка', isAvailable: false, badge: 'soon' },
      { type: 'CHEST_WITH_ACTION', title: 'Сундук с акцией', isAvailable: false, badge: 'soon' },
      { type: 'ADVENT_CALENDAR', title: 'Advent календарь', isAvailable: false, badge: 'soon' },
      { type: 'TEASER', title: 'Дразнилка', isAvailable: false, badge: 'soon' }
    ]
  }
}
