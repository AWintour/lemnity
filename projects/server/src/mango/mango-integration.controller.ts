import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { MangoIntegrationService } from './mango-integration.service'
import { SaveMangoIntegrationDto } from './dto/save-mango-integration.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/**
 * ЛК: настройка BYO-интеграции Mango для проекта (Фаза 2, гибрид). Секреты шифруются в сервисе и
 * НИКОГДА не возвращаются наружу — GET отдаёт только статус. Доступ — владельцу проекта.
 */
@Controller('projects/:projectId/mango-integration')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MangoIntegrationController {
  constructor(private readonly integration: MangoIntegrationService) {}

  @Get()
  @Auth()
  status(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.integration.getStatusForOwner(userId, projectId)
  }

  @Post()
  @Auth()
  async save(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: SaveMangoIntegrationDto
  ) {
    await this.integration.saveForOwner(userId, projectId, dto)
    return { ok: true }
  }
}
