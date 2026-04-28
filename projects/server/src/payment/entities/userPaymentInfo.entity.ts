import { ApiProperty } from '@nestjs/swagger'
import { PaymentPlanDto } from '../dto/paymentPlan.dto'
import { PaymentOptionEnum } from '@lemnity/database'

export class PaymentInfoResponse {
  @ApiProperty()
  balance: number

  @ApiProperty({ type: [PaymentPlanDto], required: false })
  paymentPlan?: PaymentPlanDto

  @ApiProperty()
  paymentPlanStartDate: string

  @ApiProperty()
  paymentPlanEndDate: string

  @ApiProperty()
  purchasedPaymentPlanOptions: PaymentOptionEnum

  @ApiProperty()
  usedTrialPeriod: boolean
}
