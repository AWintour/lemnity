jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))
// @lemnity/widget-config ships ESM dist that Jest can't parse; stub the named exports the
// widget/config services import. These tests drive create/update directly, so migrate is a passthrough.
jest.mock('@lemnity/widget-config', () => ({
  CURRENT_VERSION: 1,
  migrateToCurrent: (data: unknown, version?: number) => ({ data, version: version ?? 1 }),
  canonicalizeWidgetConfig: (raw: unknown) => raw,
  validate: () => ({ ok: true, issues: [] })
}))

import { WidgetService } from './widget.service'
import type { PrismaService } from '../prisma.service'
import type { ConfigService } from '../config/config.service'
import type { ChatSubscriptionService } from '../lemnity/chat-subscription.service'
import type { ChatEntitlement } from '../lemnity/chat-entitlement'

const FREE_ENT: ChatEntitlement = {
  planTier: 'free',
  siteLimit: 1,
  managerLimit: 1,
  aiDailyLimit: 50,
  paidUntil: null
}
const PRO_ENT: ChatEntitlement = {
  planTier: 'pro',
  siteLimit: 5,
  managerLimit: 5,
  aiDailyLimit: 1000,
  paidUntil: new Date('2099-01-01')
}

// Canonical chat config: brandingEnabled lives at canonical.widget.brandingEnabled.
const chatConfig = (brandingEnabled: boolean) => ({
  id: 'cfg1',
  widgetType: 'CHAT',
  widget: { brandingEnabled },
  display: {},
  fields: {},
  integration: {}
})

function make(opts: {
  prismaWidget?: Record<string, jest.Mock>
  prismaProject?: Record<string, jest.Mock>
  entitlement?: ChatEntitlement
  echoConfig?: unknown
}) {
  const getActiveEntitlementByUserId = jest
    .fn()
    .mockResolvedValue(opts.entitlement ?? FREE_ENT)
  const chatSub = { getActiveEntitlementByUserId } as unknown as ChatSubscriptionService

  // ConfigService echoes whatever config it's given (deep-cloned so the service mutates a copy).
  const validateAndCanonicalize = jest.fn((raw: unknown) => ({
    data: JSON.parse(JSON.stringify(raw)),
    version: 1
  }))
  const configService = { validateAndCanonicalize } as unknown as ConfigService

  const prisma = {
    widget: opts.prismaWidget ?? {},
    project: opts.prismaProject ?? {}
  }
  const svc = new WidgetService(
    prisma as unknown as PrismaService,
    configService,
    chatSub
  )
  return { svc, prisma, getActiveEntitlementByUserId, validateAndCanonicalize }
}

describe('WidgetService white-label gating (CHAT branding)', () => {
  describe('create', () => {
    it('forces brandingEnabled=true for CHAT + Free entitlement', async () => {
      const create = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc } = make({
        prismaProject: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }) },
        prismaWidget: { create },
        entitlement: FREE_ENT
      })

      await svc.create(
        {
          projectId: 'p1',
          name: 'n',
          type: 'CHAT',
          config: chatConfig(false)
        } as never,
        'u1'
      )

      const persisted = create.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(true)
    })

    it('leaves brandingEnabled=false for CHAT + pro entitlement (whiteLabel allowed)', async () => {
      const create = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc } = make({
        prismaProject: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }) },
        prismaWidget: { create },
        entitlement: PRO_ENT
      })

      await svc.create(
        {
          projectId: 'p1',
          name: 'n',
          type: 'CHAT',
          config: chatConfig(false)
        } as never,
        'u1'
      )

      const persisted = create.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(false)
    })

    it('does not gate non-CHAT widgets (no entitlement lookup, config untouched)', async () => {
      const create = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc, getActiveEntitlementByUserId } = make({
        prismaProject: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }) },
        prismaWidget: { create },
        entitlement: FREE_ENT
      })

      await svc.create(
        {
          projectId: 'p1',
          name: 'n',
          type: 'NOTIFICATION',
          config: chatConfig(false)
        } as never,
        'u1'
      )

      const persisted = create.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(false)
      expect(getActiveEntitlementByUserId).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    const ownerWidget = (type: string) => ({
      id: 'w1',
      projectId: 'p1',
      type,
      config: null,
      configVersion: null,
      project: { userId: 'u1' }
    })

    it('forces brandingEnabled=true for CHAT + Free entitlement', async () => {
      const update = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc } = make({
        prismaWidget: {
          findUnique: jest.fn().mockResolvedValue(ownerWidget('CHAT')),
          update
        },
        entitlement: FREE_ENT
      })

      await svc.update('w1', { config: chatConfig(false) } as never, 'u1')

      const persisted = update.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(true)
    })

    it('leaves brandingEnabled=false for CHAT + pro entitlement', async () => {
      const update = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc } = make({
        prismaWidget: {
          findUnique: jest.fn().mockResolvedValue(ownerWidget('CHAT')),
          update
        },
        entitlement: PRO_ENT
      })

      await svc.update('w1', { config: chatConfig(false) } as never, 'u1')

      const persisted = update.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(false)
    })

    it('does not gate non-CHAT widgets', async () => {
      const update = jest.fn().mockResolvedValue({ id: 'w1' })
      const { svc, getActiveEntitlementByUserId } = make({
        prismaWidget: {
          findUnique: jest.fn().mockResolvedValue(ownerWidget('NOTIFICATION')),
          update
        },
        entitlement: FREE_ENT
      })

      await svc.update('w1', { config: chatConfig(false) } as never, 'u1')

      const persisted = update.mock.calls[0][0].data.config
      expect(persisted.widget.brandingEnabled).toBe(false)
      expect(getActiveEntitlementByUserId).not.toHaveBeenCalled()
    })
  })
})
