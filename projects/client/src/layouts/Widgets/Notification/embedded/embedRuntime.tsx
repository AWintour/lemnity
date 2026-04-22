import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { cn } from '@heroui/theme'

import Widget from './Widget'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'
import MobileWidgetTrigger from './MobileWidgetTrigger'

import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { sendEvent } from '@/common/api/publicApi'
import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectAllNotifications,
  selectBrandingEnabled,
  selectDelay,
  selectFetchStatus,
  selectTriggerBackgroundColor,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerText,
  selectTriggerPosition,
  selectWidgetId,
  selectProjectId,
  fetchNotificationWidget,
} from '../notificationSlice'

import type {
  Notification,
} from '@lemnity/widget-config/widgets/notification'
import { DateTime } from 'luxon'

type LocalStorageData = { [key: string]: Date }
const localStorageKey = 'lemnity-notifications'

type NotificationEmbedRuntimeProps = {
  preview?: boolean
  widgetId?: string
}

const NotificationEmbedRuntime = (props: NotificationEmbedRuntimeProps) => {
  const fetchStatus = useAppSelector(selectFetchStatus)
  const readyToRender = props.preview || fetchStatus === 'succeeded'

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!props.preview && props.widgetId) {
      dispatch(fetchNotificationWidget({
        widgetId: props.widgetId,
        embedded: true,
      }))
    }
  }, [dispatch, props.preview, props.widgetId])

  const triggerText = useAppSelector(selectTriggerText)
  const triggerFontColor = useAppSelector(selectTriggerFontColor)
  const triggerBackgroundColor = useAppSelector(selectTriggerBackgroundColor)
  const triggerIcon = useAppSelector(selectTriggerIcon)
  const delay = useAppSelector(selectDelay)
  const brandingEnabled = useAppSelector(selectBrandingEnabled)
  const notifications = useAppSelector(selectAllNotifications)
  const triggerPosition = useAppSelector(selectTriggerPosition)
  const widgetId = useAppSelector(selectWidgetId)
  const projectId = useAppSelector(selectProjectId)

  const [open, setOpen] = useState(false)
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const newNotificationIndexRef = useRef<number | null>(null)

  const isMobileViewport = useIsMobileViewport()

  useEffect(() => {
    if (!readyToRender) {
      return
    }

    setLiveNotifications([])

    let localStorageData: LocalStorageData | undefined

    if (!props.preview) {
      try {
        const storage = localStorage.getItem(localStorageKey)
        if (storage) localStorageData = JSON.parse(storage)
      }
      // eslint-disable-next-line no-empty
      catch {}

      const now = new Date(Date.now())

      if (!localStorageData) {
        const storage: LocalStorageData = {}
  
        notifications.forEach((notification) => {
          storage[notification.id] = now
        })
  
        localStorage.setItem(localStorageKey, JSON.stringify(storage))
      }
    }

    const timers = notifications
      .filter((notification) => {
        // skip the expiration mechanic in preview
        if (props.preview || notification.expiration === 'indefinite') {
          return notification
        }

        if (!localStorageData) {
          return notification
        }

        const firstShown = DateTime.fromJSDate(
          new Date(localStorageData[notification.id])
        )
        const now = DateTime.now()

        if (!firstShown) {
          return
        }

        const diff = now.diff(firstShown, 'hours').hours
        const expiration = parseInt(notification.expiration)
        
        // stale notifications are filtered out
        if (diff > expiration) {
          return
        }

        return notification
      })
      .map((notification, index) => {
        let timeout: number| undefined = undefined

        if (localStorageData) {
          const firstShown = localStorageData[notification.id]

          if (firstShown) {
            timeout = 0
          }
          else {
            if (!newNotificationIndexRef.current) {
              newNotificationIndexRef.current = index
            }

            timeout = (index - newNotificationIndexRef.current + 1) * delay * 1000
            localStorageData[notification.id] = new Date(Date.now())
            localStorage.setItem(
              localStorageKey,
              JSON.stringify(localStorageData)
            )
          }
        }
        else {
          timeout = (index + 1) * delay * 1000
        }

        return setTimeout(() => {
          setLiveNotifications(prev => [...prev, notification])
        }, timeout)
      })

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [notifications, delay])

  if (!readyToRender) {
    return null
  }

  const toggleOpen = () => {
    setOpen(!open)

    if (!widgetId || !projectId) {
      return
    }

    void sendEvent({
      event_name: !open ? 'notification.open' : 'notification.close',
      widget_id: widgetId,
      project_id: projectId,
    })
  }

  const triggerStyle: CSSProperties = {
    color: triggerFontColor,
    backgroundColor: triggerBackgroundColor,
    willChange: 'transform',
  }
  const closeIconStyle: CSSProperties = {
    color: triggerFontColor,
  }
  const triggerHoverTextStyle: CSSProperties = {
    backgroundColor:
      `color-mix(in oklab, ${triggerBackgroundColor} 14%, transparent)`,
    color: triggerBackgroundColor,
  }
  const triggerHoverDivStyle = {
    clipPath: triggerPosition === 'bottom-right'
      // group-hover:-translate-x-[73%]
      ? 'polygon(-73% 0%, 30% 0%, 30% 100%, -73% 100%)'
      // group-hover:translate-x-[73%]
      : 'polygon(73% 0%, 173% 0%, 173% 100%, 73% 100%)',
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col gap-3',
        props.preview ? 'relative' : 'fixed bottom-3 z-2039283',
        triggerPosition === 'bottom-right' ? 'right-3' : 'left-3',
      )}
    >
      {isMobileViewport
        ? <MobileWidgetTrigger
            ref={triggerRef}
            open={open}
            numberOfNotifications={liveNotifications.length}
            toggleOpen={toggleOpen}
            triggerStyle={triggerStyle}
            triggerText={triggerText}
          >
            <Widget
              open={open}
              mobile={isMobileViewport}
              liveNotifications={liveNotifications}
              brandingEnabled={brandingEnabled}
            />
          </MobileWidgetTrigger>
        : <DesktopWidgetTrigger
            ref={triggerRef}
            closeIconStyle={closeIconStyle}
            numberOfNotifications={liveNotifications.length}
            toggleOpen={toggleOpen}
            open={open}
            triggerHoverDivStyle={triggerHoverDivStyle}
            triggerHoverTextStyle={triggerHoverTextStyle}
            triggerIcon={triggerIcon}
            triggerPosition={triggerPosition}
            triggerStyle={triggerStyle}
            triggerText={triggerText}
          >
            <Widget
              open={open}
              liveNotifications={liveNotifications}
              brandingEnabled={brandingEnabled}
            />
          </DesktopWidgetTrigger>
      }
    </div>
  )
}

export default NotificationEmbedRuntime
