// import {
//   useEffect,
//   useRef, 
//   useState,
//   type HTMLProps,
//   type CSSProperties,
// } from 'react'

// import EventTimerWidget from './EventTimerWidget'
// import { FadeInOut } from '@/components'

// type EventTimerPreviewProps = Pick<HTMLProps<HTMLElement>, 'className'> & {
//   rewardScreenEnabled: boolean
//   containerStyle: CSSProperties
// }

// const EventTimerPreview = (props: EventTimerPreviewProps) => {
//   const countdownInfoScreenRef = useRef<HTMLDivElement | null>(null)
//   const countdownFormScreenRef = useRef<HTMLDivElement | null>(null)
//   const countdownRewardScreenRef = useRef<HTMLDivElement | null>(null)

//   const [countdownInfoScreenRect, setCountdownInfoScreenRect] =
//     useState<DOMRect | null>(null)
//   const [countdownFormScreenRect, setCountdownFormScreen] =
//     useState<DOMRect | null>(null)
//   const [countdownRewardScreenRect, setCountdownRewardScreen] =
//     useState<DOMRect | null>(null)

//   useEffect(() => {
//     if (
//       !countdownInfoScreenRef.current
//       || !countdownFormScreenRef.current
//       || !countdownRewardScreenRef.current
//     ) {
//       return
//     }

//     const countdownInfoScreenObserver = new ResizeObserver(() => {
//       if (!countdownInfoScreenRef.current) return
//       setCountdownInfoScreenRect(
//         countdownInfoScreenRef.current.getBoundingClientRect()
//       )
//     })
//     countdownInfoScreenObserver.observe(countdownInfoScreenRef.current)

//     const countdownFormScreenObserver = new ResizeObserver(() => {
//       if (!countdownFormScreenRef.current) return
//       setCountdownFormScreen(
//         countdownFormScreenRef.current.getBoundingClientRect()
//       )
//     })
//     countdownFormScreenObserver.observe(countdownFormScreenRef.current)

//     const countdownRewardScreenObserver = new ResizeObserver(() => {
//       if (!countdownRewardScreenRef.current) return
//       setCountdownRewardScreen(
//         countdownRewardScreenRef.current.getBoundingClientRect()
//       )
//     })
//     countdownRewardScreenObserver.observe(countdownRewardScreenRef.current)

//     return () => {
//       countdownInfoScreenObserver.disconnect()
//       countdownFormScreenObserver.disconnect()
//       countdownRewardScreenObserver.disconnect()
//     }
//   }, [])

//   return (
//     // don't look at the vertical margins =w=
//     // i was fed the fuck up with how much gaps were bitching at me
//     <div className='w-full h-full flex flex-col overflow-auto select-none'>
//       <div className='flex flex-col gap-1 h-full'>
//         <span className='text-xs self-center mb-2'>
//           Главный экран
//         </span>
//         <div
//           className={props.className}
//           style={{
//             height: countdownInfoScreenRect
//               ? `${countdownInfoScreenRect.height}px`
//               : '228px'
//           }}
//         >
//           <EventTimerWidget
//             ref={countdownInfoScreenRef}
//             variant='countdown'
//             focused
//             containerStyle={props.containerStyle}
//           />
//         </div>

//         <FadeInOut visible={props.rewardScreenEnabled}>
//           <span className='text-xs self-center mt-1 mb-1'>
//             Экран формы
//           </span>
//           <div
//             className={props.className}
//             style={{
//               height: countdownFormScreenRect
//                 ? `${countdownFormScreenRect.height}px`
//                 : '228px'
//             }}
//           >
//             <EventTimerWidget
//               ref={countdownFormScreenRef}
//               variant='form'
//               focused
//               containerStyle={props.containerStyle}
//             />
//           </div>

//           <span className='text-xs self-center mb-1'>
//             Экран выигрыша
//           </span>
//           <div
//             className={props.className}
//             style={{
//               height: countdownRewardScreenRect
//                 ? `${countdownRewardScreenRect.height}px`
//                 : '228px'
//             }}
//           >
//             <EventTimerWidget
//               ref={countdownRewardScreenRef}
//               variant='reward'
//               focused
//               containerStyle={props.containerStyle}
//             />
//           </div>
//         </FadeInOut>
//       </div>
//     </div>
//   )
// }

// export default EventTimerPreview
