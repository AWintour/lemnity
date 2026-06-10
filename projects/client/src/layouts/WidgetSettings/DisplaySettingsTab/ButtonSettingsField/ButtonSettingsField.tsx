import { Input } from '@heroui/input'
import ColorAccessory from '@/components/ColorAccessory'
import useWidgetSettingsStore, {
  useDisplaySettings,
  useWidgetStaticDefaults
} from '@/stores/widgetSettingsStore'
import { withDefaultsPath } from '@/stores/widgetSettings/utils'
import { useEffect, useState } from 'react'
import type { Issue } from '@lemnity/widget-config'
import { useShallow } from 'zustand/react/shallow'

const ButtonSettingsField = () => {
  const { setButtonIcon } = useDisplaySettings()

  const staticDefaults = useWidgetStaticDefaults()
  const defaultButton = staticDefaults?.display.icon.button ?? {
    text: '',
    buttonColor: '#1A52DB',
    textColor: '#FFFFFF'
  }
  const button = useWidgetSettingsStore(
    useShallow(s => withDefaultsPath(s.settings?.display?.icon, 'button', defaultButton))
  )
  const { text, buttonColor, textColor } = button

  const getErrors = useWidgetSettingsStore(s => s.getErrors)
  const showValidation = useWidgetSettingsStore(s => s.validationVisible)
  const [errors, setErrors] = useState<Issue[]>([])

  useEffect(() => {
    setErrors(showValidation ? getErrors('display.icon.button') : [])
  }, [getErrors, showValidation, text])

  return (
    <div className="flex flex-col gap-2">
      <span>Текст в кнопке</span>
      <div className="flex flex-row gap-2 nowrap">
        <Input
          radius="sm"
          type="text"
          variant="bordered"
          value={text ?? ''}
          onChange={e => setButtonIcon(e.target.value, buttonColor, textColor)}
          isInvalid={errors.some(e => e.path.endsWith('text'))}
          errorMessage={errors.find(e => e.path.endsWith('text'))?.message}
          className="max-w-full"
          classNames={{
            inputWrapper: 'h-14',
            input: 'placeholder:text-[#AFAFAF]'
          }}
        />
        <ColorAccessory
          color={buttonColor}
          onChange={color => setButtonIcon(text, color, textColor)}
          label="Кнопка"
        />
        <ColorAccessory
          color={textColor ?? '#FFFFFF'}
          onChange={color => setButtonIcon(text, buttonColor, color)}
          label="Текст"
        />
      </div>
    </div>
  )
}

export default ButtonSettingsField
