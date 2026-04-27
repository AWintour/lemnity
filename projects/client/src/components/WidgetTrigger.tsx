import type { CSSProperties } from 'react'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import * as Icons from '@/components/Icons'

import useUrlImage from '@/hooks/useUrlImage'

import type {
  PositionType,
  TriggerVariant,
} from '@lemnity/widget-config/features/trigger'
import type { Icon } from '@lemnity/widget-config/widgets/base'

type WidgetTriggerProps = {
  triggerFontColor: string
  triggerBackgroundColor: string
  triggerText: string
  triggerVariant: TriggerVariant
  triggerImageUrl: string
  triggerIcon: Icon
  triggerPosition: PositionType
  onPress: () => void
}

const WidgetTrigger = (props: WidgetTriggerProps) => {
  const {
    triggerBackgroundColor,
    triggerFontColor,
    triggerIcon,
    triggerImageUrl,
    triggerPosition,
    triggerText,
    triggerVariant,
    onPress,
  } = props

  const triggerStyles: CSSProperties = {
    color: triggerFontColor,
    backgroundColor: triggerBackgroundColor,
  }

  const TriggerIcon = triggerIcon ? Icons[triggerIcon] : null

  const {
    base64Image: triggerBase64Image,
    // error,
    isLoading: isTriggerImageLoading,
  } = useUrlImage(triggerImageUrl)

  return (
    <>
      {triggerVariant === 'image'
        ? (
            !isTriggerImageLoading && triggerImageUrl && (
              <img
                src={triggerBase64Image as string}
                alt='image'
                className={cn(
                  'fixed bottom-3 z-2039283',
                  triggerPosition === 'bottom-left'
                    ? 'left-3'
                    : 'right-3',
                  'w-21.25 h-21.25 object-cover rounded-[5px]',
                  'transition-transform hover:scale-105',
                )}
                onClick={onPress}
              />
            )
          )
        : (
            <Button
              className={cn(
                'bg-black text-white fixed bottom-3 z-2039283',
                triggerPosition === 'bottom-left'
                  ? 'left-3'
                  : 'right-3',
                'rounded-full px-4 h-15.5 min-w-15.5 w-fit hover:scale-105',
              )}
              style={triggerStyles}
              onPressEnd={onPress}
            >
              {triggerPosition === 'bottom-right' && triggerText.length > 0 && (
                <span>{triggerText}</span>
              )}

              {triggerIcon !== 'HeartDislike' && TriggerIcon && (
                <div className='w-7.5 h-7.5'>
                  <TriggerIcon />
                </div>
              )}

              {triggerPosition === 'bottom-left' && triggerText.length > 0 && (
                <span>{triggerText}</span>
              )}
            </Button>
          )}
    </>
  )
}

export default WidgetTrigger
