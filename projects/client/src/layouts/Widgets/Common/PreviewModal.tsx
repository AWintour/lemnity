// import { type FC } from 'react'
// import { Button } from '@heroui/button'
// import SvgIcon from '@/components/SvgIcon'
// import iconCross from '@/assets/icons/cross.svg'
// import Modal from '@/components/Modal/Modal'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import DesktopPreview from './DesktopPreview/DesktopPreview'
// import { getWidgetDefinition } from '@/layouts/Widgets/registry'

// interface PreviewModalProps {
//   isOpen: boolean
//   onClose: () => void
//   screen: 'main' | 'prize' | 'panel'
//   onSubmit: () => void
//   containerClassName?: string
// }

// const PreviewModal: FC<PreviewModalProps> = ({
//   isOpen,
//   onClose,
//   screen,
//   onSubmit,
//   containerClassName
// }) => {
//   const imageUrl = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings?.image?.url
//   )
//   const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
//   const definition = widgetType ? getWidgetDefinition(widgetType) : null
//   const CustomModalComponent = definition?.preview?.modal
//   const containerStyle =
//     !CustomModalComponent && imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       role="dialog"
//       closeOnBackdrop
//       closeOnEsc
//       containerClassName={`max-w-[928px] ${containerClassName}`}
//     >
//       <div className="relative" style={containerStyle}>
//         <Button
//           isIconOnly
//           variant="light"
//           size="sm"
//           className="absolute z-10 p-0 m-0 border border-gray-300 rounded-[10px] right-4 top-4 min-w-8 w-8 h-8 bg-white text-gray-700 hover:bg-gray-50"
//           // In Shadow DOM, React Aria press can be cancelled due to event retargeting.
//           // Prefer native click, keep onPress for non-shadow environments.
//           onClick={onClose}
//           onPress={onClose}
//         >
//           <SvgIcon src={iconCross} className="text-gray-700" size="18px" />
//         </Button>
//         {CustomModalComponent ? (
//           <CustomModalComponent screen={screen} onSubmit={onSubmit} />
//         ) : (
//           <DesktopPreview
//             screen={screen}
//             hideCloseButton
//             onSubmit={onSubmit}
//             screens={definition?.preview?.desktopScreens}
//           />
//         )}
//       </div>
//     </Modal>
//   )
// }

// export default PreviewModal
