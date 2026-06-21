jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))
jest.mock('@lemnity/widget-config', () => ({
  CURRENT_VERSION: 1,
  migrateToCurrent: (data: unknown, version?: number) => ({ data, version: version ?? 1 }),
  canonicalizeWidgetConfig: (raw: unknown) => raw,
  validate: () => ({ ok: true, issues: [] })
}))
jest.mock('@lemnity/database', () => ({
  WidgetType: { CALLBACK: 'CALLBACK', CHAT: 'CHAT', NOTIFICATION: 'NOTIFICATION' }
}))

import { WidgetService } from './widget.service'
import type { PrismaService } from '../prisma.service'
import type { ConfigService } from '../config/config.service'
import type { ChatSubscriptionService } from '../lemnity/chat-subscription.service'

function make() {
  const create = jest.fn().mockResolvedValue({ id: 'w1' })
  const prisma = {
    widget: { create },
    project: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1' }) }
  }
  const chatSub = {
    getActiveEntitlementByUserId: jest.fn()
  } as unknown as ChatSubscriptionService
  const configService = {} as unknown as ConfigService
  const svc = new WidgetService(prisma as unknown as PrismaService, configService, chatSub)
  return { svc, create }
}

// Тип без config, чтобы не дёргать enforceChatBranding/ConfigService.
const dto = { projectId: 'p1', name: 'n', type: 'NOTIFICATION' } as never

describe('WidgetService.create — paidUntil для админа', () => {
  it('ставит paidUntil = null, когда isAdmin = true', async () => {
    const { svc, create } = make()
    await svc.create(dto, 'u1', true)
    expect(create.mock.calls[0][0].data.paidUntil).toBeNull()
  })

  it('ставит триал (~ now + 5 дней) для обычного пользователя', async () => {
    const { svc, create } = make()
    const before = Date.now()
    await svc.create(dto, 'u1', false)
    const paidUntil: Date = create.mock.calls[0][0].data.paidUntil
    const fiveDays = 5 * 24 * 60 * 60 * 1000
    expect(paidUntil).toBeInstanceOf(Date)
    expect(paidUntil.getTime()).toBeGreaterThanOrEqual(before + fiveDays - 1000)
    expect(paidUntil.getTime()).toBeLessThanOrEqual(Date.now() + fiveDays + 1000)
  })

  it('по умолчанию (без третьего аргумента) — триал, не null', async () => {
    const { svc, create } = make()
    await svc.create(dto, 'u1')
    expect(create.mock.calls[0][0].data.paidUntil).toBeInstanceOf(Date)
  })
})
