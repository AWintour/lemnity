// import { useCallback, useEffect, useState, type CSSProperties } from 'react'
// import ActionTimerDesktopScreen from './ActionTimerDesktopScreen'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import Modal from '@/components/Modal/Modal'
// import DesktopPreview from '../Common/DesktopPreview/DesktopPreview'
// import { useWidgetActions } from '../useWidgetActions'
// import { actionTimerHandlers } from './actionHandlers'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'
// import type { DisplaySettings } from '@/stores/widgetSettings/types'
// import { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { useShallow } from 'zustand/react/shallow'
// import { sendEvent, sendPublicRequest } from '@/common/api/publicApi'
// import type { WidgetLeadFormValues } from '@/layouts/Widgets/registry'
// import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
// import CountDown from './CountDown'
// import RewardContent from '../Common/RewardContent/RewardContent'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import CloseButton from '../Common/CloseButton/CloseButton'
// import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

// const useVisualViewportOverlayStyle = (enabled: boolean): CSSProperties => {
//   const [style, setStyle] = useState<CSSProperties>({})

//   useEffect(() => {
//     if (!enabled) return
//     if (typeof window === 'undefined') return

//     let raf = 0
//     const update = () => {
//       cancelAnimationFrame(raf)
//       raf = requestAnimationFrame(() => {
//         const vv = window.visualViewport
//         const width = Math.ceil(vv?.width ?? window.innerWidth)
//         const height = Math.ceil(vv?.height ?? window.innerHeight)
//         setStyle(prev => {
//           const prevWidth = typeof prev.width === 'number' ? prev.width : NaN
//           const prevHeight = typeof prev.height === 'number' ? prev.height : NaN
//           const prevTransform = typeof prev.transform === 'string' ? prev.transform : ''
//           if (prevWidth === width && prevHeight === height && prevTransform === '') return prev
//           return {
//             position: 'fixed',
//             left: 0,
//             top: 0,
//             width,
//             height
//           }
//         })
//       })
//     }

//     update()
//     window.addEventListener('resize', update, { passive: true })
//     const vv = window.visualViewport
//     vv?.addEventListener('resize', update)
//     vv?.addEventListener('scroll', update)
//     return () => {
//       cancelAnimationFrame(raf)
//       window.removeEventListener('resize', update)
//       vv?.removeEventListener('resize', update)
//       vv?.removeEventListener('scroll', update)
//     }
//   }, [enabled])

//   return enabled ? style : {}
// }

// type ActionTimerModalContentProps = {
//   screen: 'main' | 'panel' | 'prize'
//   setScreen: (next: 'main' | 'panel' | 'prize') => void
//   onRequestClose: () => void
//   onCloseAction?: () => void
//   onSubmit?: () => void
// }

// const ActionTimerMobileModalView = ({
//   screen,
//   onSubmit,
//   onClose
// }: {
//   screen: 'main' | 'panel' | 'prize'
//   onSubmit: (values: WidgetLeadFormValues) => void
//   onClose: () => void
// }) => {
//   const templateSettings = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings
//   )
//   const { customColor, colorScheme } = templateSettings || { customColor: '#F5F6F8' }
//   const bgStyle = { backgroundColor: colorScheme === 'primary' ? '#725DFF' : customColor }

//   const companyLogo = useWidgetSettingsStore(s => s?.settings?.fields?.companyLogo)
//   const { settings } = useFieldsSettings()

//   const content =
//     screen === 'prize' ? (
//       <div className="flex flex-1 items-center justify-center p-4">
//         <RewardContent companyLogo={companyLogo} onWin={settings?.messages?.onWin} />
//       </div>
//     ) : (
//       <>
//         <CountDown isMobile />
//         <div className="p-4">
//           <DynamicFieldsForm isMobile centered onSubmit={onSubmit} />
//         </div>
//       </>
//     )

