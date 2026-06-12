import { WidgetTypeEnum } from '@lemnity/api-sdk'

// ... ?
export const WidgetTypes = {
  WHEEL_OF_FORTUNE: WidgetTypeEnum.WHEEL_OF_FORTUNE,
  CONVEYOR_OF_GIFTS: WidgetTypeEnum.CONVEYOR_OF_GIFTS,
  ACTION_TIMER: WidgetTypeEnum.ACTION_TIMER,
  FAB_MENU: WidgetTypeEnum.FAB_MENU,
  POSTCARD: WidgetTypeEnum.POSTCARD,
  CHEST_WITH_ACTION: WidgetTypeEnum.CHEST_WITH_ACTION,
  ADVENT_CALENDAR: WidgetTypeEnum.ADVENT_CALENDAR,
  TEASER: WidgetTypeEnum.TEASER,
  ANNOUNCEMENT: WidgetTypeEnum.ANNOUNCEMENT,
  EVENT_TIMER: WidgetTypeEnum.EVENT_TIMER,
  NOTIFICATION: WidgetTypeEnum.NOTIFICATION,
  VIDEO_WIDGET: WidgetTypeEnum.VIDEO_WIDGET,
  CALLBACK: WidgetTypeEnum.CALLBACK,
  CONVEYOR_OF_LUCK: WidgetTypeEnum.CONVEYOR_OF_LUCK,
} as const

export type WidgetType = (typeof WidgetTypes)[keyof typeof WidgetTypes]

// «Колесо фортуны» и его клон «Конвейер Удачи» используют одни и те же компоненты
// редактора/превью/раннера. Этот хелпер заменяет точечные проверки `=== WHEEL_OF_FORTUNE`,
// чтобы конвейер вёл себя как колесо везде, где это нужно.
export const WHEEL_LIKE_WIDGET_TYPES: readonly WidgetTypeEnum[] = [
  WidgetTypeEnum.WHEEL_OF_FORTUNE,
  WidgetTypeEnum.CONVEYOR_OF_LUCK,
]

export const isWheelLikeWidgetType = (type: string | undefined | null): boolean =>
  type === WidgetTypeEnum.WHEEL_OF_FORTUNE || type === WidgetTypeEnum.CONVEYOR_OF_LUCK

// Направления каталога — фильтр на странице виджетов проекта.
export type WidgetCategory = 'leads' | 'engage' | 'reward'

export const WIDGET_CATEGORIES: { id: WidgetCategory; label: string }[] = [
  { id: 'leads', label: 'Лиды' },
  { id: 'engage', label: 'Вовлечение' },
  { id: 'reward', label: 'Вознаграждение' }
]

export interface AvailableWidget {
  type: WidgetType
  title: string
  description: string
  isAvailable: boolean
  badge?: 'new' | 'popular' | 'soon'
  /** Направления, к которым относится виджет (для фильтра каталога). */
  categories: WidgetCategory[]
}

export const AVAILABLE_WIDGETS: AvailableWidget[] = [
  {
    type: WidgetTypes.WHEEL_OF_FORTUNE,
    title: 'Колесо фортуны',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage', 'reward']
  },
  {
    type: WidgetTypes.ACTION_TIMER,
    title: 'Лид-форма',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['leads']
  },
  {
    type: WidgetTypes.FAB_MENU,
    title: 'Мультикнопка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['leads', 'engage']
  },
  {
    type: WidgetTypes.ANNOUNCEMENT,
    title: 'Анонс',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage']
  },
  {
    type: WidgetTypes.EVENT_TIMER,
    title: 'Таймер событий',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage']
  },
  {
    type: WidgetTypes.NOTIFICATION,
    title: 'Уведомления',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage']
  },
  {
    type: WidgetTypes.VIDEO_WIDGET,
    title: 'Видео виджет',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage', 'leads']
  },
  {
    type: WidgetTypes.CALLBACK,
    title: 'Обратный звонок',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['leads']
  },
  {
    type: WidgetTypes.CONVEYOR_OF_LUCK,
    title: 'Конвейер Удачи',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new',
    categories: ['engage', 'reward']
  },
  {
    type: WidgetTypes.CONVEYOR_OF_GIFTS,
    title: 'Конвейер подарков',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon',
    categories: ['reward']
  },
  {
    type: WidgetTypes.POSTCARD,
    title: 'Открытка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon',
    categories: ['reward']
  },
  {
    type: WidgetTypes.CHEST_WITH_ACTION,
    title: 'Сундук с акцией',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon',
    categories: ['reward', 'engage']
  },
  {
    type: WidgetTypes.ADVENT_CALENDAR,
    title: 'Advent календарь',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon',
    categories: ['engage', 'reward']
  },
  {
    type: WidgetTypes.TEASER,
    title: 'Дразнилка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon',
    categories: ['engage']
  }
]
