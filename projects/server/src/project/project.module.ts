import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { PrismaService } from '../prisma.service'
import { LemnityModule } from '../lemnity/lemnity.module'

@Module({
  imports: [LemnityModule], // FeatureAccessService — энфорсмент лимита сайтов
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService]
})
export class ProjectModule {}
