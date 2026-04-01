import {
 InfoSettings,
 WidgetAppearanceSettings,
 RewardMessageSettings,
 MobileVersionSettings,
} from '@/components/settings'
import { DisableBranding } from '@/components'
import { useInfoScreenSettings } from './hooks/useInfoScreenSettings'
import { useWidgetAppearenceSettings } from './hooks/useWidgetAppearenceSettings'
import { useRewardScreenSettings } from './hooks/useRewardScreenSettings'

const AnnouncementWidgetSettings = () => {
  const appearenceSettings = useWidgetAppearenceSettings()
  const infoScreenSettings = useInfoScreenSettings()
  const rewardScreenSettings = useRewardScreenSettings()

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      <WidgetAppearanceSettings {...appearenceSettings}/>
      <InfoSettings variant='announcement' {...infoScreenSettings} />
      <RewardMessageSettings {...rewardScreenSettings}/>
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
