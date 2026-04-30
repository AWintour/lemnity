import {
  createEntityAdapter,
  createSlice,
  nanoid,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

import {
  createAppAsyncThunk,
  startAppListening,
  type FetchStatus,
  type RootState,
} from './store'
import { rootReducer } from '@/stores/redux/reducer'
import { fetchPaymentPlans, fetchPaymentInfo } from '@/services/payment'

import type {
  PaymentInfoPaymentOptionDto,
  PaymentPlanDto,
} from '@lemnity/api-sdk'

export const fetchPaymentPlansThunk = createAppAsyncThunk(
  'payment/fetchPlans',
  async () => {
    const { data } = await fetchPaymentPlans()
    return data
  },
  {
    condition(_, thunkApi) {
      let fetchStatus: FetchStatus = 'idle'

      try {
        fetchStatus = selectPaymentPlansFetchStatus(thunkApi.getState())
      }
      catch {
        // the payment slice might not be mounted yet
        // in that case the first fetch should be allowed to proceed
        // once the fetch has happened it will generate an action
        // that action will be reduced and the slice will be mounted
        // then the fetchStatus will be updated
        fetchStatus = 'idle'
      }

      if (fetchStatus === 'pending' || fetchStatus === 'succeeded') {
        return false
      }
    },
  }
)

export const fetchUserPaymentInfoThunk = createAppAsyncThunk(
  'payment/fetchInfo',
  async () => {
    const { data } = await fetchPaymentInfo()
    return data
  },
  {
    condition(_, thunkApi) {
      let fetchStatus: FetchStatus = 'idle'

      try {
        fetchStatus = selectPaymentInfoFetchStatus(thunkApi.getState())
      }
      catch {
        // the payment slice might not be mounted yet
        // in that case the first fetch should be allowed to proceed
        // once the fetch has happened it will generate an action
        // that action will be reduced and the slice will be mounted
        // then the fetchStatus will be updated
        fetchStatus = 'idle'
      }

      if (fetchStatus === 'pending' || fetchStatus === 'succeeded') {
        return false
      }
    },
  }
)

// i think this particular adapter is not needed
// becasue Hero UI's select expects to be able to attach a ref to the
// <SeletcItem /> (?) component i cannot implement the logic of
// actually getting th e payment plan by its id in a sepaate component
// and the adapter itself is not needed since i believe there won't be
// more than 3-5 plans available so updating an item in the array
// won't cause too many re-renders
const paymentPlanAdapter = createEntityAdapter<PaymentPlanDto>({
  sortComparer: (a, b) => Number(a.yearlyPrice) - Number(b.yearlyPrice)
})

export type TPaymentPlanEntities =
  ReturnType<typeof paymentPlanAdapter.getInitialState>

export type TBillingPeriodKey = 'month' | 'quarter' | 'year'

export type TBillingPeriod = {
  id: TBillingPeriodKey
  label: string
  discount: number
  months: number
}

const billingPeriodAdapter = createEntityAdapter<TBillingPeriod>()

export type TBillingPeriodEntities =
  ReturnType<typeof billingPeriodAdapter.getInitialState>

type TBillingPeriodUpdate =
  Pick<TBillingPeriod, 'id'>
  & Partial<Omit<TBillingPeriod, 'id'>>

const defaultBillingPeriods: TBillingPeriod[] = [
  {
    id: 'month',
    label: 'Месяц',
    discount: 0,
    months: 1,
  },
  {
    id: 'quarter',
    label: '3 месяца',
    discount: 0,
    months: 3,
  },
  {
    id: 'year',
    label: 'Год',
    discount: 0,
    months: 12,
  },
]

type TPaymentPlanOptionType = 'BRANDING'

type TPaymentPlanOption = {
  type: TPaymentPlanOptionType
  enabled: boolean
  name: string
  price: string
  isBilledAnnually: boolean
}

type TIncludedPlanOption = {
  type: TPaymentPlanOptionType
  name: string
}

type TPaymentState = {
  // UI state
  paymentWidgetOpen: boolean
  currentBillingPeriodId: TBillingPeriodKey
  currentPaymentPlanId: string
  // cheapestBillingPlanId: string
  paymentPlanOptions: TPaymentPlanOption[]
  includedPlanOptions: TIncludedPlanOption[]

  // server state
  paymentPlansFetchStatus: FetchStatus
  paymentPlansFetchError: string | null
  paymentInfoFetchStatus: FetchStatus
  paymentInfoFetchError: string | null
  paymentPlans: TPaymentPlanEntities
  billingPeriods: TBillingPeriodEntities
  balance: string
  // current payment plan may be unique to user or be disabled so it might not
  // show up in `paymentPlans` property
  paymentPlan: PaymentPlanDto
  paymentPlanStartDate: string
  paymentPlanEndDate: string
  purchasedPaymentPlanOptions: PaymentInfoPaymentOptionDto[]
  isTrialPeriod: boolean
}

const now = DateTime.now()
const paymentPlanId = nanoid()
const defaultPaymentPlan: PaymentPlanDto = {
  id: paymentPlanId,
  createdAt: '',
  updatedAt: '',
  enabled: true,
  includedPlanOptions: [],
  monthlyPrice: '0,00',
  name: 'Тестовый',
  numberOfProjects: 5,
  numberOfWidgets: 15,
  paymentPlanOptions: [],
  quarterlyPrice: '0,00',
  yearlyPrice: '0,00',
}

export const initialState: TPaymentState = {
  paymentWidgetOpen: false,
  currentBillingPeriodId: 'month',
  currentPaymentPlanId: paymentPlanId,
  // cheapestBillingPlanId: paymentPlanId,
  paymentPlanOptions: [],
  includedPlanOptions: [],

  paymentPlansFetchStatus: 'idle',
  paymentPlansFetchError: null,
  paymentInfoFetchStatus: 'idle',
  paymentInfoFetchError: null,
  paymentPlans: {
    ...paymentPlanAdapter.getInitialState({}, [defaultPaymentPlan]),
  },
  billingPeriods: {
    ...billingPeriodAdapter.getInitialState({}, defaultBillingPeriods),
  },
  isTrialPeriod: true,
  balance: '0,00',
  paymentPlanStartDate: now.toISO(),
  paymentPlanEndDate: now.plus({ days: 3 }).toISO(),
  purchasedPaymentPlanOptions: [],
  // this should come form the server
  paymentPlan: defaultPaymentPlan,
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentWidgetOpenChanged:
      (state, action: PayloadAction<boolean>) => {
        state.paymentWidgetOpen = action.payload
      },
    billingPeriodUpdated:
      (state, action: PayloadAction<TBillingPeriodUpdate>) => {
        const { id, ...changes } = action.payload
        billingPeriodAdapter.updateOne(state.billingPeriods, { id, changes })
      },
    currentBillingPeriodIdChanged:
      (state, action: PayloadAction<TBillingPeriodKey>) => {
        state.currentBillingPeriodId = action.payload
      },
    currentPaymentPlanIdChanged:
      (state, action: PayloadAction<string>) => {
        state.currentPaymentPlanId = action.payload
      },
    paymentPlanOptionsChanged:
      (state, action: PayloadAction<TPaymentPlanOption[]>) => {
        state.paymentPlanOptions = action.payload
      },
    includedPlanOptionsChanged:
      (state, action: PayloadAction<TIncludedPlanOption[]>) => {
        state.includedPlanOptions = action.payload
      },
  },
  selectors: {
    selectPaymentWidgetOpen:
      (state) => state.paymentWidgetOpen,
    selectCurrentBillingPeriodId:
      (state) => state.currentBillingPeriodId,
    selectCurrentPaymentPlanId:
      (state) => state.currentPaymentPlanId,
    // selectCheapestBillingPlanId:
    //   (state) => state.cheapestBillingPlanId,

    selectPaymentPlansFetchStatus:
      (state) => state.paymentPlansFetchStatus,
    selectPaymentPlansFetchError:
      (state) => state.paymentPlansFetchError,
    selectPaymentInfoFetchStatus:
      (state) => state.paymentInfoFetchStatus,
    selectPaymentInfoFetchError:
      (state) => state.paymentInfoFetchError,
    selectBalance:
      (state) => state.balance,
    selectPaymentPlan:
      (state) => state.paymentPlan,
    selectPaymentPlanStartDate:
      (state) => state.paymentPlanStartDate,
    selectPaymentPlanEndDate:
      (state) => state.paymentPlanEndDate,
    selectPurchasedPaymentPlanOptions:
      (state) => state.purchasedPaymentPlanOptions,
    selectIsTrialPeriod:
      (state) => state.isTrialPeriod,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentPlansThunk.pending, (state) => {
        state.paymentPlansFetchStatus = 'pending'
      })

      .addCase(fetchPaymentPlansThunk.fulfilled, (state, action) => {
        const payload = action.payload
        paymentPlanAdapter.setAll(state.paymentPlans, payload)

        state.paymentPlansFetchError = null
        state.paymentPlansFetchStatus = 'succeeded'

        if (action.payload.length === 0) {
          // toast
          console.log('0 plans')
          return
        }
        
        const paymentPlans = action.payload.sort(
          (a, b) => Number(a.yearlyPrice) - Number(b.yearlyPrice)
        )
        
        const cheapestPlan = paymentPlans[0]
        state.currentPaymentPlanId = cheapestPlan.id

        console.log('[fetchPaymentPlansThunk.fulfilled] ' + cheapestPlan.name)

        const includedPlanOptions =
          cheapestPlan.includedPlanOptions.map((value) => {
            const result: TIncludedPlanOption = {
              type: value.type as TPaymentPlanOptionType,
              name: value.name,
            }
            return result
          })
        state.includedPlanOptions = includedPlanOptions
        console.log('[fetchPaymentPlansThunk.fulfilled][includedPlanOptions]', includedPlanOptions)


        const paymentPlanOptions =
          cheapestPlan.paymentPlanOptions.map((value) => {
            const result: TPaymentPlanOption = {
              enabled: false,
              isBilledAnnually: value.isBilledAnnually,
              name: value.name,
              price: value.price,
              type: value.type as TPaymentPlanOptionType,
            }
            return result
          })
        state.paymentPlanOptions = paymentPlanOptions
        console.log('[fetchPaymentPlansThunk.fulfilled][paymentPlanOptions]', paymentPlanOptions)
      })

      .addCase(fetchPaymentPlansThunk.rejected, (state, action) => {
        state.paymentPlansFetchStatus = 'rejected'
        state.paymentPlansFetchError = action.error.message
          || 'Не удалось загрузить тарифы'
      })

      .addCase(fetchUserPaymentInfoThunk.pending, (state) => {
        state.paymentInfoFetchStatus = 'pending'
      })

      .addCase(fetchUserPaymentInfoThunk.fulfilled, (state, action) => {
        state.paymentInfoFetchStatus = 'succeeded'
        state.paymentInfoFetchError = null

        const payload = action.payload

        if (!payload.paymentPlan) {
          state.paymentInfoFetchStatus = 'rejected'
          state.paymentInfoFetchError = 'Не удалось загрузить тарифнвй план'
          return
        }

        state.balance = payload.balance
        state.paymentPlan = payload.paymentPlan
        // state.currentPaymentPlanId = payload.paymentPlan.id
        state.paymentPlanStartDate = payload.paymentPlanStartDate
        state.paymentPlanEndDate = payload.paymentPlanEndDate
        state.purchasedPaymentPlanOptions = payload.purchasedPaymentPlanOptions
        state.isTrialPeriod = !payload.usedTrialPeriod
      })

      .addCase(fetchUserPaymentInfoThunk.rejected, (state, action) => {
        state.paymentInfoFetchStatus = 'rejected'
        state.paymentInfoFetchError = action.error.message
          || 'Не удалось загрузить информацию о текущем тарифе'
      })
  },
})

