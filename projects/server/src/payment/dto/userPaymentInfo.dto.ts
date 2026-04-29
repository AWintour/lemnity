import { ApiProperty } from '@nestjs/swagger'
import { PaymentPlanDto } from './paymentPlan.dto'
import { PaymentOptionEnum } from '@lemnity/database'
import { PaymentPlanOptionDto } from './paymentPlanOption.dto'

export class PaymentInfoPaymentOptionDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  type: PaymentOptionEnum

  @ApiProperty()
  name: string
}

export class PaymentInfoDto {
  @ApiProperty()
  balance: string

  @ApiProperty({ type: PaymentPlanDto, required: false })
  paymentPlan?: PaymentPlanDto

  @ApiProperty()
  paymentPlanStartDate: string

  @ApiProperty()
  paymentPlanEndDate: string

  @ApiProperty({ type: PaymentInfoPaymentOptionDto, isArray: true })
  purchasedPaymentPlanOptions: PaymentInfoPaymentOptionDto[]

  @ApiProperty()
  usedTrialPeriod: boolean
}
