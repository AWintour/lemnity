// import { Select, SelectItem } from '@heroui/select'
// import { Button } from '@heroui/button'
// import SvgIcon from '@/components/SvgIcon'
// import iconSettings from '@/assets/icons/gear.svg'
// import { Textarea } from '@heroui/input'
// import { Radio, RadioGroup } from '@heroui/radio'
// import iconTrophy from '@/assets/icons/trophy.svg'
// import iconSparkles from '@/assets/icons/sparkles.svg'
// import iconRocket from '@/assets/icons/rocket.svg'
// import type { SectorItem as SectorData, SectorItemMode as Mode } from '@stores/widgetSettings/types'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import { cn } from '@heroui/theme'
// type SectorItemProps = {
//   sector: SectorData
//   onModeChange: (mode: Mode) => void
//   onTextChange: (text: string) => void
//   onIconChange: (icon: string) => void
//   onSettings: () => void
//   validationMessage?: string
//   showValidation?: boolean
// }

// const prizeOptions = [
//   { key: 'trophy', label: iconTrophy },
//   { key: 'star', label: iconSparkles },
//   { key: 'rocket', label: iconRocket }
// ]

// const SectorItem = ({
//   sector,
//   onModeChange,
//   onTextChange,
//   onIconChange,
//   onSettings,
//   validationMessage,
//   showValidation
// }: SectorItemProps) => {
//   const invalidText = Boolean(showValidation && sector.mode === 'text' && validationMessage)
//   const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)

//   const getRadioDot = (mode: Mode) => {
//     const isDisabled = widgetType === WidgetTypeEnum.WHEEL_OF_FORTUNE && mode === 'icon'

//     return (
//       <RadioGroup value={sector.mode} onValueChange={v => onModeChange(v as Mode)}>
//         <Radio
//           classNames={{
//             label: 'text-gray-700',
//             wrapper: 'border-[#373737] group-data-[selected=true]:!border-[#373737] border-small',
//             control: 'bg-[#373737] w-[14.5px] h-[14.5px]'
//           }}
//           value={mode}
//           isDisabled={isDisabled}
//         ></Radio>
//       </RadioGroup>
//     )
//   }

//   const radioInput = () => {
//     return (
//       <div
//         className={`flex items-center gap-2 flex-1 h-full rounded-md border pl-3 border-[#E4E4E7]`}
//         onClick={() => onModeChange('text')}
//       >
//         {getRadioDot('text')}
//         <div className="flex items-center gap-2 flex-1">
//           <Textarea
//             placeholder={'Бонус'}
//             value={sector.text ?? ''}
//             onChange={e => {
//               e.stopPropagation()
//             }}
//             onValueChange={val => onTextChange(val)}
//             minRows={1}
//             classNames={{
//               inputWrapper: 'rounded-l-none rounded-r-xs border-none shadow-none px-2 min-h-8',
//               input: 'content-center text-base py-0 min-h-8 resize-none overflow-hidden'
//             }}
//           />
//         </div>
//       </div>
//     )
//   }

//   const radioIcon = () => {
//     return (
//       <div
//         onClick={() => onModeChange('icon')}
//         className={cn(
//           'flex items-center gap-2 h-full rounded-md',
//           'border px-2 border-[#D9D9E0]',
//           widgetType === WidgetTypeEnum.WHEEL_OF_FORTUNE ? 'pointer-events-none' : null
//         )}
//       >
//         {getRadioDot('icon')}
//         <Select
//           selectedKeys={sector.icon ? [sector.icon] : []}
//           onSelectionChange={keys => {
//             const selected = Array.from(keys)[0]
//             if (selected) onIconChange(String(selected))
//           }}
//           onClick={() => onModeChange('icon')}
//           aria-label="Иконка приза"
//           classNames={{
//             trigger: 'shadow-none !bg-transparent h-8 w-[72px] min-w-[72px] border-gray-200'
//           }}
//           renderValue={items => {
//             return items.map(item => (
//               <SvgIcon
//                 src={prizeOptions.find(opt => opt.key === item.textValue)!.label}
//                 size={'20px'}
//               />
//             ))
//           }}
//           isDisabled={widgetType === WidgetTypeEnum.WHEEL_OF_FORTUNE}
//         >
//           {prizeOptions.map(opt => (
//             <SelectItem key={opt.key} textValue={opt.key}>
//               <span className="text-xl">
//                 <SvgIcon src={opt.label} size={'20px'} />
//               </span>
//             </SelectItem>
//           ))}
//         </Select>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex items-center w-full h-full gap-2">
//         {radioInput()}
//         {radioIcon()}
//         <Button
//           isIconOnly
//           variant="light"
//           onPress={onSettings}
//           className="flex rounded-md border h-full border-[#E8E8E8] w-10 min-h-10"
//           aria-label="Настройки"
//         >
//           <SvgIcon src={iconSettings} size={20} className="text-[#1E73BE]" />
//         </Button>
//       </div>
//       {invalidText ? (
//         <div className="text-xs text-red-500 pt-1">{validationMessage ?? 'Текст обязателен'}</div>
//       ) : null}
//     </div>
//   )
// }

// export default SectorItem
