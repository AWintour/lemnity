import {
  createSlice,
  // type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import {
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
  infoScreenContentEnabledReducer,
  infoScreenContentUrldReducer,
  infoScreenTitleReducer,
  infoScreenTitleFontWeightReducer,
  infoScreenTitleColorReducer,
  infoScreenDescriptionReducer,
  infoScreenDescriptionColortReducer,
  infoScreenDescriptionFontWeightReducer,
  infoScreenCountdownEnabledtReducer,
  infoScreenCountdownDateReducer,
  infoScreenCountdownBackgroundColorReducer,
  infoScreenCountdownFontColorReducer,
  infoScreenButtonTextReducer,
  infoScreenButtonFontColorReducer,
  infoScreenButtonBackgroundColorReducer,
  infoScreenIconReducer,
  infoScreenLinkReducer,
  selectContentEnabled as selectInfoContentEnabled,
  selectContentUrl as selectInfoContentUrl,
  selectTitle as selectInfoTitle,
  selectTitleFontWeight as selectInfoTitleFontWeight,
  selectTitleColor as selectInfoTitleColor,
  selectDescription as selectInfoDescription,
  selectDescriptionColor as selectInfoDescriptionColor,
  selectDescriptionFontWeight as selectInfoDescriptionFontWeight,
  selectCountdownEnabled as selectInfoCountdownEnabled,
  selectCountdownDate as selectInfoCountdownDate,
  selectCountdownBackgroundColor as selectInfoCountdownBackgroundColor,
  selectCountdownFontColor as selectInfoCountdownFontColor,
  selectButtonText as selectInfoButtonText,
  selectButtonFontColor as selectInfoButtonFontColor,
  selectButtonBackgroundColor as selectInfoButtonBackgroundColor,
  selectIcon as selectInfoIcon,
  selectLink as selectInfoLink,
} from '@/stores/redux/features/infoScreen'
import {
  formScreenReducers,
  formScreenSelectors,
} from '@/stores/redux/features/formScreen'
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
  type EventTimerWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'

export const fetchEventTimerWidget = fetchWidgetThunkFactory(
  'eventTimer/fetchWidget',
  (state) => state.eventTimer!.fetchStatus
)

// this action will only be dispatched when the store is aleady mounted
// if it's not then we are having a bigger problem
export const saveEventTimerWidget = saveWidgetThunkFactory(
  'eventTimer/saveWidget',
  (state) => state.eventTimer!.widgetId,
  (state) => state.eventTimer!.type,
  (state): EventTimerWidgetType => ({
    type:
      state.eventTimer!.type,
    appearence:
      state.eventTimer!.appearence,
    infoSettings:
      state.eventTimer!.infoSettings,
    formSettings:
      state.eventTimer!.formSettings,
    rewardMessageSettings:
      state.eventTimer!.rewardMessageSettings,
    mobileSettings:
      state.eventTimer!.mobileSettings,
    brandingEnabled:
      state.eventTimer!.brandingEnabled,
    trigger:
      state.eventTimer!.trigger,
  })
)

type EventTimerWidgetState = EventTimerWidgetType & {
  widgetId?: string
  projectId?: string
  fetchStatus: FetchStatus
  fetchError: string | null
}

