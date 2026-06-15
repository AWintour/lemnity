import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { hash, verify } from 'argon2'
import { Prisma } from '@lemnity/database'
import { PrismaService } from '../prisma.service'
import type { CreateChatOperatorDto } from './dto/create-chat-operator.dto'
import type { UpdateChatOperatorDto } from './dto/update-chat-operator.dto'
import type { ChatOperatorEntity } from './entities/chat-operator.entity'

// Аватар храним ТОЛЬКО как постоянную ссылку (S3 `http(s)://…` или относительную `/uploads/…`).
// `blob:`/`data:`-URL — временные браузерные ссылки, в БД они бесполезны (не грузятся нигде).
// undefined → не трогаем поле; null → очищаем (в т.ч. чистим ранее сохранённый битый blob).
const sanitizeAvatarUrl = (value: unknown): string | null | undefined => {
  if (typeof value !== 'string') return undefined
  const s = value.trim()
  if (!s) return null
  return /^(https?:\/\/|\/)/i.test(s) ? s : null
}

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
  loginEmail: string | null
  passwordHash: string | null
  active: boolean
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
  loginEmail: o.loginEmail,
  hasLogin: o.passwordHash != null,
  active: o.active,
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

  // Поля учётки: нормализуем email-логин и хэшируем пароль (argon2). passwordHash наружу не уходит.
  private async credentialData(dto: {
    loginEmail?: string
    password?: string
    active?: boolean
  }): Promise<{ loginEmail?: string | null; passwordHash?: string; active?: boolean }> {
    const data: { loginEmail?: string | null; passwordHash?: string; active?: boolean } = {}
    if (dto.loginEmail !== undefined) data.loginEmail = dto.loginEmail?.trim().toLowerCase() || null
    if (dto.password) data.passwordHash = await hash(dto.password)
    if (dto.active !== undefined) data.active = dto.active
    return data
  }

  private isUniqueConflict(e: unknown): boolean {
    return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002'
  }

  async create(userId: string, projectId: string, dto: CreateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsProject(userId, projectId)
    const widgetId = (await this.resolveWidgetScope(userId, dto.widgetId)) ?? null
    const creds = await this.credentialData(dto)
    try {
      const row = await this.prisma.chatOperator.create({
        data: {
          projectId,
          name: dto.name,
          email: dto.email,
          role: dto.role,
          avatarUrl: sanitizeAvatarUrl(dto.avatarUrl) ?? null,
          departmentId: dto.departmentId,
          widgetId,
          status: dto.status,
          ...creds
        }
      })
      return toEntity(row)
    } catch (e) {
      if (this.isUniqueConflict(e)) throw new BadRequestException('Этот email уже используется')
      throw e
    }
  }

  async update(userId: string, id: string, dto: UpdateChatOperatorDto): Promise<ChatOperatorEntity> {
    await this.assertOwnsOperator(userId, id)
    // widgetId: undefined — не трогаем; null — снять скоуп (все чаты); строка — валидируем владение.
    const widgetId = await this.resolveWidgetScope(userId, dto.widgetId)
    // Колоночные поля из dto (без password/loginEmail/active/widgetId — их выставляем контролируемо).
    const data: Record<string, unknown> = { ...dto }
    delete data.password
    delete data.loginEmail
    delete data.active
    delete data.widgetId
    if (widgetId !== undefined) data.widgetId = widgetId
    // Аватар: undefined — не трогаем; иначе нормализуем (blob:/data: → null, очищаем битое).
    const avatar = sanitizeAvatarUrl(dto.avatarUrl)
    if (avatar === undefined) delete data.avatarUrl
    else data.avatarUrl = avatar
    Object.assign(data, await this.credentialData(dto))
    try {
      const row = await this.prisma.chatOperator.update({
        where: { id },
        data: data as Prisma.ChatOperatorUncheckedUpdateInput
      })
      return toEntity(row)
    } catch (e) {
      if (this.isUniqueConflict(e)) throw new BadRequestException('Этот email уже используется')
      throw e
    }
  }

  /**
   * Вход оператора по логину/паролю (изолированно от аккаунтов-владельцев).
   * Возвращает scope-данные оператора, если активен и пароль верен; иначе null.
   */
  async verifyLogin(
    loginEmail: string,
    password: string
  ): Promise<{ id: string; widgetId: string | null; ownerUserId: string; name: string } | null> {
    const email = loginEmail.trim().toLowerCase()
    const op = await this.prisma.chatOperator.findUnique({
      where: { loginEmail: email },
      select: {
        id: true,
        widgetId: true,
        active: true,
        passwordHash: true,
        name: true,
        project: { select: { userId: true } }
      }
    })
    if (!op || !op.active || !op.passwordHash) return null
    const ok = await verify(op.passwordHash, password)
    if (!ok) return null
    return { id: op.id, widgetId: op.widgetId, ownerUserId: op.project.userId, name: op.name }
  }

  /** Резолв активного оператора по id (для guard/сокета): scope + владелец. */
  async getActiveActor(
    operatorId: string
  ): Promise<{ id: string; widgetId: string | null; ownerUserId: string; name: string } | null> {
    const op = await this.prisma.chatOperator.findFirst({
      where: { id: operatorId, active: true },
      select: { id: true, widgetId: true, name: true, project: { select: { userId: true } } }
    })
    if (!op) return null
    return { id: op.id, widgetId: op.widgetId, ownerUserId: op.project.userId, name: op.name }
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.assertOwnsOperator(userId, id)
    const op = await this.prisma.chatOperator.findUnique({ where: { id }, select: { userId: true } })
    if (op?.userId) throw new ForbiddenException('Owner operator cannot be deleted')
    await this.prisma.chatOperator.delete({ where: { id } })
    return { ok: true }
  }
}
