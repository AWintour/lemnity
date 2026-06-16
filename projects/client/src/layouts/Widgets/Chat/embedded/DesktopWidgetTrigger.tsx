import type { CSSProperties, HTMLProps } from 'react'
import { cn } from '@heroui/theme'

import SvgIcon from '@/components/SvgIcon'
import * as Icons from '@/components/Icons'

import iconAdd from '@/assets/icons/add.svg'

import type { Icon } from '@lemnity/widget-config/widgets/base'
import type { Position } from '@lemnity/widget-config/widgets/chat'
import Badge from './Badge'

type DesktopWidgetTriggerProps =
  Pick<HTMLProps<HTMLElement>, 'children'>
  & Pick<HTMLProps<HTMLButtonElement>, 'ref'>
  & {
      open: boolean
      triggerStyle: CSSProperties
      closeIconStyle: CSSProperties
      triggerIcon: Icon
      triggerText: string
      triggerPosition: Position
      unreadCount: number
      // Боковая панель открыта — круглый баббл-триггер не показываем (закрытие — кнопкой на панели).
      hideTrigger?: boolean
      // Анимация «биение сердца» у кнопки (когда чат закрыт).
      pulse?: boolean
      onMouseEnter: () => void
      onMouseLeave: () => void
      toggleOpen: () => void
    }

// Расходящиеся «волны» от кнопки в такт сердцебиения: волна уходит в первой части цикла,
// затем пауза; два span'а со сдвигом дают «двойной удар» (туц-туц … пауза).
const RIPPLE_CSS =
  '@keyframes lemnity-ripple{0%{transform:scale(1);opacity:.5}55%{transform:scale(2.1);opacity:0}100%{transform:scale(2.1);opacity:0}}'
const RIPPLE_DURATION = '1.4s'

const rippleSpanStyle = (color: string, delay: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 9999,
  background: color,
  zIndex: 0,
  pointerEvents: 'none',
  animation: `lemnity-ripple ${RIPPLE_DURATION} ease-out infinite ${delay}`,
})

const DesktopWidgetTrigger = ({ ref, ...props }: DesktopWidgetTriggerProps) => {
  const TriggerIcon = props.triggerIcon ? Icons[props.triggerIcon] : null

  const doPulse = props.pulse && !props.open
  const rippleColor = (props.triggerStyle?.backgroundColor as string | undefined) ?? '#5951E5'

  return (
    <>
      {props.children}

      {doPulse && <style>{RIPPLE_CSS}</style>}

      {props.hideTrigger ? null : (
      <div className={cn('relative w-fit', props.triggerPosition === 'bottom-right' && 'self-end')}>
        {doPulse && (
          <>
            <span aria-hidden style={rippleSpanStyle(rippleColor, '0s')} />
            <span aria-hidden style={rippleSpanStyle(rippleColor, '0.18s')} />
          </>
        )}
        <button
        ref={ref}
        type='button'
        onClick={props.toggleOpen}
        className={cn(
          'group flex items-center justify-center rounded-full',
          'text-white ring-1 ring-white/20 relative z-10',
          'transition-transform motion-reduce:transition-none duration-250',
          'h-15.5 min-w-15.5 w-fit gap-2.5 px-4 hover:scale-105',
        )}
        style={props.triggerStyle}
        aria-label={props.open ? 'Скрыть чат' : 'Открыть чат'}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      >
        {props.triggerPosition === 'bottom-right' && props.triggerText && (
          <span>{props.triggerText}</span>
        )}

        {props.open
          ? (
            <div
              className='w-7.5 h-7.5 rotate-45'
              style={props.closeIconStyle}
            >
              <SvgIcon src={iconAdd} />
            </div>
          )
          : (props.triggerIcon !== 'HeartDislike' && TriggerIcon && (
              <div className='w-7.5 h-7.5'>
                <TriggerIcon />
              </div>
            ))
        }

        {props.triggerPosition === 'bottom-left' && props.triggerText && (
          <span>{props.triggerText}</span>
        )}

        {!props.open && <Badge badgeContent={props.unreadCount} />}
        </button>
      </div>
      )}
    </>
  )
}

export default DesktopWidgetTrigger
