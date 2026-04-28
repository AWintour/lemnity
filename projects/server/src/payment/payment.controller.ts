import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common'

import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { PaymentService } from './payment.service'
import { ApiResponse } from '@nestjs/swagger'
import { PaymentInfoResponse } from './entities/userPaymentInfo.entity'
import { UpdatePaymentInfo } from './dto/updatePaymentInfo.dto'
import { PaymentPlanDto } from './dto/paymentPlan.dto'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/info')
  @Auth()
  @ApiResponse({ status: 200, type: PaymentInfoResponse })
  getUserPaymentInfo(@CurrentUser('id') userId: string) {
    return this.paymentService.getUserPaymentInfo(userId)
  }

  // this probably should be a webhook
  // @Patch('/info')
  // @Auth()
  // updateUserPaymentPlanAndBalance(
  //   @CurrentUser('id') userId: string,
  //   @Body() updatePaymentInfoDto: UpdatePaymentInfo
  // ) {
  //   return this.paymentService.updateUserPaymentPlanAndBalance(
  //     userId,
  //     updatePaymentInfoDto.balance,
  //     updatePaymentInfoDto.paymentPlanId
  //   )
  // }

  @Get('/plans')
  @Auth()
  @ApiResponse({ status: 200, type: PaymentPlanDto })
  selectAllEnabledPaymentPlans() {
    return this.paymentService.selectAllEnabledPaymentPlans()
  }
}