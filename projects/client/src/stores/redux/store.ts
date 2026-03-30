import {
  configureStore,
  type Action,
  type ThunkAction,
} from '@reduxjs/toolkit'

import editorReducer from './editorSlice'
import notificationReducer from '@/layouts/Widgets/Notification/notificationSlice'

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    notification: notificationReducer,
  },
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
