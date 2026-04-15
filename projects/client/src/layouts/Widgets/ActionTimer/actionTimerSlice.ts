import {
  createSlice,
  type PayloadAction,
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
  agreementReducers,
  agreementSelectors,
} from '@/stores/redux/features/agreement'
import {
  adsInfoReducers,
  adsInfoSelectors,
} from '@/stores/redux/features/adsInfo'
import {
  rewardScreenReducers,
  rewardScreenSelectors,
} from '@/stores/redux/features/rewardScreen'

import {
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'
import {
  type ActionTimerWidgetType,
  type Content,
  type ContentAlignment,
  type ContentPlacement,
} from '@lemnity/widget-config/widgets/action-timer'
import type { FontWeight, Icon } from '@lemnity/widget-config/widgets/base'

export const fetchActionTimerWidget = fetchWidgetThunkFactory(
  'notification/fetchWidget',
  (state) => state.actionTimer!.fetchStatus
)

type ActionTimerWidgetState = ActionTimerWidgetType & {
  widgetId?: string
  projectId?: string
  fetchStatus: FetchStatus
  fetchError: string | null
}

const initialState: ActionTimerWidgetState = {
  type: WidgetTypeEnum.ACTION_TIMER,
  fetchStatus: 'idle',
  fetchError: null,

  appearence: {
    companyLogoEnabled: false,
    companyLogoUrl: undefined,
    colorScheme: 'primary',
    backgroundColor: '#725DFF',
    borderRadius: 15,
  },

  contentType: 'imageOnSide',
  contentAlignment: 'center',
  contentUrl: undefined,
  contentPlacement: 'left',

  badgeText: 'Концерт',
  badgeBackgroundColor: '#E9EEFF',
  badgeFontColor: '#336EC2',

  title: 'Успейте попасть на мероприятие мечты',
  titleFontSize: 30,
  titleFontWeight: 'medium',
  titleColor: '#FFFFFF',

  description:
    'Оставьте контакты, чтобы получить напоминание и бонусные предложения',
  descriptionFontSize: 16,
  descriptionFontWeight: 'regular',
  descriptionColor: '#FFFFFF',

  buttonText: 'Получить скидку',
  buttonFontColor: '#FFFFFF',
  buttonIcon: 'Sparkles',
  buttonBackgroundColor: '#B88339',
  buttonLink: 'https://lemnity.ru',

  formBorderEnabled: true,
  formBorderColor: '#FFFFFF',

  countdown: {
    countdownEnabled: true,
    textBeforeCountdown: 'До мероприятия осталось',
    textBeforeCountdownColor: '#FFFFFF',
    countdownDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    countdownBackgroundColor: '#FFFFFF',
    countdownFontColor: '#000000',
  },

  contactAcquisition: {
    contactAcquisitionEnabled: true,
    nameFieldEnabled: true,
    nameFieldRequired: false,
    emailFieldEnabled: true,
    emailFieldRequired: true,
    phoneFieldEnabled: false,
    phoneFieldRequired: false,
  },

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

  brandingEnabled: true,
}

export const actionTimerSlice = createSlice({
  name: 'actionTimer',
  initialState,
  reducers: {
    ...commonReducers,
    ...widgetAppearenceReducers,
    ...agreementReducers,
    ...adsInfoReducers,
    ...rewardScreenReducers,

    contentTypeChanged:
      (state, action: PayloadAction<Content>) => {
        state.contentType = action.payload
      },
    contentAlignmentChanged:
      (state, action: PayloadAction<ContentAlignment>) => {
        state.contentAlignment = action.payload
      },
    contentUrlChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.contentUrl = action.payload
      },
    contentPlacementChanged:
      (state, action: PayloadAction<ContentPlacement>) => {
        state.contentPlacement = action.payload
      },
    
    badgeTextChanged:
      (state, action: PayloadAction<string>) => {
        state.badgeText = action.payload
      },
    badgeBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.badgeBackgroundColor = action.payload
      },
    badgeFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.badgeFontColor = action.payload
      },
    
    titleChanged:
      (state, action: PayloadAction<string>) => {
        state.title = action.payload
      },
    titleFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.titleFontSize = action.payload
      },
    titleFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.titleFontWeight = action.payload
      },
    titleColorChanged:
      (state, action: PayloadAction<string>) => {
        state.titleColor = action.payload
      },
    
    descriptionChanged:
      (state, action: PayloadAction<string>) => {
        state.description = action.payload
      },
    descriptionFontSizeChanged:
      (state, action: PayloadAction<number>) => {
        state.descriptionFontSize = action.payload
      },
    descriptionFontWeightChanged:
      (state, action: PayloadAction<FontWeight>) => {
        state.descriptionFontWeight = action.payload
      },
    descriptionColorChanged:
      (state, action: PayloadAction<string>) => {
        state.descriptionColor = action.payload
      },
    
    buttonTextChanged:
      (state, action: PayloadAction<string>) => {
        state.buttonText = action.payload
      },
    buttonFontColorChanged:
      (state, action: PayloadAction<string>) => {
        state.buttonFontColor = action.payload
      },
    buttonIconChanged:
      (state, action: PayloadAction<Icon>) => {
        state.buttonIcon = action.payload
      },
    buttonBackgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.buttonBackgroundColor = action.payload
      },
    buttonLinkChanged:
      (state, action: PayloadAction<string>) => {
        state.buttonText = action.payload
      },

    formBorderEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.formBorderEnabled = action.payload
      },
    formBorderColorChanged:
      (state, action: PayloadAction<string>) => {
        state.formBorderColor = action.payload
      },
  },
  selectors: {
    ...commonSelectors,
    ...widgetAppearenceSelectors,
    ...agreementSelectors,
    ...adsInfoSelectors,
    ...rewardScreenSelectors,

    selectContentType:
      (state) => state.contentType,
    selectContentAlignment:
      (state) => state.contentAlignment,
    selectContentUrl:
      (state) => state.contentUrl,
    selectContentPlacement:
      (state) => state.contentPlacement,
    
    selectBadgeText:
      (state) => state.badgeText,
    selectBadgeBackgroundColor:
      (state) => state.badgeBackgroundColor,
    selectBadgeFontColor:
      (state) => state.badgeFontColor,
    
    selectTitle:
      (state) => state.title,
    selectTitleFontSize:
      (state) => state.titleFontSize,
    selectTitleFontWeight:
      (state) => state.titleFontWeight,
    selectTitleColor:
      (state) => state.titleColor,
    
    selectDescription:
      (state) => state.description,
    selectDescriptionFontSize:
      (state) => state.descriptionFontSize,
    selectDescriptionFontWeight:
      (state) => state.descriptionFontWeight,
    selectDescriptionColor:
      (state) => state.descriptionColor,
    
    selectButtonText:
      (state) => state.buttonText,
    selectButtonFontColor:
      (state) => state.buttonFontColor,
    selectButtonIcon:
      (state) => state.buttonIcon,
    selectButtonBackgroundColor:
      (state) => state.buttonBackgroundColor,
    selectButtonLink:
      (state) => state.buttonLink,

    selectFormBorderEnabled:
      (state) => state.formBorderEnabled,
    selectFormBorderColor:
      (state) => state.formBorderColor,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActionTimerWidget.pending, (state) => {
        state.fetchStatus = 'pending'
      })
      .addCase(fetchActionTimerWidget.fulfilled, (state, action) => {
        // state.fetchStatus = 'succeeded'
        // state.fetchError = null

        const payload = action.payload as PublicWidget | undefined

        state.widgetId = payload?.id
        state.projectId = payload?.projectId

        const widgetConfig = payload?.config as WidgetSettings | undefined
        const widgetSettings = widgetConfig?.widget

        if ((widgetConfig as { fields?: object }).fields) {
          // got an old config
          // i need to figure out the types and split this into another
          // possibly dynamically loaded function
          // the slice's compressed size is ~4KB though so that's probably
          // not even necessary
          state.appearence.companyLogoEnabled =
            (widgetConfig as any)
              ?.fields?.companyLogo?.enabled
          state.appearence.companyLogoUrl =
            (widgetConfig as any)
              ?.fields?.companyLogo?.url
          state.appearence.backgroundColor =
            (widgetConfig as any)
              ?.fields?.template?.templateSettings?.customColor
          state.appearence.colorScheme =
            (widgetConfig as any)
              ?.fields?.template?.templateSettings.colorScheme
          // old config did not have this setting
          state.appearence.borderRadius =
            initialState.appearence.borderRadius

          state.countdown.countdownEnabled =
            (widgetSettings as any)
              ?.countdown?.enabled
          state.countdown.countdownDate =
            (widgetSettings as any)
              ?.countdown?.eventDate
          state.countdown.countdownBackgroundColor =
            initialState.countdown.countdownBackgroundColor
          state.countdown.countdownFontColor =
            initialState.countdown.countdownFontColor
          state.countdown.textBeforeCountdown =
            (widgetSettings as any)
              ?.countdown?.textBeforeCountdown
          state.countdown.textBeforeCountdownColor =
            (widgetSettings as any)
              ?.countdown?.textBeforeCountdownColor
          
          state.contactAcquisition.emailFieldEnabled =
            (widgetConfig as any)
              ?.fields?.contacts?.email?.enabled
          state.contactAcquisition.emailFieldRequired =
            (widgetConfig as any)
              ?.fields?.contacts?.email?.required
          state.contactAcquisition.nameFieldEnabled =
            (widgetConfig as any)
              ?.fields?.contacts?.name?.enabled
          state.contactAcquisition.nameFieldRequired =
            (widgetConfig as any)
              ?.fields?.contacts?.name?.required
          state.contactAcquisition.phoneFieldEnabled =
            (widgetConfig as any)
              ?.fields?.contacts?.phone?.enabled
          state.contactAcquisition.phoneFieldRequired =
            (widgetConfig as any)
              ?.fields?.contacts?.phone?.required
          state.contactAcquisition.contactAcquisitionEnabled =
            state.contactAcquisition.emailFieldEnabled
            || state.contactAcquisition.nameFieldEnabled
            || state.contactAcquisition.phoneFieldEnabled

          state.agreement = { ...(widgetConfig as any)?.fields?.agreement }
          state.adsInfo = { ...(widgetConfig as any)?.fields?.adsInfo }

          state.rewardMessageSettings.rewardScreenEnabled =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.enabled

          state.rewardMessageSettings.title =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.text
          state.rewardMessageSettings.titleFontSize =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.textSize
          state.rewardMessageSettings.titleFontColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.textColor
          state.rewardMessageSettings.titleFontWeight =
            initialState.rewardMessageSettings.titleFontWeight
          
          state.rewardMessageSettings.description =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.description
          state.rewardMessageSettings.descriptionFontSize =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.descriptionSize
          state.rewardMessageSettings.descriptionFontColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.descriptionColor
          state.rewardMessageSettings.descriptionFontWeight =
            initialState.rewardMessageSettings.descriptionFontWeight
          
          state.rewardMessageSettings.discount =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.discount
          state.rewardMessageSettings.discountFontSize =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.discountSize
          state.rewardMessageSettings.discountFontColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.discountColor
          state.rewardMessageSettings.discountFontWeight =
            initialState.rewardMessageSettings.discountFontWeight
          
          state.rewardMessageSettings.promo =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.promo
          state.rewardMessageSettings.promoFontSize =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.promoSize
          state.rewardMessageSettings.promoFontColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.promoColor
          state.rewardMessageSettings.promoFontWeight =
            initialState.rewardMessageSettings.promoFontWeight

          state.rewardMessageSettings.customColorSchemeEnabled =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.colorScheme?.enabled
          state.rewardMessageSettings.customDiscountBackgroundColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.colorScheme?.discount?.bgColor
          state.rewardMessageSettings.customPromoBackgroundColor =
            (widgetConfig as any)
              ?.fields?.messages?.onWin?.colorScheme?.promo?.bgColor
          
          state.contentType =
            (widgetConfig as any)
              ?.fields?.template?.templateSettings?.imageMode === 'background'
                ? 'background'
                : 'imageOnSide'
          state.contentAlignment =
            (widgetSettings as any)
              ?.countdown?.imagePosition
          state.contentUrl =
            (widgetSettings as any)
              ?.countdown?.imageUrl
          state.contentPlacement =
            (widgetConfig as any)
              ?.fields?.template?.templateSettings?.contentPosition
            
          state.badgeText =
            (widgetSettings as any)
              ?.countdown.badgeText
          state.badgeBackgroundColor =
            (widgetSettings as any)
              ?.countdown.badgeBackground
          state.badgeFontColor =
            (widgetSettings as any)
              ?.countdown.badgeColor
          
          state.title =
            (widgetConfig as any)
              ?.fields?.formTexts?.title?.text
          state.titleColor =
            (widgetConfig as any)
              ?.fields?.formTexts?.title?.color
          state.titleFontSize =
            initialState.titleFontSize
          state.titleFontWeight =
            initialState.titleFontWeight
          
          state.description =
            (widgetConfig as any)
              ?.fields?.formTexts?.description?.text
          state.descriptionColor =
            (widgetConfig as any)
              ?.fields?.formTexts?.description?.color
          state.descriptionFontSize =
            initialState.titleFontSize
          state.descriptionFontWeight =
            initialState.titleFontWeight
          
          state.buttonText =
            (widgetConfig as any)
              ?.fields?.formTexts?.button?.text
          state.buttonFontColor =
            (widgetConfig as any)
              ?.fields?.formTexts?.button?.color
          state.buttonBackgroundColor =
            (widgetConfig as any)
              ?.fields?.formTexts?.button?.backgroundColor
          state.buttonLink =
            (widgetConfig as any)
              ?.fields?.link
          state.buttonIcon =
            initialState.buttonIcon
          
          state.formBorderEnabled =
            (widgetConfig as any)
              ?.fields?.border?.enabled
          state.formBorderColor =
            (widgetConfig as any)
              ?.fields?.border?.color
          
          state.brandingEnabled =
            (widgetConfig as any)
              ?.display?.brandingEnabled

          return
        }

        // got a new config
        const settings = widgetSettings as
          Partial<Pick<ActionTimerWidgetType, 'type'>>
          & Omit<ActionTimerWidgetType, 'type'>
        delete settings.type

        state = {
          ...settings,
          type: 'ACTION_TIMER',
          fetchStatus: 'succeeded',
          fetchError: null,
        }
      })
      .addCase(fetchActionTimerWidget.rejected, (state, action) => {
        state.fetchStatus = 'rejected'
        state.fetchError = action.error.message
          || 'Не удалось загрузить виджет'
      })
  }
})