//   return (
//     <div className="w-full h-full bg-[#F5F6F8] flex flex-col">
//       <div
//         style={bgStyle}
//         className="w-full flex-1 min-h-0 text-white relative overflow-hidden flex flex-col"
//       >
//         <CloseButton position="right" onClose={onClose} />
//         <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">{content}</div>
//       </div>
//     </div>
//   )
// }

// export const ActionTimerModalContent = ({
//   screen,
//   setScreen,
//   onRequestClose,
//   onSubmit
// }: ActionTimerModalContentProps) => {
//   const { run } = useWidgetActions()
//   const isMobile = useIsMobileViewport()

//   const handleSubmit = (values: WidgetLeadFormValues) => {
//     const widgetId = useWidgetSettingsStore.getState().settings?.id
//     if (widgetId) {
//       void sendPublicRequest({
//         widgetId,
//         fullName: values.name,
//         phone: values.phone,
//         email: values.email,
//         url: window.location.href,
//         referrer: document.referrer || undefined,
//         userAgent: navigator.userAgent
//       })
//     }

//     const handled = run(
//       'submit',
//       {
//         payload: { screen },
//         helpers: {
//           setScreen: (s: string) =>
//             setScreen(s === 'prize' ? 'prize' : s === 'panel' ? 'panel' : 'main')
//         }
//       },
//       undefined,
//       handlerId => actionTimerHandlers[handlerId ?? '']
//     )

//     if (!handled) setScreen('prize')
//     onSubmit?.()
//   }

//   return (
//     <div className="relative w-full h-full">
//       {isMobile ? (
//         <ActionTimerMobileModalView
//           screen={screen}
//           onSubmit={handleSubmit}
//           onClose={onRequestClose}
//         />
//       ) : (
//         <DesktopPreview
//           screen={screen}
//           onSubmit={handleSubmit}
//           hideCloseButton
//           screens={{
//             main: ActionTimerDesktopScreen,
//             prize: ActionTimerDesktopScreen,
//             panel: ActionTimerDesktopScreen
//           }}
//         />
//       )}
//     </div>
//   )
// }

// export const ActionTimerEmbedRuntime = () => {
//   const staticDefaults = useWidgetStaticDefaults()
//   const staticIcon = staticDefaults?.display?.icon
//   const defaultIcon: NonNullable<DisplaySettings['icon']> = {
//     type: staticIcon?.type ?? 'button',
//     position: staticIcon?.position ?? 'bottom-right',
//     hide: staticIcon?.hide ?? 'always',
//     image: staticIcon?.image ?? { fileName: '', url: '' },
//     button: staticIcon?.button ?? {
//       text: 'Открыть',
//       buttonColor: '#5951E5',
//       textColor: '#FFFFFF'
//     }
//   }

//   const iconConfig = useWidgetSettingsStore(
//     useShallow(s => withDefaultsPath(s.settings?.display, 'icon', defaultIcon))
//   )
//   const widgetId = useWidgetSettingsStore(s => s.settings?.id)
//   const projectId = useWidgetSettingsStore(s => s.projectId)
//   const [open, setOpen] = useState(false)
//   const [screen, setScreen] = useState<'main' | 'panel' | 'prize'>('main')
//   const isMobile = useIsMobileViewport()

//   const iconType = iconConfig.type ?? defaultIcon.type
//   const buttonConfig = iconConfig.button ??
//     defaultIcon.button ?? {
//       text: 'Открыть',
//       buttonColor: '#5951E5',
//       textColor: '#FFFFFF'
//     }
//   const buttonText = buttonConfig.text?.trim() || 'Открыть'
//   const buttonBg = buttonConfig.buttonColor || '#5951E5'
//   const buttonTextColor = buttonConfig.textColor || '#FFFFFF'
//   const imageUrl = iconConfig.image?.url

