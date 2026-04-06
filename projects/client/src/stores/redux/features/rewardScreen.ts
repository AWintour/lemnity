import type { PayloadAction } from '@reduxjs/toolkit'
import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

export interface RewardScreenEnabled {
  rewardMessageSettings: { rewardScreenEnabled: boolean }
}

export const rewardScreenEnabledReducer =
  <TState extends RewardScreenEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['rewardScreenEnabled']>
  ) => {
    state.rewardMessageSettings.rewardScreenEnabled = action.payload
  }

export const selectRewardScreenEnabled =
  <TState extends RewardScreenEnabled>(state: TState) =>
    state.rewardMessageSettings.rewardScreenEnabled


export interface RewardScreenTitle {
  rewardMessageSettings: { title: string }
}

export const rewardTitleReducer =
  <TState extends RewardScreenTitle>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['title']>
  ) => {
    state.rewardMessageSettings.title = action.payload
  }

export const selectRewardTitle =
  <TState extends RewardScreenTitle>(state: TState) =>
    state.rewardMessageSettings.title


export interface RewardScreenTitleFontSize {
  rewardMessageSettings: { titleFontSize: number }
}

export const rewardTitleFontSizeReducer =
  <TState extends RewardScreenTitleFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontSize']>
  ) => {
    state.rewardMessageSettings.titleFontSize = action.payload
  }

export const selectRewardTitleFontSize =
  <TState extends RewardScreenTitleFontSize>(state: TState) =>
    state.rewardMessageSettings.titleFontSize


export interface RewardScreenFontWeight {
  rewardMessageSettings: { titleFontWeight: FontWeight }
}

export const rewardTitleFontWeightReducer =
  <TState extends RewardScreenFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontWeight']>
  ) => {
    state.rewardMessageSettings.titleFontWeight = action.payload
  }

export const selectRewardTitleFontWeight =
  <TState extends RewardScreenFontWeight>(state: TState) =>
    state.rewardMessageSettings.titleFontWeight

export interface RewardScreenFontColor {
  rewardMessageSettings: { titleFontColor: string }
}

export const rewardTitleFontColorReducer =
  <TState extends RewardScreenFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['titleFontColor']>
  ) => {
    state.rewardMessageSettings.titleFontColor = action.payload
  }

export const selectRewardTitleFontColor =
  <TState extends RewardScreenFontColor>(state: TState) =>
    state.rewardMessageSettings.titleFontColor

export interface RewardScreenDescription {
  rewardMessageSettings: { description: string }
}

export const rewardDescriptionReducer =
  <TState extends RewardScreenDescription>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['description']>
  ) => {
    state.rewardMessageSettings.description = action.payload
  }

export const selectRewardDescription =
  <TState extends RewardScreenDescription>(state: TState) =>
    state.rewardMessageSettings.description


export interface RewardScreenDescriptionFontSize {
  rewardMessageSettings: { descriptionFontSize: number }
}

export const rewardDescriptionFontSizeReducer =
  <TState extends RewardScreenDescriptionFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontSize']>
  ) => {
    state.rewardMessageSettings.descriptionFontSize = action.payload
  }

export const selectRewardDescriptionFontSize =
  <TState extends RewardScreenDescriptionFontSize>(state: TState) =>
    state.rewardMessageSettings.descriptionFontSize


export interface RewardScreenDescriptionFontWeight {
  rewardMessageSettings: { descriptionFontWeight: FontWeight }
}

export const rewardDescriptionFontWeighReducer =
  <TState extends RewardScreenDescriptionFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontWeight']>
  ) => {
    state.rewardMessageSettings.descriptionFontWeight = action.payload
  }

export const selectRewardDescriptionFontWeight =
  <TState extends RewardScreenDescriptionFontWeight>(state: TState) =>
    state.rewardMessageSettings.descriptionFontWeight


export interface RewardScreenDescriptionFontColor {
  rewardMessageSettings: { descriptionFontColor: string }
}

export const rewardDescriptionFontColorReducer =
  <TState extends RewardScreenDescriptionFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['descriptionFontColor']>
  ) => {
    state.rewardMessageSettings.descriptionFontColor = action.payload
  }

export const selectRewardDescriptionFontColor =
  <TState extends RewardScreenDescriptionFontColor>(state: TState) =>
    state.rewardMessageSettings.descriptionFontColor


export interface RewardScreenDiscount {
  rewardMessageSettings: { discount: string }
}

export const rewardDiscountReducer =
  <TState extends RewardScreenDiscount>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discount']>
  ) => {
    state.rewardMessageSettings.discount = action.payload
  }

export const selectRewardDiscount =
  <TState extends RewardScreenDiscount>(state: TState) =>
    state.rewardMessageSettings.discount


