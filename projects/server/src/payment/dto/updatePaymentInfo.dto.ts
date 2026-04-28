import { PartialType } from '@nestjs/swagger'
import { PaymentInfo } from './paymentInfo.dto';

export class UpdatePaymentInfo extends PartialType(PaymentInfo) {}
