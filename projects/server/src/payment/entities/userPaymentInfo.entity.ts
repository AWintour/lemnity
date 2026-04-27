import { ApiProperty } from '@nestjs/swagger'
import { PaymentPlanDto } from './paymentPlan.entity'

export class PaymentInfoResponse {
  @ApiProperty()
  balance: number

  @ApiProperty({ type: [PaymentPlanDto], required: false })
  paymentPlan?: PaymentPlanDto
}
