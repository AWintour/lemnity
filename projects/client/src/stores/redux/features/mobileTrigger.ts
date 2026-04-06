import type { PayloadAction } from '@reduxjs/toolkit'
import type { MobileTrigger } from '@lemnity/widget-config/widgets/announcement'

export interface MobileEnabled {
  mobileSettings: { mobileEnabled: boolean }
}

export const mobileEnabledReducer =
  <TState extends MobileEnabled>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['mobileEnabled']>
  ) => {
    state.mobileSettings.mobileEnabled = action.payload
  }

export const selectMobileEnabled =
  <TState extends MobileEnabled>(state: TState) =>
    state.mobileSettings.mobileEnabled


export interface MobileTriggerType {
  mobileSettings: { triggerType: MobileTrigger }
}

export const mobileTriggerTypeReducer =
  <TState extends MobileTriggerType>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerType']>
  ) => {
    state.mobileSettings.triggerType = action.payload
  }

export const selectMobileTriggerType =
  <TState extends MobileTriggerType>(state: TState) =>
    state.mobileSettings.triggerType


export interface MobileTriggerText {
  mobileSettings: { triggerText: string }
}

export const mobileTriggerTextReducer =
  <TState extends MobileTriggerText>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerText']>
  ) => {
    state.mobileSettings.triggerText = action.payload
  }

export const selectMobileTriggerText =
  <TState extends MobileTriggerText>(state: TState) =>
    state.mobileSettings.triggerText


export interface MobileTriggerBackgroundColor {
  mobileSettings: { triggerBackgroundColor: string }
}

export const mobileTriggerBackgroundColorReducer =
  <TState extends MobileTriggerBackgroundColor>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerBackgroundColor']>
  ) => {
    state.mobileSettings.triggerBackgroundColor = action.payload
  }

export const selectMobileTriggerBackgroundColor =
  <TState extends MobileTriggerBackgroundColor>(state: TState) =>
    state.mobileSettings.triggerBackgroundColor


export interface MobileTriggerFontColor {
  mobileSettings: { triggerFontColor: string }
}

export const mobileTriggerFontColorReducer =
  <TState extends MobileTriggerFontColor>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerFontColor']>
  ) => {
    state.mobileSettings.triggerFontColor = action.payload
  }

export const selectMobileTriggerFontColor =
  <TState extends MobileTriggerFontColor>(state: TState) =>
    state.mobileSettings.triggerFontColor


export interface MobileImageUrl {
  mobileSettings: { imageUrl?: string }
}

export const mobileImageUrlReducer =
  <TState extends MobileImageUrl>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['imageUrl']>
  ) => {
    state.mobileSettings.imageUrl = action.payload
  }

export const selectMobileImageUrl =
  <TState extends MobileImageUrl>(state: TState) =>
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
