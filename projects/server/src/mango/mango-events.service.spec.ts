jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { MangoEventsService } from './mango-events.service'
import type { PrismaService } from '../prisma.service'

function makePrisma(req: unknown) {
  return {
    request: { findFirst: jest.fn().mockResolvedValue(req), update: jest.fn().mockResolvedValue({}) }
  }
}

describe('MangoEventsService.applyEvent', () => {
  it('returns matched:false when no request has that command_id', async () => {
    const prisma = makePrisma(null)
    const svc = new MangoEventsService(prisma as unknown as PrismaService)
    const res = await svc.applyEvent({ commandId: 'nope', answered: true })
    expect(res).toEqual({ matched: false })
    expect(prisma.request.update).not.toHaveBeenCalled()
  })

  it('on answered call: marks request used and stores duration + recording', async () => {
    const prisma = makePrisma({ id: 'r1' })
    const svc = new MangoEventsService(prisma as unknown as PrismaService)
    await svc.applyEvent({ commandId: 'cmd1', durationSec: 42, recordingUrl: 'https://rec/a.mp3', answered: true })
    expect(prisma.request.findFirst).toHaveBeenCalledWith({
      where: { mangoCommandId: 'cmd1' },
      select: { id: true }
    })
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'used', callDurationSec: 42, callRecordingUrl: 'https://rec/a.mp3' }
    })
  })

  it('on unanswered call: marks request not_processed', async () => {
    const prisma = makePrisma({ id: 'r1' })
    const svc = new MangoEventsService(prisma as unknown as PrismaService)
    await svc.applyEvent({ commandId: 'cmd2', durationSec: 0, answered: false })
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'not_processed', callDurationSec: 0 }
    })
  })
})
