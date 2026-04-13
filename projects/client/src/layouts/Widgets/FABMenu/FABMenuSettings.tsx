import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import FABMenuDisplaySurface from './FABMenuDisplaySurface'
import FABMenuField from './FABMenuField'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import { fetchFabMenuWidget, selectFetchStatus } from './FABMenuSlice'

const FABMenuSettings = () => {
  const dispatch = useAppDispatch()
  const fetchStatus = useAppSelector(selectFetchStatus)
  const { widgetId } = useParams()

  useEffect(() => {
    if (fetchStatus === 'idle' && widgetId && widgetId.length > 0) {
      dispatch(fetchFabMenuWidget({ widgetId }))
    }
  }, [fetchStatus, dispatch, widgetId])

  return (
    <div className='flex h-full flex-col gap-2.5'>
      <FABMenuDisplaySurface />
      <FABMenuField />
    </div>
  )
}

export default FABMenuSettings
