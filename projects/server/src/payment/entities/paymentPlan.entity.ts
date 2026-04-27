import { ApiProperty } from '@nestjs/swagger'

export class PaymentPlanDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() enabled: boolean
  @ApiProperty() numberOfProjects: number
  @ApiProperty() numberOfWidgets: number
  @ApiProperty() monthlyPrice: number
  @ApiProperty() quarterlyPrice: number
  @ApiProperty() yearlyPrice: number
  @ApiProperty() brandingPrice: number
  @ApiProperty() options: object
}
