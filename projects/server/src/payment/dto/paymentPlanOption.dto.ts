import { PaymentOptionEnum } from '@lemnity/database'
import { ApiProperty } from '@nestjs/swagger'

export class PaymentPlanOptionDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() type: PaymentOptionEnum
  @ApiProperty() price: string
  @ApiProperty() enabled: boolean
  @ApiProperty() isBilledAnnually: boolean
  @ApiProperty() createdAt: string
  @ApiProperty() updatedAt: string
}
