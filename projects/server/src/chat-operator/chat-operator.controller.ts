import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChatOperatorService } from './chat-operator.service'
import { CreateChatOperatorDto } from './dto/create-chat-operator.dto'
import { UpdateChatOperatorDto } from './dto/update-chat-operator.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: операторы чата проекта (вкладка «Чат» → «Добавить оператора»). Доступ — владельцу проекта. */
@Controller('projects/:projectId/chat/operators')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatOperatorController {
  constructor(private readonly operators: ChatOperatorService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.operators.listForProject(userId, projectId)
  }

  @Post()
  @Auth()
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateChatOperatorDto
  ) {
    return this.operators.create(userId, projectId, dto)
  }

  @Patch(':id')
  @Auth()
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateChatOperatorDto) {
    return this.operators.update(userId, id, dto)
  }

  @Delete(':id')
  @Auth()
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.operators.remove(userId, id)
  }
}
