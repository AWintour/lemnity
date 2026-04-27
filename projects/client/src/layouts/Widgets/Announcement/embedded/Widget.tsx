import type { Ref, CSSProperties } from 'react'

import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentType,
  selectContentAlignment,
  selectContentUrl,
} from '../announcementSlice'
import AnnouncementWidget, {
  type AnnouncementWidgetVariant,
} from '../AnnouncementWidget'

import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import useUrlImage from '@/hooks/useUrlImage'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

export type WidgetProps = {
  ref: Ref<HTMLDivElement>
  focused: boolean
  announementVariant: AnnouncementWidgetVariant
  onAnnouncementButtonPress: () => void
}

const Widget = ({ref, ...props}: WidgetProps) => {
  const colorScheme = useAppSelector(selectColorScheme)
  const backgroundColor = useAppSelector(selectBackgroundColor)
  const borderRadius = useAppSelector(selectBorderRadius)
  const contentType = useAppSelector(selectContentType)
  const contentAlignment = useAppSelector(selectContentAlignment)
  const contentUrl = useAppSelector(selectContentUrl)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const mobile = useIsMobileViewport()

  const containerStyle: CSSProperties = {
    backgroundColor: colorScheme === 'primary'
      ? '#FFFFFF'
      : backgroundColor,
    borderRadius: mobile
      ? undefined
      : borderRadius,
  }

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  if (contentType === 'background') {
    containerStyle.backgroundImage = `url('${backgroundImage}')`
    containerStyle.backgroundSize = 'cover'
    containerStyle.backgroundPosition = contentAlignment
  }

  return (
    <>
      <AnnouncementWidget
        ref={ref}
        variant={props.announementVariant}
        focused={props.focused}
        onButtonPress={props.onAnnouncementButtonPress}
      />
    </>
  )
}

export default Widget
