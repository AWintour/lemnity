import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CallService } from './call.service'
import { CallController } from './call.controller'
import { MangoModule } from '../mango/mango.module'
import { AuthModule } from '../auth/auth.module'

/**
 * Вкладка «Звонки» (Callback Widget). MangoModule — для выгрузки записи (MangoService.fetchRecording)
 * и резолва кредов (MangoIntegrationService). AuthModule — для @Auth().
 */
@Module({
  imports: [MangoModule, AuthModule],
  controllers: [CallController],
  providers: [CallService, PrismaService]
})
export class CallModule {}
