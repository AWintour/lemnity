import type { PayloadAction } from '@reduxjs/toolkit'
import type {
  Content,
  ContentAlignment,
  FontWeight,
} from '@lemnity/widget-config/widgets/announcement'
import type { Icon } from '@lemnity/widget-config/widgets/base'

export interface IInfoScreenContentEnabled {
  infoSettings: { contentEnabled: boolean }
}

export const infoScreenContentEnabledReducer =
  <TState extends IInfoScreenContentEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['contentEnabled']>
  ) => {
    state.infoSettings.contentEnabled = action.payload
  }

export const selectContentEnabled =
  <TState extends IInfoScreenContentEnabled>(state: TState) =>
    state.infoSettings.contentEnabled


export interface IInfoScreenContentType {
  infoSettings: { contentType: Content }
}

export const infoScreenContentTypedReducer =
  <TState extends IInfoScreenContentType>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['contentType']>
  ) => {
    state.infoSettings.contentType = action.payload
  }

export const selectContentType =
  <TState extends IInfoScreenContentType>(state: TState) =>
    state.infoSettings.contentType


export interface IInfoScreenContentAlignment {
  infoSettings: { contentAlignment: ContentAlignment }
}

export const infoScreenContentAlignmentReducer =
  <TState extends IInfoScreenContentAlignment>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['contentAlignment']>
  ) => {
    state.infoSettings.contentAlignment = action.payload
  }

export const selectContentAlignment =
  <TState extends IInfoScreenContentAlignment>(state: TState) =>
    state.infoSettings.contentAlignment


export interface IInfoScreenContentUrl {
  infoSettings: { contentUrl?: string }
}

export const infoScreenContentUrldReducer =
  <TState extends IInfoScreenContentUrl>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['contentUrl']>
  ) => {
    state.infoSettings.contentUrl = action.payload
  }

export const selectContentUrl =
  <TState extends IInfoScreenContentUrl>(state: TState) =>
    state.infoSettings.contentUrl


export interface IInfoScreenTitle {
  infoSettings: { title: string }
}

export const infoScreenTitleReducer =
  <TState extends IInfoScreenTitle>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['title']>
  ) => {
    state.infoSettings.title = action.payload
  }

export const selectTitle =
  <TState extends IInfoScreenTitle>(state: TState) =>
    state.infoSettings.title


export interface IInfoScreenTitleFontWeight {
  infoSettings: { titleFontWeight: FontWeight }
}

export const infoScreenTitleFontWeightReducer =
  <TState extends IInfoScreenTitleFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['titleFontWeight']>
  ) => {
    state.infoSettings.titleFontWeight = action.payload
  }

export const selectTitleFontWeight =
  <TState extends IInfoScreenTitleFontWeight>(state: TState) =>
    state.infoSettings.titleFontWeight


export interface IInfoScreenTitleColor {
  infoSettings: { titleColor: string }
}

export const infoScreenTitleColorReducer =
  <TState extends IInfoScreenTitleColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['titleColor']>
  ) => {
    state.infoSettings.titleColor = action.payload
  }

export const selectTitleColor =
  <TState extends IInfoScreenTitleColor>(state: TState) =>
    state.infoSettings.titleColor


export interface IInfoScreenDescription {
  infoSettings: { description: string }
}

export const infoScreenDescriptionReducer =
  <TState extends IInfoScreenDescription>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['description']>
  ) => {
    state.infoSettings.description = action.payload
  }

export const selectDescription =
  <TState extends IInfoScreenDescription>(state: TState) =>
    state.infoSettings.description


export interface IInfoScreenDescriptionFontWeight {
  infoSettings: { descriptionFontWeight: FontWeight }
}

export const infoScreenDescriptionFontWeightReducer =
  <TState extends IInfoScreenDescriptionFontWeight>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['descriptionFontWeight']>
  ) => {
    state.infoSettings.descriptionFontWeight = action.payload
  }

export const selectDescriptionFontWeight =
  <TState extends IInfoScreenDescriptionFontWeight>(state: TState) =>
    state.infoSettings.descriptionFontWeight


export interface IInfoScreenDescriptionColor {
  infoSettings: { descriptionColor: string }
}

export const infoScreenDescriptionColortReducer =
  <TState extends IInfoScreenDescriptionColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['descriptionColor']>
  ) => {
    state.infoSettings.descriptionColor = action.payload
  }

