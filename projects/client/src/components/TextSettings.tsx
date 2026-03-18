import { Button } from '@heroui/button'
import { Textarea } from '@heroui/input'
import { cn } from '@heroui/theme'

import ColorPicker from '@/components/ColorPicker'
import FontSizeSettings from './FontSizeSettings'

import { getFontWeightClass } from '@/layouts/Widgets/Announcement/utils/getFontWeightClass'
import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

type FontWeightButtonProps = {
  variant: FontWeight
  onPress?: (variant: FontWeight) => void
}

const FontWeightButton = (props: FontWeightButtonProps) => {
  const handlePress = () => {
    props.onPress?.(props.variant)
  }

  return (
    <Button
      className={cn(
        'min-w-8 h-12.5 bg-white border border-[#E8E8E8] rounded-[5px]',
      )}
      onPress={handlePress}
    >
      <span className={getFontWeightClass(props.variant)}>
        {props.variant === 'regular'
          ? 'R'
          : props.variant === 'medium'
            ? 'M'
            : props.variant === 'bold'
              ? 'B'
              : null}
      </span>
    </Button>
  )
}

type MessageSettingsProps = {
  title: string
  text: string
  fontSize?: number
  textColor: string
  placeholder?: string
  onTextChange: (value: string) => void
  onFontSizeChange?: (value: number) => void
  onFontWeightChange: (weight: FontWeight) => void
  onColorChange: (value: string) => void
}

const TextSettings = (props: MessageSettingsProps) => {
  return (
    <div className="@container min-w-76 flex flex-col gap-2.5">
      <h3 className="text-[16px] leading-4.75 text-[#060606]">
        {props.title}
      </h3>

      <div className="flex flex-row flex-wrap gap-2.5">
        <Textarea
          placeholder={props.placeholder || "Введите текст"}
          value={props.text}
          onValueChange={props.onTextChange}
          minRows={1}
          classNames={{
            base: 'min-w-76 flex-1',
            inputWrapper: cn(
              'rounded-md bg-white border border-[#E8E8E8] rounded-[5px]',
              'shadow-none min-h-12.5 px-2.5',
            ),
            input: 'placeholder:text-[#AAAAAA] text-base'
          }}
        />
        <div
          className={cn(
            'w-full flex flex-row justify-between',
            '@min-[600px]:w-fit @min-[600px]:justify-normal',
            '@min-[600px]:gap-2.5',
          )}
        >
          {/* typeof props.fontSize === 'number ? */}
          {(props.fontSize || props.fontSize === 0) && (
            <FontSizeSettings
              value={props.fontSize}
              onChange={props.onFontSizeChange}
            />
          )}
          <div className='flex flex-row flex-nowrap gap-2.5'>
            <FontWeightButton
              variant='regular'
              onPress={props.onFontWeightChange}
            />
            <FontWeightButton
              variant='medium'
              onPress={props.onFontWeightChange}
            />
            <FontWeightButton
              variant='bold'
              onPress={props.onFontWeightChange}
            />
          </div>
          <ColorPicker
            popoverPlacement='bottom-end'
            initialColor={props.textColor}
            onColorChange={props.onColorChange}
          />
        </div>
      </div>
    </div>
  )
}

export default TextSettings
