import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import type { CreateChatOperatorDto } from './dto/create-chat-operator.dto'
import type { UpdateChatOperatorDto } from './dto/update-chat-operator.dto'
import type { ChatOperatorEntity } from './entities/chat-operator.entity'

type ChatOperatorRow = {
  id: string
  projectId: string
  userId: string | null
  name: string
  email: string | null
  role: string
  avatarUrl: string | null
  online: boolean
  status: string
  departmentId: string | null
  widgetId: string | null
  createdAt: Date
}

const toEntity = (o: ChatOperatorRow): ChatOperatorEntity => ({
  id: o.id,
  projectId: o.projectId,
  userId: o.userId,
  isOwner: o.userId != null,
  name: o.name,
  email: o.email,
  role: o.role,
  avatarUrl: o.avatarUrl,
  online: o.online,
  status: o.status,
  departmentId: o.departmentId,
  widgetId: o.widgetId,
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

  // Чат-скоуп оператора должен быть CHAT-виджетом одного из проектов владельца (или пусто = все чаты).
  private async resolveWidgetScope(
    userId: string,
    widgetId: string | null | undefined
  ): Promise<string | null | undefined> {
    if (widgetId === undefined) return undefined
    if (!widgetId) return null
    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, type: 'CHAT', project: { userId } },
      select: { id: true }
    })
    if (!widget) throw new ForbiddenException('Chat widget not found')
    return widget.id
  }

  /**
   * Гарантирует, что владелец кабинета присутствует в списке операторов проекта
   * (заводится один раз; роль «Владелец», online по умолчанию).
   */
  private async ensureOwnerOperator(ownerUserId: string, projectId: string) {
    const existing = await this.prisma.chatOperator.findFirst({
      where: { projectId, userId: ownerUserId },
      select: { id: true }
    })
    if (existing) return
    const user = await this.prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { name: true, email: true }
    })
    await this.prisma.chatOperator.create({
      data: {
        projectId,
        userId: ownerUserId,
        name: user?.name?.trim() || user?.email || 'Владелец',
        email: user?.email ?? null,
        role: 'Владелец',
        online: true,
        status: 'work'
      }
    })
  }

  async listForProject(
    userId: string,
    projectId: string
  ): Promise<{ operators: ChatOperatorEntity[]; total: number }> {
    await this.assertOwnsProject(userId, projectId)
    await this.ensureOwnerOperator(userId, projectId)
    const rows = await this.prisma.chatOperator.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })
    // Владелец — первым в списке.
    const sorted = [...rows].sort((a, b) => (b.userId ? 1 : 0) - (a.userId ? 1 : 0))
    return { operators: sorted.map(toEntity), total: sorted.length }
  }

  async create(userId: string, projectId: string, dto: CreateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsProject(userId, projectId)
    const widgetId = (await this.resolveWidgetScope(userId, dto.widgetId)) ?? null
    const row = await this.prisma.chatOperator.create({
      data: {
        projectId,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        avatarUrl: dto.avatarUrl,
        departmentId: dto.departmentId,
        widgetId,
        status: dto.status
      }
    })
    return toEntity(row)
  }

  async update(userId: string, id: string, dto: UpdateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsOperator(userId, id)
    // widgetId: undefined — не трогаем; null — снять скоуп (все чаты); строка — валидируем владение.
    const widgetId = await this.resolveWidgetScope(userId, dto.widgetId)
    const row = await this.prisma.chatOperator.update({
      where: { id },
      data: { ...dto, ...(widgetId === undefined ? {} : { widgetId }) }
    })
    return toEntity(row)
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.assertOwnsOperator(userId, id)
    const op = await this.prisma.chatOperator.findUnique({ where: { id }, select: { userId: true } })
    if (op?.userId) throw new ForbiddenException('Owner operator cannot be deleted')
    await this.prisma.chatOperator.delete({ where: { id } })
    return { ok: true }
  }
}
