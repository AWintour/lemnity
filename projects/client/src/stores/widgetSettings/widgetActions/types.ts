import type { WidgetTypeEnum } from '@lemnity/api-sdk'
import type {
  ActionTimerWidgetSettings,
  ActionTimerImagePosition,
  ColorScheme,
  FABMenuSectorItem,
  MessageKey,
  SectorItem,
  WidgetSpecificSettings
} from '@/stores/widgetSettings/types'
import type { IconName } from '@/components/IconPicker'
import type {
  Content,
  ContentAlignment,
  FontWeight,
  MobileTrigger,
} from '@lemnity/widget-config/widgets/announcement'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import type {
  Notification,
  Position,
} from '@lemnity/widget-config/widgets/notification'

export type WidgetUpdater = (
  mutator: (settings: WidgetSpecificSettings) => WidgetSpecificSettings
) => void

export type TypedWidgetUpdater<T extends WidgetSpecificSettings> = (
  mutator: (settings: T) => T
) => void

// this is pure madness but here we are
export type WidgetActions = {
  setWidgetType: (
    widgetType: WidgetTypeEnum,
    nextSettings: WidgetSpecificSettings
  ) => void
  // FAB Menu actions
  setFABMenuSectors: (items: FABMenuSectorItem[]) => void
  updateFABMenuSector: (
    index: number,
    updates: Partial<FABMenuSectorItem>
  ) => void
  addFABMenuSector: (item: FABMenuSectorItem) => void
  deleteFABMenuSector: (id: string) => void
  setFABMenuButtonTextColor: (color: string) => void
  setFABMenuButtonBackgroundColor: (color: string) => void
  setFABMenuTriggerText: (text: string) => void
  setFABMenuTriggerIcon: (icon: IconName) => void
  // Wheel of fortune actions
  setWheelRandomize: (randomize: boolean) => void
  setWheelSectors: (items: SectorItem[]) => void
  updateWheelSector: (index: number, updates: Partial<SectorItem>) => void
  addWheelSector: (item: SectorItem) => void
  deleteWheelSector: (id: string) => void
  setWheelMessage: (key: Exclude<MessageKey, 'onWin'>, enabled: boolean, text: string) => void
  setWheelOnWinEnabled: (enabled: boolean) => void
  setWheelOnWinText: (text: string) => void
  setWheelOnWinTextSize: (textSize: number) => void
  setWheelOnWinDescription: (description: string) => void
  setWheelOnWinDescriptionSize: (descriptionSize: number) => void
  setWheelOnWinColorSchemeEnabled: (enabled: boolean) => void
  setWheelOnWinColorScheme: (scheme: ColorScheme) => void
  setWheelOnWinDiscountColors: (color: string, bgColor: string) => void
  setWheelOnWinPromoColors: (color: string, bgColor: string) => void
  // Action Timer actions
  updateActionTimer: (
    updates: Partial<ActionTimerWidgetSettings['countdown']>
  ) => void
  setActionTimerImage: (imageUrl?: string) => void
  setTextBeforeCountdown: (textBeforeCountdown: string) => void
  setTextBeforeCountdownColor: (textBeforeCountdownColor: string) => void
  setImagePosition: (position: ActionTimerImagePosition) => void
  setWheelBorderColor: (color: string) => void
  setWheelBorderThickness: (thickness: number) => void
  setWheelCardRadius: (radius: number) => void
  setWheelEventMode: (enabled: boolean) => void
  // Announcement actions
  setAnnouncementCompanyLogoEnabled: (enabled: boolean) => void
  setAnnouncementCompanyLogoUrl: (url: string | undefined) => void
  setAnnouncementColorScheme: (colorScheme: ColorScheme) => void
  setAnnouncementBackgroundColor: (color: string) => void
  setAnnouncementBorderRadius: (radius: number) => void
  // InfoSettingsSchema
  setAnnouncementContentType: (
    contentType: Content
  ) => void
  setAnnouncementContentAlignment: (
    alignment: ContentAlignment
  ) => void
  setAnnouncementContentUrl: (
    url: string | undefined
  ) => void
  setAnnouncementInfoScreenTitle: (
    title: string
  ) => void
  setAnnouncementInfoScreenTitleColor: (
    titleColor: string
  ) => void
  setAnnouncementInfoScreenTitleFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementInfoScreenDescription: (
    description: string
  ) => void
  setAnnouncementInfoScreenDescriptionFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementInfoScreenDescriptionColor: (
    descriptionColor: string
  ) => void
  setAnnouncementInfoScreenButtonText: (
    buttonText: string
  ) => void
  setAnnouncementInfoScreenButtonFontColor: (
    buttonFontColor: string
  ) => void
  setAnnouncementInfoScreenButtonBackgroundColor: (
    buttonBackgroundColor: string
  ) => void
  setAnnouncementInfoScreenIcon: (
    icon: Icon
  ) => void
  setAnnouncementInfoScreenLink: (
    link: string
  ) => void
  // RewardMessageSettingsSchema
  setAnnouncementRewardScreenEnabled: (
    enabled: boolean
  ) => void
  setAnnouncementRewardScreenTitle: (
    title: string
  ) => void
  setAnnouncementRewardScreenTitleFontSize: (
    titleFontSize: number
  ) => void
  setAnnouncementRewardScreenTitleFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementRewardScreenTitleFontColor: (
    titleFontColor: string
  ) => void
  setAnnouncementRewardScreenDescription: (
    description: string
  ) => void
  setAnnouncementRewardScreenDescriptionFontSize: (
    descriptionFontSize: number
  ) => void
  setAnnouncementRewardScreenDescriptionFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementRewardScreenDescriptionFontColor: (
    descriptionFontColor: string
  ) => void
  setAnnouncementRewardScreenDiscount: (
    discount: string
  ) => void
  setAnnouncementRewardScreenDiscountFontSize: (
    discountFontSize: number
  ) => void
  setAnnouncementRewardScreenDiscountFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementRewardScreenDiscountFontColor: (
    discountFontColor: string
  ) => void
  setAnnouncementRewardScreenPromo: (
    promo: string
  ) => void
  setAnnouncementRewardScreenPromoFontSize: (
    promoFontSize: number
  ) => void
  setAnnouncementRewardScreenPromoFontWeight: (
    weight: FontWeight
  ) => void
  setAnnouncementRewardScreenPromoFontColor: (
    promoFontColor: string
  ) => void
  setAnnouncementRewardScreenCustomColorSchemeEnabled: (
    customColorSchemeEnabled: boolean
  ) => void
  setAnnouncementRewardScreenDiscountBackgroundColor: (
    customDiscountBackgroundColor: string
  ) => void
  setAnnouncementRewardScreenPromoBackgroundColor: (
    customPromoBackgroundColor: string
  ) => void
  setAnnouncementMobileEnabled: (
    mobileEnabled: boolean
  ) => void
  setAnnouncementMobileTriggerType: (
    triggerType: MobileTrigger
  ) => void
  setAnnouncementMobileImageUrl: (
    imageUrl: string | undefined
  ) => void
  setAnnouncementMobileTriggerText: (
    triggerText: string
  ) => void
  setAnnouncementMobileTriggerFontColor: (
    triggerFontColor: string
  ) => void
  setAnnouncementMobileTriggerBackgroundColor: (
    triggerBackgroundColor: string
  ) => void
  setAnnouncementBrandingEnabled: (
    brandingEnabled: boolean
  ) => void
  resetAnnouncementColors: () => void
  // ---------------------------------------------------------------------------
  // Video Widget actions (вертикальный сторис-видеоплеер)
  setVideoWidgetCompanyLogoEnabled: (enabled: boolean) => void
  setVideoWidgetCompanyLogoUrl: (url: string | undefined) => void
  setVideoWidgetCompanyLogoSize: (size: number) => void
  setVideoWidgetColorScheme: (colorScheme: ColorScheme) => void
  setVideoWidgetBackgroundColor: (color: string) => void
  setVideoWidgetBorderRadius: (radius: number) => void
  setVideoWidgetPosition: (position: 'bottom-left' | 'bottom-right') => void
  // VideoSettings
  setVideoWidgetVideos: (videos: string[]) => void
  addVideoWidgetVideo: (url: string) => void
  removeVideoWidgetVideo: (index: number) => void
  setVideoWidgetPosterEnabled: (posterEnabled: boolean) => void
  setVideoWidgetPosterUrl: (url: string | undefined) => void
  setVideoWidgetMuted: (muted: boolean) => void
  setVideoWidgetLoop: (loop: boolean) => void
  setVideoWidgetShowControls: (showControls: boolean) => void
  setVideoWidgetShowProgressBar: (showProgressBar: boolean) => void
  // Overlay (заголовок + CTA)
  setVideoWidgetInfoScreenTitle: (title: string) => void
  setVideoWidgetInfoScreenTitleFontWeight: (weight: FontWeight) => void
  setVideoWidgetInfoScreenTitleColor: (titleColor: string) => void
  setVideoWidgetInfoScreenButtonText: (buttonText: string) => void
  setVideoWidgetInfoScreenButtonFontColor: (buttonFontColor: string) => void
  setVideoWidgetInfoScreenButtonBackgroundColor: (
    buttonBackgroundColor: string
  ) => void
  setVideoWidgetInfoScreenIcon: (icon: Icon) => void
  setVideoWidgetInfoScreenLink: (link: string) => void
  // Mobile
  setVideoWidgetMobileEnabled: (mobileEnabled: boolean) => void
  setVideoWidgetMobileTriggerType: (triggerType: MobileTrigger) => void
  setVideoWidgetMobileImageUrl: (imageUrl: string | undefined) => void
  setVideoWidgetMobileTriggerText: (triggerText: string) => void
  setVideoWidgetMobileTriggerFontColor: (triggerFontColor: string) => void
  setVideoWidgetMobileTriggerBackgroundColor: (
    triggerBackgroundColor: string
  ) => void
  setVideoWidgetFormEnabled: (formEnabled: boolean) => void
  setVideoWidgetFormTitleFontSize: (formTitleFontSize: number) => void
  setVideoWidgetBrandingEnabled: (brandingEnabled: boolean) => void
  resetVideoWidgetColors: () => void
  // ---------------------------------------------------------------------------
  // Event Timer actions
  setEventTimerCompanyLogoEnabled: (
    enabled: boolean
  ) => void
  setEventTimerCompanyLogoUrl: (
    url: string | undefined
  ) => void
  setEventTimerColorScheme: (
    colorScheme: ColorScheme
  ) => void
  setEventTimerBackgroundColor: (
    color: string
  ) => void
  setEventTimerBorderRadius: (
    radius: number
  ) => void
  setEventTimerContentEnabled: (
    contentEnabled: boolean
  ) => void
  setEventTimerContentUrl: (
    url: string | undefined
  ) => void
  setEventTimerInfoScreenTitle: (
    title: string
  ) => void
  setEventTimerInfoScreenTitleFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerInfoScreenTitleColor: (
    titleColor: string
  ) => void
  setEventTimerInfoScreenDescriptionFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerInfoScreenDescription: (
    description: string
  ) => void
  setEventTimerInfoScreenDescriptionColor: (
    descriptionColor: string
  ) => void
  setEventTimerInfoScreenCountdownEnabled: (
    countdownEnabled: boolean
  ) => void
  setEventTimerInfoScreenCountdownDate: (
    countdownDate: string
  ) => void
  setEventTimerInfoScreenCountdownBackgroundColor: (
    countdownBackgroundColor: string
  ) => void
  setEventTimerInfoScreenCountdownFontColor: (
    countdownFontColor: string
  ) => void
  setEventTimerInfoScreenButtonText: (
    buttonText: string
  ) => void
  setEventTimerInfoScreenButtonFontColor: (
    buttonFontColor: string
  ) => void
  setEventTimerInfoScreenButtonBackgroundColor: (
    buttonBackgroundColor: string
  ) => void
  setEventTimerInfoScreenIcon: (
    icon: Icon
  ) => void
  setEventTimerInfoScreenLink: (
    link: string
  ) => void
  setEventTimerFormScreenTitle: (
    title: string
  ) => void
  setEventTimerFormScreenTitleFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerFormScreenTitleFontColor: (
    titleFontColor: string
  ) => void
  setEventTimerFormScreenDescription: (
    description: string
  ) => void
  setEventTimerFormScreenDescriptionFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerFormScreenDescriptionFontColor: (
    descriptionFontColor: string
  ) => void
  setEventTimerFormScreenContactAcquisitionEnabled: (
    contactAcquisitionEnabled: boolean
  ) => void
  setEventTimerFormScreenNameFieldEnabled: (
    nameFieldEnabled: boolean
  ) => void
  setEventTimerFormScreenNameFieldRequired: (
    nameFieldRequired: boolean
  ) => void
  setEventTimerFormScreenEmailFieldEnabled: (
    emailFieldEnabled: boolean
  ) => void
  setEventTimerFormScreenEmailFieldRequired: (
    emailFieldRequired: boolean
  ) => void
  setEventTimerFormScreenPhoneFieldEnabled: (
    phoneFieldEnabled: boolean
  ) => void
  setEventTimerFormScreenPhoneFieldRequired: (
    phoneFieldRequired: boolean
  ) => void
  setEventTimerFormScreenAgreementEnabled: (
    enabled: boolean
  ) => void
  setEventTimerFormScreenAgreementPolicyUrl: (
    policyUrl: string
  ) => void
  setEventTimerFormScreenAgreementUrl: (
    agreementUrl: string
  ) => void
  setEventTimerFormScreenAgreementColor: (
    color: string
  ) => void
  setEventTimerFormScreenAdsInfoEnabled: (
    enabled: boolean
  ) => void
  setEventTimerFormScreenAdsInfoPolicyUrl: (
    policyUrl: string
  ) => void
  setEventTimerFormScreenAdsInfoColor: (
    color: string
  ) => void
  setEventTimerFormScreenAdsInfo: (
    enabled: boolean,
    policyUrl: string,
    color: string
  ) => void
  setEventTimerRewardScreenEnabled: (
    enabled: boolean
  ) => void
  setEventTimerRewardScreenTitle: (
    title: string
  ) => void
  setEventTimerRewardScreenTitleFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerRewardScreenTitleFontSize: (
    titleFontSize: number
  ) => void
  setEventTimerRewardScreenTitleFontColor: (
    titleFontColor: string
  ) => void
  setEventTimerRewardScreenDescription: (
    description: string
  ) => void
  setEventTimerRewardScreenDescriptionFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerRewardScreenDescriptionFontSize: (
    descriptionFontSize: number
  ) => void
  setEventTimerRewardScreenDescriptionFontColor: (
    descriptionFontColor: string
  ) => void
  setEventTimerRewardScreenDiscount: (
    discount: string
  ) => void
  setEventTimerRewardScreenDiscountFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerRewardScreenDiscountFontSize: (
    discountFontSize: number
  ) => void
  setEventTimerRewardScreenDiscountFontColor: (
    discountFontColor: string
  ) => void
  setEventTimerRewardScreenPromo: (
    promo: string
  ) => void
  setEventTimerRewardScreenPromoFontWeight: (
    weight: FontWeight
  ) => void
  setEventTimerRewardScreenPromoFontSize: (
    promoFontSize: number
  ) => void
  setEventTimerRewardScreenPromoFontColor: (
    promoFontColor: string
  ) => void
  setEventTimerRewardScreenCustomColorSchemeEnabled: (
    customColorSchemeEnabled: boolean
  ) => void
  setEventTimerRewardScreenDiscountBackgroundColor: (
    customDiscountBackgroundColor: string
  ) => void
  setEventTimerRewardScreenPromoBackgroundColor: (
    customPromoBackgroundColor: string
  ) => void
  setEventTimerMobileEnabled: (
    mobileEnabled: boolean
  ) => void
  setEventTimerMobileTriggerType: (
    triggerType: MobileTrigger
  ) => void
  setEventTimerMobileImageUrl: (
    imageUrl: string | undefined
  ) => void
  setEventTimerMobileTriggerText: (
    triggerText: string
  ) => void
  setEventTimerMobileTriggerFontColor: (
    triggerFontColor: string
  ) => void
  setEventTimerMobileTriggerBackgroundColor: (
    triggerBackgroundColor: string
  ) => void
  setEventTimerBrandingEnabled: (
    brandingEnabled: boolean
  ) => void
  resetEventTimerColors: () => void
  // ---------------------------------------------------------------------------
  // Notification actions
  setNotificationTriggerText: (
   triggerText: string
  ) => void
  setNotificationTriggerFontColor: (
   triggerFontColor: string
  ) => void
  setNotificationTriggerIcon: (
   triggerIcon: Icon
  ) => void
  setNotificationTriggerBackgroundColor: (
   triggerBackgroundColor: string
  ) => void
  setNotificationTriggerPosition: (
    triggerPosition: Position
  ) => void
  setNotificationDelay: (
   delay: number
  ) => void
  setNotifications: (
    notifications: Notification[]
  ) => void
  addNotification: (
    notification: Notification
  ) => void
  deleteNotification: (
    id: string
  ) => void
  updateNotification: (
    index: number,
    updates: Partial<Notification>
  ) => void
  setNotificationBrandingEnabled: (
    brandingEnabled: boolean
  ) => void
  // ---------------------------------------------------------------------------
  // Callback actions (обратный звонок) — единый patch-апдейтер
  setCallbackPatch: (patch: Record<string, unknown>) => void
}

export type WidgetSlice = {
  widgetSettingsUpdater: WidgetUpdater
} & WidgetActions
