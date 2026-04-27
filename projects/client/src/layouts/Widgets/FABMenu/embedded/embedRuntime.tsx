import { useEffect } from 'react'
import { cn } from '@heroui/theme'

import FabMenuWidget from '../FabMenuWidget'

import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import { fetchFabMenuWidget, selectFetchStatus, selectTriggerPosition } from '../FABMenuSlice'
import {
  selectMegaButtonEnabled,
  selectNotificationTriggerPosition,
} from '@/stores/redux/editorSlice'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

type FABMenuEmbedRuntimeProps = {
  widgetId: string
}

export const FABMenuEmbedRuntime = (
  { widgetId }: FABMenuEmbedRuntimeProps
) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (widgetId) {
      dispatch(fetchFabMenuWidget({
        widgetId: widgetId,
        embedded: true,
      }))
    }
  }, [dispatch, widgetId])

  const buttonPosition =
    useAppSelector(selectTriggerPosition)
  const megaButtonEnabled =
    useAppSelector(selectMegaButtonEnabled)
  const isMobileViewport =
    useIsMobileViewport()
  const notificationTriggerPosition =
    useAppSelector(selectNotificationTriggerPosition)
  const fetchStatus =
    useAppSelector(selectFetchStatus)
  
  if (fetchStatus !== 'succeeded') {
    return null
  }

  const shouldDisplayAsMegaButton =
    !isMobileViewport
    && megaButtonEnabled
    && notificationTriggerPosition
    && notificationTriggerPosition === buttonPosition

  return (
    <div
      className={cn(
        `fixed pointer-events-auto`,
        buttonPosition === 'bottom-right'
          ? 'right-3'
          : 'left-3',
        shouldDisplayAsMegaButton
          ? 'bottom-21 z-203904'
          : 'bottom-3 z-2039283',
      )}
    >
      <FabMenuWidget
        anchorBaseClassName="relative"
        anchorOffsetClassName={{ left: 'left-0', right: 'right-0' }}
        widgetId={widgetId}
        shouldDisplayAsMegaButton={shouldDisplayAsMegaButton}
        triggerPosition={buttonPosition}
      />
    </div>
  )
}
export default FABMenuEmbedRuntime
