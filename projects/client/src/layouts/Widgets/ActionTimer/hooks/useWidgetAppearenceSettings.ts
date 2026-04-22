import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectColorScheme,
  selectCompanyLogoEnabled,
  selectCompanyLogoUrl,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentAlignment,
  selectContentType,
  selectContentUrl,
  companyLogoEnabledChanged,
  companyLogoUrlChanged,
  contentUrlChanged,
  backgroundColorChanged,
  borderRadiusChanged,
  contentAlignmentChanged,
  contentTypeChanged,
  colorSchemeChanged,
  selectContentPlacement,
  contentPlacementChanged,
  colorsReset,
} from '../actionTimerSlice'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'
import type {
  Content,
  ContentAlignment,
  ContentPlacement,
} from '@lemnity/widget-config/widgets/action-timer'

export const useWidgetAppearenceSettings = () => {
  const companyLogoEnabled =
    useAppSelector(selectCompanyLogoEnabled)
  const companyLogoUrl =
    useAppSelector(selectCompanyLogoUrl)
  const colorScheme =
    useAppSelector(selectColorScheme)
  const backgroundColor =
    useAppSelector(selectBackgroundColor)
  const borderRadius =
    useAppSelector(selectBorderRadius)
  const contentAlignment =
    useAppSelector(selectContentAlignment)
  const contentType =
    useAppSelector(selectContentType)
  const contentUrl =
    useAppSelector(selectContentUrl)
  const contentPlacement =
    useAppSelector(selectContentPlacement)
    
  const dispatch = useAppDispatch()
  
  const onCompanyLogoToggle = (value: boolean) => {
    dispatch(companyLogoEnabledChanged(value))
  }
  const onCompanyLogoUrlChange = (value: string | undefined) => {
    dispatch(companyLogoUrlChanged(value))
  }
  const onContentUrlChange = (value: string | undefined) => {
    dispatch(contentUrlChanged(value))
  }
  const onColorSchemeChange = (value: ColorScheme) => {
    dispatch(colorSchemeChanged(value))
    dispatch(colorsReset())
  }
  const onBackgroundColorChange = (value: string) => {
    dispatch(backgroundColorChanged(value))
  }
  const onBorderRadiusChange = (value: number) => {
    dispatch(borderRadiusChanged(value))
  }
  const onContentAlignmentChange = (value: ContentAlignment) => {
    dispatch(contentAlignmentChanged(value))
  }
  const onContentTypeChange = (value: Content) => {
    dispatch(contentTypeChanged(value))
  }
  const onContentPlacementChange = (value: string) => {
    dispatch(contentPlacementChanged(value as ContentPlacement))
  }

  return {
    companyLogoEnabled,
    companyLogoUrl,
    colorScheme,
    backgroundColor,
    borderRadius,
    contentAlignment,
    contentType,
    contentUrl,
    contentPlacement,
    onCompanyLogoToggle,
    onCompanyLogoUrlChange,
    onColorSchemeChange,
    onBackgroundColorChange,
    onBorderRadiusChange,
    onContentAlignmentChange,
    onContentUrlChange,
    onContentTypeChange,
    onContentPlacementChange,
  }
}
