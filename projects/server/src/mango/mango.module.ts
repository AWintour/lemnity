import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { MangoService } from './mango.service'
import { MangoSchedulerService } from './mango-scheduler.service'
import { MangoIntegrationService } from './mango-integration.service'
import { MangoIntegrationController } from './mango-integration.controller'
import { MangoEventsService } from './mango-events.service'
import { MangoEventsController } from './mango-events.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Телефония Mango (Фаза 2). MangoService — вызов Server API; MangoSchedulerService — polling-воркер
 * отложенных звонков (стартует сам по lifecycle-хукам); MangoIntegrationService — BYO-креды per-project.
 * Звонки планируются записью в `scheduled_tasks` (см. CallbackService). AuthModule — для @Auth() в ЛК.
 */
@Module({
  imports: [AuthModule],
  controllers: [MangoIntegrationController, MangoEventsController],
  providers: [
    MangoService,
    MangoSchedulerService,
    MangoIntegrationService,
    MangoEventsService,
    PrismaService
  ],
  exports: [MangoService, MangoIntegrationService]
})
export class MangoModule {}
