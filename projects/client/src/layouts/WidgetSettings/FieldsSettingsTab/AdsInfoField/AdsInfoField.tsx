// import useWidgetSettingsStore, {
//   useWidgetStaticDefaults,
// } from '@/stores/widgetSettingsStore'
// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
// import { withDefaultsPath } from '@/stores/widgetSettings/utils'

// import AgreementAndPolicy from '@/components/AgreementAndPolicy'

// const AdsInfoField = () => {
//   const staticDefaults = useWidgetStaticDefaults()

//   const adsInfo = useWidgetSettingsStore(s =>
//     withDefaultsPath(
//       s.settings?.fields,
//       'adsInfo',
//       // let's shoot in the foot and assume that staticDefaults is always
//       // defined, because why the hell not, ALBERT
//       // TO FIX THIS PROPERLY WE NEED TO REWORK THE WHOLE SETTINGS STRUCTURE
//       staticDefaults!.fields.adsInfo
//     )
//   )
//   const { enabled, text, policyUrl, color } = adsInfo
//   const { setAdsInfo } = useFieldsSettings()

//   const handleToggle = (nextEnabled: boolean) => setAdsInfo(
//     nextEnabled,
//     text ?? '',
//     policyUrl ?? '',
//     color ?? '#000000'
//   )

//   const handleColorChange = (color: string) => setAdsInfo(
//     enabled,
//     text ?? '',
//     policyUrl ?? '',
//     color
//   )

//   const handlePolicyUrlChange = (url: string) => setAdsInfo(
//     enabled,
//     text ?? '',
//     url,
//     color ?? '#000000'
//   )

//   return (
//     <AgreementAndPolicy
//       variant="advertisement"
//       errorPath="fields.adsInfo"
//       agreement={adsInfo}
//       onToggle={handleToggle}
//       onFontColorChange={handleColorChange}
//       onPolicyUrlChange={handlePolicyUrlChange}
//     />
//   )
// }

// export default AdsInfoField
