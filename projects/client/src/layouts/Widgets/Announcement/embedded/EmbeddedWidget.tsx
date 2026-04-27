import '@/layouts/Widgets/Announcement/announcementSlice'
import AnnouncementEmbedRuntime from './embedRuntime'

type EmbedProps = {
  widgetId: string
}

const EmbeddedWidget = ({ widgetId }: EmbedProps) => {
  return <AnnouncementEmbedRuntime widgetId={widgetId} />
}

export default EmbeddedWidget
