// import { useEffect, useState } from 'react'
// import SwitchableField from '@/components/SwitchableField'
// import { Input } from '@heroui/input'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import { useActionTimerSettings } from '@/layouts/Widgets/CountDown/hooks'
// import { formatDateForInput } from '@/layouts/Widgets/CountDown/utils'
// import ColorAccessory from '@/components/ColorAccessory'

// const CountdownField = () => {
//   const { settings, setCountdownEnabled } = useFieldsSettings()
//   const {
//     settings: widgetSettings,
//     updateActionTimer,
//     setTextBeforeCountdown,
//     setTextBeforeCountdownColor
//   } = useActionTimerSettings()

//   const countdownForm = settings?.countdown
//   const isCountdownEnabled = countdownForm?.enabled ?? false
//   const eventDate = widgetSettings?.countdown.eventDate ?? null

//   const [inputValue, setInputValue] = useState(() => formatDateForInput(eventDate))
//   const textBeforeCountdown = widgetSettings?.countdown.textBeforeCountdown ?? ''
//   const textBeforeCountdownColor = widgetSettings?.countdown.badgeColor ?? '#000000'
//   useEffect(() => {
//     setInputValue(formatDateForInput(eventDate))
//   }, [eventDate])

//   const handleToggle = (next: boolean) => {
//     if (isCountdownEnabled === next) return
//     setCountdownEnabled(next)
//   }

//   const handleDateChange = (value: string) => {
//     setInputValue(value)
//     const parsed = new Date(value)
//     if (!Number.isNaN(parsed.getTime())) {
//       const utcIso = parsed.toISOString()
//       updateActionTimer({ eventDate: utcIso })
//     }
//   }

//   return (
//     <SwitchableField
//       title="Обратный отсчёт"
//       enabled={isCountdownEnabled}
//       onToggle={handleToggle}
//       classNames={{ content: 'flex flex-col gap-4' }}
//     >
//       <div className="flex flex-row gap-2 items-end">
//         <Input
//           classNames={{ inputWrapper: 'h-14' }}
//           labelPlacement="outside"
//           label="Текст перед отсчётом"
//           radius="sm"
//           variant="bordered"
//           type="text"
//           value={textBeforeCountdown}
//           placeholder="До мероприятия осталось:"
//           onValueChange={setTextBeforeCountdown}
//         />
//         <ColorAccessory
//           color={textBeforeCountdownColor ?? '#000000'}
//           onChange={setTextBeforeCountdownColor}
//         />
//       </div>
//       <Input
//         radius="sm"
//         variant="bordered"
//         type="datetime-local"
//         value={inputValue}
//         placeholder="Выберите дату"
//         onValueChange={handleDateChange}
//       />
//     </SwitchableField>
//   )
// }

// export default CountdownField
