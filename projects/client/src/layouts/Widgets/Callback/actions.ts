 import type {
  TypedWidgetUpdater,
} from '@/stores/widgetSettings/widgetActions/types'
import {
  type Content,
  type ContentAlignment,
  type FontWeight,
  type MobileTrigger,
} from '@lemnity/widget-config/widgets/announcement'
import { callbackWidgetDefaults, callbackExtraDefaults, type CallbackWidgetType } from './defaults'
import type { ColorScheme, Icon } from '@lemnity/widget-config/widgets/base'

export const createCallbackActions = (
  updateWidget: TypedWidgetUpdater<CallbackWidgetType>
) => ({
  // WidgetAppearenceSchema
  setCallbackCompanyLogoEnabled: (enabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoEnabled: enabled,
      }
    })),
  setCallbackCompanyLogoUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoUrl: url,
      }
    })),
  setCallbackColorScheme: (colorScheme: ColorScheme) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        colorScheme,
      }
    })),
  setCallbackBackgroundColor: (color: string) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        backgroundColor: color,
      }
    })),
  setCallbackBorderRadius: (radius: number) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        borderRadius: radius,
      }
    })),
    // InfoSettingsSchema
    setCallbackContentType: (contentType: Content) =>
      updateWidget(widget => ({
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          contentType,
        }
      })),
    setCallbackContentAlignment: (alignment: ContentAlignment) =>
      updateWidget(widget => ({
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          contentAlignment: alignment,
        }
      })),
    setCallbackContentUrl: (url: string | undefined) =>
      updateWidget(widget => ({
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          contentUrl: url,
        }
      })),
  setCallbackInfoScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          title,
        }
      }
    }),
  setCallbackInfoScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setCallbackInfoScreenTitleColor: (titleColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleColor,
        }
      }
    }),
  setCallbackInfoScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setCallbackInfoScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          description,
        }
      }
    }),
  setCallbackInfoScreenDescriptionColor: (descriptionColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionColor,
        }
      }
    }),
  setCallbackInfoScreenButtonText: (buttonText: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonText,
        }
      }
    }),
  setCallbackInfoScreenButtonFontColor: (buttonFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonFontColor,
        }
      }
    }),
  setCallbackInfoScreenButtonBackgroundColor: (
    buttonBackgroundColor: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonBackgroundColor,
        }
      }
    }),
  setCallbackInfoScreenIcon: (icon: Icon) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          icon,
        }
      }
    }),
  setCallbackInfoScreenLink: (link: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          link,
        }
      }
    }),
  // RewardMessageSettingsSchema
  setCallbackRewardScreenEnabled: (enabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          rewardScreenEnabled: enabled,
        }
      }
    }),
  setCallbackRewardScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          title,
        }
      }
    }),
  setCallbackRewardScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setCallbackRewardScreenTitleFontSize: (titleFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontSize,
        }
      }
    }),
  setCallbackRewardScreenTitleFontColor: (titleFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontColor,
        }
      }
    }),
  setCallbackRewardScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          description,
        }
      }
    }),
  setCallbackRewardScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setCallbackRewardScreenDescriptionFontSize: (
    descriptionFontSize: number
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          descriptionFontSize,
        }
      }
    }),
  setCallbackRewardScreenDescriptionFontColor: (
    descriptionFontColor: string
  ) =>
    updateWidget(widget => {
     return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          descriptionFontColor,
        }
      }
    }),
  setCallbackRewardScreenDiscount: (discount: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discount,
        }
      }
    }),
  setCallbackRewardScreenDiscountFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontWeight: weight,
        }
      }
    }),
  setCallbackRewardScreenDiscountFontSize: (discountFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontSize,
        }
      }
    }),
  setCallbackRewardScreenDiscountFontColor: (discountFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontColor,
        }
      }
    }),
  setCallbackRewardScreenPromo: (promo: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promo,
        }
      }
    }),
  setCallbackRewardScreenPromoFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontWeight: weight,
        }
      }
    }),
  setCallbackRewardScreenPromoFontSize: (promoFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontSize,
        }
      }
    }),
  setCallbackRewardScreenPromoFontColor: (promoFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontColor,
        }
      }
    }),
  setCallbackRewardScreenCustomColorSchemeEnabled: (
    customColorSchemeEnabled: boolean
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          customColorSchemeEnabled,
        }
      }
    }),
  setCallbackRewardScreenDiscountBackgroundColor: (
    customDiscountBackgroundColor: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          customDiscountBackgroundColor,
        }
      }
    }),
  setCallbackRewardScreenPromoBackgroundColor: (
    customPromoBackgroundColor: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          customPromoBackgroundColor,
        }
      }
    }),
  // Mobile
  setCallbackMobileEnabled: (
    mobileEnabled: boolean
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          mobileEnabled,
        }
      }
    }),
  setCallbackMobileTriggerType: (
    triggerType: MobileTrigger
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerType,
        }
      }
    }),
  setCallbackMobileImageUrl: (
    imageUrl: string | undefined
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          imageUrl,
        }
      }
    }),
  setCallbackMobileTriggerText: (
    triggerText: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerText,
        }
      }
    }),
  setCallbackMobileTriggerFontColor: (
    triggerFontColor: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerFontColor,
        }
      }
    }),
  setCallbackMobileTriggerBackgroundColor: (
    triggerBackgroundColor: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? callbackWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerBackgroundColor,
        }
      }
    }),
  // General
  setCallbackBrandingEnabled: (
    brandingEnabled: boolean
  ) => 
    updateWidget(widget => {
      return {
        ...widget,
        brandingEnabled,
      }
    }),
  resetCallbackColors: () =>
    updateWidget(widget => {
      const defaults = callbackWidgetDefaults
      return {
        ...widget,
        appearence: {
          ...widget.appearence,
          backgroundColor:
            defaults.appearence.backgroundColor,
        },
        infoSettings: {
          ...widget.infoSettings,
          titleColor:
            defaults.infoSettings.titleColor,
          descriptionColor:
            defaults.infoSettings.descriptionColor,
          buttonFontColor:
            defaults.infoSettings.buttonFontColor,
          buttonBackgroundColor:
            defaults.infoSettings.buttonBackgroundColor,
        },
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontColor:
            defaults.rewardMessageSettings.titleFontColor,
          descriptionFontColor:
            defaults
              .rewardMessageSettings
              .descriptionFontColor,
          discountFontColor:
            defaults.rewardMessageSettings.discountFontColor,
          promoFontColor:
            defaults.rewardMessageSettings.promoFontColor,
          customDiscountBackgroundColor:
            defaults
              .rewardMessageSettings
              .customDiscountBackgroundColor,
          customPromoBackgroundColor:
            defaults
              .rewardMessageSettings
              .customPromoBackgroundColor,
        },
      }
    }),

  // Callback-специфика (поле `callback`) — единый patch-апдейтер по плану plan-wid-call.md
  setCallbackPatch: (patch: Record<string, unknown>) =>
    updateWidget(widget => {
      const w = widget as unknown as { callback?: Record<string, unknown> }
      return {
        ...widget,
        callback: { ...callbackExtraDefaults, ...(w.callback ?? {}), ...patch },
      } as unknown as CallbackWidgetType
    }),
})
