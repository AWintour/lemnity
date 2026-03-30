// import { useActionTimerSettings } from '@/layouts/Widgets/CountDown/hooks'
// import { buildActionTimerWidgetSettings } from './defaults'

// type CountDownProps = {
//   className?: string
//   isMobile?: boolean
// }

// const CountDown = (props?: CountDownProps) => {
//   const { className, isMobile } = props ?? {}
//   const { settings } = useActionTimerSettings()
//   const countdownDefaults = buildActionTimerWidgetSettings().countdown
//   const countdownSettings = settings?.countdown ?? countdownDefaults
//   const { imageUrl, imagePosition } = countdownSettings

//   return (
//     <div
//       className={`overflow-hidden self-center h-full ${isMobile ? 'rounded-b-2xl' : 'rounded-2xl'}`}
//     >
//       <img
//         className={`overflow-hidden text-white h-full object-cover ${className ?? ''}`}
//         style={{ objectPosition: imagePosition }}
//         src={imageUrl ? imageUrl : ''}
//       />
//     </div>
//   )
// }

// export default CountDown
