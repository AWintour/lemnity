import Decimal from 'decimal.js'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectBillingPeiodById,
  selectCurrentBillingPeriodId,
  selectCurrentPaymentPlanId,
  selectIsTrialPeriod,
  selectPaymentPlanById,
} from '@/stores/redux/paymentSlice'
import type { RootState } from '@/stores/redux/store'


const formatter = new Intl
  .NumberFormat('ru-RU', {
    minimumIntegerDigits: 3,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  })
export const usePrice = () => {
  const currentPaymentPlanId =
    useAppSelector(selectCurrentPaymentPlanId)
  const paymentPlan =
    useAppSelector(
      (state: RootState) =>
        selectPaymentPlanById(state, currentPaymentPlanId)
    )

  const currentBillingPeriodId =
    useAppSelector(selectCurrentBillingPeriodId)
  const billingPeriod =
    useAppSelector(
      (state: RootState) =>
        selectBillingPeiodById(state, currentBillingPeriodId)
    )

  const isTrialPeriod =
    useAppSelector(selectIsTrialPeriod)

  // const price = paymentPlans.find(plan => plan.key === paymentPlan)?.price ?? 0
  // const period = paymentPeriods?.find(period => period.key === paymentPeriod)

  const months = new Decimal(billingPeriod.months)
    ?? new Decimal(0)

  let price = new Decimal('0')

  switch (billingPeriod.id) {
    case 'month':
      const monthlyPrice = new Decimal(paymentPlan.monthlyPrice)
      price = monthlyPrice
      break
    case 'quarter':
      const quarterlyPrice = new Decimal(paymentPlan.quarterlyPrice)
      price = quarterlyPrice
      break
    case 'year':
      const yearlyPrice = new Decimal(paymentPlan.yearlyPrice)
      price = yearlyPrice
      break
  }
  
  const total = price

  const formattedTotal = formatter.format(
    Number(total.toFixed(2))
  )
  
  const paymentButtonText = isTrialPeriod
    ? 'Переключиться на бизнес тариф'
    : `Оплатить ${formattedTotal} ₽`

  return {
    total,
    formattedTotal,
    paymentButtonText,
  }
}