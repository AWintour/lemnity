import { useShallow } from 'zustand/react/shallow'

import {
 InfoSettings,
 WidgetAppearanceSettings,
 RewardMessageSettings,
 MobileVersionSettings,
} from '@/components/settings'
import DisableBranding from '@/layouts/WidgetSettings/FieldsSettingsTab/DisableBranding/DisableBranding'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import { announcementWidgetDefaults } from './defaults'

const AnnouncementWidgetSettings = () => {
  const {
    mobileEnabled,
    triggerType,
    imageUrl,
    triggerText,
    triggerFontColor,
    triggerBackgroundColor,
    brandingEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as AnnouncementWidgetType
      const mobile = widget.mobileSettings
      const defaults = announcementWidgetDefaults.mobileSettings

      return {
        mobileEnabled: mobile?.mobileEnabled
          ?? defaults.mobileEnabled,
        triggerType: mobile?.triggerType
          ?? defaults.triggerType,
        imageUrl: mobile?.imageUrl
          ?? defaults.imageUrl,
        triggerText: mobile?.triggerText
          ?? defaults.triggerText,
        triggerFontColor: mobile?.triggerFontColor
          ?? defaults.triggerFontColor,
        triggerBackgroundColor: mobile?.triggerBackgroundColor
          ?? defaults.triggerBackgroundColor,

        brandingEnabled: widget.brandingEnabled
          ?? announcementWidgetDefaults.brandingEnabled,
      }
    })
  )

  const setCompanyLogoEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementCompanyLogoEnabled
  )
  const setCompanyLogoUrl = useWidgetSettingsStore(
    s => s.setAnnouncementCompanyLogoUrl
  )
  const setWidgetColorScheme = useWidgetSettingsStore(
    s => s.setAnnouncementColorScheme
  )
  const setContentType = useWidgetSettingsStore(
    s => s.setAnnouncementContentType
  )
  const setContentAlignment = useWidgetSettingsStore(
    s => s.setAnnouncementContentAlignment
  )
  const setWidgetBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementBackgroundColor
  )
  const setBorderRadius = useWidgetSettingsStore(
    s => s.setAnnouncementBorderRadius
  )
  const resetColors = useWidgetSettingsStore(
    s => s.resetAnnouncementColors
  )
  const setInfoScreenContentUrl = useWidgetSettingsStore(
    s => s.setAnnouncementContentUrl
  )
  const setInfoScreenTitle = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitle
  )
  const setInfoScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitleFontWeight
  )
  const setInfoScreenTitleColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenTitleColor
  )
  const setInfoScreenDescription = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescription
  )
  const setInfoScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescriptionFontWeight
  )
  const setInfoScreenDescriptionColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenDescriptionColor
  )
  const setInfoScreenButtonText = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonText
  )
  const setInfoScreenButtonFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonFontColor
  )
  const setInfoScreenButtonBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementInfoScreenButtonBackgroundColor
  )
  const setInfoScreenButtonIcon = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenIcon
  )
  const setInfoScreenButtonLink = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenLink
  )
  const setRewardScreenEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenEnabled
  )
  const setRewardScreenTitle = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitle
  )
  const setRewardScreenTitleFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontSize
  )
  const setRewardScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontWeight
  )
  const setRewardScreenTitleFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenTitleFontColor
  )
  const setRewardScreenDescription = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescription
  )
  const setRewardScreenDescriptionFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontSize
  )
  const setRewardScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontWeight
  )
  const setRewardScreenDescriptionFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDescriptionFontColor
  )
  const setRewardScreenDiscount = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscount
  )
  const setRewardScreenDiscountFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontSize
  )
  const setRewardScreenDiscountFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontWeight
  )
  const setRewardScreenDiscountFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountFontColor
  )
  const setRewardScreenPromo = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromo
  )
  const setRewardScreenPromoFontSize = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontSize
  )
  const setRewardScreenPromoFontWeight = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontWeight
  )
  const setRewardScreenPromoFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoFontColor
  )
  const setRewardScreenCustomColorSchemeEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenCustomColorSchemeEnabled
  )
  const setRewardScreenCustomDiscountBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenDiscountBackgroundColor
  )
  const setRewardScreenCustomPromoBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementRewardScreenPromoBackgroundColor
  )
  const setMobileEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementMobileEnabled
  )
  const setMobileTriggerType = useWidgetSettingsStore(
    s => s.setAnnouncementMobileTriggerType
  )
  const setMobileImageUrl = useWidgetSettingsStore(
    s => s.setAnnouncementMobileImageUrl
  )
  const setMobileTriggerText = useWidgetSettingsStore(
    s => s.setAnnouncementMobileTriggerText
  )
  const setMobileTriggerFontColor = useWidgetSettingsStore(
    s => s.setAnnouncementMobileTriggerFontColor
  )
  const setMobileTriggerBackgroundColor = useWidgetSettingsStore(
    s => s.setAnnouncementMobileTriggerBackgroundColor
  )
  const setBrandingEnabled = useWidgetSettingsStore(
    s => s.setAnnouncementBrandingEnabled
  )

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      <WidgetAppearanceSettings
        defaults={announcementWidgetDefaults}
        resetColors={resetColors}
        setBorderRadius={setBorderRadius}
        setCompanyLogoEnabled={setCompanyLogoEnabled}
        setCompanyLogoUrl={setCompanyLogoUrl}
        setWidgetBackgroundColor={setWidgetBackgroundColor}
        setWidgetColorScheme={setWidgetColorScheme}
        setContentType={setContentType}
      />
      <InfoSettings
        defaults={announcementWidgetDefaults}
        variant='announcement'
        setButtonBackgroundColor={setInfoScreenButtonBackgroundColor}
        setButtonFontColor={setInfoScreenButtonFontColor}
        setButtonIcon={setInfoScreenButtonIcon}
        setButtonLink={setInfoScreenButtonLink}
        setButtonText={setInfoScreenButtonText}
        setDescription={setInfoScreenDescription}
        setDescriptionColor={setInfoScreenDescriptionColor}
        setDescriptionFontWeight={setInfoScreenDescriptionFontWeight}
        setTitle={setInfoScreenTitle}
        setTitleColor={setInfoScreenTitleColor}
        setTitleFontWeight={setInfoScreenTitleFontWeight}
        setContentAlignment={setContentAlignment}
        setContentType={setContentType}
        setContentUrl={setInfoScreenContentUrl}
      />
      <RewardMessageSettings
        defaults={announcementWidgetDefaults}
        setCustomColorSchemeEnabled={setRewardScreenCustomColorSchemeEnabled}
        setCustomDiscountBackgroundColor={
          setRewardScreenCustomDiscountBackgroundColor
        }
        setCustomPromoBackgroundColor={
          setRewardScreenCustomPromoBackgroundColor
        }
        setDescription={setRewardScreenDescription}
        setDescriptionFontColor={setRewardScreenDescriptionFontColor}
        setDescriptionFontSize={setRewardScreenDescriptionFontSize}
        setDescriptionFontWeight={setRewardScreenDescriptionFontWeight}
        setDiscount={setRewardScreenDiscount}
        setDiscountFontColor={setRewardScreenDiscountFontColor}
        setDiscountFontSize={setRewardScreenDiscountFontSize}
        setDiscountFontWeight={setRewardScreenDiscountFontWeight}
        setPromo={setRewardScreenPromo}
        setPromoFontColor={setRewardScreenPromoFontColor}
        setPromoFontSize={setRewardScreenPromoFontSize}
        setPromoFontWeight={setRewardScreenPromoFontWeight}
        setRewardScreenEnabled={setRewardScreenEnabled}
        setTitle={setRewardScreenTitle}
        setTitleFontColor={setRewardScreenTitleFontColor}
        setTitleFontSize={setRewardScreenTitleFontSize}
        setTitleFontWeight={setRewardScreenTitleFontWeight}
      />
      <MobileVersionSettings
        enabled={mobileEnabled}
        triggerType={triggerType}
        imageUrl={imageUrl}
        triggerText={triggerText}
        triggerFontColor={triggerFontColor}
        triggerBackgroundColor={
          triggerBackgroundColor
        }
        onToggle={setMobileEnabled}
        onTriggerTypeChange={setMobileTriggerType}
        onImageUrlChange={setMobileImageUrl}
        onTriggerTextChange={setMobileTriggerText}
        onTriggerFontColorChange={setMobileTriggerFontColor}
        onTriggerBackgroundColorChange={setMobileTriggerBackgroundColor}
      />
      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default AnnouncementWidgetSettings
