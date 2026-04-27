import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { DisableBranding } from '@/components'
import {
  WidgetAppearanceSettings,
  FormSettings,
  InfoSettings,
  RewardMessageSettings,
  MobileTriggerSettings,
} from '@/components/settings'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectBrandingEnabled,
  brandingEnabledChanged,
  fetchEventTimerWidget,
  selectFetchStatus,
} from './eventTimerSlice'
import { useWidgetAppearenceSettings } from './hooks/useWidgetAppearenceSettings'
import { useInfoScreenSettings } from './hooks/useInfoScreenSettings'
import { useRewardScreenSettings } from './hooks/useRewardScreenSettings'
import { useMobileTriggerSettings } from './hooks/useMobileTriggerSettings'
import { useFormScreenSettings } from './hooks/useFormScreenSettings'

const EventTimerWidgetSettings = () => {
  const dispatch = useAppDispatch()
  const fetchStatus = useAppSelector(selectFetchStatus)

  const { widgetId } = useParams()

  useEffect(() => {
    if (fetchStatus === 'idle' && widgetId && widgetId.length > 0) {
      dispatch(fetchEventTimerWidget({ widgetId }))
    }
  }, [fetchStatus, dispatch, widgetId])

  const brandingEnabled = useAppSelector(selectBrandingEnabled)
  
  const setBrandingEnabled = (enabled: boolean) => {
    dispatch(brandingEnabledChanged(enabled))
  }

  const appearenceSettings = useWidgetAppearenceSettings()
  const infoScreenSettings = useInfoScreenSettings()
  const rewardScreenSettings = useRewardScreenSettings()
  const formScreenSettings = useFormScreenSettings()
  const mobileTriggerSettings = useMobileTriggerSettings()

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      <WidgetAppearanceSettings {...appearenceSettings} />
      <InfoSettings variant='countdown' {...infoScreenSettings} />
      <FormSettings {...formScreenSettings} />
      <RewardMessageSettings {...rewardScreenSettings} />
      <MobileTriggerSettings {...mobileTriggerSettings} />
      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default EventTimerWidgetSettings
