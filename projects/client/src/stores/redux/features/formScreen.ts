import type { PayloadAction } from '@reduxjs/toolkit'
import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

export interface IFormScreenTitle {
  formSettings: { title: string }
}

export const formScreenTitleReducer =
  <TState extends IFormScreenTitle>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['title']>
  ) => {
    state.formSettings.title = action.payload
  }

export const selectFormTitle =
  <TState extends IFormScreenTitle>(state: TState) =>
    state.formSettings.title


export interface IFormScreenTitleFontWeight {
  formSettings: { titleFontWeight: FontWeight }
}

export const formScreenTitleFontWeightReducer =
  <TState extends IFormScreenTitleFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['titleFontWeight']>
  ) => {
    state.formSettings.titleFontWeight = action.payload
  }

export const selectFormTitleFontWeight =
  <TState extends IFormScreenTitleFontWeight>(state: TState) =>
    state.formSettings.titleFontWeight


export interface IFormScreenTitleFontColor {
  formSettings: { titleFontColor: string }
}

export const formScreenTitleFontColorReducer =
  <TState extends IFormScreenTitleFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['titleFontColor']>
  ) => {
    state.formSettings.titleFontColor = action.payload
  }

export const selectFormTitleFontColor =
  <TState extends IFormScreenTitleFontColor>(state: TState) =>
    state.formSettings.titleFontColor


export interface IFormScreenDescription {
  formSettings: { description: string }
}

export const formScreenDescriptionReducer =
  <TState extends IFormScreenDescription>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['description']>
  ) => {
    state.formSettings.description = action.payload
  }

export const selectFormDescription =
  <TState extends IFormScreenDescription>(state: TState) =>
    state.formSettings.description


export interface IFormScreenDescriptionFontWeight {
  formSettings: { descriptionFontWeight: FontWeight }
}

export const formScreenDescriptionFontWeightReducer =
  <TState extends IFormScreenDescriptionFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['descriptionFontWeight']>
  ) => {
    state.formSettings.descriptionFontWeight = action.payload
  }

export const selectFormDescriptionFontWeight =
  <TState extends IFormScreenDescriptionFontWeight>(state: TState) =>
    state.formSettings.descriptionFontWeight


export interface IFormScreenDescriptionFontColor {
  formSettings: { descriptionFontColor: string }
}

export const formScreenDescriptionFontColorReducer =
  <TState extends IFormScreenDescriptionFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['descriptionFontColor']>
  ) => {
    state.formSettings.descriptionFontColor = action.payload
  }

export const selectFormDescriptionFontColor =
  <TState extends IFormScreenDescriptionFontColor>(state: TState) =>
    state.formSettings.descriptionFontColor


export interface IFormScreenContactAcquisitionEnabled {
  formSettings: { contactAcquisitionEnabled: boolean }
}

export const formScreenContactAcquisitionEnabledReducer =
  <TState extends IFormScreenContactAcquisitionEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['contactAcquisitionEnabled']>
  ) => {
    state.formSettings.contactAcquisitionEnabled = action.payload
  }

export const selectFormContactAcquisitionEnabled =
  <TState extends IFormScreenContactAcquisitionEnabled>(state: TState) =>
    state.formSettings.contactAcquisitionEnabled


export interface IFormScreenNameFieldEnabled {
  formSettings: { nameFieldEnabled: boolean }
}

export const formScreenNameFieldEnabledReducer =
  <TState extends IFormScreenNameFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['nameFieldEnabled']>
  ) => {
    state.formSettings.nameFieldEnabled = action.payload
  }

export const selectFormNameFieldEnabled =
  <TState extends IFormScreenNameFieldEnabled>(state: TState) =>
    state.formSettings.nameFieldEnabled


export interface IFormScreenNameFieldRequired {
  formSettings: { nameFieldRequired: boolean }
}

export const formScreenNameFieldRequiredReducer =
  <TState extends IFormScreenNameFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['nameFieldRequired']>
  ) => {
    state.formSettings.nameFieldRequired = action.payload
  }

export const selectFormNameFieldRequired =
  <TState extends IFormScreenNameFieldRequired>(state: TState) =>
    state.formSettings.nameFieldRequired


export interface IFormScreenEmailFieldEnabled {
  formSettings: { emailFieldEnabled: boolean }
}

