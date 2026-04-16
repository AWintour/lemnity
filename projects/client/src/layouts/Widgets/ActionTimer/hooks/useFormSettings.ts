import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  badgeBackgroundColorChanged,
  badgeFontColorChanged,
  badgeTextChanged,
  buttonBackgroundColorChanged,
  buttonFontColorChanged,
  buttonIconChanged,
  buttonLinkChanged,
  buttonTextChanged,
  descriptionChanged,
  descriptionColorChanged,
  descriptionFontSizeChanged,
  descriptionFontWeightChanged,
  formBorderColorChanged,
  formBorderEnabledChanged,
  selectBadgeBackgroundColor,
  selectBadgeFontColor,
  selectBadgeText,
  selectButtonBackgroundColor,
  selectButtonFontColor,
  selectButtonIcon,
  selectButtonLink,
  selectButtonText,
  selectDescription,
  selectDescriptionColor,
  selectDescriptionFontSize,
  selectFormBorderColor,
  selectFormBorderEnabled,
  selectTitle,
  selectTitleColor,
  selectTitleFontSize,
  titleChanged,
  titleColorChanged,
  titleFontSizeChanged,
  titleFontWeightChanged,
} from '../actionTimerSlice'
import type { FontWeight, Icon } from '@lemnity/widget-config/widgets/base'

export const useFormSettings = () => {
  const badgeText =
    useAppSelector(selectBadgeText)
  const badgeBackgroundColor =
    useAppSelector(selectBadgeBackgroundColor)
  const badgeFontColor =
    useAppSelector(selectBadgeFontColor)
  const title =
    useAppSelector(selectTitle)
  const titleFontSize =
    useAppSelector(selectTitleFontSize)
  const titleColor =
    useAppSelector(selectTitleColor)
  const description =
    useAppSelector(selectDescription)
  const descriptionFontSize =
    useAppSelector(selectDescriptionFontSize)
  const descriptionColor =
    useAppSelector(selectDescriptionColor)
  const buttonText =
    useAppSelector(selectButtonText)
  const buttonFontColor =
    useAppSelector(selectButtonFontColor)
  const buttonIcon =
    useAppSelector(selectButtonIcon)
  const buttonBackgroundColor =
    useAppSelector(selectButtonBackgroundColor)
  const buttonLink =
    useAppSelector(selectButtonLink)
  const formBorderEnabled =
    useAppSelector(selectFormBorderEnabled)
  const formBorderColor =
    useAppSelector(selectFormBorderColor)
  
  const dispatch = useAppDispatch()
  
  const onBadgeTextChange = (value: string) => {
    dispatch(badgeTextChanged(value))
  }
  const onBadgeBackgroundColorChange = (value: string) => {
    dispatch(badgeBackgroundColorChanged(value))
  }
  const onBadgeFontColorChange = (value: string) => {
    dispatch(badgeFontColorChanged(value))
  }
  const onTitleColorChange = (value: string) => {
    dispatch(titleColorChanged(value))
  }
  const onTitleFontWeightChange = (value: FontWeight) => {
    dispatch(titleFontWeightChanged(value))
  }
  const onTitleChange = (value: string) => {
    dispatch(titleChanged(value))
  }
  const onTitleFontSizeChange = (value: number) => {
    dispatch(titleFontSizeChanged(value))
  }
  const onDescriptionColorChange = (value: string) => {
    dispatch(descriptionColorChanged(value))
  }
  const onDescriptionFontWeightChange = (value: FontWeight) => {
    dispatch(descriptionFontWeightChanged(value))
  }
  const onDescriptionChange = (value: string) => {
    dispatch(descriptionChanged(value))
  }
  const onDescriptionFontSizeChange = (value: number) => {
    dispatch(descriptionFontSizeChanged(value))
  }
  const onButtonBackgroundColorChange = (value: string) => {
    dispatch(buttonBackgroundColorChanged(value))
  }
  const onButtonFontColorChange = (value: string) => {
    dispatch(buttonFontColorChanged(value))
  }
  const onButtonTextChange = (value: string) => {
    dispatch(buttonTextChanged(value))
  }
  const onButtonIconChange = (value: Icon) => {
    dispatch(buttonIconChanged(value))
  }
  const onButtonLinkChange = (value: string) => {
    dispatch(buttonLinkChanged(value))
  }
  const onFormBorderToggle = (value: boolean) => {
    dispatch(formBorderEnabledChanged(value))
  }
  const onFormBorderColorChange = (value: string) => {
    dispatch(formBorderColorChanged(value))
  }
  
  return {
    badgeText,
    badgeBackgroundColor,
    badgeFontColor,
    title,
    titleFontSize,
    titleColor,
    description,
    descriptionFontSize,
    descriptionColor,
    buttonText,
    buttonFontColor,
    buttonIcon,
    buttonBackgroundColor,
    buttonLink,
    formBorderEnabled,
    formBorderColor,
    onBadgeTextChange,
    onBadgeBackgroundColorChange,
    onBadgeFontColorChange,
    onTitleColorChange,
    onTitleFontWeightChange,
    onTitleChange,
    onTitleFontSizeChange,
    onDescriptionColorChange,
    onDescriptionFontWeightChange,
    onDescriptionChange,
    onDescriptionFontSizeChange,
    onButtonBackgroundColorChange,
    onButtonFontColorChange,
    onButtonTextChange,
    onButtonIconChange,
    onButtonLinkChange,
    onFormBorderToggle,
    onFormBorderColorChange,
  }
}