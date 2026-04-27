import { type CSSProperties } from 'react'
import { cn } from '@heroui/theme'

import EventTimerPreview from './EventTimerPreview'

import useUrlImage from '@/hooks/useUrlImage'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentEnabled,
  selectContentUrl,
  selectRewardScreenEnabled,
  initialState,
} from './eventTimerSlice'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

const WidgetPreview = () => {
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
  const rewardScreenEnabled =
    useAppSelector(selectRewardScreenEnabled)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const containerStyle: CSSProperties = {
    backgroundColor: colorScheme === 'primary'
      ? '#725DFF'
      : backgroundColor,
    borderRadius: borderRadius,
  }

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  if (contentEnabled) {
    containerStyle.backgroundImage = `url('${backgroundImage}')`
    containerStyle.backgroundSize = 'cover'
  }

  const previewWidgetCardStyle = cn(
    'w-fit scale-40 origin-top-left ml-32.5',
    'pointer-events-none',
    // 'h-57',
  )

  return (
    <div className='w-full h-full flex flex-col overflow-auto select-none'>
      <EventTimerPreview
        className={previewWidgetCardStyle}
        rewardScreenEnabled={rewardScreenEnabled}
        containerStyle={containerStyle}
      />
    </div>
  )
}

export default WidgetPreview
