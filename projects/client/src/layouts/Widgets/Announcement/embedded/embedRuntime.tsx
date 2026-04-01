import { useRef, useState } from 'react'

import Widget from './Widget'
import MobileWidgetTrigger from './MobileWidgetTrigger'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'

import { sendEvent } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectWidgetId,
  selectProjectId,
  selectRewardScreenEnabled,
} from '../announcementSlice'

import { type AnnouncementWidgetVariant } from '../AnnouncementWidget'
import { MobileProvider } from './MobileContext'

export type Rect = {
  width: number
  height: number
}

type EmbedRuntimeProps = {
  isPreview?: boolean
}

const AnnouncementEmbedRuntime = (props: EmbedRuntimeProps) => {
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

export default AnnouncementEmbedRuntime
