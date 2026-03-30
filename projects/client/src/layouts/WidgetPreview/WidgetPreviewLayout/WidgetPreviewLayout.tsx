// // import useWidgetPreviewStore from '@/stores/widgetPreviewStore'
// import { Button } from '@heroui/button'
// // import type { PreviewMode } from '@/stores/widgetPreviewStore'
// import { WidgetTypeEnum } from '@lemnity/api-sdk'
// // import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import type { ReactNode } from 'react'

// const WidgetPreviewLayout = ({ children }: { children: ReactNode }) => {
//   const mode = useWidgetPreviewStore(s => s.mode)
//   const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
//   const setMode = useWidgetPreviewStore(s => s.setMode)

//   const tabClass = (id: PreviewMode): string =>
//     `px-4 py-2 text-sm font-medium rounded-md transition ${
//       mode === id ? 'bg-white text-gray-900 shadow' : 'text-black'
//     }`

//   const tabs = () => (
//     <div className="w-full flex justify-center">
//       <div className="flex w-full h-11.5 rounded-[7px] border border-[#DEE4F2] bg-gray-100 p-0.5 gap-1">
//         <Button
//           variant="light"
//           size="sm"
//           radius="md"
//           className={`${tabClass('desktop')} flex-1 h-full font-normal text-[18px] `}
//           onPress={() => setMode('desktop')}
//         >
//           Компьютер
//         </Button>
//         <Button
//           variant="light"
//           size="sm"
//           radius="sm"
//           className={`${tabClass('mobile')} flex-1 h-full font-normal text-[18px]`}
//           onPress={() => setMode('mobile')}
//         >
//           Телефон
//         </Button>
//       </div>
//     </div>
//   )

//   return (
//     <div className="flex flex-col gap-3.75 h-full">
//       <span className="text-[22px] leading-6.5 font-normal text-[#060606]">Предпросмотр</span>
//       {widgetType === WidgetTypeEnum.ACTION_TIMER
//        || widgetType === WidgetTypeEnum.ANNOUNCEMENT
//        || widgetType === WidgetTypeEnum.NOTIFICATION
//          ? null
//          : tabs()
//       }
//       {children}
//     </div>
//   )
// }

// export default WidgetPreviewLayout
