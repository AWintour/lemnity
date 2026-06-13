import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { SaveDistributionDto } from './dto/save-distribution.dto'
import type { ChatDistributionEntity } from './entities/chat-distribution.entity'

type DistributionRow = {
  id: string
  projectId: string
  enabled: boolean
  method: string
  how: string
  operatorIds: string[]
  updatedAt: Date
}

const toEntity = (r: DistributionRow): ChatDistributionEntity => ({
  enabled: r.enabled,
  method: r.method,
  how: r.how,
  operatorIds: r.operatorIds
})

/**
 * Настройки авто-распределения чатов (singleton на проект). Owner-check —
 * паттерн `ManagerService.assertOwnsProject`. Одна строка на проект; при
 * отсутствии возвращаем дефолты, сохранение через upsert.
 */
@Injectable()
export class ChatDistributionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  async get(userId: string, projectId: string): Promise<ChatDistributionEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.chatDistributionSettings.findUnique({ where: { projectId } })
    if (!row) return { enabled: false, method: 'common', how: 'queue', operatorIds: [] }
    return toEntity(row)
  }

  async save(userId: string, projectId: string, dto: SaveDistributionDto): Promise<ChatDistributionEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.chatDistributionSettings.upsert({
      where: { projectId },
      create: { projectId, ...dto },
      update: { ...dto }
    })
    return toEntity(row)
  }
}
