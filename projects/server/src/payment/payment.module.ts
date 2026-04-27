import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma.service'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'

@Module({
  controllers: [PaymentController],
  providers: [PrismaService, PaymentService],
})
export class PaymentModule {}
