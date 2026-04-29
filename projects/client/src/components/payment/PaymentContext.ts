// import { createContext } from 'react'
// import type {
//   PaymentPeriod,
//   PaymentPeriodKey,
//   PaymentPlan,
//   PaymentPlanKey,
// } from './types'
// import { type WidgetType } from '@/layouts/Widgets/constants'

// export type ModificationKey = WidgetType | 'BRANDING'

// export type Action =
//   | { type: 'setPopupOpen', open: boolean }
//   | { type: 'setIsTrialPeriod', isTrialPeriod: boolean }
//   | { type: 'setPaymentPlan', paymentPlan: PaymentPlanKey }
//   | { type: 'setPaymentPeriod', paymentPeriod: PaymentPeriodKey }
//   | { type: 'setPaymentPlans', paymentPlans: PaymentPlan[] }
//   | { type: 'setPaymentPeriods', paymentPeriods: PaymentPeriod[] }
//   | { type: 'toggleModification', modification: ModificationKey }

// export type Dispatch = (action: Action) => void

// export type State = {
//   open: boolean
//   isTrialPeriod: boolean
//   paymentPlan: PaymentPlanKey
//   paymentPeriod: PaymentPeriodKey
//   paymentPlans: PaymentPlan[]
//   paymentPeriods: PaymentPeriod[]
//   modifications: Record<ModificationKey, boolean>
// }

// export const PaymentContext = createContext<
//   { state: State; dispatch: Dispatch } | undefined
// >(undefined)
