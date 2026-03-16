import { type HTMLProps, type RefObject, useRef, useEffect } from 'react'
import { cn } from '@heroui/theme'

import useClickOutside from '@/hooks/useClickOutside'
import type { Rect } from '../../layouts/Widgets/EventTimer/embedded/embedRuntime'

type DesktopWidgetTriggerProps = Pick<HTMLProps<HTMLElement>, 'children'> & {
  widgetRef: RefObject<HTMLDivElement | null>
  focused: boolean
  sendBoundingRectToIframe: (rect: Rect, offset: number) => void
  onFocusClick: () => void
  onClickOutside: () => void
}

const DesktopWidgetTrigger = ({
  focused,
  widgetRef,
  sendBoundingRectToIframe,
  ...props
}: DesktopWidgetTriggerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useClickOutside(containerRef, props.onClickOutside)

  const handleMouseEnter = () => {
    if (focused || !containerRef.current) {
      return
    }

    const boundingRect = containerRef.current.getBoundingClientRect()
    sendBoundingRectToIframe(boundingRect, 24)
  }

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (props || !containerRef.current) {
        return
      }

      const boundingRect = containerRef.current.getBoundingClientRect()
      sendBoundingRectToIframe(boundingRect, 16)
    }, 250) // 300 ms delay due to 'duration-300'
  }

  useEffect(() => {
    if (!widgetRef.current) {
      return
    }
  
    if (focused) {
      sendBoundingRectToIframe({
        width: 398,
        height: 524,
      }, 24)
      return
    }

    setTimeout(() => {
      if (!containerRef.current) {
        return
      }

      const boundingRect = containerRef.current.getBoundingClientRect()
      sendBoundingRectToIframe(boundingRect, 16)
    }, 250) // 300 ms delay due to 'duration-300'
  }, [sendBoundingRectToIframe, widgetRef, focused])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const boundingRect = containerRef.current.getBoundingClientRect()
    sendBoundingRectToIframe(boundingRect, 16)
  }, [])

  return (
    <div
      data-lemnity-interactive
      // this isn't exatly the cleanest solution
      // but i am content with it for now
      // 
      // a marker to apply custom logic to in embedManager.tsx
      data-lemnity-announcement
      className='fixed bottom-6 right-6 pointer-events-none'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* TODO: should i replace this with a switch statement? */}
      <div
        ref={containerRef}
        className={cn(
          'w-fit h-fit group',
          'origin-bottom-right',

          !focused && 'scale-40',
          // !focused && 'translate-x-[30%] translate-y-[30%]',
          !focused && 'hover:scale-43',
          // !focused && 'hover:translate-x-[28%] hover:translate-y-[28%]',
          !focused && '*:pointer-events-none',
          'pointer-events-auto cursor-pointer',

          'transition-transform duration-250',
        )}
        // ✨ Magic ✨
        style={{ willChange: 'transform' }}
        onClick={props.onFocusClick}
      >
        {props.children}
      </div>
    </div>
  )
}

export default DesktopWidgetTrigger
