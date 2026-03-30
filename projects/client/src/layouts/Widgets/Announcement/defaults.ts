// import type {
//   DisplaySettings,
//   FieldsSettings,
//   IntegrationSettings,
// } from '@/stores/widgetSettings/types'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type {
//   AnnouncementWidgetType,
// } from '@lemnity/widget-config/widgets/announcement'

// export const announcementWidgetDefaults: AnnouncementWidgetType = {
//   type: WidgetTypeEnum.ANNOUNCEMENT,
//   appearence: {
//     companyLogoEnabled: true,
//     companyLogoUrl: undefined,

//     colorScheme: 'primary',
//     backgroundColor: '#FFC943',
//     borderRadius: 15,
//   },
//   infoSettings: {
//     contentType: 'imageOnTop',
//     contentAlignment: 'center',
//     contentUrl: undefined,

//     title: 'Укажите заголовок',
//     titleFontWeight: 'medium',
//     titleColor: '#000000',
//     description: 'Напишите описание к действию или какое нибудь предложение',
//     descriptionFontWeight: 'regular',
//     descriptionColor: '#000000',

//     buttonText: 'Действие',
//     buttonFontColor: '#000000',
//     buttonBackgroundColor: '#FFB400',
//     icon: 'Reload',
//     link: 'https://lemnity.ru',
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

// export const buildAnnouncementWidgetSettings = (): AnnouncementWidgetType =>
//   announcementWidgetDefaults

// export const buildAnnouncementFieldsSettings = (): FieldsSettings =>
//   ({}) as FieldsSettings
// export const buildAnnouncementDisplaySettings = (): DisplaySettings =>
//   ({}) as DisplaySettings
// export const buildAnnouncementIntegrationSettings = (): IntegrationSettings =>
//   ({}) as IntegrationSettings
