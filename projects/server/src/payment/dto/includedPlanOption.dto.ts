import { PaymentOptionEnum } from '@lemnity/database'
import { ApiProperty } from '@nestjs/swagger'

export class IncludedPlanOptionDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() type: PaymentOptionEnum
}
