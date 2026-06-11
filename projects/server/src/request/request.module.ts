import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PublicRequestController } from './public-request.controller'
import { PublicCallbackController } from './public-callback.controller'
import { RequestController } from './request.controller'
import { RequestService } from './request.service'
import { CallbackService } from './callback.service'
import { LemnityModule } from '../lemnity/lemnity.module'

@Module({
  imports: [LemnityModule], // FeatureAccessService — месячный лимит callback-заявок
  controllers: [RequestController, PublicRequestController, PublicCallbackController],
  providers: [RequestService, CallbackService, PrismaService]
})
export class RequestModule {}
