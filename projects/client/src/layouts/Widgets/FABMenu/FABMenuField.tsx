// import { useState } from 'react'
// import EditableList, { type EditableListItem } from '@/components/EditableList'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import { useFABMenuSettings } from './hooks'
// import type { FABMenuSectorItem, FABMenuWidgetSettings } from '@/layouts/Widgets/FABMenu/types'
// import FABSectorItem from './FABSectorItem'
// import FABMenuButtonPicker from './FABMenuButtonPicker'
// import { createPlaceholderFABMenuSector } from './defaults'
// import { type FABMenuButtonDefinition } from './buttonLibrary'
// import DisableBranding from '@/layouts/WidgetSettings/FieldsSettingsTab/DisableBranding/DisableBranding'
// import { useShallow } from 'zustand/react/shallow'
// import type { WidgetSettings } from '@/stores/widgetSettings/types'

// const FABMenuField = () => {
//   const defaults = useWidgetStaticDefaults()
//   const {
//     settings,
//     setFABMenuSectors,
//     updateFABMenuSector,
//     addFABMenuSector,
//     deleteFABMenuSector
//   } = useFABMenuSettings()

//   const { brandingEnabled } = useWidgetSettingsStore(
//     useShallow(s => {
//       return {
//         widgetType: s?.settings?.widgetType,
//         brandingEnabled: (s.settings as WidgetSettings).display.brandingEnabled,
//       }
//     })
//   )

//   const { setBrandingEnabled } = useWidgetSettingsStore()

//   const [pendingSectorId, setPendingSectorId] = useState<string | null>(null)

//   const fallbackSettings =
//     defaults?.widget?.type === WidgetTypeEnum.FAB_MENU
//       ? (defaults.widget as FABMenuWidgetSettings)
//       : undefined

//   const sectors = (settings?.sectors ?? fallbackSettings?.sectors)?.items ?? []
//   if (!sectors.length && !fallbackSettings) return null

//   const handleAdd = () => {
//     const placeholder = createPlaceholderFABMenuSector()
//     addFABMenuSector(placeholder)
//     setPendingSectorId(placeholder.id)
//   }

//   const handlePickerCancel = () => {
//     if (pendingSectorId) {
//       deleteFABMenuSector(pendingSectorId)
//     }
//     setPendingSectorId(null)
//   }

//   const handlePresetSelect = (preset: FABMenuButtonDefinition) => {
//     if (!pendingSectorId) return
//     const index = sectors.findIndex(item => item.id === pendingSectorId)
//     if (index === -1) return
//     updateFABMenuSector(index, {
//       icon: preset.icon,
//       label: preset.label,
//       payload: preset.payload,
//       color: preset.color,
//       description: preset.description
//     })
//     setPendingSectorId(null)
//   }

//   const handleLabelChange = (index: number, label: string) => updateFABMenuSector(index, { label })
//   const handlePayloadTypeChange = (index: number, type: FABMenuSectorItem['payload']['type']) =>
//     updateFABMenuSector(index, {
//       payload: {
//         ...sectors[index].payload,
//         type
//       }
//     })
//   const handlePayloadValueChange = (index: number, value: string) =>
//     updateFABMenuSector(index, {
//       payload: {
//         ...sectors[index].payload,
//         value
//       }
//     })
//   const handlePayloadHelperChange = (index: number, helper: string) =>
//     updateFABMenuSector(index, {
//       payload: {
//         ...sectors[index].payload,
//         helper
//       }
//     })
//   const handleColorChange = (index: number, color: string) => updateFABMenuSector(index, { color })

//   const items: EditableListItem<FABMenuSectorItem>[] = sectors.map(item => item)

//   return (
//     <div className="flex flex-col gap-2.5">
//       <BorderedContainer className="flex flex-col gap-2.5 min-w-74">
//         <div className="h-[37px] shrink-0 flex justify-between">
//           <span className="text-lg leading-5.25 font-medium">Секторы</span>
//           <span className="text-lg text-[#C0C0C0] leading-5.25">Максимум 8</span>
//         </div>
//         <hr className="border-gray-200" />
//         <EditableList
//           showIndex={false}
//           items={items}
//           maxItems={8}
//           onItemsChange={items => setFABMenuSectors(items)}
//           canReorder
//           classNames={{
//             index: 'min-w-[40px]'
//           }}
//           renderItem={(sector, index) => (
//             <FABSectorItem
//               sector={sector}
//               onLabelChange={label => handleLabelChange(index, label)}
//               onPayloadTypeChange={type => handlePayloadTypeChange(index, type)}
//               onPayloadValueChange={value => handlePayloadValueChange(index, value)}
//               onColorChange={color => handleColorChange(index, color)}
//               onHelperChange={helper => handlePayloadHelperChange(index, helper)}
//               isPendingSelection={sector.id === pendingSectorId}
//             />
//           )}
//           renderBelow={sector =>
//             sector.id === pendingSectorId ? (
//               <FABMenuButtonPicker onClose={handlePickerCancel} onSelect={handlePresetSelect} />
//             ) : null
//           }
//           onDelete={(item: EditableListItem<FABMenuSectorItem>) => deleteFABMenuSector(item.id)}
//           onAdd={handleAdd}
//           addButtonLabel="Добавить кнопку"
//           disabledReorderIds={pendingSectorId ? [pendingSectorId] : []}
//         />
//         <span className="text-[#BABABA] text-[10px] leading-3">
//           *Компания Meta Platforms Inc., владеющая социальными сетями Facebook и Instagram, по
//           решению суда от 21.03.2022 признана экстремистской организацией, ее деятельность на
//           территории России запрещена.
//         </span>
//       </BorderedContainer>

//       <DisableBranding
//         enabled={brandingEnabled}
//         onBrandingEnabledToggle={setBrandingEnabled}
//       />
//     </div>
//   )
// }

// export default FABMenuField
