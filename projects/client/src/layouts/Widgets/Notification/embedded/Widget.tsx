import type { CSSProperties } from 'react'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { cn } from '@heroui/theme'

import FreePlanBrandingLink from '@/components/FreePlanBrandingLink'
import SvgIcon from '@/components/SvgIcon'

import { useViewportWidth } from '@/hooks/useViewportWidth'
import { sendEvent } from '@/common/api/publicApi'
import { useAppSelector } from '@/stores/redux/hooks'
import { selectWidgetId, selectProjectId } from '../notificationSlice'

import iconBell from '@/assets/icons/bell-filled.svg'

import type {
  Notification,
} from '@lemnity/widget-config/widgets/notification'

const EmptyNotificationList = () => {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center text-[#979797]',
      )}
    >
      <div className='w-6 h-6 mt-9.5'>
        <SvgIcon src={iconBell} />
      </div>

      <span className='mt-5 mb-12.5 text-base leading-3.75'>
        Нет новых уведомлений
      </span>
    </div>
  )
}

type NotificationListItemProps = {
  notification: Notification
  showSeparator?: boolean
}

const NotificationListItem = (props: NotificationListItemProps) => {
  const widgetId = useAppSelector(selectWidgetId)
  const projectId = useAppSelector(selectProjectId)

  const urlStyle: CSSProperties = {
    fontSize: props.notification.urlFontSize,
  }

  const handleUrlClick = () => {
    window.open(props.notification.url, '_blank')

    if (!widgetId || !projectId) {
      return
    }

    void sendEvent({
      event_name: 'notification.link_opened',
      widget_id: widgetId,
      project_id: projectId,
      payload: {
        url: props.notification.url,
      }
    })
  }

  return (
    <div className='flex flex-col'>
      <span className='text-base font-[350] leading-5.5'>
        {props.notification.text}
      </span>
      <span className='text-base leading-5 mt-1'>
        <span
          className='text-[#5951E5] cursor-pointer'
          style={urlStyle}
          onClick={handleUrlClick}
        >
          {props.notification.urlText}
        </span>
      </span>

      {props.showSeparator && <hr className='border-[#E8E8E8] my-2.5' />}
    </div>
  )
}

type WidgetProps = {
  mobile?: boolean
  open: boolean
  liveNotifications: Notification[]
  brandingEnabled: boolean
}

const Widget = (props: WidgetProps) => {
  const viewportWidth = useViewportWidth()
  const mobileScale =
    // 2 20 px margins on x axis = 40 px
    // the width of the widget is w-89.25 = 357
    // 1% of 357 = 3.57
    viewportWidth >= 357
      ? undefined
      : Math.floor((viewportWidth - 20) / 3.57)
  // height minus paddings/gaps etc
  const mobileHeight = window.innerHeight
    - 24
    - 62
    - 12
    - 12
  const mobileStyle: CSSProperties | undefined = props.mobile
    ? {
        transform: mobileScale
          ? `scale(${mobileScale}%)`
          : undefined,
        maxHeight: mobileHeight,
        overflowY: 'auto',
        backgroundColor: 'transparent',
        borderRadius: '10px',
        overflow: 'hidden',
      }
    : undefined
  const mobileNotificationContainerScrollHeight: CSSProperties | undefined =
    props.mobile
      ? { height: mobileHeight - 32 - 12 - 10 - 10 - 4 }
      : undefined

  const motionInitial = { opacity: 0, translateY: '12px' }
  const motionAnimate = { opacity: 1, translateY: '0' }
  const motionExit = { opacity: 0, translateY: '12px' }
  const motionTransition: Transition = { duration: 0.3, ease: 'easeInOut' }

  const shouldShowNotificatinList =
    props.liveNotifications && props.liveNotifications.length > 0

  return (
    <AnimatePresence>
      {props.open && (
        <div style={mobileStyle}>
          <motion.div
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionTransition}
            className={cn(
              'w-89.25 shrink-0 p-4 flex flex-col',
              'bg-white rounded-[10px]',
              'shadow-[0px_8px_15px_6px_rgba(0,0,0,0.15)]',
            )}
          >
            <div
              className={cn(
                'w-full mt-4 mb-0',
                !shouldShowNotificatinList && 'flex items-center justify-center',
                props.mobile && 'overflow-y-auto',
              )}
              style={mobileNotificationContainerScrollHeight}
            >
              {shouldShowNotificatinList
                ? props.liveNotifications.map((notification, index) => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      showSeparator={index !== (props.liveNotifications.length - 1)}
                    />
                  ))
                : <EmptyNotificationList />
              }
            </div>

            {props.brandingEnabled && (
              <div className='w-full mt-2.5 flex justify-center'>
                <FreePlanBrandingLink />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Widget
