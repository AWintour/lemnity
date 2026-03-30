// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import { Input } from '@heroui/input'
// import { Radio, RadioGroup } from '@heroui/radio'
// import useWidgetSettingsStore, {
//   useDisplaySettings,
//   useWidgetStaticDefaults
// } from '@/stores/widgetSettingsStore'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'

// const DontShowField = () => {
//   const { setDontShow } = useDisplaySettings()
//   const staticDefaults = useWidgetStaticDefaults()
//   const defaultDontShow = { afterWin: false, afterShows: null as number | null }
//   const dontShow = useWidgetSettingsStore(s =>
//     withDefaultsPath(
//       s.settings?.display,
//       'dontShow',
//       staticDefaults?.display.dontShow ?? defaultDontShow
//     )
//   )
//   const { afterWin, afterShows } = dontShow

//   const getRadioDot = (currentAfterWin: boolean, targetAfterWin: boolean) => {
//     return (
//       <RadioGroup
//         value={String(currentAfterWin)}
//         onValueChange={v => setDontShow(v === 'true', afterShows)}
//       >
//         <Radio
//           classNames={{
//             label: 'text-gray-700',
//             wrapper: 'border-[#373737] group-data-[selected=true]:!border-[#373737] border-small',
//             control: 'bg-[#373737] w-3.5 h-3.5'
//           }}
//           value={String(targetAfterWin)}
//         ></Radio>
//       </RadioGroup>
//     )
//   }

//   return (
//     <BorderedContainer className="flex-col gap-2">
//       <span>Не показывать</span>
//       <div className="flex flex-row gap-2">
//         <BorderedContainer
//           className="w-full flex-row items-center gap-2 h-12"
//           onClick={() => setDontShow(true, afterShows)}
//         >
//           {getRadioDot(afterWin, true)}
//           <span>После выигрыша</span>
//         </BorderedContainer>
//         <BorderedContainer
//           className="w-full flex-row items-center gap-2 h-12"
//           onClick={() => setDontShow(false, afterShows)}
//         >
//           {getRadioDot(afterWin, false)}
//           <span>После</span>
//           <Input
//             radius="sm"
//             maxLength={2}
//             className="min-w-[46px] w-[46px]"
//             variant="bordered"
//             placeholder="20"
//             value={(afterShows && String(afterShows)) || ''}
//             onChange={e => setDontShow(afterWin, Number(e.target.value) || null)}
//           />
//           <span>показов</span>
//         </BorderedContainer>
//       </div>
//     </BorderedContainer>
//   )
// }

// export default DontShowField
