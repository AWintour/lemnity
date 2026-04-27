// import ColorAccessory from '@/components/ColorAccessory'
// import SwitchableField from '@/components/SwitchableField'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'
// import type { WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
// import { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { Slider } from '@heroui/slider'
// import { useEffect, useState } from 'react'

// const WheelOfFortuneBorderColorField = () => {
//   const { settings, setWheelBorderColor, setWheelBorderThickness } = useWheelOfFortuneSettings()
//   const defaults = useWidgetStaticDefaults()

//   const fallbackSettings = defaults?.widget as WheelOfFortuneWidgetSettings
//   const wheelBorderThickness = settings?.borderThickness ?? fallbackSettings.borderThickness

//   const [switchableFieldEnabled, setSwitchableFieldEnabled] = useState(true)

//   useEffect(() => {
//     if (wheelBorderThickness === 0) {
//       setSwitchableFieldEnabled(false)
//     }
//     // TODO: разобраться с зависимостями и избавиться от отключения правила eslint
//     // Мне нужно, чтобы этот хук выполнился при первом рендере
//     // и только при первом рендере
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const onSwitchableFieldToggle = () => {
//     if (switchableFieldEnabled) {
//       setWheelBorderThickness(0)
//     } else {
//       setWheelBorderThickness(fallbackSettings.borderThickness)
//     }

//     setSwitchableFieldEnabled(!switchableFieldEnabled)
//   }

//   return (
//     <SwitchableField
//       title="Контур"
//       enabled={switchableFieldEnabled}
//       onToggle={onSwitchableFieldToggle}
//     >
//       <div className="flex flex-row gap-2.5 mt-3">
//         <ColorAccessory
//           label="Цвет"
//           color={settings?.borderColor ?? fallbackSettings.borderColor}
//           onChange={setWheelBorderColor}
//         />
//         <BorderedContainer className="flex-1 px-2.5 py-1">
//           <Slider
//             value={wheelBorderThickness}
//             className="max-w"
//             size="sm"
//             defaultValue={12}
//             label="Толщина"
//             maxValue={20}
//             minValue={0}
//             step={1}
//             onChange={value => {
//               setWheelBorderThickness(Number(value))
//             }}
//           />
//         </BorderedContainer>
//       </div>
//     </SwitchableField>
//   )
// }

// export default WheelOfFortuneBorderColorField
