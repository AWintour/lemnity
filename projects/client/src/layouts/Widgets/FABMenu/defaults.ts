// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type {
//   FABMenuIconKey,
//   FABMenuSectorItem,
//   FABMenuWidgetSettings
// } from '@/layouts/Widgets/FABMenu/types'
// import type {
//   DisplaySettings,
//   FieldsSettings,
//   IntegrationSettings
// } from '@/stores/widgetSettings/types'
// import { FAB_MENU_BUTTON_PRESETS } from '@/layouts/Widgets/FABMenu/buttonLibrary'
// import { uuidv4 } from '@/common/utils/uuidv4'
// import { buildStandardDisplaySettings } from '@/stores/widgetSettings/displayDefaults'

// const createSectorId = (): string => uuidv4()

// const createSector = (segment: Omit<FABMenuSectorItem, 'id'>): FABMenuSectorItem => ({
//   id: createSectorId(),
//   ...segment
// })

// const presetByIcon = (icon: FABMenuIconKey) => {
//   const preset = FAB_MENU_BUTTON_PRESETS.find(entry => entry.icon === icon)
//   if (!preset) {
//     throw new Error(`Missing preset for icon ${icon}`)
//   }
//   return preset
// }

// const DEFAULT_PRESET_ICONS: FABMenuIconKey[] = [
//   'email',
//   'phone'
//   // 'website',
//   // 'telegram-message',
//   // 'max-message',
//   // 'whatsapp-message',
//   // 'instagram',
//   // 'youtube',
//   // 'ok'
// ]

// const DEFAULT_SECTORS: Omit<FABMenuSectorItem, 'id'>[] = DEFAULT_PRESET_ICONS.map(icon => {
//   const preset = presetByIcon(icon)
//   return {
//     label: preset.label,
//     icon: preset.icon,
//     payload: preset.payload,
//     color: preset.color,
//     description: preset.description
//   }
// })

// export const createDefaultFABMenuSector = (): FABMenuSectorItem =>
//   createSector({
//     label: 'Новая кнопка',
//     icon: 'custom',
//     payload: presetByIcon('custom').payload,
//     color: presetByIcon('custom').color
//   })

// export const createPlaceholderFABMenuSector = (): FABMenuSectorItem =>
//   createSector({
//     label: 'Выбрать кнопку',
//     icon: 'custom',
//     payload: presetByIcon('custom').payload,
//     color: presetByIcon('custom').color
//   })

// export const buildFABMenuWidgetSettings = (): FABMenuWidgetSettings => ({
//   type: WidgetTypeEnum.FAB_MENU,
//   sectors: {
//     items: DEFAULT_SECTORS.map(createSector)
//   },
//   triggerTextColor: '#FFFFFF',
//   triggerBackgroundColor: '#5951E5',
//   triggerText: 'Супер-кнопка',
//   triggerIcon: 'Sparkles'
// })

// export const buildFABMenuFieldsSettings = (): FieldsSettings => ({}) as FieldsSettings

// export const buildFABMenuDisplaySettings = (): DisplaySettings => {
//   const defaults = buildStandardDisplaySettings()
//   return { ...defaults, icon: { ...defaults.icon, position: 'bottom-right' } }
// }

// export const buildFABMenuIntegrationSettings = (): IntegrationSettings =>
//   ({}) as IntegrationSettings
