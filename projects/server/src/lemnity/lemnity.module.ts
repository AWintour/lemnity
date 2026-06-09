import { Module } from '@nestjs/common'
import { LemnityController } from './lemnity.controller'
import { LemnityService } from './lemnity.service'
import { PrismaService } from '../prisma.service'

@Module({
  controllers: [LemnityController],
  providers: [LemnityService, PrismaService]
})
export class LemnityModule {}
