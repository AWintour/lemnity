import { WidgetTypeEnum } from '@lemnity/api-sdk'

// ... ?
export const WidgetTypes = {
  // WHEEL_OF_FORTUNE: WidgetTypeEnum.WHEEL_OF_FORTUNE,
  CONVEYOR_OF_GIFTS: WidgetTypeEnum.CONVEYOR_OF_GIFTS,
  // ACTION_TIMER: WidgetTypeEnum.ACTION_TIMER,
  FAB_MENU: WidgetTypeEnum.FAB_MENU,
  POSTCARD: WidgetTypeEnum.POSTCARD,
  CHEST_WITH_ACTION: WidgetTypeEnum.CHEST_WITH_ACTION,
  ADVENT_CALENDAR: WidgetTypeEnum.ADVENT_CALENDAR,
  TEASER: WidgetTypeEnum.TEASER,
  ANNOUNCEMENT: WidgetTypeEnum.ANNOUNCEMENT,
  EVENT_TIMER: WidgetTypeEnum.EVENT_TIMER,
  NOTIFICATION: WidgetTypeEnum.NOTIFICATION,
} as const

export type WidgetType = (typeof WidgetTypes)[keyof typeof WidgetTypes]

export interface AvailableWidget {
  type: WidgetType
  title: string
  description: string
  isAvailable: boolean
  badge?: 'new' | 'popular' | 'soon'
}

export const AVAILABLE_WIDGETS: AvailableWidget[] = [
  // {
  //   type: WidgetTypes.WHEEL_OF_FORTUNE,
  //   title: 'Колесо фортуны',
  //   description: 'Лиды, вовлечение, вознаграждение',
  //   isAvailable: true,
  //   badge: 'new'
  // },
  // {
  //   type: WidgetTypes.ACTION_TIMER,
  //   title: 'Лид-форма',
  //   description: 'Лиды, вовлечение, вознаграждение',
  //   isAvailable: true,
  //   badge: 'new'
  // },
  {
    type: WidgetTypes.FAB_MENU,
    title: 'Мультикнопка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new'
  },
  {
    type: WidgetTypes.ANNOUNCEMENT,
    title: 'Анонс',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new'
  },
  {
    type: WidgetTypes.EVENT_TIMER,
    title: 'Таймер событий',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new'
  },
  {
    type: WidgetTypes.NOTIFICATION,
    title: 'Уведомления',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: true,
    badge: 'new'
  },
  {
    type: WidgetTypes.CONVEYOR_OF_GIFTS,
    title: 'Конвейер подарков',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon'
  },
  {
    type: WidgetTypes.POSTCARD,
    title: 'Открытка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon'
  },
  {
    type: WidgetTypes.CHEST_WITH_ACTION,
    title: 'Сундук с акцией',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon'
  },
  {
    type: WidgetTypes.ADVENT_CALENDAR,
    title: 'Advent календарь',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon'
  },
  {
    type: WidgetTypes.TEASER,
    title: 'Дразнилка',
    description: 'Лиды, вовлечение, вознаграждение',
    isAvailable: false,
    badge: 'soon'
  }
]
