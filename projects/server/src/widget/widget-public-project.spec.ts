jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))
// @lemnity/widget-config ships ESM dist that Jest can't parse; stub the named exports the
// widget/config services import. Tests below use null configs, so migrate is a passthrough.
jest.mock('@lemnity/widget-config', () => ({
  CURRENT_VERSION: 1,
  migrateToCurrent: (data: unknown, version?: number) => ({ data, version: version ?? 1 }),
  canonicalizeWidgetConfig: (raw: unknown) => raw,
  validate: () => ({ ok: true, issues: [] })
}))
jest.mock('@lemnity/database', () => ({
  WidgetType: { CALLBACK: 'CALLBACK', CHAT: 'CHAT', NOTIFICATION: 'NOTIFICATION' }
}))

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { WidgetService } from './widget.service'
import type { PrismaService } from '../prisma.service'
import type { ConfigService } from '../config/config.service'
import type { ChatSubscriptionService } from '../lemnity/chat-subscription.service'

type WidgetRow = {
  id: string
  projectId: string
  type: string
  enabled: boolean
  config: unknown
  configVersion: number | null
  project: { websiteUrl: string }
}

const widgetRow = (over: Partial<WidgetRow> = {}): WidgetRow => ({
  id: 'w1',
  projectId: 'p1',
  type: 'CHAT',
  enabled: true,
  config: null,
  configVersion: null,
  project: { websiteUrl: 'https://example.com' },
  ...over
})

function make(prismaWidget: Record<string, jest.Mock>) {
  const prisma = { widget: prismaWidget }
  const svc = new WidgetService(
    prisma as unknown as PrismaService,
    {} as ConfigService,
    {} as ChatSubscriptionService
  )
  return { svc, prisma }
}

describe('WidgetService.findPublicByProject', () => {
  it('returns mapped enabled widgets when origin matches project website', async () => {
    const findMany = jest.fn().mockResolvedValue([
      widgetRow({ id: 'a' }),
      widgetRow({ id: 'b' })
    ])
    const { svc } = make({ findMany })

    const res = await svc.findPublicByProject('p1', 'example.com')

    expect(res).toEqual([
      { id: 'a', projectId: 'p1', type: 'CHAT', enabled: true, config: null },
      { id: 'b', projectId: 'p1', type: 'CHAT', enabled: true, config: null }
    ])
    // filters by enabled + project.enabled + paid, capped at 3
    const arg = findMany.mock.calls[0][0]
    expect(arg.where).toMatchObject({ projectId: 'p1', enabled: true, project: { enabled: true } })
    expect(arg.take).toBe(3)
  })

  it('throws NotFound when project has no enabled widgets', async () => {
    const { svc } = make({ findMany: jest.fn().mockResolvedValue([]) })
    await expect(svc.findPublicByProject('p1', 'example.com')).rejects.toBeInstanceOf(
      NotFoundException
    )
  })

  it('throws Forbidden when origin does not match project website', async () => {
    const { svc } = make({ findMany: jest.fn().mockResolvedValue([widgetRow()]) })
    await expect(svc.findPublicByProject('p1', 'evil.com')).rejects.toBeInstanceOf(
      ForbiddenException
    )
  })

  it('throws Forbidden when origin is missing', async () => {
    const { svc } = make({ findMany: jest.fn().mockResolvedValue([widgetRow()]) })
    await expect(svc.findPublicByProject('p1', null)).rejects.toBeInstanceOf(ForbiddenException)
  })
})

describe('WidgetService.toggleEnabled enable limit', () => {
  const ownerWidget = {
    id: 'w1',
    projectId: 'p1',
    config: null,
    project: { userId: 'u1' }
  }

  it('throws BadRequest when 3 widgets already enabled', async () => {
    const { svc, prisma } = make({
      findUnique: jest.fn().mockResolvedValue(ownerWidget),
      count: jest.fn().mockResolvedValue(3),
      update: jest.fn()
    })
    await expect(svc.toggleEnabled('w1', true, 'u1')).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.widget.update).not.toHaveBeenCalled()
    // count excludes the widget being toggled
    expect(prisma.widget.count.mock.calls[0][0].where).toMatchObject({
      projectId: 'p1',
      enabled: true,
      id: { not: 'w1' }
    })
  })

  it('enables when below the limit', async () => {
    const { svc, prisma } = make({
      findUnique: jest.fn().mockResolvedValue(ownerWidget),
      count: jest.fn().mockResolvedValue(2),
      update: jest.fn().mockResolvedValue({ id: 'w1', enabled: true })
    })
    await expect(svc.toggleEnabled('w1', true, 'u1')).resolves.toMatchObject({ enabled: true })
    expect(prisma.widget.update).toHaveBeenCalled()
  })

  it('does not count when disabling', async () => {
    const { svc, prisma } = make({
      findUnique: jest.fn().mockResolvedValue(ownerWidget),
      count: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'w1', enabled: false })
    })
    await svc.toggleEnabled('w1', false, 'u1')
    expect(prisma.widget.count).not.toHaveBeenCalled()
    expect(prisma.widget.update).toHaveBeenCalled()
  })
})
