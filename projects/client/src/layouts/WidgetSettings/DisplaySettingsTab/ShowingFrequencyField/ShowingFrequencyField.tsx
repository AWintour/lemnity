// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import { Input } from '@heroui/input'
// import { Radio, RadioGroup } from '@heroui/radio'
// import { Select, SelectItem } from '@heroui/select'
// import useWidgetSettingsStore, {
//   useDisplaySettings,
//   useWidgetStaticDefaults,
//   type FrequencyMode,
//   type FrequencyUnit
// } from '@/stores/widgetSettingsStore'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'
// import { useShallow } from 'zustand/react/shallow'

// const ShowingFrequencyField = () => {
//   const { setFrequency } = useDisplaySettings()
//   const staticDefaults = useWidgetStaticDefaults()
//   const defaultFrequency: {
//     mode: FrequencyMode
//     value?: number
//     unit?: FrequencyUnit
//   } = {
//     mode: 'everyPage',
//     value: undefined,
//     unit: 'sec'
//   }
//   const frequency = useWidgetSettingsStore(
//     useShallow(s =>
//       withDefaultsPath<typeof defaultFrequency>(
//         s.settings?.display,
//         'frequency',
//         staticDefaults?.display.frequency ?? defaultFrequency
//       )
//     )
//   )
//   const { mode, value, unit } = frequency

//   const getRadioDot = (currentMode: FrequencyMode | undefined, targetMode: FrequencyMode) => {
//     return (
//       <RadioGroup
//         value={currentMode}
//         onValueChange={v => setFrequency(v as FrequencyMode, value, unit)}
//       >
//         <Radio
//           classNames={{
//             label: 'text-gray-700',
//             wrapper: 'border-[#373737] group-data-[selected=true]:!border-[#373737] border-small',
//             control: 'bg-[#373737] w-3.5 h-3.5'
//           }}
//           value={targetMode}
//         ></Radio>
//       </RadioGroup>
//     )
//   }

//   return (
//     <BorderedContainer className="flex-col gap-2">
//       <span>Частота показа одному пользователю</span>
//       <div className="flex flex-row gap-2">
//         <BorderedContainer
//           className="w-full flex-row items-center gap-2 h-12"
//           onClick={() => setFrequency('everyPage', value, unit)}
//         >
//           {getRadioDot(mode, 'everyPage')}
//           <span>На каждой странице</span>
//         </BorderedContainer>
//         <BorderedContainer
//           className="w-full flex-row items-center gap-2 h-12"
//           onClick={() => setFrequency('periodically', value, unit)}
//         >
//           {getRadioDot(mode, 'periodically')}
//           <span className="flex shrink-0">Один раз в</span>
//           <Input
//             radius="sm"
//             maxLength={2}
//             className="min-w-[46px] w-[46px]"
//             variant="bordered"
//             placeholder="20"
//             value={(value && String(value)) || ''}
//             onChange={e => setFrequency(mode, Number(e.target.value) || 0, unit)}
//           />
//           <Select
//             selectedKeys={unit ? [unit] : []}
//             onSelectionChange={keys => {
//               const selected = Array.from(keys)[0] as FrequencyUnit
//               setFrequency(mode, value, selected)
//             }}
//             onClick={() => setFrequency('periodically', value, unit)}
//           >
//             <SelectItem key="sec">Секунд</SelectItem>
//             <SelectItem key="min">Минут</SelectItem>
//           </Select>
//         </BorderedContainer>
//       </div>
//     </BorderedContainer>
//   )
// }

// export default ShowingFrequencyField
