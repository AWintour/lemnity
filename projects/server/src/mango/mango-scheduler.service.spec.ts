jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { MangoSchedulerService } from './mango-scheduler.service'
import type { PrismaService } from '../prisma.service'
import type { MangoService } from './mango.service'
import type { MangoIntegrationService } from './mango-integration.service'

// Default: no BYO integration → scheduler uses the global env account.
const NO_BYO = { resolveForProject: jest.fn().mockResolvedValue(null) }

const NOW = new Date('2026-06-11T12:00:00.000Z')

const TASK = {
  id: 't1',
  retries: 0,
  payload: {
    requestId: 'r1',
    projectId: 'p1',
    commandId: 'cmd1',
    toNumber: '+79990001122',
    call: { managerType: 'Телефон', managerAddress: '+74950000000', clientLineNumber: '+74951234567' }
  }
}

function makePrisma(tasks: unknown[]) {
  return {
    scheduledTask: { findMany: jest.fn().mockResolvedValue(tasks), update: jest.fn().mockResolvedValue({}) },
    request: { update: jest.fn().mockResolvedValue({}) }
  }
}

const ENV = { ...process.env }
beforeEach(() => {
  process.env.MANGO_VPBX_API_KEY = 'key'
  process.env.MANGO_VPBX_API_SALT = 'salt'
})
afterEach(() => {
  process.env = { ...ENV }
})

describe('MangoSchedulerService.runDueMangoTasks', () => {
  it('on Mango success: marks task success and updates the request (processed + commandId)', async () => {
    const prisma = makePrisma([TASK])
    const mango = { initCall: jest.fn().mockResolvedValue({ ok: true, code: 1000 }) }
    const svc = new MangoSchedulerService(prisma as unknown as PrismaService, mango as unknown as MangoService, NO_BYO as unknown as MangoIntegrationService)

    const res = await svc.runDueMangoTasks(NOW)

    expect(res.processed).toBe(1)
    expect(mango.initCall).toHaveBeenCalledTimes(1)
    const [cfg, call] = mango.initCall.mock.calls[0]
    expect(cfg).toEqual({ apiKey: 'key', apiSalt: 'salt', fromNumber: '+74950000000', lineNumber: '+74951234567' })
    expect(call).toEqual({ commandId: 'cmd1', toNumber: '+79990001122' })
    expect(prisma.scheduledTask.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { status: 'success' } })
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'processed', mangoCommandId: 'cmd1' }
    })
  })

  it('on Mango failure below retry cap: keeps task pending and increments retries', async () => {
    const prisma = makePrisma([{ ...TASK, retries: 0 }])
    const mango = { initCall: jest.fn().mockResolvedValue({ ok: false, code: 4001 }) }
    const svc = new MangoSchedulerService(prisma as unknown as PrismaService, mango as unknown as MangoService, NO_BYO as unknown as MangoIntegrationService)

    await svc.runDueMangoTasks(NOW)

    expect(prisma.scheduledTask.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'pending', retries: 1, lastError: expect.stringContaining('4001') }
    })
    expect(prisma.request.update).not.toHaveBeenCalled()
  })

  it('on Mango failure at retry cap (3rd attempt): marks task failed', async () => {
    const prisma = makePrisma([{ ...TASK, retries: 2 }])
    const mango = { initCall: jest.fn().mockResolvedValue({ ok: false, error: 'boom' }) }
    const svc = new MangoSchedulerService(prisma as unknown as PrismaService, mango as unknown as MangoService, NO_BYO as unknown as MangoIntegrationService)

    await svc.runDueMangoTasks(NOW)

    expect(prisma.scheduledTask.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'failed', retries: 3, lastError: expect.stringContaining('boom') }
    })
  })

  it('prefers BYO ProjectIntegration secrets/settings over env when present', async () => {
    const prisma = makePrisma([TASK])
    const mango = { initCall: jest.fn().mockResolvedValue({ ok: true, code: 1000 }) }
    const integ = {
      resolveForProject: jest.fn().mockResolvedValue({
        secrets: { apiKey: 'byoK', apiSalt: 'byoS' },
        call: { managerType: 'SIP', managerAddress: '202', clientLineNumber: '+74950009999' }
      })
    }
    const svc = new MangoSchedulerService(
      prisma as unknown as PrismaService,
      mango as unknown as MangoService,
      integ as unknown as MangoIntegrationService
    )

    await svc.runDueMangoTasks(NOW)

    expect(integ.resolveForProject).toHaveBeenCalledWith('p1')
    const [cfg] = mango.initCall.mock.calls[0]
    expect(cfg).toEqual({ apiKey: 'byoK', apiSalt: 'byoS', fromExtension: '202', lineNumber: '+74950009999' })
  })

  it('when secrets are missing: fails the task without calling Mango', async () => {
    delete process.env.MANGO_VPBX_API_KEY
    delete process.env.MANGO_VPBX_API_SALT
    const prisma = makePrisma([TASK])
    const mango = { initCall: jest.fn() }
    const svc = new MangoSchedulerService(prisma as unknown as PrismaService, mango as unknown as MangoService, NO_BYO as unknown as MangoIntegrationService)

    await svc.runDueMangoTasks(NOW)

    expect(mango.initCall).not.toHaveBeenCalled()
    expect(prisma.scheduledTask.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'failed', lastError: 'mango_secrets_missing' }
    })
  })
})
