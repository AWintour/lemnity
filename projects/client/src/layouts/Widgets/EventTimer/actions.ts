 import type {
  TypedWidgetUpdater,
} from '@/stores/widgetSettings/widgetActions/types'
import {
  type EventTimertWidgetType,
  type ContentAlignment,
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
  setAnnouncementCompanyLogoEnabled: (enabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoEnabled: enabled,
      }
    })),
  setAnnouncementCompanyLogoUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        companyLogoUrl: url,
      }
    })),
  setAnnouncementColorScheme: (colorScheme: ColorScheme) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        colorScheme,
      }
    })),
  setAnnouncementBackgroundColor: (color: string) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        backgroundColor: color,
      }
    })),
  setAnnouncementBorderRadius: (radius: number) =>
    updateWidget(widget => ({
      ...widget,
      appearence: {
        ...widget.appearence,
        borderRadius: radius,
      }
    })),
  // InfoSettingsSchema
  setAnnouncementContentEnabled: (contentEnabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: {
        ...widget.infoSettings,
        contentEnabled,
      }
    })),
  setAnnouncementContentUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: {
        ...widget.infoSettings,
        contentUrl: url,
      }
    })),
  setAnnouncementInfoScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          title,
        }
      }
    }),
  setAnnouncementInfoScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setAnnouncementInfoScreenTitleColor: (titleColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          titleColor,
        }
      }
    }),
  setAnnouncementInfoScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setAnnouncementInfoScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          description,
        }
      }
    }),
  setAnnouncementInfoScreenDescriptionColor: (descriptionColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          descriptionColor,
        }
      }
    }),
  setAnnouncementInfoScreenCountdownEnabled: (countdownEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownEnabled,
        }
      }
    }),
  setAnnouncementInfoScreenCountdownDate: (countdownDate: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownDate,
        }
      }
    }),
  setAnnouncementInfoScreenCountdownBackgroundColor: (
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
  setAnnouncementInfoScreenCountdownFontColor: (countdownFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          countdownFontColor,
        }
      }
    }),
  setAnnouncementInfoScreenButtonText: (buttonText: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonText,
        }
      }
    }),
  setAnnouncementInfoScreenButtonFontColor: (buttonFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          buttonFontColor,
        }
      }
    }),
  setAnnouncementInfoScreenButtonBackgroundColor: (
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
  setAnnouncementInfoScreenIcon: (icon: Icon) =>
    updateWidget(widget => {
      return {
        ...widget,
        infoSettings: {
          ...widget.infoSettings,
          icon,
        }
      }
    }),
  setAnnouncementInfoScreenLink: (link: string) =>
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
  setAnnouncementFormScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          title,
        }
      }
    }),
  setAnnouncementFormScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setAnnouncementFormScreenTitleFontColor: (titleFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          titleFontColor,
        }
      }
    }),
  setAnnouncementFormScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          description,
        }
      }
    }),
  setAnnouncementFormScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setAnnouncementFormScreenDescriptionFontColor: (
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
  setAnnouncementFormScreenContactAcquisitionEnabled: (
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
  setAnnouncementFormScreenNameFieldEnabled: (nameFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          nameFieldEnabled,
        }
      }
    }),
  setAnnouncementFormScreenNameFieldRequired: (nameFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          nameFieldRequired,
        }
      }
    }),
  setAnnouncementFormScreenEmailFieldEnabled: (emailFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          emailFieldEnabled,
        }
      }
    }),
  setAnnouncementFormScreenEmailFieldRequired: (emailFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          emailFieldRequired,
        }
      }
    }),
  setAnnouncementFormScreenPhoneFieldEnabled: (phoneFieldEnabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          phoneFieldEnabled,
        }
      }
    }),
  setAnnouncementFormScreenPhoneFieldRequired: (phoneFieldRequired: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        formSettings: {
          ...widget.formSettings,
          phoneFieldRequired,
        }
      }
    }),
  setAnnouncementFormScreenAgreementEnabled: (enabled: boolean) =>
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
  setAnnouncementFormScreenAgreementPolicyUrl: (policyUrl: string) =>
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
  setAnnouncementFormScreenAgreementUrl: (agreementUrl: string) =>
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
  setAnnouncementFormScreenAgreementColor: (color: string) =>
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
  setAnnouncementFormScreenAdsInfoEnabled: (enabled: boolean) =>
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
  setAnnouncementFormScreenAdsInfoPolicyUrl: (policyUrl: string) =>
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
  setAnnouncementFormScreenAdsInfoColor: (color: string) =>
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
  setAnnouncementFormScreenAdsInfo: (
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
  setAnnouncementRewardScreenEnabled: (enabled: boolean) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          rewardScreenEnabled: enabled,
        }
      }
    }),
  setAnnouncementRewardScreenTitle: (title: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          title,
        }
      }
    }),
  setAnnouncementRewardScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontWeight: weight,
        }
      }
    }),
  setAnnouncementRewardScreenTitleFontSize: (titleFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontSize,
        }
      }
    }),
  setAnnouncementRewardScreenTitleFontColor: (titleFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          titleFontColor,
        }
      }
    }),
  setAnnouncementRewardScreenDescription: (description: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          description,
        }
      }
    }),
  setAnnouncementRewardScreenDescriptionFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          descriptionFontWeight: weight,
        }
      }
    }),
  setAnnouncementRewardScreenDescriptionFontSize: (
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
  setAnnouncementRewardScreenDescriptionFontColor: (
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
  setAnnouncementRewardScreenDiscount: (discount: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discount,
        }
      }
    }),
  setAnnouncementRewardScreenDiscountFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontWeight: weight,
        }
      }
    }),
  setAnnouncementRewardScreenDiscountFontSize: (discountFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontSize,
        }
      }
    }),
  setAnnouncementRewardScreenDiscountFontColor: (discountFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          discountFontColor,
        }
      }
    }),
  setAnnouncementRewardScreenPromo: (promo: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promo,
        }
      }
    }),
  setAnnouncementRewardScreenPromoFontWeight: (weight: FontWeight) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontWeight: weight,
        }
      }
    }),
  setAnnouncementRewardScreenPromoFontSize: (promoFontSize: number) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontSize,
        }
      }
    }),
  setAnnouncementRewardScreenPromoFontColor: (promoFontColor: string) =>
    updateWidget(widget => {
      return {
        ...widget,
        rewardMessageSettings: {
          ...widget.rewardMessageSettings,
          promoFontColor,
        }
      }
    }),
  setAnnouncementRewardScreenCustomColorSchemeEnabled: (
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
  setAnnouncementRewardScreenDiscountBackgroundColor: (
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
  setAnnouncementRewardScreenPromoBackgroundColor: (
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
  setAnnouncementMobileEnabled: (
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
  setAnnouncementMobileTriggerType: (
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
  setAnnouncementMobileImageUrl: (
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
  setAnnouncementMobileTriggerText: (
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
  setAnnouncementMobileTriggerFontColor: (
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
  setAnnouncementMobileTriggerBackgroundColor: (
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
  setAnnouncementBrandingEnabled: (
    brandingEnabled: boolean
  ) => 
    updateWidget(widget => {
      return {
        ...widget,
        brandingEnabled,
      }
    }),
  resetAnnouncementColors: () =>
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
