import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserPaymentInfoDto {
  @ApiProperty() userId: string
  @ApiProperty() paymentPlanId: string
  @ApiProperty() optionsInCart: string
  @ApiProperty() billingPeriod: 'month' | 'quarter' | 'year'
}