export const {
  brandingEnabledChanged,
  adsInfoColorChanged,
  adsInfoEnabledChanged,
  adsInfoPolicyUrlChanged,
  agreementColorChanged,
  agreementEnabledChanged,
  agreementPolicyUrlChanged,
  agreementUrlChanged,
  backgroundColorChanged,
  badgeBackgroundColorChanged,
  companyLogoEnabledChanged,
  companyLogoUrlChanged,
  colorSchemeChanged,
  badgeFontColorChanged,
  badgeTextChanged,
  borderRadiusChanged,
  buttonBackgroundColorChanged,
  buttonFontColorChanged,
  buttonIconChanged,
  buttonLinkChanged,
  buttonTextChanged,
  contentAlignmentChanged,
  contentPlacementChanged,
  contentTypeChanged,
  contentUrlChanged,
  descriptionChanged,
  descriptionColorChanged,
  descriptionFontSizeChanged,
  descriptionFontWeightChanged,
  formBorderColorChanged,
  formBorderEnabledChanged,
  titleChanged,
  titleColorChanged,
  titleFontSizeChanged,
  titleFontWeightChanged,
  rewardCustomColorSchemeEnabledChanged,
  rewardCustomDiscountBackgroundColorChanged,
  rewardCustomPromoBackgroundColorChanged,
  rewardDescriptionChanged,
  rewardDescriptionFontColorChanged,
  rewardDescriptionFontSizeChanged,
  rewardDescriptionFontWeightChanged,
  rewardDiscountChanged,
  rewardDiscountFontColorChanged,
  rewardDiscountFontSizeChanged,
  rewardDiscountFontWeightChanged,
  rewardPromoChanged,
  rewardPromoFontColorChanged,
  rewardPromoFontSizeChanged,
  rewardPromoFontWeightChanged,
  rewardTitleChanged,
  rewardTitleFontColorChanged,
  rewardTitleFontSizeChanged,
  rewardTitleFontWeightChanged,
  rewardScreenEnabledChanged,
} = actionTimerSlice.actions

