import { Module } from '@nestjs/common'
import { LemnityController } from './lemnity.controller'
import { LemnityService } from './lemnity.service'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule], // AuthService для SSO ticket-exchange
  controllers: [LemnityController],
  providers: [LemnityService, PrismaService]
})
export class LemnityModule {}
