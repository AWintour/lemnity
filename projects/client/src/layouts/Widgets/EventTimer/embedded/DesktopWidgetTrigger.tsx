import { type HTMLProps, type RefObject, useRef } from 'react'
import { cn } from '@heroui/theme'

import useClickOutside from '@/hooks/useClickOutside'
import { useAppSelector } from '@/stores/redux/hooks'
import { selectTriggerPosition } from '../eventTimerSlice'

type DesktopWidgetTriggerProps = Pick<HTMLProps<HTMLElement>, 'children'> & {
  widgetRef: RefObject<HTMLDivElement | null>
  focused: boolean
  onFocusClick: () => void
  onClickOutside: () => void
}

const DesktopWidgetTrigger = ({
  focused,
  widgetRef,
  ...props
}: DesktopWidgetTriggerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerPosition = useAppSelector(selectTriggerPosition)

  useClickOutside(containerRef, props.onClickOutside)

  return (
    <div
      className={cn(
        'fixed bottom-3 pointer-events-none z-2039283',
        triggerPosition === 'bottom-right'
          ? 'right-3'
          : 'left-3',
      )}
    >
      {/* TODO: should i replace this with a switch statement? */}
      <div
        ref={containerRef}
        className={cn(
          'w-fit h-fit group',
          triggerPosition === 'bottom-right'
            ? 'origin-bottom-right'
            : 'origin-bottom-left',

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
