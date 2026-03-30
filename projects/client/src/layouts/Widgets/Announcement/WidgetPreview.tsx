// import { type CSSProperties } from 'react'
// import { useShallow } from 'zustand/react/shallow'
// import { cn } from '@heroui/theme'

// import AnnouncementPreview from './AnnouncementPreview'

// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import useUrlImage from '@/hooks/useUrlImage'

// import type {
//   AnnouncementWidgetType,
// } from '@lemnity/widget-config/widgets/announcement'
// import { announcementWidgetDefaults } from './defaults'

// const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

// const WidgetPreview = () => {
//   const {
//     colorScheme,
//     backgroundColor,
//     borderRadius,
//     contentType,
//     contentAlignment,
//     contentUrl,
//     rewardScreenEnabled,
//   } = useWidgetSettingsStore(
//     useShallow(s => {
//       const widget = s.settings?.widget as AnnouncementWidgetType
//       const appearence = widget.appearence
//       const rewardMessageSettings = widget.rewardMessageSettings
//       const infoSettings = widget.infoSettings

//       return {
//         colorScheme: appearence.colorScheme
//           ?? announcementWidgetDefaults.appearence.colorScheme,
//         backgroundColor:
//           appearence.backgroundColor && appearence.backgroundColor.length > 0
//             ? appearence.backgroundColor
//             : announcementWidgetDefaults.appearence.backgroundColor,
//         borderRadius: appearence.borderRadius
//           ?? announcementWidgetDefaults.appearence.borderRadius,

//         contentType: infoSettings.contentType
//           ?? announcementWidgetDefaults.infoSettings.contentType,
//         contentAlignment: infoSettings.contentAlignment
//           ?? announcementWidgetDefaults.infoSettings.contentAlignment,
//         contentUrl: infoSettings.contentUrl
//           ?? announcementWidgetDefaults.infoSettings.contentUrl,

//         rewardScreenEnabled: rewardMessageSettings.rewardScreenEnabled
//           ?? announcementWidgetDefaults
//                .rewardMessageSettings
//                .rewardScreenEnabled,
//       }
//     })
//   )

//   const {
//     base64Image: contentBase64Image,
//     // error,
//     isLoading,
//   } = useUrlImage(contentUrl)

//   const containerStyle: CSSProperties = {
//     backgroundColor: colorScheme === 'primary'
//       ? '#FFFFFF'
//       : backgroundColor,
//     borderRadius: borderRadius,
//   }

//   const backgroundImage = contentUrl && !isLoading
//     ? contentBase64Image as string
//     : noBackgroundImageUrl

//   if (contentType === 'background') {
//     containerStyle.backgroundImage = `url('${backgroundImage}')`
//     containerStyle.backgroundSize = 'cover'
//     containerStyle.backgroundPosition = contentAlignment
//   }

//   const previewWidgetCardStyle = cn(
//     'w-fit scale-40 origin-top-left ml-32.5',
//     'pointer-events-none',
//     // 'h-57',
//   )

//   return (
//     <div className='w-full h-full flex flex-col overflow-auto select-none'>
//       <AnnouncementPreview
//         className={previewWidgetCardStyle}
//         rewardScreenEnabled={rewardScreenEnabled}
//       />
//     </div>
//   )
// }

// export default WidgetPreview
