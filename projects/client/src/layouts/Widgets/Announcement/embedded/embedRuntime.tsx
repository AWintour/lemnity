import { useEffect, useRef, useState } from 'react'

import Widget from './Widget'
import MobileWidgetTrigger from './MobileWidgetTrigger'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'

import { sendEvent } from '@/common/api/publicApi'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectWidgetId,
  selectProjectId,
  selectRewardScreenEnabled,
  selectFetchStatus,
  fetchAnnouncementWidget,
} from '../announcementSlice'

import { type AnnouncementWidgetVariant } from '../AnnouncementWidget'
import { MobileProvider } from './MobileContext'

type EmbedRuntimeProps = {
  isPreview?: boolean
  widgetId?: string
}

const AnnouncementEmbedRuntime = (props: EmbedRuntimeProps) => {
  const fetchStatus = useAppSelector(selectFetchStatus)
  const readyToRender = props.isPreview || fetchStatus === 'succeeded'

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!props.isPreview && props.widgetId) {
      dispatch(fetchAnnouncementWidget({
        widgetId: props.widgetId,
        embedded: true,
      }))
    }
  }, [dispatch, props.isPreview, props.widgetId])

  const widgetId = useAppSelector(selectWidgetId)
  const projectId = useAppSelector(selectProjectId)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)

  const [focused, setFocused] = useState(false)
  const [announementVariant, setAnnouncementVariant] =
    useState<AnnouncementWidgetVariant>('announcement')

  const isMobile = useIsMobileViewport()
  const widgetRef = useRef<HTMLDivElement | null>(null)

  if (!readyToRender) {
    return null
  }

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
