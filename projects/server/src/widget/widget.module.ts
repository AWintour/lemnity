import { Module } from '@nestjs/common'
import { WidgetService } from './widget.service'
import { WidgetController } from './widget.controller'
import { PublicWidgetController } from './public-widget.controller'
import { PublicProjectController } from './public-project.controller'
import { PrismaService } from '../prisma.service'
import { WidgetConfigModule } from '../config/config.module'

@Module({
  imports: [WidgetConfigModule],
  controllers: [WidgetController, PublicWidgetController, PublicProjectController],
  providers: [WidgetService, PrismaService]
})
export class WidgetModule {}
