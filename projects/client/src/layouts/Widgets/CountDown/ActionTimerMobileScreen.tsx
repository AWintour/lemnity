// import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
// import CountDown from './CountDown'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

// const ActionTimerMobileScreen = () => {
//   const settings = useWidgetSettingsStore(s => s?.settings?.fields?.template?.templateSettings)
//   const { customColor, colorScheme } = settings || { customColor: '#F5F6F8' }

//   const bgStyle = { backgroundColor: colorScheme === 'primary' ? '#725DFF' : customColor }
//   return (
//     <div className="w-full rounded-2xl bg-[#F5F6F8] border border-[#E6E6E6] p-4 overflow-y-auto">
//       <div
//         style={bgStyle}
//         className="mx-auto w-[360px] rounded-2xl text-white relative overflow-hidden"
//       >
//         <CountDown />
//         <div className="p-4">
//           <DynamicFieldsForm isMobile centered onSubmit={() => {}} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ActionTimerMobileScreen
