import type { PayloadAction } from '@reduxjs/toolkit'

export interface ICountdownEnabled {
  countdown: { countdownEnabled: boolean }
}

export const countdownEnabledReducer =
  <TState extends ICountdownEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['countdownEnabled']>
  ) => {
    state.countdown.countdownEnabled = action.payload
  }

export const selectCountdownEnabled =
  <TState extends ICountdownEnabled>(state: TState) =>
    state.countdown.countdownEnabled


export interface ITextBeforeCountdown {
  countdown: { textBeforeCountdown: string }
}

export const textBeforeCountdownReducer =
  <TState extends ITextBeforeCountdown>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['textBeforeCountdown']>
  ) => {
    state.countdown.textBeforeCountdown = action.payload
  }

export const selectTextBeforeCountdown =
  <TState extends ITextBeforeCountdown>(state: TState) =>
    state.countdown.textBeforeCountdown


export interface ITextBeforeCountdownColor {
  countdown: { textBeforeCountdownColor: string }
}

export const textBeforeCountdownColorReducer =
  <TState extends ITextBeforeCountdownColor>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['textBeforeCountdownColor']>
  ) => {
    state.countdown.textBeforeCountdownColor = action.payload
  }

export const selectTextBeforeCountdownColor =
  <TState extends ITextBeforeCountdownColor>(state: TState) =>
    state.countdown.textBeforeCountdownColor


export interface ICountdownDate {
  countdown: { countdownDate: string }
}

export const countdownDateReducer =
  <TState extends ICountdownDate>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['countdownDate']>
  ) => {
    state.countdown.countdownDate = action.payload
  }

export const selectCountdownDate =
  <TState extends ICountdownDate>(state: TState) =>
    state.countdown.countdownDate


export interface ICountdownBackgoundColor {
  countdown: { countdownBackgroundColor: string }
}

export const countdownBackgroundColorReducer =
  <TState extends ICountdownBackgoundColor>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['countdownBackgroundColor']>
  ) => {
    state.countdown.countdownBackgroundColor = action.payload
  }

export const selectCountdownBackgroundColor =
  <TState extends ICountdownBackgoundColor>(state: TState) =>
    state.countdown.countdownBackgroundColor


export interface ICountdownFontColor {
  countdown: { countdownFontColor: string }
}

export const countdownFontColorReducer =
  <TState extends ICountdownFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['countdown']['countdownFontColor']>
  ) => {
    state.countdown.countdownFontColor = action.payload
  }

export const selectCountdownFontColor =
  <TState extends ICountdownFontColor>(state: TState) =>
    state.countdown.countdownFontColor
