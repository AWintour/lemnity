import type { PayloadAction } from '@reduxjs/toolkit'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

export interface IWidgetAppearenceCompanyLogoEnabled {
  appearence: { companyLogoEnabled: boolean }
}

export const widgetAppearenceCompanyLogoEnabledReducer =
  <TState extends IWidgetAppearenceCompanyLogoEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['appearence']['companyLogoEnabled']>
  ) => {
    state.appearence.companyLogoEnabled = action.payload
  }

export const selectCompanyLogoEnabled =
  <TState extends IWidgetAppearenceCompanyLogoEnabled>(state: TState) =>
    state.appearence.companyLogoEnabled


export interface IWidgetAppearenceCompanyLogoUrl {
  appearence: { companyLogoUrl?: string }
}

export const widgetAppearenceCompanyLogoUrlReducer =
  <TState extends IWidgetAppearenceCompanyLogoUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['appearence']['companyLogoUrl']>
  ) => {
    state.appearence.companyLogoUrl = action.payload
  }

export const selectCompanyLogoUrl =
  <TState extends IWidgetAppearenceCompanyLogoUrl>(state: TState) =>
    state.appearence.companyLogoUrl


export interface IWidgetAppearenceColorScheme {
  appearence: { colorScheme: ColorScheme }
}

export const widgetAppearenceColorSchemeReducer =
  <TState extends IWidgetAppearenceColorScheme>(
    state:
      TState,
    action:
      PayloadAction<TState['appearence']['colorScheme']>
  ) => {
    state.appearence.colorScheme = action.payload
  }

export const selectColorScheme =
  <TState extends IWidgetAppearenceColorScheme>(state: TState) =>
    state.appearence.colorScheme


export interface IWidgetAppearenceBackgroundColor {
  appearence: { backgroundColor: string }
}

export const widgetAppearenceBackgroundColorReducer =
  <TState extends IWidgetAppearenceBackgroundColor>(
    state:
      TState,
    action:
      PayloadAction<TState['appearence']['backgroundColor']>
  ) => {
    state.appearence.backgroundColor = action.payload
  }

export const selectBackgroundColor =
  <TState extends IWidgetAppearenceBackgroundColor>(state: TState) =>
    state.appearence.backgroundColor


export interface IWidgetAppearenceBorderRadius {
  appearence: { borderRadius: number }
}

export const widgetAppearenceBorderRadius =
  <TState extends IWidgetAppearenceBorderRadius>(
    state:
      TState,
    action:
      PayloadAction<TState['appearence']['borderRadius']>
  ) => {
    state.appearence.borderRadius = action.payload
  }

export const selectBorderRadius =
  <TState extends IWidgetAppearenceBorderRadius>(state: TState) =>
    state.appearence.borderRadius


export const widgetAppearenceReducers = {
  companyLogoEnabledChanged:
    widgetAppearenceCompanyLogoEnabledReducer,
  companyLogoUrlChanged:
    widgetAppearenceCompanyLogoUrlReducer,
  colorSchemeChanged:
    widgetAppearenceColorSchemeReducer,
  backgroundColorChanged:
    widgetAppearenceBackgroundColorReducer,
  borderRadiusChanged:
    widgetAppearenceBorderRadius,
}

export const widgetAppearenceSelectors = {
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
}