export const {
  paymentWidgetOpenChanged,
  billingPeriodUpdated,
  currentBillingPeriodIdChanged,
  currentPaymentPlanIdChanged,
  paymentPlanOptionsChanged,
  includedPlanOptionsChanged,
} = paymentSlice.actions

startAppListening({
  actionCreator: currentPaymentPlanIdChanged,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState()
    const plan = selectPaymentPlanById(state, action.payload)

    console.log('[startAppListening]', plan.name)

    const includedPlanOptions = plan.includedPlanOptions.map((value) => {
      const result: TIncludedPlanOption = {
        type: value.type as TPaymentPlanOptionType,
        name: value.name,
      }
      return result
    })

    listenerApi.dispatch(includedPlanOptionsChanged(includedPlanOptions))
    console.log('[startAppListening][includedPlanOptions]', includedPlanOptions)

    const paymentPlanOptions = plan.paymentPlanOptions.map((value) => {
      const result: TPaymentPlanOption = {
        enabled: false,
        isBilledAnnually: value.isBilledAnnually,
        name: value.name,
        price: value.price,
        type: value.type as TPaymentPlanOptionType,
      }
      return result
    })
    
    listenerApi.dispatch(paymentPlanOptionsChanged(paymentPlanOptions))
    console.log('[startAppListening][paymentPlanOptions]', paymentPlanOptions)
  }
})

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof paymentSlice> {}
}

