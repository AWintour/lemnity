import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatDistributionService } from './chat-distribution.service'
import { ChatDistributionController } from './chat-distribution.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Настройки авто-распределения чатов (singleton на проект). Одна строка
 * ChatDistributionSettings на проект. AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ChatDistributionController],
  providers: [ChatDistributionService, PrismaService],
  exports: [ChatDistributionService]
})
export class ChatDistributionModule {}
