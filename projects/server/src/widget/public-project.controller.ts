import { Controller, Get, Param, Req } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { WidgetService } from './widget.service'
import { PublicWidget } from './entities/public-widget.entity'
import type { Request } from 'express'
import { extractRequestOriginHost } from '../common/origin'

@ApiTags('public-projects')
@Controller('public/projects')
export class PublicProjectController {
  constructor(private readonly widgetService: WidgetService) {}

  // Один проектный embed-тег (?projectId=...) грузит все включённые виджеты проекта одним запросом.
  @Get(':projectId/widgets')
  @ApiResponse({ status: 200, type: [PublicWidget] })
  findWidgets(
    @Param('projectId') projectId: string,
    @Req() req: Request
  ): Promise<PublicWidget[]> {
    return this.widgetService.findPublicByProject(projectId, extractRequestOriginHost(req))
  }
}
