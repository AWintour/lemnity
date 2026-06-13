import { Body, Controller, Get, Param, Put, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChatDistributionService } from './chat-distribution.service'
import { SaveDistributionDto } from './dto/save-distribution.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: настройки авто-распределения чатов проекта (singleton). Доступ — владельцу проекта. */
@Controller('projects/:projectId/chat/distribution')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatDistributionController {
  constructor(private readonly distribution: ChatDistributionService) {}

  @Get()
  @Auth()
  get(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.distribution.get(userId, projectId)
  }

  @Put()
  @Auth()
  save(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: SaveDistributionDto
  ) {
    return this.distribution.save(userId, projectId, dto)
  }
}