declare module '@/stores/redux/reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof actionTimerSlice> {}
}

const injectedActionTimerSlice = actionTimerSlice.injectInto(rootReducer)

export const {
  selectFetchStatus,
  selectFetchError,
  selectWidgetId,
  selectProjectId,
  selectWidgetType,
  selectRewardScreenEnabled,
  selectRewardTitle,
  selectRewardTitleFontColor,
  selectRewardTitleFontSize,
  selectRewardTitleFontWeight,
  selectRewardDescription,
  selectRewardDescriptionFontColor,
  selectRewardDescriptionFontSize,
  selectRewardDescriptionFontWeight,
  selectRewardDiscount,
  selectRewardDiscountFontColor,
  selectRewardDiscountFontSize,
  selectRewardDiscountFontWeight,
  selectRewardPromo,
  selectRewardPromoFontColor,
  selectRewardPromoFontSize,
  selectRewardPromoFontWeight,
  selectRewardCustomColorSchemeEnabled,
  selectRewardCustomDiscountBackgroundColor,
  selectRewardCustomPromoBackgroundColor,
  selectBrandingEnabled,
  selectAdsInfoColor,
  selectAdsInfoEnabled,
  selectAdsInfoPolicyUrl,
  selectAgreementColor,
  selectAgreementEnabled,
  selectAgreementPolicyUrl,
  selectAgreementUrl,
  selectBackgroundColor,
  selectBadgeBackgroundColor,
  selectBadgeFontColor,
  selectBadgeText,
  selectBorderRadius,
  selectButtonBackgroundColor,
  selectButtonFontColor,
  selectButtonIcon,
  selectButtonLink,
  selectButtonText,
  selectColorScheme,
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectContentAlignment,
  selectContentPlacement,
  selectContentType,
  selectContentUrl,
  selectDescription,
  selectDescriptionColor,
  selectDescriptionFontSize,
  selectDescriptionFontWeight,
  selectFormBorderColor,
  selectFormBorderEnabled,
  selectTitle,
  selectTitleColor,
  selectTitleFontSize,
  selectTitleFontWeight,
} = injectedActionTimerSlice.selectors