jest.mock('../prisma.service', () => ({ PrismaService: class PrismaService {} }))

import { ForbiddenException } from '@nestjs/common'
import { MangoIntegrationService } from './mango-integration.service'
import type { PrismaService } from '../prisma.service'
import { encryptWithKey, decryptWithKey } from '../common/crypto/secret-cipher'

const KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'

const ENV = { ...process.env }
beforeEach(() => {
  process.env.INTEGRATION_ENC_KEY = KEY
})
afterEach(() => {
  process.env = { ...ENV }
})

function makePrisma(integration: unknown, ownedProject: unknown = { id: 'p1' }) {
  return {
    projectIntegration: {
      findUnique: jest.fn().mockResolvedValue(integration),
      upsert: jest.fn().mockResolvedValue({})
    },
    project: { findFirst: jest.fn().mockResolvedValue(ownedProject) }
  }
}

describe('MangoIntegrationService.resolveForProject', () => {
  it('returns null when no integration exists', async () => {
    const prisma = makePrisma(null)
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)
    expect(await svc.resolveForProject('p1')).toBeNull()
  })

  it('returns null when integration is disabled', async () => {
    const prisma = makePrisma({ enabled: false, apiKeyEnc: 'x', apiSaltEnc: 'y' })
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)
    expect(await svc.resolveForProject('p1')).toBeNull()
  })

  it('decrypts secrets and maps call settings when enabled', async () => {
    const prisma = makePrisma({
      enabled: true,
      apiKeyEnc: encryptWithKey('byo-key', KEY),
      apiSaltEnc: encryptWithKey('byo-salt', KEY),
      managerType: 'SIP',
      managerAddress: '202',
      lineNumber: '+74950009999',
      callMode: 'manager',
      delaySeconds: 15
    })
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)

    expect(await svc.resolveForProject('p1')).toEqual({
      secrets: { apiKey: 'byo-key', apiSalt: 'byo-salt' },
      call: {
        callMode: 'manager',
        managerType: 'SIP',
        managerAddress: '202',
        clientLineNumber: '+74950009999'
      },
      delaySeconds: 15
    })
    expect(prisma.projectIntegration.findUnique).toHaveBeenCalledWith({
      where: { projectId_type: { projectId: 'p1', type: 'mango_office' } }
    })
  })
})

describe('MangoIntegrationService.upsert', () => {
  it('encrypts api key/salt at rest and upserts by (projectId, type)', async () => {
    const prisma = makePrisma(null)
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)

    await svc.upsert('p1', {
      apiKey: 'k',
      apiSalt: 's',
      managerType: 'Телефон',
      managerAddress: '+74950000000',
      delaySeconds: 20
    })

    const arg = prisma.projectIntegration.upsert.mock.calls[0][0]
    expect(arg.where).toEqual({ projectId_type: { projectId: 'p1', type: 'mango_office' } })
    // ciphertext is not plaintext, and decrypts back to the original
    expect(arg.create.apiKeyEnc).not.toBe('k')
    expect(arg.create.apiSaltEnc).not.toBe('s')
    expect(decryptWithKey(arg.create.apiKeyEnc, KEY)).toBe('k')
    expect(decryptWithKey(arg.create.apiSaltEnc, KEY)).toBe('s')
    expect(arg.create.managerAddress).toBe('+74950000000')
    expect(arg.update.delaySeconds).toBe(20)
  })

  it('throws when the encryption key is not configured', async () => {
    delete process.env.INTEGRATION_ENC_KEY
    const prisma = makePrisma(null)
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)
    await expect(svc.upsert('p1', { apiKey: 'k', apiSalt: 's' })).rejects.toThrow()
  })
})

describe('MangoIntegrationService.saveForOwner', () => {
  it('forbids saving when the project is not owned by the user', async () => {
    const prisma = makePrisma(null, null) // project.findFirst → null (not owned)
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)
    await expect(svc.saveForOwner('u1', 'p1', { apiKey: 'k', apiSalt: 's' })).rejects.toBeInstanceOf(
      ForbiddenException
    )
    expect(prisma.projectIntegration.upsert).not.toHaveBeenCalled()
  })

  it('upserts when the user owns the project', async () => {
    const prisma = makePrisma(null, { id: 'p1' })
    const svc = new MangoIntegrationService(prisma as unknown as PrismaService)
    await svc.saveForOwner('u1', 'p1', { apiKey: 'k', apiSalt: 's' })
    expect(prisma.project.findFirst).toHaveBeenCalledWith({ where: { id: 'p1', userId: 'u1' }, select: { id: true } })
    expect(prisma.projectIntegration.upsert).toHaveBeenCalledTimes(1)
  })
})
