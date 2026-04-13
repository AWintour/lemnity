import type { Icon } from '@lemnity/widget-config/widgets/base'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface ITriggerText {
  triggerText: string
}

export const triggerTextReducer =
  <TState extends ITriggerText>(
    state: TState,
    action: PayloadAction<TState['triggerText']>
  ) => {
    state.triggerText = action.payload
  }

export const selectTriggerText =
  <TState extends ITriggerText>(state: TState) =>
    state.triggerText


export interface ITriggerBackgroundColor {
  triggerBackgroundColor: string
}

export const triggerBackgroundColorReducer =
  <TState extends ITriggerBackgroundColor>(
    state: TState,
    action: PayloadAction<TState['triggerBackgroundColor']>
  ) => {
    state.triggerBackgroundColor = action.payload
  }

export const selectTriggerBackgroundColor =
  <TState extends ITriggerBackgroundColor>(state: TState) =>
    state.triggerBackgroundColor


export interface ITriggerFontColor {
  triggerFontColor: string
}

export const triggerFontColorReducer =
  <TState extends ITriggerFontColor>(
    state: TState,
    action: PayloadAction<TState['triggerFontColor']>
  ) => {
    state.triggerFontColor = action.payload
  }

export const selectTriggerFontColor =
  <TState extends ITriggerFontColor>(state: TState) =>
    state.triggerFontColor


// becasuse i was an idiot and named a field triggerTextColor instead of
// triggerFontColor in FABMenu long ago and now i have to keep this reducer
// and selector for backward compatibility
export interface ITriggerTextColor {
  triggerTextColor: string
}

export const triggerTextColorReducer =
  <TState extends ITriggerTextColor>(
    state: TState,
    action: PayloadAction<TState['triggerTextColor']>
  ) => {
    state.triggerTextColor = action.payload
  }

export const selectTriggerTextColor =
  <TState extends ITriggerTextColor>(state: TState) =>
    state.triggerTextColor


export interface ITriggerIcon {
  triggerIcon: Icon
}

export const triggerIconReducer =
  <TState extends ITriggerIcon>(
    state: TState,
    action: PayloadAction<TState['triggerIcon']>
  ) => {
    state.triggerIcon = action.payload
  }

export const selectTriggerIcon =
  <TState extends ITriggerIcon>(state: TState) =>
    state.triggerIcon


export interface ITriggerPosition {
  triggerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const triggerPositionReducer =
  <TState extends ITriggerPosition>(
    state: TState,
    action: PayloadAction<TState['triggerPosition']>
  ) => {
    state.triggerPosition = action.payload
  }

export const selectTriggerPosition =
  <TState extends ITriggerPosition>(state: TState) =>
    state.triggerPosition


export const triggerSettingsReducers = {
  triggerTextChanged:
    triggerTextReducer,
  triggerBackgroundColorChanged:
    triggerBackgroundColorReducer,
  triggerFontColorChanged:
    triggerFontColorReducer,
  triggerIconChanged:
    triggerIconReducer,
  triggerPositionChanged:
    triggerPositionReducer,
}

export const triggerSettingsSelectors = {
  selectTriggerText,
  selectTriggerBackgroundColor,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerPosition,
}
