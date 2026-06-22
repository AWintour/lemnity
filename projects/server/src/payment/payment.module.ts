import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from '../prisma.service'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PrismaService, PaymentService],
})
export class PaymentModule {}
