import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { decryptWithKey, encryptWithKey } from '../common/crypto/secret-cipher'

const TYPE = 'mango_office'

/** Разрешённая BYO-интеграция: расшифрованные секреты + параметры звонка проекта. */
export type ResolvedIntegration = {
  secrets: { apiKey: string; apiSalt: string }
  call: {
    callMode?: string
    managerType?: string
    managerAddress?: string
    clientLineNumber?: string
  }
  delaySeconds?: number
}

export type UpsertIntegrationDto = {
  apiKey?: string
  apiSalt?: string
  managerType?: string
  managerAddress?: string
  lineNumber?: string
  callMode?: string
  delaySeconds?: number
  enabled?: boolean
}

/**
 * BYO-интеграция Mango на проект (Фаза 2, гибрид). Хранит секреты шифрованными (secret-cipher);
 * резолвит расшифрованные креды/настройки для воркера, иначе — null (тогда работает глобальный env).
 */
@Injectable()
export class MangoIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  private encKey(): string {
    const k = (process.env.INTEGRATION_ENC_KEY || '').trim()
    if (!k) throw new Error('INTEGRATION_ENC_KEY is not configured')
    return k
  }

  async resolveForProject(projectId: string): Promise<ResolvedIntegration | null> {
    const it = await this.prisma.projectIntegration.findUnique({
      where: { projectId_type: { projectId, type: TYPE } }
    })
    if (!it || !it.enabled || !it.apiKeyEnc || !it.apiSaltEnc) return null

    let key: string
    try {
      key = this.encKey()
    } catch {
      return null // нет ключа шифрования — не можем расшифровать, откатимся на глобальный env
    }

    return {
      secrets: {
        apiKey: decryptWithKey(it.apiKeyEnc, key),
        apiSalt: decryptWithKey(it.apiSaltEnc, key)
      },
      call: {
        callMode: it.callMode ?? undefined,
        managerType: it.managerType ?? undefined,
        managerAddress: it.managerAddress ?? undefined,
        clientLineNumber: it.lineNumber ?? undefined
      },
      delaySeconds: it.delaySeconds ?? undefined
    }
  }

  async upsert(projectId: string, dto: UpsertIntegrationDto) {
    const key = this.encKey()
    const data: {
      type: string
      enabled: boolean
      managerType: string | null
      managerAddress: string | null
      lineNumber: string | null
      callMode: string | null
      delaySeconds: number | null
      apiKeyEnc?: string
      apiSaltEnc?: string
    } = {
      type: TYPE,
      enabled: dto.enabled ?? true,
      managerType: dto.managerType ?? null,
      managerAddress: dto.managerAddress ?? null,
      lineNumber: dto.lineNumber ?? null,
      callMode: dto.callMode ?? null,
      delaySeconds: typeof dto.delaySeconds === 'number' ? dto.delaySeconds : null
    }
    if (dto.apiKey) data.apiKeyEnc = encryptWithKey(dto.apiKey, key)
    if (dto.apiSalt) data.apiSaltEnc = encryptWithKey(dto.apiSalt, key)

    return this.prisma.projectIntegration.upsert({
      where: { projectId_type: { projectId, type: TYPE } },
      create: { projectId, ...data },
      update: data
    })
  }

  /** ЛК: сохранить BYO-интеграцию, предварительно проверив владение проектом. */
  async saveForOwner(userId: string, projectId: string, dto: UpsertIntegrationDto) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
    return this.upsert(projectId, dto)
  }

  /** ЛК: статус интеграции БЕЗ секретов (для отображения). */
  async getStatusForOwner(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
    const it = await this.prisma.projectIntegration.findUnique({
      where: { projectId_type: { projectId, type: TYPE } }
    })
    if (!it) return { configured: false }
    return {
      configured: true,
      enabled: it.enabled,
      hasSecrets: Boolean(it.apiKeyEnc && it.apiSaltEnc),
      managerType: it.managerType ?? null,
      managerAddress: it.managerAddress ?? null,
      lineNumber: it.lineNumber ?? null,
      callMode: it.callMode ?? null,
      delaySeconds: it.delaySeconds ?? null
    }
  }
}
