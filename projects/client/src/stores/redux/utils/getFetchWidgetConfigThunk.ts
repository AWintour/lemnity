import type { WidgetTypeId } from '@lemnity/widget-config/widgets/base'

export const getFetchWidgetConfigThunk = async (widget: WidgetTypeId) => {
  switch (widget) {
    case 'ANNOUNCEMENT':
      const { fetchAnnouncementWidget } = await import(
        '@/layouts/Widgets/Announcement/announcementSlice'
      )
      return fetchAnnouncementWidget
    case 'EVENT_TIMER':
      const { fetchEventTimerWidget } = await import(
        '@/layouts/Widgets/EventTimer/eventTimerSlice'
      )
      return fetchEventTimerWidget
    case 'NOTIFICATION':
      const { fetchNotificationWidget } = await import(
        '@/layouts/Widgets/Notification/notificationSlice'
      )
      return fetchNotificationWidget
  }
}
