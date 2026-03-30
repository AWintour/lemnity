// import type { IconName } from '@/components/IconPicker'
// import type { FABMenuSectorItem, FABMenuWidgetSettings } from '@/layouts/Widgets/FABMenu/types'
// import type { TypedWidgetUpdater } from '@/stores/widgetSettings/widgetActions/types'

// export const createFABMenuActions = (
//   updateWidget: TypedWidgetUpdater<FABMenuWidgetSettings>
// ) => ({
//   setFABMenuSectors: (items: FABMenuSectorItem[]) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items
//       }
//     })),
//   updateFABMenuSector: (index: number, updates: Partial<FABMenuSectorItem>) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: widget.sectors.items.map((item, i) => (i === index ? { ...item, ...updates } : item))
//       }
//     })),
//   addFABMenuSector: (item: FABMenuSectorItem) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: [...widget.sectors.items, item]
//       }
//     })),
//   deleteFABMenuSector: (id: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: widget.sectors.items.filter(item => item.id !== id)
//       }
//     })),
//   setFABMenuButtonTextColor: (color: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       triggerTextColor: color
//     })),
//   setFABMenuButtonBackgroundColor: (color: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       triggerBackgroundColor: color
//     })),
//   setFABMenuTriggerText: (text: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       triggerText: text
//     })),
//   setFABMenuTriggerIcon: (icon: IconName) =>
//     updateWidget(widget => ({
//       ...widget,
//       triggerIcon: icon
//     }))
// })
