import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import Widget from './Widget'
import {
  MobileWidgetTrigger,
  DesktopWidgetTrigger,
} from '@/components/announcement'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendEvent } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

import type {
  AnnouncementWidgetType,
} from '@lemnity/widget-config/widgets/announcement'
import { type AnnouncementWidgetVariant } from '../AnnouncementWidget'
import { MobileProvider } from '@/components/announcement/MobileContext'

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
    rewardScreenEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as AnnouncementWidgetType
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
      event_name: 'announcement.close',
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
      event_name: 'announcement.open',
      widget_id: widgetId,
      project_id: projectId,
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
            <MobileWidgetTrigger>
              <Widget
                ref={widgetRef}
                announementVariant={announementVariant}
                focused={focused}
                onAnnouncementButtonPress={handleAnnouncementButtonPress}
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
              announementVariant={announementVariant}
              focused={focused}
              onAnnouncementButtonPress={handleAnnouncementButtonPress}
            />
          </DesktopWidgetTrigger>
        }
    </> 
  )
}

export default CountdownAnnouncementEmbedRuntime
