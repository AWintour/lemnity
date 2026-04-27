import type { CSSProperties, HTMLProps } from 'react'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'

import useUrlImage from '@/hooks/useUrlImage'
import { useAppSelector } from '@/stores/redux/hooks'
import {
  selectMobileImageUrl,
  selectMobileTriggerType,
  selectMobileTriggerText,
  selectMobileTriggerFontColor,
  selectMobileTriggerBackgroundColor,
  selectTriggerPosition,
} from '../announcementSlice'
import { useMobileContext } from './MobileContext'

type MobileWidgetTriggerProps = Pick<HTMLProps<HTMLElement>, 'children'>

const MobileWidgetTrigger = (props: MobileWidgetTriggerProps) => {
  const imageUrl =
    useAppSelector(selectMobileImageUrl)
  const triggerType =
    useAppSelector(selectMobileTriggerType)
  const triggerText =
    useAppSelector(selectMobileTriggerText)
  const triggerFontColor =
    useAppSelector(selectMobileTriggerFontColor)
  const triggerBackgroundColor =
    useAppSelector(selectMobileTriggerBackgroundColor)
  const triggerPosition =
    useAppSelector(selectTriggerPosition)

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
      className={cn(
        'fixed bottom-6 z-2039283',
        triggerPosition === 'bottom-right'
          ? 'right-6'
          : 'left-6',
      )}
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
            onPressEnd={handleTriggerPress}
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
