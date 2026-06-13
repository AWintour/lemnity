import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { UpdateIntegrationDto } from './dto/update-integration.dto'
import type { ChatIntegrationEntity } from './entities/chat-integration.entity'

/** Известные типы социальных интеграций чат-виджета. */
const TYPES = ['telegram', 'max', 'vk'] as const

type IntegrationRow = {
  type: string
  connected: boolean
  config: unknown
}

const toEntity = (row: IntegrationRow): ChatIntegrationEntity => ({
  type: row.type,
  connected: row.connected,
  config: row.config ?? null
})

/**
 * Социальные интеграции чат-виджета (Telegram, MAX, VK). Проверка владения проектом —
 * паттерн `ManagerService.assertOwnsProject`. `list` всегда возвращает все 3 TYPES
 * (отсутствующие — как не подключённые), `upsert` создаёт/обновляет одну запись.
 */
@Injectable()
export class ChatSocialService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  async list(userId: string, projectId: string): Promise<{ integrations: ChatIntegrationEntity[] }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.chatSocialIntegration.findMany({ where: { projectId } })
    const byType = new Map(rows.map((row) => [row.type, row]))
    const integrations = TYPES.map((type) => {
      const row = byType.get(type)
      return row ? toEntity(row) : { type, connected: false, config: null }
    })
    return { integrations }
  }

  async upsert(
    userId: string,
    projectId: string,
    type: string,
    dto: UpdateIntegrationDto
  ): Promise<ChatIntegrationEntity> {
    await this.assertOwnsProject(userId, projectId)
    if (!(TYPES as readonly string[]).includes(type)) {
      throw new BadRequestException('Unknown integration type')
    }
    const row = await this.prisma.chatSocialIntegration.upsert({
      where: { projectId_type: { projectId, type } },
      create: {
        projectId,
        type,
        connected: dto.connected ?? false,
        config: dto.config ?? undefined
      },
      update: {
        connected: dto.connected,
        config: dto.config ?? undefined
      }
    })
    return toEntity(row)
  }
}
