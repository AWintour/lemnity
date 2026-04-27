import { usePaymentContext } from './usePaymentContext'

const formatter = new Intl
  .NumberFormat('ru-RU', {
    minimumIntegerDigits: 3,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  })
export const usePrice = () => {
  const { state } = usePaymentContext()
    ?? {
      state: {
        paymentPlans: [],
        paymentPlan: 'basic',
        paymentPeriod: 'month',
        paymentPeriods: [],
        isTrialPeriod: true,
      },
    }
  
  const {
    paymentPlans,
    paymentPlan,
    paymentPeriod,
    paymentPeriods,
    isTrialPeriod,
  } = state

  const price = paymentPlans.find(plan => plan.key === paymentPlan)?.price ?? 0
  const period = paymentPeriods?.find(period => period.key === paymentPeriod)

  const discount = period?.discount ?? 0
  const months = period?.months ?? 0
  const totalWithoutDiscount = price * months
  const total = totalWithoutDiscount * (1 - discount / 100)

  const formattedTotal = formatter.format(total)
  const formattedTotalWithoutDiscount = formatter.format(totalWithoutDiscount)
  
  const paymentButtonText = isTrialPeriod
    ? 'Переключиться на бизнес тариф'
    : `Оплатить ${formattedTotal} ₽`

  return {
    totalWithoutDiscount,
    total,
    formattedTotal,
    formattedTotalWithoutDiscount,
    paymentButtonText,
  }
}