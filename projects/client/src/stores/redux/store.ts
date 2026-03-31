import {
  configureStore,
  createAsyncThunk,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit'

import { rootReducer } from './reducer'

import { WidgetTypeEnum } from '@lemnity/api-sdk'
import {
  type NotificationWidgetType,
} from '@lemnity/widget-config/widgets/notification'

export const store = configureStore({
  reducer: rootReducer,
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
  widget: NotificationWidgetType
  // legacy
  fields?: object
  display?: object
  integration?: object
  actions?: []
}
