import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatGroupService } from './chat-group.service'
import { ChatGroupController } from './chat-group.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Внутренний групповой чат операторов проекта. Доступ — владельцу проекта (@Auth()).
 * AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ChatGroupController],
  providers: [ChatGroupService, PrismaService],
  exports: [ChatGroupService]
})
export class ChatGroupModule {}
