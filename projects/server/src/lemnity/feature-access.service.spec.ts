jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { ForbiddenException } from '@nestjs/common'
import { FeatureAccessService } from './feature-access.service'
import type { CallbackSubscriptionService } from './callback-subscription.service'
import type { PrismaService } from '../prisma.service'
import type { CallbackEntitlement } from './callback-entitlement'

const NOW = new Date('2026-06-11T00:00:00.000Z')
const ENT: CallbackEntitlement = {
  modules: ['telegram'],
  siteLimit: 3,
  callbackLimit: 2500,
  paidUntil: new Date('2026-07-01T00:00:00.000Z')
}

function make(ent: CallbackEntitlement | null, counts: { projects?: number; requests?: number } = {}) {
  const callbackSub = { getActiveEntitlementByUserId: jest.fn().mockResolvedValue(ent) }
  const prisma = {
    project: { count: jest.fn().mockResolvedValue(counts.projects ?? 0) },
    request: { count: jest.fn().mockResolvedValue(counts.requests ?? 0) }
  }
  const svc = new FeatureAccessService(
    callbackSub as unknown as CallbackSubscriptionService,
    prisma as unknown as PrismaService
  )
  return { svc, callbackSub, prisma }
}

describe('FeatureAccessService.canUseCallbackModule', () => {
  it('true when active entitlement includes the module', async () => {
    const { svc } = make(ENT)
    expect(await svc.canUseCallbackModule('u1', 'telegram', NOW)).toBe(true)
  })

  it('false when module not granted', async () => {
    const { svc } = make(ENT)
    expect(await svc.canUseCallbackModule('u1', 'webhooks', NOW)).toBe(false)
  })

  it('false when no active subscription', async () => {
    const { svc } = make(null)
    expect(await svc.canUseCallbackModule('u1', 'telegram', NOW)).toBe(false)
  })
})

describe('FeatureAccessService.assertCanCreateSite', () => {
  it('no-op when no active subscription (preserves current behavior)', async () => {
    const { svc, prisma } = make(null)
    await expect(svc.assertCanCreateSite('u1', NOW)).resolves.toBeUndefined()
    expect(prisma.project.count).not.toHaveBeenCalled()
  })

  it('passes when below the site limit', async () => {
    const { svc } = make(ENT, { projects: 2 })
    await expect(svc.assertCanCreateSite('u1', NOW)).resolves.toBeUndefined()
  })

  it('throws ForbiddenException at the site limit', async () => {
    const { svc } = make(ENT, { projects: 3 })
    await expect(svc.assertCanCreateSite('u1', NOW)).rejects.toBeInstanceOf(ForbiddenException)
  })
})

describe('FeatureAccessService.assertCanAcceptCallback', () => {
  it('no-op when owner has no active subscription', async () => {
    const { svc, prisma } = make(null)
    await expect(svc.assertCanAcceptCallback('owner1', NOW)).resolves.toBeUndefined()
    expect(prisma.request.count).not.toHaveBeenCalled()
  })

  it('passes when below the monthly callback limit', async () => {
    const { svc } = make(ENT, { requests: 2499 })
    await expect(svc.assertCanAcceptCallback('owner1', NOW)).resolves.toBeUndefined()
  })

  it('throws ForbiddenException at the monthly callback limit, counting this month for the account', async () => {
    const { svc, prisma } = make(ENT, { requests: 2500 })
    await expect(svc.assertCanAcceptCallback('owner1', NOW)).rejects.toBeInstanceOf(ForbiddenException)
    const arg = prisma.request.count.mock.calls[0][0]
    expect(arg.where.project.userId).toBe('owner1')
    expect(arg.where.createdAt.gte).toEqual(new Date('2026-06-01T00:00:00.000Z'))
  })
})
