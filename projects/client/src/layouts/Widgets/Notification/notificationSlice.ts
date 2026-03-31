import {
  nanoid,
  createSlice,
  createSelector,
  createEntityAdapter,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import { rootReducer } from '@/stores/redux/reducer'

import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type { RootState } from '@/stores/redux/store'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import {
  type NotificationWidgetType,
  type Position,
  type Notification,
} from '@lemnity/widget-config/widgets/notification'

const notificationAdapter = createEntityAdapter<Notification>()

export type NotificationEntities =
  ReturnType<typeof notificationAdapter.getInitialState>

type NotificationWidgetState = Omit<NotificationWidgetType, 'notifications'> & {
  notifications: NotificationEntities
}

type NotificationUpdate =
  Pick<Notification, 'id'>
  & Partial<Omit<Notification, 'id'>>

export const defaultNotifications: Notification[] = [
  {
    id: nanoid(),
    expiration: '24',
    text: 'Добавить поле',
    url: 'https://lemnity.ru',
    urlFontSize: 16,
    urlText: 'Подробнее >',
  },
]

const initialState: NotificationWidgetState = {
  type: WidgetTypeEnum.NOTIFICATION,
  triggerText: '',
  triggerBackgroundColor: '#5951E5',
  triggerFontColor: '#FFFFFF',
  triggerIcon: 'Sparkles',
  triggerPosition: 'bottom-right',
  delay: 10,
  brandingEnabled: true,
  notifications: {
    ...notificationAdapter.getInitialState({}, defaultNotifications),
  },
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    triggerTextChanged: (state, action: PayloadAction<string>) => {
      state.triggerText = action.payload
    },
    triggerBackgroundColorChanged: (state, action: PayloadAction<string>) => {
      state.triggerBackgroundColor = action.payload
    },
    triggerFontColorChanged: (state, action: PayloadAction<string>) => {
      state.triggerFontColor = action.payload
    },
    triggerIconChanged: (state, action: PayloadAction<Icon>) => {
      state.triggerIcon = action.payload
    },
    triggerPositionChanged: (state, action: PayloadAction<Position>) => {
      state.triggerPosition = action.payload
    },
    delayChanged: (state, action: PayloadAction<number>) => {
      state.delay = action.payload
    },
    brandingEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.brandingEnabled = action.payload
    },
    notificationAdded: (state, action: PayloadAction<Notification>) => {
      notificationAdapter.addOne(state.notifications, action.payload)
    },
    notificationDeleted: (state, action: PayloadAction<string>) => {
      notificationAdapter.removeOne(state.notifications, action.payload)
    },
    notificationUpdated: (state, action: PayloadAction<NotificationUpdate>) => {
      const { id, ...changes } = action.payload
      notificationAdapter.updateOne(state.notifications, { id, changes })
    },
    notificationsReordered: (state, action: PayloadAction<string[]>) => {
      state.notifications.ids = action.payload
    },
  },
  selectors: {
    selectTriggerText: (state) => state.triggerText,
    selectTriggerBackgroundColor: (state) => state.triggerBackgroundColor,
    selectTriggerFontColor: (state) => state.triggerFontColor,
    selectTriggerIcon: (state) => state.triggerIcon,
    selectTriggerPosition: (state) => state.triggerPosition,
    selectDelay: (state) => state.delay,
    selectBrandingEnabled: (state) => state.brandingEnabled,
  }
})

export const {
  triggerTextChanged,
  triggerBackgroundColorChanged,
  triggerFontColorChanged,
  triggerIconChanged,
  triggerPositionChanged,
  delayChanged,
  brandingEnabledChanged,
  notificationAdded,
  notificationDeleted,
  notificationUpdated,
  notificationsReordered,
} = notificationSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof notificationSlice> {}
}

const injectedNotificationSlice = notificationSlice.injectInto(rootReducer)

export const {
  selectTriggerText,
  selectTriggerBackgroundColor,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerPosition,
  selectDelay,
  selectBrandingEnabled,
} = injectedNotificationSlice.selectors

export default notificationSlice.reducer

export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationAdapter.getSelectors(
  (state: RootState) => state.notification?.notifications
    || notificationAdapter.getInitialState()
)
