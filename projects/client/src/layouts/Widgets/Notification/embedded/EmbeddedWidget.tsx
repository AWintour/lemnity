import '@/layouts/Widgets/Notification/notificationSlice'
import NotificationEmbedRuntime from './embedRuntime'

type EmbedProps = {
  widgetId: string
}

const EmbeddedWidget = ({ widgetId }: EmbedProps) => {
  return <NotificationEmbedRuntime widgetId={widgetId} />
}

export default EmbeddedWidget
