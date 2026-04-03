import type { PayloadAction } from '@reduxjs/toolkit'
import type { MobileTrigger } from '@lemnity/widget-config/widgets/announcement'

export const mobileEnabledReducer =
  <TState extends { mobileSettings: { mobileEnabled: boolean } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['mobileEnabled']>
  ) => {
    state.mobileSettings.mobileEnabled = action.payload
  }

export const mobileTriggerTypeReducer =
  <TState extends { mobileSettings: { triggerType: MobileTrigger } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerType']>
  ) => {
    state.mobileSettings.triggerType = action.payload
  }

export const mobileTriggerTextReducer =
  <TState extends { mobileSettings: { triggerText: string } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerText']>
  ) => {
    state.mobileSettings.triggerText = action.payload
  }

export const mobileTriggerBackgroundColorReducer =
  <TState extends { mobileSettings: { triggerBackgroundColor: string } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerBackgroundColor']>
  ) => {
    state.mobileSettings.triggerBackgroundColor = action.payload
  }

export const mobileTriggerFontColorReducer =
  <TState extends { mobileSettings: { triggerFontColor: string } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['triggerFontColor']>
  ) => {
    state.mobileSettings.triggerFontColor = action.payload
  }

export const mobileImageUrlReducer =
  <TState extends { mobileSettings: { imageUrl?: string } }>(
    state: TState,
    action: PayloadAction<TState['mobileSettings']['imageUrl']>
  ) => {
    state.mobileSettings.imageUrl = action.payload
  }