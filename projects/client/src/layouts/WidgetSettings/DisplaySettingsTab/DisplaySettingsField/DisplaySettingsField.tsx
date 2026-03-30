// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import { Checkbox } from '@heroui/checkbox'
// import { Input } from '@heroui/input'
// import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'
// import { useShallow } from 'zustand/react/shallow'

// const DisplaySettingsField = () => {
//   const staticDefaults = useWidgetStaticDefaults()
//   const defaultShowRules = {
//     onExit: false,
//     scrollBelow: { enabled: false, percent: null as number | null },
//     afterOpen: { enabled: false, seconds: null as number | null }
//   }
//   const showRules = useWidgetSettingsStore(
//     useShallow(s =>
//       withDefaultsPath<typeof defaultShowRules>(
//         s.settings?.display,
//         'showRules',
//         staticDefaults?.display.showRules ?? defaultShowRules
//       )
//     )
//   )
//   const { onExit, scrollBelow, afterOpen } = showRules
//   const showOnExit = onExit
//   const scrollBelowEnabled = scrollBelow.enabled
//   const scrollBelowPercent = scrollBelow.percent
//   const afterOpenEnabled = afterOpen.enabled
//   const afterOpenSeconds = afterOpen.seconds

//   const setShowOnExit = useWidgetSettingsStore(s => s.setShowOnExit)
//   const setScrollBelow = useWidgetSettingsStore(s => s.setScrollBelow)
//   const setAfterOpen = useWidgetSettingsStore(s => s.setAfterOpen)

//   const isScrollBelowValid = (value: string) => {
//     if (!scrollBelowEnabled) return true
//     if (value.length === 0) return false
//     if (Number(value) < 0) return false
//     return true
//   }

//   const isTimerAfterOpenValid = (value: string) => {
//     if (!afterOpenEnabled) return true
//     if (value.length === 0) return false
//     if (Number(value) < 0) return false
//     return true
//   }

//   return (
//     <>
//       <BorderedContainer className="flex-col gap-2">
//         <span>Настройки показа</span>
//         <BorderedContainer className="h-12 py-0">
//           <Checkbox
//             isSelected={showOnExit}
//             onValueChange={setShowOnExit}
//             classNames={{
//               wrapper:
//                 'before:border-[#373737] rounded-[4px] before:rounded-[4px] after:rounded-[4px] after:bg-[#373737]',
//               base: 'max-w-full',
//               label: 'text-[#797979] text-base'
//             }}
//           >
//             Когда пользователь покидает сайт
//           </Checkbox>
//         </BorderedContainer>
//         <BorderedContainer className="flex-row gap-2 items-center h-12 py-0">
//           <Checkbox
//             isSelected={scrollBelowEnabled}
//             onValueChange={v => setScrollBelow(v, scrollBelowPercent)}
//             classNames={{
//               wrapper:
//                 'before:border-[#373737] rounded-[4px] before:rounded-[4px] after:rounded-[4px] after:bg-[#373737]',
//               base: 'max-w-full',
//               label: 'nowrap text-[#797979] text-base'
//             }}
//           >
//             При скролле ниже
//           </Checkbox>
//           <Input
//             radius="sm"
//             maxLength={2}
//             className="w-[46px]"
//             variant="bordered"
//             placeholder="20"
//             value={String(scrollBelowPercent ?? '')}
//             isInvalid={!isScrollBelowValid(String(scrollBelowPercent ?? ''))}
//             onChange={e => {
//               const v = e.target.value
//               const num = v === '' ? null : Number(v)
//               setScrollBelow(scrollBelowEnabled, Number.isNaN(num) ? null : num)
//             }}
//           />
//           <span className="text-[#797979]">% страницы сайта</span>
//         </BorderedContainer>
//         <BorderedContainer className="flex-row gap-2 items-center h-12 py-0">
//           <Checkbox
//             isSelected={afterOpenEnabled}
//             onValueChange={v => setAfterOpen(v, afterOpenSeconds)}
//             classNames={{
//               wrapper:
//                 'before:border-[#373737] rounded-[4px] before:rounded-[4px] after:rounded-[4px] after:bg-[#373737]',
//               base: 'max-w-full',
//               label: 'nowrap text-[#797979] text-base'
//             }}
//           >
//             Через
//           </Checkbox>
//           <Input
//             radius="sm"
//             maxLength={2}
//             className="w-[46px]"
//             variant="bordered"
//             placeholder="20"
//             value={String(afterOpenSeconds ?? '')}
//             isInvalid={!isTimerAfterOpenValid(String(afterOpenSeconds ?? ''))}
//             onChange={e => {
//               const v = e.target.value
//               const num = v === '' ? null : Number(v)
//               setAfterOpen(afterOpenEnabled, Number.isNaN(num) ? null : num)
//             }}
//           />
//           <span className="text-[#797979]">секунд после открытия страницы</span>
//         </BorderedContainer>
//       </BorderedContainer>
//     </>
//   )
// }

// export default DisplaySettingsField
