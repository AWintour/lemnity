import {
  nanoid,
  createSlice,
  createEntityAdapter,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import {
  type RootState,
  type FetchStatus,
  type WidgetSettings,
} from '@/stores/redux/store'
import { rootReducer } from '@/stores/redux/reducer'
import {
  fetchWidgetThunkFactory,
  saveWidgetThunkFactory,
} from '@/stores/redux/factories'
import {
  commonReducers,
  commonSelectors,
} from '@/stores/redux/features/common'
import {
  triggerBackgroundColorReducer,
  triggerFontColorReducer,
  triggerIconReducer,
  triggerPositionReducer,
  triggerTextReducer,

  selectTriggerText as selectTriggerTextFeature,
  selectTriggerBackgroundColor as selectTriggerBackgroundColorFeature,
  selectTriggerFontColor as selectTriggerFontColorFeature,
  selectTriggerIcon as selectTriggerIconFeature,
  selectTriggerPosition as selectTriggerPositionFeature,
} from '@/stores/redux/features/triggerSettings'

import {
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'
import {
  type NotificationWidgetType,
  type Notification,
} from '@lemnity/widget-config/widgets/notification'
import {
  type TriggerType,
} from '@lemnity/widget-config/features/trigger'

export const fetchNotificationWidget = fetchWidgetThunkFactory(
  'notification/fetchWidget',
  (state) => state.notification!.fetchStatus
)

// this action will only be dispatched when the store is aleady mounted
// if it's not then we are having a bigger problem
export const saveNotificationWidget = saveWidgetThunkFactory(
  'notification/saveWidget',
  (state) => state.notification!.widgetId,
  (state) => state.notification!.type,
  (state): NotificationWidgetType => ({
    type:
      state.notification!.type,
    trigger:
      state.notification!.trigger,
    delay:
      state.notification!.delay,
    notifications:
      selectAllNotifications(state),
    brandingEnabled:
      state.notification!.brandingEnabled,
  })
)

const notificationAdapter = createEntityAdapter<Notification>()

export type NotificationEntities =
  ReturnType<typeof notificationAdapter.getInitialState>

type NotificationWidgetState = Omit<NotificationWidgetType, 'notifications'> & {
  notifications: NotificationEntities
  widgetId?: string
  projectId?: string
  fetchStatus: FetchStatus
  fetchError: string | null
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
  fetchStatus: 'idle',
  fetchError: null,
  trigger: {
    triggerText: '',
    triggerBackgroundColor: '#5951E5',
    triggerFontColor: '#FFFFFF',
    triggerIcon: 'Sparkles',
    triggerPosition: 'bottom-right',
  },
  delay: 10,
  brandingEnabled: true,
  notifications: {
    ...notificationAdapter.getInitialState({}, defaultNotifications),
  },
}

const notificationTriggerSettingsReducers = {
  triggerTextChanged:
    triggerTextReducer,
  triggerBackgroundColorChanged:
    triggerBackgroundColorReducer,
  triggerFontColorChanged:
    triggerFontColorReducer,
  triggerIconChanged:
    triggerIconReducer,
  triggerPositionChanged:
    triggerPositionReducer,
}

const notificationTriggerSettingsSelectors = {
  selectTriggerText:
    selectTriggerTextFeature,
  selectTriggerBackgroundColor:
    selectTriggerBackgroundColorFeature,
  selectTriggerFontColor:
    selectTriggerFontColorFeature,
  selectTriggerIcon:
    selectTriggerIconFeature,
  selectTriggerPosition:
    selectTriggerPositionFeature,
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    ...commonReducers,
    ...notificationTriggerSettingsReducers,

    delayChanged:
      (state, action: PayloadAction<number>) => {
        state.delay = action.payload
      },
    notificationAdded:
      (state, action: PayloadAction<Notification>) => {
        notificationAdapter.addOne(state.notifications, action.payload)
      },
    notificationDeleted:
      (state, action: PayloadAction<string>) => {
        notificationAdapter.removeOne(state.notifications, action.payload)
      },
    notificationUpdated:
      (state, action: PayloadAction<NotificationUpdate>) => {
        const { id, ...changes } = action.payload
        notificationAdapter.updateOne(state.notifications, { id, changes })
      },
    notificationsReordered:
      (state, action: PayloadAction<string[]>) => {
        state.notifications.ids = action.payload
      },
  },
  selectors: {
    ...commonSelectors,
    ...notificationTriggerSettingsSelectors,

    selectDelay:
      (state) => state.delay,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationWidget.pending, (state) => {
        state.fetchStatus = 'pending'
      })
      .addCase(fetchNotificationWidget.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.fetchError = null

        const payload = action.payload as PublicWidget | undefined

        state.widgetId = payload?.id
        state.projectId = payload?.projectId

        const widgetConfig = payload?.config as WidgetSettings | undefined
        const widgetSettings = widgetConfig?.widget

        const settings = widgetSettings
          // copy default state if undefined
          || { ...initialState, notifications: [...defaultNotifications] }
        
        const {
          delay,
          notifications,
          brandingEnabled,
        } = settings as NotificationWidgetType

        state.delay = delay
        state.brandingEnabled = brandingEnabled

        notificationAdapter.setAll(state.notifications, notifications)

        // accomodation for legacy configs
        if ((settings as { trigger: TriggerType }).trigger) {
          state.trigger = (settings as { trigger: TriggerType }).trigger
        }
        else {
          const {
            triggerText,
            triggerBackgroundColor,
            triggerFontColor,
            triggerIcon,
            triggerPosition,
          } = settings as any

          state.trigger.triggerText = triggerText
          state.trigger.triggerBackgroundColor = triggerBackgroundColor
          state.trigger.triggerFontColor = triggerFontColor
          state.trigger.triggerIcon = triggerIcon
          state.trigger.triggerPosition = triggerPosition
        }
      })
      .addCase(fetchNotificationWidget.rejected, (state, action) => {
        state.fetchStatus = 'rejected'
        state.fetchError = action.error.message
          || 'Не удалось загрузить виджет'
      })
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
  selectFetchStatus,
  selectFetchError,
  selectWidgetId,
  selectProjectId,
} = injectedNotificationSlice.selectors

export default injectedNotificationSlice.reducer

export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationAdapter.getSelectors(
  (state: RootState) => state.notification?.notifications
    || notificationAdapter.getInitialState()
)
