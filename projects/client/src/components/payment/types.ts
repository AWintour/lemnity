export type PaymentPlanKey = 'basic' | 'business'

export type PaymentPlan = {
  key: PaymentPlanKey
  label: string
  price: number
}

export type PaymentPeriodKey = 'month' | '3_months' | 'year'

export type PaymentPeriod = {
  key: string
  label: string
  discount: number
  months: number
}
