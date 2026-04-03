// i should figure out how to reuse reduces and selectors
// (and memoization in lazy loaded slices)
import {
  createSlice,
  type PayloadAction,
  type WithSlice,
} from '@reduxjs/toolkit'

import {
  createAppAsyncThunk,
  type FetchStatus,
  type WidgetSettings,
} from '@/stores/redux/store'
import { rootReducer } from '@/stores/redux/reducer'
import { getWidget } from '@/services/widgets'

import { WidgetTypeEnum, type PublicWidget } from '@lemnity/api-sdk'
import type { ColorScheme, Icon } from '@lemnity/widget-config/widgets/base'
import {
  type EventTimerWidgetType,
  type FontWeight,
  type MobileTrigger,
} from '@lemnity/widget-config/widgets/event-timer'

export const fetchEventTimerWidget = createAppAsyncThunk(
  'eventTimer/fetchWidget',
  async (widgetId: string) => {
    const widget = await getWidget(widgetId)
    return widget
  },
  {
    condition(_, thunkApi) {
      const fetchStatus = selectFetchStatus(thunkApi.getState())
      if (fetchStatus === 'pending' || fetchStatus === 'succeeded') {
        return false
      }
    }
  }
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
}

export const eventTimerSlice = createSlice({
  name: 'eventTimer',
  initialState,
  reducers: {
    companyLogoEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.appearence.companyLogoEnabled = action.payload
      },
    companyLogoUrlChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.appearence.companyLogoUrl = action.payload
      },
    colorSchemeChanged:
      (state, action: PayloadAction<ColorScheme>) => {
        state.appearence.colorScheme = action.payload
      },
    backgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.appearence.backgroundColor = action.payload
      },
    borderRadiusChanged:
      (state, action: PayloadAction<number>) => {
        state.appearence.borderRadius = action.payload
      },

    contentEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.infoSettings.contentEnabled = action.payload
      },
    contentUrlChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.infoSettings.contentUrl = action.payload
      },
    titleChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.title = action.payload
      },
    titleFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.infoSettings.titleFontWeight = action.payload
      },
    titleColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.titleColor = action.payload
      },
    descriptionChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.description = action.payload
      },
    descriptionFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.infoSettings.descriptionFontWeight = action.payload
      },
    descriptionColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.descriptionColor = action.payload
      },
    
    countdownEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.infoSettings.countdownEnabled = action.payload
      },
    countdownDateChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.countdownDate = action.payload
      },
    countdownBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.countdownBackgroundColor = action.payload
      },
    countdownFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.countdownFontColor = action.payload
      },
    
    buttonTextChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.buttonText = action.payload
      },
    buttonFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.buttonFontColor = action.payload
      },
    buttonBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.buttonBackgroundColor = action.payload
      },
    iconChanged:
      (state, action: PayloadAction<Icon>) => {
        state.infoSettings.icon = action.payload
      },
    linkChanged:
      (state, action: PayloadAction<string>) => {
        state.infoSettings.link = action.payload
      },
    
    forrmTitleChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.title = action.payload
      },
    formTitleFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.formSettings.titleFontWeight = action.payload
      },
    formTitleFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.titleFontColor = action.payload
      },
    formDescriptionChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.description = action.payload
      },
    formDescriptionFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.formSettings.descriptionFontWeight = action.payload
      },
    formDescriptionFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.descriptionFontColor = action.payload
      },
    formContactacquisitionEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.contactAcquisitionEnabled = action.payload
      },
    formNameFieldEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.nameFieldEnabled = action.payload
      },
    formNameFieldRequiredChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.nameFieldRequired = action.payload
      },
    formEmailFieldEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.emailFieldEnabled = action.payload
      },
    formEmailFieldRequiredChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.emailFieldRequired = action.payload
      },
    formPhoneFieldEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.phoneFieldEnabled = action.payload
      },
    formPhoneFieldRequiredChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.phoneFieldRequired = action.payload
      },
    
    formAgreementEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.agreement.enabled = action.payload
      },
    formAgreementPolicyURLChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.agreement.policyUrl = action.payload
      },
    formAgreementURLChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.agreement.agreementUrl = action.payload
      },
    formAgreementColorChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.agreement.color = action.payload
      },
    formAdsInfoEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formSettings.adsInfo.enabled = action.payload
      },
    formAdsInfoPolicyURLChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.adsInfo.policyUrl = action.payload
      },
    formAdsInfoColorChanged:
      (state, action: PayloadAction<string>) => {
        state.formSettings.adsInfo.color = action.payload
      },

    rewardScreenEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.rewardMessageSettings.rewardScreenEnabled = action.payload
      },
    rewardTitleChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.title = action.payload
      },
    rewardTitleFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.rewardMessageSettings.titleFontSize = action.payload
      },
    rewardTitleFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.rewardMessageSettings.titleFontWeight = action.payload
      },
    rewardTitleFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.titleFontColor = action.payload
      },
    rewardDescriptionChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.description = action.payload
      },
    rewardDescriptionFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.rewardMessageSettings.descriptionFontSize = action.payload
      },
    rewardDescriptionFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.rewardMessageSettings.descriptionFontWeight = action.payload
      },
    rewardDescriptionFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.descriptionFontColor = action.payload
      },
    rewardDiscountChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.discount = action.payload
      },
    rewardDiscountFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.rewardMessageSettings.discountFontSize = action.payload
      },
    rewardDiscountFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.rewardMessageSettings.discountFontWeight = action.payload
      },
    rewardDiscountFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.discountFontColor = action.payload
      },
    rewardPromoChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.promo = action.payload
      },
    rewardPromoFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.rewardMessageSettings.promoFontSize = action.payload
      },
    rewardPromoFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.rewardMessageSettings.promoFontWeight = action.payload
      },
    rewardPromoFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.promoFontColor = action.payload
      },
    rewardCustomColorSchemeEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.rewardMessageSettings.customColorSchemeEnabled = action.payload
      },
    rewardCustomDiscountBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.customDiscountBackgroundColor =
          action.payload
      },
    rewardCustomPromoBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.rewardMessageSettings.customPromoBackgroundColor = action.payload
      },
    brandingEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.brandingEnabled = action.payload
      },

    mobileEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.mobileSettings.mobileEnabled = action.payload
      },
    mobileTriggerTypeChanged:
      (state, action: PayloadAction<MobileTrigger>) => {
        state.mobileSettings.triggerType = action.payload
      },
    mobileTriggerTextChanged:
      (state, action: PayloadAction<string>) => {
        state.mobileSettings.triggerText = action.payload
      },
    mobileTriggerBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.mobileSettings.triggerBackgroundColor = action.payload
      },
    mobileTriggerFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.mobileSettings.triggerFontColor = action.payload
      },
    mobileImageUrlChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.mobileSettings.imageUrl = action.payload
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
      } = settings as EventTimerWidgetType

      state.appearence = appearence
      state.infoSettings = infoSettings
      state.formSettings = formSettings
      state.rewardMessageSettings = rewardMessageSettings
      state.mobileSettings = mobileSettings
      state.brandingEnabled = brandingEnabled
    })
    .addCase(fetchEventTimerWidget.rejected, (state, action) => {
      state.fetchStatus = 'rejected'
      state.fetchError = action.error.message
        || 'Не удалось загрузить виджет'
    })
  },
  selectors: {
    selectWidgetId:
      (state) => state.widgetId,
    selectProjectId:
      (state) => state.projectId,
    selectFetchStatus:
      (state) => state.fetchStatus,
    selectFetchError:
      (state) => state.fetchError,
    selectBrandingEnabled:
      (state) => state.brandingEnabled,

    selectCompanyLogoEnabled:
      (state) => state.appearence.companyLogoEnabled,
    selectCompanyLogoUrl:
      (state) => state.appearence.companyLogoUrl,
    selectColorScheme:
      (state) => state.appearence.colorScheme,
    selectBackgroundColor:
      (state) => state.appearence.backgroundColor,
    selectBorderRadius:
      (state) => state.appearence.borderRadius,

    selectContentEnabled:
      (state) => state.infoSettings.contentEnabled,
    selectContentUrl:
      (state) => state.infoSettings.contentUrl,
    selectTitle:
      (state) => state.infoSettings.title,
    selectTitleFontWeight:
      (state) => state.infoSettings.titleFontWeight,
    selectTitleColor:
      (state) => state.infoSettings.titleColor,
    selectDescription:
      (state) => state.infoSettings.description,
    selectDescriptionFontWeight:
      (state) => state.infoSettings.descriptionFontWeight,
    selectDescriptionColor:
      (state) => state.infoSettings.descriptionColor,
    selectCountdownEnabled:
      (state) => state.infoSettings.countdownEnabled,
    selectCountdownDate:
      (state) => state.infoSettings.countdownDate,
    selectCountdownBackgroundColor:
      (state) => state.infoSettings.countdownBackgroundColor,
    selectCountdownFontColor:
      (state) => state.infoSettings.countdownFontColor,
    selectButtonText:
      (state) => state.infoSettings.buttonText,
    selectButtonFontColor:
      (state) => state.infoSettings.buttonFontColor,
    selectButtonBackgroundColor:
      (state) => state.infoSettings.buttonBackgroundColor,
    selectIcon:
      (state) => state.infoSettings.icon,
    selectLink:
      (state) => state.infoSettings.link,

    selectFormTitle:
      (state) => state.formSettings.title,
    selectFormTitleFontWeight:
      (state) => state.formSettings.titleFontWeight,
    selectFormTitleFontColor:
      (state) => state.formSettings.titleFontColor,
    selectFormDescription:
      (state) => state.formSettings.description,
    selectFormDescriptionFontWeight:
      (state) => state.formSettings.descriptionFontWeight,
    selectFormDescriptionFontColor:
      (state) => state.formSettings.descriptionFontColor,
    
    selectFormContactAcquisitionEnabled:
      (state) => state.formSettings.contactAcquisitionEnabled,
    selectFormNameFieldEnabled:
      (state) => state.formSettings.nameFieldEnabled,
    selectFormNameFieldRequired:
      (state) => state.formSettings.nameFieldRequired,
    selectFormEmailFieldEnabled:
      (state) => state.formSettings.emailFieldEnabled,
    selectFormEmailFieldRequired:
      (state) => state.formSettings.emailFieldRequired,
    selectFormPhoneFieldEnabled:
      (state) => state.formSettings.phoneFieldEnabled,
    selectFormPhoneFieldRequired:
      (state) => state.formSettings.phoneFieldRequired,
    selectFormAgreementEnabled:
      (state) => state.formSettings.agreement.enabled,
    selectFormAgreementPolicyUrl:
      (state) => state.formSettings.agreement.policyUrl,

    selectFormAgreement:
      (state) => state.formSettings.agreement,
    selectFormAdsInfo:
      (state) => state.formSettings.adsInfo,
    
    selectRewardScreenEnabled:
      (state) => state.rewardMessageSettings.rewardScreenEnabled,
    selectRewardTitle:
      (state) => state.rewardMessageSettings.title,
    selectRewardTitleFontSize:
      (state) => state.rewardMessageSettings.titleFontSize,
    selectRewardTitleFontWeight:
      (state) => state.rewardMessageSettings.titleFontWeight,
    selectRewardTitleFontColor:
      (state) => state.rewardMessageSettings.titleFontColor,
    selectRewardDescription:
      (state) => state.rewardMessageSettings.description,
    selectRewardDescriptionFontSize:
      (state) => state.rewardMessageSettings.descriptionFontSize,
    selectRewardDescriptionFontWeight:
      (state) => state.rewardMessageSettings.descriptionFontWeight,
    selectRewardDescriptionFontColor:
      (state) => state.rewardMessageSettings.descriptionFontColor,
    selectRewardDiscount:
      (state) => state.rewardMessageSettings.discount,
    selectRewardDiscountFontSize:
      (state) => state.rewardMessageSettings.discountFontSize,
    selectRewardDiscountFontWeight:
      (state) => state.rewardMessageSettings.discountFontWeight,
    selectRewardDiscountFontColor:
      (state) => state.rewardMessageSettings.discountFontColor,
    selectRewardPromo:
      (state) => state.rewardMessageSettings.promo,
    selectRewardPromoFontSize:
      (state) => state.rewardMessageSettings.promoFontSize,
    selectRewardPromoFontWeight:
      (state) => state.rewardMessageSettings.promoFontWeight,
    selectRewardPromoFontColor:
      (state) => state.rewardMessageSettings.promoFontColor,
    selectRewardCustomColorSchemeEnabled:
      (state) => state.rewardMessageSettings.customColorSchemeEnabled,
    selectRewardCustomDiscountBackgroundColor:
      (state) => state.rewardMessageSettings.customDiscountBackgroundColor,
    selectRewardCustomPromoBackgroundColor:
      (state) => state.rewardMessageSettings.customPromoBackgroundColor,
    
    selectMobileEnabled:
      (state) => state.mobileSettings.mobileEnabled,
    selectMobileTriggerType:
      (state) => state.mobileSettings.triggerType,
    selectMobileTriggerText:
      (state) => state.mobileSettings.triggerText,
    selectMobileTriggerBackgroundColor:
      (state) => state.mobileSettings.triggerBackgroundColor,
    selectMobileTriggerFontColor:
      (state) => state.mobileSettings.triggerFontColor,
    selectMobileImageUrl:
      (state) => state.mobileSettings.imageUrl,
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
  forrmTitleChanged,
  formTitleFontWeightChanged,
  formTitleFontColorChanged,
  formDescriptionChanged,
  formDescriptionFontWeightChanged,
  formDescriptionFontColorChanged,
  formContactacquisitionEnabledChanged,
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
} = injectedEventTimerSlice.selectors

export default injectedEventTimerSlice.reducer
