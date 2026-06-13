import {
  WidgetTypeEnum,
} from '@lemnity/api-sdk'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'
import {
  createWheelActions,
} from '@/layouts/Widgets/WheelOfFortune/actions'
import {
  createActionTimerActions,
} from '@/layouts/Widgets/CountDown/actions'
import {
  createFABMenuActions,
} from '@/layouts/Widgets/FABMenu/actions'
import {
  createAnnouncementActions,
} from '@/layouts/Widgets/Announcement/actions'
import {
  createEventTimerActions,
} from '@/layouts/Widgets/EventTimer/actions'
import {
  createNotificationActions,
} from '@/layouts/Widgets/Notification/actions'
import {
  createVideoWidgetActions,
} from '@/layouts/Widgets/VideoWidget/actions'
import {
  createCallbackActions,
} from '@/layouts/Widgets/Callback/actions'
import type {
  CallbackWidgetType,
} from '@/layouts/Widgets/Callback/defaults'
import {
  createChatActions,
} from '@/layouts/Widgets/Chat/actions'

import type {
  ActionTimerWidgetSettings,
  WidgetSpecificSettings,
} from './types'
import type {
  WidgetActions,
  WidgetSlice,
  WidgetUpdater,
  TypedWidgetUpdater
} from './widgetActions/types'
import type {
  WheelOfFortuneWidgetSettings,
} from '@/stores/widgetSettings/types'
import type {
  FABMenuWidgetSettings,
} from '@/layouts/Widgets/FABMenu/types'
import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import type {
  NotificationWidgetType,
} from '@lemnity/widget-config/widgets/notification'
import type {
  VideoWidgetType,
} from '@lemnity/widget-config/widgets/video-widget'
import type {
  ChatWidgetType,
} from '@lemnity/widget-config/widgets/chat'

export const createWidgetSlice = (updateWidget: WidgetUpdater): WidgetSlice => {
  const createTypedUpdater = <T extends WidgetSpecificSettings>(
    predicate: (widget: WidgetSpecificSettings) => widget is T
  ) =>
    (mutator: (settings: T) => T) =>
      updateWidget(
        widget => (
          predicate(widget)
            ? mutator(widget as T)
            : widget
        )
      )

  const wheelUpdater: TypedWidgetUpdater<WheelOfFortuneWidgetSettings> =
    createTypedUpdater(
      // Колесо и его клон «Конвейер Удачи» используют один и тот же набор экшенов редактора.
      (widget): widget is WheelOfFortuneWidgetSettings =>
        isWheelLikeWidgetType(widget.type)
    )

  const actionTimerUpdater: TypedWidgetUpdater<ActionTimerWidgetSettings> =
    createTypedUpdater(
      (widget): widget is ActionTimerWidgetSettings =>
        widget.type === WidgetTypeEnum.ACTION_TIMER
    )

  const fabMenuUpdater: TypedWidgetUpdater<FABMenuWidgetSettings> =
    createTypedUpdater(
      (widget): widget is FABMenuWidgetSettings =>
        widget.type === WidgetTypeEnum.FAB_MENU
    )

  const announcementUpdater: TypedWidgetUpdater<AnnouncementWidgetType> =
    createTypedUpdater(
      (widget): widget is AnnouncementWidgetType =>
          widget.type === WidgetTypeEnum.ANNOUNCEMENT
    )
  
  const eventTimerUpdater: TypedWidgetUpdater<EventTimertWidgetType> =
    createTypedUpdater(
      (widget): widget is EventTimertWidgetType =>
          widget.type === WidgetTypeEnum.EVENT_TIMER
    )

  const notificationUpdater: TypedWidgetUpdater<NotificationWidgetType> =
    createTypedUpdater(
      (widget): widget is NotificationWidgetType =>
          widget.type === WidgetTypeEnum.NOTIFICATION
    )

  const videoWidgetUpdater: TypedWidgetUpdater<VideoWidgetType> =
    createTypedUpdater(
      (widget): widget is VideoWidgetType =>
          widget.type === WidgetTypeEnum.VIDEO_WIDGET
    )

  const callbackUpdater: TypedWidgetUpdater<CallbackWidgetType> =
    createTypedUpdater(
      (widget): widget is CallbackWidgetType =>
          (widget as { type?: string }).type === WidgetTypeEnum.CALLBACK
    )

  const chatUpdater: TypedWidgetUpdater<ChatWidgetType> =
    createTypedUpdater(
      (widget): widget is ChatWidgetType =>
          (widget as { type?: string }).type === WidgetTypeEnum.CHAT
    )

  const specificActions = {
    ...createWheelActions(wheelUpdater),
    ...createActionTimerActions(actionTimerUpdater),
    ...createFABMenuActions(fabMenuUpdater),
    ...createAnnouncementActions(announcementUpdater),
    ...createEventTimerActions(eventTimerUpdater),
    ...createNotificationActions(notificationUpdater),
    ...createVideoWidgetActions(videoWidgetUpdater),
    ...createCallbackActions(callbackUpdater),
    ...createChatActions(chatUpdater),
  } as Omit<WidgetActions, 'setWidgetType'>

  return {
    widgetSettingsUpdater: updateWidget,
    setWidgetType: (
      widgetType: WidgetTypeEnum,
      nextSettings: WidgetSpecificSettings
    ) =>
      updateWidget(
        () => ({ ...nextSettings, type: widgetType }) as WidgetSpecificSettings
      ),
      ...specificActions
  }
}
