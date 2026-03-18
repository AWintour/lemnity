import {
  useRef,
  useState,
} from 'react'
import { useShallow } from 'zustand/react/shallow'

import Widget from './Widget'
import {
  MobileWidgetTrigger,
  DesktopWidgetTrigger,
} from '@/components/announcement'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendEvent, sendPublicRequest } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import type { CountdownForm } from '../EventTimerFormScreen'
import { type EventTimerWidgetVariant } from '../EventTimerWidget'
import { MobileProvider } from './MobileContext'

export type Rect = {
  width: number
  height: number
}

type EmbedRuntimeProps = {
  isPreview?: boolean
}

const EventTimerEmbedRuntime = (props: EmbedRuntimeProps) => {
  const {
    widgetId,
    projectId,
    rewardScreenEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as EventTimertWidgetType
      const rewardMessageSettings = widget.rewardMessageSettings

      return {
        widgetId: s.settings?.id,
        projectId: s.projectId,
        rewardScreenEnabled: rewardMessageSettings.rewardScreenEnabled,
      }
    })
  )

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

  const sendBoundingRectToIframe = (rect: Rect, offset: number) => {
    window.parent.postMessage({
      scope: 'lemnity-embed',
      type: 'interactive-region',
      lock: false,
      rect: {
        left: window.innerWidth - rect.width - offset,
        top: window.innerHeight - rect.height - offset,
        width: rect.width,
        height: rect.height,
      },
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
            sendBoundingRectToIframe={sendBoundingRectToIframe}
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
