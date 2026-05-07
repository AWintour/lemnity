import { http } from '@/common/api/http'
import type { PaymentInfoDto, PaymentPlanDto, PromoDto } from '@lemnity/api-sdk'

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

export const getPromo = async (promo: string) => {
  const result = await http.get<PromoDto>(`/payment/promo/${promo}`)
  return result
}

export type TCreateYooMoneyPaymentArgs = {
  total: string
  description: string
  metadata?: object
}

export const createYooMoneyPayment = async (
  args: TCreateYooMoneyPaymentArgs
) => {
  const result = await http.post<any>('/payment/create', args)
  return result
}

export const checkPaymentStatus = async (id: string) => {
  const result = await http.get<any>(`/payment/check/${id}`, { timeout: 10000 })
  return result
}