export const initialState: EventTimerWidgetState = {
  type: WidgetTypeEnum.EVENT_TIMER,
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
    contentEnabled: false,
    contentUrl: undefined,

    title: 'Укажите заголовок',
    titleFontWeight: 'medium',
    titleColor: '#000000',
    description: 'Напишите описание к действию или какое нибудь предложение',
    descriptionFontWeight: 'regular',
    descriptionColor: '#000000',

    countdownDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    countdownEnabled: true,
    countdownBackgroundColor: '#FFFFFF',
    countdownFontColor: '#000000',

    buttonText: 'Действие',
    buttonFontColor: '#000000',
    buttonBackgroundColor: '#FFB400',
    icon: 'Reload',
    link: 'https://lemnity.ru',
  },
  formSettings: {
    title: 'Получите скидку',
    titleFontWeight: 'medium',
    titleFontColor: '#000000',
    description: 'Укажите свой email и получите купон, который можно использовать при покупке',
    descriptionFontWeight: 'regular',
    descriptionFontColor: '#000000',

    contactAcquisitionEnabled: true,
    nameFieldEnabled: true,
    nameFieldRequired: false,
    emailFieldEnabled: true,
    emailFieldRequired: true,
    phoneFieldEnabled: false,
    phoneFieldRequired: false,

    agreement: {
      enabled: true,
      policyUrl: 'lemnity.ru/political',
      agreementUrl: 'lemnity.ru/agreement',
      color: '#000000'
    },

    adsInfo: {
      enabled: true,
      policyUrl: 'lemnity.ru/ads',
      color: '#000000'
    }
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
  contentEnabledChanged:
    infoScreenContentEnabledReducer,
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
  countdownEnabledChanged:
    infoScreenCountdownEnabledtReducer,
  countdownDateChanged:
    infoScreenCountdownDateReducer,
  countdownBackgroundColorChanged:
    infoScreenCountdownBackgroundColorReducer,
  countdownFontColorChanged:
    infoScreenCountdownFontColorReducer,
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
  selectContentEnabled:
    selectInfoContentEnabled,
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
  selectCountdownEnabled:
    selectInfoCountdownEnabled,
  selectCountdownDate:
    selectInfoCountdownDate,
  selectCountdownBackgroundColor:
    selectInfoCountdownBackgroundColor,
  selectCountdownFontColor:
    selectInfoCountdownFontColor,
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

export const eventTimerSlice = createSlice({
  name: 'eventTimer',
  initialState,
  reducers: {
    ...commonReducers,
    ...widgetAppearenceReducers,
    ...infoScreenReducers,
    ...formScreenReducers,
    ...rewardScreenReducers,
    ...mobileSettingsReducers,
    
    triggerPositionChanged:
      triggerPositionReducer,
    
    colorsReset:
      (state) => {
        state.appearence.backgroundColor =
          initialState.appearence.backgroundColor
        state.infoSettings.titleColor =
          initialState.infoSettings.titleColor
        state.infoSettings.descriptionColor =
          initialState.infoSettings.descriptionColor
        state.infoSettings.countdownBackgroundColor =
          initialState.infoSettings.countdownBackgroundColor
        state.infoSettings.countdownFontColor =
          initialState.infoSettings.countdownFontColor
        state.infoSettings.buttonFontColor =
          initialState.infoSettings.buttonFontColor
        state.infoSettings.buttonBackgroundColor =
          initialState.infoSettings.buttonBackgroundColor
        state.formSettings.titleFontColor =
          initialState.formSettings.titleFontColor
        state.formSettings.descriptionFontColor =
          initialState.formSettings.descriptionFontColor
        state.formSettings.agreement.color =
          initialState.formSettings.agreement.color
        state.formSettings.adsInfo.color =
          initialState.formSettings.adsInfo.color
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
  extraReducers: (builder) => {
    builder.addCase(fetchEventTimerWidget.pending, (state) => {
      state.fetchStatus = 'pending'
    })
    builder.addCase(fetchEventTimerWidget.fulfilled, (state, action) => {
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
        formSettings,
        rewardMessageSettings,
        mobileSettings,
        brandingEnabled,
        trigger,
      } = settings as EventTimerWidgetType

      state.appearence = appearence
      state.infoSettings = infoSettings
      state.formSettings = formSettings
      state.rewardMessageSettings = rewardMessageSettings
      state.mobileSettings = mobileSettings
      state.brandingEnabled = brandingEnabled
      state.trigger = trigger
        ?? initialState.trigger
    })
    .addCase(fetchEventTimerWidget.rejected, (state, action) => {
      state.fetchStatus = 'rejected'
      state.fetchError = action.error.message
        || 'Не удалось загрузить виджет'
    })
  },
  selectors: {
    ...commonSelectors,
    ...widgetAppearenceSelectors,
    ...infoScreenSelectors,
    ...formScreenSelectors,
    ...rewardScreenSelectors,
    ...mobileSettingsSelectors,

    selectTriggerPosition:
      selectTriggerPositionFeature,
  },
})

export const {
  companyLogoEnabledChanged,
  companyLogoUrlChanged,
  colorSchemeChanged,
  backgroundColorChanged,
  borderRadiusChanged,
  contentEnabledChanged,
  contentUrlChanged,
  titleChanged,
  titleFontWeightChanged,
  titleColorChanged,
  descriptionChanged,
  descriptionFontWeightChanged,
  descriptionColorChanged,
  countdownEnabledChanged,
  countdownDateChanged,
  countdownBackgroundColorChanged,
  countdownFontColorChanged,
  buttonTextChanged,
  buttonFontColorChanged,
  buttonBackgroundColorChanged,
  iconChanged,
  linkChanged,
  formTitleChanged,
  formTitleFontWeightChanged,
  formTitleFontColorChanged,
  formDescriptionChanged,
  formDescriptionFontWeightChanged,
  formDescriptionFontColorChanged,
  formContactAcquisitionEnabledChanged,
  formNameFieldEnabledChanged,
  formNameFieldRequiredChanged,
  formEmailFieldEnabledChanged,
  formEmailFieldRequiredChanged,
  formPhoneFieldEnabledChanged,
  formPhoneFieldRequiredChanged,
  formAgreementEnabledChanged,
  formAgreementPolicyURLChanged,
  formAgreementURLChanged,
  formAgreementColorChanged,
  formAdsInfoEnabledChanged,
  formAdsInfoPolicyURLChanged,
  formAdsInfoColorChanged,
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
  brandingEnabledChanged,
  colorsReset,
  triggerPositionChanged,
} = eventTimerSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof eventTimerSlice> {}
}

const injectedEventTimerSlice = eventTimerSlice.injectInto(rootReducer)

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
  selectContentEnabled,
  selectContentUrl,
  selectTitle,
  selectTitleFontWeight,
  selectTitleColor,
  selectDescription,
  selectDescriptionFontWeight,
  selectDescriptionColor,
  selectCountdownEnabled,
  selectCountdownDate,
  selectCountdownBackgroundColor,
  selectCountdownFontColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,
  selectFormTitle,
  selectFormTitleFontWeight,
  selectFormTitleFontColor,
  selectFormDescription,
  selectFormDescriptionFontWeight,
  selectFormDescriptionFontColor,
  selectFormContactAcquisitionEnabled,
  selectFormNameFieldEnabled,
  selectFormNameFieldRequired,
  selectFormEmailFieldEnabled,
  selectFormEmailFieldRequired,
  selectFormPhoneFieldEnabled,
  selectFormPhoneFieldRequired,
  selectFormAgreementEnabled,
  selectFormAgreementPolicyUrl,
  selectFormAgreement,
  selectFormAdsInfo,
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
  selectTriggerPosition,
} = injectedEventTimerSlice.selectors

export default injectedEventTimerSlice.reducer
