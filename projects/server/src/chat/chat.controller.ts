import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { AiAgentService } from './ai-agent.service'
import { ChatGateway } from './chat.gateway'
import { ChatActorGuard, ChatActorParam, type ChatActor } from './chat-actor.guard'
import { ListConversationsDto } from './dto/list-conversations.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import {
  ChatConversationEntity,
  ChatConversationsResponse,
  ChatMessagesResponse
} from './entities/chat-conversation.entity'
import { ChatMessageEntity } from './entities/chat-message.entity'
import { AiUsageEntity } from './entities/ai-usage.entity'
import { AiPagesResponse } from './entities/ai-pages.entity'

@ApiTags('chat')
@Controller('chat')
// Принимает owner-токен (владелец) ИЛИ операторский токен; actor проставляется guard'ом.
@UseGuards(ChatActorGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly ai: AiAgentService,
    private readonly gateway: ChatGateway
  ) {}

  // Статистика месячной квоты ИИ-агента по чат-виджету (для раздела «Ассистент»).
  @Get('ai-usage')
  @ApiResponse({ status: 200, type: AiUsageEntity })
  async aiUsage(
    @ChatActorParam() actor: ChatActor,
    @Query('widgetId') widgetId: string
  ): Promise<AiUsageEntity> {
    if (!widgetId) throw new BadRequestException('widgetId is required')
    await this.chat.assertActorOwnsWidget(actor, widgetId)
    return this.ai.getUsage(widgetId)
  }

  // Список внутренних страниц сайта проекта — для выбора в «Разделы для изучения».
  @Get('ai-pages')
  @ApiResponse({ status: 200, type: AiPagesResponse })
  async aiPages(
    @ChatActorParam() actor: ChatActor,
    @Query('widgetId') widgetId: string
  ): Promise<AiPagesResponse> {
    if (!widgetId) throw new BadRequestException('widgetId is required')
    await this.chat.assertActorOwnsWidget(actor, widgetId)
    const pages = await this.ai.discoverPages(widgetId)
    return { pages }
  }

  @Get('conversations')
  @ApiResponse({ status: 200, type: ChatConversationsResponse })
  list(
    @ChatActorParam() actor: ChatActor,
    @Query() query: ListConversationsDto
  ): Promise<ChatConversationsResponse> {
    return this.chat.listConversations(actor, query)
  }

  @Get('conversations/:id/messages')
  @ApiResponse({ status: 200, type: ChatMessagesResponse })
  messages(
    @ChatActorParam() actor: ChatActor,
    @Param('id') id: string
  ): Promise<ChatMessagesResponse> {
    return this.chat.getMessagesForManager(actor, id)
  }

  @Patch('conversations/:id')
  @ApiResponse({ status: 200, type: ChatConversationEntity })
  async updateConversation(
    @ChatActorParam() actor: ChatActor,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto
  ): Promise<ChatConversationEntity> {
    const updated = await this.chat.updateConversation(actor, id, dto)
    // Закрытие оператором → уведомляем посетителя (виджет покажет «Оператор завершил беседу»).
    if (dto.status === 'closed') {
      this.gateway.notifyClosed({ id: updated.id, projectId: updated.projectId })
    }
    return updated
  }

  @Post('conversations/:id/messages')
  @ApiResponse({ status: 201, type: ChatMessageEntity })
  async reply(
    @ChatActorParam() actor: ChatActor,
    @Param('id') id: string,
    @Body() dto: SendMessageDto
  ): Promise<ChatMessageEntity> {
    const conversation = await this.chat.assertManagerOwns(actor, id)
    const message = await this.chat.appendMessage({
      conversationId: id,
      sender: 'manager',
      body: dto.body,
      // У оператора нет userId — денормализованного автора не пишем.
      senderUserId: actor.kind === 'owner' ? actor.userId : undefined,
      attachmentUrl: dto.attachmentUrl ?? null,
      attachmentType: dto.attachmentType ?? null,
      attachmentName: dto.attachmentName ?? null,
      attachments: dto.attachments ?? null
    })
    // Доставляем в реальном времени (REST как надёжный фолбэк к socket).
    this.gateway.broadcastMessage(conversation, message)
    return message
  }
}
