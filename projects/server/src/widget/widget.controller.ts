import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, ForbiddenException
} from '@nestjs/common'
import { WidgetService } from './widget.service'
import { CreateWidgetDto } from './dto/create-widget.dto'
import { UpdateWidgetDto } from './dto/update-widget.dto'
import { Widget } from './entities/widget.entity'
import { ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { ADMIN_ONLY_WIDGET_TYPES, isAdminUser } from '../common/admin'

@ApiTags('widgets')
@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  @ApiResponse({ status: 201, type: Widget })
  @Auth()
  create(
    @Body() createWidgetDto: CreateWidgetDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @CurrentUser('role') role: string
  ): Promise<Widget> {
    if (
      ADMIN_ONLY_WIDGET_TYPES.has(createWidgetDto.type) &&
      !isAdminUser(email, role)
    ) {
      throw new ForbiddenException('Этот тип виджета доступен только администратору')
    }
    return this.widgetService.create(createWidgetDto, userId, isAdminUser(email, role))
  }

  @Get()
  @ApiResponse({ status: 200, type: [Widget] })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @Auth()
  findAllByProject(
    @Query('projectId') projectId: string,
    @CurrentUser('id') userId: string
  ): Promise<Widget[]> {
    return this.widgetService.findAllByProject(projectId, userId)
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Widget })
  @Auth()
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<Widget> {
    return this.widgetService.findOne(id, userId)
  }

  @Patch(':id')
  @ApiResponse({ status: 200, type: Widget })
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateWidgetDto: UpdateWidgetDto,
    @CurrentUser('id') userId: string
  ): Promise<Widget> {
    return this.widgetService.update(id, updateWidgetDto, userId)
  }

  @Patch(':id/toggle')
  @ApiResponse({ status: 200, type: Widget })
  @Auth()
  toggleEnabled(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
    @CurrentUser('id') userId: string
  ): Promise<Widget> {
    return this.widgetService.toggleEnabled(id, enabled, userId)
  }

  @Delete(':id')
  @ApiResponse({ status: 200, type: Widget })
  @Auth()
  remove(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<Widget> {
    return this.widgetService.remove(id, userId)
  }
}
