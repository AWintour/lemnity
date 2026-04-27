import {
  createSlice,
  // type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import {
  // createAppAsyncThunk,
  type FetchStatus,
  type WidgetSettings,
} from '@/stores/redux/store'
import { rootReducer } from '@/stores/redux/reducer'
import {
  fetchWidgetThunkFactory,
  saveWidgetThunkFactory,
} from '@/stores/redux/factories'
import {
  commonReducers,
  commonSelectors,
} from '@/stores/redux/features/common'
import {
  widgetAppearenceReducers,
  widgetAppearenceSelectors,
} from '@/stores/redux/features/widgetAppearence'
import {
  infoScreenContentTypedReducer,
  infoScreenContentAlignmentReducer,
  infoScreenContentUrldReducer,
  infoScreenTitleReducer,
  infoScreenTitleFontWeightReducer,
  infoScreenTitleColorReducer,
  infoScreenDescriptionReducer,
  infoScreenDescriptionColortReducer,
  infoScreenDescriptionFontWeightReducer,
  infoScreenButtonTextReducer,
  infoScreenButtonFontColorReducer,
  infoScreenButtonBackgroundColorReducer,
  infoScreenIconReducer,
  infoScreenLinkReducer,
  selectContentType as selectInfoContentType,
  selectContentAlignment as selectInfoContentAlignment,
  selectContentUrl as selectInfoContentUrl,
  selectTitle as selectInfoTitle,
  selectTitleFontWeight as selectInfoTitleFontWeight,
  selectTitleColor as selectInfoTitleColor,
  selectDescription as selectInfoDescription,
  selectDescriptionColor as selectInfoDescriptionColor,
  selectDescriptionFontWeight as selectInfoDescriptionFontWeight,
  selectButtonText as selectInfoButtonText,
  selectButtonFontColor as selectInfoButtonFontColor,
  selectButtonBackgroundColor as selectInfoButtonBackgroundColor,
  selectIcon as selectInfoIcon,
  selectLink as selectInfoLink,
} from '@/stores/redux/features/infoScreen'
import {
  rewardScreenReducers,
  rewardScreenSelectors,
} from '@/stores/redux/features/rewardScreen'
import {
  mobileSettingsReducers,
  mobileSettingsSelectors,
} from '@/stores/redux/features/mobileTrigger'
import {
  triggerPositionReducer,
  selectTriggerPosition as selectTriggerPositionFeature,
} from '@/stores/redux/features/triggerSettings'

