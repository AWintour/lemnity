import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
  extendPaidUntil,
  isSubscriptionActive,
  type CallbackEntitlement
} from './callback-entitlement'

/** Вход вебхука `callback_subscription` из lmntai (уже провалидированный контроллером). */
export type ApplyCallbackSubscriptionInput = {
  lemnityUserId: string
  modules: string[]
  extraManager: number
  extraCallbacks: number
  siteLimit: number
  managerLimit: number
  callbackLimit: number
  months: number
  paymentId?: string
}

/** Ответ read-эндпоинта (форма `AppCallbackSubscription` в lmntai widgets-app-client.ts). */
export type CallbackSubscriptionView =
  | { active: false }
  | {
      active: true
      modules: string[]
      extraManager: number
      extraCallbacks: number
      siteLimit: number
      managerLimit: number
      callbackLimit: number
      paidUntil: string | null
      sitesUsed: number
      callbacksUsed: number
    }

function finiteNumber(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function clampNonNegInt(v: unknown): number {
  const n = finiteNumber(v)
  if (n === null || n <= 0) return 0
  return Math.floor(n)
}

/**
 * Распарсить недоверенное тело вебхука `callback_subscription` в apply-input или null.
 * lmntai уже санитайзит на своей стороне; здесь — защитная валидация контракта.
 */
export function parseCallbackSubscriptionPayload(raw: unknown): ApplyCallbackSubscriptionInput | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (r.type !== 'callback_subscription') return null

  const lemnityUserId = typeof r.userId === 'string' ? r.userId.trim() : ''
  if (!lemnityUserId) return null

  const siteLimit = finiteNumber(r.siteLimit)
  const callbackLimit = finiteNumber(r.callbackLimit)
  if (siteLimit === null || callbackLimit === null) return null

  const modules = Array.isArray(r.modules)
    ? r.modules.filter((m): m is string => typeof m === 'string')
    : []
  const months = clampNonNegInt(r.months) || 1
  const extraManager = clampNonNegInt(r.extraManager)
  // managerLimit обычно приходит из lmntai; фолбэк — база 1 + доп. менеджеры.
  const managerLimit = finiteNumber(r.managerLimit) ?? 1 + extraManager

  return {
    lemnityUserId,
    modules,
    extraManager,
    extraCallbacks: clampNonNegInt(r.extraCallbacks),
    siteLimit,
    managerLimit,
    callbackLimit,
    months,
    paymentId: typeof r.paymentId === 'string' ? r.paymentId : undefined
  }
}

/** Начало текущего календарного месяца (UTC) — окно подсчёта callback-заявок. */
export function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

/**
 * Аккаунтная подписка Callback Widget: приём вебхука от lmntai (write) и выдача подписки + usage
 * (read). Источник истины (цены/конфиг/счёт Точка) — lmntai; здесь только зеркало и применение.
 * Ключ — `lemnityUserId`. См. plan-wid-call.md, раздел «Монетизация», Фаза B.
 */
@Injectable()
export class CallbackSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Применить подписку: апсёрт по lemnityUserId, идемпотентность по paymentId, продление paidUntil. */
  async apply(
    input: ApplyCallbackSubscriptionInput,
    now: Date = new Date()
  ): Promise<{ ok: boolean; duplicate?: boolean }> {
    const existing = await this.prisma.callbackSubscription.findUnique({
      where: { lemnityUserId: input.lemnityUserId },
      select: { paidUntil: true, lastPaymentId: true }
    })
    if (input.paymentId && existing?.lastPaymentId === input.paymentId) {
      return { ok: true, duplicate: true }
    }
    const paidUntil = extendPaidUntil(existing?.paidUntil ?? null, input.months, now)
    const data = {
      modules: input.modules,
      extraManager: input.extraManager,
      extraCallbacks: input.extraCallbacks,
      siteLimit: input.siteLimit,
      managerLimit: input.managerLimit,
      callbackLimit: input.callbackLimit,
      paidUntil,
      lastPaymentId: input.paymentId ?? existing?.lastPaymentId ?? null
    }
    await this.prisma.callbackSubscription.upsert({
      where: { lemnityUserId: input.lemnityUserId },
      create: { lemnityUserId: input.lemnityUserId, ...data },
      update: data
    })
    return { ok: true }
  }

  /**
   * Активный entitlement по локальному userId (для энфорсмента/feature-access).
   * Возвращает null, если у юзера нет lemnityUserId, подписки нет или она истекла —
   * в этом случае энфорсмент не применяется (текущее поведение сохраняется).
   */
  async getActiveEntitlementByUserId(
    userId: string,
    now: Date = new Date()
  ): Promise<CallbackEntitlement | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lemnityUserId: true }
    })
    if (!user?.lemnityUserId) return null

    const sub = await this.prisma.callbackSubscription.findUnique({
      where: { lemnityUserId: user.lemnityUserId },
      select: { modules: true, siteLimit: true, callbackLimit: true, paidUntil: true }
    })
    if (!sub || !isSubscriptionActive(sub.paidUntil, now)) return null

    return {
      modules: sub.modules,
      siteLimit: sub.siteLimit,
      callbackLimit: sub.callbackLimit,
      paidUntil: sub.paidUntil
    }
  }

  /** Подписка + usage по email (SSO линкует app-юзера по email → lemnityUserId). */
  async getByEmail(email: string, now: Date = new Date()): Promise<CallbackSubscriptionView> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, lemnityUserId: true }
    })
    if (!user?.lemnityUserId) return { active: false }

    const sub = await this.prisma.callbackSubscription.findUnique({
      where: { lemnityUserId: user.lemnityUserId }
    })
    if (!sub || !isSubscriptionActive(sub.paidUntil, now)) return { active: false }

    const [sitesUsed, callbacksUsed] = await Promise.all([
      this.prisma.project.count({ where: { userId: user.id } }),
      this.prisma.request.count({
        where: {
          project: { userId: user.id },
          widget: { type: 'CALLBACK' },
          createdAt: { gte: monthStart(now) }
        }
      })
    ])

    return {
      active: true,
      modules: sub.modules,
      extraManager: sub.extraManager,
      extraCallbacks: sub.extraCallbacks,
      siteLimit: sub.siteLimit,
      managerLimit: sub.managerLimit,
      callbackLimit: sub.callbackLimit,
      paidUntil: sub.paidUntil ? sub.paidUntil.toISOString() : null,
      sitesUsed,
      callbacksUsed
    }
  }
}
