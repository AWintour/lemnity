import {
  chatPlanFeatures,
  isWithinManagerLimit,
  isWithinSiteLimit,
  FREE_CHAT_ENTITLEMENT,
  type ChatEntitlement,
  type ChatPlanTier
} from './chat-entitlement'

describe('chat-entitlement (pure domain logic)', () => {
  describe('chatPlanFeatures', () => {
    it('free (rank 0): no features', () => {
      expect(chatPlanFeatures('free')).toEqual({
        allChannels: false,
        whiteLabel: false,
        advancedAnalytics: false,
        departments: false,
        apiAccess: false,
        prioritySupport: false
      })
    })

    it('start (rank 1): channels + white label only', () => {
      expect(chatPlanFeatures('start')).toEqual({
        allChannels: true,
        whiteLabel: true,
        advancedAnalytics: false,
        departments: false,
        apiAccess: false,
        prioritySupport: false
      })
    })

    it('pro (rank 2): + analytics + departments', () => {
      expect(chatPlanFeatures('pro')).toEqual({
        allChannels: true,
        whiteLabel: true,
        advancedAnalytics: true,
        departments: true,
        apiAccess: false,
        prioritySupport: false
      })
    })

    it('business (rank 3): + api + priority support', () => {
      expect(chatPlanFeatures('business')).toEqual({
        allChannels: true,
        whiteLabel: true,
        advancedAnalytics: true,
        departments: true,
        apiAccess: true,
        prioritySupport: true
      })
    })

    it('agency (rank 4): all features', () => {
      expect(chatPlanFeatures('agency')).toEqual({
        allChannels: true,
        whiteLabel: true,
        advancedAnalytics: true,
        departments: true,
        apiAccess: true,
        prioritySupport: true
      })
    })

    it('unknown tier falls back to free (rank 0)', () => {
      expect(chatPlanFeatures('nope' as ChatPlanTier)).toEqual(chatPlanFeatures('free'))
    })
  })

  describe('isWithinManagerLimit (boundary)', () => {
    const ent: ChatEntitlement = { ...FREE_CHAT_ENTITLEMENT, managerLimit: 2 }

    it('true below the limit', () => {
      expect(isWithinManagerLimit(ent, 0)).toBe(true)
      expect(isWithinManagerLimit(ent, 1)).toBe(true)
    })

    it('false at the limit', () => {
      expect(isWithinManagerLimit(ent, 2)).toBe(false)
    })

    it('false above the limit', () => {
      expect(isWithinManagerLimit(ent, 3)).toBe(false)
    })

    it('free tier: 1 used = at limit', () => {
      expect(isWithinManagerLimit(FREE_CHAT_ENTITLEMENT, 0)).toBe(true)
      expect(isWithinManagerLimit(FREE_CHAT_ENTITLEMENT, 1)).toBe(false)
    })
  })

  describe('isWithinSiteLimit (boundary)', () => {
    it('free tier: 1 used = at limit', () => {
      expect(isWithinSiteLimit(FREE_CHAT_ENTITLEMENT, 0)).toBe(true)
      expect(isWithinSiteLimit(FREE_CHAT_ENTITLEMENT, 1)).toBe(false)
    })
  })
})
