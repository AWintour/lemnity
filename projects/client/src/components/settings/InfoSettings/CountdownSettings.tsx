import { DateInput } from '@heroui/date-input'
import { cn } from '@heroui/theme'
import { type ZonedDateTime } from '@internationalized/date'

import SwitchableField from '@/components/SwitchableField'
import ColorPicker from '@/components/ColorPicker'

type CountdownSettingsProps = {
  enabled: boolean
  date: ZonedDateTime
  backgroundColor: string
  fontColor: string
  onToggle: (nextEnabled: boolean) => void
  onDateChange: (value: ZonedDateTime | null) => void
  onBackgroundColorChange: (value: string) => void
  onFontColorChange: (value: string) => void
}

const CountdownSettings = (props: CountdownSettingsProps) => {
  return (
    <SwitchableField
      title="Обратный отсчёт"
      enabled={props.enabled}
      onToggle={props.onToggle}
      classNames={{
        title: 'text-[16px] leading-4.75 font-normal',
      }}
    >
      <div className="w-full flex flex-row flex-wrap gap-2.5">
        <DateInput
          hourCycle={24}
          defaultValue={props.date}
          onChange={props.onDateChange}
          classNames={{
            base: 'min-w-76 flex-1',
            inputWrapper: cn(
              'rounded-md border bg-white border-[#E8E8E8] rounded-[5px]',
              'shadow-none h-12.5 px-2.5',
            ),
            input: 'placeholder:text-[#AAAAAA] text-base'
          }}
          aria-label="Дата окончания события"
        />

        <ColorPicker
          initialColor={props.fontColor}
          onColorChange={props.onFontColorChange}
        />
        <ColorPicker
          initialColor={props.backgroundColor}
          onColorChange={props.onBackgroundColorChange}
        />
      </div>
    </SwitchableField>
  )
}

export default CountdownSettings
