jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { CallService } from './call.service'
import type { PrismaService } from '../prisma.service'
import type { MangoService } from '../mango/mango.service'
import type { MangoIntegrationService } from '../mango/mango-integration.service'

const ROWS = [
  {
    id: 'r1',
    createdAt: new Date('2026-06-12T10:00:00.000Z'),
    projectId: 'p1',
    phone: '+79990001122',
    managerId: 'm1',
    managerName: 'Иван',
    managerType: 'Телефон',
    callDurationSec: 42,
    status: 'used',
    callRecordingUrl: 'https://rec/a.mp3'
  }
]

function makeSvc() {
  const prisma = {
    request: {
      findMany: jest.fn().mockResolvedValue(ROWS),
      count: jest.fn().mockResolvedValue(1)
    }
  }
  const svc = new CallService(
    prisma as unknown as PrismaService,
    {} as unknown as MangoService,
    {} as unknown as MangoIntegrationService
  )
  return { svc, prisma }
}

describe('CallService.list', () => {
  it('filters to CALLBACK widgets, scopes by owner, maps entities and includes summary', async () => {
    const { svc, prisma } = makeSvc()

    const res = await svc.list('u1', { projectId: 'p1', period: '30d', status: 'used', skip: 0, take: 20 })

    const whereArg = prisma.request.findMany.mock.calls[0][0].where
    expect(whereArg.project).toEqual({ userId: 'u1' })
    expect(whereArg.widget).toEqual({ type: 'CALLBACK' })
    expect(whereArg.projectId).toBe('p1')
    expect(whereArg.status).toBe('used')

    expect(res.total).toBe(1)
    expect(res.calls[0]).toEqual({
      id: 'r1',
      createdAt: '2026-06-12T10:00:00.000Z',
      projectId: 'p1',
      phone: '+79990001122',
      managerName: 'Иван',
      managerType: 'Телефон',
      durationSec: 42,
      status: 'used',
      hasRecording: true
    })
    expect(res.summary.totals.count).toBe(1)
    expect(res.summary.byManager[0].managerName).toBe('Иван')
  })

  it('omits projectId/status filters when not provided', async () => {
    const { svc, prisma } = makeSvc()
    await svc.list('u1', {})
    const whereArg = prisma.request.findMany.mock.calls[0][0].where
    expect(whereArg.projectId).toBeUndefined()
    expect(whereArg.status).toBeUndefined()
    expect(whereArg.widget).toEqual({ type: 'CALLBACK' })
  })
})
