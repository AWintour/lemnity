// PrismaService imports the ESM-only @lemnity/database client, which jest can't transform.
// We inject a fake prisma anyway, so stub the module boundary to avoid loading the real client.
jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import {
  ChatSubscriptionService,
  parseChatSubscriptionPayload
} from './chat-subscription.service'
import { FREE_CHAT_ENTITLEMENT } from './chat-entitlement'
import type { PrismaService } from '../prisma.service'

type MockPrisma = {
  chatSubscription: { findUnique: jest.Mock; upsert: jest.Mock }
  user: { findUnique: jest.Mock }
  project: { count: jest.Mock }
  chatOperator: { count: jest.Mock }
}

function makePrisma(): MockPrisma {
  return {
    chatSubscription: { findUnique: jest.fn(), upsert: jest.fn() },
    user: { findUnique: jest.fn() },
    project: { count: jest.fn() },
    chatOperator: { count: jest.fn() }
  }
}

const NOW = new Date('2026-06-11T00:00:00.000Z')
const input = {
  lemnityUserId: 'lm_1',
  planTier: 'pro' as const,
  siteLimit: 3,
  managerLimit: 5,
  aiDailyLimit: 1000,
  extraManager: 2,
  months: 1,
  paymentId: 'pay_1'
}

describe('ChatSubscriptionService.apply', () => {
  it('upserts by lemnityUserId and extends paidUntil from now when none exists', async () => {
    const prisma = makePrisma()
    prisma.chatSubscription.findUnique.mockResolvedValue(null)
    prisma.chatSubscription.upsert.mockResolvedValue({})
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.apply(input, NOW)

    expect(res).toEqual({ ok: true })
    expect(prisma.chatSubscription.upsert).toHaveBeenCalledTimes(1)
    const arg = prisma.chatSubscription.upsert.mock.calls[0][0]
    expect(arg.where).toEqual({ lemnityUserId: 'lm_1' })
    expect(arg.create.planTier).toBe('pro')
    expect(arg.create.siteLimit).toBe(3)
    expect(arg.create.managerLimit).toBe(5)
    expect(arg.create.aiDailyLimit).toBe(1000)
    expect(arg.create.extraManager).toBe(2)
    expect(arg.create.paidUntil).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    expect(arg.update.paidUntil).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    expect(arg.update.lastPaymentId).toBe('pay_1')
  })

  it('is idempotent: duplicate paymentId does not upsert again', async () => {
    const prisma = makePrisma()
    prisma.chatSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      paidUntil: new Date('2026-07-01T00:00:00.000Z'),
      lastPaymentId: 'pay_1'
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.apply(input, NOW)

    expect(res).toEqual({ ok: true, duplicate: true })
    expect(prisma.chatSubscription.upsert).not.toHaveBeenCalled()
  })

  it('extends from existing active paidUntil (not from now)', async () => {
    const prisma = makePrisma()
    prisma.chatSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      paidUntil: new Date('2026-06-20T00:00:00.000Z'),
      lastPaymentId: 'pay_0'
    })
    prisma.chatSubscription.upsert.mockResolvedValue({})
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    await svc.apply(input, NOW)

    const arg = prisma.chatSubscription.upsert.mock.calls[0][0]
    expect(arg.update.paidUntil).toEqual(new Date('2026-07-20T00:00:00.000Z'))
  })
})

