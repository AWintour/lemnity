import { type CSSProperties } from 'react'
import { cn } from '@heroui/theme'
import AnnouncementPreview from './AnnouncementPreview'
import useUrlImage from '@/hooks/useUrlImage'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectColorScheme,
  selectBackgroundColor,
  selectBorderRadius,
  selectContentType,
  selectContentAlignment,
  selectContentUrl,
  selectRewardScreenEnabled,
} from './announcementSlice'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

const WidgetPreview = () => {
  const colorScheme = useAppSelector(selectColorScheme)
  const backgroundColor = useAppSelector(selectBackgroundColor)
  const borderRadius = useAppSelector(selectBorderRadius)
  const contentType = useAppSelector(selectContentType)
  const contentAlignment = useAppSelector(selectContentAlignment)
  const contentUrl = useAppSelector(selectContentUrl)
  const rewardScreenEnabled = useAppSelector(selectRewardScreenEnabled)

  const {
    base64Image: contentBase64Image,
    // error,
    isLoading,
  } = useUrlImage(contentUrl)

  const containerStyle: CSSProperties = {
    backgroundColor: colorScheme === 'primary'
      ? '#FFFFFF'
      : backgroundColor,
    borderRadius: borderRadius,
  }

  const backgroundImage = contentUrl && !isLoading
    ? contentBase64Image as string
    : noBackgroundImageUrl

  if (contentType === 'background') {
    containerStyle.backgroundImage = `url('${backgroundImage}')`
    containerStyle.backgroundSize = 'cover'
    containerStyle.backgroundPosition = contentAlignment
  }

  const previewWidgetCardStyle = cn(
    'w-fit scale-40 origin-top-left ml-32.5',
    'pointer-events-none',
    // 'h-57',
  )

  return (
    <div className='w-full h-full flex flex-col overflow-auto select-none'>
      <AnnouncementPreview
        className={previewWidgetCardStyle}
        rewardScreenEnabled={rewardScreenEnabled}
      />
    </div>
  )
}

export default WidgetPreview
