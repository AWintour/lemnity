import {
  configureStore,
  createAsyncThunk,
  createListenerMiddleware,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit'

import { rootReducer } from './reducer'

import { WidgetTypeEnum } from '@lemnity/api-sdk'

export const listenerMiddleware = createListenerMiddleware()

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()

export type FetchStatus = 'idle' | 'pending' | 'succeeded' | 'rejected'

export type WidgetSettings = {
  id: string
  widgetType: WidgetTypeEnum
  widget: object
  // legacy
  fields?: object
  display?: object
  integration?: object
  actions?: []
}
