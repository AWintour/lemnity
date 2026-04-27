import '@/layouts/Widgets/FABMenu/FABMenuSlice'
import FABMenuEmbedRuntime from './embedRuntime'

type EmbedProps = {
  widgetId: string
}

const EmbeddedWidget = ({ widgetId }: EmbedProps) => {
  return <FABMenuEmbedRuntime widgetId={widgetId} />
}

export default EmbeddedWidget
