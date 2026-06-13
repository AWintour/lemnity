import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChatGroupService } from './chat-group.service'
import { CreateGroupMessageDto } from './dto/create-group-message.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: внутренний групповой чат операторов проекта. Доступ — владельцу проекта. */
@Controller('projects/:projectId/chat/group-messages')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGroupController {
  constructor(private readonly chatGroup: ChatGroupService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.chatGroup.list(userId, projectId)
  }

  @Post()
  @Auth()
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateGroupMessageDto
  ) {
    return this.chatGroup.create(userId, projectId, dto)
  }
}
