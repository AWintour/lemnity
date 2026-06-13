import { ApiProperty } from '@nestjs/swagger'

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
  senderUserId?: string | null

  @ApiProperty({ required: false, nullable: true })
  readAt?: string | null

  @ApiProperty()
  createdAt!: string
}
