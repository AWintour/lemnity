import { http } from '@/common/api/http'
import type { PaymentInfoDto, PaymentPlanDto, PromoDto } from '@lemnity/api-sdk'

export const fetchPaymentPlans = async () => {
  const result = await http.get<PaymentPlanDto[]>('/payment/plans')
  return result
}

export const fetchPaymentPlanById = async (id: string) => {
  const result = await http.get<PaymentPlanDto>(`/payment/plans/${id}`)
  return result
}

export const fetchPaymentInfo = async () => {
  const result = await http.get<PaymentInfoDto>('/payment/info')
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

type TPollForPaymentUpdatesArgs = {
  paymentId: string
  onSuccess?: (data: any) => void
  onCanceled?: (data: any) => void
}

export const pollForPaymentUpdates = (
  {
    paymentId,
    onSuccess,
    onCanceled,
  }: TPollForPaymentUpdatesArgs
) => {
  let shouldStopPolling: boolean = false
  const worker = async () => {
    try {
      const { data } = await checkPaymentStatus(paymentId)
  
      switch (data.status) {
        case 'succeeded':
          console.log(data)
          shouldStopPolling = true
          await updateUserPaymentInfo({
            paymentPlanId: data.metadata.paymentPlanId,
            optionsInCart: data.metadata.optionsInCart,
            billingPeriod: data.metadata.billingPeriod,
          })
          onSuccess?.(data)
          return data.status
        case 'canceled':
          console.log(data)
          shouldStopPolling = true
          onCanceled?.(data)
          return data.status
      }

      if (!shouldStopPolling) {
        setTimeout(() => {
          worker()
        }, 60000)
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return worker
}

export const deletePayment = async (paymentId: string) => {
  const result = await http.delete(`/payment/${paymentId}`)
  return result
}

export const getTodaysPendingPayments = async () => {
  const result = await http<any>('/payment/pending')
  return result
}

export const updateUserPaymentInfo = async (
  { paymentPlanId, optionsInCart, billingPeriod }: {
    paymentPlanId: string
    optionsInCart: object
    billingPeriod: 'month' | 'quarter' | 'year'
  }
) => {
  const result = await http.post('/payment/update', {
    paymentPlanId,
    optionsInCart,
    billingPeriod,
  })
  return result
}
