import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { subDays } from 'date-fns'
import type { ChatConversation, ChatMessage } from '@lemnity/database'
import { PrismaService } from '../prisma.service'
import {
  extractWebsiteHosts,
  isDevOriginHostAllowed,
  isHostAllowedByWebsiteHosts
} from '../common/origin'
import type { VisitorMeta } from '../common/visitor-meta'
import type { ChatActor } from './chat-actor.guard'
import type { ListConversationsDto } from './dto/list-conversations.dto'
import type {
  ChatConversationEntity,
  ChatMessagesResponse
} from './entities/chat-conversation.entity'
import type { ChatMessageEntity } from './entities/chat-message.entity'

const buildConversationNumber = (seq: number) => `${String(seq).padStart(4, '0')}`

const sanitize = (value: string | undefined | null) => {
  const v = value?.trim()
  return v ? v : undefined
}

const buildPreview = (body: string) =>
  body.length > 120 ? `${body.slice(0, 117)}…` : body

export type ChatSender = 'visitor' | 'manager' | 'system'

const toConversationEntity = (c: ChatConversation): ChatConversationEntity => ({
  id: c.id,
  number: buildConversationNumber(c.seq),
  projectId: c.projectId,
  widgetId: c.widgetId,
  sessionId: c.sessionId,
  status: c.status,
  visitorName: c.visitorName,
  visitorPhone: c.visitorPhone,
  visitorEmail: c.visitorEmail,
  assignedOperatorId: c.assignedOperatorId,
  channel: c.channel,
  category: c.category,
  note: c.note,
  ip: c.ip,
  userAgent: c.userAgent,
  browser: c.browser,
  os: c.os,
  deviceType: c.deviceType,
  referer: c.referer,
  country: c.country,
  region: c.region,
  city: c.city,
  timezone: c.timezone,
  firstVisitorAt: c.firstVisitorAt ? c.firstVisitorAt.toISOString() : null,
  firstManagerAt: c.firstManagerAt ? c.firstManagerAt.toISOString() : null,
  lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
  lastMessagePreview: c.lastMessagePreview,
  unreadForManager: c.unreadForManager,
  createdAt: c.createdAt.toISOString()
})

