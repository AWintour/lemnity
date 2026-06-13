import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChatDepartmentService } from './chat-department.service'
import { CreateChatDepartmentDto } from './dto/create-chat-department.dto'
import { UpdateChatDepartmentDto } from './dto/update-chat-department.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: отделы чата проекта (вкладка «Чат» → «Отделы»). Доступ — владельцу проекта. */
@Controller('projects/:projectId/chat/departments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatDepartmentController {
  constructor(private readonly departments: ChatDepartmentService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.departments.list(userId, projectId)
  }

  @Post()
  @Auth()
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateChatDepartmentDto
  ) {
    return this.departments.create(userId, projectId, dto)
  }

  @Patch(':id')
  @Auth()
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateChatDepartmentDto) {
    return this.departments.update(userId, id, dto)
  }

  @Delete(':id')
  @Auth()
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.departments.remove(userId, id)
  }
}
