import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { CreateChatOperatorDto } from './dto/create-chat-operator.dto'
import type { UpdateChatOperatorDto } from './dto/update-chat-operator.dto'
import type { ChatOperatorEntity } from './entities/chat-operator.entity'

type ChatOperatorRow = {
  id: string
  projectId: string
  name: string
  email: string | null
  role: string
  avatarUrl: string | null
  online: boolean
  status: string
  departmentId: string | null
  createdAt: Date
}

const toEntity = (o: ChatOperatorRow): ChatOperatorEntity => ({
  id: o.id,
  projectId: o.projectId,
  name: o.name,
  email: o.email,
  role: o.role,
  avatarUrl: o.avatarUrl,
  online: o.online,
  status: o.status,
  departmentId: o.departmentId,
  createdAt: o.createdAt.toISOString()
})

/**
 * Операторы чата проекта (Chat Widget, вкладка «Чат»). CRUD с проверкой владения проектом —
 * паттерн `ManagerService`.
 */
@Injectable()
export class ChatOperatorService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  private async assertOwnsOperator(userId: string, id: string) {
    const owned = await this.prisma.chatOperator.findFirst({
      where: { id, project: { userId } },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Operator not found')
  }

  async listForProject(
    userId: string,
    projectId: string
  ): Promise<{ operators: ChatOperatorEntity[]; total: number }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.chatOperator.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })
    return { operators: rows.map(toEntity), total: rows.length }
  }

  async create(userId: string, projectId: string, dto: CreateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.chatOperator.create({
      data: {
        projectId,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        avatarUrl: dto.avatarUrl,
        departmentId: dto.departmentId,
        status: dto.status
      }
    })
    return toEntity(row)
  }

  async update(userId: string, id: string, dto: UpdateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsOperator(userId, id)
    const row = await this.prisma.chatOperator.update({ where: { id }, data: dto })
    return toEntity(row)
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.assertOwnsOperator(userId, id)
    await this.prisma.chatOperator.delete({ where: { id } })
    return { ok: true }
  }
}
