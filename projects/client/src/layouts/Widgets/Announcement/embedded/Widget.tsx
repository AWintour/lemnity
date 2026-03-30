// import type { Ref, CSSProperties } from 'react'
// import { useShallow } from 'zustand/react/shallow'

// import AnnouncementWidget, {
//   type AnnouncementWidgetVariant,
// } from '../AnnouncementWidget'

// import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import useUrlImage from '@/hooks/useUrlImage'

// import type {
//   AnnouncementWidgetType,
// } from '@lemnity/widget-config/widgets/announcement'
// import { announcementWidgetDefaults } from '../defaults'

// const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

// export type WidgetProps = {
//   ref: Ref<HTMLDivElement>
//   focused: boolean
//   announementVariant: AnnouncementWidgetVariant
//   onAnnouncementButtonPress: () => void
// }

// const Widget = ({ref, ...props}: WidgetProps) => {
//   const {
//     colorScheme,
//     backgroundColor,
//     borderRadius,

//     contentType,
//     contentAlignment,
//     contentUrl,
//   } = useWidgetSettingsStore(
//     useShallow(s => {
//       const widget = s.settings?.widget as AnnouncementWidgetType
//       const appearence = widget.appearence
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
//       }
//     })
//   )

//   const {
//     base64Image: contentBase64Image,
//     // error,
//     isLoading,
//   } = useUrlImage(contentUrl)

//   const mobile = useIsMobileViewport()

//   const containerStyle: CSSProperties = {
//     backgroundColor: colorScheme === 'primary'
//       ? '#FFFFFF'
//       : backgroundColor,
//     borderRadius: mobile
//       ? undefined
//       : borderRadius,
//   }

//   const backgroundImage = contentUrl && !isLoading
//     ? contentBase64Image as string
//     : noBackgroundImageUrl

//   if (contentType === 'background') {
//     containerStyle.backgroundImage = `url('${backgroundImage}')`
//     containerStyle.backgroundSize = 'cover'
//     containerStyle.backgroundPosition = contentAlignment
//   }

//   return (
//     <>
//       <AnnouncementWidget
//         ref={ref}
//         variant={props.announementVariant}
//         focused={props.focused}
//         onButtonPress={props.onAnnouncementButtonPress}
//       />
//     </>
//   )
// }

// export default Widget
