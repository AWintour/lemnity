import type { CSSProperties, HTMLProps } from 'react'
import { cn } from '@heroui/theme'

import SvgIcon from '@/components/SvgIcon'

import iconCross from '@/assets/icons/cross.svg'
import Badge from './Badge'

type MobileWidgetTriggerProps =
  Pick<HTMLProps<HTMLElement>, 'children'>
  & Pick<HTMLProps<HTMLButtonElement>, 'ref'>
  & {
      open: boolean
      triggerStyle: CSSProperties
      triggerText: string
      unreadCount: number
      toggleOpen: () => void
    }

const MobileWidgetTrigger = ({ ref, ...props }: MobileWidgetTriggerProps) => {
  const modalStyles: CSSProperties = {
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
  }

  const triggerText = props.triggerText && props.triggerText.length > 0
    ? props.triggerText
    : 'Чат'

  const handleButtonPress = () => {
    const rect = props.open
      ? { left: 0, top: 0, width: 0, height: 0 }
      : {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }

    window.parent.postMessage({
      scope: 'lemnity-embed',
      type: 'interactive-region',
      lock: !props.open,
      rect: rect,
    })

    props.toggleOpen()
  }

  return (
    <>
      <button
        ref={ref}
        className='rounded-full h-13.5 min-w-13.5 w-fit px-4 self-end relative'
        style={props.triggerStyle}
        onClick={handleButtonPress}
      >
        {triggerText}
        {!props.open && <Badge badgeContent={props.unreadCount} />}
      </button>

      {props.open && (
        <div
          role='dialog'
          aria-modal='true'
          style={modalStyles}
          className={cn(
            'fixed left-0 top-0 w-full h-full z-2147483646 overflow-hidden',
            'flex flex-col items-center justify-center',
            'bg-black/20 backdrop-blur-sm py-5',
          )}
        >
          {props.children}

          <div
            className='fixed top-3 right-3 w-5.5 h-5.5 fill-[#797979]'
            onClick={props.toggleOpen}
          >
            <SvgIcon src={iconCross} alt='Close' />
          </div>
        </div>
      )}
    </>
  )
}

export default MobileWidgetTrigger
