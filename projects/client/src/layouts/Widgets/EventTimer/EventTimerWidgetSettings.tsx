import { useShallow } from 'zustand/react/shallow'

import {
  WidgetAppearanceSettings,
  FormSettings,
  InfoSettings,
  RewardMessageSettings,
  MobileVersionSettings,
} from '@/components/settings'
import DisableBranding from '@/layouts/WidgetSettings/FieldsSettingsTab/DisableBranding/DisableBranding'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import { eventTimerWidgetDefaults } from './defaults'

const EventTimerWidgetSettings = () => {
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
      const defaults = eventTimerWidgetDefaults.mobileSettings

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
        brandingEnabled: widget.brandingEnabled,
      }
    })
  )

  const setCompanyLogoEnabled = useWidgetSettingsStore(
    s => s.setEventTimerCompanyLogoEnabled
  )
  const setCompanyLogoUrl = useWidgetSettingsStore(
    s => s.setEventTimerCompanyLogoUrl
  )
  const setWidgetColorScheme = useWidgetSettingsStore(
    s => s.setEventTimerColorScheme
  )
  const setWidgetBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerBackgroundColor
  )
  const setBorderRadius = useWidgetSettingsStore(
    s => s.setEventTimerBorderRadius
  )
  const resetColors = useWidgetSettingsStore(
    s => s.resetEventTimerColors
  )
  const setInfoScreenContentEnabled = useWidgetSettingsStore(
    s => s.setEventTimerContentEnabled
  )
  const setInfoScreenContentUrl = useWidgetSettingsStore(
    s => s.setEventTimerContentUrl
  )
  const setInfoScreenTitle = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenTitle
  )
  const setInfoScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenTitleFontWeight
  )
  const setInfoScreenTitleColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenTitleColor
  )
  const setInfoScreenDescription = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenDescription
  )
  const setInfoScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenDescriptionFontWeight
  )
  const setInfoScreenDescriptionColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenDescriptionColor
  )
  const setInfoScreenCountdownEnabled = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenCountdownEnabled
  )
  const setInfoScreenCountdownDate = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenCountdownDate
  )
  const setInfoScreenCountdownFontColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenCountdownFontColor
  )
  const setInfoScreenCountdownBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenCountdownBackgroundColor
  )
  const setInfoScreenButtonText = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenButtonText
  )
  const setInfoScreenButtonFontColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenButtonFontColor
  )
  const setInfoScreenButtonBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenButtonBackgroundColor
  )
  const setInfoScreenButtonIcon = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenIcon
  )
  const setInfoScreenButtonLink = useWidgetSettingsStore(
    s => s.setEventTimerInfoScreenLink
  )
  const setRewardScreenEnabled = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenEnabled
  )
  const setRewardScreenTitle = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenTitle
  )
  const setRewardScreenTitleFontSize = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenTitleFontSize
  )
  const setRewardScreenTitleFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenTitleFontWeight
  )
  const setRewardScreenTitleFontColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenTitleFontColor
  )
  const setRewardScreenDescription = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDescription
  )
  const setRewardScreenDescriptionFontSize = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDescriptionFontSize
  )
  const setRewardScreenDescriptionFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDescriptionFontWeight
  )
  const setRewardScreenDescriptionFontColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDescriptionFontColor
  )
  const setRewardScreenDiscount = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDiscount
  )
  const setRewardScreenDiscountFontSize = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDiscountFontSize
  )
  const setRewardScreenDiscountFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDiscountFontWeight
  )
  const setRewardScreenDiscountFontColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDiscountFontColor
  )
  const setRewardScreenPromo = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenPromo
  )
  const setRewardScreenPromoFontSize = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenPromoFontSize
  )
  const setRewardScreenPromoFontWeight = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenPromoFontWeight
  )
  const setRewardScreenPromoFontColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenPromoFontColor
  )
  const setRewardScreenCustomColorSchemeEnabled = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenCustomColorSchemeEnabled
  )
  const setRewardScreenCustomDiscountBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenDiscountBackgroundColor
  )
  const setRewardScreenCustomPromoBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerRewardScreenPromoBackgroundColor
  )
  const setMobileEnabled = useWidgetSettingsStore(
    s => s.setEventTimerMobileEnabled
  )
  const setMobileTriggerType = useWidgetSettingsStore(
    s => s.setEventTimerMobileTriggerType
  )
  const setMobileImageUrl = useWidgetSettingsStore(
    s => s.setEventTimerMobileImageUrl
  )
  const setMobileTriggerText = useWidgetSettingsStore(
    s => s.setEventTimerMobileTriggerText
  )
  const setMobileTriggerFontColor = useWidgetSettingsStore(
    s => s.setEventTimerMobileTriggerFontColor
  )
  const setMobileTriggerBackgroundColor = useWidgetSettingsStore(
    s => s.setEventTimerMobileTriggerBackgroundColor
  )
  const setBrandingEnabled = useWidgetSettingsStore(
    s => s.setEventTimerBrandingEnabled
  )

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      <WidgetAppearanceSettings
        defaults={eventTimerWidgetDefaults}
        resetColors={resetColors}
        setBorderRadius={setBorderRadius}
        setCompanyLogoEnabled={setCompanyLogoEnabled}
        setCompanyLogoUrl={setCompanyLogoUrl}
        setWidgetBackgroundColor={setWidgetBackgroundColor}
        setWidgetColorScheme={setWidgetColorScheme}
      />
      <InfoSettings
        variant='countdown'
        defaults={eventTimerWidgetDefaults}
        setButtonBackgroundColor={setInfoScreenButtonBackgroundColor}
        setButtonFontColor={setInfoScreenButtonFontColor}
        setButtonIcon={setInfoScreenButtonIcon}
        setButtonLink={setInfoScreenButtonLink}
        setButtonText={setInfoScreenButtonText}
        setContentEnabled={setInfoScreenContentEnabled}
        setContentUrl={setInfoScreenContentUrl}
        setDescription={setInfoScreenDescription}
        setDescriptionColor={setInfoScreenDescriptionColor}
        setDescriptionFontWeight={setInfoScreenDescriptionFontWeight}
        setTitle={setInfoScreenTitle}
        setTitleColor={setInfoScreenTitleColor}
        setTitleFontWeight={setInfoScreenTitleFontWeight}
        setCountdownBackgroundColor={setInfoScreenCountdownBackgroundColor}
        setCountdownDate={setInfoScreenCountdownDate}
        setCountdownEnabled={setInfoScreenCountdownEnabled}
        setCountdownFontColor={setInfoScreenCountdownFontColor}
      />
      <FormSettings defaults={eventTimerWidgetDefaults} />
      <RewardMessageSettings
        defaults={eventTimerWidgetDefaults}
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

export default EventTimerWidgetSettings
