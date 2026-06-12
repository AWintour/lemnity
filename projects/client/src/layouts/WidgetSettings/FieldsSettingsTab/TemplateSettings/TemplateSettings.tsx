import ColorAccessory from '@/components/ColorAccessory'
import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
import ImageUploader from '@/components/ImageUploader'
import useWidgetSettingsStore, {
  useVisibleErrors,
  useWidgetStaticDefaults
} from '@/stores/widgetSettingsStore'
import { AnimatePresence, motion } from 'framer-motion'
import type { ColorScheme, ContentPosition, WindowFormat } from '@/stores/widgetSettings/types'
import { withDefaultsPath } from '@/stores/widgetSettings/utils'
import { uploadImage } from '@/api/upload'
import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'
import { Slider } from '@heroui/slider'

const TemplateSettings = () => {
  const {
    setTemplateImageEnabled,
    setTemplateImageFile,
    setWindowFormat,
    setContentPosition,
    setColorScheme,
    setCustomColor
  } = useFieldsSettings()
  const staticDefaults = useWidgetStaticDefaults()
  const defaultTemplateSettings = staticDefaults?.fields?.template?.templateSettings ?? {
    image: { enabled: false, fileName: '', url: '' },
    windowFormat: 'sidePanel',
    contentPosition: 'left',
    colorScheme: 'primary',
    customColor: '#FFFFFF'
  }
  const settings = useWidgetSettingsStore(s =>
    withDefaultsPath(s.settings?.fields, 'template.templateSettings', defaultTemplateSettings)
  )
  const getErrors = useWidgetSettingsStore(s => s.getErrors)
  const showValidation = useWidgetSettingsStore(s => s.validationVisible)
  const errors = showValidation ? getErrors('fields.template.templateSettings') : []
  const customColorError = errors.find(e => e.path.endsWith('customColor'))

  const { image } = settings ?? {}
  const { enabled, fileName, url } = image ?? {}
  const imageErrors = useVisibleErrors(showValidation, 'fields.template.templateSettings.image')
  const imageUrlError = imageErrors.find(e => e.path.endsWith('url'))
  const imageFileNameError = imageErrors.find(e => e.path.endsWith('fileName'))
  const widgetType = useWidgetSettingsStore(s => s?.settings?.widgetType)
  // Радиус скругления карточек ленты (только для «колеса/конвейера»).
  const cardRadius = useWidgetSettingsStore(
    s => (s.settings?.widget as { cardRadius?: number } | undefined)?.cardRadius ?? 24
  )
  const setCardRadius = useWidgetSettingsStore(s => s.setWheelCardRadius)

  const colorOptions: OptionItem[] = [
    { key: 'primary', label: 'Основная' },
    {
      key: 'custom',
      label: 'Пользовательская',
      accessory: <ColorAccessory color={settings?.customColor} onChange={setCustomColor} />
    }
  ]

  const contentPositionOptions: OptionItem[] = [
    { key: 'left', label: 'С левой стороны' },
    { key: 'right', label: 'С правой стороны' }
  ]

  const windowFormatOptions: OptionItem[] = [
    {
      key: 'sidePanel',
      label: 'Боковая панель',
      disabled: isWheelLikeWidgetType(widgetType)
    },
    { key: 'modalWindow', label: 'Модальное окно' }
  ]

  return (
    <motion.div
      initial={{ opacity: 1, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden flex flex-col gap-3"
    >
      <OptionsChooser
        title="Цветовая гамма"
        options={colorOptions}
        value={settings.colorScheme}
        onChange={k => {
          setColorScheme(k as ColorScheme)
          setCustomColor(settings.customColor)
        }}
      />
      {widgetType === WidgetTypeEnum.ACTION_TIMER ? null : (
        <ImageUploader
          checked={enabled}
          setChecked={setTemplateImageEnabled}
          title="Картинка"
          recommendedResolution="500x500"
          fileSize="менее 2 Mb"
          filename={fileName}
          url={url}
          onFileSelect={file => {
            if (!file) return
            uploadImage(file).then(({ url }: { url: string }) => {
              setTemplateImageFile(file.name, url)
            })
          }}
          isInvalid={Boolean(settings.image.enabled && (imageUrlError || imageFileNameError))}
          errorMessage={imageUrlError?.message || imageFileNameError?.message}
        />
      )}
      {widgetType === WidgetTypeEnum.ACTION_TIMER ? null : (
        <OptionsChooser
          title="Формат окна"
          options={windowFormatOptions}
          value={settings?.windowFormat}
          onChange={k => {
            if (k === 'sidePanel') {
              setContentPosition('right')
            }
            setWindowFormat(k as WindowFormat)
          }}
        />
      )}
      <AnimatePresence>
        {settings?.windowFormat === 'modalWindow' ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OptionsChooser
              title="Расположение контента"
              options={contentPositionOptions}
              value={settings.contentPosition}
              onChange={k => setContentPosition(k as ContentPosition)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {isWheelLikeWidgetType(widgetType) ? (
        <div className="flex flex-col gap-2 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-black text-lg font-medium">Радиус скругления</span>
            <span className="text-sm text-gray-500">{cardRadius}px</span>
          </div>
          <Slider
            aria-label="Радиус скругления карточек"
            size="sm"
            minValue={0}
            maxValue={40}
            step={1}
            value={cardRadius}
            onChange={v => setCardRadius(Array.isArray(v) ? v[0] : v)}
            classNames={{ track: 'bg-[#E4E4E7]', filler: 'bg-[#1A52DB]' }}
          />
        </div>
      ) : null}
      {showValidation && customColorError ? (
        <span className="text-sm text-red-500">{customColorError.message}</span>
      ) : null}
    </motion.div>
  )
}

export default TemplateSettings
