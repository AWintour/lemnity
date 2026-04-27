import { PartialType } from '@nestjs/swagger'
import { PaymentInfo } from './paymentInf.dto';

export class UpdatePaymentInfo extends PartialType(PaymentInfo) {}
