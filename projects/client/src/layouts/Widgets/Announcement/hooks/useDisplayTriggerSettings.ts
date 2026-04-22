import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  initialState,
  selectTriggerPosition,
  triggerPositionChanged,
} from '../announcementSlice'

import type {
  PositionType,
} from '@lemnity/widget-config/features/trigger'

const useDisplayTriggerSettings = () => {
  const triggerPosition =
    useAppSelector(selectTriggerPosition)
      || initialState.trigger.triggerPosition

  const dispatch = useAppDispatch()
  
  const onTriggerPositionChange = (value: PositionType) => {
    dispatch(triggerPositionChanged(value))
  }

  return {
    triggerPosition,
    onTriggerPositionChange,
  }
}

export default useDisplayTriggerSettings
