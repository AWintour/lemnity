// import { motion } from 'framer-motion'
// import DisplaySettingsField from '../DisplaySettingsField/DisplaySettingsField'
// import ShowingFrequencyField from '../ShowingFrequencyField/ShowingFrequencyField'
// import DontShowField from '../DontShowField/DontShowField'
// import ShowingLimitsField from '../ShowingLimitsField/ShowingLimitsField'
// import ShowingScheduleField from '../ShowingScheduleField/ShowingScheduleField'
// import { memo } from 'react'

// // const showingFrequencyOptions: OptionItem[] = [
// //   { key: 'everyPage', label: 'На каждой странице' },
// //   {
// //     key: 'periodically',
// //     label: 'Один раз в несколько секунд',
// //     accessory: <Input maxLength={2} className="w-[46px]" variant="bordered" placeholder="20" />
// //   }
// // ]

// const TimerSettingsField = () => {
//   //   const [showingFrequency, setShowingFrequency] = useState('everyPage')
//   return (
//     <motion.div
//       initial={{ opacity: 0, height: 0 }}
//       animate={{ opacity: 1, height: 'auto' }}
//       exit={{ opacity: 0, height: 0 }}
//       transition={{ duration: 0.3 }}
//       className="flex flex-col gap-3"
//     >
//       <DisplaySettingsField />
//       <ShowingFrequencyField />
//       <DontShowField />
//       <ShowingLimitsField />
//       <ShowingScheduleField />
//     </motion.div>
//   )
// }

// export default memo(TimerSettingsField)
