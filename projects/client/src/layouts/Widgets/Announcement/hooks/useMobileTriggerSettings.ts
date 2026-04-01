import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectMobileEnabled,
  selectMobileTriggerType,
  selectMobileTriggerText,
  selectMobileTriggerFontColor,
  selectMobileTriggerBackgroundColor,
  selectMobileImageUrl,

  mobileEnabledChanged,
  mobileTriggerTypeChanged,
  mobileTriggerTextChanged,
  mobileTriggerFontColorChanged,
  mobileTriggerBackgroundColorChanged,
  mobileImageUrlChanged,
  initialState,
} from '../announcementSlice'
import type { MobileTrigger } from '@lemnity/widget-config/widgets/announcement'

export const useMobileTriggerSettings = () => {
  const enabled = useAppSelector(selectMobileEnabled)
  const triggerType = useAppSelector(selectMobileTriggerType)
  const triggerText = useAppSelector(selectMobileTriggerText)
  const triggerFontColor = useAppSelector(selectMobileTriggerFontColor)
  const triggerBackgroundColor =
    useAppSelector(selectMobileTriggerBackgroundColor)
  const imageUrl = useAppSelector(selectMobileImageUrl)
    ?? initialState.mobileSettings.imageUrl!

  const dispatch = useAppDispatch()

  const onToggle = (enabled: boolean) => {
    dispatch(mobileEnabledChanged(enabled))
  }
  const onTriggerTypeChange = (type: MobileTrigger) => {
    dispatch(mobileTriggerTypeChanged(type))
  }
  const onImageUrlChange = (url: string | undefined) => {
    dispatch(mobileImageUrlChanged(url))
  }
  const onTriggerTextChange = (text: string) => {
    dispatch(mobileTriggerTextChanged(text))
  }
  const onTriggerFontColorChange = (color: string) => {
    dispatch(mobileTriggerFontColorChanged(color))
  }
  const onTriggerBackgroundColorChange = (color: string) => {
    dispatch(mobileTriggerBackgroundColorChanged(color))
  }

  return {
    enabled,
    triggerType,
    triggerText,
    triggerFontColor,
    triggerBackgroundColor,
    imageUrl,

    onToggle,
    onTriggerTypeChange,
    onImageUrlChange,
    onTriggerTextChange,
    onTriggerFontColorChange,
    onTriggerBackgroundColorChange,
  }
}