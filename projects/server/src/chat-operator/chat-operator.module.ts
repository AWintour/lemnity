import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatOperatorService } from './chat-operator.service'
import { ChatOperatorController } from './chat-operator.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Операторы чата проекта (Chat Widget). CRUD в ЛК с проверкой владения проектом.
 * AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ChatOperatorController],
  providers: [ChatOperatorService, PrismaService],
  exports: [ChatOperatorService]
})
export class ChatOperatorModule {}
