import type { TriggerVariant } from '@lemnity/widget-config/features/trigger'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface ITriggerText {
  trigger: { triggerText: string }
}

export const triggerTextReducer =
  <TState extends ITriggerText>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerText']>
  ) => {
    state.trigger.triggerText = action.payload
  }

export const selectTriggerText =
  <TState extends ITriggerText>(state: TState) =>
    state.trigger.triggerText


export interface ITriggerBackgroundColor {
  trigger: { triggerBackgroundColor: string }
}

export const triggerBackgroundColorReducer =
  <TState extends ITriggerBackgroundColor>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerBackgroundColor']>
  ) => {
    state.trigger.triggerBackgroundColor = action.payload
  }

export const selectTriggerBackgroundColor =
  <TState extends ITriggerBackgroundColor>(state: TState) =>
    state.trigger.triggerBackgroundColor


export interface ITriggerFontColor {
  trigger: { triggerFontColor: string }
}

export const triggerFontColorReducer =
  <TState extends ITriggerFontColor>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerFontColor']>
  ) => {
    state.trigger.triggerFontColor = action.payload
  }

export const selectTriggerFontColor =
  <TState extends ITriggerFontColor>(state: TState) =>
    state.trigger.triggerFontColor


export interface ITriggerIcon {
  trigger: { triggerIcon: Icon }
}

export const triggerIconReducer =
  <TState extends ITriggerIcon>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerIcon']>
  ) => {
    state.trigger.triggerIcon = action.payload
  }

export const selectTriggerIcon =
  <TState extends ITriggerIcon>(state: TState) =>
    state.trigger.triggerIcon


export interface ITriggerPosition {
  trigger: { triggerPosition: 'bottom-left' | 'bottom-right' }
}

export const triggerPositionReducer =
  <TState extends ITriggerPosition>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerPosition']>
  ) => {
    state.trigger.triggerPosition = action.payload
  }

export const selectTriggerPosition =
  <TState extends ITriggerPosition>(state: TState) =>
    state.trigger.triggerPosition


export interface ITriggerVariant {
  trigger: { triggerVariant: TriggerVariant }
}

export const triggerVariantReducer =
  <TState extends ITriggerVariant>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerVariant']>
  ) => {
    state.trigger.triggerVariant = action.payload
  }

export const selectTriggerVariant =
  <TState extends ITriggerVariant>(state: TState) =>
    state.trigger.triggerVariant


export interface ITriggerImageUrl {
  trigger: { triggerImageUrl: string }
}

export const triggerImageUrlReducer =
  <TState extends ITriggerImageUrl>(
    state: TState,
    action: PayloadAction<TState['trigger']['triggerImageUrl']>
  ) => {
    state.trigger.triggerImageUrl = action.payload
  }

export const selectTrriggerImageUrl =
  <TState extends ITriggerImageUrl>(state: TState) =>
    state.trigger.triggerImageUrl


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
  triggerVariantChanged:
    triggerVariantReducer,
  triggerImageUrlChanged:
    triggerImageUrlReducer,
}

export const triggerSettingsSelectors = {
  selectTriggerText,
  selectTriggerBackgroundColor,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerPosition,
  selectTriggerVariant,
  selectTrriggerImageUrl,
}
