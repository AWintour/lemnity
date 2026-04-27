import type { PayloadAction } from '@reduxjs/toolkit'
import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

export interface IRewardScreenEnabled {
  rewardMessageSettings: { rewardScreenEnabled: boolean }
}

export const rewardScreenEnabledReducer =
  <TState extends IRewardScreenEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['rewardScreenEnabled']>
  ) => {
    state.rewardMessageSettings.rewardScreenEnabled = action.payload
  }

export const selectRewardScreenEnabled =
  <TState extends IRewardScreenEnabled>(state: TState) =>
    state.rewardMessageSettings.rewardScreenEnabled


export interface IRewardScreenTitle {
  rewardMessageSettings: { title: string }
}

export const rewardTitleReducer =
  <TState extends IRewardScreenTitle>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['title']>
  ) => {
    state.rewardMessageSettings.title = action.payload
  }

export const selectRewardTitle =
  <TState extends IRewardScreenTitle>(state: TState) =>
    state.rewardMessageSettings.title


export interface IRewardScreenTitleFontSize {
  rewardMessageSettings: { titleFontSize: number }
}

export const rewardTitleFontSizeReducer =
  <TState extends IRewardScreenTitleFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontSize']>
  ) => {
    state.rewardMessageSettings.titleFontSize = action.payload
  }

export const selectRewardTitleFontSize =
  <TState extends IRewardScreenTitleFontSize>(state: TState) =>
    state.rewardMessageSettings.titleFontSize


export interface IRewardScreenFontWeight {
  rewardMessageSettings: { titleFontWeight: FontWeight }
}

export const rewardTitleFontWeightReducer =
  <TState extends IRewardScreenFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontWeight']>
  ) => {
    state.rewardMessageSettings.titleFontWeight = action.payload
  }

export const selectRewardTitleFontWeight =
  <TState extends IRewardScreenFontWeight>(state: TState) =>
    state.rewardMessageSettings.titleFontWeight

export interface IRewardScreenFontColor {
  rewardMessageSettings: { titleFontColor: string }
}

export const rewardTitleFontColorReducer =
  <TState extends IRewardScreenFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontColor']>
  ) => {
    state.rewardMessageSettings.titleFontColor = action.payload
  }

export const selectRewardTitleFontColor =
  <TState extends IRewardScreenFontColor>(state: TState) =>
    state.rewardMessageSettings.titleFontColor

export interface IRewardScreenDescription {
  rewardMessageSettings: { description: string }
}

export const rewardDescriptionReducer =
  <TState extends IRewardScreenDescription>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['description']>
  ) => {
    state.rewardMessageSettings.description = action.payload
  }

export const selectRewardDescription =
  <TState extends IRewardScreenDescription>(state: TState) =>
    state.rewardMessageSettings.description


export interface IRewardScreenDescriptionFontSize {
  rewardMessageSettings: { descriptionFontSize: number }
}

export const rewardDescriptionFontSizeReducer =
  <TState extends IRewardScreenDescriptionFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontSize']>
  ) => {
    state.rewardMessageSettings.descriptionFontSize = action.payload
  }

export const selectRewardDescriptionFontSize =
  <TState extends IRewardScreenDescriptionFontSize>(state: TState) =>
    state.rewardMessageSettings.descriptionFontSize


export interface IRewardScreenDescriptionFontWeight {
  rewardMessageSettings: { descriptionFontWeight: FontWeight }
}

export const rewardDescriptionFontWeighReducer =
  <TState extends IRewardScreenDescriptionFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontWeight']>
  ) => {
    state.rewardMessageSettings.descriptionFontWeight = action.payload
  }

export const selectRewardDescriptionFontWeight =
  <TState extends IRewardScreenDescriptionFontWeight>(state: TState) =>
    state.rewardMessageSettings.descriptionFontWeight


export interface IRewardScreenDescriptionFontColor {
  rewardMessageSettings: { descriptionFontColor: string }
}

export const rewardDescriptionFontColorReducer =
  <TState extends IRewardScreenDescriptionFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontColor']>
  ) => {
    state.rewardMessageSettings.descriptionFontColor = action.payload
  }

export const selectRewardDescriptionFontColor =
  <TState extends IRewardScreenDescriptionFontColor>(state: TState) =>
    state.rewardMessageSettings.descriptionFontColor


export interface IRewardScreenDiscount {
  rewardMessageSettings: { discount: string }
}

export const rewardDiscountReducer =
  <TState extends IRewardScreenDiscount>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discount']>
  ) => {
    state.rewardMessageSettings.discount = action.payload
  }

export const selectRewardDiscount =
  <TState extends IRewardScreenDiscount>(state: TState) =>
    state.rewardMessageSettings.discount


export interface IRewardScreenDiscountFontSize {
  rewardMessageSettings: { discountFontSize: number }
}

export const rewardDiscountFontSizeReducer =
  <TState extends IRewardScreenDiscountFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontSize']>
  ) => {
    state.rewardMessageSettings.discountFontSize = action.payload
  }

export const selectRewardDiscountFontSize =
  <TState extends IRewardScreenDiscountFontSize>(state: TState) =>
    state.rewardMessageSettings.discountFontSize


export interface IRewardScreenDiscountFontWeight {
  rewardMessageSettings: { discountFontWeight: FontWeight }
}

export const rewardDiscountFontWeightReducer =
  <TState extends IRewardScreenDiscountFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontWeight']>
  ) => {
    state.rewardMessageSettings.discountFontWeight = action.payload
  }

