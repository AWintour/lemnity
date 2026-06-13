import { Body, Controller, Get, Param, Patch, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChatSocialService } from './chat-social.service'
import { UpdateIntegrationDto } from './dto/update-integration.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: социальные интеграции чат-виджета проекта. Доступ — владельцу проекта. */
@Controller('projects/:projectId/chat/integrations')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatSocialController {
  constructor(private readonly integrations: ChatSocialService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.integrations.list(userId, projectId)
  }

  @Patch(':type')
  @Auth()
  upsert(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('type') type: string,
    @Body() dto: UpdateIntegrationDto
  ) {
    return this.integrations.upsert(userId, projectId, type, dto)
  }
}
