import type { Ref, CSSProperties } from 'react'

import EventTimerWidget, {
  type EventTimerWidgetVariant,
} from '../EventTimerWidget'

import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentEnabled,
  selectContentUrl,
  initialState,
} from '../eventTimerSlice'
import useUrlImage from '@/hooks/useUrlImage'

import type { CountdownForm } from '../EventTimerFormScreen'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

export type WidgetProps = {
  ref: Ref<HTMLDivElement>
  focused: boolean
  variant: EventTimerWidgetVariant
  onCountdownScreenButtonPress: () => void
  onFormScreenButtonPress: (formData: CountdownForm) => void
}

const Widget = ({ ref, ...props }: WidgetProps) => {
  const colorScheme =
    useAppSelector(selectColorScheme)
  const backgroundColor =
    useAppSelector(selectBackgroundColor)
      || initialState.appearence.backgroundColor
  const borderRadius =
    useAppSelector(selectBorderRadius)
  const contentEnabled =
    useAppSelector(selectContentEnabled)
  const contentUrl =
    useAppSelector(selectContentUrl)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const mobile = useIsMobileViewport()

  const containerStyle: CSSProperties = {
    backgroundColor: colorScheme === 'primary'
      ? '#725DFF'
      : backgroundColor,
    borderRadius: mobile
      ? undefined
      : borderRadius,
  }

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  if (contentEnabled) {
    containerStyle.backgroundImage = `url('${backgroundImage}')`
    containerStyle.backgroundSize = 'cover'
  }

  return (
    <>
      <EventTimerWidget
        ref={ref}
        variant={props.variant}
        focused={props.focused}
        containerStyle={containerStyle}
        onCountdownScreenButtonPress={props.onCountdownScreenButtonPress}
        onFormScreenButtonPress={props.onFormScreenButtonPress}
      />
    </>
  )
}

export default Widget
