import { useRef, useState } from 'react'

import Widget from './Widget'
import MobileWidgetTrigger from './MobileWidgetTrigger'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'
import { MobileProvider } from './MobileContext'

import { sendEvent, sendPublicRequest } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectWidgetId,
  selectProjectId,
  selectRewardScreenEnabled,
} from '../eventTimerSlice'

import type { CountdownForm } from '../EventTimerFormScreen'
import { type EventTimerWidgetVariant } from '../EventTimerWidget'

type EmbedRuntimeProps = {
  isPreview?: boolean
}

const EventTimerEmbedRuntime = (props: EmbedRuntimeProps) => {
  const widgetId = useAppSelector(selectWidgetId)
  const projectId = useAppSelector(selectProjectId)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)

  const [focused, setFocused] = useState(false)

  const isMobile = useIsMobileViewport()

  const handleClickOutside = () => {
    setFocused(false)

    if (!widgetId || !projectId || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: 'event_timer.close',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleFocusClick = () => {
    setFocused(true)

    if (!widgetId || !projectId || focused || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: 'event-timer.open',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const [countdownVariant, setCountdownVariant] =
    useState<EventTimerWidgetVariant>('countdown')

  const handleCountdownScreenButtonPress = () => {
    if (rewardScreenEnabled) {
      setCountdownVariant('form')
    }
    
    if (!widgetId || !projectId || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: rewardScreenEnabled
        ? 'event_timer.transition_to_form'
        : 'event_timer.link_opened',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleFormScreenButtonPress = (formData: CountdownForm) => {
    setCountdownVariant('reward')

    if (!widgetId || !projectId || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: 'event_timer.transition_to_reward',
      widget_id: widgetId,
      project_id: projectId,
      payload: formData,
    })

    void sendPublicRequest({
      widgetId: widgetId,
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email,
      url: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
    })
  }

  const widgetRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      {isMobile
        ? <MobileProvider>
            <MobileWidgetTrigger>
              <Widget
                ref={widgetRef}
                variant={countdownVariant}
                focused={focused}
                onCountdownScreenButtonPress={handleCountdownScreenButtonPress}
                onFormScreenButtonPress={handleFormScreenButtonPress}
              />
            </MobileWidgetTrigger>
          </MobileProvider>
        : <DesktopWidgetTrigger
            widgetRef={widgetRef}
            focused={focused}
            onClickOutside={handleClickOutside}
            onFocusClick={handleFocusClick}
          >
            <Widget
              ref={widgetRef}
              variant={countdownVariant}
              focused={focused}
              onCountdownScreenButtonPress={handleCountdownScreenButtonPress}
              onFormScreenButtonPress={handleFormScreenButtonPress}
            />
          </DesktopWidgetTrigger>
        }
    </> 
  )
}

export default EventTimerEmbedRuntime
