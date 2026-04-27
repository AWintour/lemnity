// import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
// import WheelOfFortune from './WheelOfFortune'
// import RewardContent from '../Common/RewardContent/RewardContent'
// import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
// import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import type { WidgetLeadFormValues, WidgetPreviewScreen } from '../registry'
// import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
// import type { PublicWheelSpinResponse } from '@/common/api/publicApi'

// type WheelDesktopScreenProps = {
//   screen: WidgetPreviewScreen
//   onSubmit: (values: WidgetLeadFormValues) => void
// }

// const WheelDesktopScreen = ({ screen, onSubmit }: WheelDesktopScreenProps) => {
//   const spinTrigger = usePreviewRuntimeStore(s => s.counters['wheel.spin'] ?? 0)
//   const winningSectorId = usePreviewRuntimeStore(
//     s => (s.values['wheel.winningSectorId'] as string | null | undefined) ?? undefined
//   )
//   const spinStatus = usePreviewRuntimeStore(
//     s => s.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
//   )
//   const wheelResult = usePreviewRuntimeStore(
//     s => s.values['wheel.result'] as PublicWheelSpinResponse | undefined
//   )
//   const staticDefaults = useWidgetStaticDefaults()
//   const companyLogo = useWidgetSettingsStore(s => s?.settings?.fields?.companyLogo)
//   const templateDefaults = staticDefaults?.fields.template.templateSettings
//   const templateSettings = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings
//   )
//   const contentPosition = templateSettings?.contentPosition ?? templateDefaults?.contentPosition

//   const { settings } = useWheelOfFortuneSettings()
//   const { settings: fieldsSettings } = useFieldsSettings()
//   if (!settings) return null

//   const sectors = settings.sectors
//   const pointerPositionDeg = 135

//   const renderForm = screen === 'main' || screen === 'panel'
//   const handleAction = (values: WidgetLeadFormValues) => onSubmit(values)
//   const submitDisabled = spinStatus === 'spinning' || spinStatus === 'locked'
//   const isEditPage =
//     typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '').endsWith('/edit')
//   const discountTrimmed = wheelResult?.sector?.text?.trim()
//   const promoTrimmed = wheelResult?.sector?.promo?.trim()
//   const content = renderForm ? (
//     <DynamicFieldsForm onSubmit={handleAction} submitDisabled={submitDisabled} />
//   ) : (
//     <RewardContent
//       companyLogo={companyLogo}
//       discountText={isEditPage ? discountTrimmed || 'Скидка 10%' : discountTrimmed}
//       promo={isEditPage ? promoTrimmed || 'PROMO-10' : promoTrimmed}
//       onWin={fieldsSettings.messages?.onWin}
//     />
//   )

//   const renderWheel = (side: 'left' | 'right') => {
//     const className =
//       screen === 'panel'
//         ? `scale-200 ${side === 'left' ? 'translate-x-30' : '-translate-x-30'}`
//         : side === 'left'
//           ? 'pr-5'
//           : 'pl-5'

//     return (
//       <WheelOfFortune
//         className={className}
//         pointerPositionDeg={pointerPositionDeg}
//         winningSectorId={winningSectorId}
//         sectorsRandomize={sectors.randomize}
//         sectors={sectors.items}
//         spinTrigger={spinTrigger}
//         borderColor={settings?.borderColor}
//         borderThickness={settings?.borderThickness}
//       />
//     )
//   }

//   const showWheel = screen !== 'prize'

//   return (
//     <div
//       className={`grid grid-cols-${screen !== 'prize' ? '2' : '1'} p-4 items-center justify-center w-full h-full ${screen === 'panel' ? 'py-10' : ''}`}
//     >
//       {contentPosition === 'left' ? (
//         <>
//           {content}
//           {showWheel ? renderWheel('left') : null}
//         </>
//       ) : (
//         <>
//           {showWheel ? renderWheel('right') : null}
//           {content}
//         </>
//       )}
//     </div>
//   )
// }

// export default WheelDesktopScreen