export const formScreenEmailFieldEnabledReducer =
  <TState extends IFormScreenEmailFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['emailFieldEnabled']>
  ) => {
    state.formSettings.emailFieldEnabled = action.payload
  }

export const selectFormEmailFieldEnabled =
  <TState extends IFormScreenEmailFieldEnabled>(state: TState) =>
    state.formSettings.emailFieldEnabled


export interface IFormScreenEmailFieldRequired {
  formSettings: { emailFieldRequired: boolean }
}

export const formScreenEmailFieldRequireddReducer =
  <TState extends IFormScreenEmailFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['emailFieldRequired']>
  ) => {
    state.formSettings.emailFieldRequired = action.payload
  }

export const selectFormEmailFieldRequired =
  <TState extends IFormScreenEmailFieldRequired>(state: TState) =>
    state.formSettings.emailFieldRequired


export interface IFormScreenPhoneFieldEnabled {
  formSettings: { phoneFieldEnabled: boolean }
}

export const formScreenPhoneFieldEnableddReducer =
  <TState extends IFormScreenPhoneFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['phoneFieldEnabled']>
  ) => {
    state.formSettings.phoneFieldEnabled = action.payload
  }

export const selectFormPhoneFieldEnabled =
  <TState extends IFormScreenPhoneFieldEnabled>(state: TState) =>
    state.formSettings.phoneFieldEnabled


export interface IFormScreenPhoneFieldRequired {
  formSettings: { phoneFieldRequired: boolean }
}

export const formScreenPhoneFieldRequireddReducer =
  <TState extends IFormScreenPhoneFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['phoneFieldRequired']>
  ) => {
    state.formSettings.phoneFieldRequired = action.payload
  }

export const selectFormPhoneFieldRequired =
  <TState extends IFormScreenPhoneFieldRequired>(state: TState) =>
    state.formSettings.phoneFieldRequired


export interface IFormScreenAgreementEnabled {
  formSettings: { agreement: { enabled: boolean } }
}

export const formScreenAgreementEnabledReducer =
  <TState extends IFormScreenAgreementEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['agreement']['enabled']>
  ) => {
    state.formSettings.agreement.enabled = action.payload
  }

export const selectFormAgreementEnabled =
  <TState extends IFormScreenAgreementEnabled>(state: TState) =>
    state.formSettings.agreement.enabled


export interface IFormScreenAgreementPolicyUrl {
  formSettings: { agreement: { policyUrl: string } }
}

export const formScreenAgreementPolicyUrlReducer =
  <TState extends IFormScreenAgreementPolicyUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['agreement']['policyUrl']>
  ) => {
    state.formSettings.agreement.policyUrl = action.payload
  }

export const selectFormAgreementPolicyUrl =
  <TState extends IFormScreenAgreementPolicyUrl>(state: TState) =>
    state.formSettings.agreement.policyUrl


export interface IFormScreenAgreementUrl {
  formSettings: { agreement: { agreementUrl: string } }
}

export const formScreenAgreementUrlReducer =
  <TState extends IFormScreenAgreementUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['agreement']['agreementUrl']>
  ) => {
    state.formSettings.agreement.agreementUrl = action.payload
  }

export const selectFormAgreementUrl =
  <TState extends IFormScreenAgreementUrl>(state: TState) =>
    state.formSettings.agreement.agreementUrl


export interface IFormScreenAgreementColor {
  formSettings: { agreement: { color: string } }
}

export const formScreenAgreementColorReducer =
  <TState extends IFormScreenAgreementColor>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['agreement']['color']>
  ) => {
    state.formSettings.agreement.color = action.payload
  }

export const selectFormAgreementColor =
  <TState extends IFormScreenAgreementColor>(state: TState) =>
    state.formSettings.agreement.color


export interface IFormScreenAgreement {
  formSettings: {
    agreement: {
      enabled: boolean
      policyUrl: string
      agreementUrl: string
      color: string
    }
  }
}

export const selectFormAgreement =
  <TState extends IFormScreenAgreement>(state: TState) =>
    state.formSettings.agreement


export interface IFormScreenAdsInfoEnabled {
  formSettings: { adsInfo: { enabled: boolean } }
}

