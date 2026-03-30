// import type { SectorItem, WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
// import type { WidgetActions, TypedWidgetUpdater } from '@/stores/widgetSettings/widgetActions/types'

// export const createWheelActions = (
//   updateWidget: TypedWidgetUpdater<WheelOfFortuneWidgetSettings>
// ): Partial<WidgetActions> => ({
//   setWheelRandomize: (randomize: boolean) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         randomize
//       }
//     })),
//   setWheelSectors: (items: SectorItem[]) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items
//       }
//     })),
//   updateWheelSector: (index: number, updates: Partial<SectorItem>) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: widget.sectors.items.map((item, i) => (i === index ? { ...item, ...updates } : item))
//       }
//     })),
//   addWheelSector: (item: SectorItem) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: [...widget.sectors.items, item]
//       }
//     })),
//   deleteWheelSector: (id: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       sectors: {
//         ...widget.sectors,
//         items: widget.sectors.items.filter(item => item.id !== id)
//       }
//     })),
//   setWheelBorderColor: (color: string) =>
//     updateWidget(widget => ({
//       ...widget,
//       borderColor: color
//     })),
//   setWheelBorderThickness: (thickness: number) =>
//     updateWidget(widget => ({
//       ...widget,
//       borderThickness: Math.max(0, Math.min(20, thickness))
//     }))
// })
