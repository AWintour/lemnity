jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))
jest.mock('@lemnity/database', () => ({ WidgetType: {} }))

import { BadRequestException } from '@nestjs/common'
import { CallbackService } from './callback.service'
import type { PrismaService } from '../prisma.service'
import type { RequestService } from './request.service'
import type { ManagerService } from '../manager/manager.service'

const NOW = new Date('2026-06-11T12:00:00.000Z')
const WIDGET = {
  projectId: 'p1',
  type: 'CALLBACK',
  config: {
    widget: {
      callback: {
        delaySeconds: 30,
        call: {
          callMode: 'manager',
          managerType: 'Телефон',
          managerAddress: '+74950000000',
          clientLineNumber: '+74951234567'
        }
      }
    }
  }
}

function make() {
  const prisma = {
    widget: { findUnique: jest.fn().mockResolvedValue(WIDGET) },
    scheduledTask: { create: jest.fn().mockResolvedValue({}) },
    request: { update: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) }
  }
  const requestService = { createPublic: jest.fn().mockResolvedValue({ id: 'r1', projectId: 'p1' }) }
  const managerService = { listEnabledForProject: jest.fn().mockResolvedValue([]) }
  const svc = new CallbackService(
    prisma as unknown as PrismaService,
    requestService as unknown as RequestService,
    managerService as unknown as ManagerService
  )
  return { svc, prisma, requestService, managerService }
}

describe('CallbackService.createCallback', () => {
  it('creates the lead, schedules the call at now+delay, links commandId, returns delaySeconds', async () => {
    const { svc, prisma, requestService } = make()

    const res = await svc.createCallback(
      { widgetId: 'w1', phone: '+79990001122', fullName: 'Ivan' },
      { originHost: 'site.com' },
      { now: NOW, commandId: 'cmd1' }
    )

    expect(res).toEqual({ delaySeconds: 30 })
    expect(requestService.createPublic).toHaveBeenCalledTimes(1)
    expect(prisma.scheduledTask.create).toHaveBeenCalledWith({
      data: {
        type: 'mango_call',
        executeAt: new Date('2026-06-11T12:00:30.000Z'),
        payload: {
          requestId: 'r1',
          projectId: 'p1',
          commandId: 'cmd1',
          toNumber: '+79990001122',
          call: {
            callMode: 'manager',
            managerType: 'Телефон',
            managerAddress: '+74950000000',
            clientLineNumber: '+74951234567'
          }
        }
      }
    })
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { mangoCommandId: 'cmd1' }
    })
  })

  it('with managers: round-robin assigns one, stores it on the request and uses it for the call', async () => {
    const { svc, prisma, managerService } = make()
    managerService.listEnabledForProject.mockResolvedValue([
      { id: 'm1', name: 'Иван', type: 'SIP', address: '101' },
      { id: 'm2', name: 'Пётр', type: 'Телефон', address: '+79990000002' }
    ])
    prisma.request.count.mockResolvedValue(1) // key=1 → second manager (m2)

    await svc.createCallback(
      { widgetId: 'w1', phone: '+79990001122' },
      { originHost: 's' },
      { now: NOW, commandId: 'cmd1' }
    )

    expect(managerService.listEnabledForProject).toHaveBeenCalledWith('p1')
    expect(prisma.request.count).toHaveBeenCalledWith({ where: { projectId: 'p1' } })
    // payload call uses the chosen manager (overrides widget config), keeps callMode + clientLineNumber
    const task = prisma.scheduledTask.create.mock.calls[0][0]
    expect(task.data.payload.call).toEqual({
      callMode: 'manager',
      managerType: 'Телефон',
      managerAddress: '+79990000002',
      clientLineNumber: '+74951234567'
    })
    // request gets manager fields + commandId
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: {
        mangoCommandId: 'cmd1',
        managerId: 'm2',
        managerName: 'Пётр',
        managerAddress: '+79990000002',
        managerType: 'Телефон'
      }
    })
  })

  it('rejects when phone is missing (nothing to call)', async () => {
    const { svc, requestService } = make()
    await expect(
      svc.createCallback({ widgetId: 'w1', phone: '' }, { originHost: 'site.com' })
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(requestService.createPublic).not.toHaveBeenCalled()
  })

  it('defaults delaySeconds to 20 when widget has no callback config', async () => {
    const { svc, prisma } = make()
    prisma.widget.findUnique.mockResolvedValue({ projectId: 'p1', type: 'CALLBACK', config: {} })
    await svc.createCallback({ widgetId: 'w1', phone: '+79990000000' }, { originHost: 's' }, { now: NOW, commandId: 'c' })
    const arg = prisma.scheduledTask.create.mock.calls[0][0]
    expect(arg.data.executeAt).toEqual(new Date('2026-06-11T12:00:20.000Z'))
  })
})
