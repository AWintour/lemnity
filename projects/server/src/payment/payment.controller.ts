import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'

import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { PaymentService } from './payment.service'
import { ApiResponse } from '@nestjs/swagger'
import { PaymentInfoDto } from './dto/userPaymentInfo.dto'
import { PaymentPlanDto } from './dto/paymentPlan.dto'
import { PromoDto } from './dto/promo.dto'
import { CreateYooMoneyPaymentDto } from './dto/createYooMoneyPayment.dto'
import { UpdateUserPaymentInfoDto } from './dto/updateUserPaymentInfo.dto'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/info')
  @Auth()
  @ApiResponse({ status: 200, type: PaymentInfoDto })
  getUserPaymentInfo(@CurrentUser('id') userId: string) {
    return this.paymentService.getUserPaymentInfo(userId)
  }

  @Get('/plans')
  @Auth()
  @ApiResponse({ status: 200, type: PaymentPlanDto })
  selectAllEnabledPaymentPlans() {
    return this.paymentService.selectAllEnabledPaymentPlans()
  }

  @Get('/plans/:id')
  @Auth()
  @ApiResponse({ status: 200, type: PaymentPlanDto })
  getPaymentPlan(@Param('id') id: string) {
    return this.paymentService.getPaymentPlanById(id)
  }

  @Get('/promo/:promo')
  @Auth()
  @ApiResponse({ status: 200, type: PromoDto })
  getPromo(@Param('promo') promo: string) {
    return this.paymentService.getPromo(promo)
  }

  @Post('/create')
  @Auth()
  createYooMoneyPayment(
    @Body() body: CreateYooMoneyPaymentDto,
    @CurrentUser('id') userId: string
  ) {
    return this.paymentService.createYooMoneyPayment({
      ...body,
      userId,
    })
  }

  @Get('check/:id')
  @Auth()
  checkForPaymentUpdates(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.paymentService.checkForPaymentUpdates(id, userId)
  }

  @Delete('/:id')
  @Auth()
  deletePayment(@Param('id') id: string) {
    return this.paymentService.deletePayment(id)
  }

  @Get('/pending')
  @Auth()
  getTodaysPendingPayments(@CurrentUser('id') userId: string) {
    return this.paymentService.getTodaysPendingPayments(userId)
  }

  @Post('/update')
  @Auth()
  updateUserPaymentInfo(
    @Body() body: UpdateUserPaymentInfoDto,
    @CurrentUser('id') userId: string
  ) {
    return this.paymentService.updateUserPaymentInfo({
      ...body,
      userId,
    })
  }
}
