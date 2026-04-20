import '@/layouts/Widgets/ActionTimer/actionTimerSlice'
import ActionTimerEmbedRuntime from './embedRuntime'
import { DialogContext } from './DialogContext'

type EmbedProps = {
  widgetId: string
  container: ShadowRoot
}

const EmbeddedWidget = ({ widgetId, container }: EmbedProps) => {
  return (
    <DialogContext.Provider value={container}>
      <ActionTimerEmbedRuntime widgetId={widgetId} />
    </DialogContext.Provider>
  )
}

export default EmbeddedWidget
