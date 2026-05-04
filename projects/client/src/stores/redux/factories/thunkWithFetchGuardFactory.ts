import type { AsyncThunkPayloadCreator } from '@reduxjs/toolkit'
import { createAppAsyncThunk, type FetchStatus, type RootState } from '../store'

/**
 * A factory that produces Redux thunks with fetch guuard.
 * The resulting thunk will only proceed with fetching if the status
 * returned by `selectFetchStatus` is neither `pending` nor `succeeded`
 * 
 * @param actionName name of the redux action! >w<
 * @param payloadCreator RTK's `createAppAsyncThunk` payloadCreator
 * @param selectFetchStatus a selector for the `FetchStatus`
 * @returns an `AsyncThunk`. durrr.
 * 
 * @example
 *   // this action should be dispatched when the store is aleady mounted
 *   // if it's not then we are having a bigger problem
 *   export const fetchPaymentPlansThunk = thunkWithFetchGuardFactory(
 *     'payment/fetchPlans',
 *     async () => {
 *       const { data } = await fetchPaymentPlans()
 *       return data
 *     },
 *     (state) => state.payment!.paymentPlansFetchStatus
 *   )
 * 
 *   // later in some React component
 *   dispatch(fetchPaymentPlansThunk())
 */
export const thunkWithFetchGuardFactory = <Returned, ThunkArg = void>(
  actionName:
    string,
  payloadCreator:
    AsyncThunkPayloadCreator<Returned, ThunkArg, { state: RootState }>,
  selectFetchStatus:
    (state: RootState) => FetchStatus
) => {
  const thunk = createAppAsyncThunk(
    actionName,
    payloadCreator,
    {
      condition(_, thunkApi) {
        let fetchStatus: FetchStatus = 'idle'

        try {
          fetchStatus = selectFetchStatus(thunkApi.getState())
        }
        catch {
          // slice might not be mounted yet
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
    },
  )

  return thunk
}