import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
 InfoSettings,
 WidgetAppearanceSettings,
 RewardMessageSettings,
 MobileTriggerSettings,
} from '@/components/settings'
import { DisableBranding } from '@/components'
import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectBrandingEnabled,
  brandingEnabledChanged,
  fetchAnnouncementWidget,
  selectFetchStatus,
} from './announcementSlice'
import { useInfoScreenSettings } from './hooks/useInfoScreenSettings'
import { useWidgetAppearenceSettings } from './hooks/useWidgetAppearenceSettings'
import { useRewardScreenSettings } from './hooks/useRewardScreenSettings'
import { useMobileTriggerSettings } from './hooks/useMobileTriggerSettings'

const AnnouncementWidgetSettings = () => {
  const dispatch = useAppDispatch()
  const fetchStatus = useAppSelector(selectFetchStatus)

  const { widgetId } = useParams()

  useEffect(() => {
    if (fetchStatus === 'idle' && widgetId && widgetId.length > 0) {
      dispatch(fetchAnnouncementWidget(widgetId))
    }
  }, [fetchStatus, dispatch, widgetId])

  const appearenceSettings = useWidgetAppearenceSettings()
  const infoScreenSettings = useInfoScreenSettings()
  const rewardScreenSettings = useRewardScreenSettings()
  const mobileTriggerSettings = useMobileTriggerSettings()

  const brandingEnabled = useAppSelector(selectBrandingEnabled)

  const setBrandingEnabled = (enabled: boolean) => {
    dispatch(brandingEnabledChanged(enabled))
  }

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      <WidgetAppearanceSettings {...appearenceSettings}/>
      <InfoSettings variant='announcement' {...infoScreenSettings} />
      <RewardMessageSettings {...rewardScreenSettings}/>
      <MobileTriggerSettings {...mobileTriggerSettings}/>
      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default AnnouncementWidgetSettings
