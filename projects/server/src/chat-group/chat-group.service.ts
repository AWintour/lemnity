import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { CreateGroupMessageDto } from './dto/create-group-message.dto'
import type { ChatGroupMessageEntity } from './entities/chat-group-message.entity'

type ChatGroupMessageRow = {
  id: string
  projectId: string
  operatorId: string | null
  senderUserId: string | null
  senderName: string | null
  body: string
  attachmentUrl: string | null
  attachmentType: string | null
  attachmentName: string | null
  createdAt: Date
}

const toEntity = (m: ChatGroupMessageRow): ChatGroupMessageEntity => ({
  id: m.id,
  projectId: m.projectId,
  operatorId: m.operatorId,
  senderUserId: m.senderUserId,
  senderName: m.senderName,
  body: m.body,
  attachmentUrl: m.attachmentUrl,
  attachmentType: m.attachmentType,
  attachmentName: m.attachmentName,
  createdAt: m.createdAt.toISOString()
})

/**
 * Внутренний групповой чат операторов проекта. Owner-check по паттерну `ManagerService.assertOwnsProject` —
 * только владелец проекта читает/пишет сообщения.
 */
@Injectable()
export class ChatGroupService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  async list(userId: string, projectId: string): Promise<{ messages: ChatGroupMessageEntity[] }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.chatGroupMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 200
    })
    return { messages: rows.map(toEntity) }
  }

  async create(
    userId: string,
    projectId: string,
    dto: CreateGroupMessageDto
  ): Promise<ChatGroupMessageEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.chatGroupMessage.create({
      data: {
        projectId,
        body: dto.body,
        operatorId: dto.operatorId ?? null,
        senderName: dto.senderName ?? null,
        senderUserId: userId,
        attachmentUrl: dto.attachmentUrl ?? null,
        attachmentType: dto.attachmentType ?? null,
        attachmentName: dto.attachmentName ?? null
      }
    })
    return toEntity(row)
  }
}
