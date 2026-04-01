import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectContentType,
  selectContentAlignment,
  selectContentUrl,
  selectTitle,
  selectTitleColor,
  selectDescription,
  selectDescriptionColor,
  selectButtonText,
  selectButtonFontColor,
  selectButtonBackgroundColor,
  selectIcon,
  selectLink,
  selectRewardScreenEnabled,

  contentTypeChanged,
  contentAlignmentChanged,
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
} from '../announcementSlice'
import type {
  Content,
  ContentAlignment,
  FontWeight,
} from '@lemnity/widget-config/widgets/announcement'
import type { Icon } from '@lemnity/widget-config/widgets/base'

export const useInfoScreenSettings = () => {
  const contentType = useAppSelector(selectContentType)
  const contentAlignment = useAppSelector(selectContentAlignment)
  const contentUrl = useAppSelector(selectContentUrl)
  const title = useAppSelector(selectTitle)
  const titleColor = useAppSelector(selectTitleColor)
  const description = useAppSelector(selectDescription)
  const descriptionColor = useAppSelector(selectDescriptionColor)
  const buttonText = useAppSelector(selectButtonText)
  const buttonFontColor = useAppSelector(selectButtonFontColor)
  const buttonBackgroundColor = useAppSelector(selectButtonBackgroundColor)
  const icon = useAppSelector(selectIcon)
  const link = useAppSelector(selectLink)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)

  const dispatch = useAppDispatch()

  const setContentType = (contentType: Content) => {
    dispatch(contentTypeChanged(contentType))
  }
  const setContentAlignment = (contentAlignment: ContentAlignment) => {
    dispatch(contentAlignmentChanged(contentAlignment))
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
    contentType,
    contentAlignment,
    contentUrl,
    title,
    titleColor,
    description,
    descriptionColor,
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,
    rewardScreenEnabled,
    setContentType,
    setContentAlignment,
    setContentUrl,
    setTitle,
    setTitleFontWeight,
    setTitleColor,
    setDescription,
    setDescriptionFontWeight,
    setDescriptionColor,
    setButtonText,
    setButtonFontColor,
    setButtonBackgroundColor,
    setButtonIcon,
    setButtonLink,
  }
}