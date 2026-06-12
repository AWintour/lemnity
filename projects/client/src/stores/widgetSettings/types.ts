import type {
  FABMenuWidgetSettings,
  FABMenuSectorItem as FABMenuSectorItemBase
} from '@/layouts/Widgets/FABMenu/types'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type { WidgetAction } from '@/layouts/Widgets/actions'
import type { StateCreator } from 'zustand'

export type ButtonPosition = 'bottom-left' | 'top-right' | 'bottom-right'
export type StartShowing = 'onClick' | 'timer'
export type IconType = 'image' | 'button'
export type HideIcon = 'always' | 'afterFormSending'
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type FrequencyMode = 'everyPage' | 'periodically'
export type FrequencyUnit = 'sec' | 'min'
export type ContactField = 'phone' | 'email' | 'name'
export type MessageKey = 'onWin' | 'limitShows' | 'limitWins' | 'allPrizesGiven'
// z.infer was nowhere to be seen on the radar so all the types are redefined
// endlessly. will need to comb through it all
export type ColorScheme = 'primary' | 'custom'
export type ContentPosition = 'left' | 'right'
export type WindowFormat = 'sidePanel' | 'modalWindow'
export type TemplateImageMode = 'side' | 'background'
export type SectorItemMode = 'text' | 'icon'

export type MessageColorScheme = {
  enabled: boolean
  scheme: ColorScheme
  discount?: { color: string; bgColor: string }
  promo?: { color: string; bgColor: string }
}

export type FormOnWinMessage = {
  enabled: boolean
  text: string
  textColor?: string
  textSize: number
  description: string
  descriptionColor?: string
  descriptionSize: number
  discount: string
  discountColor?: string
  discountSize: number
  promo: string
  promoColor?: string
  promoSize: number
  colorScheme: MessageColorScheme
}

export type FormMessageEntry = {
  enabled: boolean
  text: string
}

export type FormMessages = {
  onWin: FormOnWinMessage
  limitShows: FormMessageEntry
  limitWins: FormMessageEntry
  allPrizesGiven: FormMessageEntry
}

export type SectorItem = {
  id: string
  mode: SectorItemMode
  text?: string
  icon?: string
  color: string
  promo?: string
  chance?: number
  isWin?: boolean
  textSize: number
  iconSize: number
  textColor: string
  // Доп. поля «Конвейера Удачи» (опциональны, обратносовместимы с колесом):
  coverType?: 'background' | 'image' // вид обложки карточки
  image?: { enabled?: boolean; fileName?: string; url?: string } // своя картинка обложки
  colorScheme?: 'primary' | 'custom' // цветовая гамма карточки
  bgColor?: string // цвет фона
  systemTextColor?: string // цвет системного текста
  counterFieldColor?: string // цвет поля отсчёта
  counterFontColor?: string // цвет шрифта поля отсчёта
  winTextEnabled?: boolean // показывать текст при выигрыше
  winText?: string // текст при выигрыше
  badgeEnabled?: boolean // плашка-подложка под текстом карточки
  badgeColor?: string // цвет плашки
  badgeTextColor?: string // цвет шрифта на плашке
  darkenEnabled?: boolean // затемнение снизу карточки
  darkenHeight?: number // высота затемнения, % высоты карточки (0–100)
  iconColor?: string // цвет иконки (когда «Ваша картинка» выключена)
  imageAlign?: 'top' | 'center' | 'bottom' // выравнивание картинки-обложки
}

export type WheelOfFortuneMessages = {
  onWin: {
    enabled: boolean
    text: string
    textSize: number
    description: string
    descriptionSize: number
    discount: string
    discountSize: number
    promo: string
    promoSize: number
    colorScheme: {
      enabled: boolean
      scheme: ColorScheme
      discount: { color: string; bgColor: string }
      promo: { color: string; bgColor: string }
    }
  }
  limitShows: { enabled: boolean; text: string }
  limitWins: { enabled: boolean; text: string }
  allPrizesGiven: { enabled: boolean; text: string }
}

export type WheelOfFortuneWidgetSettings = {
  // «Конвейер Удачи» (CONVEYOR_OF_LUCK) — клон колеса: та же форма настроек,
  // тот же редактор/превью. Разделяем типом виджета и отдельным хранилищем спинов в БД.
  type: typeof WidgetTypeEnum.WHEEL_OF_FORTUNE | typeof WidgetTypeEnum.CONVEYOR_OF_LUCK
  sectors: {
    randomize: boolean
    items: SectorItem[]
  }
  borderColor: string
  borderThickness: number
  eventMode?: boolean
  cardRadius?: number // радиус скругления углов карточек ленты (px)
}

