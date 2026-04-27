// import OptionsChooser from '@/components/OptionsChooser'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import WeekdayChooser from '../WeekdayChooser/WeekdayChooser'
// import useWidgetSettingsStore, {
//   useDisplaySettings,
//   useWidgetStaticDefaults
// } from '@/stores/widgetSettingsStore'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'
// import { useShallow } from 'zustand/react/shallow'

// const dateOptions = [
//   { key: 'fromDate', label: 'От: Дата / Время / Год' },
//   { key: 'toDate', label: 'До: Дата / Время / Год' }
// ]

// const timeOptions = [
//   { key: 'fromTime', label: 'С: 8:00' },
//   { key: 'toTime', label: 'До: 21:00' }
// ]

// const ShowingScheduleField = () => {
//   const { setScheduleDate, setScheduleTime } = useDisplaySettings()
//   const staticDefaults = useWidgetStaticDefaults()
//   const defaultDate = { enabled: false, value: '' }
//   const defaultTime = { enabled: false, value: '' }
//   const date = useWidgetSettingsStore(
//     useShallow(s =>
//       withDefaultsPath<typeof defaultDate>(
//         s.settings?.display,
//         'schedule.date',
//         staticDefaults?.display.schedule.date ?? defaultDate
//       )
//     )
//   )
//   const time = useWidgetSettingsStore(
//     useShallow(s =>
//       withDefaultsPath<typeof defaultTime>(
//         s.settings?.display,
//         'schedule.time',
//         staticDefaults?.display.schedule.time ?? defaultTime
//       )
//     )
//   )
//   const { value: dateValue, enabled: dateEnabled } = date
//   const { value: timeValue, enabled: timeEnabled } = time

//   return (
//     <BorderedContainer className="flex flex-col gap-2">
//       <span>Расписание показа</span>
//       <OptionsChooser
//         title="Дата показа"
//         options={dateOptions}
//         value={dateValue}
//         onChange={value => setScheduleDate(dateEnabled ?? true, value)}
//         showSwitch
//         switchedOn={dateEnabled}
//         isDisabled={!dateEnabled}
//         onToggle={enabled => setScheduleDate(enabled, dateValue)}
//         noBorder
//         classNames="!p-0"
//       />
//       <OptionsChooser
//         title="Время показа"
//         options={timeOptions}
//         value={timeValue}
//         onChange={value => setScheduleTime(timeEnabled ?? true, value)}
//         showSwitch
//         switchedOn={timeEnabled}
//         isDisabled={!timeEnabled}
//         onToggle={enabled => setScheduleTime(enabled, timeValue)}
//         noBorder
//         classNames="!p-0"
//       />
//       <WeekdayChooser />
//     </BorderedContainer>
//   )
// }

// export default ShowingScheduleField
