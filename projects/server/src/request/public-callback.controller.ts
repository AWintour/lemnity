import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import type { Request } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { CallbackService } from './callback.service'
import { CreatePublicRequestDto } from './dto/create-public-request.dto'
import { extractRequestOriginHost } from '../common/origin'

/**
 * Публичный приём заявки на обратный звонок: создаёт лид + планирует звонок через Mango.
 * Тот же DTO/origin-паттерн, что `POST /api/public/requests`. Возвращает `{ delaySeconds }`,
 * чтобы виджет показал обратный отсчёт. См. plan-wid-call.md, Фаза 2.
 */
@ApiTags('public-callback')
@Controller('public/callback')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PublicCallbackController {
  constructor(private readonly callback: CallbackService) {}

  @Post()
  async create(@Body() body: CreatePublicRequestDto, @Req() req: Request): Promise<{ delaySeconds: number }> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      ''

    try {
      return await this.callback.createCallback(body, {
        ip,
        userAgent: req.headers['user-agent'],
        originHost: extractRequestOriginHost(req)
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      throw new InternalServerErrorException('Failed to create callback')
    }
  }
}
