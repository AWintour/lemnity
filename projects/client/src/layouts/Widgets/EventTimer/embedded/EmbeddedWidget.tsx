import '@/layouts/Widgets/EventTimer/eventTimerSlice'
import EventTimerEmbedRuntime from './embedRuntime'

type EmbedProps = {
  widgetId: string
}

const EmbeddedWidget = ({ widgetId }: EmbedProps) => {
  return <EventTimerEmbedRuntime widgetId={widgetId} />
}

export default EmbeddedWidget
