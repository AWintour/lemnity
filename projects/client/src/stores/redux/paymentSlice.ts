import {
  createEntityAdapter,
  createSlice,
  type WithSlice,
} from '@reduxjs/toolkit'

import { createAppAsyncThunk, type FetchStatus } from './store'
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

type PaymentState = {
  paymentPlansFetchStatus: FetchStatus
  paymeentPlansFetchError: string | null
  paymentPlans: PaymentPlanEntities
}

export const initialState: PaymentState = {
  paymentPlansFetchStatus: 'idle',
  paymeentPlansFetchError: null,
  paymentPlans: {
    ...paymentPlanAdapter.getInitialState({})
  },
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  selectors: {
    selectPaymentPlansFetchStatus:
      (state) => state.paymentPlansFetchStatus,
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

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof paymentSlice> {}
}

export const injectedPaymentSlice = paymentSlice.injectInto(rootReducer)

export const {
  selectPaymentPlansFetchStatus,
} = injectedPaymentSlice.selectors

export const {
  selectAll: selectAllPaymentPlans,
  selectById: selectPaymentPlanById,
  selectIds: selectPaymentPlanIds,
} = paymentPlanAdapter.getSelectors()