const toMessageEntity = (m: ChatMessage): ChatMessageEntity => ({
  id: m.id,
  conversationId: m.conversationId,
  sender: m.sender,
  body: m.body,
  attachmentUrl: m.attachmentUrl,
  attachmentType: m.attachmentType,
  attachmentName: m.attachmentName,
  senderUserId: m.senderUserId,
  readAt: m.readAt ? m.readAt.toISOString() : null,
  createdAt: m.createdAt.toISOString()
})

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Проверяет, что виджет CHAT активен и origin посетителя разрешён сайтом проекта.
   * Возвращает базовую инфу о виджете/проекте. Бросает Forbidden/NotFound при нарушении.
   */
  async assertVisitorAllowed(widgetId: string, originHost: string | null) {
    const id = sanitize(widgetId)
    if (!id) throw new BadRequestException('widgetId is required')

    const widget = await this.prisma.widget.findFirst({
      where: { id, type: 'CHAT', enabled: true, project: { enabled: true } },
      select: {
        id: true,
        projectId: true,
        project: { select: { websiteUrl: true, userId: true } }
      }
    })
    if (!widget) throw new NotFoundException('Widget not found')

    if (!originHost) throw new ForbiddenException('Origin is required')
    const isProd = process.env.NODE_ENV === 'production'
    if (isProd || !isDevOriginHostAllowed(originHost)) {
      const websiteHosts = extractWebsiteHosts(widget.project.websiteUrl)
      if (!websiteHosts.length || !isHostAllowedByWebsiteHosts(originHost, websiteHosts)) {
        throw new ForbiddenException('Origin is not allowed')
      }
    }

    return widget
  }

  async getOrCreateConversation(
    widgetId: string,
    sessionId: string,
    contact?: { visitorName?: string; visitorPhone?: string; visitorEmail?: string },
    meta?: VisitorMeta
  ): Promise<ChatConversation> {
    const session = sanitize(sessionId)
    if (!session) throw new BadRequestException('sessionId is required')

    const widget = await this.prisma.widget.findFirst({
      where: { id: widgetId, type: 'CHAT' },
      select: { id: true, projectId: true }
    })
    if (!widget) throw new NotFoundException('Widget not found')

    return this.prisma.chatConversation.upsert({
      where: { widgetId_sessionId: { widgetId: widget.id, sessionId: session } },
      update: {
        ...(contact?.visitorName ? { visitorName: sanitize(contact.visitorName) } : {}),
        ...(contact?.visitorPhone ? { visitorPhone: sanitize(contact.visitorPhone) } : {}),
        ...(contact?.visitorEmail ? { visitorEmail: sanitize(contact.visitorEmail) } : {})
      },
      create: {
        widget: { connect: { id: widget.id } },
        project: { connect: { id: widget.projectId } },
        sessionId: session,
        visitorName: sanitize(contact?.visitorName),
        visitorPhone: sanitize(contact?.visitorPhone),
        visitorEmail: sanitize(contact?.visitorEmail),
        // Расширенная аналитика — фиксируется при создании беседы.
        channel: 'web',
        ip: meta?.ip ?? null,
        userAgent: meta?.userAgent ?? null,
        browser: meta?.browser ?? null,
        os: meta?.os ?? null,
        deviceType: meta?.deviceType ?? null,
        referer: meta?.referer ?? null,
        country: meta?.country ?? null,
        region: meta?.region ?? null,
        city: meta?.city ?? null,
        timezone: meta?.timezone ?? null
      }
    })
  }

  /**
   * Сохраняет сообщение и обновляет денормализованные поля диалога
   * (lastMessage*, счётчик непрочитанных для противоположной стороны).
   */
  async appendMessage(args: {
    conversationId: string
    sender: ChatSender
    body: string
    senderUserId?: string
    attachmentUrl?: string | null
    attachmentType?: string | null
    attachmentName?: string | null
  }): Promise<ChatMessageEntity> {
    const body = args.body.trim()
    const attachmentUrl = sanitize(args.attachmentUrl) ?? null
    // Сообщение допустимо без текста, если есть вложение.
    if (!body && !attachmentUrl) throw new BadRequestException('Message body is required')

    const now = new Date()
    const preview = body || (attachmentUrl ? `📎 ${args.attachmentName ?? 'Вложение'}` : '')
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          conversation: { connect: { id: args.conversationId } },
          sender: args.sender,
          body,
          senderUserId: args.senderUserId ?? null,
          attachmentUrl,
          attachmentType: attachmentUrl ? args.attachmentType ?? 'file' : null,
          attachmentName: attachmentUrl ? sanitize(args.attachmentName) ?? null : null
        }
      }),
      this.prisma.chatConversation.update({
        where: { id: args.conversationId },
        data: {
          lastMessageAt: now,
          lastMessagePreview: buildPreview(preview),
          status: 'open',
          ...(args.sender === 'visitor'
            ? { unreadForManager: { increment: 1 } }
            : args.sender === 'manager'
              ? { unreadForVisitor: { increment: 1 } }
              : {})
        }
      })
    ])

    // Денормализация времени реакции: первый визитор/первый ответ менеджера (ставим один раз).
    if (args.sender === 'visitor') {
      await this.prisma.chatConversation.updateMany({
        where: { id: args.conversationId, firstVisitorAt: null },
        data: { firstVisitorAt: now }
      })
    } else if (args.sender === 'manager') {
      await this.prisma.chatConversation.updateMany({
        where: { id: args.conversationId, firstManagerAt: null },
        data: { firstManagerAt: now }
      })
    }

    return toMessageEntity(message)
  }

  /**
   * Where-фильтр диалогов по «актору»: владелец — все его проекты; оператор со scope — его чат;
   * оператор без scope — все чаты владельца.
   */
  private actorWhere(actor: ChatActor) {
    if (actor.kind === 'owner') return { project: { userId: actor.userId } }
    if (actor.widgetId) return { widgetId: actor.widgetId }
    return { project: { userId: actor.ownerUserId } }
  }

  async listConversations(actor: ChatActor, query: ListConversationsDto) {
    const period = query.period ?? '30d'
    const take = query.take ?? 50
    const skip = query.skip ?? 0

    const createdAtFilter = (() => {
      if (period === 'all') return undefined
      if (period === '7d') return { gte: subDays(new Date(), 7) }
      if (period === '90d') return { gte: subDays(new Date(), 90) }
      return { gte: subDays(new Date(), 30) }
    })()

    const where = {
      ...this.actorWhere(actor),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {})
    }

    const [items, total] = await Promise.all([
      this.prisma.chatConversation.findMany({
        where,
        orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      this.prisma.chatConversation.count({ where })
    ])

    return { conversations: items.map(toConversationEntity), total }
  }

  /** Проверяет, что диалог доступен актору (владельцу/оператору в его scope); возвращает его. */
  async assertManagerOwns(actor: ChatActor, conversationId: string): Promise<ChatConversation> {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, ...this.actorWhere(actor) }
    })
    if (!conversation) throw new NotFoundException('Conversation not found')
    return conversation
  }

  async getMessagesForManager(
    actor: ChatActor,
    conversationId: string
  ): Promise<ChatMessagesResponse> {
    await this.assertManagerOwns(actor, conversationId)
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })
    return { conversationId, messages: messages.map(toMessageEntity) }
  }

  async getMessagesForVisitor(
    conversationId: string,
    sessionId: string
  ): Promise<ChatMessagesResponse> {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, sessionId: sanitize(sessionId) },
      select: { id: true }
    })
    if (!conversation) throw new NotFoundException('Conversation not found')
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })
    return { conversationId, messages: messages.map(toMessageEntity) }
  }

  async updateStatus(actor: ChatActor, conversationId: string, status: 'open' | 'closed') {
    await this.assertManagerOwns(actor, conversationId)
    const updated = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status }
    })
    return toConversationEntity(updated)
  }

  /**
   * Обновление полей диалога модулем Чат: статус, назначенный оператор, категория, заметка, канал.
   * Передаются только заданные поля. assignedOperatorId валидируется по принадлежности проекту.
   */
  async updateConversation(
    actor: ChatActor,
    conversationId: string,
    dto: {
      status?: 'open' | 'closed'
      assignedOperatorId?: string | null
      category?: string | null
      note?: string | null
      channel?: string | null
    }
  ) {
    const conversation = await this.assertManagerOwns(actor, conversationId)

    if (dto.assignedOperatorId) {
      const operator = await this.prisma.chatOperator.findFirst({
        where: { id: dto.assignedOperatorId, projectId: conversation.projectId },
        select: { id: true }
      })
      if (!operator) throw new BadRequestException('Operator not found in project')
    }

    const updated = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.assignedOperatorId !== undefined ? { assignedOperatorId: dto.assignedOperatorId } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(dto.channel !== undefined ? { channel: dto.channel } : {})
      }
    })
    return toConversationEntity(updated)
  }

  async markReadByManager(conversationId: string) {
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { unreadForManager: 0 }
    })
    await this.prisma.chatMessage.updateMany({
      where: { conversationId, sender: 'visitor', readAt: null },
      data: { readAt: new Date() }
    })
  }

  async markReadByVisitor(conversationId: string) {
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { unreadForVisitor: 0 }
    })
    await this.prisma.chatMessage.updateMany({
      where: { conversationId, sender: 'manager', readAt: null },
      data: { readAt: new Date() }
    })
  }

  /** Список projectId, которыми владеет пользователь — для presence по проектам. */
  async getOwnedProjectIds(userId: string): Promise<string[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      select: { id: true }
    })
    return projects.map(p => p.id)
  }

  /** projectId(ы), доступные оператору (presence/комнаты): его чат или все чаты владельца. */
  async getOperatorProjectIds(ownerUserId: string, widgetId: string | null): Promise<string[]> {
    if (widgetId) {
      const w = await this.prisma.widget.findUnique({
        where: { id: widgetId },
        select: { projectId: true }
      })
      return w ? [w.projectId] : []
    }
    return this.getOwnedProjectIds(ownerUserId)
  }

  toConversationEntity = toConversationEntity
}
