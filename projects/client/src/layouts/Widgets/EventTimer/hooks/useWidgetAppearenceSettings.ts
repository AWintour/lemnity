import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,

  companyLogoEnabledChanged,
  companyLogoUrlChanged,
  colorSchemeChanged,
  backgroundColorChanged,
  borderRadiusChanged,
  colorsReset,
  initialState,
} from '../eventTimerSlice'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

export const useWidgetAppearenceSettings = () => {
  const companyLogoEnabled = useAppSelector(selectCompanyLogoEnabled)
  const companyLogoUrl = useAppSelector(selectCompanyLogoUrl)
  const colorScheme = useAppSelector(selectColorScheme)
  const backgroundColor = useAppSelector(selectBackgroundColor)
    // this is default state. backgroundColor is not undefined
    // || initialState.appearence.backgroundColor!
  const borderRadius = useAppSelector(selectBorderRadius)

  const dispatch = useAppDispatch()

  const setCompanyLogoEnabled = (enabled: boolean) => {
    dispatch(companyLogoEnabledChanged(enabled))
  }
  const setCompanyLogoUrl = (url: string | undefined) => {
    dispatch(companyLogoUrlChanged(url))
  }
  const setWidgetColorScheme = (colorScheme: ColorScheme) => {
    dispatch(colorSchemeChanged(colorScheme))
  }
  const setWidgetBackgroundColor = (color: string) => {
    dispatch(backgroundColorChanged(color))
  }
  const setBorderRadius = (borderRadius: number) => {
    dispatch(borderRadiusChanged(borderRadius))
  }
  const resetColors = () => {
    dispatch(colorsReset())
  }

  return {
    companyLogoEnabled,
    companyLogoUrl,
    colorScheme,
    backgroundColor,
    borderRadius,
    setCompanyLogoEnabled,
    setCompanyLogoUrl,
    setWidgetColorScheme,
    setWidgetBackgroundColor,
    setBorderRadius,
    resetColors,
  }
}