/** Алиас для ясности: «Конвейер Удачи» использует ту же форму настроек, что и колесо. */
export type ConveyorOfLuckWidgetSettings = WheelOfFortuneWidgetSettings

export type CountdownUnitKey = 'days' | 'hours' | 'minutes' | 'seconds'

export type CountdownUnit = {
  key: CountdownUnitKey
  label: string
}

export type ActionTimerImagePosition = 'center' | 'left' | 'right'

export type ActionTimerWidgetSettings = {
  type: typeof WidgetTypeEnum.ACTION_TIMER
  countdown: {
    textBeforeCountdown: string
    textBeforeCountdownColor: string
    badgeText: string
    badgeBackground: string
    badgeColor: string
    eventDate: Date | string
    enabled: boolean
    imageUrl?: string
    imagePosition: ActionTimerImagePosition
  }
}

/**
 * Stub widget settings for unimplemented widget types.
 * Contains minimal required structure to satisfy the type system.
 */
export type StubWidgetSettings = {
  type: WidgetTypeEnum
  [key: string]: unknown
}

export type WidgetSpecificSettings =
  | WheelOfFortuneWidgetSettings
  | ActionTimerWidgetSettings
  | FABMenuWidgetSettings
  | StubWidgetSettings

export type FABMenuSectorItem = FABMenuSectorItemBase

export type Extendable<T extends Record<string, unknown>> = T & Record<string, unknown>

export type FieldsSettings = Extendable<{
  companyLogo: { enabled: boolean; fileName?: string; url?: string }
  template: {
    enabled: boolean
    key?: string
    templateSettings?: {
      image: { enabled: boolean; fileName?: string; url?: string }
      imageMode?: TemplateImageMode
      windowFormat: WindowFormat
      contentPosition: ContentPosition
      colorScheme: ColorScheme
      customColor: string
    }
  }
  formTexts: {
    title: { text: string; color: string }
    description: { text: string; color: string }
    button: { text: string; color: string; backgroundColor: string; icon: string }
  }
  countdown: { enabled: boolean; endDate?: Date }
  contacts: {
    phone: { enabled: boolean; required: boolean }
    email: { enabled: boolean; required: boolean }
    name: { enabled: boolean; required: boolean }
  }
  agreement: {
    enabled: boolean
    text: string
    policyUrl: string
    agreementUrl: string
    color: string
  }
  adsInfo: { enabled: boolean; text: string; policyUrl: string; color: string }
  messages: FormMessages
  link: string
  border: { enabled: boolean; color: string }
}>

export type DisplaySettings = Extendable<{
  startShowing: StartShowing
  timer: { delayMs: number }
  icon: {
    type: IconType
    image?: { fileName: string; url: string }
    button?: {
      text: string
      buttonColor: string
      textColor: string
      icon?: string
    }
    position: ButtonPosition
    hide: HideIcon
  }
  weekdays: { enabled: boolean; days: DayKey[]; weekdaysOnly: boolean }
  showRules: {
    onExit: boolean
    scrollBelow: { enabled: boolean; percent: number | null }
    afterOpen: { enabled: boolean; seconds: number | null }
  }
  frequency: { mode: FrequencyMode; value?: number; unit?: FrequencyUnit }
  dontShow: { afterWin: boolean; afterShows: number | null }
  limits: { afterWin: boolean; afterShows: number | null }
  schedule: {
    date: { enabled: boolean; value: string }
    time: { enabled: boolean; value: string }
  }
  // Временно. После реализации оплаты будет в оплате
  brandingEnabled: boolean
}>

export type IntegrationSettings = Extendable<{
  scriptSnippet: string
}>

export type WidgetSettings = {
  id: string
  widgetType: WidgetTypeEnum
  fields: FieldsSettings
  widget: WidgetSpecificSettings
  display: DisplaySettings
  integration: IntegrationSettings
  actions?: WidgetAction[]
}

// Utility types for slice creators
export type FieldsUpdater = (mutator: (s: FieldsSettings) => FieldsSettings) => void
export type DisplayUpdater = (mutator: (s: DisplaySettings) => DisplaySettings) => void
export type IntegrationUpdater = (mutator: (s: IntegrationSettings) => IntegrationSettings) => void

export type WidgetSettingsState = {
  settings: WidgetSettings | null
  initialized: boolean
  projectId: string | null
}

export type StoreSlice<T> = StateCreator<T, [], [], T>
