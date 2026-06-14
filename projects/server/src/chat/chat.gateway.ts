import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'
import { ChatOperatorService } from '../chat-operator/chat-operator.service'
import type { ChatActor } from './chat-actor.guard'
import type { ChatMessageEntity } from './entities/chat-message.entity'
import { extractOriginHostFromHeaders } from '../common/origin'
import { buildVisitorMeta, extractHandshakeRawMeta } from '../common/visitor-meta'

type VisitorData = {
  role: 'visitor'
  conversationId: string
  projectId: string
  widgetId: string
  sessionId: string
}

// Персонал чата: владелец (manager) или оператор. actor задаёт scope доступа к диалогам;
// projectIds — комнаты presence (проекты, к которым он подключён).
type StaffData = {
  role: 'manager' | 'operator'
  actor: ChatActor
  projectIds: string[]
}

type SocketData = VisitorData | StaffData

const convRoom = (conversationId: string) => `conv:${conversationId}`
const projVisitorsRoom = (projectId: string) => `proj-visitors:${projectId}`
const projManagersRoom = (projectId: string) => `proj-managers:${projectId}`

@WebSocketGateway({
  namespace: '/chat',
  // Origin сайтов-клиентов заранее неизвестен; реальная авторизация — в handleConnection
  // по widgetId + project.websiteUrl. CORS здесь разрешающий (как `/api/public`).
  cors: { origin: '*', credentials: false }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(ChatGateway.name)
  // projectId -> множество socketId подключённых менеджеров (presence).
  private readonly onlineManagers = new Map<string, Set<string>>()

  constructor(
    private readonly chat: ChatService,
    private readonly operators: ChatOperatorService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async handleConnection(client: Socket) {
    const auth = (client.handshake.auth ?? {}) as Record<string, unknown>
    const role = auth.role

    try {
      if (role === 'visitor') {
        await this.connectVisitor(client, auth)
      } else if (role === 'manager') {
        await this.connectManager(client, auth)
      } else if (role === 'operator') {
        await this.connectOperator(client, auth)
      } else {
        client.emit('chat:error', { message: 'Unknown role' })
        client.disconnect(true)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Connection rejected'
      client.emit('chat:error', { message })
      client.disconnect(true)
    }
  }

  private async connectVisitor(client: Socket, auth: Record<string, unknown>) {
    const widgetId = typeof auth.widgetId === 'string' ? auth.widgetId : ''
    const sessionId = typeof auth.sessionId === 'string' ? auth.sessionId : ''
    const originHost = extractOriginHostFromHeaders(client.handshake.headers)

    await this.chat.assertVisitorAllowed(widgetId, originHost)
    const conversation = await this.chat.getOrCreateConversation(
      widgetId,
      sessionId,
      undefined,
      buildVisitorMeta(extractHandshakeRawMeta(client.handshake))
    )

    const data: VisitorData = {
      role: 'visitor',
      conversationId: conversation.id,
      projectId: conversation.projectId,
      widgetId: conversation.widgetId,
      sessionId: conversation.sessionId
    }
    client.data = data

    await client.join(convRoom(conversation.id))
    await client.join(projVisitorsRoom(conversation.projectId))

    client.emit('conversation:ready', { conversationId: conversation.id })
    client.emit('operator:presence', {
      online: (this.onlineManagers.get(conversation.projectId)?.size ?? 0) > 0
    })
  }

  private async connectManager(client: Socket, auth: Record<string, unknown>) {
    const token = typeof auth.token === 'string' ? auth.token : ''
    if (!token) throw new Error('Token is required')

    const secret = this.config.get<string>('JWT_SECRET')
    const payload = await this.jwt.verifyAsync<{ id: string }>(token, { secret })
    const userId = payload.id
    if (!userId) throw new Error('Invalid token')

    const projectIds = await this.chat.getOwnedProjectIds(userId)
    const data: StaffData = { role: 'manager', actor: { kind: 'owner', userId }, projectIds }
    client.data = data
    this.joinStaffRooms(client, projectIds)
  }

  // Оператор: операторский JWT { sub, typ:'operator' }. scope → проекты для presence/комнат.
  private async connectOperator(client: Socket, auth: Record<string, unknown>) {
    const token = typeof auth.token === 'string' ? auth.token : ''
    if (!token) throw new Error('Token is required')

    const secret = this.config.get<string>('JWT_SECRET')
    const payload = await this.jwt.verifyAsync<{ sub?: string; typ?: string }>(token, { secret })
    if (payload.typ !== 'operator' || !payload.sub) throw new Error('Invalid token')

    const op = await this.operators.getActiveActor(payload.sub)
    if (!op) throw new Error('Operator is inactive')

    const projectIds = await this.chat.getOperatorProjectIds(op.ownerUserId, op.widgetId)
    const data: StaffData = {
      role: 'operator',
      actor: { kind: 'operator', operatorId: op.id, ownerUserId: op.ownerUserId, widgetId: op.widgetId },
      projectIds
    }
    client.data = data
    this.joinStaffRooms(client, projectIds)
  }

  // Присоединяет персонал к комнатам менеджеров проектов + presence (виджет видит «оператор онлайн»).
  private joinStaffRooms(client: Socket, projectIds: string[]) {
    for (const projectId of projectIds) {
      void client.join(projManagersRoom(projectId))
      const set = this.onlineManagers.get(projectId) ?? new Set<string>()
      const wasOnline = set.size > 0
      set.add(client.id)
      this.onlineManagers.set(projectId, set)
      if (!wasOnline) {
        this.server.to(projVisitorsRoom(projectId)).emit('operator:presence', { online: true })
      }
    }
  }

  handleDisconnect(client: Socket) {
    const data = client.data as SocketData | undefined
    if (!data || data.role === 'visitor') return

    for (const projectId of data.projectIds) {
      const set = this.onlineManagers.get(projectId)
      if (!set) continue
      set.delete(client.id)
      if (set.size === 0) {
        this.onlineManagers.delete(projectId)
        this.server.to(projVisitorsRoom(projectId)).emit('operator:presence', { online: false })
      }
    }
  }

  /** Доставка сообщения в комнату диалога + апдейт списка диалогов у менеджеров проекта. */
  broadcastMessage(
    conversation: { id: string; projectId: string },
    message: ChatMessageEntity
  ) {
    this.server.to(convRoom(conversation.id)).emit('message:new', message)
    this.server
      .to(projManagersRoom(conversation.projectId))
      .emit('conversation:updated', { conversationId: conversation.id })
  }

  /** Диалог закрыт оператором — уведомляем посетителя (виджет покажет «Оператор завершил беседу»). */
  notifyClosed(conversation: { id: string; projectId: string }) {
    this.server
      .to(convRoom(conversation.id))
      .emit('conversation:closed', { conversationId: conversation.id, by: 'operator' })
    this.server
      .to(projManagersRoom(conversation.projectId))
      .emit('conversation:updated', { conversationId: conversation.id })
  }

  @SubscribeMessage('message:send')
  async onMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId?: string
      body?: string
      attachmentUrl?: string
      attachmentType?: 'image' | 'video' | 'file'
      attachmentName?: string
      attachments?: { url: string; type: 'image' | 'video' | 'file'; name?: string }[]
    }
  ) {
    const data = client.data as SocketData | undefined
    const body = typeof payload?.body === 'string' ? payload.body : ''
    const attachmentUrl =
      typeof payload?.attachmentUrl === 'string' ? payload.attachmentUrl : undefined
    const attachments = Array.isArray(payload?.attachments)
      ? payload.attachments.filter(a => a && typeof a.url === 'string').slice(0, 10)
      : undefined
    // Допускаем сообщение только с вложением(ями) (без текста).
    if (!data || (!body.trim() && !attachmentUrl && !attachments?.length)) return

    if (data.role === 'visitor') {
      const message = await this.chat.appendMessage({
        conversationId: data.conversationId,
        sender: 'visitor',
        body,
        attachmentUrl,
        attachmentType: payload?.attachmentType,
        attachmentName: payload?.attachmentName
      })
      this.broadcastMessage(
        { id: data.conversationId, projectId: data.projectId },
        message
      )
      return message
    }

    // персонал (владелец/оператор) — доступ по actor scope
    const conversationId = typeof payload?.conversationId === 'string' ? payload.conversationId : ''
    if (!conversationId) return
    const conversation = await this.chat.assertManagerOwns(data.actor, conversationId)
    await client.join(convRoom(conversationId))
    const message = await this.chat.appendMessage({
      conversationId,
      sender: 'manager',
      body,
      senderUserId: data.actor.kind === 'owner' ? data.actor.userId : undefined,
      attachmentUrl,
      attachmentType: payload?.attachmentType,
      attachmentName: payload?.attachmentName,
      attachments
    })
    this.broadcastMessage(conversation, message)
    return message
  }

  @SubscribeMessage('conversation:subscribe')
  async onSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId?: string }
  ) {
    const data = client.data as SocketData | undefined
    const conversationId = typeof payload?.conversationId === 'string' ? payload.conversationId : ''
    if (!data || data.role === 'visitor' || !conversationId) return
    await this.chat.assertManagerOwns(data.actor, conversationId)
    await client.join(convRoom(conversationId))
    return { ok: true }
  }

  @SubscribeMessage('conversation:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId?: string }
  ) {
    const data = client.data as SocketData | undefined
    if (!data) return

    if (data.role === 'visitor') {
      await this.chat.markReadByVisitor(data.conversationId)
      return
    }

    const conversationId = typeof payload?.conversationId === 'string' ? payload.conversationId : ''
    if (!conversationId) return
    const conversation = await this.chat.assertManagerOwns(data.actor, conversationId)
    await this.chat.markReadByManager(conversationId)
    this.server
      .to(projManagersRoom(conversation.projectId))
      .emit('conversation:updated', { conversationId })
  }
}
