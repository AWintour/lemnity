// import { useShallow } from 'zustand/react/shallow'

// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

// import TextSettings from '@/components/TextSettings'
// import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
// import ContactAcquisitionSettings from './ContactAcquisitionSettings'
// import AgreementAndPolicy from '@/components/AgreementAndPolicy'

// import type {
//   EventTimertWidgetType,
// } from '@lemnity/widget-config/widgets/event-timer'

// type FormSettingsProps = {
//   defaults: EventTimertWidgetType
// }

// const FormSettings = (props: FormSettingsProps) => {
//   const {
//     title,
//     titleFontColor,
//     description,
//     descriptionFontColor,

//     contactAcquisitionEnabled,
//     nameFieldEnabled,
//     nameFieldRequired,
//     emailFieldEnabled,
//     emailFieldRequired,
//     phoneFieldEnabled,
//     phoneFieldRequired,

//     agreement,
//     adsInfo,
//   } = useWidgetSettingsStore(
//     useShallow(s => {
//       // a crutch because the store just works this way apparently
//       const settings =
//         (s.settings?.widget as EventTimertWidgetType)
//         .formSettings
//       const defaults = props.defaults.formSettings

//       return {
//         title: settings?.title
//           ?? defaults.title,
//         titleFontColor: settings?.titleFontColor
//           ?? defaults.titleFontColor,
//         description: settings?.description
//           ?? defaults.description,
//         descriptionFontColor: settings?.descriptionFontColor
//           ?? defaults.descriptionFontColor,

//         contactAcquisitionEnabled: settings?.contactAcquisitionEnabled
//           ?? defaults.contactAcquisitionEnabled,
//         nameFieldEnabled: settings?.nameFieldEnabled
//           ?? defaults.nameFieldEnabled,
//         nameFieldRequired: settings?.nameFieldRequired
//           ?? defaults.nameFieldRequired,
//         emailFieldEnabled: settings?.emailFieldEnabled
//           ?? defaults.emailFieldEnabled,
//         emailFieldRequired: settings?.emailFieldRequired
//           ?? defaults.emailFieldRequired,
//         phoneFieldEnabled: settings?.phoneFieldEnabled
//           ?? defaults.phoneFieldEnabled,
//         phoneFieldRequired: settings?.phoneFieldRequired
//           ?? defaults.phoneFieldRequired,

//         agreement: settings?.agreement
//           ?? defaults.agreement,
//         adsInfo: settings?.adsInfo
//           ?? defaults.adsInfo,
//       }
//     })
//   )

//   // mmm, yes, boilerplate
//   const setFormScreenTitle = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenTitle
//   )
//   const setFormScreenTitleFontWeight = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenTitleFontWeight
//   )
//   const setFormScreenTitleFontColor = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenTitleFontColor
//   )
//   const setFormScreenDescription = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenDescription
//   )
//   const setFormScreenDescriptionFontWeight = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenDescriptionFontWeight
//   )
//   const setFormScreenDescriptionFontColor = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenDescriptionFontColor
//   )

//   const setFormScreenContactAcquisitionEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenContactAcquisitionEnabled
//   )
//   const setFormScreenNameFieldEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenNameFieldEnabled
//   )
//   const setFormScreenNameFieldRequired = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenNameFieldRequired
//   )
//   const setFormScreenEmailFieldEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenEmailFieldEnabled
//   )
//   const setFormScreenEmailFieldRequired = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenEmailFieldRequired
//   )
//   const setFormScreenPhoneFieldEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenPhoneFieldEnabled
//   )
//   const setFormScreenPhoneFieldRequired = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenPhoneFieldRequired
//   )

//   const setAgreementEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAgreementEnabled
//   )
//   const setAgreementPolicyUrl = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAgreementPolicyUrl
//   )
//   const setAgreementUrl = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAgreementUrl
//   )
//   const setAgreementColor = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAgreementColor
//   )

//   const setAdsInfoEnabled = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAdsInfoEnabled
//   )
//   const setAdsInfoPolicyUrl = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAdsInfoPolicyUrl
//   )
//   const setAdsInfoColor = useWidgetSettingsStore(
//     s => s.setEventTimerFormScreenAdsInfoColor
//   )

//   return (
//     <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
//       <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
//         Форма данных
//       </h1>

//       <BorderedContainer>
//         <div className='w-full flex flex-col'>
//           <TextSettings
//             title='Заголовок'
//             text={title}
//             onTextChange={setFormScreenTitle}
//             onFontWeightChange={setFormScreenTitleFontWeight}
//             textColor={titleFontColor}
//             onColorChange={setFormScreenTitleFontColor}
//             placeholder='Укажите заголовок'
//           />
//         </div>
//       </BorderedContainer>

//       <BorderedContainer>
//         <div className='w-full flex flex-col'>
//           <TextSettings
//             title='Описание'
//             text={description}
//             onTextChange={setFormScreenDescription}
//             onFontWeightChange={setFormScreenDescriptionFontWeight}
//             textColor={descriptionFontColor}
//             onColorChange={setFormScreenDescriptionFontColor}
//             placeholder={
//               'Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
//             }
//           />
//         </div>
//       </BorderedContainer>

//       <ContactAcquisitionSettings
//         contactAcquisitionEnabled={!!contactAcquisitionEnabled}
//         onContactAcquisitionToggle={setFormScreenContactAcquisitionEnabled}
//         nameFieldEnabled={nameFieldEnabled}
//         onNameFieldEnabledChange={setFormScreenNameFieldEnabled}
//         nameFieldRequired={nameFieldRequired}
//         onNameFieldRequiredChange={setFormScreenNameFieldRequired}
//         phoneFieldEnabled={phoneFieldEnabled}
//         onPhoneFieldEnabledChange={setFormScreenPhoneFieldEnabled}
//         phoneFieldRequired={phoneFieldRequired}
//         onPhoneFieldRequiredChange={setFormScreenPhoneFieldRequired}
//         emailFieldEnabled={emailFieldEnabled}
//         onEmailFieldEnabledChange={setFormScreenEmailFieldEnabled}
//         emailFieldRequired={emailFieldRequired}
//         onEmailFieldRequiredChange={setFormScreenEmailFieldRequired}
//       />
      
//       <AgreementAndPolicy
//         variant='agreement'
//         errorPath=''
//         agreement={agreement}
//         onToggle={setAgreementEnabled}
//         onFontColorChange={setAgreementColor}
//         onAgreementUrlChange={setAgreementUrl}
//         onPolicyUrlChange={setAgreementPolicyUrl}
//       />
      
//       <AgreementAndPolicy
//         variant='advertisement'
//         errorPath=''
//         agreement={adsInfo}
//         onToggle={setAdsInfoEnabled}
//         onFontColorChange={setAdsInfoColor}
//         onPolicyUrlChange={setAdsInfoPolicyUrl}
//       />
//     </div>
//   )
// }

// export default FormSettings
