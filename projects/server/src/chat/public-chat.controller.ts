import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import * as path from 'path'
import type { Request } from 'express'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { S3Service } from '../storage/s3.service'
import { CreatePublicConversationDto } from './dto/create-public-conversation.dto'
import {
  ChatConversationEntity,
  ChatMessagesResponse
} from './entities/chat-conversation.entity'
import { extractRequestOriginHost } from '../common/origin'
import { buildVisitorMeta, extractRequestRawMeta } from '../common/visitor-meta'

// Лимит вложения посетителя (синхронно с MAX_FILE_SIZE_BYTES в files.controller и клиентом).
const MAX_PUBLIC_UPLOAD_BYTES = 5 * 1024 * 1024

/**
 * Публичный вход для виджета чата на сайте клиента. Создаёт/возвращает диалог и историю.
 * Origin проверяется по project.websiteUrl (как в RequestService.createPublic). Realtime —
 * через socket.io namespace `/chat`; этот REST даёт первичную загрузку и фолбэк.
 */
@ApiTags('public-chat')
@Controller('public/chat')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PublicChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly s3: S3Service
  ) {}

  private sanitizeFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase()
    const base = path.basename(originalName, ext)
    const safeBase = base.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
    const safeExt = ext.replace(/[^a-z0-9.]/g, '')
    return `${safeBase}${safeExt}`
  }

  // Публичная загрузка вложения посетителя (картинка/файл) — без авторизации, но с проверкой
  // origin по widgetId (как остальные публичные эндпоинты чата). Кладём в S3 под префиксом
  // диалогов виджета; возвращаем постоянный URL для message:send (socket).
  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_PUBLIC_UPLOAD_BYTES }
    })
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Query('widgetId') widgetId: string,
    @Req() req: Request
  ): Promise<{ key: string; url: string; contentType: string; name: string }> {
    if (!widgetId) throw new BadRequestException('widgetId is required')
    if (!file) throw new BadRequestException('File is required')
    // Проверка, что виджет существует и origin разрешён (бросит, если нет).
    await this.chat.assertVisitorAllowed(widgetId, extractRequestOriginHost(req))

    const bucket = process.env.S3_BUCKET_UPLOADS
    if (!bucket) {
      throw new InternalServerErrorException('S3_BUCKET_UPLOADS is not configured on server')
    }
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `chat/${widgetId}/${yyyy}/${mm}`
    const key = `${randomUUID()}-${this.sanitizeFileName(file.originalname)}`
    await this.s3.putObject({
      bucket,
      key,
      prefix,
      body: file.buffer,
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000, immutable'
    })
    const fullKey = `${prefix}/${key}`
    return {
      key: fullKey,
      url: this.s3.getPublicUrlForKey(fullKey),
      contentType: file.mimetype,
      name: file.originalname
    }
  }

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
        },
        buildVisitorMeta(extractRequestRawMeta(req))
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

  // Операторы проекта для шапки виджета (имя/роль/аватар/онлайн).
  @Get('operators')
  operators(@Query('widgetId') widgetId: string, @Req() req: Request) {
    return this.chat.listPublicOperators(widgetId ?? '', extractRequestOriginHost(req))
  }
}
