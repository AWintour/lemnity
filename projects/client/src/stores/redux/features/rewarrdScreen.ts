import type { PayloadAction } from '@reduxjs/toolkit'
import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

export const rewardScreenEnabledReducer =
  <TState extends { rewardMessageSettings: { rewardScreenEnabled: boolean } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['rewardScreenEnabled']>
  ) => {
    state.rewardMessageSettings.rewardScreenEnabled = action.payload
  }

export const rewardTitleReducer =
  <TState extends { rewardMessageSettings: { title: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['title']>
  ) => {
    state.rewardMessageSettings.title = action.payload
  }

export const rewardTitleFontSizeReducer =
  <TState extends { rewardMessageSettings: { titleFontSize: number } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['titleFontSize']>
  ) => {
    state.rewardMessageSettings.titleFontSize = action.payload
  }

export const rewardTitleFontWeightReducer =
  <TState extends { rewardMessageSettings: { titleFontWeight: FontWeight } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['titleFontWeight']>
  ) => {
    state.rewardMessageSettings.titleFontWeight = action.payload
  }

export const rewardTitleFontColorReducer =
  <TState extends { rewardMessageSettings: { titleFontColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['titleFontColor']>
  ) => {
    state.rewardMessageSettings.titleFontColor = action.payload
  }

export const rewardDescriptionReducer =
  <TState extends { rewardMessageSettings: { description: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['description']>
  ) => {
    state.rewardMessageSettings.description = action.payload
  }

export const rewardDescriptionFontSizeReducer =
  <TState extends { rewardMessageSettings: { descriptionFontSize: number } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['descriptionFontSize']>
  ) => {
    state.rewardMessageSettings.descriptionFontSize = action.payload
  }

export const rewardDescriptionFontWeighReducer =
  <TState extends { rewardMessageSettings: { descriptionFontWeight: FontWeight } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['descriptionFontWeight']>
  ) => {
    state.rewardMessageSettings.descriptionFontWeight = action.payload
  }

export const rewardDescriptionFontColorReducer =
  <TState extends { rewardMessageSettings: { descriptionFontColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['descriptionFontColor']>
  ) => {
    state.rewardMessageSettings.descriptionFontColor = action.payload
  }

export const rewardDiscountReducer =
  <TState extends { rewardMessageSettings: { discount: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['discount']>
  ) => {
    state.rewardMessageSettings.discount = action.payload
  }

export const rewardDiscountFontSizeReducer =
  <TState extends { rewardMessageSettings: { discountFontSize: number } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['discountFontSize']>
  ) => {
    state.rewardMessageSettings.discountFontSize = action.payload
  }

export const rewardDiscountFontWeightReducer =
  <TState extends { rewardMessageSettings: { discountFontWeight: FontWeight } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['discountFontWeight']>
  ) => {
    state.rewardMessageSettings.discountFontWeight = action.payload
  }

export const rewardDiscountFontColorReduer =
  <TState extends { rewardMessageSettings: { discountFontColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['discountFontColor']>
  ) => {
    state.rewardMessageSettings.discountFontColor = action.payload
  }

export const rewardPromoReducer =
  <TState extends { rewardMessageSettings: { promo: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['promo']>
  ) => {
    state.rewardMessageSettings.promo = action.payload
  }

export const rewardPromoFontSizeReducer =
  <TState extends { rewardMessageSettings: { promoFontSize: number } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['promoFontSize']>
  ) => {
    state.rewardMessageSettings.promoFontSize = action.payload
  }

export const rewardPromoFontWeightReducer =
  <TState extends { rewardMessageSettings: { promoFontWeight: FontWeight } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['promoFontWeight']>
  ) => {
    state.rewardMessageSettings.promoFontWeight = action.payload
  }

export const rewardPromoFontColorReducer =
  <TState extends { rewardMessageSettings: { promoFontColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['promoFontColor']>
  ) => {
    state.rewardMessageSettings.promoFontColor = action.payload
  }

export const rewardCustomColorSchemeEnabledReducer =
  <TState extends { rewardMessageSettings: { customColorSchemeEnabled: boolean } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['customColorSchemeEnabled']>
  ) => {
    state.rewardMessageSettings.customColorSchemeEnabled = action.payload
  }

export const rewardCustomDiscountBackgroundColorReducer =
  <TState extends { rewardMessageSettings: { customDiscountBackgroundColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['customDiscountBackgroundColor']>
  ) => {
    state.rewardMessageSettings.customDiscountBackgroundColor = action.payload
  }

export const rewardCustomPromoBackgroundColorReducer =
  <TState extends { rewardMessageSettings: { customPromoBackgroundColor: string } }>(
    state: TState,
    action: PayloadAction<TState['rewardMessageSettings']['customPromoBackgroundColor']>
  ) => {
    state.rewardMessageSettings.customPromoBackgroundColor = action.payload
  }

export const rewardScreenReducers = {
  rewardScreenEnabledChanged:
    rewardScreenEnabledReducer,
  rewardTitleChanged:
    rewardTitleReducer,
  rewardTitleFontSizeChanged:
    rewardTitleFontSizeReducer,
  rewardTitleFontWeightChanged:
    rewardTitleFontWeightReducer,
  rewardTitleFontColorChanged:
    rewardTitleFontColorReducer,
  rewardDescriptionChanged:
    rewardDescriptionReducer,
  rewardDescriptionFontSizeChanged:
    rewardDescriptionFontSizeReducer,
  rewardDescriptionFontWeightChanged:
    rewardDescriptionFontWeighReducer,
  rewardDescriptionFontColorChanged:
    rewardDescriptionFontColorReducer,
  rewardDiscountChanged:
    rewardDiscountReducer,
  rewardDiscountFontSizeChanged:
    rewardDiscountFontSizeReducer,
  rewardDiscountFontWeightChanged:
    rewardDiscountFontWeightReducer,
  rewardDiscountFontColorChanged:
    rewardDiscountFontColorReduer,
  rewardPromoChanged:
    rewardPromoReducer,
  rewardPromoFontSizeChanged:
    rewardPromoFontSizeReducer,
  rewardPromoFontWeightChanged:
    rewardPromoFontWeightReducer,
  rewardPromoFontColorChanged:
    rewardPromoFontColorReducer,
  rewardCustomColorSchemeEnabledChanged:
    rewardCustomColorSchemeEnabledReducer,
  rewardCustomDiscountBackgroundColorChanged:
    rewardCustomDiscountBackgroundColorReducer,
  rewardCustomPromoBackgroundColorChanged:
    rewardCustomPromoBackgroundColorReducer,
}
