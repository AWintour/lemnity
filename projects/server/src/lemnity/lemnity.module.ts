import { Module } from '@nestjs/common'
import { LemnityController } from './lemnity.controller'
import { LemnityService } from './lemnity.service'
import { CallbackSubscriptionService } from './callback-subscription.service'
import { ChatSubscriptionService } from './chat-subscription.service'
import { FeatureAccessService } from './feature-access.service'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule], // AuthService для SSO ticket-exchange
  controllers: [LemnityController],
  providers: [
    LemnityService,
    CallbackSubscriptionService,
    ChatSubscriptionService,
    FeatureAccessService,
    PrismaService
  ],
  exports: [CallbackSubscriptionService, ChatSubscriptionService, FeatureAccessService] // энфорсмент в project/request
})
export class LemnityModule {}