describe('ChatSubscriptionService.getActiveEntitlementByUserId', () => {
  it('returns FREE default when the user has no linked lemnityUserId', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: null })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(FREE_CHAT_ENTITLEMENT)
  })

  it('returns FREE default when there is no subscription row', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.chatSubscription.findUnique.mockResolvedValue(null)
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(FREE_CHAT_ENTITLEMENT)
  })

  it('returns FREE default when the subscription is expired', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.chatSubscription.findUnique.mockResolvedValue({
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      paidUntil: new Date('2026-06-01T00:00:00.000Z')
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual(FREE_CHAT_ENTITLEMENT)
  })

  it('returns the stored entitlement when active', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.chatSubscription.findUnique.mockResolvedValue({
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual({
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
  })
})

describe('parseChatSubscriptionPayload', () => {
  const valid = {
    type: 'chat_subscription',
    userId: 'lm_1',
    planTier: 'pro',
    siteLimit: 3,
    managerLimit: 5,
    aiDailyLimit: 1000,
    extraManager: 2,
    months: 3,
    paymentId: 'pay_1'
  }

  it('maps a valid payload to apply-input', () => {
    expect(parseChatSubscriptionPayload(valid)).toEqual({
      lemnityUserId: 'lm_1',
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      extraManager: 2,
      months: 3,
      paymentId: 'pay_1'
    })
  })

  it('rejects wrong type', () => {
    expect(parseChatSubscriptionPayload({ ...valid, type: 'callback_subscription' })).toBeNull()
  })

  it('rejects missing/empty userId', () => {
    expect(parseChatSubscriptionPayload({ ...valid, userId: '' })).toBeNull()
    expect(parseChatSubscriptionPayload({ ...valid, userId: undefined })).toBeNull()
  })

  it('rejects non-finite limits', () => {
    expect(parseChatSubscriptionPayload({ ...valid, siteLimit: 'x' })).toBeNull()
    expect(parseChatSubscriptionPayload({ ...valid, managerLimit: undefined })).toBeNull()
    expect(parseChatSubscriptionPayload({ ...valid, aiDailyLimit: NaN })).toBeNull()
  })

  it('defaults unknown tier to free', () => {
    expect(parseChatSubscriptionPayload({ ...valid, planTier: 'enterprise' })?.planTier).toBe('free')
    expect(parseChatSubscriptionPayload({ ...valid, planTier: undefined })?.planTier).toBe('free')
  })

  it('accepts every known tier', () => {
    for (const t of ['free', 'start', 'pro', 'business', 'agency']) {
      expect(parseChatSubscriptionPayload({ ...valid, planTier: t })?.planTier).toBe(t)
    }
  })

  it('defaults months to 1, extraManager to 0', () => {
    const res = parseChatSubscriptionPayload({
      type: 'chat_subscription',
      userId: 'lm_1',
      siteLimit: 1,
      managerLimit: 1,
      aiDailyLimit: 50
    })
    expect(res).toEqual({
      lemnityUserId: 'lm_1',
      planTier: 'free',
      siteLimit: 1,
      managerLimit: 1,
      aiDailyLimit: 50,
      extraManager: 0,
      months: 1,
      paymentId: undefined
    })
  })

  it('clamps negative months to 1 and negative extraManager to 0', () => {
    const res = parseChatSubscriptionPayload({ ...valid, months: -5, extraManager: -3 })
    expect(res?.months).toBe(1)
    expect(res?.extraManager).toBe(0)
  })

  it('returns null for non-object input', () => {
    expect(parseChatSubscriptionPayload(null)).toBeNull()
    expect(parseChatSubscriptionPayload('nope')).toBeNull()
  })
})

describe('ChatSubscriptionService.getByEmail (subscription + usage)', () => {
  it('returns inactive when no user for email', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue(null)
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    expect(await svc.getByEmail('x@y.z', NOW)).toEqual({ active: false })
  })

  it('returns inactive when user has no linked subscription', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.chatSubscription.findUnique.mockResolvedValue(null)
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    expect(await svc.getByEmail('x@y.z', NOW)).toEqual({ active: false })
  })

  it('returns subscription with usage (sitesUsed=projects, operatorsUsed=chat operators)', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.chatSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      extraManager: 2,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
    prisma.project.count.mockResolvedValue(2)
    prisma.chatOperator.count.mockResolvedValue(4)
    const svc = new ChatSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.getByEmail('x@y.z', NOW)

    expect(res).toEqual({
      active: true,
      planTier: 'pro',
      siteLimit: 3,
      managerLimit: 5,
      aiDailyLimit: 1000,
      extraManager: 2,
      paidUntil: '2026-07-01T00:00:00.000Z',
      sitesUsed: 2,
      operatorsUsed: 4
    })
    expect(prisma.chatOperator.count).toHaveBeenCalledTimes(1)
    const countArg = prisma.chatOperator.count.mock.calls[0][0]
    expect(countArg.where.project.userId).toBe('u1')
  })
})
