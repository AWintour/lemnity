import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatSocialService } from './chat-social.service'
import { ChatSocialController } from './chat-social.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Социальные интеграции чат-виджета (Telegram, MAX, VK). Хранит подключения в
 * `chatSocialIntegration` (unique projectId+type). AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ChatSocialController],
  providers: [ChatSocialService, PrismaService],
  exports: [ChatSocialService]
})
export class ChatSocialModule {}
