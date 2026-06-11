jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { ForbiddenException } from '@nestjs/common'
import { ManagerService } from './manager.service'
import type { PrismaService } from '../prisma.service'

const ROW = {
  id: 'm1',
  projectId: 'p1',
  name: 'Иван',
  type: 'Телефон',
  address: '+74950000000',
  enabled: true,
  createdAt: new Date('2026-06-12T00:00:00.000Z')
}

function makePrisma(over: Record<string, unknown> = {}) {
  return {
    project: { findFirst: jest.fn().mockResolvedValue({ id: 'p1' }) },
    manager: {
      findFirst: jest.fn().mockResolvedValue({ id: 'm1' }),
      findMany: jest.fn().mockResolvedValue([ROW]),
      create: jest.fn().mockResolvedValue(ROW),
      update: jest.fn().mockResolvedValue(ROW),
      delete: jest.fn().mockResolvedValue(ROW)
    },
    ...over
  }
}

describe('ManagerService.listForProject', () => {
  it('returns managers when the user owns the project', async () => {
    const prisma = makePrisma()
    const svc = new ManagerService(prisma as unknown as PrismaService)
    const res = await svc.listForProject('u1', 'p1')
    expect(prisma.project.findFirst).toHaveBeenCalledWith({ where: { id: 'p1', userId: 'u1' }, select: { id: true } })
    expect(res.managers[0]).toEqual({
      id: 'm1',
      projectId: 'p1',
      name: 'Иван',
      type: 'Телефон',
      address: '+74950000000',
      enabled: true,
      createdAt: '2026-06-12T00:00:00.000Z'
    })
    expect(res.total).toBe(1)
  })

  it('forbids when the user does not own the project', async () => {
    const prisma = makePrisma({ project: { findFirst: jest.fn().mockResolvedValue(null) } })
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await expect(svc.listForProject('u1', 'p1')).rejects.toBeInstanceOf(ForbiddenException)
  })
})

describe('ManagerService.create', () => {
  it('creates a manager for an owned project', async () => {
    const prisma = makePrisma()
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await svc.create('u1', 'p1', { name: 'Иван', type: 'Телефон', address: '+74950000000' })
    expect(prisma.manager.create).toHaveBeenCalledWith({
      data: { projectId: 'p1', name: 'Иван', type: 'Телефон', address: '+74950000000', enabled: true }
    })
  })

  it('forbids creating in a non-owned project', async () => {
    const prisma = makePrisma({ project: { findFirst: jest.fn().mockResolvedValue(null) } })
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await expect(svc.create('u1', 'p1', { name: 'X', type: 'SIP', address: '101' })).rejects.toBeInstanceOf(
      ForbiddenException
    )
    expect(prisma.manager.create).not.toHaveBeenCalled()
  })
})

describe('ManagerService.update / remove (owner-checked via manager.project.userId)', () => {
  it('updates an owned manager', async () => {
    const prisma = makePrisma()
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await svc.update('u1', 'm1', { enabled: false })
    expect(prisma.manager.findFirst).toHaveBeenCalledWith({
      where: { id: 'm1', project: { userId: 'u1' } },
      select: { id: true }
    })
    expect(prisma.manager.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { enabled: false } })
  })

  it('forbids updating a non-owned manager', async () => {
    const prisma = makePrisma({
      manager: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn() }
    })
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await expect(svc.update('u1', 'm1', { enabled: false })).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('removes an owned manager', async () => {
    const prisma = makePrisma()
    const svc = new ManagerService(prisma as unknown as PrismaService)
    await svc.remove('u1', 'm1')
    expect(prisma.manager.delete).toHaveBeenCalledWith({ where: { id: 'm1' } })
  })
})

describe('ManagerService.listEnabledForProject (internal, for round-robin)', () => {
  it('returns enabled managers ordered by createdAt asc', async () => {
    const prisma = makePrisma()
    const svc = new ManagerService(prisma as unknown as PrismaService)
    const res = await svc.listEnabledForProject('p1')
    expect(prisma.manager.findMany).toHaveBeenCalledWith({
      where: { projectId: 'p1', enabled: true },
      orderBy: { createdAt: 'asc' }
    })
    expect(res).toHaveLength(1)
  })
})
