import { createContext } from 'react'
import type { PaymentPeriod, PaymentPeriodKey, PaymentPlan, PaymentPlanKey } from './types'

export type Action =
  | { type: 'setIsTrialPeriod', isTrialPeriod: boolean }
  | { type: 'setPaymentPlan', paymentPlan: PaymentPlanKey }
  | { type: 'setPaymentPeriod', paymentPeriod: PaymentPeriodKey }
  | { type: 'setPaymentPlans', paymentPlans: PaymentPlan[] }
  | { type: 'setPaymentPeriods', paymentPeriods: PaymentPeriod[] }

export type Dispatch = (action: Action) => void

export type State = {
  isTrialPeriod: boolean
  paymentPlan: PaymentPlanKey
  paymentPeriod: PaymentPeriodKey
  paymentPlans: PaymentPlan[]
  paymentPeriods: PaymentPeriod[]
}

export const PaymentContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)
