import { useReducer } from 'react'
import {
  PaymentContext,
  type Action,
  type State,
} from './PaymentContext'

type PaymentProviderProps = { children: React.ReactNode }

const paymentReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setIsTrialPeriod':
      return { ...state, isTrialPeriod: action.isTrialPeriod }
    case 'setPaymentPlan':
      return { ...state, paymentPlan: action.paymentPlan }
    case 'setPaymentPeriod':
      return { ...state, paymentPeriod: action.paymentPeriod }
    case 'setPaymentPlans':
      return { ...state, paymentPlans: action.paymentPlans }
    case 'setPaymentPeriods':
      return { ...state, paymentPeriods: action.paymentPeriods }
  }
}

const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const [state, dispatch] = useReducer(paymentReducer, {
    isTrialPeriod: true,
    paymentPlan: 'basic',
    paymentPeriod: 'month',
    paymentPlans: [],
    paymentPeriods: [],
  })
  const value = { state, dispatch }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

export default PaymentProvider
