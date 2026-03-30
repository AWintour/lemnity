// import { useEffect, useRef, useState } from 'react'
// import DesktopPreview from '../Common/DesktopPreview/DesktopPreview'
// import ActionTimerDesktopScreen from './ActionTimerDesktopScreen'
// import MobilePreview from '../Common/MobilePreview/MobilePreview'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import type { PreviewMode } from '@/stores/widgetPreviewStore'

// type CountDownPreviewProps = {
//   mode: PreviewMode
// }

// const CountDownPreview = ({ mode }: CountDownPreviewProps) => {
//   const windowFormat = useWidgetSettingsStore(
//     s => s.settings?.fields?.template?.templateSettings?.windowFormat
//   )

//   const ref = useRef<HTMLDivElement>(null)
//   const modalWindowRef = useRef<HTMLDivElement>(null)
//   const [modalWidth, setModalWidth] = useState<number | null>(null)

//   useEffect(() => {
//     if (mode !== 'desktop' || windowFormat !== 'modalWindow') return
//     if (ref.current && modalWindowRef.current) {
//       const scaleFactor = ref.current.clientWidth / modalWindowRef.current.clientWidth
//       ref.current.style.transform = `scale(${scaleFactor})`
//       ref.current.style.transformOrigin = 'top left'
//       setModalWidth(modalWindowRef.current.clientWidth)
//     }
//   }, [mode, windowFormat])

//   if (mode === 'mobile') {
//     return <MobilePreview children={undefined} />
//   }

//   if (windowFormat === 'modalWindow') {
//     return (
//       <div ref={ref} className="flex flex-col gap-5">
//         <div>
//           <p className="font-rubik text-[25px] py-[15px]">Главный экран</p>
//           <DesktopPreview
//             ref={modalWindowRef}
//             screen="main"
//             onSubmit={() => {}}
//             screens={{
//               main: ActionTimerDesktopScreen,
//               prize: ActionTimerDesktopScreen,
//               panel: ActionTimerDesktopScreen
//             }}
//           />
//         </div>
//         <hr
//           className="scale-100 h-px border-0 bg-default-300 self-start"
//           style={{ width: modalWidth ? `${modalWidth}px` : undefined }}
//         ></hr>
//         <div>
//           <p className="font-rubik text-[25px] mb-5">Дополнительный экран</p>
//           <DesktopPreview
//             screen="prize"
//             onSubmit={() => {}}
//             ref={modalWindowRef}
//             screens={{
//               main: ActionTimerDesktopScreen,
//               prize: ActionTimerDesktopScreen,
//               panel: ActionTimerDesktopScreen
//             }}
//           />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <DesktopPreview
//       screen="panel"
//       onSubmit={() => {}}
//       screens={{
//         main: ActionTimerDesktopScreen,
//         prize: ActionTimerDesktopScreen,
//         panel: ActionTimerDesktopScreen
//       }}
//     />
//   )
// }

// export default CountDownPreview
