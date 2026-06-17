import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
import ImageUploader from '@/components/ImageUploader'
import CustomSwitch from '@/components/CustomSwitch'
import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import ButtonSettingsField from './ButtonSettingsField/ButtonSettingsField'
import ButtonPositionChooser from './ButtonPositionChooser/ButtonPositionChooser'
import TimerSettingsField from './TimerSettingsField/TimerSettingsField'
import DisplaySettingsField from './DisplaySettingsField/DisplaySettingsField'
import { AnimatePresence } from 'framer-motion'
import type { StartShowing, IconType, HideIcon } from '@/stores/widgetSettingsStore'
import { memo, useCallback, useMemo } from 'react'
import { usesStandardSurface } from '@/stores/widgetSettings/widgetDefinitions'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import SurfaceNotice from '@/layouts/WidgetSettings/Common/SurfaceNotice'
// Чат: блоки, перенесённые на вкладку «Отображение» из «Настройка виджета».
import ChatMobileVersionSettings from '@/layouts/Widgets/Chat/ChatMobileVersionSettings'
import ChatIconTypeField from '@/layouts/Widgets/Chat/ChatIconTypeField'
import ChatButtonAnimationSettings from '@/layouts/Widgets/Chat/ChatButtonAnimationSettings'
import ChatAgreementSettings from '@/layouts/Widgets/Chat/ChatAgreementSettings'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { uploadImage } from '@/api/upload'

const startShowingOptions: OptionItem[] = [
  {
    key: 'onClick',
    label: 'При нажатии на кнопку'
  },
  {
    key: 'timer',
    label: 'Автоматически',
    tip: 'Запуск происходит спустя заданное время'
  }
]

const iconHideOptions: OptionItem[] = [
  { key: 'always', label: 'Всегда' },
  { key: 'afterFormSending', label: 'После отправки формы' }
]

const StartShowingControl = memo(() => {
  const setStartShowing = useWidgetSettingsStore(s => s.setStartShowing)
  const staticDefaults = useWidgetStaticDefaults()
  const startShowing = useWidgetSettingsStore(
    s => s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick'
  )

  const handleChange = useCallback(
    (v: string) => setStartShowing(v as StartShowing),
    [setStartShowing]
  )
  return (
    <OptionsChooser
      title="Выберите условие начала показа"
      options={startShowingOptions}
      value={startShowing}
      onChange={handleChange}
    />
  )
})

// Чат: «Условие начала показа» — два НЕЗАВИСИМЫХ переключателя в строку (без поля таймера).
// Оба можно включить одновременно: «Автоматически» ↔ startShowing='timer', «При нажатии на кнопку»
// ↔ отдельный флаг display.onClickEnabled (схема display — loose, флаг переживает сохранение).
const StartShowingSwitches = memo(() => {
  const setStartShowing = useWidgetSettingsStore(s => s.setStartShowing)
  const updateDisplay = useWidgetSettingsStore(s => s.displaySettingsUpdater)
  const staticDefaults = useWidgetStaticDefaults()
  const autoEnabled = useWidgetSettingsStore(
    s => (s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick') === 'timer'
  )
  const onClickEnabled = useWidgetSettingsStore(
    s => (s.settings?.display as { onClickEnabled?: boolean } | undefined)?.onClickEnabled ?? true
  )
  const setOnClick = (v: boolean) =>
    updateDisplay(s => ({ ...s, onClickEnabled: v }) as typeof s)
  const setAuto = (v: boolean) => setStartShowing(v ? 'timer' : 'onClick')

  const option = (label: string, selected: boolean, onChange: (v: boolean) => void) => (
    <div className="flex-1 flex items-center justify-between gap-3 rounded-md border border-[#E4E4E7] bg-[#F8F8FA] px-4 h-14">
      <span className="text-gray-700">{label}</span>
      <CustomSwitch
        size="sm"
        isSelected={selected}
        onValueChange={onChange}
        selectedColor="!bg-[#5951E5]"
      />
    </div>
  )
  return (
    <div className="flex flex-col rounded-lg p-3 border border-gray-200 gap-2">
      <span className="text-black text-lg font-Rubik font-medium">Выберите условие начала показа</span>
      <div className="flex flex-row gap-2">
        {option('При нажатии на кнопку', onClickEnabled, setOnClick)}
        {option('Автоматически', autoEnabled, setAuto)}
      </div>
    </div>
  )
})

const TimerSettingsConditional = memo(() => {
  const staticDefaults = useWidgetStaticDefaults()
  const startShowing = useWidgetSettingsStore(
    s => s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick'
  )
  return (
    <AnimatePresence>{startShowing === 'timer' ? <TimerSettingsField /> : null}</AnimatePresence>
  )
})

// Чат: при включённом «Автоматически» показываем ТОЛЬКО блок «Настройки показа»
// (без «Частота показа», «Не показывать», «Ограничения времени показа», «Расписание показа»).
const ChatTimerSettingsConditional = memo(() => {
  const staticDefaults = useWidgetStaticDefaults()
  const startShowing = useWidgetSettingsStore(
    s => s.settings?.display?.startShowing ?? staticDefaults?.display?.startShowing ?? 'onClick'
  )
  return (
    <AnimatePresence>{startShowing === 'timer' ? <DisplaySettingsField /> : null}</AnimatePresence>
  )
})

const IconTypeControl = memo(() => {
  const setIconType = useWidgetSettingsStore(s => s.setIconType)
  const setIconImage = useWidgetSettingsStore(s => s.setIconImage)
  const staticDefaults = useWidgetStaticDefaults()
  const iconType = useWidgetSettingsStore(
    s => s.settings?.display?.icon?.type ?? staticDefaults?.display?.icon?.type ?? 'image'
  )
  const handleChange = useCallback((v: string) => setIconType(v as IconType), [setIconType])
  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setIconImage(null)
        return
      }

      uploadImage(file)
        .then(({ url }) => setIconImage({ fileName: file.name, url }))
        .catch(err => {
          console.error('Icon upload failed', err)
          setIconImage(null)
          alert('Не удалось загрузить изображение иконки')
        })
    },
    [setIconImage]
  )
  const iconTypeOptionsMemo = useMemo<OptionItem[]>(
    () => [
      {
        key: 'image',
        label: 'Изображение',
        below: (
          <ImageUploader
            hideSwitch
            classNames={{ container: 'border-none !p-0' }}
            title="Использовать свою картинку"
            recommendedResolution="100x100"
            fileSize="300 Kb"
            formats={['png, jpg, jpeg, webp']}
            onFileSelect={handleFile}
          />
        )
      },
      { key: 'button', label: 'Кнопка', below: <ButtonSettingsField /> }
    ],
    [handleFile]
  )
  return (
    <OptionsChooser
      title="Вид иконки"
      options={iconTypeOptionsMemo}
      value={iconType}
      onChange={handleChange}
    />
  )
})

