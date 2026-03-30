// import type {
//   DisplaySettings,
//   FieldsSettings,
//   IntegrationSettings,
// } from '@/stores/widgetSettings/types'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type {
//   NotificationWidgetType,
// } from '@lemnity/widget-config/widgets/notification'

// import { uuidv4 } from '@/common/utils/uuidv4'


// export const notificationWidgetDefaults: NotificationWidgetType = {
//   type: WidgetTypeEnum.NOTIFICATION,

//   triggerText: '',
//   triggerBackgroundColor: '#5951E5',
//   triggerFontColor: '#FFFFFF',
//   triggerIcon: 'Sparkles',
//   triggerPosition: 'bottom-right',

//   delay: 10,

//   notifications: [
//     {
//       id: uuidv4(),
//       expiration: '24',
//       text: 'Добавить поле',
//       url: 'https://lemnity.ru',
//       urlFontSize: 16,
//       urlText: 'Подробнее >',
//     },
//   ],

//   brandingEnabled: true,
// }

// export const buildNotificationWidgetSettings = (): NotificationWidgetType =>
//   notificationWidgetDefaults

// export const buildNotificationFieldsSettings = (): FieldsSettings =>
//   ({}) as FieldsSettings
// export const buildNotificationDisplaySettings = (): DisplaySettings =>
//   ({}) as DisplaySettings
// export const buildNotificationIntegrationSettings = (): IntegrationSettings =>
//   ({}) as IntegrationSettings
