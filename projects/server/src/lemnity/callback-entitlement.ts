/**
 * Callback Widget — чистая доменная логика энфорсмента подписки «база + модули».
 * Источник истины (состав/лимиты/стоимость) — lmntai; сюда приходит через вебхук
 * `/api/lemnity/callback-subscription` (см. plan/plan-wid-call.md, «Монетизация», Фаза B).
 *
 * Никаких node-built-ins / Prisma — только функции над снимком подписки, чтобы их можно было
 * тестировать и переиспользовать в сервисе/гардах.
 */

/** 30-дневный «месяц» — как в widget-subscription (lemnity.service MONTH_MS). */
const MONTH_MS = 30 * 24 * 60 * 60 * 1000

/** Снимок entitlement аккаунта (зеркало присланного lmntai). */
export type CallbackEntitlement = {
  /** Подключённые toggle-модули: telegram/webhooks/ab_testing/white_label/api_access. */
  modules: string[]
  /** Лимит сайтов = база 1 + extraSite. */
  siteLimit: number
  /** Лимит callback-заявок в месяц = база 500 + extraCallbacks×1000. */
  callbackLimit: number
  /** До какого момента оплачено (источник истины — app). */
  paidUntil: Date | null
}

/** Продлить `paidUntil` на `months` месяцев. Идемпотентность — выше по стеку (по paymentId). */
export function extendPaidUntil(current: Date | null, months: number, now: Date): Date {
  const nowMs = now.getTime()
  const base = current && current.getTime() > nowMs ? current.getTime() : nowMs
  const m = Number.isFinite(months) && months > 0 ? Math.floor(months) : 1
  return new Date(base + m * MONTH_MS)
}

/** Подписка активна, пока `paidUntil` в будущем. */
export function isSubscriptionActive(paidUntil: Date | null, now: Date): boolean {
  return !!paidUntil && paidUntil.getTime() > now.getTime()
}

/** Доступ к модулю — по доступности функции (и только пока подписка активна), НЕ по имени тарифа. */
export function canUseModule(sub: CallbackEntitlement, moduleId: string, now: Date): boolean {
  return isSubscriptionActive(sub.paidUntil, now) && sub.modules.includes(moduleId)
}

/** Можно создать ещё один сайт, пока использовано меньше лимита. */
export function isWithinSiteLimit(sub: CallbackEntitlement, usedSites: number): boolean {
  return usedSites < sub.siteLimit
}

/** Можно принять ещё одну заявку, пока за месяц использовано меньше лимита. */
export function isWithinCallbackLimit(sub: CallbackEntitlement, usedThisMonth: number): boolean {
  return usedThisMonth < sub.callbackLimit
}
