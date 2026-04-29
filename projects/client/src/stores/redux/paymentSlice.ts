import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import { createAppAsyncThunk, type FetchStatus, type RootState } from './store'
import { rootReducer } from '@/stores/redux/reducer'

import { fetchPaymentPlans } from '@/services/payment'
import type { PaymentPlanDto } from '@lemnity/api-sdk'

const fetchPaymentPlansThunk = createAppAsyncThunk(
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

const paymentPlanAdapter = createEntityAdapter<PaymentPlanDto>()

export type PaymentPlanEntities =
  ReturnType<typeof paymentPlanAdapter.getInitialState>

export type BillingPeriodKey = 'month' | 'quarter' | 'year'

export type BillingPeriod = {
  id: BillingPeriodKey
  label: string
  discount: number
  months: number
}

const billingPeriodAdapter = createEntityAdapter<BillingPeriod>()

export type BillingPeriodEntities =
  ReturnType<typeof billingPeriodAdapter.getInitialState>

type BillingPeriodUpdate =
  Pick<BillingPeriod, 'id'>
  & Partial<Omit<BillingPeriod, 'id'>>

const defaultBillingPeriods: BillingPeriod[] = [
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

type PaymentState = {
  paymentPlansFetchStatus: FetchStatus
  paymeentPlansFetchError: string | null
  paymentPlans: PaymentPlanEntities
  paymentWidgetOpen: boolean
  billingPeriods: BillingPeriodEntities
  isTrialPeriod: boolean
}

export const initialState: PaymentState = {
  paymentPlansFetchStatus: 'idle',
  paymeentPlansFetchError: null,
  paymentPlans: { ...paymentPlanAdapter.getInitialState({}) },
  paymentWidgetOpen: false,
  billingPeriods: {
    ...billingPeriodAdapter.getInitialState({}, defaultBillingPeriods),
  },
  isTrialPeriod: false,
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
      (state, action: PayloadAction<BillingPeriodUpdate>) => {
        const { id, ...changes } = action.payload
        billingPeriodAdapter.updateOne(state.billingPeriods, { id, changes })
      },
  },
  selectors: {
    selectPaymentPlansFetchStatus:
      (state) => state.paymentPlansFetchStatus,
    selectPaymentWidgetOpen:
      (state) => state.paymentWidgetOpen,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentPlansThunk.pending, (state) => {
        state.paymentPlansFetchStatus = 'pending'
      })
      .addCase(fetchPaymentPlansThunk.fulfilled, (state, action) => {
        state.paymentPlansFetchStatus = 'succeeded'
        state.paymeentPlansFetchError = null

        const payload = action.payload

        paymentPlanAdapter.setAll(state.paymentPlans, payload)
      })
      .addCase(fetchPaymentPlansThunk.rejected, (state, action) => {
        state.paymentPlansFetchStatus = 'rejected'
        state.paymeentPlansFetchError = action.error.message
          || 'Не удалось загрузить тарифы'
      })
  },
})

export const {
  paymentWidgetOpenChanged,
} = paymentSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof paymentSlice> {}
}

export const injectedPaymentSlice = paymentSlice.injectInto(rootReducer)

export const {
  selectPaymentPlansFetchStatus,
  selectPaymentWidgetOpen,
} = injectedPaymentSlice.selectors

export const {
  selectAll: selectAllPaymentPlans,
  selectById: selectPaymentPlanById,
  selectIds: selectPaymentPlanIds,
} = paymentPlanAdapter.getSelectors()

export const {
  selectAll: selectAllBillingPeriods,
  selectById: selectBillingPeiodById,
  selectIds: selectBillingPeriodIds,
} = billingPeriodAdapter.getSelectors(
  (state: RootState) => state.payment?.billingPeriods
    || billingPeriodAdapter.getInitialState()
)