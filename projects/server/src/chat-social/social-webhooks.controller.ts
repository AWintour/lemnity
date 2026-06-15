import { Body, Controller, Headers, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ChatSocialService } from './chat-social.service'
import { ChatService } from '../chat/chat.service'
import { ChatGateway } from '../chat/chat.gateway'
import { getAdapter, isSocialType, type SocialType } from './adapters'

/**
 * Публичные вебхуки соцсетей (Telegram/MAX/VK) — без @Auth. Аутентичность: секрет в пути
 * (+ TG заголовок, + VK поле `secret`). Всегда быстрый ответ (как Mango). Входящее →
 * getOrCreateExternalConversation → appendMessage(visitor) → broadcastMessage (live в модуле).
 */
@ApiTags('public-chat')
@Controller('public/chat/webhooks')
export class SocialWebhooksController {
  constructor(
    private readonly social: ChatSocialService,
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway
  ) {}

  @Post(':type/:secret')
  async receive(
    @Param('type') typeParam: string,
    @Param('secret') secret: string,
    @Body() body: unknown,
    @Headers('x-telegram-bot-api-secret-token') tgSecret?: string
  ): Promise<unknown> {
    if (!isSocialType(typeParam)) return { ok: true }
    const type: SocialType = typeParam

    const resolved = await this.social.resolveByWebhookSecret(type, secret)
    if (!resolved) return { ok: true } // неизвестный секрет — мягко игнорируем

    // VK: подтверждение сервера и валидация secret из тела.
    if (type === 'vk') {
      const vk = body as { type?: string; secret?: string }
      if (vk?.type === 'confirmation') return resolved.config.vkConfirmation ?? 'ok'
      if (vk?.secret && vk.secret !== secret) return 'ok'
    }
    // Telegram: проверка заголовка-секрета (если прислан).
    if (type === 'telegram' && tgSecret && tgSecret !== secret) return { ok: true }

    try {
      const inbound = getAdapter(type).parseInbound(body)
      if (inbound) {
        const conv = await this.chat.getOrCreateExternalConversation({
          projectId: resolved.projectId,
          channel: type,
          externalUserId: inbound.externalUserId,
          externalChatId: inbound.externalChatId,
          displayName: inbound.displayName
        })
        const message = await this.chat.appendMessage({
          conversationId: conv.id,
          sender: 'visitor',
          body: inbound.text,
          attachments: inbound.attachments.length ? inbound.attachments : null
        })
        this.gateway.broadcastMessage({ id: conv.id, projectId: conv.projectId }, message)
      }
    } catch (e) {
      console.error('[chat-social] inbound failed', e instanceof Error ? e.message : e)
    }

    return type === 'vk' ? 'ok' : { ok: true }
  }
}
