import { Controller, Get, Param } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../prisma.service'
import { WidgetType } from '@lemnity/database'

type PublicProjectWidgetsResponse = {
  widgets: { id: string, type: WidgetType }[]
}

@ApiTags('public-projects')
@Controller('public/projects')
export class PublicProjectController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  @ApiResponse({ status: 200 })
  async findProjectWidgetIds(
    @Param('id') id: string
  ): Promise<PublicProjectWidgetsResponse> {
    const widgets = await this.prisma.widget.findMany({
      where: { projectId: id, enabled: true, project: { enabled: true } },
      select: { id: true, type: true }
    })

    return { widgets }
  }
}
