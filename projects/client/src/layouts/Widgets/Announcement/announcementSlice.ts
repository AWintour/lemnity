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

import {
  PublicWidgetsApi,
  Configuration,
  WidgetTypeEnum,
  type PublicWidget,
} from '@lemnity/api-sdk'
import type { ColorScheme, Icon } from '@lemnity/widget-config/widgets/base'
import {
  type AnnouncementWidgetType,
  type Content,
  type ContentAlignment,
  type FontWeight,
  type MobileTrigger,
} from '@lemnity/widget-config/widgets/announcement'

const configuration = new Configuration({
  basePath: 'http://localhost:3000'
})
const apiInstance = new PublicWidgetsApi(configuration)

// i should probably make this into a factory
export const fetchAnnouncementWidget = createAppAsyncThunk(
  'announcement/fetchWidget',
  async ({ widgetId, embedded }: {widgetId: string, embedded?: boolean}) => {
    if (embedded) {
      const { data } = await apiInstance.publicWidgetControllerFindOne(
        { id: widgetId }
      )
      return data
    }
    else {
      const widget = await getWidget(widgetId)
      return widget
    }
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
    description: 'Напишите описание к действию или какое нибудь предложение',
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
}

export const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    companyLogoEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.appearence.companyLogoEnabled = action.payload
    },
    companyLogoUrlChanged: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.appearence.companyLogoUrl = action.payload
    },
    colorSchemeChanged: (state, action: PayloadAction<ColorScheme>) => {
      state.appearence.colorScheme = action.payload
    },
    backgroundColorChanged: (state, action: PayloadAction<string>) => {
      state.appearence.backgroundColor = action.payload
    },
    borderRadiusChanged: (state, action: PayloadAction<number>) => {
      state.appearence.borderRadius = action.payload
    },

    contentTypeChanged: (state, action: PayloadAction<Content>) => {
      state.infoSettings.contentType = action.payload
    },
    contentAlignmentChanged: (
      state,
      action: PayloadAction<ContentAlignment>
    ) => {
      state.infoSettings.contentAlignment = action.payload
    },
    contentUrlChanged: (state, action: PayloadAction<string | undefined>) => {
      state.infoSettings.contentUrl = action.payload
    },
    titleChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.title = action.payload
    },
    titleFontWeightChanged: (state, action: PayloadAction<FontWeight>) => {
      state.infoSettings.titleFontWeight = action.payload
    },
    titleColorChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.titleColor = action.payload
    },
    descriptionChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.description = action.payload
    },
    descriptionFontWeightChanged: (
      state,
      action: PayloadAction<FontWeight>
    ) => {
      state.infoSettings.descriptionFontWeight = action.payload
    },
    descriptionColorChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.descriptionColor = action.payload
    },
    buttonTextChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.buttonText = action.payload
    },
    buttonFontColorChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.buttonFontColor = action.payload
    },
    buttonBackgroundColorChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.buttonBackgroundColor = action.payload
    },
    iconChanged: (state, action: PayloadAction<Icon>) => {
      state.infoSettings.icon = action.payload
    },
    linkChanged: (state, action: PayloadAction<string>) => {
      state.infoSettings.link = action.payload
    },

    rewardScreenEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.rewardMessageSettings.rewardScreenEnabled = action.payload
    },
    rewardTitleChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.title = action.payload
    },
    rewardTitleFontSizeChanged: (state, action: PayloadAction<number>) => {
      state.rewardMessageSettings.titleFontSize = action.payload
    },
    rewardTitleFontWeightChanged: (
      state,
      action: PayloadAction<FontWeight>
    ) => {
      state.rewardMessageSettings.titleFontWeight = action.payload
    },
    rewardTitleFontColorChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.titleFontColor = action.payload
    },
    rewardDescriptionChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.description = action.payload
    },
    rewardDescriptionFontSizeChanged: (
      state,
      action: PayloadAction<number>
    ) => {
      state.rewardMessageSettings.descriptionFontSize = action.payload
    },
    rewardDescriptionFontWeightChanged: (
      state,
      action: PayloadAction<FontWeight>
    ) => {
      state.rewardMessageSettings.descriptionFontWeight = action.payload
    },
    rewardDescriptionFontColorChanged: (
      state,
      action: PayloadAction<string>
    ) => {
      state.rewardMessageSettings.descriptionFontColor = action.payload
    },
    rewardDiscountChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.discount = action.payload
    },
    rewardDiscountFontSizeChanged: (state, action: PayloadAction<number>) => {
      state.rewardMessageSettings.discountFontSize = action.payload
    },
    rewardDiscountFontWeightChanged: (
      state,
      action: PayloadAction<FontWeight>
    ) => {
      state.rewardMessageSettings.discountFontWeight = action.payload
    },
    rewardDiscountFontColorChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.discountFontColor = action.payload
    },
    rewardPromoChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.promo = action.payload
    },
    rewardPromoFontSizeChanged: (state, action: PayloadAction<number>) => {
      state.rewardMessageSettings.promoFontSize = action.payload
    },
    rewardPromoFontWeightChanged: (
      state,
      action: PayloadAction<FontWeight>
    ) => {
      state.rewardMessageSettings.promoFontWeight = action.payload
    },
    rewardPromoFontColorChanged: (state, action: PayloadAction<string>) => {
      state.rewardMessageSettings.promoFontColor = action.payload
    },
    rewardCustomColorSchemeEnabledChanged: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.rewardMessageSettings.customColorSchemeEnabled = action.payload
    },
    rewardCustomDiscountBackgroundColorChanged: (
      state,
      action: PayloadAction<string>
    ) => {
      state.rewardMessageSettings.customDiscountBackgroundColor = action.payload
    },
    rewardCustomPromoBackgroundColorChanged: (
      state,
      action: PayloadAction<string>
    ) => {
      state.rewardMessageSettings.customPromoBackgroundColor = action.payload
    },
    brandingEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.brandingEnabled = action.payload
    },

    mobileEnabledChanged: (state, action: PayloadAction<boolean>) => {
      state.mobileSettings.mobileEnabled = action.payload
    },
    mobileTriggerTypeChanged: (state, action: PayloadAction<MobileTrigger>) => {
      state.mobileSettings.triggerType = action.payload
    },
    mobileTriggerTextChanged: (state, action: PayloadAction<string>) => {
      state.mobileSettings.triggerText = action.payload
    },
    mobileTriggerBackgroundColorChanged: (
      state,
      action: PayloadAction<string>
    ) => {
      state.mobileSettings.triggerBackgroundColor = action.payload
    },
    mobileTriggerFontColorChanged: (state, action: PayloadAction<string>) => {
      state.mobileSettings.triggerFontColor = action.payload
    },
    mobileImageUrlChanged: (state, action: PayloadAction<string | undefined>) => {
      state.mobileSettings.imageUrl = action.payload
    },

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
    selectWidgetId: (state) => state.widgetId,
    selectProjectId: (state) => state.projectId,
    selectFetchStatus: (state) => state.fetchStatus,
    selectFetchError: (state) => state.fetchError,
    selectBrandingEnabled: (state) => state.brandingEnabled,

    selectCompanyLogoEnabled: (state) => {
      return state.appearence.companyLogoEnabled
    },
    selectCompanyLogoUrl: (state) => {
      return state.appearence.companyLogoUrl
    },
    selectColorScheme: (state) => {
      return state.appearence.colorScheme
    },
    selectBackgroundColor: (state) => {
      return state.appearence.backgroundColor
    },
    selectBorderRadius: (state) => {
      return state.appearence.borderRadius
    },

    selectContentType: (state) => {
      return state.infoSettings.contentType
    },
    selectContentAlignment: (state) => {
      return state.infoSettings.contentAlignment
    },
    selectContentUrl: (state) => {
      return state.infoSettings.contentUrl
    },
    selectTitle: (state) => {
      return state.infoSettings.title
    },
    selectTitleFontWeight: (state) => {
      return state.infoSettings.titleFontWeight
    },
    selectTitleColor: (state) => {
      return state.infoSettings.titleColor
    },
    selectDescription: (state) => {
      return state.infoSettings.description
    },
    selectDescriptionFontWeight: (state) => {
      return state.infoSettings.descriptionFontWeight
    },
    selectDescriptionColor: (state) => {
      return state.infoSettings.descriptionColor
    },
    selectButtonText: (state) => {
      return state.infoSettings.buttonText
    },
    selectButtonFontColor: (state) => {
      return state.infoSettings.buttonFontColor
    },
    selectButtonBackgroundColor: (state) => {
      return state.infoSettings.buttonBackgroundColor
    },
    selectIcon: (state) => {
      return state.infoSettings.icon
    },
    selectLink: (state) => {
      return state.infoSettings.link
    },

    selectRewardScreenEnabled: (state) => {
      return state.rewardMessageSettings.rewardScreenEnabled
    },
    selectRewardTitle: (state) => {
      return state.rewardMessageSettings.title
    },
    selectRewardTitleFontSize: (state) => {
      return state.rewardMessageSettings.titleFontSize
    },
    selectRewardTitleFontWeight: (state) => {
      return state.rewardMessageSettings.titleFontWeight
    },
    selectRewardTitleFontColor: (state) => {
      return state.rewardMessageSettings.titleFontColor
    },
    selectRewardDescription: (state) => {
      return state.rewardMessageSettings.description
    },
    selectRewardDescriptionFontSize: (state) => {
      return state.rewardMessageSettings.descriptionFontSize
    },
    selectRewardDescriptionFontWeight: (state) => {
      return state.rewardMessageSettings.descriptionFontWeight
    },
    selectRewardDescriptionFontColor: (state) => {
      return state.rewardMessageSettings.descriptionFontColor
    },
    selectRewardDiscount: (state) => {
      return state.rewardMessageSettings.discount
    },
    selectRewardDiscountFontSize: (state) => {
      return state.rewardMessageSettings.discountFontSize
    },
    selectRewardDiscountFontWeight: (state) => {
      return state.rewardMessageSettings.discountFontWeight
    },
    selectRewardDiscountFontColor: (state) => {
      return state.rewardMessageSettings.discountFontColor
    },
    selectRewardPromo: (state) => {
      return state.rewardMessageSettings.promo
    },
    selectRewardPromoFontSize: (state) => {
      return state.rewardMessageSettings.promoFontSize
    },
    selectRewardPromoFontWeight: (state) => {
      return state.rewardMessageSettings.promoFontWeight
    },
    selectRewardPromoFontColor: (state) => {
      return state.rewardMessageSettings.promoFontColor
    },
    selectRewardCustomColorSchemeEnabled: (state) => {
      return state.rewardMessageSettings.customColorSchemeEnabled
    },
    selectRewardCustomDiscountBackgroundColor: (state) => {
      return state.rewardMessageSettings.customDiscountBackgroundColor
    },
    selectRewardCustomPromoBackgroundColor: (state) => {
      return state.rewardMessageSettings.customPromoBackgroundColor
    },

    selectMobileEnabled: (state) => {
      return state.mobileSettings.mobileEnabled
    },
    selectMobileTriggerType: (state) => {
      return state.mobileSettings.triggerType
    },
    selectMobileTriggerText: (state) => {
      return state.mobileSettings.triggerText
    },
    selectMobileTriggerBackgroundColor: (state) => {
      return state.mobileSettings.triggerBackgroundColor
    },
    selectMobileTriggerFontColor: (state) => {
      return state.mobileSettings.triggerFontColor
    },
    selectMobileImageUrl: (state) => {
      return state.mobileSettings.imageUrl
    },
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
        } = settings as AnnouncementWidgetType

        state.appearence = appearence
        state.infoSettings = infoSettings
        state.rewardMessageSettings = rewardMessageSettings
        state.mobileSettings = mobileSettings
        state.brandingEnabled = brandingEnabled
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
} = injectedAnnouncementSlice.selectors

export default injectedAnnouncementSlice.reducer
