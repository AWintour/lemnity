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
      // Вид мобильного лаунчера: 'button' (текст) или 'image' (картинка). По умолчанию — кнопка.
      triggerType?: 'image' | 'button'
      imageUrl?: string
      unreadCount: number
      pulse?: boolean
      toggleOpen: () => void
    }

const RIPPLE_CSS =
  '@keyframes lemnity-ripple{0%{transform:scale(1);opacity:.5}55%{transform:scale(2.1);opacity:0}100%{transform:scale(2.1);opacity:0}}'

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

  const asImage = props.triggerType === 'image' && !!props.imageUrl
  const doPulse = props.pulse && !props.open
  const rippleColor = (props.triggerStyle?.backgroundColor as string | undefined) ?? '#5951E5'
  const ripple = (delay: string): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    background: rippleColor,
    zIndex: 0,
    pointerEvents: 'none',
    animation: `lemnity-ripple 1.4s ease-out infinite ${delay}`,
  })

  return (
    <>
      {doPulse && <style>{RIPPLE_CSS}</style>}
      <div className='relative w-fit self-end'>
        {doPulse && (
          <>
            <span aria-hidden style={ripple('0s')} />
            <span aria-hidden style={ripple('0.18s')} />
          </>
        )}
        {asImage ? (
          <button
            ref={ref}
            className='rounded-full h-13.5 w-13.5 relative z-10 overflow-hidden p-0'
            onClick={handleButtonPress}
          >
            <img src={props.imageUrl} alt='Чат' className='w-full h-full object-cover' />
            {!props.open && <Badge badgeContent={props.unreadCount} />}
          </button>
        ) : (
          <button
            ref={ref}
            className='rounded-full h-13.5 min-w-13.5 w-fit px-4 relative z-10'
            style={props.triggerStyle}
            onClick={handleButtonPress}
          >
            {triggerText}
            {!props.open && <Badge badgeContent={props.unreadCount} />}
          </button>
        )}
      </div>

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
