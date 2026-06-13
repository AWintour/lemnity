import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { CreateChatDepartmentDto } from './dto/create-chat-department.dto'
import type { UpdateChatDepartmentDto } from './dto/update-chat-department.dto'
import type { ChatDepartmentEntity } from './entities/chat-department.entity'

type OperatorRow = {
  id: string
  name: string
  role: string
  online: boolean
  avatarUrl: string | null
}

type DepartmentRow = {
  id: string
  projectId: string
  name: string
  description: string | null
  createdAt: Date
  operators: OperatorRow[]
}

const toEntity = (d: DepartmentRow): ChatDepartmentEntity => ({
  id: d.id,
  projectId: d.projectId,
  name: d.name,
  description: d.description,
  operators: d.operators.map((o) => ({
    id: o.id,
    name: o.name,
    role: o.role,
    online: o.online,
    avatarUrl: o.avatarUrl
  })),
  membersCount: d.operators.length,
  createdAt: d.createdAt.toISOString()
})

/**
 * Отделы чата проекта (Chat Widget, вкладка «Чат»). CRUD с проверкой владения проектом —
 * паттерн `ManagerService`. Каждый отдел отдаётся вместе с операторами и их количеством.
 */
@Injectable()
export class ChatDepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnsProject(userId: string, projectId: string) {
    const owned = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Project not found')
  }

  private async assertOwnsDepartment(userId: string, id: string) {
    const owned = await this.prisma.chatDepartment.findFirst({
      where: { id, project: { userId } },
      select: { id: true }
    })
    if (!owned) throw new ForbiddenException('Chat department not found')
  }

  async list(
    userId: string,
    projectId: string
  ): Promise<{ departments: ChatDepartmentEntity[]; total: number }> {
    await this.assertOwnsProject(userId, projectId)
    const rows = await this.prisma.chatDepartment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        operators: {
          select: { id: true, name: true, role: true, online: true, avatarUrl: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return { departments: rows.map(toEntity), total: rows.length }
  }

  async create(
    userId: string,
    projectId: string,
    dto: CreateChatDepartmentDto
  ): Promise<ChatDepartmentEntity> {
    await this.assertOwnsProject(userId, projectId)
    const row = await this.prisma.chatDepartment.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description
      },
      include: {
        operators: {
          select: { id: true, name: true, role: true, online: true, avatarUrl: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return toEntity(row)
  }

  async update(userId: string, id: string, dto: UpdateChatDepartmentDto): Promise<ChatDepartmentEntity> {
    await this.assertOwnsDepartment(userId, id)
    const row = await this.prisma.chatDepartment.update({
      where: { id },
      data: dto,
      include: {
        operators: {
          select: { id: true, name: true, role: true, online: true, avatarUrl: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return toEntity(row)
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.assertOwnsDepartment(userId, id)
    await this.prisma.chatDepartment.delete({ where: { id } })
    return { ok: true }
  }
}
