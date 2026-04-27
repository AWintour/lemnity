// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import { getWidgetDefinition } from '../../registry'
// import type { ReactNode } from 'react'

// const MobilePreview = ({ children }: { children: ReactNode }) => {
//   const settings = useWidgetSettingsStore(s => s.settings)

//   if (!settings) {
//     return (
//       <div className="w-full rounded-2xl bg-[#F5F6F8] border border-[#E6E6E6] p-6 text-center text-sm text-gray-500">
//         {children || 'Мобильный предпросмотр недоступен: настройки виджета не инициализированы'}
//       </div>
//     )
//   }

//   const { widgetType, widget } = settings
//   const effectiveType = widget.type ?? widgetType
//   const definition = getWidgetDefinition(effectiveType)
//   const MobileComponent = definition.preview.mobile

//   if (!MobileComponent)
//     return (
//       <div className="w-full rounded-2xl bg-[#F5F6F8] border border-[#E6E6E6] p-6 text-center text-sm text-gray-500">
//         {children || 'Мобильный предпросмотр для выбранного виджета пока не реализован'}
//       </div>
//     )

//   return <MobileComponent />
// }

// export default MobilePreview