export const formScreenAdsInfoEnabledReducer =
  <TState extends IFormScreenAdsInfoEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['adsInfo']['enabled']>
  ) => {
    state.formSettings.adsInfo.enabled = action.payload
  }

export const selectFormAdsInfoEnabled =
  <TState extends IFormScreenAdsInfoEnabled>(state: TState) =>
    state.formSettings.adsInfo.enabled


export interface IFormScreenAdsInfoPolicyUrl {
  formSettings: { adsInfo: { policyUrl: string } }
}

export const formScreenAdsInfoPolicyUrlReducer =
  <TState extends IFormScreenAdsInfoPolicyUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['adsInfo']['policyUrl']>
  ) => {
    state.formSettings.adsInfo.policyUrl = action.payload
  }

export const selectFormAdsInfoPolicyUrl =
  <TState extends IFormScreenAdsInfoPolicyUrl>(state: TState) =>
    state.formSettings.adsInfo.policyUrl


export interface IFormScreenAdsInfoColor {
  formSettings: { adsInfo: { color: string } }
}

export const formScreenAdsInfoColorReducer =
  <TState extends IFormScreenAdsInfoColor>(
    state:
      TState,
    action:
      PayloadAction<TState['formSettings']['adsInfo']['color']>
  ) => {
    state.formSettings.adsInfo.color = action.payload
  }

export const selectFormAdsInfoColor =
  <TState extends IFormScreenAdsInfoColor>(state: TState) =>
    state.formSettings.adsInfo.color


export interface IFormScreenAdsInfo {
  formSettings: {
    adsInfo: {
      enabled: boolean
      policyUrl: string
      color: string
    }
  }
}

export const selectFormAdsInfo =
  <TState extends IFormScreenAdsInfo>(state: TState) =>
    state.formSettings.adsInfo


export const formScreenReducers = {
  formTitleChanged:
    formScreenTitleReducer,
  formTitleFontWeightChanged:
    formScreenTitleFontWeightReducer,
  formTitleFontColorChanged:
    formScreenTitleFontColorReducer,
  formDescriptionChanged:
    formScreenDescriptionReducer,
  formDescriptionFontWeightChanged:
    formScreenDescriptionFontWeightReducer,
  formDescriptionFontColorChanged:
    formScreenDescriptionFontColorReducer,
  formContactAcquisitionEnabledChanged:
    formScreenContactAcquisitionEnabledReducer,
  formNameFieldEnabledChanged:
    formScreenNameFieldEnabledReducer,
  formNameFieldRequiredChanged:
    formScreenNameFieldRequiredReducer,
  formEmailFieldEnabledChanged:
    formScreenEmailFieldEnabledReducer,
  formEmailFieldRequiredChanged:
    formScreenEmailFieldRequireddReducer,
  formPhoneFieldEnabledChanged:
    formScreenPhoneFieldEnableddReducer,
  formPhoneFieldRequiredChanged:
    formScreenPhoneFieldRequireddReducer,
  formAgreementEnabledChanged:
    formScreenAgreementEnabledReducer,
  formAgreementPolicyURLChanged:
    formScreenAgreementPolicyUrlReducer,
  formAgreementURLChanged:
    formScreenAgreementUrlReducer,
  formAgreementColorChanged:
    formScreenAgreementColorReducer,
  formAdsInfoEnabledChanged:
    formScreenAdsInfoEnabledReducer,
  formAdsInfoPolicyURLChanged:
    formScreenAdsInfoPolicyUrlReducer,
  formAdsInfoColorChanged:
    formScreenAdsInfoColorReducer,
}

export const formScreenSelectors = {
  selectFormTitle,
  selectFormTitleFontWeight,
  selectFormTitleFontColor,
  selectFormDescription,
  selectFormDescriptionFontWeight,
  selectFormDescriptionFontColor,
  selectFormContactAcquisitionEnabled,
  selectFormNameFieldEnabled,
  selectFormNameFieldRequired,
  selectFormEmailFieldEnabled,
  selectFormEmailFieldRequired,
  selectFormPhoneFieldEnabled,
  selectFormPhoneFieldRequired,
  selectFormAgreementEnabled,
  selectFormAgreementPolicyUrl,
  selectFormAgreement,
  selectFormAdsInfo,
}
