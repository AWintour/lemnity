import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { AgreementAndPolicy } from '@/components'
import {
  ContactAcquisitionSettings,
  RewardMessageSettings,
} from '@/components/settings'
import CountdownSettings from '@/components/settings/InfoSettings/CountdownSettings'
import FormSettings from './FormSettings'
import WidgetAppearenceSettings from './WidgetAppearenceSettings'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import { useRewardMessageSettings } from './hooks/useRewardMessageSettings'
import {
  useContactAcquisitionSettings,
} from './hooks/useContactAcquisitionSettings'
import { useAgreeementSettings } from './hooks/useAgreeementSettings'
import { useAdsInfoSettings } from './hooks/useAdsInfoSettings'
import { useCountdownSettings } from './hooks/useCountdownSettings'
import { useFormSettings } from './hooks/useFormSettings'
import {
  useWidgetAppearenceSettings,
} from './hooks/useWidgetAppearenceSettings'
import {
  fetchActionTimerWidget,
  selectFetchStatus,
} from './actionTimerSlice'

const ActionTimerWidgetSettings = () => {
  const dispatch = useAppDispatch()

  const fetchStatus = useAppSelector(selectFetchStatus)

  const { widgetId } = useParams()
  
  useEffect(() => {
    if (fetchStatus === 'idle' && widgetId && widgetId.length > 0) {
      dispatch(fetchActionTimerWidget({ widgetId }))
    }
  }, [fetchStatus, dispatch, widgetId])

  const appearenceSettings = useWidgetAppearenceSettings()
  const formSettings = useFormSettings()
  const countdownSettings = useCountdownSettings()
  const contactAcquisitinSettings = useContactAcquisitionSettings()
  const agreementSettings = useAgreeementSettings()
  const adsInfoSettings = useAdsInfoSettings()
  const rewardScreenSettings = useRewardMessageSettings()
  
  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <WidgetAppearenceSettings {...appearenceSettings} />
      <FormSettings {...formSettings} />
      <CountdownSettings {...countdownSettings}/>
      <ContactAcquisitionSettings {...contactAcquisitinSettings} />
      <AgreementAndPolicy {...agreementSettings} />
      <AgreementAndPolicy {...adsInfoSettings}/>
      <RewardMessageSettings {...rewardScreenSettings} />
    </div>
  )
}

export default ActionTimerWidgetSettings
