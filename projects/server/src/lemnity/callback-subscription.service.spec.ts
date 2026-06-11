// PrismaService imports the ESM-only @lemnity/database client, which jest can't transform.
// We inject a fake prisma anyway, so stub the module boundary to avoid loading the real client.
jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import {
  CallbackSubscriptionService,
  parseCallbackSubscriptionPayload
} from './callback-subscription.service'
import type { PrismaService } from '../prisma.service'

type MockPrisma = {
  callbackSubscription: { findUnique: jest.Mock; upsert: jest.Mock }
  user: { findUnique: jest.Mock }
  project: { count: jest.Mock }
  request: { count: jest.Mock }
}

function makePrisma(): MockPrisma {
  return {
    callbackSubscription: { findUnique: jest.fn(), upsert: jest.fn() },
    user: { findUnique: jest.fn() },
    project: { count: jest.fn() },
    request: { count: jest.fn() }
  }
}

const NOW = new Date('2026-06-11T00:00:00.000Z')
const input = {
  lemnityUserId: 'lm_1',
  modules: ['telegram'],
  extraSite: 2,
  extraCallbacks: 2,
  siteLimit: 3,
  callbackLimit: 2500,
  months: 1,
  paymentId: 'pay_1'
}

describe('CallbackSubscriptionService.apply', () => {
  it('upserts by lemnityUserId and extends paidUntil from now when none exists', async () => {
    const prisma = makePrisma()
    prisma.callbackSubscription.findUnique.mockResolvedValue(null)
    prisma.callbackSubscription.upsert.mockResolvedValue({})
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.apply(input, NOW)

    expect(res).toEqual({ ok: true })
    expect(prisma.callbackSubscription.upsert).toHaveBeenCalledTimes(1)
    const arg = prisma.callbackSubscription.upsert.mock.calls[0][0]
    expect(arg.where).toEqual({ lemnityUserId: 'lm_1' })
    expect(arg.create.siteLimit).toBe(3)
    expect(arg.create.callbackLimit).toBe(2500)
    expect(arg.create.modules).toEqual(['telegram'])
    expect(arg.create.extraSite).toBe(2)
    expect(arg.create.paidUntil).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    expect(arg.update.paidUntil).toEqual(new Date('2026-07-11T00:00:00.000Z'))
    expect(arg.update.lastPaymentId).toBe('pay_1')
  })

  it('is idempotent: duplicate paymentId does not upsert again', async () => {
    const prisma = makePrisma()
    prisma.callbackSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      paidUntil: new Date('2026-07-01T00:00:00.000Z'),
      lastPaymentId: 'pay_1'
    })
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.apply(input, NOW)

    expect(res).toEqual({ ok: true, duplicate: true })
    expect(prisma.callbackSubscription.upsert).not.toHaveBeenCalled()
  })

  it('extends from existing active paidUntil (not from now)', async () => {
    const prisma = makePrisma()
    prisma.callbackSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      paidUntil: new Date('2026-06-20T00:00:00.000Z'),
      lastPaymentId: 'pay_0'
    })
    prisma.callbackSubscription.upsert.mockResolvedValue({})
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    await svc.apply(input, NOW)

    const arg = prisma.callbackSubscription.upsert.mock.calls[0][0]
    expect(arg.update.paidUntil).toEqual(new Date('2026-07-20T00:00:00.000Z'))
  })
})

describe('CallbackSubscriptionService.getActiveEntitlementByUserId', () => {
  it('returns null when the user has no linked lemnityUserId', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: null })
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toBeNull()
  })

  it('returns null when the subscription is expired', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.callbackSubscription.findUnique.mockResolvedValue({
      modules: ['telegram'],
      siteLimit: 3,
      callbackLimit: 2500,
      paidUntil: new Date('2026-06-01T00:00:00.000Z')
    })
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toBeNull()
  })

  it('returns the entitlement when active', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.callbackSubscription.findUnique.mockResolvedValue({
      modules: ['telegram'],
      siteLimit: 3,
      callbackLimit: 2500,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)
    expect(await svc.getActiveEntitlementByUserId('u1', NOW)).toEqual({
      modules: ['telegram'],
      siteLimit: 3,
      callbackLimit: 2500,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
  })
})

