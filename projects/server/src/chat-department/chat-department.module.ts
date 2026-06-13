import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ChatDepartmentService } from './chat-department.service'
import { ChatDepartmentController } from './chat-department.controller'
import { AuthModule } from '../auth/auth.module'

/**
 * Отделы чата проекта (Chat Widget). CRUD в ЛК с привязкой операторов к отделу.
 * AuthModule — для @Auth() в контроллере.
 */
@Module({
  imports: [AuthModule],
  controllers: [ChatDepartmentController],
  providers: [ChatDepartmentService, PrismaService],
  exports: [ChatDepartmentService]
})
export class ChatDepartmentModule {}
