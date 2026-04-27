// import useWidgetSettingsStore, {
//   useWidgetStaticDefaults,
// } from '@/stores/widgetSettingsStore'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'

// import AgreementAndPolicy from '@/components/AgreementAndPolicy'

// const AgreementPoliciesField = () => {
//   const staticDefaults = useWidgetStaticDefaults()

//   const agreement = useWidgetSettingsStore(s =>
//     withDefaultsPath(
//       s.settings?.fields,
//       'agreement',
//       staticDefaults!.fields.agreement
//     )
//   )
//   const { enabled, text, policyUrl, agreementUrl, color } = agreement
//   const { setAgreement } = useFieldsSettings()

//   const handleToggle = (nextEnabled: boolean) => setAgreement(
//     nextEnabled,
//     text ?? '',
//     policyUrl ?? '',
//     agreementUrl ?? '',
//     color ?? '#000000'
//   )

//   const handleColorChange = (newColor: string) => setAgreement(
//     enabled,
//     text ?? '',
//     policyUrl ?? '',
//     agreementUrl ?? '',
//     newColor
//   )

//   const handleAgreementUrlhange = (url: string) => setAgreement(
//     enabled,
//     text ?? '',
//     policyUrl ?? '',
//     url,
//     color ?? '#000000'
//   )

//   const handlePolicyUrlChange = (url: string) => setAgreement(
//     enabled,
//     text ?? '',
//     url,
//     agreementUrl ?? '',
//     color ?? '#000000'
//   )

//   return (
//     <AgreementAndPolicy
//       variant="agreement"
//       errorPath="fields.agreement"
//       agreement={agreement}
//       onToggle={handleToggle}
//       onFontColorChange={handleColorChange}
//       onAgreementUrlChange={handleAgreementUrlhange}
//       onPolicyUrlChange={handlePolicyUrlChange}
//     />
//   )
// }

// export default AgreementPoliciesField
