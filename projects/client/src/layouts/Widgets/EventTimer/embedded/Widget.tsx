import type { Ref, CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'

import EventTimerWidget, {
  type EventTimerWidgetVariant,
} from '../EventTimerWidget'

import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import useUrlImage from '@/hooks/useUrlImage'

import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import type { CountdownForm } from '../EventTimerFormScreen'
import { eventTimerWidgetDefaults } from '../defaults'

const noBackgroundImageUrl = 'https://app.lemnity.ru/uploads/images/2026/01/2f539d8a-e1a6-4ced-a863-8e4aa37242d9-lemnity-pic.webp'

export type WidgetProps = {
  ref: Ref<HTMLDivElement>
  focused: boolean
  variant: EventTimerWidgetVariant
  onCountdownScreenButtonPress: () => void
  onFormScreenButtonPress: (formData: CountdownForm) => void
}

const Widget = ({ ref, ...props }: WidgetProps) => {
  const {
    colorScheme,
    backgroundColor,
    borderRadius,
    contentEnabled,
    contentUrl,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as EventTimertWidgetType
      const appearence = widget.appearence
      const infoSettings = widget.infoSettings

      return {
        colorScheme: appearence.colorScheme
          ?? eventTimerWidgetDefaults.appearence.colorScheme,
        backgroundColor: appearence.backgroundColor
          ?? eventTimerWidgetDefaults.appearence.backgroundColor,
        borderRadius: appearence.borderRadius
          ?? eventTimerWidgetDefaults.appearence.borderRadius,
        contentEnabled: infoSettings.contentEnabled
          ?? eventTimerWidgetDefaults.infoSettings.contentEnabled,
        contentUrl: infoSettings.contentUrl
          ?? eventTimerWidgetDefaults.infoSettings.contentUrl,
      }
    })
  )

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