export interface RewardScreenDiscountFontSize {
  rewardMessageSettings: { discountFontSize: number }
}

export const rewardDiscountFontSizeReducer =
  <TState extends RewardScreenDiscountFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontSize']>
  ) => {
    state.rewardMessageSettings.discountFontSize = action.payload
  }

export const selectRewardDiscountFontSize =
  <TState extends RewardScreenDiscountFontSize>(state: TState) =>
    state.rewardMessageSettings.discountFontSize


export interface RewardScreenDiscountFontWeight {
  rewardMessageSettings: { discountFontWeight: FontWeight }
}

export const rewardDiscountFontWeightReducer =
  <TState extends RewardScreenDiscountFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontWeight']>
  ) => {
    state.rewardMessageSettings.discountFontWeight = action.payload
  }

export const selectRewardDiscountFontWeight =
  <TState extends RewardScreenDiscountFontWeight>(state: TState) =>
    state.rewardMessageSettings.discountFontWeight


export interface RewardScreenDiscountFontColor {
  rewardMessageSettings: { discountFontColor: string }
}

export const rewardDiscountFontColorReduer =
  <TState extends RewardScreenDiscountFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['discountFontColor']>
  ) => {
    state.rewardMessageSettings.discountFontColor = action.payload
  }

export const selectRewardDiscountFontColor =
  <TState extends RewardScreenDiscountFontColor>(state: TState) =>
    state.rewardMessageSettings.discountFontColor


export interface RewardScreenPromo {
  rewardMessageSettings: { promo: string }
}

export const rewardPromoReducer =
  <TState extends RewardScreenPromo>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promo']>
  ) => {
    state.rewardMessageSettings.promo = action.payload
  }

export const selectRewardPromo =
  <TState extends RewardScreenPromo>(state: TState) =>
    state.rewardMessageSettings.promo


export interface RewardScreenPromoFontSize {
  rewardMessageSettings: { promoFontSize: number }
}

export const rewardPromoFontSizeReducer =
  <TState extends RewardScreenPromoFontSize>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontSize']>
  ) => {
    state.rewardMessageSettings.promoFontSize = action.payload
  }

export const selectRewardPromoFontSize =
  <TState extends RewardScreenPromoFontSize>(state: TState) =>
    state.rewardMessageSettings.promoFontSize


export interface RewardScreenPromoFontWeight {
  rewardMessageSettings: { promoFontWeight: FontWeight }
}

export const rewardPromoFontWeightReducer =
  <TState extends RewardScreenPromoFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontWeight']>
  ) => {
    state.rewardMessageSettings.promoFontWeight = action.payload
  }

export const selectRewardPromoFontWeight =
  <TState extends RewardScreenPromoFontWeight>(state: TState) =>
    state.rewardMessageSettings.promoFontWeight


export interface RewardScreenPromoFontColor {
  rewardMessageSettings: { promoFontColor: string }
}

export const rewardPromoFontColorReducer =
  <TState extends RewardScreenPromoFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['promoFontColor']>
  ) => {
    state.rewardMessageSettings.promoFontColor = action.payload
  }

export const selectRewardPromoFontColor =
  <TState extends RewardScreenPromoFontColor>(state: TState) =>
    state.rewardMessageSettings.promoFontColor

export interface RewardScreenCustomColorSchemeEnabled {
  rewardMessageSettings: { customColorSchemeEnabled: boolean }
}

export const rewardCustomColorSchemeEnabledReducer =
  <TState extends RewardScreenCustomColorSchemeEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['rewardMessageSettings']['customColorSchemeEnabled']>
  ) => {
    state.rewardMessageSettings.customColorSchemeEnabled = action.payload
  }

export const selectRewardCustomColorSchemeEnabled =
  <TState extends RewardScreenCustomColorSchemeEnabled>(state: TState) =>
    state.rewardMessageSettings.customColorSchemeEnabled


export interface RewardScreenCustomDiscountBackgroundColor {
  rewardMessageSettings: { customDiscountBackgroundColor: string }
}

export const rewardCustomDiscountBackgroundColorReducer =
  <TState extends RewardScreenCustomDiscountBackgroundColor>(
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
  <TState extends RewardScreenCustomDiscountBackgroundColor>(state: TState) =>
    state.rewardMessageSettings.customDiscountBackgroundColor


export interface RewardScreenCustomPromoBackgroundColor {
  rewardMessageSettings: { customPromoBackgroundColor: string }
}

export const rewardCustomPromoBackgroundColorReducer =
  <TState extends RewardScreenCustomPromoBackgroundColor>(
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
  <TState extends RewardScreenCustomPromoBackgroundColor>(state: TState) =>
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
