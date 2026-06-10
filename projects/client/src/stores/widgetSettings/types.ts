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
  type: typeof WidgetTypeEnum.WHEEL_OF_FORTUNE
  sectors: {
    randomize: boolean
    items: SectorItem[]
  }
  borderColor: string
  borderThickness: number
  eventMode?: boolean
}

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
