// import type {
//   DisplaySettings,
//   FieldsSettings,
//   IntegrationSettings,
// } from '@/stores/widgetSettings/types'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type {
//   EventTimertWidgetType,
// } from '@lemnity/widget-config/widgets/event-timer'

// export const eventTimerWidgetDefaults: EventTimertWidgetType = {
//   type: WidgetTypeEnum.EVENT_TIMER,
//   appearence: {
//     companyLogoEnabled: true,
//     companyLogoUrl: undefined,

//     colorScheme: 'primary',
//     backgroundColor: '#FFC943',
//     borderRadius: 15,
//   },
//   infoSettings: {
//     contentEnabled: false,
//     contentUrl: undefined,

//     title: 'Укажите заголовок',
//     titleFontWeight: 'medium',
//     titleColor: '#000000',
//     description: 'Напишите описание к действию или какое нибудь предложение',
//     descriptionFontWeight: 'regular',
//     descriptionColor: '#000000',

//     countdownDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//     countdownEnabled: true,
//     countdownBackgroundColor: '#FFFFFF',
//     countdownFontColor: '#000000',

//     buttonText: 'Действие',
//     buttonFontColor: '#000000',
//     buttonBackgroundColor: '#FFB400',
//     icon: 'Reload',
//     link: 'https://lemnity.ru',
//   },
//   formSettings: {
//     title: 'Получите скидку',
//     titleFontWeight: 'medium',
//     titleFontColor: '#000000',
//     description: 'Укажите свой email и получите купон, который можно использовать при покупке',
//     descriptionFontWeight: 'regular',
//     descriptionFontColor: '#000000',

//     contactAcquisitionEnabled: true,
//     nameFieldEnabled: true,
//     nameFieldRequired: false,
//     emailFieldEnabled: true,
//     emailFieldRequired: true,
//     phoneFieldEnabled: false,
//     phoneFieldRequired: false,

//     agreement: {
//       enabled: true,
//       policyUrl: 'lemnity.ru/political',
//       agreementUrl: 'lemnity.ru/agreement',
//       color: '#000000'
//     },

//     adsInfo: {
//       enabled: true,
//       policyUrl: 'lemnity.ru/ads',
//       color: '#000000'
//     }
//   },
//   rewardMessageSettings: {
//     rewardScreenEnabled: true,

//     title: 'Ваша скидка:',
//     titleFontSize: 40,
//     titleFontWeight: 'medium',
//     titleFontColor: '#000000',

//     description:
//       'Не забудьте использовать промокод во время оформления заказа!',
//     descriptionFontSize: 16,
//     descriptionFontWeight: 'regular',
//     descriptionFontColor: '#000000',

//     discount: 'Скидка 10%',
//     discountFontSize: 20,
//     discountFontWeight: 'regular',
//     discountFontColor: '#000000',

//     promo: 'PROMO-10P',
//     promoFontSize: 25,
//     promoFontWeight: 'bold',
//     promoFontColor: '#FFFFFF',

//     customColorSchemeEnabled: false,
//     customDiscountBackgroundColor: '#FFF57F',
//     customPromoBackgroundColor: '#0F3095',
//   },
//   mobileSettings: {
//     mobileEnabled: true,
//     triggerType: 'button',
//     triggerText: 'Подарок для вас',
//     triggerBackgroundColor: '#FFB34F',
//     triggerFontColor: '#000000',
//     imageUrl: 'https://app.lemnity.ru/uploads/images/2026/01/57534833-dc83-4a33-9108-79c952ca1940-sparkles.svg',
//   },
//   brandingEnabled: true,
// }

// export const buildEventTimerWidgetSettings = (): EventTimertWidgetType =>
//   eventTimerWidgetDefaults

// export const buildEventTimerFieldsSettings = (): FieldsSettings =>
//   ({}) as FieldsSettings
// export const buildEventTimerDisplaySettings = (): DisplaySettings =>
//   ({}) as DisplaySettings
// export const buildEventTimerIntegrationSettings = (): IntegrationSettings =>
//   ({}) as IntegrationSettings
