import Decimal from 'decimal.js'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectBillingPeiodById,
  selectCurrentBillingPeriodId,
  selectCurrentPaymentPlanId,
  selectDbPromo,
  selectIsPlanOptionAddedToCart,
  selectPaymentPlanById,
  selectPaymentPlanOptions,
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
  const paymentPlanOptions =
    useAppSelector(selectPaymentPlanOptions)
  const isPlanOptionAddedToCart =
    useAppSelector(selectIsPlanOptionAddedToCart)
  const dbPromo =
    useAppSelector(selectDbPromo)
  
  let indexesOfOptionsInCart: number[] = []
  paymentPlanOptions.forEach((value, index) => {
    if (isPlanOptionAddedToCart[value.type]) {
      indexesOfOptionsInCart.push(index)
    }
  })

  const months = new Decimal(billingPeriod.months)
    ?? new Decimal(0)

  let total = new Decimal('0')

  switch (billingPeriod.id) {
    case 'month':
      const monthlyPrice = new Decimal(paymentPlan.monthlyPrice)
      total = monthlyPrice
      break
    case 'quarter':
      const quarterlyPrice = new Decimal(paymentPlan.quarterlyPrice)
      total = quarterlyPrice
      break
    case 'year':
      const yearlyPrice = new Decimal(paymentPlan.yearlyPrice)
      total = yearlyPrice
      break
  }

  indexesOfOptionsInCart.forEach((value) => {
    const option = paymentPlanOptions[value]

    const optionPrice =
      option.isBilledAnnually
        ? new Decimal(option.price)
        : (new Decimal(option.price)).times(months)
    
    total = total.add(optionPrice)
  })

  if (dbPromo) {
    const discount = new Decimal(dbPromo.discount)
    const factor = (new Decimal(100)).minus(discount).dividedBy(100)
    total = total.times(factor)
  }

  const formattedTotal = formatter.format(
    Number(total.toFixed(2))
  )

  return {
    total,
    formattedTotal,
  }
}
