import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { PrismaService } from '../prisma.service'
import { PublicProjectController } from './public-project.controller'

@Module({
  controllers: [ProjectController, PublicProjectController],
  providers: [ProjectService, PrismaService]
})
export class ProjectModule {}
