import CustomRadioGroup from '@/components/CustomRadioGroup'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import ColorPicker from '@/components/ColorPicker'
import type { ColorScheme } from '@lemnity/widget-config/widgets/base'

type WidgwtBackgroundColorProps = {
  colorScheme: ColorScheme
  backgroundColor: string
  onBackgroundColorChange: (color: string) => void
  onColorSchemeChange: (scheme: ColorScheme) => void
}

type WidgetBackgroundOption = {
  label: string
  value: ColorScheme
  payloadNode?: React.ReactNode
}

const WidgetBackgroundColor = (props: WidgwtBackgroundColorProps) => {
  const options: WidgetBackgroundOption[] = [
    { label: 'Основная', value: 'primary' },
    {
      label: 'Пользовательская',
      value: 'custom',
      payloadNode: <ColorPicker
        disabled={props.colorScheme !== 'custom'}
        initialColor={props.backgroundColor}
        onColorChange={(color) => props.onBackgroundColorChange(color)}
      />
    },
  ]

  const handleTypeChange = (value: string) => {
    props.onColorSchemeChange(value as ColorScheme)
  }

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-6">
        <h2 className="text-[16px] leading-4.75">Цветовая гамма</h2>

        <div className="w-full flex flex-row gap-2.5">
          <div className="grow">
            <CustomRadioGroup
              options={options}
              value={props.colorScheme}
              onValueChange={handleTypeChange}
            />
          </div>
        </div>
      </div>
    </BorderedContainer>
  )
}

export default WidgetBackgroundColor
