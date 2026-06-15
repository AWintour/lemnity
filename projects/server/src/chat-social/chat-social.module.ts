import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatSocialService } from './chat-social.service'
import { ChatSocialController } from './chat-social.controller'
import { SocialWebhooksController } from './social-webhooks.controller'
import { AuthModule } from '../auth/auth.module'
import { ChatModule } from '../chat/chat.module'

/**
 * Социальные интеграции чат-виджета (Telegram, MAX, VK): реальное двустороннее подключение.
 * Подключения хранятся в `chatSocialIntegration` (unique projectId+type, токен шифрован).
 * AuthModule — для @Auth() в ЛК-контроллере; ChatModule — для входящих (ChatService/ChatGateway).
 */
@Module({
  imports: [AuthModule, ChatModule],
  controllers: [ChatSocialController, SocialWebhooksController],
  providers: [ChatSocialService, PrismaService],
  exports: [ChatSocialService]
})
export class ChatSocialModule {}
