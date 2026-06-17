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
import { ChatSubscriptionService } from '../lemnity/chat-subscription.service'
import { chatPlanFeatures } from '../lemnity/chat-entitlement'
import { ChatSubscriptionEntity } from './entities/chat-subscription.entity'
import { ChatGateway } from './chat.gateway'
import { PushService } from './push.service'
import { PushSubscribeDto, PushUnsubscribeDto } from './dto/push-subscribe.dto'
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
    private readonly chatSub: ChatSubscriptionService,
    private readonly gateway: ChatGateway,
    private readonly push: PushService
  ) {}

  // Публичный VAPID-ключ для подписки на web-push в кабинете (null — push не настроен на сервере).
  @Get('push/public-key')
  publicKey(): { publicKey: string | null } {
    return { publicKey: this.push.getPublicKey() }
  }

  // Подписать текущего сотрудника (владелец/оператор) на push-уведомления о новых сообщениях.
  @Post('push/subscribe')
  async pushSubscribe(
    @ChatActorParam() actor: ChatActor,
    @Body() dto: PushSubscribeDto
  ): Promise<{ ok: true }> {
    await this.push.saveSubscription(actor, dto.projectId, {
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent: dto.userAgent
    })
    return { ok: true }
  }

  // Отписать устройство (выключили уведомления / разлогин).
  @Post('push/unsubscribe')
  async pushUnsubscribe(@Body() dto: PushUnsubscribeDto): Promise<{ ok: true }> {
    await this.push.deleteSubscription(dto.endpoint)
    return { ok: true }
  }

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

  // Тариф (entitlement) аккаунта-владельца чат-виджета — для раздела тарифов в редакторе.
  @Get('subscription')
  @ApiResponse({ status: 200, type: ChatSubscriptionEntity })
  async subscription(
    @ChatActorParam() actor: ChatActor,
    @Query('widgetId') widgetId: string
  ): Promise<ChatSubscriptionEntity> {
    if (!widgetId) throw new BadRequestException('widgetId is required')
    await this.chat.assertActorOwnsWidget(actor, widgetId)
    const ownerUserId = actor.kind === 'owner' ? actor.userId : actor.ownerUserId
    const ent = await this.chatSub.getActiveEntitlementByUserId(ownerUserId)
    return {
      planTier: ent.planTier,
      managerLimit: ent.managerLimit,
      siteLimit: ent.siteLimit,
      aiDailyLimit: ent.aiDailyLimit,
      paidUntil: ent.paidUntil ? ent.paidUntil.toISOString() : null,
      features: chatPlanFeatures(ent.planTier)
    }
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
