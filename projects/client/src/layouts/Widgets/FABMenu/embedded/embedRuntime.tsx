import { useEffect } from 'react'
import FabMenuWidget from '../FabMenuWidget'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import { fetchFabMenuWidget, selectTriggerPosition } from '../FABMenuSlice'

type FABMenuEmbedRuntimeProps = {
  widgetId: string
}

export const FABMenuEmbedRuntime = (
  { widgetId }: FABMenuEmbedRuntimeProps
) => {
  const buttonPosition = useAppSelector(selectTriggerPosition)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (widgetId) {
      dispatch(fetchFabMenuWidget({
        widgetId: widgetId,
        embedded: true,
      }))
    }
  }, [dispatch, widgetId])

  return (
    <div
      className={`fixed ${buttonPosition === 'bottom-right' ? 'right-3' : 'left-3'} bottom-3 pointer-events-auto z-2039283`}
    >
      <FabMenuWidget
        anchorBaseClassName="relative"
        anchorOffsetClassName={{ left: 'left-0', right: 'right-0' }}
        widgetId={widgetId}
      />
    </div>
  )
}
export default FABMenuEmbedRuntime
