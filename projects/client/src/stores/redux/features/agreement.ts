import type { PayloadAction } from '@reduxjs/toolkit'

export interface IAgreementEnabled {
  agreement: { enabled: boolean }
}

export const agreementEnabledReducer =
  <TState extends IAgreementEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['agreement']['enabled']>
  ) => {
    state.agreement.enabled = action.payload
  }

export const selectAgreementEnabled =
  <TState extends IAgreementEnabled>(state: TState) =>
    state.agreement.enabled


export interface IAgreementPolicyUrl {
  agreement: { policyUrl: string }
}

export const agreementPolicyUrlReducer =
  <TState extends IAgreementPolicyUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['agreement']['policyUrl']>
  ) => {
    state.agreement.policyUrl = action.payload
  }

export const selectAgreementPolicyUrl =
  <TState extends IAgreementPolicyUrl>(state: TState) =>
    state.agreement.policyUrl


export interface IAgreementUrl {
  agreement: { agreementUrl: string }
}

export const agreementUrlReducer =
  <TState extends IAgreementUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['agreement']['agreementUrl']>
  ) => {
    state.agreement.agreementUrl = action.payload
  }

export const selectAgreementUrl =
  <TState extends IAgreementUrl>(state: TState) =>
    state.agreement.agreementUrl


export interface IAgreementColor {
  agreement: { color: string }
}

export const agreementColorReducer =
  <TState extends IAgreementColor>(
    state:
      TState,
    action:
      PayloadAction<TState['agreement']['color']>
  ) => {
    state.agreement.color = action.payload
  }

export const selectAgreementColor =
  <TState extends IAgreementColor>(state: TState) =>
    state.agreement.color


export interface IAgreement {
  agreement: {
    enabled: boolean
    policyUrl: string
    agreementUrl: string
    color: string
  }
}

export const selectAgreement =
  <TState extends IAgreement>(state: TState) =>
    state.agreement


export const agreementReducers = {
  agreementEnabledChanged:
    agreementEnabledReducer,
  agreementPolicyUrlChanged:
    agreementPolicyUrlReducer,
  agreementUrlChanged:
    agreementUrlReducer,
  agreementColorChanged:
    agreementColorReducer,
}

export const agreementSelectors = {
  selectAgreementEnabled,
  selectAgreementPolicyUrl,
  selectAgreementUrl,
  selectAgreementColor,
  selectAgreement,
}
