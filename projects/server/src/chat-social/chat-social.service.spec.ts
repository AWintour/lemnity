// PrismaService imports the ESM-only @lemnity/database client, which jest can't transform.
// We inject a fake prisma anyway, so stub the module boundary to avoid loading the real client.
jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

// Stub the adapter registry: the tier gate runs BEFORE any adapter call, so a paid plan reaching
// the adapter is enough to prove the gate was passed (no need to exercise the webhook path).
const validateCredentials = jest.fn()
jest.mock('./adapters', () => ({
  __esModule: true,
  isSocialType: (t: string) => ['telegram', 'max', 'vk'].includes(t),
  getAdapter: () => ({ validateCredentials })
}))

import { ChatSocialService } from './chat-social.service'
import { FREE_CHAT_ENTITLEMENT } from '../lemnity/chat-entitlement'
import type { PrismaService } from '../prisma.service'
import type { ChatSubscriptionService } from '../lemnity/chat-subscription.service'

type MockPrisma = {
  project: { findFirst: jest.Mock }
}

function makePrisma(): MockPrisma {
  return { project: { findFirst: jest.fn().mockResolvedValue({ id: 'p1' }) } }
}

function makeChatSub(planTier: 'free' | 'start' | 'pro') {
  return {
    getActiveEntitlementByUserId: jest.fn().mockResolvedValue({
      ...FREE_CHAT_ENTITLEMENT,
      planTier
    })
  }
}

const dto = { token: 'tok', groupId: undefined } as never

beforeEach(() => {
  validateCredentials.mockReset()
  // Make the adapter step fail fast with a recognizable error, so a connect() call that
  // reaches the adapter (i.e. passed the gate) rejects with this — not with the gate error.
  validateCredentials.mockRejectedValue(new Error('GATE_PASSED'))
})

function makeService(planTier: 'free' | 'start' | 'pro') {
  const prisma = makePrisma()
  const chatSub = makeChatSub(planTier)
  const svc = new ChatSocialService(
    prisma as unknown as PrismaService,
    chatSub as unknown as ChatSubscriptionService
  )
  return { svc, prisma, chatSub }
}

describe('ChatSocialService.connect — channel tier gate', () => {
  it('Free plan: connecting vk is Forbidden (channel_not_in_plan)', async () => {
    const { svc } = makeService('free')
    await expect(svc.connect('u1', 'p1', 'vk', dto)).rejects.toMatchObject({
      response: { code: 'channel_not_in_plan', planTier: 'free' }
    })
    expect(validateCredentials).not.toHaveBeenCalled()
  })

  it('Free plan: connecting max is Forbidden (channel_not_in_plan)', async () => {
    const { svc } = makeService('free')
    await expect(svc.connect('u1', 'p1', 'max', dto)).rejects.toMatchObject({
      response: { code: 'channel_not_in_plan', planTier: 'free' }
    })
    expect(validateCredentials).not.toHaveBeenCalled()
  })

  it('Free plan: telegram passes the gate (reaches adapter)', async () => {
    const { svc, chatSub } = makeService('free')
    await expect(svc.connect('u1', 'p1', 'telegram', dto)).rejects.toThrow('GATE_PASSED')
    expect(validateCredentials).toHaveBeenCalledTimes(1)
    // telegram is always allowed — no entitlement lookup needed
    expect(chatSub.getActiveEntitlementByUserId).not.toHaveBeenCalled()
  })

  it('Paid plan (pro): vk passes the gate (reaches adapter)', async () => {
    const { svc } = makeService('pro')
    await expect(svc.connect('u1', 'p1', 'vk', dto)).rejects.toThrow('GATE_PASSED')
    expect(validateCredentials).toHaveBeenCalledTimes(1)
  })
})
