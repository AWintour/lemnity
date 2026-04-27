import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectContentEnabled,
  selectContentUrl,
  selectTitle,
  selectTitleColor,
  selectDescription,
  selectDescriptionColor,
  selectCountdownEnabled,
  selectCountdownDate,
  selectCountdownBackgroundColor,
  selectCountdownFontColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,
  selectRewardScreenEnabled,

  contentUrlChanged,
  titleChanged,
  titleFontWeightChanged,
  titleColorChanged,
  descriptionChanged,
  descriptionFontWeightChanged,
  descriptionColorChanged,
  buttonTextChanged,
  buttonFontColorChanged,
  buttonBackgroundColorChanged,
  iconChanged,
  linkChanged,
  contentEnabledChanged,
  countdownEnabledChanged,
  countdownDateChanged,
  countdownFontColorChanged,
  countdownBackgroundColorChanged,
} from '../eventTimerSlice'
import type {
  Content,
  ContentAlignment,
  FontWeight,
} from '@lemnity/widget-config/widgets/announcement'
import type { Icon } from '@lemnity/widget-config/widgets/base'

export const useInfoScreenSettings = () => {
  const contentEnabled =
    useAppSelector(selectContentEnabled)
  const contentUrl =
    useAppSelector(selectContentUrl)
  const title =
    useAppSelector(selectTitle)
  const titleColor =
    useAppSelector(selectTitleColor)
  const description =
    useAppSelector(selectDescription)
  const descriptionColor =
    useAppSelector(selectDescriptionColor)
  const countdownEnabled =
    useAppSelector(selectCountdownEnabled)
  const countdownDate =
    useAppSelector(selectCountdownDate)
  const countdownBackgroundColor =
    useAppSelector(selectCountdownBackgroundColor)
  const countdownFontColor =
    useAppSelector(selectCountdownFontColor)
  const buttonText =
    useAppSelector(selectButtonText)
  const buttonFontColor =
    useAppSelector(selectButtonFontColor)
  const buttonBackgroundColor =
    useAppSelector(selectButtonBackgroundColor)
  const icon =
    useAppSelector(selectIcon)
  const link =
    useAppSelector(selectLink)
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)

  const dispatch = useAppDispatch()

  const setContentEnabled = (contentEnabled: boolean) => {
    dispatch(contentEnabledChanged(contentEnabled))
  }
  const setContentUrl = (contentUrl: string | undefined) => {
    dispatch(contentUrlChanged(contentUrl))
  }
  const setTitle = (title: string) => {
    dispatch(titleChanged(title))
  }
  const setTitleFontWeight = (titleFontWeight: FontWeight) => {
    dispatch(titleFontWeightChanged(titleFontWeight))
  }
  const setTitleColor = (titleColor: string) => {
    dispatch(titleColorChanged(titleColor))
  }
  const setDescription = (description: string) => {
    dispatch(descriptionChanged(description))
  }
  const setDescriptionFontWeight = (descriptionFontWeight: FontWeight) => {
    dispatch(descriptionFontWeightChanged(descriptionFontWeight))
  }
  const setDescriptionColor = (descriptionColor: string) => {
    dispatch(descriptionColorChanged(descriptionColor))
  }
  const setCountdownEnabled = (countdownEnabled: boolean) => {
    dispatch(countdownEnabledChanged(countdownEnabled))
  }
  const setCountdownDate = (countdownDate: string) => {
    dispatch(countdownDateChanged(countdownDate))
  }
  const setCountdownFontColor = (countdownFontColor: string) => {
    dispatch(countdownFontColorChanged(countdownFontColor))
  }
  const setCountdownBackgroundColor = (countdownBackgroundColor: string) => {
    dispatch(countdownBackgroundColorChanged(countdownBackgroundColor))
  }
  const setButtonText = (buttonText: string) => {
    dispatch(buttonTextChanged(buttonText))
  }
  const setButtonFontColor = (buttonFontColor: string) => {
    dispatch(buttonFontColorChanged(buttonFontColor))
  }
  const setButtonBackgroundColor = (buttonBackgroundColor: string) => {
    dispatch(buttonBackgroundColorChanged(buttonBackgroundColor))
  }
  const setButtonIcon = (icon: Icon) => {
    dispatch(iconChanged(icon))
  }
  const setButtonLink = (link: string) => {
    dispatch(linkChanged(link))
  }

  return {
    contentEnabled,
    contentUrl,
    title,
    titleColor,
    description,
    descriptionColor,
    countdownEnabled,
    countdownDate,
    countdownBackgroundColor,
    countdownFontColor,
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,
    rewardScreenEnabled,
    setContentEnabled,
    setContentUrl,
    setTitle,
    setTitleFontWeight,
    setTitleColor,
    setDescription,
    setDescriptionFontWeight,
    setDescriptionColor,
    setCountdownEnabled,
    setCountdownDate,
    setCountdownFontColor,
    setCountdownBackgroundColor,
    setButtonText,
    setButtonFontColor,
    setButtonBackgroundColor,
    setButtonIcon,
    setButtonLink,
  }
}