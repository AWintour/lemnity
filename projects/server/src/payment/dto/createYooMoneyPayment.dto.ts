import { ApiProperty } from '@nestjs/swagger'

export class CreateYooMoneyPaymentDto {
  @ApiProperty() total: string
  @ApiProperty() description: string
  @ApiProperty() metadata?: object
}