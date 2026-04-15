import type { PayloadAction } from '@reduxjs/toolkit'

export interface IAdsInfoEnabled {
  adsInfo: { enabled: boolean }
}

export const adsInfoEnabledReducer =
  <TState extends IAdsInfoEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['adsInfo']['enabled']>
  ) => {
    state.adsInfo.enabled = action.payload
  }

export const selectAdsInfoEnabled =
  <TState extends IAdsInfoEnabled>(state: TState) =>
    state.adsInfo.enabled


export interface IAdsInfoPolicyUrl {
  adsInfo: { policyUrl: string }
}

export const adsInfoPolicyUrlReducer =
  <TState extends IAdsInfoPolicyUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['adsInfo']['policyUrl']>
  ) => {
    state.adsInfo.policyUrl = action.payload
  }

export const selectAdsInfoPolicyUrl =
  <TState extends IAdsInfoPolicyUrl>(state: TState) =>
    state.adsInfo.policyUrl


export interface IAdsInfoColor {
  adsInfo: { color: string }
}

export const adsInfoColorReducer =
  <TState extends IAdsInfoColor>(
    state:
      TState,
    action:
      PayloadAction<TState['adsInfo']['color']>
  ) => {
    state.adsInfo.color = action.payload
  }

export const selectAdsInfoColor =
  <TState extends IAdsInfoColor>(state: TState) =>
    state.adsInfo.color


export const adsInfoReducers = {
  adsInfoEnabledChanged:
    adsInfoEnabledReducer,
  adsInfoPolicyUrlChanged:
    adsInfoPolicyUrlReducer,
  adsInfoColorChanged:
    adsInfoColorReducer,
}

export const adsInfoSelectors = {
  selectAdsInfoEnabled,
  selectAdsInfoPolicyUrl,
  selectAdsInfoColor,
}
