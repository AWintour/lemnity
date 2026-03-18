import { type CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import EventTimerPreview from './EventTimerPreview'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import useUrlImage from '@/hooks/useUrlImage'

import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import { eventTimerWidgetDefaults } from './defaults'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

const WidgetPreview = () => {
  const {
    colorScheme,
    backgroundColor,
    borderRadius,
    contentEnabled,
    contentUrl,
    rewardScreenEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as EventTimertWidgetType
      const appearence = widget.appearence
      const rewardMessageSettings = widget.rewardMessageSettings
      const infoSettings = widget.infoSettings

      return {
        colorScheme: appearence.colorScheme
          ?? eventTimerWidgetDefaults.appearence.colorScheme,
        backgroundColor:
          appearence.backgroundColor && appearence.backgroundColor.length > 0
            ? appearence.backgroundColor
            : eventTimerWidgetDefaults.appearence.backgroundColor,
        borderRadius: appearence.borderRadius
          ?? eventTimerWidgetDefaults.appearence.borderRadius,
        contentEnabled: infoSettings.contentEnabled
          ?? eventTimerWidgetDefaults.infoSettings.contentEnabled,
        contentUrl: infoSettings.contentUrl
          ?? eventTimerWidgetDefaults.infoSettings.contentUrl,
        rewardScreenEnabled: rewardMessageSettings.rewardScreenEnabled
          ?? eventTimerWidgetDefaults.rewardMessageSettings.rewardScreenEnabled,
      }
    })
  )

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
