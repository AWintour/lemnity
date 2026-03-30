//  import type {
//   TypedWidgetUpdater,
// } from '@/stores/widgetSettings/widgetActions/types'
// import type { Icon } from '@lemnity/widget-config/widgets/base'
// import type {
//   NotificationWidgetType,
//   Notification,
//   Position,
// } from '@lemnity/widget-config/widgets/notification'

// export const createNotificationActions = (
//   updateWidget: TypedWidgetUpdater<NotificationWidgetType>
// ) => ({
//   setNotificationTriggerText: (
//    triggerText: string
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         triggerText,
//       }
//     }),
//   setNotificationTriggerFontColor: (
//    triggerFontColor: string
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         triggerFontColor,
//       }
//     }),
//   setNotificationTriggerIcon: (
//    triggerIcon: Icon
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         triggerIcon,
//       }
//     }),
//   setNotificationTriggerBackgroundColor: (
//    triggerBackgroundColor: string
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         triggerBackgroundColor,
//       }
//     }),
//   setNotificationTriggerPosition: (
//    triggerPosition: Position
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         triggerPosition,
//       }
//     }),
//   setNotificationDelay: (
//    delay: number
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         delay,
//       }
//     }),
//   setNotifications: (
//     notifications: Notification[]
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         notifications: [
//           ...notifications,
//         ],
//       }
//     }),
//   addNotification: (
//     notification: Notification
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         notifications: [
//           ...widget.notifications,
//           notification,
//         ],
//       }
//     }),
//   deleteNotification: (
//     id: string
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         notifications: widget.notifications.filter(item => item.id !== id),
//       }
//     }),
//   updateNotification: (
//     index: number,
//     updates: Partial<Notification>
//   ) =>
//     updateWidget(widget => {
//       return {
//         ...widget,
//         notifications: widget.notifications.map((item, i) => {
//           return i === index ? { ...item, ...updates } : item
//         }),
//       }
//     }),
//   // General
//   setNotificationBrandingEnabled: (
//     brandingEnabled: boolean
//   ) => 
//     updateWidget(widget => {
//       return {
//         ...widget,
//         brandingEnabled,
//       }
//     }),
// })