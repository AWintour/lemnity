import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { createHmac } from 'node:crypto'
import axios from 'axios'
import type { User } from '@lemnity/database'

const MAX_TEXT_LENGTH = 2000

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name)
  // Куда форвардим фидбэк (эндпоинт приёма в lmntai) и каким секретом подписываем.
  private readonly url = process.env.LMNTAI_FEEDBACK_URL
  private readonly secret = process.env.FEEDBACK_INGEST_SECRET

  /**
   * Принимает текст идеи/замечания, добавляет данные текущего пользователя и
   * форвардит в lmntai HTTP-запросом с HMAC-подписью (заголовок
   * x-lemnity-signature = hmac-sha256(secret, rawBody)). В БД lemnity не храним.
   */
  async submit(text: string, user: User): Promise<{ ok: true }> {
    const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH)
    if (!trimmed) {
      throw new HttpException(
        { message: 'Текст обращения пуст' },
        HttpStatus.BAD_REQUEST
      )
    }

    if (!this.url || !this.secret) {
      this.logger.error(
        'LMNTAI_FEEDBACK_URL / FEEDBACK_INGEST_SECRET не заданы — канал обратной связи не настроен'
      )
      throw new HttpException(
        { message: 'Канал обратной связи временно недоступен' },
        HttpStatus.SERVICE_UNAVAILABLE
      )
    }

    const payload = {
      text: trimmed,
      user: {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null
      },
      source: 'widgets-dashboard',
      createdAt: new Date().toISOString()
    }
    // Подпись считается по точным байтам тела — отправляем именно эту строку,
    // чтобы re-сериализация на стороне lmntai не ломала проверку HMAC.
    const rawBody = JSON.stringify(payload)
    const signature = createHmac('sha256', this.secret)
      .update(rawBody)
      .digest('hex')

    try {
      await axios.post(this.url, rawBody, {
        headers: {
          'Content-Type': 'application/json',
          'x-lemnity-signature': signature
        },
        timeout: 10_000
      })
      return { ok: true }
    } catch (error) {
      this.logger.error(`Не удалось доставить фидбэк в lmntai: ${error}`)
      throw new HttpException(
        { message: 'Не удалось отправить, попробуйте позже' },
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}
