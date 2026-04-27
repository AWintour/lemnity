import { useState } from 'react'
import { Input } from '@heroui/input'
import { cn } from '@heroui/theme'

import ColorPicker from '@/components/ColorPicker'
import IconPicker, { type IconName } from '@/components/IconPicker'

type ButtonAppearenceSettingsProps = {
  onTriggerTextChange: (value: string) => void
  onTriggerIconChange?: (icon: IconName) => void
  onFontColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  buttonText?: string
  buttonTextColor: string
  buttonBackgroundColor: string
  buttonIcon?: IconName
}

const ButtonAppearenceSettings = (props: ButtonAppearenceSettingsProps) => {
  const [isInputInvalid, setIsInputInvalid] = useState(false)

  const handleTriggerTextChange = (value: string) => {
    if (value.length > 20) {
      // TODO: сообщение пользователю
      setIsInputInvalid(true)
      return
    }

    setIsInputInvalid(false)
    props.onTriggerTextChange(value)
  }

  const handleTriggerIconChange = (icon: IconName) => {
    props.onTriggerIconChange?.(icon)
  }

  return (
    <div className="flex flex-row flex-wrap gap-2.5 @container">
      <Input
        value={props.buttonText}
        onValueChange={handleTriggerTextChange}
        isInvalid={isInputInvalid}
        placeholder="Супер кнопка"
        classNames={{
          base: 'min-w-40 flex-3',
          inputWrapper: cn(
            'border bg-white border-[#E4E4E7] rounded-[5px]',
            'shadow-none h-12.75 min-h-10 px-2.5'
          ),
          input: 'text-base'
        }}
      />

      <ColorPicker
        popoverPlacement='bottom'
        initialColor={props.buttonTextColor}
        onColorChange={props.onFontColorChange}
        triggerText="Цвет шрифта"
      />

      {props.buttonIcon && (
        <IconPicker
          popoverPlacement='bottom'
          initialIcon={props.buttonIcon}
          onIconChange={handleTriggerIconChange}
        />
      )}

      <ColorPicker
        popoverPlacement='bottom-end'
        initialColor={props.buttonBackgroundColor}
        onColorChange={props.onBackgroundColorChange}
        triggerText="Цвет кнопки"
      />
    </div>
  )
}

export default ButtonAppearenceSettings
