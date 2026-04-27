// import type { FormMessages, FieldsSettings } from '@/stores/widgetSettings/types'

// type BuildFieldsSettingsParams = {
//   formTexts: FieldsSettings['formTexts']
//   messages?: Partial<FormMessages>
// }

// const defaultMessages: FormMessages = {
//   onWin: {
//     enabled: true,
//     text: 'Ура!\nВы выиграли',
//     textColor: '#FFFFFF',
//     textSize: 36,
//     description: 'Не забудьте использовать промокод во время\nоформления заказа!',
//     descriptionColor: '#FFFFFF',
//     descriptionSize: 16,
//     discount: '',
//     discountColor: '#000000ff',
//     discountSize: 16,
//     promo: '',
//     promoColor: '#FFFFFF',
//     promoSize: 16,
//     colorScheme: {
//       enabled: true,
//       scheme: 'primary',
//       discount: { color: '#000000', bgColor: '#FFF57F' },
//       promo: { color: '#FFFFFF', bgColor: '#0069FF' }
//     }
//   },
//   limitShows: { enabled: false, text: 'Вы уже видели эту игру' },
//   limitWins: { enabled: false, text: 'Вы уже выиграли' },
//   allPrizesGiven: { enabled: false, text: 'Вы уже получили все призы' }
// }

// export const buildFieldsSettings = ({
//   formTexts,
//   messages
// }: BuildFieldsSettingsParams): FieldsSettings => ({
//   brandingEnabled: true,
//   companyLogo: { enabled: true, fileName: '', url: '' },
//   template: {
//     enabled: false,
//     key: '',
//     templateSettings: {
//       image: { enabled: false, fileName: '', url: '' },
//       imageMode: 'side',
//       windowFormat: 'modalWindow',
//       contentPosition: 'left',
//       colorScheme: 'primary',
//       customColor: '#46b530'
//     }
//   },
//   formTexts,
//   countdown: { enabled: false },
//   contacts: {
//     phone: { enabled: true, required: true },
//     email: { enabled: true, required: true },
//     name: { enabled: true, required: false }
//   },
//   agreement: {
//     enabled: true,
//     text: 'Я даю Согласие на обработку персональных данных в соотвествии с Политикой конфиденциальности',
//     agreementUrl: 'lemnity.ru/agreement',
//     policyUrl: 'lemnity.ru/political',
//     color: '#FFFFFF'
//   },
//   adsInfo: {
//     enabled: true,
//     text: 'Нажимая на кнопку, вы даёте своё согласие на получение рекламно-информационной рассылки.',
//     policyUrl: 'lemnity.ru/ads',
//     color: '#FFFFFF'
//   },
//   link: '',
//   border: { enabled: true, color: '#FFFFFF' },
//   messages: {
//     ...defaultMessages,
//     ...messages
//   }
// })
