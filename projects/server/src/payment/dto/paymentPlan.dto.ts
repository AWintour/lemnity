import { ApiProperty } from '@nestjs/swagger'
import { PaymentPlanOptionDto } from './paymentPlanOption.dto'
import { IncludedPlanOptionDto } from './includedPlanOption.dto'

export class PaymentPlanDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() enabled: boolean
  @ApiProperty() numberOfProjects: number
  @ApiProperty() numberOfWidgets: number
  @ApiProperty() monthlyPrice: number
  @ApiProperty() quarterlyPrice: number
  @ApiProperty() yearlyPrice: number

  @ApiProperty({ type: PaymentPlanOptionDto, isArray: true })
  paymentPlanOptions: PaymentPlanOptionDto[]

  @ApiProperty({ type: IncludedPlanOptionDto, isArray: true })
  includedPlanOptions: IncludedPlanOptionDto[]

  @ApiProperty() createdAt: string
  @ApiProperty() updatedAt: string
}
