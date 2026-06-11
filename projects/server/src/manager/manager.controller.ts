import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { ManagerService } from './manager.service'
import { CreateManagerDto } from './dto/create-manager.dto'
import { UpdateManagerDto } from './dto/update-manager.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

/** ЛК: менеджеры проекта (вкладка «Звонки» → «Добавить менеджера»). Доступ — владельцу проекта. */
@Controller('projects/:projectId/managers')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ManagerController {
  constructor(private readonly managers: ManagerService) {}

  @Get()
  @Auth()
  list(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.managers.listForProject(userId, projectId)
  }

  @Post()
  @Auth()
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateManagerDto
  ) {
    return this.managers.create(userId, projectId, dto)
  }

  @Patch(':id')
  @Auth()
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateManagerDto) {
    return this.managers.update(userId, id, dto)
  }

  @Delete(':id')
  @Auth()
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.managers.remove(userId, id)
  }
}
