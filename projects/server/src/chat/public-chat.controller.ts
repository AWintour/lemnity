import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import type { Request } from 'express'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { CreatePublicConversationDto } from './dto/create-public-conversation.dto'
import {
  ChatConversationEntity,
  ChatMessagesResponse
} from './entities/chat-conversation.entity'
import { extractRequestOriginHost } from '../common/origin'

/**
 * Публичный вход для виджета чата на сайте клиента. Создаёт/возвращает диалог и историю.
 * Origin проверяется по project.websiteUrl (как в RequestService.createPublic). Realtime —
 * через socket.io namespace `/chat`; этот REST даёт первичную загрузку и фолбэк.
 */
@ApiTags('public-chat')
@Controller('public/chat')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PublicChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('conversations')
  @ApiResponse({ status: 201, type: ChatConversationEntity })
  async createConversation(
    @Body() body: CreatePublicConversationDto,
    @Req() req: Request
  ): Promise<ChatConversationEntity> {
    try {
      await this.chat.assertVisitorAllowed(body.widgetId, extractRequestOriginHost(req))
      const conversation = await this.chat.getOrCreateConversation(
        body.widgetId,
        body.sessionId,
        {
          visitorName: body.visitorName,
          visitorPhone: body.visitorPhone,
          visitorEmail: body.visitorEmail
        }
      )
      return this.chat.toConversationEntity(conversation)
    } catch (e) {
      if (e instanceof HttpException) throw e
      throw new InternalServerErrorException('Failed to create conversation')
    }
  }

  @Get('conversations/:id/messages')
  @ApiResponse({ status: 200, type: ChatMessagesResponse })
  messages(
    @Param('id') id: string,
    @Query('sessionId') sessionId: string
  ): Promise<ChatMessagesResponse> {
    return this.chat.getMessagesForVisitor(id, sessionId ?? '')
  }
}
