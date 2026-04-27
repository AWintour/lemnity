// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type { ActionTimerWidgetSettings } from '@/stores/widgetSettings/types'
// import { buildFieldsSettings } from '@/layouts/Widgets/Common/formDefaults'

// export const buildActionTimerWidgetSettings = (): ActionTimerWidgetSettings => ({
//   type: WidgetTypeEnum.ACTION_TIMER,
//   countdown: {
//     textBeforeCountdownColor: '#FFFFFF',
//     textBeforeCountdown: 'До мероприятия осталось:',
//     badgeText: 'Концерт 08.10.2025',
//     badgeBackground: '#E9EEFF',
//     badgeColor: '#336EC2',
//     // eventDate: new Date(new Date().getMilliseconds() + 1000 * 60 * 60 * 24),
//     eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
//     enabled: true,
//     imageUrl:
//       'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp',
//     imagePosition: 'center'
//   }
// })

// export const buildActionTimerFieldsSettings = () =>
//   (() => {
//     const base = buildFieldsSettings({
//       formTexts: {
//         title: { text: 'Успейте попасть на мероприятие мечты', color: '#FFFFFF' },
//         description: {
//           text: 'Оставьте контакты, чтобы получить напоминание и бонусные предложения',
//           color: '#FFFFFF'
//         },
//         button: {
//           text: 'Получить скидку',
//           color: '#FFFFFF',
//           backgroundColor: '#B88339',
//           icon: 'rocket'
//         }
//       }
//     })
//     return {
//       ...base,
//       countdown: { enabled: true }
//     }
//   })()
