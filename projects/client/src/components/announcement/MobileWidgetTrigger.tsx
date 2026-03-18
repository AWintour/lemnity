import type { CSSProperties, HTMLProps } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import useUrlImage from '@/hooks/useUrlImage'
import { useMobileContext } from '../../layouts/Widgets/EventTimer/embedded/MobileContext'

import type {
  EventTimertWidgetType,
} from '@lemnity/widget-config/widgets/event-timer'
import { eventTimerWidgetDefaults } from '../../layouts/Widgets/EventTimer/defaults'

type MobileWidgetTriggerProps = Pick<HTMLProps<HTMLElement>, 'children'>

const MobileWidgetTrigger = (props: MobileWidgetTriggerProps) => {
  const {
    imageUrl,
    triggerType,
    triggerText,
    triggerFontColor,
    triggerBackgroundColor,
  } = useWidgetSettingsStore(
    useShallow(s => {
      // i hope i will replace the whole state system
      // with something better than this =w=
      // why do i have to do this
      // how did you make enough abstractions that nothing works anymore
      const widget = (s.settings?.widget as EventTimertWidgetType)
      const defaults = eventTimerWidgetDefaults.mobileSettings

      return {
        imageUrl: widget.mobileSettings?.imageUrl
          ?? defaults.imageUrl,
        triggerType: widget.mobileSettings?.triggerType
          ?? defaults.triggerType,
        triggerText: widget.mobileSettings?.triggerText
          ?? defaults.triggerText,
        triggerFontColor: widget.mobileSettings?.triggerFontColor
          ?? defaults.triggerFontColor,
        triggerBackgroundColor: widget.mobileSettings?.triggerBackgroundColor
          ?? defaults.triggerBackgroundColor,
      }
    })
  )

  const {
    base64Image,
    // error,
    isLoading,
  } = useUrlImage(imageUrl)

  const mobileContext = useMobileContext()

  if (!mobileContext) {
    return
  }

  const { state: context, dispatch } = mobileContext

  const handleTriggerPress = () => {
    dispatch({ type: context.open ? 'close' : 'open' })
  }

  const modalStyles: CSSProperties = {
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
  }

  return (
    <div
      data-lemnity-interactive
      className='fixed bottom-6 right-6'
    >
      {triggerType === 'image'
        ? (
          !isLoading && imageUrl && (
            <img
              src={base64Image as string}
              alt='image'
              className={cn(
                'w-21.25 h-21.25 object-cover rounded-[5px]',
              )}
              onClick={handleTriggerPress}
            />
          )
        )
        : (
          <Button
            className='rounded-full'
            style={{
              color: triggerFontColor,
              backgroundColor: triggerBackgroundColor,
            }}
            onPress={handleTriggerPress}
          >
            {triggerText}
          </Button>
        )}
      
      {context.open && (
        <div
          data-lemnity-modal
          role='dialog'
          aria-modal='true'
          style={modalStyles}
          className={cn(
            'fixed left-0 top-0 w-full h-full z-2147483646 overflow-hidden',
            'flex flex-col items-center justify-center',
            'bg-black/20 backdrop-blur-sm',
          )}
        >
          {props.children}
        </div>
      )}
    </div>
  )
}

export default MobileWidgetTrigger