export const selectRewardDiscountFontWeight =
  <TState extends IRewardScreenDiscountFontWeight>(state: TState) =>
    state.rewardMessageSettings.discountFontWeight


export interface IRewardScreenDiscountFontColor {
  rewardMessageSettings: { discountFontColor: string }
}

export const rewardDiscountFontColorReduer =
  <TState extends IRewardScreenDiscountFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontColor']>
  ) => {
    state.rewardMessageSettings.discountFontColor = action.payload
  }

export const selectRewardDiscountFontColor =
  <TState extends IRewardScreenDiscountFontColor>(state: TState) =>
    state.rewardMessageSettings.discountFontColor


export interface IRewardScreenPromo {
  rewardMessageSettings: { promo: string }
}

export const rewardPromoReducer =
  <TState extends IRewardScreenPromo>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promo']>
  ) => {
    state.rewardMessageSettings.promo = action.payload
  }

export const selectRewardPromo =
  <TState extends IRewardScreenPromo>(state: TState) =>
    state.rewardMessageSettings.promo


export interface IRewardScreenPromoFontSize {
  rewardMessageSettings: { promoFontSize: number }
}

export const rewardPromoFontSizeReducer =
  <TState extends IRewardScreenPromoFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontSize']>
  ) => {
    state.rewardMessageSettings.promoFontSize = action.payload
  }

export const selectRewardPromoFontSize =
  <TState extends IRewardScreenPromoFontSize>(state: TState) =>
    state.rewardMessageSettings.promoFontSize


export interface IRewardScreenPromoFontWeight {
  rewardMessageSettings: { promoFontWeight: FontWeight }
}

export const rewardPromoFontWeightReducer =
  <TState extends IRewardScreenPromoFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontWeight']>
  ) => {
    state.rewardMessageSettings.promoFontWeight = action.payload
  }

export const selectRewardPromoFontWeight =
  <TState extends IRewardScreenPromoFontWeight>(state: TState) =>
    state.rewardMessageSettings.promoFontWeight


export interface IRewardScreenPromoFontColor {
  rewardMessageSettings: { promoFontColor: string }
}

export const rewardPromoFontColorReducer =
  <TState extends IRewardScreenPromoFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontColor']>
  ) => {
    state.rewardMessageSettings.promoFontColor = action.payload
  }

export const selectRewardPromoFontColor =
  <TState extends IRewardScreenPromoFontColor>(state: TState) =>
    state.rewardMessageSettings.promoFontColor

export interface IRewardScreenCustomColorSchemeEnabled {
  rewardMessageSettings: { customColorSchemeEnabled: boolean }
}

export const rewardCustomColorSchemeEnabledReducer =
  <TState extends IRewardScreenCustomColorSchemeEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['customColorSchemeEnabled']>
  ) => {
    state.rewardMessageSettings.customColorSchemeEnabled = action.payload
  }

export const selectRewardCustomColorSchemeEnabled =
  <TState extends IRewardScreenCustomColorSchemeEnabled>(state: TState) =>
    state.rewardMessageSettings.customColorSchemeEnabled


export interface IRewardScreenCustomDiscountBackgroundColor {
  rewardMessageSettings: { customDiscountBackgroundColor: string }
}

export const rewardCustomDiscountBackgroundColorReducer =
  <TState extends IRewardScreenCustomDiscountBackgroundColor>(
    state:
      TState,
    action:
      PayloadAction<
        TState['rewardMessageSettings']['customDiscountBackgroundColor']
      >
  ) => {
    state.rewardMessageSettings.customDiscountBackgroundColor = action.payload
  }

export const selectRewardCustomDiscountBackgroundColor =
  <TState extends IRewardScreenCustomDiscountBackgroundColor>(state: TState) =>
    state.rewardMessageSettings.customDiscountBackgroundColor


export interface IRewardScreenCustomPromoBackgroundColor {
  rewardMessageSettings: { customPromoBackgroundColor: string }
}

export const rewardCustomPromoBackgroundColorReducer =
  <TState extends IRewardScreenCustomPromoBackgroundColor>(
    state:
      TState,
    action:
      PayloadAction<
        TState['rewardMessageSettings']['customPromoBackgroundColor']
      >
  ) => {
    state.rewardMessageSettings.customPromoBackgroundColor = action.payload
  }

export const selectRewardCustomPromoBackgroundColor =
  <TState extends IRewardScreenCustomPromoBackgroundColor>(state: TState) =>
    state.rewardMessageSettings.customPromoBackgroundColor


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

export const rewardScreenSelectors = {
  selectRewardScreenEnabled,
  selectRewardTitle,
  selectRewardTitleFontSize,
  selectRewardTitleFontWeight,
  selectRewardTitleFontColor,
  selectRewardDescription,
  selectRewardDescriptionFontSize,
  selectRewardDescriptionFontWeight,
  selectRewardDescriptionFontColor,
  selectRewardDiscount,
  selectRewardDiscountFontSize,
  selectRewardDiscountFontWeight,
  selectRewardDiscountFontColor,
  selectRewardPromo,
  selectRewardPromoFontSize,
  selectRewardPromoFontWeight,
  selectRewardPromoFontColor,
  selectRewardCustomColorSchemeEnabled,
  selectRewardCustomDiscountBackgroundColor,
  selectRewardCustomPromoBackgroundColor,
}
