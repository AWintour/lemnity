import { lazy, type JSX, type LazyExoticComponent, type ReactNode } from "react"

import { WidgetTypeEnum } from '@lemnity/api-sdk/models'
import { useAppSelector } from '@/stores/redux/hooks'
import { selectCurrentWidget } from '@/stores/redux/editorSlice'

const NotificationWidget = lazy(
  () => import('@/layouts/Widgets/Notification/WidgetPreview')
)
const AnnouncementWidget = lazy(
  () => import('@/layouts/Widgets/Announcement/WidgetPreview')
)

type WidgetProps = {
  widgetType: WidgetTypeEnum | null
}

const Widget = ({ widgetType }: WidgetProps) => {
  switch (widgetType) {
    case WidgetTypeEnum.NOTIFICATION:
      return <NotificationWidget />
    case WidgetTypeEnum.ANNOUNCEMENT:
      return <AnnouncementWidget />
    default:
      return null
  }
}

type WidgetPreviewProps = {
  children?: ReactNode
}

const WidgetPreview = ({ children }: WidgetPreviewProps) => {
  const widgetType = useAppSelector(selectCurrentWidget)

  return (
    <div className="flex flex-col gap-3.75 h-full">
      <span className="text-[22px] leading-6.5 font-normal text-[#060606]">
        Предпросмотр
      </span>

      {/* {widgetType === WidgetTypeEnum.ACTION_TIMER
       || widgetType === WidgetTypeEnum.ANNOUNCEMENT
       || widgetType === WidgetTypeEnum.NOTIFICATION
         ? null
         : tabs()
      } */}
      {<Widget widgetType={widgetType} />}
    </div>
  )
}

export default WidgetPreview
