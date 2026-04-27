import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  countdownBackgroundColorChanged,
  countdownDateChanged,
  countdownEnabledChanged, 
  countdownFontColorChanged,
  selectCountdownBackgroundColor,
  selectCountdownDate,
  selectCountdownEnabled,
  selectCountdownFontColor,
  selectTextBeforeCountdown,
  selectTextBeforeCountdownColor,
  textBeforeCountdownChanged,
  textBeforeCountdownColorChanged,
} from '../actionTimerSlice'
import { parseAbsoluteToLocal, ZonedDateTime } from '@internationalized/date'

export const useCountdownSettings = () => {
  const enabled =
    useAppSelector(selectCountdownEnabled)
  const textEnabled =true
  const text =
    useAppSelector(selectTextBeforeCountdown)
  const textColor =
    useAppSelector(selectTextBeforeCountdownColor)
  const backgroundColor =
    useAppSelector(selectCountdownBackgroundColor)
  const date = parseAbsoluteToLocal(
    useAppSelector(selectCountdownDate)
  )
  const fontColor =
    useAppSelector(selectCountdownFontColor)
  
  const dispatch = useAppDispatch()

  const onBackgroundColorChange = (value: string) => {
    dispatch(countdownBackgroundColorChanged(value))
  }
  const onDateChange = (value: ZonedDateTime | null) => {
    if (!value) {
      return
    }
    dispatch(countdownDateChanged(value.toAbsoluteString()))
  }
  const onFontColorChange = (value: string) => {
    dispatch(countdownFontColorChanged(value))
  }
  const onTextChange = (value: string) => {
    dispatch(textBeforeCountdownChanged(value))
  }
  const onTextColorChange = (value: string) => {
    dispatch(textBeforeCountdownColorChanged(value))
  }
  const onToggle = (value: boolean) => {
    dispatch(countdownEnabledChanged(value))
  }

  return {
    enabled,
    textEnabled,
    text,
    textColor,
    backgroundColor,
    date,
    fontColor,
    onBackgroundColorChange,
    onDateChange,
    onFontColorChange,
    onToggle,
    onTextChange,
    onTextColorChange,
  }
}