import {
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'
import {
  type AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'

export const fetchAnnouncementWidget = fetchWidgetThunkFactory(
  'announcement/fetchWidget',
  (state) => state.announcement!.fetchStatus
)

// this action will only be dispatched when the store is aleady mounted
// if it's not then we are having a bigger problem
export const saveAnnouncementWidget = saveWidgetThunkFactory(
  'announcement/saveWidget',
  (state) => state.announcement!.widgetId,
  (state) => state.announcement!.type,
  (state): AnnouncementWidgetType => ({
    type:
      state.announcement!.type,
    appearence:
      state.announcement!.appearence,
    infoSettings:
      state.announcement!.infoSettings,
    rewardMessageSettings:
      state.announcement!.rewardMessageSettings,
    mobileSettings:
      state.announcement!.mobileSettings,
    brandingEnabled:
      state.announcement!.brandingEnabled,
    trigger:
      state.announcement!.trigger,
  })
)

type AnnouncementWidgetState = AnnouncementWidgetType & {
  widgetId?: string
  projectId?: string
  fetchStatus: FetchStatus
  fetchError: string | null
}

// should i move this into its own file?
export const initialState: AnnouncementWidgetState = {
  type: WidgetTypeEnum.ANNOUNCEMENT,
  fetchStatus: 'idle',
  fetchError: null,

  appearence: {
    companyLogoEnabled: true,
    companyLogoUrl: undefined,

    colorScheme: 'primary',
    backgroundColor: '#FFC943',
    borderRadius: 15,
  },

  infoSettings: {
    contentType: 'imageOnTop',
    contentAlignment: 'center',
    contentUrl: undefined,

    title: 'Укажите заголовок',
    titleFontWeight: 'medium',
    titleColor: '#000000',
    description: 'Напишите описание к действию или какое-нибудь предложение',
    descriptionFontWeight: 'regular',
    descriptionColor: '#000000',

    buttonText: 'Действие',
    buttonFontColor: '#000000',
    buttonBackgroundColor: '#FFB400',
    icon: 'Reload',
    link: 'https://lemnity.ru',
  },

  rewardMessageSettings: {
    rewardScreenEnabled: true,

    title: 'Ваша скидка:',
    titleFontSize: 40,
    titleFontWeight: 'medium',
    titleFontColor: '#000000',

    description:
      'Не забудьте использовать промокод во время оформления заказа!',
    descriptionFontSize: 16,
    descriptionFontWeight: 'regular',
    descriptionFontColor: '#000000',

    discount: 'Скидка 10%',
    discountFontSize: 20,
    discountFontWeight: 'regular',
    discountFontColor: '#000000',

    promo: 'PROMO-10P',
    promoFontSize: 25,
    promoFontWeight: 'bold',
    promoFontColor: '#FFFFFF',

    customColorSchemeEnabled: false,
    customDiscountBackgroundColor: '#FFF57F',
    customPromoBackgroundColor: '#0F3095',
  },

  mobileSettings: {
    mobileEnabled: true,
    triggerType: 'button',
    triggerText: 'Подарок для вас',
    triggerBackgroundColor: '#FFB34F',
    triggerFontColor: '#000000',
    imageUrl: 'https://app.lemnity.ru/uploads/images/2026/01/57534833-dc83-4a33-9108-79c952ca1940-sparkles.svg',
  },

  brandingEnabled: true,

  trigger: {
    triggerPosition: 'bottom-right',
  },
}

// i cannot both import these names and export them form the injected slice's
// actions so here's some boilerplate >w<
// i also am not sure that i should export it like this from the feature file
// like i have done with commonReducers since the currrent wisgets using
// this feature require a unique subset of all the exports
const infoScreenReducers = {
  contentTypeChanged:
    infoScreenContentTypedReducer,
  contentAlignmentChanged:
    infoScreenContentAlignmentReducer,
  contentUrlChanged:
    infoScreenContentUrldReducer,
  titleChanged:
    infoScreenTitleReducer,
  titleFontWeightChanged:
    infoScreenTitleFontWeightReducer,
  titleColorChanged:
    infoScreenTitleColorReducer,
  descriptionChanged:
    infoScreenDescriptionReducer,
  descriptionColorChanged:
    infoScreenDescriptionColortReducer,
  descriptionFontWeightChanged:
    infoScreenDescriptionFontWeightReducer,
  buttonTextChanged:
    infoScreenButtonTextReducer,
  buttonFontColorChanged:
    infoScreenButtonFontColorReducer,
  buttonBackgroundColorChanged:
    infoScreenButtonBackgroundColorReducer,
  iconChanged:
    infoScreenIconReducer,
  linkChanged:
    infoScreenLinkReducer,
}

const infoScreenSelectors = {
  selectContentType:
    selectInfoContentType,
  selectContentAlignment:
    selectInfoContentAlignment,
  selectContentUrl:
    selectInfoContentUrl,
  selectTitle:
    selectInfoTitle,
  selectTitleFontWeight:
    selectInfoTitleFontWeight,
  selectTitleColor:
    selectInfoTitleColor,
  selectDescription:
    selectInfoDescription,
  selectDescriptionColor:
    selectInfoDescriptionColor,
  selectDescriptionFontWeight:
    selectInfoDescriptionFontWeight,
  selectButtonText:
    selectInfoButtonText,
  selectButtonFontColor:
    selectInfoButtonFontColor,
  selectButtonBackgroundColor:
    selectInfoButtonBackgroundColor,
  selectIcon:
    selectInfoIcon,
  selectLink:
    selectInfoLink,
}

export const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    ...commonReducers,
    ...widgetAppearenceReducers,
    ...infoScreenReducers,
    ...rewardScreenReducers,
    ...mobileSettingsReducers,
    
    triggerPositionChanged:
      triggerPositionReducer,

    colorsReset: (state) => {
      state.appearence.backgroundColor =
        initialState.appearence.backgroundColor
      state.infoSettings.titleColor =
        initialState.infoSettings.titleColor
      state.infoSettings.descriptionColor =
        initialState.infoSettings.descriptionColor
      state.infoSettings.buttonFontColor =
        initialState.infoSettings.buttonFontColor
      state.infoSettings.buttonBackgroundColor =
        initialState.infoSettings.buttonBackgroundColor
      state.rewardMessageSettings.titleFontColor =
        initialState.rewardMessageSettings.titleFontColor
      state.rewardMessageSettings.descriptionFontColor =
        initialState.rewardMessageSettings.descriptionFontColor
      state.rewardMessageSettings.discountFontColor =
        initialState.rewardMessageSettings.discountFontColor
      state.rewardMessageSettings.promoFontColor =
        initialState.rewardMessageSettings.promoFontColor
      state.rewardMessageSettings.customDiscountBackgroundColor =
        initialState.rewardMessageSettings.customDiscountBackgroundColor
      state.rewardMessageSettings.customPromoBackgroundColor =
        initialState.rewardMessageSettings.customPromoBackgroundColor
      state.mobileSettings.triggerBackgroundColor =
        initialState.mobileSettings.triggerBackgroundColor
      state.mobileSettings.triggerFontColor =
        initialState.mobileSettings.triggerFontColor
    },
  },
  selectors: {
    ...commonSelectors,
    ...widgetAppearenceSelectors,
    ...infoScreenSelectors,
    ...rewardScreenSelectors,
    ...mobileSettingsSelectors,

    selectTriggerPosition:
      selectTriggerPositionFeature,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncementWidget.pending, (state) => {
        state.fetchStatus = 'pending'
      })
      .addCase(fetchAnnouncementWidget.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.fetchError = null

        const payload = action.payload as PublicWidget | undefined

        state.widgetId = payload?.id
        state.projectId = payload?.projectId

        const widgetConfig = payload?.config as WidgetSettings | undefined
        const widgetSettings = widgetConfig?.widget

        // copy default state if undefined
        const settings = widgetSettings || { ...initialState }
        
        const {
          appearence,
          infoSettings,
          rewardMessageSettings,
          mobileSettings,
          brandingEnabled,
          trigger,
        } = settings as AnnouncementWidgetType

        state.appearence = appearence
        state.infoSettings = infoSettings
        state.rewardMessageSettings = rewardMessageSettings
        state.mobileSettings = mobileSettings
        state.brandingEnabled = brandingEnabled
        state.trigger = trigger
          ?? initialState.trigger
      })
      .addCase(fetchAnnouncementWidget.rejected, (state, action) => {
        state.fetchStatus = 'rejected'
        state.fetchError = action.error.message
          || 'Не удалось загрузить виджет'
      })
  }
})

