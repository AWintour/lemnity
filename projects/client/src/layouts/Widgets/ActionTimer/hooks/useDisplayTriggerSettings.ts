import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  initialState,
  selectTriggerBackgroundColor,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerPosition,
  selectTriggerText,
  selectTriggerVariant,
  selectTrriggerImageUrl,
  triggerBackgroundColorChanged,
  triggerFontColorChanged,
  triggerIconChanged,
  triggerImageUrlChanged,
  triggerPositionChanged,
  triggerTextChanged,
  triggerVariantChanged,
} from '../actionTimerSlice'

import type {
  PositionType,
  TriggerVariant,
} from '@lemnity/widget-config/features/trigger'
import type { Icon } from '@lemnity/widget-config/widgets/base'

const useDisplayTriggerSettings = () => {
  const triggerFontColor =
    useAppSelector(selectTriggerFontColor)
      || initialState.trigger.triggerFontColor
  const triggerBackgroundColor =
    useAppSelector(selectTriggerBackgroundColor)
      || initialState.trigger.triggerBackgroundColor
  const triggerText =
    useAppSelector(selectTriggerText)
      ?? initialState.trigger.triggerText
  const triggerVariant =
    useAppSelector(selectTriggerVariant)
      || initialState.trigger.triggerVariant
  const triggerImageUrl =
    useAppSelector(selectTrriggerImageUrl)
      || initialState.trigger.triggerImageUrl
  const triggerIcon =
    useAppSelector(selectTriggerIcon)
      || initialState.trigger.triggerIcon
  const triggerPosition =
    useAppSelector(selectTriggerPosition)
      || initialState.trigger.triggerPosition

  const dispatch = useAppDispatch()
  
  const onTriggerFontColorChange = (value: string) => {
    dispatch(triggerFontColorChanged(value))
  }
  const onTriggeBackgroundColorChange = (value: string) => {
    dispatch(triggerBackgroundColorChanged(value))
  }
  const onTriggerTextChange = (value: string) => {
    dispatch(triggerTextChanged(value))
  }
  const onTriggerVariantChange = (value: TriggerVariant) => {
    dispatch(triggerVariantChanged(value))
  }
  const onTriggerImageUrlChange = (value: string) => {
    dispatch(triggerImageUrlChanged(value))
  }
  const onTriggerIconChange = (value: Icon) => {
    dispatch(triggerIconChanged(value))
  }
  const onTriggerPositionChange = (value: PositionType) => {
    dispatch(triggerPositionChanged(value))
  }

  return {
    triggerBackgroundColor,
    triggerFontColor,
    triggerIcon,
    triggerImageUrl,
    triggerPosition,
    triggerText,
    triggerVariant,
    onTriggerFontColorChange,
    onTriggeBackgroundColorChange,
    onTriggerTextChange,
    onTriggerVariantChange,
    onTriggerImageUrlChange,
    onTriggerIconChange,
    onTriggerPositionChange,
  }
}

export default useDisplayTriggerSettings
