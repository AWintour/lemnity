/**
 * Модуль Чат — чистая доменная логика энфорсмента подписки (тарифная лестница).
 * Источник истины (состав/лимиты/стоимость) — lmntai; сюда приходит через вебхук
 * `/api/lemnity/chat-subscription` (см. plan/plan-app-chat.md, «Монетизация»).
 *
 * Никаких node-built-ins / Prisma — только функции над снимком подписки, чтобы их можно было
 * тестировать и переиспользовать в сервисе/гардах. `extendPaidUntil`/`isSubscriptionActive` —
 * та же семантика, что в callback-entitlement (переиспользуем оттуда, без дублирования).
 */

import { extendPaidUntil, isSubscriptionActive } from './callback-entitlement'

export { extendPaidUntil, isSubscriptionActive }

/** Тариф «Модуля Чат». `free` — настоящий бесплатный тариф (а не «нет подписки»). */
export type ChatPlanTier = 'free' | 'start' | 'pro' | 'business' | 'agency'

/** Снимок entitlement аккаунта (зеркало присланного lmntai). */
export type ChatEntitlement = {
  /** Тариф: free|start|pro|business|agency. */
  planTier: ChatPlanTier
  /** Лимит сайтов (CHAT-виджетов/проектов с чатом). */
  siteLimit: number
  /** Лимит менеджеров (операторов) аккаунта = база + доп. менеджеры. */
  managerLimit: number
  /** Лимит ответов AI-ассистента в сутки. */
  aiDailyLimit: number
  /** До какого момента оплачено (источник истины — app). null = бессрочный free. */
  paidUntil: Date | null
}

/** Бесплатный тариф по умолчанию: применяется, когда платной активной подписки нет. */
export const FREE_CHAT_ENTITLEMENT: ChatEntitlement = {
  planTier: 'free',
  siteLimit: 1,
  managerLimit: 1,
  aiDailyLimit: 50,
  paidUntil: null
}

/** Можно завести ещё одного менеджера (оператора), пока использовано меньше лимита. */
export function isWithinManagerLimit(ent: ChatEntitlement, usedOperators: number): boolean {
  return usedOperators < ent.managerLimit
}

/** Можно подключить ещё один сайт, пока использовано меньше лимита. */
export function isWithinSiteLimit(ent: ChatEntitlement, usedSites: number): boolean {
  return usedSites < ent.siteLimit
}