const PositionControl = memo(() => {
  const setButtonPosition = useWidgetSettingsStore(s => s.setButtonPosition)
  const staticDefaults = useWidgetStaticDefaults()
  const buttonPosition = useWidgetSettingsStore(
    s =>
      s.settings?.display?.icon?.position ??
      staticDefaults?.display?.icon?.position ??
      'bottom-left'
  )
  return <ButtonPositionChooser value={buttonPosition} onChange={setButtonPosition} />
})

const HideIconControl = memo(() => {
  const setHideIcon = useWidgetSettingsStore(s => s.setHideIcon)
  const staticDefaults = useWidgetStaticDefaults()
  const hide = useWidgetSettingsStore(
    s => s.settings?.display?.icon?.hide ?? staticDefaults?.display?.icon?.hide ?? 'always'
  )
  const handleChange = useCallback((v: string) => setHideIcon(v as HideIcon), [setHideIcon])
  return (
    <OptionsChooser
      title="Сокрытие иконки"
      options={iconHideOptions}
      value={hide}
      onChange={handleChange}
    />
  )
})

const DisplaySettingsTab = () => {
  const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
  const widgetDefinition = widgetType ? getWidgetDefinition(widgetType) : null
  const showStandardSurface = !widgetType || usesStandardSurface(widgetType, 'display')
  const CustomDisplaySurface = widgetDefinition?.settings.surfaces?.display

  if (!showStandardSurface) {
    if (CustomDisplaySurface) return <CustomDisplaySurface />
    return <SurfaceNotice surface="display" />
  }

  const isChat = widgetType === WidgetTypeEnum.CHAT

  // Чат: своя раскладка вкладки «Отображение» — условие показа переключателями (без таймера),
  // без «Сокрытия иконки», плюс перенесённые сюда «Ограничения времени показа» и «Мобильная версия».
  if (isChat) {
    return (
      <div className="flex flex-col gap-3">
        <StartShowingSwitches />
        {/* При включённом «Автоматически» — только «Настройки показа» (без частоты/расписания/лимитов). */}
        <ChatTimerSettingsConditional />
        <ChatIconTypeField />
        <ChatButtonAnimationSettings />
        <PositionControl />
        <ChatAgreementSettings />
        <ChatMobileVersionSettings />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <StartShowingControl />
      <TimerSettingsConditional />
      <IconTypeControl />
      <PositionControl />
      <HideIconControl />
    </div>
  )
}

export default memo(DisplaySettingsTab)