export const injectedPaymentSlice = paymentSlice.injectInto(rootReducer)

export const {
  selectPaymentWidgetOpen,
  selectCurrentBillingPeriodId,
  selectCurrentPaymentPlanId,
  // selectCheapestBillingPlanId,

  selectPaymentPlansFetchStatus,
  selectPaymentPlansFetchError,
  selectPaymentInfoFetchStatus,
  selectPaymentInfoFetchError,
  selectBalance,
  selectIsTrialPeriod,
  selectPaymentPlan,
  selectPaymentPlanStartDate,
  selectPaymentPlanEndDate,
  selectPurchasedPaymentPlanOptions,
} = injectedPaymentSlice.selectors

export const {
  selectAll: selectAllPaymentPlans,
  selectById: selectPaymentPlanById,
  selectIds: selectPaymentPlanIds,
} = paymentPlanAdapter.getSelectors(
  (state: RootState) => state.payment?.paymentPlans
    || paymentPlanAdapter.getInitialState()
)

export const {
  selectAll: selectAllBillingPeriods,
  selectById: selectBillingPeiodById,
  selectIds: selectBillingPeriodIds,
} = billingPeriodAdapter.getSelectors(
  (state: RootState) => state.payment?.billingPeriods
    || billingPeriodAdapter.getInitialState()
)