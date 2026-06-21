import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {
  extendPaidUntil,
  isSubscriptionActive,
  FREE_CHAT_ENTITLEMENT,
  ADMIN_CHAT_ENTITLEMENT,
  type ChatEntitlement,
  type ChatPlanTier
} from './chat-entitlement'
import { isAdminUser } from '../common/admin'

const CHAT_PLAN_TIERS: readonly ChatPlanTier[] = ['free', 'start', 'pro', 'business', 'agency']

/** Вход вебхука `chat_subscription` из lmntai (уже провалидированный контроллером). */
export type ApplyChatSubscriptionInput = {
  lemnityUserId: string
  planTier: ChatPlanTier
  siteLimit: number
  managerLimit: number
  aiDailyLimit: number
  extraManager: number
  months: number
  paymentId?: string
}

/** Ответ read-эндпоинта (форма `AppChatSubscription` в lmntai widgets-app-client.ts). */
export type ChatSubscriptionView =
  | { active: false }
  | {
      active: true
      planTier: ChatPlanTier
      siteLimit: number
      managerLimit: number
      aiDailyLimit: number
      extraManager: number
      paidUntil: string | null
      sitesUsed: number
      operatorsUsed: number
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

function normalizePlanTier(v: unknown): ChatPlanTier {
  return typeof v === 'string' && (CHAT_PLAN_TIERS as readonly string[]).includes(v)
    ? (v as ChatPlanTier)
    : 'free'
}

/**
 * Распарсить недоверенное тело вебхука `chat_subscription` в apply-input или null.
 * lmntai уже санитайзит на своей стороне; здесь — защитная валидация контракта.
 */
export function parseChatSubscriptionPayload(raw: unknown): ApplyChatSubscriptionInput | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (r.type !== 'chat_subscription') return null

  const lemnityUserId = typeof r.userId === 'string' ? r.userId.trim() : ''
  if (!lemnityUserId) return null

  const siteLimit = finiteNumber(r.siteLimit)
  const managerLimit = finiteNumber(r.managerLimit)
  const aiDailyLimit = finiteNumber(r.aiDailyLimit)
  if (siteLimit === null || managerLimit === null || aiDailyLimit === null) return null

  const months = clampNonNegInt(r.months) || 1
  const extraManager = clampNonNegInt(r.extraManager)

  return {
    lemnityUserId,
    planTier: normalizePlanTier(r.planTier),
    siteLimit,
    managerLimit,
    aiDailyLimit,
    extraManager,
    months,
    paymentId: typeof r.paymentId === 'string' ? r.paymentId : undefined
  }
}

/**
 * Аккаунтная подписка «Модуля Чат»: приём вебхука от lmntai (write) и выдача подписки + usage
 * (read). Источник истины (цены/конфиг/счёт Точка) — lmntai; здесь только зеркало и применение.
 * Ключ — `lemnityUserId`. См. plan/plan-app-chat.md, раздел «Монетизация».
 */
@Injectable()
export class ChatSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Применить подписку: апсёрт по lemnityUserId, идемпотентность по paymentId, продление paidUntil. */
  async apply(
    input: ApplyChatSubscriptionInput,
    now: Date = new Date()
  ): Promise<{ ok: boolean; duplicate?: boolean }> {
    const existing = await this.prisma.chatSubscription.findUnique({
      where: { lemnityUserId: input.lemnityUserId },
      select: { paidUntil: true, lastPaymentId: true }
    })
    if (input.paymentId && existing?.lastPaymentId === input.paymentId) {
      return { ok: true, duplicate: true }
    }
    const paidUntil = extendPaidUntil(existing?.paidUntil ?? null, input.months, now)
    const data = {
      planTier: input.planTier,
      siteLimit: input.siteLimit,
      managerLimit: input.managerLimit,
      aiDailyLimit: input.aiDailyLimit,
      extraManager: input.extraManager,
      paidUntil,
      lastPaymentId: input.paymentId ?? existing?.lastPaymentId ?? null
    }
    await this.prisma.chatSubscription.upsert({
      where: { lemnityUserId: input.lemnityUserId },
      create: { lemnityUserId: input.lemnityUserId, ...data },
      update: data
    })
    return { ok: true }
  }

  /**
   * Активный entitlement по локальному userId (для энфорсмента/feature-access).
   * В отличие от Callback — НИКОГДА не возвращает null: если у юзера нет lemnityUserId,
   * подписки нет или она истекла, возвращается FREE_CHAT_ENTITLEMENT (free — реальный тариф,
   * энфорсмент всегда имеет лимиты). Хранимый entitlement отдаётся только пока подписка активна.
   */
  async getActiveEntitlementByUserId(
    userId: string,
    now: Date = new Date()
  ): Promise<ChatEntitlement> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lemnityUserId: true, email: true, role: true }
    })
    // Админ — полный доступ как agency, бессрочно; подписку не читаем.
    if (isAdminUser(user?.email, user?.role)) return ADMIN_CHAT_ENTITLEMENT
    if (!user?.lemnityUserId) return FREE_CHAT_ENTITLEMENT

    const sub = await this.prisma.chatSubscription.findUnique({
      where: { lemnityUserId: user.lemnityUserId },
      select: {
        planTier: true,
        siteLimit: true,
        managerLimit: true,
        aiDailyLimit: true,
        paidUntil: true
      }
    })
    if (!sub || !isSubscriptionActive(sub.paidUntil, now)) return FREE_CHAT_ENTITLEMENT

    return {
      planTier: normalizePlanTier(sub.planTier),
      siteLimit: sub.siteLimit,
      managerLimit: sub.managerLimit,
      aiDailyLimit: sub.aiDailyLimit,
      paidUntil: sub.paidUntil
    }
  }

  /** Подписка + usage по email (SSO линкует app-юзера по email → lemnityUserId). */
  async getByEmail(email: string, now: Date = new Date()): Promise<ChatSubscriptionView> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, lemnityUserId: true }
    })
    if (!user?.lemnityUserId) return { active: false }

    const sub = await this.prisma.chatSubscription.findUnique({
      where: { lemnityUserId: user.lemnityUserId }
    })
    if (!sub || !isSubscriptionActive(sub.paidUntil, now)) return { active: false }

    const [sitesUsed, operatorsUsed] = await Promise.all([
      this.prisma.project.count({ where: { userId: user.id } }),
      this.prisma.chatOperator.count({ where: { project: { userId: user.id } } })
    ])

    return {
      active: true,
      planTier: normalizePlanTier(sub.planTier),
      siteLimit: sub.siteLimit,
      managerLimit: sub.managerLimit,
      aiDailyLimit: sub.aiDailyLimit,
      extraManager: sub.extraManager,
      paidUntil: sub.paidUntil ? sub.paidUntil.toISOString() : null,
      sitesUsed,
      operatorsUsed
    }
  }
}
