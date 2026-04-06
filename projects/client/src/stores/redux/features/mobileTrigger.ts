import type { PayloadAction } from '@reduxjs/toolkit'
import type { MobileTrigger } from '@lemnity/widget-config/widgets/announcement'

export interface IMobileEnabled {
  mobileSettings: { mobileEnabled: boolean }
}

export const mobileEnabledReducer =
  <TState extends IMobileEnabled>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['mobileEnabled']>
  ) => {
    state.mobileSettings.mobileEnabled = action.payload
  }

export const selectMobileEnabled =
  <TState extends IMobileEnabled>(state: TState) =>
    state.mobileSettings.mobileEnabled


export interface IMobileTriggerType {
  mobileSettings: { triggerType: MobileTrigger }
}

export const mobileTriggerTypeReducer =
  <TState extends IMobileTriggerType>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerType']>
  ) => {
    state.mobileSettings.triggerType = action.payload
  }

export const selectMobileTriggerType =
  <TState extends IMobileTriggerType>(state: TState) =>
    state.mobileSettings.triggerType


export interface IMobileTriggerText {
  mobileSettings: { triggerText: string }
}

export const mobileTriggerTextReducer =
  <TState extends IMobileTriggerText>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerText']>
  ) => {
    state.mobileSettings.triggerText = action.payload
  }

export const selectMobileTriggerText =
  <TState extends IMobileTriggerText>(state: TState) =>
    state.mobileSettings.triggerText


export interface IMobileTriggerBackgroundColor {
  mobileSettings: { triggerBackgroundColor: string }
}

export const mobileTriggerBackgroundColorReducer =
  <TState extends IMobileTriggerBackgroundColor>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerBackgroundColor']>
  ) => {
    state.mobileSettings.triggerBackgroundColor = action.payload
  }

export const selectMobileTriggerBackgroundColor =
  <TState extends IMobileTriggerBackgroundColor>(state: TState) =>
    state.mobileSettings.triggerBackgroundColor


export interface IMobileTriggerFontColor {
  mobileSettings: { triggerFontColor: string }
}

export const mobileTriggerFontColorReducer =
  <TState extends IMobileTriggerFontColor>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerFontColor']>
  ) => {
    state.mobileSettings.triggerFontColor = action.payload
  }

export const selectMobileTriggerFontColor =
  <TState extends IMobileTriggerFontColor>(state: TState) =>
    state.mobileSettings.triggerFontColor


export interface IMobileImageUrl {
  mobileSettings: { imageUrl?: string }
}

export const mobileImageUrlReducer =
  <TState extends IMobileImageUrl>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['imageUrl']>
  ) => {
    state.mobileSettings.imageUrl = action.payload
  }

export const selectMobileImageUrl =
  <TState extends IMobileImageUrl>(state: TState) =>
    state.mobileSettings.imageUrl


export const mobileSettingsReducers = {
  mobileEnabledChanged:
    mobileEnabledReducer,
  mobileTriggerTypeChanged:
    mobileTriggerTypeReducer,
  mobileTriggerTextChanged:
    mobileTriggerTextReducer,
  mobileTriggerBackgroundColorChanged:
    mobileTriggerBackgroundColorReducer,
  mobileTriggerFontColorChanged:
    mobileTriggerFontColorReducer,
  mobileImageUrlChanged:
    mobileImageUrlReducer,
}

export const mobileSettingsSelectors = {
  selectMobileEnabled,
  selectMobileTriggerType,
  selectMobileTriggerText,
  selectMobileTriggerBackgroundColor,
  selectMobileTriggerFontColor,
  selectMobileImageUrl,
}
