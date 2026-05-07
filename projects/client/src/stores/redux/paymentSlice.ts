import {
  createEntityAdapter,
  createSlice,
  isAnyOf,
  nanoid,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

import {
  // createAppAsyncThunk,
  startAppListening,
  type FetchStatus,
  type RootState,
} from './store'
import { rootReducer } from '@/stores/redux/reducer'
import { fetchPaymentPlans, fetchPaymentInfo } from '@/services/payment'
import {
  thunkWithFetchGuardFactory,
} from './factories/thunkWithFetchGuardFactory'

import type {
  PaymentInfoPaymentOptionDto,
  PaymentPlanDto,
  PromoDto,
} from '@lemnity/api-sdk'

export const fetchPaymentPlansThunk = thunkWithFetchGuardFactory(
  'payment/fetchPlans',
  async () => {
    const { data } = await fetchPaymentPlans()
    return data
  },
  (state) => state.payment!.paymentPlansFetchStatus
)

export const fetchUserPaymentInfoThunk = thunkWithFetchGuardFactory(
  'payment/fetchInfo',
  async () => {
    const { data } = await fetchPaymentInfo()
    return data
  },
  (state) => state.payment!.paymentInfoFetchStatus
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

export type TPaymentPlanOptionType = 'BRANDING'

export type TPaymentPlanOption = {
  type: TPaymentPlanOptionType
  enabled: boolean
  name: string
  price: string
  isBilledAnnually: boolean
}

export type TIncludedPlanOption = {
  type: TPaymentPlanOptionType
  name: string
}

const extractIncludedPlanOptions =
  (plan: PaymentPlanDto):TIncludedPlanOption[] => {
    if (!plan.includedPlanOptions) {
      return []
    }

    const includedPlanOptions = plan.includedPlanOptions.map((value) => {
      const result: TIncludedPlanOption = {
        type: value.type as TPaymentPlanOptionType,
        name: value.name,
      }
      return result
    })
    return includedPlanOptions
  }

const extractPaymentPlanOptions =
  (plan: PaymentPlanDto):TPaymentPlanOption[] => {
    if (!plan.paymentPlanOptions) {
      return []
    }

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

    return paymentPlanOptions
  }

type TPaymentState = {
  // UI state
  paymentWidgetOpen: boolean
  currentBillingPeriodId: TBillingPeriodKey
  currentPaymentPlanId: string
  paymentPlanOptions: TPaymentPlanOption[]
  includedPlanOptions: TIncludedPlanOption[]
  isPlanOptionAddedToCart: Partial<Record<TPaymentPlanOptionType, boolean>>
  // this one is user input
  promo: string

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
  dbPromo?: PromoDto

  // payment process state
  paymentId?: string
}

const now = DateTime.now()
const paymentPlanId = nanoid()
const defaultPaymentPlan: PaymentPlanDto = {
  id: paymentPlanId,
  createdAt: '',
  updatedAt: '',
  enabled: true,
  includedPlanOptions: [],
  monthlyPrice: '0',
  name: 'Тестовый',
  numberOfProjects: 5,
  numberOfWidgets: 15,
  paymentPlanOptions: [],
  quarterlyPrice: '0',
  yearlyPrice: '0',
}

export const initialState: TPaymentState = {
  paymentWidgetOpen: false,
  currentBillingPeriodId: 'month',
  currentPaymentPlanId: paymentPlanId,
  paymentPlanOptions: [],
  includedPlanOptions: [],
  isPlanOptionAddedToCart: {},
  promo: '',

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
    planOptionCartStateChanged:
      (
        state,
        action: PayloadAction<{ type: TPaymentPlanOptionType, value: boolean }>
      ) => {
        const payload = action.payload
        state.isPlanOptionAddedToCart[payload.type] = payload.value
      },
    paymentPlanAdded:
      (state, action: PayloadAction<PaymentPlanDto>) => {
        paymentPlanAdapter.addOne(state.paymentPlans, action.payload)
      },
    // user input
    promoChanged:
      (state, action: PayloadAction<string>) => {
        state.promo = action.payload
      },
    // prmo from db
    dbPromoChanged:
      (state, action: PayloadAction<PromoDto>) => {
        state.dbPromo = action.payload
      },
    paymentIdChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.paymentId = action.payload
      },
  },
  selectors: {
    selectPaymentWidgetOpen:
      (state) => state.paymentWidgetOpen,
    selectCurrentBillingPeriodId:
      (state) => state.currentBillingPeriodId,
    selectCurrentPaymentPlanId:
      (state) => state.currentPaymentPlanId,
    selectPaymentPlanOptions:
      (state) => state.paymentPlanOptions,
    selectIncludedPlanOptions:
      (state) => state.includedPlanOptions,
    selectIsPlanOptionAddedToCart:
      (state) => state.isPlanOptionAddedToCart,
    selectPromo:
      (state) => state.promo,

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
    selectDbPromo:
      (state) => state.dbPromo,
    
    selectPaymentId:
      (state) => state.paymentId,
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

        const includedPlanOptions = extractIncludedPlanOptions(cheapestPlan)
        state.includedPlanOptions = includedPlanOptions

        const paymentPlanOptions = extractPaymentPlanOptions(cheapestPlan)
        state.paymentPlanOptions = paymentPlanOptions
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
        const payload = action.payload

        if (!payload.paymentPlan) {
          // trial period
          // this logic might actually be broken
          // i have spent 0 seconds thinking this over
          state.paymentPlan = defaultPaymentPlan
          state.paymentPlanStartDate = initialState.paymentPlanStartDate
          state.paymentPlanEndDate = initialState.paymentPlanEndDate
          state.purchasedPaymentPlanOptions = []
          state.isTrialPeriod = !payload.usedTrialPeriod

          state.paymentInfoFetchStatus = 'succeeded'
          state.paymentInfoFetchError = null
          return
        }

        state.balance = payload.balance
        state.paymentPlan = payload.paymentPlan
        state.paymentPlanStartDate = payload.paymentPlanStartDate
        state.paymentPlanEndDate = payload.paymentPlanEndDate
        state.purchasedPaymentPlanOptions = payload.purchasedPaymentPlanOptions
        state.isTrialPeriod = !payload.usedTrialPeriod

        state.paymentInfoFetchStatus = 'succeeded'
        state.paymentInfoFetchError = null
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
  planOptionCartStateChanged,
  paymentPlanAdded,
  promoChanged,
  dbPromoChanged,
  paymentIdChanged,
} = paymentSlice.actions

// this middleware runs once both fetchUserPaymentInfoThunk
// and fetchPaymentPlansThunk have finished their requests and reducers
// if current user's payment plan is only applied to them
// this plan is added to the list of available plans
// otherwise currentPaymentPlanId is set to either the previously paid for plan
// or - if no purchase history exists - the cheapest one
startAppListening({
  matcher: isAnyOf(
    fetchUserPaymentInfoThunk.fulfilled, fetchUserPaymentInfoThunk.rejected,
    fetchPaymentPlansThunk.fulfilled, fetchPaymentPlansThunk.rejected
  ),
  effect: (_, listenerApi) => {
    const state = listenerApi.getState()
    const { paymentInfoFetchStatus, paymentPlansFetchStatus } = state.payment!

    const bothFinished = 
      (
        paymentInfoFetchStatus === 'succeeded'
        || paymentInfoFetchStatus === 'rejected'
      )
      &&
      (
        paymentPlansFetchStatus === 'succeeded'
        || paymentPlansFetchStatus === 'rejected'
      )
    
    if (!bothFinished) {
      console.log(
        '[startAppListening] both thunks have not finished executing yet'
      )
      return
    }

    const anyRejected =
     paymentInfoFetchStatus === 'rejected'
     || paymentPlansFetchStatus === 'rejected'
    
    if (anyRejected) {
      // toast
      console.log(
        '[startAppListening] one or both of the requests were rejected'
      )
      return
    }

    const currentPlan = state.payment!.paymentPlan
    const paymentPlans = selectAllPaymentPlans(state)

    const isUniquePlan = paymentPlans.find(
      (value) => value.id === currentPlan.id
    )

    console.log({ isUniquePlan })
    console.log({ currentPlan })

    if (isUniquePlan !== undefined) {
      console.log('[startAppListening] the plan isnt unique')
      console.log('[startAppListening] currentPlan', currentPlan.name)
      
      if (!currentPlan.id) {
        const cheapestPlan = paymentPlans[0]
        listenerApi.dispatch(currentPaymentPlanIdChanged(cheapestPlan.id))
        console.log('[startAppListening] set to cheapest plan')
      }

      listenerApi.dispatch(currentPaymentPlanIdChanged(currentPlan.id))
      return
    }

    listenerApi.dispatch(paymentPlanAdded(currentPlan))
    listenerApi.dispatch(currentPaymentPlanIdChanged(currentPlan.id))
  },
})

startAppListening({
  actionCreator: currentPaymentPlanIdChanged,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState()
    const plan = selectPaymentPlanById(state, action.payload)

    console.log('[startAppListening] plan', plan.name)

    const includedPlanOptions = extractIncludedPlanOptions(plan)
    listenerApi.dispatch(includedPlanOptionsChanged(includedPlanOptions))
    console.log('[startAppListening] includedPlanOptions', includedPlanOptions)

    const paymentPlanOptions = extractPaymentPlanOptions(plan)
    listenerApi.dispatch(paymentPlanOptionsChanged(paymentPlanOptions))
    console.log('[startAppListening] paymentPlanOptions', paymentPlanOptions)
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
  selectIncludedPlanOptions,
  selectPaymentPlanOptions,
  selectIsPlanOptionAddedToCart,
  selectPromo,

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
  selectDbPromo,
  selectPaymentId,
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
