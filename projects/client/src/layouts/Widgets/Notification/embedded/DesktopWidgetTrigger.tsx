import type { CSSProperties, HTMLProps } from 'react'
import { cn } from '@heroui/theme'

import SvgIcon from '@/components/SvgIcon'
import * as Icons from '@/components/Icons'

import iconAdd from '@/assets/icons/add.svg'

import type { Icon } from '@lemnity/widget-config/widgets/base'
import type { Position } from '@lemnity/widget-config/widgets/notification'
import Badge from './Badge'

type DesktopWidgetTriggerProps =
  Pick<HTMLProps<HTMLElement>, 'children'>
  & Pick<HTMLProps<HTMLButtonElement>, 'ref'>
  & {
      open: boolean
      triggerStyle: CSSProperties
      triggerHoverDivStyle: CSSProperties
      triggerHoverTextStyle: CSSProperties
      closeIconStyle: CSSProperties
      triggerIcon: Icon
      triggerText: string
      triggerPosition: Position
      numberOfNotifications: number
      onMouseEnter?: () => void
      onMouseLeave?: () => void
      toggleOpen: () => void
    }

const DesktopWidgetTrigger = ({ ref, ...props }: DesktopWidgetTriggerProps) => {
  const TriggerIcon = props.triggerIcon ? Icons[props.triggerIcon] : null
  const shouldShowHoverLabel =
    (!props.triggerText || props.triggerText.length === 0) && !props.open

  return (
    <>
      {props.children}

      <button
        ref={ref}
        type='button'
        onClick={props.toggleOpen}
        className={cn(
          'group flex items-center justify-center rounded-full',
          'text-white ring-1 ring-white/20 relative',
          'transition-transform motion-reduce:transition-none duration-250',
          'h-15.5 min-w-15.5 w-fit gap-2.5 px-4 hover:scale-105',
          props.triggerPosition === 'bottom-right' && 'self-end',
        )}
        style={props.triggerStyle}
        aria-label={props.open ? 'Скрыть уведомления' : 'Показать уведомления'}
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

        <Badge badgeContent={props.numberOfNotifications} />

        {shouldShowHoverLabel && (
          <div className='absolute' style={props.triggerHoverDivStyle}>
            <div
              className={cn(
                'bg-white',
                'rounded-full opacity-0 transition-all duration-300',
                'group-hover:opacity-100',
                props.triggerPosition === 'bottom-right'
                  ? 'group-hover:-translate-x-[73%]'
                  : 'group-hover:translate-x-[73%]',
              )}
            >
              <div
                className='w-full h-full rounded-full text-[20px] leading-5 p-4'
                style={props.triggerHoverTextStyle}
              >
                Уведомления
              </div>
            </div>
          </div>
        )}
      </button>
    </>
  )
}

export default DesktopWidgetTrigger