export const {
  companyLogoEnabledChanged,
  companyLogoUrlChanged,
  colorSchemeChanged,
  backgroundColorChanged,
  borderRadiusChanged,

  contentTypeChanged,
  contentAlignmentChanged,
  contentUrlChanged,
  titleChanged,
  titleFontWeightChanged,
  titleColorChanged,
  descriptionChanged,
  descriptionFontWeightChanged,
  descriptionColorChanged,
  buttonTextChanged,
  buttonFontColorChanged,
  buttonBackgroundColorChanged,
  iconChanged,
  linkChanged,

  rewardScreenEnabledChanged,
  rewardTitleChanged,
  rewardTitleFontSizeChanged,
  rewardTitleFontWeightChanged,
  rewardTitleFontColorChanged,
  rewardDescriptionChanged,
  rewardDescriptionFontSizeChanged,
  rewardDescriptionFontWeightChanged,
  rewardDescriptionFontColorChanged,
  rewardDiscountChanged,
  rewardDiscountFontSizeChanged,
  rewardDiscountFontWeightChanged,
  rewardDiscountFontColorChanged,
  rewardPromoChanged,
  rewardPromoFontSizeChanged,
  rewardPromoFontWeightChanged,
  rewardPromoFontColorChanged,
  rewardCustomColorSchemeEnabledChanged,
  rewardCustomDiscountBackgroundColorChanged,
  rewardCustomPromoBackgroundColorChanged,

  mobileEnabledChanged,
  mobileTriggerTypeChanged,
  mobileTriggerTextChanged,
  mobileTriggerBackgroundColorChanged,
  mobileTriggerFontColorChanged,
  mobileImageUrlChanged,

  colorsReset,
  brandingEnabledChanged,
  triggerPositionChanged,
} = announcementSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof announcementSlice> {}
}

const injectedAnnouncementSlice = announcementSlice.injectInto(rootReducer)

export const {
  selectWidgetId,
  selectProjectId,
  selectFetchStatus,
  selectFetchError,
  selectBrandingEnabled,

  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,

  selectContentType,
  selectContentAlignment,
  selectContentUrl,
  selectTitle,
  selectTitleFontWeight,
  selectTitleColor,
  selectDescription,
  selectDescriptionFontWeight,
  selectDescriptionColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,

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

  selectMobileEnabled,
  selectMobileTriggerType,
  selectMobileTriggerText,
  selectMobileTriggerBackgroundColor,
  selectMobileTriggerFontColor,
  selectMobileImageUrl,

  selectWidgetType,
  selectTriggerPosition,
} = injectedAnnouncementSlice.selectors

export default injectedAnnouncementSlice.reducer
