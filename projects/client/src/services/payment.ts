import { http } from '@/common/api/http'
import type { PaymentInfoDto, PaymentPlanDto } from '@lemnity/api-sdk'

export const fetchPaymentPlans = async () => {
  const result = await http.get<PaymentPlanDto[]>('/payment/plans')
  return result
}

export const fetchPaymentInfo = async () => {
  const result = await http.get<PaymentInfoDto>('/payment/info')
  return result
}

export const updatePaymentInfo = async () => {
  const result = await http.patch('/payment/info', {
    balance: 500,
    paymentPlanId: 'cmoh372ud00003b6tvccqee8x',
  })
  return result
}