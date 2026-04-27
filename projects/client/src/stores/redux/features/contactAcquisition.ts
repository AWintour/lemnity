import type { PayloadAction } from '@reduxjs/toolkit'

export interface IContactsEnabled {
  contactAcquisition: { contactAcquisitionEnabled: boolean }
}

export const contactAcquisitionEnabledReducer =
  <TState extends IContactsEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['contactAcquisitionEnabled']>
  ) => {
    state.contactAcquisition.contactAcquisitionEnabled = action.payload
  }

export const selectContactAcquisitionEnabled =
  <TState extends IContactsEnabled>(state: TState) =>
    state.contactAcquisition.contactAcquisitionEnabled


export interface IContactsNameFieldEnabled {
  contactAcquisition: { nameFieldEnabled: boolean }
}

export const contactsNameFieldEnabledReducer =
  <TState extends IContactsNameFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['nameFieldEnabled']>
  ) => {
    state.contactAcquisition.nameFieldEnabled = action.payload
  }

export const selectNameFieldEnabled =
  <TState extends IContactsNameFieldEnabled>(state: TState) =>
    state.contactAcquisition.nameFieldEnabled


export interface IContactsNameFieldRequired {
  contactAcquisition: { nameFieldRequired: boolean }
}

export const contactsNameFieldRequiredReducer =
  <TState extends IContactsNameFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['nameFieldRequired']>
  ) => {
    state.contactAcquisition.nameFieldRequired = action.payload
  }

export const selectNameFieldRequired =
  <TState extends IContactsNameFieldRequired>(state: TState) =>
    state.contactAcquisition.nameFieldRequired


export interface IContactsEmailFieldEnabled {
  contactAcquisition: { emailFieldEnabled: boolean }
}

export const contactsEmailFieldEnabledReducer =
  <TState extends IContactsEmailFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['emailFieldEnabled']>
  ) => {
    state.contactAcquisition.emailFieldEnabled = action.payload
  }

export const selectEmailFieldEnabled =
  <TState extends IContactsEmailFieldEnabled>(state: TState) =>
    state.contactAcquisition.emailFieldEnabled


export interface IContactsEmailFieldRequired {
  contactAcquisition: { emailFieldRequired: boolean }
}

export const contactsEmailFieldRequiredReducer =
  <TState extends IContactsEmailFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['emailFieldRequired']>
  ) => {
    state.contactAcquisition.emailFieldRequired = action.payload
  }

export const selectEmailFieldRequired =
  <TState extends IContactsEmailFieldRequired>(state: TState) =>
    state.contactAcquisition.emailFieldRequired


export interface IContactsPhoneFieldEnabled {
  contactAcquisition: { phoneFieldEnabled: boolean }
}

export const contactsPhoneFieldEnabledReducer =
  <TState extends IContactsPhoneFieldEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['phoneFieldEnabled']>
  ) => {
    state.contactAcquisition.phoneFieldEnabled = action.payload
  }

export const selectPhoneFieldEnabled =
  <TState extends IContactsPhoneFieldEnabled>(state: TState) =>
    state.contactAcquisition.phoneFieldEnabled


export interface IContactsPhoneFieldRequired {
  contactAcquisition: { phoneFieldRequired: boolean }
}

export const contactsPhoneFieldRequiredReducer =
  <TState extends IContactsPhoneFieldRequired>(
    state:
      TState,
    action:
      PayloadAction<TState['contactAcquisition']['phoneFieldRequired']>
  ) => {
    state.contactAcquisition.phoneFieldRequired = action.payload
  }

export const selectPhoneFieldRequired =
  <TState extends IContactsPhoneFieldRequired>(state: TState) =>
    state.contactAcquisition.phoneFieldRequired


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
