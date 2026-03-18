 import type {
  TypedWidgetUpdater,
} from '@/stores/widgetSettings/widgetActions/types'
import {
  type EventTimertWidgetType,
  type FontWeight,
  type MobileTrigger,
} from '@lemnity/widget-config/widgets/event-timer'
import {
  eventTimerWidgetDefaults,
  buildEventTimerWidgetSettings,
} from './defaults'
import type { ColorScheme, Icon } from '@lemnity/widget-config/widgets/base'

export const createEventTimerActions = (
  updateWidget: TypedWidgetUpdater<EventTimertWidgetType>
) => ({
  // WidgetAppearenceSchema
  setEventTimerCompanyLogoEnabled: (enabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoEnabled: enabled,
      }
    })),
  setEventTimerCompanyLogoUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoUrl: url,
      }
    })),
  setEventTimerColorScheme: (colorScheme: ColorScheme) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        colorScheme,
      }
    })),
  setEventTimerBackgroundColor: (color: string) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        backgroundColor: color,
      }
    })),
  setEventTimerBorderRadius: (radius: number) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        borderRadius: radius,
      }
    })),
  // InfoSettingsSchema
  setEventTimerContentEnabled: (contentEnabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: {
        ...widget.infoSettings,
        contentEnabled,
      }
    })),
  setEventTimerContentUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: {
        ...widget.infoSettings,
        contentUrl: url,
      }
    })),
  setEventTimerInfoScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          title,
        }
      }
    }),
  setEventTimerInfoScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setEventTimerInfoScreenTitleColor: (titleColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleColor,
        }
      }
    }),
  setEventTimerInfoScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setEventTimerInfoScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          description,
        }
      }
    }),
  setEventTimerInfoScreenDescriptionColor: (descriptionColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionColor,
        }
      }
    }),
  setEventTimerInfoScreenCountdownEnabled: (countdownEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownEnabled,
        }
      }
    }),
  setEventTimerInfoScreenCountdownDate: (countdownDate: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownDate,
        }
      }
    }),
  setEventTimerInfoScreenCountdownBackgroundColor: (
    countdownBackgroundColor: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownBackgroundColor,
        }
      }
    }),
  setEventTimerInfoScreenCountdownFontColor: (countdownFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownFontColor,
        }
      }
    }),
  setEventTimerInfoScreenButtonText: (buttonText: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonText,
        }
      }
    }),
  setEventTimerInfoScreenButtonFontColor: (buttonFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonFontColor,
        }
      }
    }),
  setEventTimerInfoScreenButtonBackgroundColor: (
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
  setEventTimerInfoScreenIcon: (icon: Icon) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          icon,
        }
      }
    }),
  setEventTimerInfoScreenLink: (link: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          link,
        }
      }
    }),
  // FormSettingsSchema
  setEventTimerFormScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          title,
        }
      }
    }),
  setEventTimerFormScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setEventTimerFormScreenTitleFontColor: (titleFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          titleFontColor,
        }
      }
    }),
  setEventTimerFormScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          description,
        }
      }
    }),
  setEventTimerFormScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setEventTimerFormScreenDescriptionFontColor: (
    descriptionFontColor: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          descriptionFontColor,
        }
      }
    }),
  setEventTimerFormScreenContactAcquisitionEnabled: (
    contactAcquisitionEnabled: boolean
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          contactAcquisitionEnabled,
        }
      }
    }),
  setEventTimerFormScreenNameFieldEnabled: (nameFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          nameFieldEnabled,
        }
      }
    }),
  setEventTimerFormScreenNameFieldRequired: (nameFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          nameFieldRequired,
        }
      }
    }),
  setEventTimerFormScreenEmailFieldEnabled: (emailFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          emailFieldEnabled,
        }
      }
    }),
  setEventTimerFormScreenEmailFieldRequired: (emailFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          emailFieldRequired,
        }
      }
    }),
  setEventTimerFormScreenPhoneFieldEnabled: (phoneFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          phoneFieldEnabled,
        }
      }
    }),
  setEventTimerFormScreenPhoneFieldRequired: (phoneFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          phoneFieldRequired,
        }
      }
    }),
  setEventTimerFormScreenAgreementEnabled: (enabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          agreement: {
            ...widget.formSettings.agreement,
            enabled: enabled,
          }
        }
      }
    }),
  setEventTimerFormScreenAgreementPolicyUrl: (policyUrl: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          agreement: {
            ...widget.formSettings.agreement,
            policyUrl: policyUrl,
          }
        }
      }
    }),
  setEventTimerFormScreenAgreementUrl: (agreementUrl: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          agreement: {
            ...widget.formSettings.agreement,
            agreementUrl: agreementUrl,
          }
        }
      }
    }),
  setEventTimerFormScreenAgreementColor: (color: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          agreement: {
            ...widget.formSettings.agreement,
            color: color,
          }
        }
      }
    }),
  setEventTimerFormScreenAdsInfoEnabled: (enabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          adsInfo: {
            ...widget.formSettings.adsInfo,
            enabled: enabled,
          }
        }
      }
    }),
  setEventTimerFormScreenAdsInfoPolicyUrl: (policyUrl: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          adsInfo: {
            ...widget.formSettings.adsInfo,
            policyUrl: policyUrl,
          }
        }
      }
    }),
  setEventTimerFormScreenAdsInfoColor: (color: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          adsInfo: {
            ...widget.formSettings.adsInfo,
            color: color,
          }
        }
      }
    }),
  setEventTimerFormScreenAdsInfo: (
    enabled: boolean,
    policyUrl: string,
    color: string
  ) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          adsInfo: {
            ...widget.formSettings.adsInfo,
            enabled,
            policyUrl,
            color,
          }
        }
      }
    }),
  // RewardMessageSettingsSchema
  setEventTimerRewardScreenEnabled: (enabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          rewardScreenEnabled: enabled,
        }
      }
    }),
  setEventTimerRewardScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          title,
        }
      }
    }),
  setEventTimerRewardScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setEventTimerRewardScreenTitleFontSize: (titleFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontSize,
        }
      }
    }),
  setEventTimerRewardScreenTitleFontColor: (titleFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontColor,
        }
      }
    }),
  setEventTimerRewardScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          description,
        }
      }
    }),
  setEventTimerRewardScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setEventTimerRewardScreenDescriptionFontSize: (
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
  setEventTimerRewardScreenDescriptionFontColor: (
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
  setEventTimerRewardScreenDiscount: (discount: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discount,
        }
      }
    }),
  setEventTimerRewardScreenDiscountFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontWeight: weight,
        }
      }
    }),
  setEventTimerRewardScreenDiscountFontSize: (discountFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontSize,
        }
      }
    }),
  setEventTimerRewardScreenDiscountFontColor: (discountFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontColor,
        }
      }
    }),
  setEventTimerRewardScreenPromo: (promo: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promo,
        }
      }
    }),
  setEventTimerRewardScreenPromoFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontWeight: weight,
        }
      }
    }),
  setEventTimerRewardScreenPromoFontSize: (promoFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontSize,
        }
      }
    }),
  setEventTimerRewardScreenPromoFontColor: (promoFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontColor,
        }
      }
    }),
  setEventTimerRewardScreenCustomColorSchemeEnabled: (
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
  setEventTimerRewardScreenDiscountBackgroundColor: (
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
  setEventTimerRewardScreenPromoBackgroundColor: (
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
  setEventTimerMobileEnabled: (
    mobileEnabled: boolean
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          mobileEnabled,
        }
      }
    }),
  setEventTimerMobileTriggerType: (
    triggerType: MobileTrigger
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerType,
        }
      }
    }),
  setEventTimerMobileImageUrl: (
    imageUrl: string | undefined
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          imageUrl,
        }
      }
    }),
  setEventTimerMobileTriggerText: (
    triggerText: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerText,
        }
      }
    }),
  setEventTimerMobileTriggerFontColor: (
    triggerFontColor: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerFontColor,
        }
      }
    }),
  setEventTimerMobileTriggerBackgroundColor: (
    triggerBackgroundColor: string
  ) => 
    updateWidget(widget => {
      const previousSettings = widget.mobileSettings
        ?? eventTimerWidgetDefaults.mobileSettings

      return {
        ...widget,
        mobileSettings: {
          ...previousSettings,
          triggerBackgroundColor,
        }
      }
    }),
  // General
  setEventTimerBrandingEnabled: (
    brandingEnabled: boolean
  ) => 
    updateWidget(widget => {
      return {
        ...widget,
        brandingEnabled,
      }
    }),
  resetEventTimerColors: () =>
    updateWidget(widget => {
      const defaults = buildEventTimerWidgetSettings()
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
          countdownBackgroundColor:
            defaults.infoSettings.countdownBackgroundColor,
          countdownFontColor:
            defaults.infoSettings.countdownFontColor,
          buttonFontColor:
            defaults.infoSettings.buttonFontColor,
          buttonBackgroundColor:
            defaults.infoSettings.buttonBackgroundColor,
        },
        formSettings: {
          ...widget.formSettings,
          titleFontColor:
            defaults.formSettings.titleFontColor,
          descriptionFontColor:
            defaults.formSettings.descriptionFontColor,
          agreement: {
            ...widget.formSettings.agreement,
            color:
              defaults.formSettings.agreement.color,
          },
          adsInfo: {
            ...widget.formSettings.adsInfo,
            color:
              defaults.formSettings.adsInfo.color,
          },
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
    })
})
