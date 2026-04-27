import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class PaymentInfo {
  @IsNumber()
  balance: number

  @IsString()
  @IsNotEmpty()
  paymentPlanId: string
}
