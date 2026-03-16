import {
  useRef,
  useState,
} from 'react'
import { useShallow } from 'zustand/react/shallow'

import Widget from './Widget'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'
import MobileWidgetTrigger from './MobileWidgetTrigger'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendEvent, sendPublicRequest } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import type { CountdownForm } from '../CountdownFormScreen'
import { type CountdownWidgetVariant } from '../CountdownAnnouncementWidget'
import { type AnnouncementWidgetVariant } from '../AnnouncementWidget'
import { MobileProvider } from './MobileContext'

export type Rect = {
  width: number
  height: number
}

type EmbedRuntimeProps = {
  isPreview?: boolean
}

export const CountdownAnnouncementEmbedRuntime = (
  props: EmbedRuntimeProps
) => {
  const {
    widgetId,
    projectId,
    format,
    rewardScreenEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as AnnouncementWidgetType
      const appearence = widget.appearence
      const rewardMessageSettings = widget.rewardMessageSettings

      return {
        widgetId: s.settings?.id,
        projectId: s.projectId,
        format: appearence.format,
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
      event_name: format === 'countdown'
        ? 'countdown.close'
        : 'announcement.close',
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
      event_name: format === 'countdown'
        ? 'countdown.open'
        : 'announcement.open',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const [countdownVariant, setCountdownVariant] =
    useState<CountdownWidgetVariant>('countdown')

  const handleCountdownScreenButtonPress = () => {
    if (rewardScreenEnabled) {
      setCountdownVariant('form')
    }
    
    if (!widgetId || !projectId || format !== 'countdown' || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: rewardScreenEnabled
        ? 'countdown.transition_to_form'
        : 'countdown.link_opened',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleFormScreenButtonPress = (formData: CountdownForm) => {
    setCountdownVariant('reward')

    if (!widgetId || !projectId || format !== 'countdown' || props.isPreview) {
      return
    }

    void sendEvent({
      event_name: 'countdown.transition_to_reward',
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

  const [announementVariant, setAnnouncementVariant] =
    useState<AnnouncementWidgetVariant>('announcement')

  const handleAnnouncementButtonPress = () => {
    if (rewardScreenEnabled) {
      setAnnouncementVariant('reward')
    }

    if (
      !widgetId
      || !projectId
      || format !== 'announcement'
      || props.isPreview
    ) {
      return
    }

    void sendEvent({
      event_name: rewardScreenEnabled
        ? 'announcement.transition_to_reward'
        : 'announcement.link_opened',
      widget_id: widgetId,
      project_id: projectId,
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
            <MobileWidgetTrigger
              ref={widgetRef}
              announementVariant={announementVariant}
              countdownVariant={countdownVariant}
              focused={focused}
              onAnnouncementButtonPress={handleAnnouncementButtonPress}
              onCountdownScreenButtonPress={handleCountdownScreenButtonPress}
              onFormScreenButtonPress={handleFormScreenButtonPress}
            />
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
              announementVariant={announementVariant}
              countdownVariant={countdownVariant}
              focused={focused}
              onAnnouncementButtonPress={handleAnnouncementButtonPress}
              onCountdownScreenButtonPress={handleCountdownScreenButtonPress}
              onFormScreenButtonPress={handleFormScreenButtonPress}
            />
          </DesktopWidgetTrigger>
        }
    </> 
  )
}

export default CountdownAnnouncementEmbedRuntime
