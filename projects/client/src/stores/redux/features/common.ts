import type { PayloadAction } from '@reduxjs/toolkit'

export const brandingEnabledChangedReducer =
  <TState extends { brandingEnabled: boolean }>(
    state: TState,
    action: PayloadAction<TState['brandingEnabled']>
  ) => {
    state.brandingEnabled = action.payload
  }