//   const postInteractivityLock = useCallback((lock: boolean) => {
//     if (typeof window === 'undefined') return
//     window.parent?.postMessage(
//       {
//         scope: 'lemnity-embed',
//         type: 'interactive-region',
//         lock,
//         ...(lock
//           ? { rect: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } }
//           : {})
//       },
//       '*'
//     )
//   }, [])

//   const anchorStyle: CSSProperties = {
//     position: 'fixed',
//     zIndex: 2147483641
//   }

//   switch (iconConfig.position) {
//     case 'bottom-left':
//       anchorStyle.bottom = '24px'
//       anchorStyle.left = '24px'
//       break
//     case 'top-right':
//       anchorStyle.top = '24px'
//       anchorStyle.right = '24px'
//       break
//     case 'bottom-right':
//     default:
//       anchorStyle.bottom = '24px'
//       anchorStyle.right = '24px'
//       break
//   }

//   const handleOpen = () => {
//     postInteractivityLock(true)
//     setOpen(true)
//     setScreen('main')
//     if (widgetId) {
//       sendEvent({
//         event_name: 'countdown.open',
//         widget_id: widgetId,
//         project_id: projectId ?? undefined
//       })
//     }
//   }

//   const resetState = useCallback(() => {
//     setOpen(false)
//     setScreen('main')
//   }, [])

//   const handleClose = useCallback(() => {
//     postInteractivityLock(false)
//     resetState()
//     if (widgetId) {
//       sendEvent({
//         event_name: 'countdown.close',
//         widget_id: widgetId,
//         project_id: projectId ?? undefined
//       })
//     }
//   }, [postInteractivityLock, projectId, resetState, widgetId])

//   useEffect(() => {
//     if (!open || !isMobile) return
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') handleClose()
//     }
//     document.addEventListener('keydown', onKeyDown)
//     return () => document.removeEventListener('keydown', onKeyDown)
//   }, [handleClose, isMobile, open])

//   useEffect(() => {
//     if (!isMobile) return
//     postInteractivityLock(open)
//   }, [isMobile, open, postInteractivityLock])

//   const Trigger =
//     iconType === 'image' && imageUrl ? (
//       <button
//         type="button"
//         onClick={handleOpen}
//         className="block rounded-full transform transition-transform duration-200 ease-out hover:scale-[1.05]"
//       >
//         <img src={imageUrl} alt={buttonText} className="h-16 w-16 block" />
//       </button>
//     ) : (
//       <button
//         type="button"
//         className="rounded-full px-5 py-3 shadow-lg transform transition duration-200 ease-out hover:scale-[1.05] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
//         style={{ backgroundColor: buttonBg, color: buttonTextColor }}
//         onClick={handleOpen}
//       >
//         {buttonText}
//       </button>
//     )

//   const overlayStyle = useVisualViewportOverlayStyle(Boolean(open && isMobile))

//   return (
//     <>
//       <div style={anchorStyle}>{Trigger}</div>
//       {isMobile ? (
//         open ? (
//           <div
//             data-lemnity-modal
//             role="dialog"
//             aria-modal="true"
//             style={{
//               ...overlayStyle,
//               WebkitOverflowScrolling: 'touch',
//               overscrollBehavior: 'contain',
//               touchAction: 'pan-y'
//             }}
//             className="fixed left-0 top-0 w-full h-full z-[2147483646] overflow-hidden bg-[#F5F6F8] flex flex-col"
//           >
//             <div className="flex-1 min-h-0">
//               <ActionTimerModalContent
//                 screen={screen}
//                 setScreen={setScreen}
//                 onRequestClose={handleClose}
//                 onSubmit={() => setScreen('prize')}
//               />
//             </div>
//           </div>
//         ) : null
//       ) : (
//         <Modal isOpen={open} onClose={handleClose} containerClassName="max-w-[928px]">
//           <ActionTimerModalContent
//             screen={screen}
//             setScreen={setScreen}
//             onRequestClose={resetState}
//             onSubmit={() => setScreen('prize')}
//           />
//         </Modal>
//       )}
//     </>
//   )
// }
