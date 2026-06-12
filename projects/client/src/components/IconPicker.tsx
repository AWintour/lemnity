import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'
import { Button } from '@heroui/button'
import { cn } from '@heroui/theme'
import * as Icons from './Icons'
import React, { useState } from 'react'

type IconButtonProps = {
  selected?: boolean
  children: React.ReactNode
  onClick: () => void
}

export type IconName = keyof typeof Icons

const IconButton = (props: IconButtonProps) => (
  <div
    onClick={props.onClick}
    className={cn(
      'w-11 h-11 rounded-[5px] flex items-center justify-center box-content border cursor-pointer',
      props.selected ? 'border-[#915DC0] border-2' : 'border-[#D9D9D9] m-px'
    )}
  >
    <div className="w-6 h-6">{props.children}</div>
  </div>
)

const icons: IconName[] = [
  'HeartDislike',
  'Reload',
  'Heart',
  'Rocket',
  'Sparkles',
  'Pizza',
  'Paw',
  'Nuclear',
  'Moon',
  'Restaurant',
  'Send',
  'Star',
  'Sunny',
  'Key',
  'Hammer',
  'GameController',
  'Flower',
  'Fish',
  'Flame',
  'Balloon',
  'Basket'
]

// copied from
// (property) placement?: OverlayPlacement | undefined
// The placement of the element with respect to its anchor element.
// 
// ..because i have not figured out how to import/extract this type
// without installing an extra package
type PopoverPlacement = (
  | "bottom-start"
  | "top"
  | "bottom"
  | "right"
  | "left"
  | "top-start"
  | "top-end"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end"
) | undefined

type IconPickerProps = {
  initialIcon?: IconName
  // popoverPlacement?: Pick<PopoverProps, 'placement'>
  popoverPlacement?: PopoverPlacement
  onIconChange: (icon: IconName) => void
  triggerClassName?: string
}

const IconPicker = (props: IconPickerProps) => {
  const [selectedIconName, setSelectedIconName] =
    useState<IconName | undefined>(props.initialIcon)
  const SelectedIcon = selectedIconName ? Icons[selectedIconName] : null
  
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handlePopoverOpenChange = () => {
    setSettingsOpen(!settingsOpen)
  }

  const handleIconChange = (icon: IconName) => {
    setSelectedIconName(icon)
    props.onIconChange(icon)
  }

  return (
    <Popover
      placement={props.popoverPlacement ?? 'bottom-start'}
      classNames={{
        base: cn(
          'bg-white rounded-[10px]',
          'shadow-[0px_8px_15px_6px_rgba(0,0,0,0.15)]',
        ),
        content: 'w-104 h-47 flex-row flex-wrap gap-2 p-4 justify-start',
      }}
      onOpenChange={handlePopoverOpenChange}
    >
      <PopoverTrigger>
        <Button
          className={cn(
            'rounded-[5px] w-18 h-12.75 bg-white',
            'border border-[#E4E4E7] p-3.75',
            'flex items-center justify-center gap-1.25 grow',
            '@min-[270px]:shrink-0 @min-[270px]:grow-0',
            props.triggerClassName,
          )}
        >
          {SelectedIcon && (
            <div className="w-6 h-6">
              <SelectedIcon />
            </div>
          )}

          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="1em"
            data-open={settingsOpen}
            className={cn(
              'w-4 h-4 transition-transform duration-150 ease',
              'motion-reduce:transition-none data-[open=true]:rotate-180',
            )}
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {icons.map(name => {
          const IconComponent = Icons[name]
          if (typeof IconComponent !== 'function') return null

          return (
            <IconButton
              key={name}
              selected={selectedIconName === name}
              onClick={() => handleIconChange(name as IconName)}
            >
              <IconComponent />
            </IconButton>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

export default IconPicker
