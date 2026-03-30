// import useWidgetSettingsStore, { type ButtonPosition } from '@/stores/widgetSettingsStore'
// import FabMenuWidget from './FabMenuWidget'

// export const FABMenuEmbedRuntime = () => {
//   const buttonPosition = useWidgetSettingsStore(
//     s => (s.settings?.display?.icon?.position as ButtonPosition | undefined) ?? 'bottom-right'
//   )

//   return (
//     <div
//       className={`fixed ${buttonPosition === 'bottom-right' ? 'right-6' : 'left-6'} bottom-6 pointer-events-auto`}
//     >
//       <FabMenuWidget
//         anchorBaseClassName="relative"
//         anchorOffsetClassName={{ left: 'left-0', right: 'right-0' }}
//       />
//     </div>
//   )
// }
