import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ManagerService } from './manager.service'
import { ManagerController } from './manager.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Менеджеры проекта (Callback Widget). CRUD в ЛК + `listEnabledForProject` для round-robin
 * привязки звонка (используется CallbackService). AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ManagerController],
  providers: [ManagerService, PrismaService],
  exports: [ManagerService]
})
export class ManagerModule {}
