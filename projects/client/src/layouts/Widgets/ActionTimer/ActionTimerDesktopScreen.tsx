// import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
// import CountDown from './CountDown'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
// import type { DesktopScreenProps } from '../registry'
// import Badge from './Badge'
// import RewardContent from '../Common/RewardContent/RewardContent'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import { useActionTimerSettings } from './hooks'
// import type { WidgetLeadFormValues } from '@/layouts/Widgets/registry'

// const ActionTimerDesktopScreen = ({ screen, onSubmit }: DesktopScreenProps) => {
//   const companyLogo = useWidgetSettingsStore(s => s?.settings?.fields?.companyLogo)
//   const imageMode = useWidgetSettingsStore(
//     s => s?.settings?.fields?.template?.templateSettings?.imageMode
//   )
//   const { settings } = useFieldsSettings()
//   const contentPosition =
//     useWidgetSettingsStore(s => s.settings?.fields?.template?.templateSettings?.contentPosition) ??
//     'left'
//   const { settings: actionTimerSettings } = useActionTimerSettings()

//   const backgroundImage =
//     imageMode == 'background'
//       ? {
//           backgroundImage: `url(${actionTimerSettings?.countdown.imageUrl})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center'
//         }
//       : {}

//   const layoutClasses = `grid grid-cols-2 items-stretch w-full ${contentPosition === 'left' ? 'pl-6' : 'pr-6'}`
//   const isPrize = screen === 'prize'

//   const onDynamicFieldsFormSubmit = (values: WidgetLeadFormValues) => {
//     if (!settings.link) {
//       onSubmit(values)
//     }

//     if (settings.link && settings.link.length > 0) {
//       const tab = window.open(settings.link, '_blank')

//       if (!tab) {
//         return
//       }

//       tab.focus()
//     }
//   }

//   const form = (
//     <div className="flex flex-col items-center h-full">
//       <div className="flex flex-col items-center justify-between my-auto">
//         <Badge className="mx-auto mb-3" />
//         <DynamicFieldsForm onSubmit={onDynamicFieldsFormSubmit} noPadding centered />
//       </div>
//     </div>
//   )
//   const rewardContent = (
//     <RewardContent companyLogo={companyLogo} onWin={settings?.messages?.onWin} />
//   )

//   const content = imageMode == 'background' ? null : <CountDown />
//   if (screen === 'panel') {
//     return (
//       <div className="grid grid-cols-1 gap-4 w-full h-full p-5">
//         {contentPosition === 'left' && content}
//         <div className="bg-white p-5 shadow-sm">
//           <DynamicFieldsForm onSubmit={onDynamicFieldsFormSubmit} centered />
//         </div>
//         {contentPosition !== 'left' && content}
//       </div>
//     )
//   }

//   if (isPrize) {
//     return <div className="flex w-full h-full items-center justify-center p-6">{rewardContent}</div>
//   }

//   return (
//     <div className={`${layoutClasses} min-h-[500px] h-full`} style={backgroundImage}>
//       {contentPosition === 'left' ? (
//         <>
//           <div className="h-full py-6">{content}</div>
//           <div className="p-6">{form}</div>
//         </>
//       ) : (
//         <>
//           <div className="p-6">{form}</div>
//           <div className="h-full py-6">{content}</div>
//         </>
//       )}
//     </div>
//   )
// }

// export default ActionTimerDesktopScreen
