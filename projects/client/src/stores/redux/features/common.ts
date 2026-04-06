import type { PayloadAction } from '@reduxjs/toolkit'
import type { FetchStatus, RootState } from '../store'

export interface IWidgetId {
  widgetId?: string
}

export const selectWidgetId =
  <TState extends IWidgetId>(state: TState) =>
    state.widgetId


export interface IProjectId {
  projectId?: string
}

export const selectProjectId =
  <TState extends IProjectId>(state: TState) =>
    state.projectId


export interface IFetchStatus {
  fetchStatus: FetchStatus
}

export const selectFetchStatus =
  <TState extends IFetchStatus>(state: TState) =>
    state.fetchStatus


export interface IFetchError {
  fetchError: string | null
}

export const selectFetchError =
  <TState extends IFetchError>(state: TState) =>
    state.fetchError


export interface IBrandingEnabled {
  brandingEnabled: boolean
}

export const brandingEnabledReducer =
  <TState extends IBrandingEnabled>(
    state: TState,
    action: PayloadAction<TState['brandingEnabled']>
  ) => {
    state.brandingEnabled = action.payload
  }

export const selectBrandingEnabled =
  <TState extends IBrandingEnabled>(state: TState) =>
    state.brandingEnabled


export const commonReducers = {
  brandingEnabledChanged: brandingEnabledReducer,
}

export const commonSelectors = {
  selectWidgetId,
  selectProjectId,
  selectFetchStatus,
  selectFetchError,
  selectBrandingEnabled,
}