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
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

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

  companyLogoEnabled: false,
  companyLogoUrl: undefined,
  colorScheme: 'primary',
  backgroundColor: '#725DFF',
  contentType: 'imageOnSide',
  contentAlignment: 'center',
  contentUrl: undefined,
  contentPlacement: 'left',
  borderRadius: 15,

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

  countdownEnabled: true,
  textBeforeCountdown: 'До мероприятия осталось',
  textBeforeCountdownColor: '#FFFFFF',
  countdownDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  countdownBackgroundColor: '#FFFFFF',
  countdownFontColor: '#000000',

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
    ...rewardScreenReducers,

    companyLogoEnabledChanged:
      (state, action: PayloadAction<boolean>) => {
        state.companyLogoEnabled = action.payload
      },
    companyLogoUrlChanged:
      (state, action: PayloadAction<string | undefined>) => {
        state.companyLogoUrl = action.payload
      },
    colorSchemeChanged:
      (state, action: PayloadAction<ColorScheme>) => {
        state.colorScheme = action.payload
      },
    backgroundColorChanged:
      (state, action: PayloadAction<string>) => {
        state.backgroundColor = action.payload
      },
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
    borderRadiusChanged:
      (state, action: PayloadAction<number>) => {
        state.borderRadius = action.payload
      },
  },
  selectors: {
    ...commonSelectors,
    ...rewardScreenSelectors,
  },
})

export const {
  brandingEnabledChanged,
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
} = injectedActionTimerSlice.selectors