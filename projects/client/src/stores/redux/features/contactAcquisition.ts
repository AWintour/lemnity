import type { PayloadAction } from '@reduxjs/toolkit'

export interface IContactsEnabled {
  contactAcquisitionEnabled: boolean
}

export const contactAcquisitionEnabledReducer =
  <TState extends IContactsEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisitionEnabled']>
  ) => {
    state.contactAcquisitionEnabled = action.payload
  }

export const selectContactAcquisitionEnabled =
  <TState extends IContactsEnabled>(state: TState) =>
    state.contactAcquisitionEnabled


export interface IContactsNameFieldEnabled {
  nameFieldEnabled: boolean
}

export const contactsNameFieldEnabledReducer =
  <TState extends IContactsNameFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['nameFieldEnabled']>
  ) => {
    state.nameFieldEnabled = action.payload
  }

export const selectNameFieldEnabled =
  <TState extends IContactsNameFieldEnabled>(state: TState) =>
    state.nameFieldEnabled


export interface IContactsNameFieldRequired {
  nameFieldRequired: boolean
}

export const contactsNameFieldRequiredReducer =
  <TState extends IContactsNameFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['nameFieldRequired']>
  ) => {
    state.nameFieldRequired = action.payload
  }

export const selectNameFieldRequired =
  <TState extends IContactsNameFieldRequired>(state: TState) =>
    state.nameFieldRequired


export interface IContactsEmailFieldEnabled {
  emailFieldEnabled: boolean
}

export const contactsEmailFieldEnabledReducer =
  <TState extends IContactsEmailFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['emailFieldEnabled']>
  ) => {
    state.emailFieldEnabled = action.payload
  }

export const selectEmailFieldEnabled =
  <TState extends IContactsEmailFieldEnabled>(state: TState) =>
    state.emailFieldEnabled


export interface IContactsEmailFieldRequired {
  emailFieldRequired: boolean
}

export const contactsEmailFieldRequiredReducer =
  <TState extends IContactsEmailFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['emailFieldRequired']>
  ) => {
    state.emailFieldRequired = action.payload
  }

export const selectEmailFieldRequired =
  <TState extends IContactsEmailFieldRequired>(state: TState) =>
    state.emailFieldRequired


export interface IContactsPhoneFieldEnabled {
  phoneFieldEnabled: boolean
}

export const contactsPhoneFieldEnabledReducer =
  <TState extends IContactsPhoneFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['phoneFieldEnabled']>
  ) => {
    state.phoneFieldEnabled = action.payload
  }

export const selectPhoneFieldEnabled =
  <TState extends IContactsPhoneFieldEnabled>(state: TState) =>
    state.phoneFieldEnabled


export interface IContactsPhoneFieldRequired {
  phoneFieldRequired: boolean
}

export const contactsPhoneFieldRequiredReducer =
  <TState extends IContactsPhoneFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['phoneFieldRequired']>
  ) => {
    state.phoneFieldRequired = action.payload
  }

export const selectPhoneFieldRequired =
  <TState extends IContactsPhoneFieldRequired>(state: TState) =>
    state.phoneFieldRequired


export const contactAcquisitionReducers = {
  contactAcquisitionEnabledChanged:
    contactAcquisitionEnabledReducer,
  nameFieldEnabledChanged:
    contactsNameFieldEnabledReducer,
  nameFieldRequiredChanged:
    contactsNameFieldRequiredReducer,
  emailFieldEnabledChanged:
    contactsEmailFieldEnabledReducer,
  emailFieldRequiredChanged:
    contactsEmailFieldRequiredReducer,
  phoneFieldEnabledChanged:
    contactsPhoneFieldEnabledReducer,
  phoneFieldRequiredChanged:
    contactsPhoneFieldRequiredReducer,
}

export const contactAcquisitionSelectors = {
  selectContactAcquisitionEnabled,
  selectNameFieldEnabled,
  selectNameFieldRequired,
  selectEmailFieldEnabled,
  selectEmailFieldRequired,
  selectPhoneFieldEnabled,
  selectPhoneFieldRequired,
}
