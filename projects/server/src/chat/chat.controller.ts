import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ListConversationsDto } from './dto/list-conversations.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import {
  ChatConversationEntity,
  ChatConversationsResponse,
  ChatMessagesResponse
} from './entities/chat-conversation.entity'
import { ChatMessageEntity } from './entities/chat-message.entity'

@ApiTags('chat')
@Controller('chat')
@Auth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway
  ) {}

  @Get('conversations')
  @ApiResponse({ status: 200, type: ChatConversationsResponse })
  list(
    @CurrentUser('id') userId: string,
    @Query() query: ListConversationsDto
  ): Promise<ChatConversationsResponse> {
    return this.chat.listConversations(userId, query)
  }

  @Get('conversations/:id/messages')
  @ApiResponse({ status: 200, type: ChatMessagesResponse })
  messages(
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ): Promise<ChatMessagesResponse> {
    return this.chat.getMessagesForManager(userId, id)
  }

  @Patch('conversations/:id')
  @ApiResponse({ status: 200, type: ChatConversationEntity })
  updateConversation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto
  ): Promise<ChatConversationEntity> {
    return this.chat.updateConversation(userId, id, dto)
  }

  @Post('conversations/:id/messages')
  @ApiResponse({ status: 201, type: ChatMessageEntity })
  async reply(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto
  ): Promise<ChatMessageEntity> {
    const conversation = await this.chat.assertManagerOwns(userId, id)
    const message = await this.chat.appendMessage({
      conversationId: id,
      sender: 'manager',
      body: dto.body,
      senderUserId: userId,
      attachmentUrl: dto.attachmentUrl ?? null,
      attachmentType: dto.attachmentType ?? null,
      attachmentName: dto.attachmentName ?? null
    })
    // Доставляем в реальном времени (REST как надёжный фолбэк к socket).
    this.gateway.broadcastMessage(conversation, message)
    return message
  }
}
