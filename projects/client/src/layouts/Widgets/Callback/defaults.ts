import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type {
  DisplaySettings,
  FieldsSettings,
  IntegrationSettings,
  WidgetSpecificSettings,
} from '@/stores/widgetSettings/types'
import type { AnnouncementWidgetType } from '@lemnity/widget-config/widgets/announcement'
import { announcementWidgetDefaults } from '@/layouts/Widgets/Announcement/defaults'
import type { IconName } from '@/components/IconPicker'

/**
 * Виджет «Обратный звонок» — дубликат «Анонса» по визуалу (те же компоненты редактора).
 * Базовая часть (appearence/infoSettings) — как у Анонса; callback-специфика — в поле `callback`
 * (поля по plan/plan-wid-call.md: таймер, контакты, согласие, экран звонка, настройка звонка,
 * уведомления менеджера, график работы).
 */
export type CallbackExtra = {
  launcher: {
    buttonColor: string
    iconColor: string
    icon?: IconName
    borderRadius: number
    notifEnabled: boolean
    notifText: string
    notifDelaySec: number
    notifColor: string
    notifTextColor: string
    notifIcon?: IconName
    notifIconColor: string
    notifSound: boolean
    position: 'left' | 'center' | 'right'
    text: string
    shape: 'circle' | 'rounded' | 'square'
    hidden: boolean
    widgetSize: number
    animation: boolean
  }
  form: {
    windowFormat: 'side' | 'modal'
    widgetColor: string
    systemTextColor: string
    countdownFieldColor: string
    countdownFontColor: string
    buttonShape: 'circle' | 'rounded' | 'square'
    buttonHidden: boolean
  }
  delaySeconds: number
  titleFontSize: number
  deferredCall: { enabled: boolean }
  contacts: {
    phone: { enabled: boolean; required: boolean }
    name: { enabled: boolean; required: boolean }
  }
  callScreen: {
    textScheme: 'primary' | 'custom'
    textColor: string
    cancelEnabled: boolean
    animation: 'circle' | 'bar'
    animationColor: string
  }
  call: {
    callMode: 'manager' | 'robot'
    managerType: 'SIP' | 'Телефон'
    managerAddress: string
    managerName: string
    clientLineNumber: string
    managerIncomingType: string
    managerIncomingNumber: string
    clientIncomingType: string
    clientIncomingNumber: string
  }
  sms: {
    enabled: boolean
    number: string
    notAnswered: boolean
    notAnsweredReq: boolean
    offHours: boolean
    offHoursReq: boolean
    afterTalk: boolean
    afterTalkReq: boolean
  }
  telegram: { enabled: boolean; code: string }
  schedule: {
    enabled: boolean
    timezone: string
    from: string
    to: string
    days: string[]
    disableHolidays: boolean
    noAutoOffHours: boolean
  }
}

export type CallbackWidgetType = AnnouncementWidgetType & { callback: CallbackExtra }

export const callbackExtraDefaults: CallbackExtra = {
  launcher: {
    buttonColor: '#5B5BD6',
    iconColor: '#FFFFFF',
    icon: 'HeartDislike',
    borderRadius: 32,
    notifEnabled: true,
    notifText: 'Привет!\nПерезвоню через 30 секунд!',
    notifDelaySec: 30,
    notifColor: '#5B5BD6',
    notifTextColor: '#FFFFFF',
    notifIcon: 'HeartDislike',
    notifIconColor: '#FFFFFF',
    notifSound: true,
    position: 'right',
    text: 'Супер кнопка',
    shape: 'circle',
    hidden: false,
    widgetSize: 64,
    animation: true,
  },
  form: {
    windowFormat: 'modal',
    widgetColor: '#5B5BD6',
    systemTextColor: '#161616',
    countdownFieldColor: '#EDEDED',
    countdownFontColor: '#161616',
    buttonShape: 'rounded',
    buttonHidden: false,
  },
  delaySeconds: 20,
  titleFontSize: 25,
  deferredCall: { enabled: true },
  contacts: {
    phone: { enabled: true, required: true },
    name: { enabled: true, required: false },
  },
  callScreen: { textScheme: 'primary', textColor: '#F2B705', cancelEnabled: true, animation: 'circle', animationColor: '#16A34A' },
  call: {
    callMode: 'manager',
    managerType: 'SIP',
    managerAddress: '',
    managerName: '',
    clientLineNumber: '',
    managerIncomingType: 'Номер компании',
    managerIncomingNumber: '',
    clientIncomingType: 'Номер менеджера',
    clientIncomingNumber: '',
  },
  sms: { enabled: false, number: '', notAnswered: true, notAnsweredReq: true, offHours: true, offHoursReq: false, afterTalk: false, afterTalkReq: false },
  telegram: { enabled: false, code: '856292101' },
  schedule: {
    enabled: false,
    timezone: '+5 Екатеринбург',
    from: '08:00',
    to: '21:00',
    days: ['mon', 'thu', 'sat'],
    disableHolidays: true,
    noAutoOffHours: false,
  },
}

export const callbackWidgetDefaults: CallbackWidgetType = {
  ...announcementWidgetDefaults,
  type: WidgetTypeEnum.CALLBACK as unknown as AnnouncementWidgetType['type'],
  infoSettings: {
    ...announcementWidgetDefaults.infoSettings,
    title: 'Оставьте номер и мы вам перезвоним',
    description: 'Перезвоним в течение нескольких секунд',
    buttonText: 'Жду звонка',
  },
  callback: callbackExtraDefaults,
} as unknown as CallbackWidgetType

export const buildCallbackWidgetSettings = (): WidgetSpecificSettings =>
  callbackWidgetDefaults as unknown as WidgetSpecificSettings

export const buildCallbackFieldsSettings = (): FieldsSettings =>
  ({
    // Согласие/политика — стандартный surface `fields.agreement` (как у других виджетов)
    agreement: {
      enabled: true,
      text: 'Я даю Согласие на обработку персональных данных в соответствии с Политикой конфиденциальности',
      policyUrl: 'lemnity.ru/political',
      agreementUrl: 'lemnity.ru/agreement',
      color: '#797979',
    },
    adsInfo: {
      enabled: true,
      text: 'Нажимая на кнопку, вы даёте своё согласие на получение рекламно-информационной рассылки.',
      policyUrl: 'lemnity.ru/ads',
      color: '#000000',
    },
  }) as unknown as FieldsSettings
export const buildCallbackDisplaySettings = (): DisplaySettings => ({}) as DisplaySettings
export const buildCallbackIntegrationSettings = (): IntegrationSettings =>
  ({}) as IntegrationSettings
