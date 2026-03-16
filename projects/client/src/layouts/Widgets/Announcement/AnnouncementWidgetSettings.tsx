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
      <WidgetAppearanceSettings />
      <InfoSettings
        defaults={announcementWidgetDefaults}
        variant='announcement'
      />
      <RewardMessageSettings defaults={announcementWidgetDefaults} />
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
