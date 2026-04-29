import {
  createEntityAdapter,
  createSlice,
  nanoid,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

import { createAppAsyncThunk, type FetchStatus, type RootState } from './store'
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
  // UI state
  paymentWidgetOpen: boolean
  currentBillingPeriodId: BillingPeriodKey
  currentPaymentPlanId: string
  // cheapestBillingPlanId: string

  // server state
  paymentPlansFetchStatus: FetchStatus
  paymentPlansFetchError: string | null
  paymentInfoFetchStatus: FetchStatus
  paymentInfoFetchError: string | null
  paymentPlans: PaymentPlanEntities
  billingPeriods: BillingPeriodEntities
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

export const initialState: PaymentState = {
  paymentWidgetOpen: false,
  currentBillingPeriodId: 'month',
  currentPaymentPlanId: paymentPlanId,
  // cheapestBillingPlanId: paymentPlanId,

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
      (state, action: PayloadAction<BillingPeriodUpdate>) => {
        const { id, ...changes } = action.payload
        billingPeriodAdapter.updateOne(state.billingPeriods, { id, changes })
      },
    currentBillingPeriodIdChanged:
      (state, action: PayloadAction<BillingPeriodKey>) => {
        state.currentBillingPeriodId = action.payload
      },
    currentPaymentPlanIdChanged:
      (state, action: PayloadAction<string>) => {
        state.currentPaymentPlanId = action.payload
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
        state.paymentPlansFetchStatus = 'succeeded'
        state.paymentPlansFetchError = null

        const payload = action.payload

        paymentPlanAdapter.setAll(state.paymentPlans, payload)

        // let cheapestPlanId: string = ''
        // let cheapestPrice: number = Number.MAX_SAFE_INTEGER

        // payload.forEach((value) => {
        //   const price = Number(value.yearlyPrice)

        //   if (price < cheapestPrice) {
        //     cheapestPlanId = value.id
        //     cheapestPrice = price
        //   }
        // })

        // state.cheapestBillingPlanId = cheapestPlanId
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
        state.currentPaymentPlanId = payload.paymentPlan.id
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
} = paymentSlice.actions

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