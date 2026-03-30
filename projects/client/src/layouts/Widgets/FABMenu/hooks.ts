// import { useMemo } from 'react'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type { FABMenuWidgetSettings } from '@/layouts/Widgets/FABMenu/types'

// export const useFABMenuSettings = () => {
//   const widget = useWidgetSettingsStore(s => s.settings?.widget)
//   const setFABMenuSectors = useWidgetSettingsStore(s => s.setFABMenuSectors)
//   const updateFABMenuSector = useWidgetSettingsStore(s => s.updateFABMenuSector)
//   const addFABMenuSector = useWidgetSettingsStore(s => s.addFABMenuSector)
//   const deleteFABMenuSector = useWidgetSettingsStore(s => s.deleteFABMenuSector)
//   const setFABMenuButtonTextColor = useWidgetSettingsStore(s => s.setFABMenuButtonTextColor)
//   const setFABMenuButtonBackgroundColor = useWidgetSettingsStore(
//     s => s.setFABMenuButtonBackgroundColor
//   )
//   const setFABMenuTriggerText = useWidgetSettingsStore(s => s.setFABMenuTriggerText)
//   const setFABMenuTriggerIcon = useWidgetSettingsStore(s => s.setFABMenuTriggerIcon)

//   const settings =
//     widget?.type === WidgetTypeEnum.FAB_MENU ? (widget as FABMenuWidgetSettings) : null

//   return useMemo(
//     () => ({
//       settings,
//       setFABMenuSectors,
//       updateFABMenuSector,
//       addFABMenuSector,
//       deleteFABMenuSector,
//       setFABMenuButtonTextColor,
//       setFABMenuButtonBackgroundColor,
//       setFABMenuTriggerText,
//       setFABMenuTriggerIcon
//     }),
//     [
//       settings,
//       setFABMenuSectors,
//       updateFABMenuSector,
//       addFABMenuSector,
//       deleteFABMenuSector,
//       setFABMenuButtonTextColor,
//       setFABMenuButtonBackgroundColor,
//       setFABMenuTriggerText,
//       setFABMenuTriggerIcon
//     ]
//   )
// }
