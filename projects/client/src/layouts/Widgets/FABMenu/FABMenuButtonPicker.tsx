import type { CSSProperties } from 'react'

import { Button } from '@heroui/button'
import SvgIcon from '@/components/SvgIcon'
import {
  FAB_MENU_BUTTON_GROUPS,
  FAB_MENU_BUTTON_PRESETS,
  FAB_MENU_ICON_OPTIONS
} from '@/layouts/Widgets/FABMenu/buttonLibrary'
import type {
  FABMenuButtonDefinition,
} from '@/layouts/Widgets/FABMenu/buttonLibrary'

type FABMenuButtonPickerProps = {
  onClose: () => void
  onSelect: (preset: FABMenuButtonDefinition) => void
}

const getButtonStylesNamesByType = (button: FABMenuButtonDefinition) => {
  switch (button.group) {
    case 'universal':
      return 'bg-[#5951E5] text-white text-xs rounded-[3.61px] h-8 px-3'
    case 'messenger':
    case 'social':
      return 'text-white text-xs rounded-[3.61px] h-8 px-3'
    default:
      return 'text-xs h-8 px-3'
  }
}

const getButtonInlineStyle =
  (button: FABMenuButtonDefinition): CSSProperties | undefined => {
    if (button.group === 'messenger' || button.group === 'social') {
      const style: CSSProperties = {}
      const gradientStops = button.gradientColors?.join(', ')
      const firstGradientColor = button.gradientColors?.[0]
      const hasGradient = Boolean(gradientStops)
      // const isMaxButton = button.icon === 'max-message'

      // if (isMaxButton && hasGradient) {
      //   style.backgroundImage = `linear-gradient(#ffffff, #ffffff), linear-gradient(90deg, ${gradientStops})`
      //   style.backgroundOrigin = 'padding-box, border-box'
      //   style.backgroundClip = 'padding-box, border-box'
      //   style.border = '1px solid transparent'
      //   style.borderRadius = '4px'
      // } else
      if (hasGradient) {
        style.backgroundImage = `linear-gradient(90deg, ${gradientStops})`
        style.backgroundColor = firstGradientColor ?? button.color
      } else {
        style.backgroundColor = button.color
      }

      if (button.textColor) {
        style.color = button.textColor
      }

      return style
    }

    return undefined
  }

const FABMenuButtonPicker = ({ onSelect }: FABMenuButtonPickerProps) => {
  return (
    <div className="space-y-2 border border-[#E8E8E8] bg-[#EAEAEA] p-3 rounded-md">
      {FAB_MENU_BUTTON_GROUPS.map(group => {
        const buttons = FAB_MENU_BUTTON_PRESETS.filter(preset => preset.group === group.id)
        if (!buttons.length) return null
        return (
          <div key={group.id} className="space-y-2.5 rounded-xl border border-[#E5E7EB]">
            <p className="text-sm color-[#3D3D3B]">{group.label}</p>
            <div className="flex flex-wrap gap-2.5">
              {buttons.map(button => {
                const showSvg = Boolean(button.icon && (button.showIcon ?? true))
                return (
                  <Button
                    key={button.label}
                    variant="flat"
                    className={getButtonStylesNamesByType(button)}
                    style={getButtonInlineStyle(button)}
                    onPress={() => onSelect(button)}
                    startContent={
                      showSvg ? (
                        <SvgIcon
                          src={FAB_MENU_ICON_OPTIONS[button.icon!].icon}
                          size="18px"
                          className="text-current w-min"
                          preserveOriginalColors={
                            button.group === 'messenger' || button.group === 'social'
                          }
                        />
                      ) : undefined
                    }
                  >
                    {button.buttonLabel}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FABMenuButtonPicker
