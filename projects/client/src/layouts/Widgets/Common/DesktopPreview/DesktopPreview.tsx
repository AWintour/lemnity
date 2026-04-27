// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import type { ComponentType, ReactElement, Ref } from 'react'
// import { forwardRef } from 'react'
// import CloseButton from '../CloseButton/CloseButton'
// import type { DesktopScreenProps, WidgetPreviewScreen } from '../../registry'

// const ModalChrome = forwardRef(
//   (
//     {
//       children,
//       hideCloseButton
//     }: {
//       children: ReactElement | ReactElement[]
//       hideCloseButton?: boolean
//     },
//     ref: Ref<HTMLDivElement> | undefined
//   ) => {
//     const template = useWidgetSettingsStore(s => s?.settings?.fields?.template)
//     const { colorScheme, customColor } = template?.templateSettings || {}
//     const imageUrl = useWidgetSettingsStore(
//       s => s?.settings?.fields?.template?.templateSettings?.image?.url
//     )
//     const imageEnabled = useWidgetSettingsStore(
//       s => s?.settings?.fields?.template?.templateSettings?.image?.enabled
//     )

//     return (
//       <div
//         style={{
//           ...(imageEnabled &&
//             imageUrl && {
//               backgroundImage: `url(${imageUrl})`,
//               backgroundSize: 'cover',
//               backgroundRepeat: 'no-repeat'
//             }),
//           backgroundColor: colorScheme === 'primary' ? '#725DFF' : customColor
//         }}
//         className="mx-auto rounded-2xl overflow-hidden text-white relative w-[928px] min-h-[500px] flex items-center"
//         ref={ref}
//       >
//         {!hideCloseButton && <CloseButton position="right" />}
//         {children}
//       </div>
//     )
//   }
// )

// const SidePanelChrome = ({
//   children,
//   hideCloseButton
// }: {
//   children: ReactElement | ReactElement[]
//   hideCloseButton?: boolean
// }) => {
//   const template = useWidgetSettingsStore(s => s?.settings?.fields?.template)
//   const { colorScheme, customColor } = template?.templateSettings || {}
//   const imageUrl = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings?.image?.url
//   )
//   const imageEnabled = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings?.image?.enabled
//   )

//   return (
//     <div className="mx-auto w-full h-full">
//       <div className="flex h-full">
//         <div className="flex-1 justify-center" />
//         <div
//           style={{
//             ...(imageEnabled && imageUrl && { backgroundImage: `url(${imageUrl})` }),
//             backgroundColor: colorScheme === 'primary' ? '#725DFF' : customColor
//           }}
//           className="flex w-[550px] h-full items-center rounded-l-xl text-white relative overflow-hidden"
//         >
//           {!hideCloseButton && <CloseButton position="left" />}
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }

// type ScreenMap = Partial<Record<WidgetPreviewScreen, ComponentType<DesktopScreenProps>>>

// interface DesktopPreviewProps {
//   screen: WidgetPreviewScreen
//   hideCloseButton?: boolean
//   onSubmit: DesktopScreenProps['onSubmit']
//   screens?: ScreenMap
// }

// const DesktopPreview = (
//   { screen, hideCloseButton = false, onSubmit, screens }: DesktopPreviewProps,
//   ref: Ref<HTMLDivElement> | undefined
// ) => {
//   const ScreenComponent = screens?.[screen]
//   if (!ScreenComponent) return null
//   const body = <ScreenComponent screen={screen} onSubmit={onSubmit} />

//   if (screen === 'panel') {
//     return <SidePanelChrome hideCloseButton={hideCloseButton}>{body}</SidePanelChrome>
//   }

//   return (
//     <ModalChrome ref={ref} hideCloseButton={hideCloseButton}>
//       {body}
//     </ModalChrome>
//   )
// }

// export default forwardRef(DesktopPreview)
