import { useRef, useState } from 'react'

import Widget from './Widget'
import {
  MobileWidgetTrigger,
  DesktopWidgetTrigger,
} from '@/components/announcement'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendEvent } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

import { MobileProvider } from './MobileContext'

import type { VideoWidgetType } from '@lemnity/widget-config/widgets/video-widget'

export type Rect = {
  width: number
  height: number
}

type EmbedRuntimeProps = {
  isPreview?: boolean
}

export const VideoWidgetEmbedRuntime = (props: EmbedRuntimeProps) => {
  const widgetId = useWidgetSettingsStore(s => s.settings?.id)
  const projectId = useWidgetSettingsStore(s => s.projectId)
  const mobileEnabled = useWidgetSettingsStore(
    s => (s.settings?.widget as VideoWidgetType | undefined)?.mobileSettings.mobileEnabled ?? true
  )

  const [focused, setFocused] = useState(false)
  const isMobile = useIsMobileViewport()

  const handleClickOutside = () => {
    setFocused(false)
    if (!widgetId || !projectId || props.isPreview) return
    void sendEvent({
      event_name: 'video_widget.close',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleFocusClick = () => {
    setFocused(true)
    if (!widgetId || !projectId || focused || props.isPreview) return
    void sendEvent({
      event_name: 'video_widget.open',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const handleCtaPress = () => {
    if (!widgetId || !projectId || props.isPreview) return
    void sendEvent({
      event_name: 'video_widget.link_opened',
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

  // Виджет показывается на мобильных устройствах только если включена
  // настройка «Мобильная версия». В превью настроек показываем всегда.
  if (isMobile && !mobileEnabled && !props.isPreview) {
    return null
  }

  return (
    <>
      {isMobile ? (
        <MobileProvider>
          <MobileWidgetTrigger>
            <Widget
              ref={widgetRef}
              announementVariant="announcement"
              focused={focused}
              onAnnouncementButtonPress={handleCtaPress}
            />
          </MobileWidgetTrigger>
        </MobileProvider>
      ) : (
        <DesktopWidgetTrigger
          widgetRef={widgetRef}
          focused={focused}
          onClickOutside={handleClickOutside}
          onFocusClick={handleFocusClick}
          sendBoundingRectToIframe={sendBoundingRectToIframe}
        >
          <Widget
            ref={widgetRef}
            announementVariant="announcement"
            focused={focused}
            onAnnouncementButtonPress={handleCtaPress}
          />
        </DesktopWidgetTrigger>
      )}
    </>
  )
}

export default VideoWidgetEmbedRuntime