export const selectDescriptionColor =
  <TState extends IInfoScreenDescriptionColor>(state: TState) =>
    state.infoSettings.descriptionColor


export interface IInfoScreenCountdownEnabled {
  infoSettings: { countdownEnabled: boolean }
}

export const infoScreenCountdownEnabledtReducer =
  <TState extends IInfoScreenCountdownEnabled>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['countdownEnabled']>
  ) => {
    state.infoSettings.countdownEnabled = action.payload
  }

export const selectCountdownEnabled =
  <TState extends IInfoScreenCountdownEnabled>(state: TState) =>
    state.infoSettings.countdownEnabled


export interface IInfoScreenCountdownDate {
  infoSettings: { countdownDate: string }
}

export const infoScreenCountdownDateReducer =
  <TState extends IInfoScreenCountdownDate>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['countdownDate']>
  ) => {
    state.infoSettings.countdownDate = action.payload
  }

export const selectCountdownDate =
  <TState extends IInfoScreenCountdownDate>(state: TState) =>
    state.infoSettings.countdownDate


export interface IInfoScreenCountdownBackgroundColor {
  infoSettings: { countdownBackgroundColor: string }
}

export const infoScreenCountdownBackgroundColorReducer =
  <TState extends IInfoScreenCountdownBackgroundColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['countdownBackgroundColor']>
  ) => {
    state.infoSettings.countdownBackgroundColor = action.payload
  }

export const selectCountdownBackgroundColor =
  <TState extends IInfoScreenCountdownBackgroundColor>(state: TState) =>
    state.infoSettings.countdownBackgroundColor


export interface IInfoScreenCountdownFontColor {
  infoSettings: { countdownFontColor: string }
}

export const infoScreenCountdownFontColorReducer =
  <TState extends IInfoScreenCountdownFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['countdownFontColor']>
  ) => {
    state.infoSettings.countdownFontColor = action.payload
  }

export const selectCountdownFontColor =
  <TState extends IInfoScreenCountdownFontColor>(state: TState) =>
    state.infoSettings.countdownFontColor


export interface IInfoScreenButtonText {
  infoSettings: { buttonText: string }
}

export const infoScreenButtonTextReducer =
  <TState extends IInfoScreenButtonText>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['buttonText']>
  ) => {
    state.infoSettings.buttonText = action.payload
  }

export const selectButtonText =
  <TState extends IInfoScreenButtonText>(state: TState) =>
    state.infoSettings.buttonText


export interface IInfoScreenButtonFontColor {
  infoSettings: { buttonFontColor: string }
}

export const infoScreenButtonFontColorReducer =
  <TState extends IInfoScreenButtonFontColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['buttonFontColor']>
  ) => {
    state.infoSettings.buttonFontColor = action.payload
  }

export const selectButtonFontColor =
  <TState extends IInfoScreenButtonFontColor>(state: TState) =>
    state.infoSettings.buttonFontColor


export interface IInfoScreenButtonBackgoundColor {
  infoSettings: { buttonBackgroundColor: string }
}

export const infoScreenButtonBackgroundColorReducer =
  <TState extends IInfoScreenButtonBackgoundColor>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['buttonBackgroundColor']>
  ) => {
    state.infoSettings.buttonBackgroundColor = action.payload
  }

export const selectButtonBackgroundColor =
  <TState extends IInfoScreenButtonBackgoundColor>(state: TState) =>
    state.infoSettings.buttonBackgroundColor


export interface IInfoScreenIcon {
  infoSettings: { icon: Icon }
}

export const infoScreenIconReducer =
  <TState extends IInfoScreenIcon>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['icon']>
  ) => {
    state.infoSettings.icon = action.payload
  }

export const selectIcon =
  <TState extends IInfoScreenIcon>(state: TState) =>
    state.infoSettings.icon


export interface IInfoScreenLink {
  infoSettings: { link: string }
}

export const infoScreenLinkReducer =
  <TState extends IInfoScreenLink>(
    state:
      TState,
    action:
      PayloadAction<TState['infoSettings']['link']>
  ) => {
    state.infoSettings.link = action.payload
  }

export const selectLink =
  <TState extends IInfoScreenLink>(state: TState) =>
    state.infoSettings.link