describe('parseCallbackSubscriptionPayload', () => {
  const valid = {
    type: 'callback_subscription',
    userId: 'lm_1',
    modules: ['telegram', 'webhooks'],
    extraSite: 2,
    extraCallbacks: 2,
    siteLimit: 3,
    callbackLimit: 2500,
    months: 3,
    paymentId: 'pay_1'
  }

  it('maps a valid payload to apply-input', () => {
    expect(parseCallbackSubscriptionPayload(valid)).toEqual({
      lemnityUserId: 'lm_1',
      modules: ['telegram', 'webhooks'],
      extraSite: 2,
      extraCallbacks: 2,
      siteLimit: 3,
      callbackLimit: 2500,
      months: 3,
      paymentId: 'pay_1'
    })
  })

  it('rejects wrong type', () => {
    expect(parseCallbackSubscriptionPayload({ ...valid, type: 'widget_subscription' })).toBeNull()
  })

  it('rejects missing/empty userId', () => {
    expect(parseCallbackSubscriptionPayload({ ...valid, userId: '' })).toBeNull()
    expect(parseCallbackSubscriptionPayload({ ...valid, userId: undefined })).toBeNull()
  })

  it('rejects non-finite limits', () => {
    expect(parseCallbackSubscriptionPayload({ ...valid, siteLimit: 'x' })).toBeNull()
    expect(parseCallbackSubscriptionPayload({ ...valid, callbackLimit: undefined })).toBeNull()
  })

  it('defaults months to 1 and quantities to 0', () => {
    const res = parseCallbackSubscriptionPayload({
      type: 'callback_subscription',
      userId: 'lm_1',
      siteLimit: 1,
      callbackLimit: 500
    })
    expect(res).toEqual({
      lemnityUserId: 'lm_1',
      modules: [],
      extraSite: 0,
      extraCallbacks: 0,
      siteLimit: 1,
      callbackLimit: 500,
      months: 1,
      paymentId: undefined
    })
  })

  it('keeps only string modules', () => {
    const res = parseCallbackSubscriptionPayload({ ...valid, modules: ['telegram', 5, null, 'webhooks'] })
    expect(res?.modules).toEqual(['telegram', 'webhooks'])
  })

  it('returns null for non-object input', () => {
    expect(parseCallbackSubscriptionPayload(null)).toBeNull()
    expect(parseCallbackSubscriptionPayload('nope')).toBeNull()
  })
})

describe('CallbackSubscriptionService.getByEmail (subscription + usage)', () => {
  it('returns inactive when no user for email', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue(null)
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    expect(await svc.getByEmail('x@y.z', NOW)).toEqual({ active: false })
  })

  it('returns inactive when user has no linked subscription', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.callbackSubscription.findUnique.mockResolvedValue(null)
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    expect(await svc.getByEmail('x@y.z', NOW)).toEqual({ active: false })
  })

  it('returns subscription with usage (sitesUsed=projects, callbacksUsed=this month)', async () => {
    const prisma = makePrisma()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lemnityUserId: 'lm_1' })
    prisma.callbackSubscription.findUnique.mockResolvedValue({
      lemnityUserId: 'lm_1',
      modules: ['telegram', 'webhooks'],
      extraSite: 2,
      extraCallbacks: 2,
      siteLimit: 3,
      callbackLimit: 2500,
      paidUntil: new Date('2026-07-01T00:00:00.000Z')
    })
    prisma.project.count.mockResolvedValue(3)
    prisma.request.count.mockResolvedValue(325)
    const svc = new CallbackSubscriptionService(prisma as unknown as PrismaService)

    const res = await svc.getByEmail('x@y.z', NOW)

    expect(res).toEqual({
      active: true,
      modules: ['telegram', 'webhooks'],
      extraSite: 2,
      extraCallbacks: 2,
      siteLimit: 3,
      callbackLimit: 2500,
      paidUntil: '2026-07-01T00:00:00.000Z',
      sitesUsed: 3,
      callbacksUsed: 325
    })
    // callbacksUsed counted for the account within the current calendar month
    expect(prisma.request.count).toHaveBeenCalledTimes(1)
    const countArg = prisma.request.count.mock.calls[0][0]
    expect(countArg.where.project.userId).toBe('u1')
    expect(countArg.where.createdAt.gte).toEqual(new Date('2026-06-01T00:00:00.000Z'))
  })
})
