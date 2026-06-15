import { ApiProperty } from '@nestjs/swagger'

export class MessageAttachment {
  @ApiProperty()
  url!: string

  @ApiProperty({ enum: ['image', 'video', 'file'] })
  type!: 'image' | 'video' | 'file'

  @ApiProperty({ required: false })
  name?: string
}

export class ChatMessageEntity {
  @ApiProperty()
  id!: string

  @ApiProperty()
  conversationId!: string

  @ApiProperty({ enum: ['visitor', 'manager', 'system'] })
  sender!: 'visitor' | 'manager' | 'system'

  @ApiProperty()
  body!: string

  @ApiProperty({ required: false, nullable: true })
  attachmentUrl?: string | null

  @ApiProperty({ required: false, nullable: true })
  attachmentType?: string | null

  @ApiProperty({ required: false, nullable: true })
  attachmentName?: string | null

  @ApiProperty({ type: [MessageAttachment], required: false, nullable: true })
  attachments?: MessageAttachment[] | null

  @ApiProperty({ required: false, nullable: true })
  senderUserId?: string | null

  // Ответ сгенерирован ИИ-агентом. Пометку видит ТОЛЬКО оператор — посетителю не отдаём
  // (см. toMessageEntityForVisitor в chat.service.ts).
  @ApiProperty({ required: false, description: 'Ответ сгенерирован ИИ-агентом (только для оператора)' })
  aiGenerated?: boolean

  @ApiProperty({ required: false, nullable: true })
  readAt?: string | null

  @ApiProperty()
  createdAt!: string
}
