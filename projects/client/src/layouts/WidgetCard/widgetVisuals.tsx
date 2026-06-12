import type { ReactElement } from 'react'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

/**
 * Визуальная идентичность карточки виджета: своя иконка + акцентный цвет на тип.
 * Раньше все карточки делили один синий эмблем — каталог выглядел «стеной клонов».
 * Иконки — инлайн-SVG со stroke/fill = currentColor, цвет задаётся через акцент тайла.
 */
export interface WidgetVisual {
  icon: ReactElement
  /** Акцент тайла. Фон = accent на ~12% (accent + "1f"), сама иконка = accent. */
  accent: string
}

const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const
const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const icons = {
  wheel: (
    <svg viewBox="0 0 24 24">
      <path
        {...s}
        d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"
      />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  ),
  form: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="3" width="16" height="18" rx="2.5" {...s} />
      <path {...s} {...round} d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  fab: (
    <svg viewBox="0 0 24 24">
      <path {...s} {...round} d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" />
      <path {...s} {...round} d="M16.5 14v5M14 16.5h5" />
    </svg>
  ),
  announce: (
    <svg viewBox="0 0 24 24">
      <path {...s} {...round} d="M4 10v4l11 5V5L4 10z" />
      <path {...s} {...round} d="M18 9a3.5 3.5 0 010 6" />
    </svg>
  ),
  timer: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="13" r="8" {...s} />
      <path {...s} {...round} d="M12 13V9M9 2h6" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24">
      <path {...s} {...round} d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 004 0" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="6" width="13" height="12" rx="2.5" {...s} />
      <path {...s} {...round} d="M16 10l5-3v10l-5-3z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24">
      <path
        {...s}
        {...round}
        d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
      />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24">
      <path {...s} d="M4 11h16v9H4zM4 7h16v4H4zM12 7v13" />
      <path {...s} d="M12 7S10 3 8 4s1 3 4 3zM12 7s2-4 4-3-1 3-4 3z" />
    </svg>
  ),
  envelope: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2.5" {...s} />
      <path {...s} {...round} d="M4 7l8 6 8-6" />
    </svg>
  ),
  chest: (
    <svg viewBox="0 0 24 24">
      <path {...s} {...round} d="M4 9l1-3h14l1 3v10H4zM4 9h16M9 9v3h6V9" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="16" rx="2.5" {...s} />
      <path {...s} {...round} d="M4 9h16M8 3v4M16 3v4M8 13h2M14 13h2M8 17h2M14 17h2" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24">
      <path
        {...s}
        {...round}
        d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.9 2.3 2.3.9-2.3.9L18 21l-.9-2.3-2.3-.9 2.3-.9z"
      />
    </svg>
  )
} as const

const DEFAULT_VISUAL: WidgetVisual = { icon: icons.sparkles, accent: '#1A52DB' }

const VISUALS: Partial<Record<WidgetTypeEnum, WidgetVisual>> = {
  [WidgetTypeEnum.WHEEL_OF_FORTUNE]: { icon: icons.wheel, accent: '#c77d1a' },
  [WidgetTypeEnum.CONVEYOR_OF_LUCK]: { icon: icons.gift, accent: '#8a5cf0' },
  [WidgetTypeEnum.ACTION_TIMER]: { icon: icons.form, accent: '#1A52DB' },
  [WidgetTypeEnum.FAB_MENU]: { icon: icons.fab, accent: '#6d3fc0' },
  [WidgetTypeEnum.ANNOUNCEMENT]: { icon: icons.announce, accent: '#0e8a7e' },
  [WidgetTypeEnum.EVENT_TIMER]: { icon: icons.timer, accent: '#c0392f' },
  [WidgetTypeEnum.NOTIFICATION]: { icon: icons.bell, accent: '#3f43c4' },
  [WidgetTypeEnum.VIDEO_WIDGET]: { icon: icons.video, accent: '#b8322c' },
  [WidgetTypeEnum.CALLBACK]: { icon: icons.phone, accent: '#0a8a52' },
  [WidgetTypeEnum.CONVEYOR_OF_GIFTS]: { icon: icons.gift, accent: '#a85cc0' },
  [WidgetTypeEnum.POSTCARD]: { icon: icons.envelope, accent: '#c77d1a' },
  [WidgetTypeEnum.CHEST_WITH_ACTION]: { icon: icons.chest, accent: '#9a6b00' },
  [WidgetTypeEnum.ADVENT_CALENDAR]: { icon: icons.calendar, accent: '#0e8a7e' },
  [WidgetTypeEnum.TEASER]: { icon: icons.sparkles, accent: '#c0392f' }
}

export const getWidgetVisual = (type: WidgetTypeEnum): WidgetVisual =>
  VISUALS[type] ?? DEFAULT_VISUAL
