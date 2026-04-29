// import { useReducer } from 'react'
// import {
//   PaymentContext,
//   type Action,
//   type State,
// } from './PaymentContext'
// import { WidgetTypes, type WidgetType } from '@/layouts/Widgets/constants'

// type PaymentProviderProps = { children: React.ReactNode }

// const paymentReducer = (state: State, action: Action): State => {
//   switch (action.type) {
//     case 'setPopupOpen':
//       return { ...state, open: action.open }
//     case 'setIsTrialPeriod':
//       return { ...state, isTrialPeriod: action.isTrialPeriod }
//     case 'setPaymentPlan':
//       return { ...state, paymentPlan: action.paymentPlan }
//     case 'setPaymentPeriod':
//       return { ...state, paymentPeriod: action.paymentPeriod }
//     case 'setPaymentPlans':
//       return { ...state, paymentPlans: action.paymentPlans }
//     case 'setPaymentPeriods':
//       return { ...state, paymentPeriods: action.paymentPeriods }
//     case 'toggleModification':
//       return { ...state, modifications: {
//         ...state.modifications,
//         [action.modification]: !state.modifications[action.modification],
//       } }
//   }
// }

// const PaymentProvider = ({ children }: PaymentProviderProps) => {
//   const [state, dispatch] = useReducer(paymentReducer, {
//     open: false,
//     isTrialPeriod: true,
//     paymentPlan: 'basic',
//     paymentPeriod: 'month',
//     paymentPlans: [],
//     paymentPeriods: [],
//     modifications: {
//       ...Object.values(WidgetTypes).reduce<Record<WidgetType, boolean>>(
//         (acc, type) => {
//           acc[type] = false
//           return acc
//         },
//         {} as Record<WidgetType, boolean>,
//       ),
//       BRANDING: false,
//     },
//   })
//   const value = { state, dispatch }

//   return (
//     <PaymentContext.Provider value={value}>
//       {children}
//     </PaymentContext.Provider>
//   )
// }

// export default PaymentProvider
