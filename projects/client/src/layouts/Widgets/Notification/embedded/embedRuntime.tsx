import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import Widget from './Widget'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'
import MobileWidgetTrigger from './MobileWidgetTrigger'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { sendEvent } from '@/common/api/publicApi'

import type {
  Notification,
  NotificationWidgetType,
} from '@lemnity/widget-config/widgets/notification'
import { notificationWidgetDefaults as defaults } from '../defaults'
import { DateTime } from 'luxon'

type LocalStorageData = { [key: string]: Date }
const localStorageKey = 'lemnity-notifications'

type NotificationEmbedRuntimeProps = {
  preview?: boolean
}

const NotificationEmbedRuntime = (props: NotificationEmbedRuntimeProps) => {
  const {
    widgetId,
    projectId,
    triggerText,
    triggerFontColor,
    triggerIcon,
    triggerBackgroundColor,
    triggerPosition,
    delay,
    notifications,
    brandingEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as NotificationWidgetType)

      return {
        widgetId: s.settings?.id,
        projectId: s.projectId,

        triggerText: settings.triggerText
          ?? defaults.triggerText,
        triggerFontColor: settings.triggerFontColor
          ?? defaults.triggerFontColor,
        triggerIcon: settings.triggerIcon
          ?? defaults.triggerIcon,
        triggerBackgroundColor: settings.triggerBackgroundColor
          ?? defaults.triggerBackgroundColor,
        triggerPosition: settings.triggerPosition
          ?? defaults.triggerPosition,

        delay: settings.delay
          ?? defaults.delay,

        notifications: settings.notifications
          ?? [],

        brandingEnabled: settings.brandingEnabled
          ?? defaults.brandingEnabled,
      }
    })
  )

  const [open, setOpen] = useState(false)
  // const [isHoveringOnTrigger, setIsHoveringOnTrigger] = useState(false)
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const mouseLeaveTimeoutRef = useRef<number | null>(null)
  const widgetOpenTimeoutRef = useRef<number | null>(null)
  const newNotificationIndexRef = useRef<number | null>(null)
  // i am going insane
  // embedManager needs to go, man, what the hell is this
  const firstMountCrutchRef = useRef(false)

  const isMobileViewport = useIsMobileViewport()

  useEffect(() => {
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

  const sendBoundingRectToIframe = useCallback((
    clipOnlyTrigger?: boolean,
    hoveringOnTrigger?: boolean
  ) => {
    if (!containerRef.current || !triggerRef.current) {
      return
    }

    const isBottomRight = triggerPosition === 'bottom-right'
    const offset = 24  // left-6 / right-6 / bottom-6
    const boundingRect = containerRef.current.getBoundingClientRect()
    const triggerWidth = triggerRef.current.clientWidth
    const triggerHeight = triggerRef.current.clientHeight

    let left: number
    let top: number

    if (open) {
      left = isBottomRight
        ? window.innerWidth - boundingRect.width - offset
        : 0
      top = window.innerHeight - boundingRect.height - offset
    }
    else {
      const width = clipOnlyTrigger && !hoveringOnTrigger
        ? triggerWidth + 8 + offset  // show just the trigger
        : 233 + offset  // allow enough space for both trigger and hover label

      left = isBottomRight
        ? window.innerWidth - width
        : 0
      // 72 instead of 62 to accomodate for hover:scale-105
      top = window.innerHeight - triggerHeight - 10
    }

    const message = {
      scope: 'lemnity-embed',
      type: 'interactive-region',
      lock: false,
      rect: {
        left: left,
        top: top,
        width: open
          ? boundingRect.width + offset
          : clipOnlyTrigger && !hoveringOnTrigger
            // ? 70    // show just the trigger
            ? triggerWidth + 8    // show just the trigger
            : 233,  // allow enough space for both trigger and hover label
        height: open ? boundingRect.height + offset : triggerHeight + 10,
      },
    }

    window.parent.postMessage(message)
    // console.log(message.rect)
    // console.log(`open ${open} clipOnlyTrigger ${clipOnlyTrigger} hoveringOnTrigger ${hoveringOnTrigger} clipOnlyTrigger && !hoveringOnTrigger ${clipOnlyTrigger && !hoveringOnTrigger}`)
  }, [open, triggerPosition])

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

  const handleTriggerMouseEnter = () => {
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current)
    }

    sendBoundingRectToIframe(undefined, false)
    // setIsHoveringOnTrigger(true)
    // console.log(isHoveringOnTrigger)
  }

  const handleTriggerMouseLeave = () => {
    // setIsHoveringOnTrigger(false)

    mouseLeaveTimeoutRef.current = setTimeout(() => {
      sendBoundingRectToIframe(true)
      mouseLeaveTimeoutRef.current = null
    }, 300)
  }

  useEffect(() => {
    // at this point keeping it as an effect was more readable
    if (!firstMountCrutchRef.current) {
      return
    }

    if (isMobileViewport) {
      return
    }

    if (!open) {
      widgetOpenTimeoutRef.current = setTimeout(sendBoundingRectToIframe, 300)
      return
    }
    
    if (widgetOpenTimeoutRef.current) {
      clearTimeout(widgetOpenTimeoutRef.current)
    }

    sendBoundingRectToIframe()
  }, [open])

  useEffect(() => {
    if (isMobileViewport) {
      return
    }
    sendBoundingRectToIframe(true)
  }, [liveNotifications, isMobileViewport])

  useEffect(() => {
    sendBoundingRectToIframe(true)
    firstMountCrutchRef.current = true
  }, [])

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
      data-lemnity-interactive
      data-lemnity-notification={isMobileViewport ? undefined : true}
      className={cn(
        'flex flex-col gap-3',
        props.preview ? 'relative' : 'fixed bottom-3',
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
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
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
