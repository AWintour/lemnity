import {
  extendPaidUntil,
  isSubscriptionActive,
  canUseModule,
  isWithinSiteLimit,
  isWithinCallbackLimit,
  type CallbackEntitlement
} from './callback-entitlement'

describe('callback-entitlement (pure domain logic)', () => {
  const NOW = new Date('2026-06-11T00:00:00.000Z')
  const base: CallbackEntitlement = {
    modules: ['telegram'],
    siteLimit: 3,
    callbackLimit: 2500,
    paidUntil: new Date('2026-07-01T00:00:00.000Z')
  }

  describe('extendPaidUntil (30-day months, mirrors widget-subscription)', () => {
    it('extends from now when nothing paid yet', () => {
      expect(extendPaidUntil(null, 1, NOW)).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    })

    it('extends from current paidUntil when still active', () => {
      const current = new Date('2026-06-20T00:00:00.000Z')
      expect(extendPaidUntil(current, 1, NOW)).toEqual(new Date('2026-07-20T00:00:00.000Z'))
    })

    it('extends from now when current paidUntil already expired', () => {
      const current = new Date('2026-06-01T00:00:00.000Z')
      expect(extendPaidUntil(current, 1, NOW)).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    })

    it('treats non-positive/invalid months as 1', () => {
      expect(extendPaidUntil(null, 0, NOW)).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    })

    it('supports multi-month (3 months = 90 days)', () => {
      expect(extendPaidUntil(null, 3, NOW)).toEqual(new Date('2026-09-09T00:00:00.000Z'))
    })
  })

  describe('isSubscriptionActive', () => {
    it('true when paidUntil is in the future', () => {
      expect(isSubscriptionActive(base.paidUntil, NOW)).toBe(true)
    })

    it('false when paidUntil is null', () => {
      expect(isSubscriptionActive(null, NOW)).toBe(false)
    })

    it('false when paidUntil is in the past', () => {
      expect(isSubscriptionActive(new Date('2026-06-01T00:00:00.000Z'), NOW)).toBe(false)
    })
  })

  describe('canUseModule (by capability, only while active)', () => {
    it('true when active and module is present', () => {
      expect(canUseModule(base, 'telegram', NOW)).toBe(true)
    })

    it('false when module is not in the list', () => {
      expect(canUseModule(base, 'webhooks', NOW)).toBe(false)
    })

    it('false when subscription is inactive even if module is listed', () => {
      const expired = { ...base, paidUntil: new Date('2026-06-01T00:00:00.000Z') }
      expect(canUseModule(expired, 'telegram', NOW)).toBe(false)
    })
  })

  describe('limits (used < limit ⇒ one more allowed)', () => {
    it('isWithinSiteLimit true below the limit', () => {
      expect(isWithinSiteLimit(base, 2)).toBe(true)
    })

    it('isWithinSiteLimit false at the limit', () => {
      expect(isWithinSiteLimit(base, 3)).toBe(false)
    })

    it('isWithinCallbackLimit true below the limit', () => {
      expect(isWithinCallbackLimit(base, 2499)).toBe(true)
    })

    it('isWithinCallbackLimit false at the limit', () => {
      expect(isWithinCallbackLimit(base, 2500)).toBe(false)
    })
  })
})
