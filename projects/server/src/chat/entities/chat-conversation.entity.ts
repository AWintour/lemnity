import { ApiProperty } from '@nestjs/swagger'
import { ChatMessageEntity } from './chat-message.entity'

export class ChatConversationEntity {
  @ApiProperty()
  id!: string

  @ApiProperty({ description: 'Человекочитаемый номер диалога' })
  number!: string

  @ApiProperty()
  projectId!: string

  @ApiProperty()
  widgetId!: string

  @ApiProperty()
  sessionId!: string

  @ApiProperty({ enum: ['open', 'closed'] })
  status!: 'open' | 'closed'

  @ApiProperty({ required: false, nullable: true })
  visitorName?: string | null

  @ApiProperty({ required: false, nullable: true })
  visitorPhone?: string | null

  @ApiProperty({ required: false, nullable: true })
  visitorEmail?: string | null

  @ApiProperty({ required: false, nullable: true, description: 'Назначенный оператор (ChatOperator.id)' })
  assignedOperatorId?: string | null

  @ApiProperty({ required: false, nullable: true, description: 'Канал: web|telegram|vk|max' })
  channel?: string | null

  @ApiProperty({ required: false, nullable: true, description: 'Категория-статус беседы' })
  category?: string | null

  @ApiProperty({ required: false, nullable: true, description: 'Внутренняя заметка оператора' })
  note?: string | null

  // Расширенная аналитика посетителя.
  @ApiProperty({ required: false, nullable: true })
  ip?: string | null

  @ApiProperty({ required: false, nullable: true })
  userAgent?: string | null

  @ApiProperty({ required: false, nullable: true })
  browser?: string | null

  @ApiProperty({ required: false, nullable: true })
  os?: string | null

  @ApiProperty({ required: false, nullable: true })
  deviceType?: string | null

  @ApiProperty({ required: false, nullable: true })
  referer?: string | null

  @ApiProperty({ required: false, nullable: true })
  country?: string | null

  @ApiProperty({ required: false, nullable: true })
  region?: string | null

  @ApiProperty({ required: false, nullable: true })
  city?: string | null

  @ApiProperty({ required: false, nullable: true })
  timezone?: string | null

  @ApiProperty({ required: false, nullable: true })
  firstVisitorAt?: string | null

  @ApiProperty({ required: false, nullable: true })
  firstManagerAt?: string | null

  @ApiProperty({ required: false, nullable: true })
  lastMessageAt?: string | null

  @ApiProperty({ required: false, nullable: true })
  lastMessagePreview?: string | null

  @ApiProperty()
  unreadForManager!: number

  @ApiProperty()
  createdAt!: string
}

export class ChatConversationsResponse {
  @ApiProperty({ type: [ChatConversationEntity] })
  conversations!: ChatConversationEntity[]

  @ApiProperty()
  total!: number
}

export class ChatMessagesResponse {
  @ApiProperty()
  conversationId!: string

  @ApiProperty({ type: [ChatMessageEntity] })
  messages!: ChatMessageEntity[]
}
