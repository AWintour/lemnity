import type {
  FABMenuIconKey,
  FABMenuSectorItem,
} from '@/layouts/Widgets/FABMenu/types'

import { FAB_MENU_BUTTON_PRESETS } from '@/layouts/Widgets/FABMenu/buttonLibrary'
import { nanoid } from '@reduxjs/toolkit'

const createSectorId = (): string => nanoid()

const createSector = (segment: Omit<FABMenuSectorItem, 'id'>): FABMenuSectorItem => ({
  id: createSectorId(),
  ...segment
})

const presetByIcon = (icon: FABMenuIconKey) => {
  const preset = FAB_MENU_BUTTON_PRESETS.find(entry => entry.icon === icon)
  if (!preset) {
    throw new Error(`Missing preset for icon ${icon}`)
  }
  return preset
}

const DEFAULT_PRESET_ICONS: FABMenuIconKey[] = [
  'email',
  'phone'
  // 'website',
  // 'telegram-message',
  // 'max-message',
  // 'whatsapp-message',
  // 'instagram',
  // 'youtube',
  // 'ok'
]

export const createDefaultFABMenuSector = (): FABMenuSectorItem =>
  createSector({
    label: 'Новая кнопка',
    icon: 'custom',
    payload: presetByIcon('custom').payload,
    color: presetByIcon('custom').color
  })

export const createPlaceholderFABMenuSector = (): FABMenuSectorItem =>
  createSector({
    label: 'Выбрать кнопку',
    icon: 'custom',
    payload: presetByIcon('custom').payload,
    color: presetByIcon('custom').color
  })
