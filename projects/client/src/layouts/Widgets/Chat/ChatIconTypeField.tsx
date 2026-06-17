import { useShallow } from 'zustand/react/shallow'
import { useCallback } from 'react'

import OptionsChooser, { type OptionItem } from '@/components/OptionsChooser'
import ImageUploader from '@/components/ImageUploader'
import CustomSwitch from '@/components/CustomSwitch'
import ButtonSettingsField from '@/layouts/WidgetSettings/DisplaySettingsTab/ButtonSettingsField/ButtonSettingsField'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { IconType } from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as chatDefaults } from './defaults'
import { uploadImage } from '@/api/upload'

// «Вид иконки» для Чата: три варианта. «Аватарка» — лаунчер с аватарами операторов и приветствиями.
// chatIconKind/greetings храним в loose-полях display (схема display — passthrough, миграции не нужно).
type IconKind = 'image' | 'button' | 'avatar'
const EMPTY_GREETINGS: string[] = []

const ChatIconTypeField = () => {
  const updateDisplay = useWidgetSettingsStore(s => s.displaySettingsUpdater)
  const setIconType = useWidgetSettingsStore(s => s.setIconType)
  const setIconImage = useWidgetSettingsStore(s => s.setIconImage)

  const iconKind = useWidgetSettingsStore(s => {
    const d = s.settings?.display as { chatIconKind?: IconKind; icon?: { type?: IconType } } | undefined
    return (d?.chatIconKind ?? d?.icon?.type ?? 'image') as IconKind
  })

  const greetings = useWidgetSettingsStore(
    useShallow(
      s => (s.settings?.display as { greetings?: string[] } | undefined)?.greetings ?? EMPTY_GREETINGS
    )
  )

  const iconSize = useWidgetSettingsStore(
    s => (s.settings?.display as { iconSize?: number } | undefined)?.iconSize ?? 62
  )
  const setIconSize = (v: number) => updateDisplay(s => ({ ...s, iconSize: v }) as typeof s)

  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)
  const personalized = useWidgetSettingsStore(
    s => (s.settings?.widget as ChatWidgetType).personalizedGreetings ?? chatDefaults.personalizedGreetings
  )
  const personalizedText = useWidgetSettingsStore(
    s =>
      (s.settings?.display as { personalizedText?: string } | undefined)?.personalizedText ??
      'Снова здравствуйте, (имя пользователя)! Нужна помощь с выбором ноутбука?'
  )
  const setPersonalizedText = (v: string) =>
    updateDisplay(s => ({ ...s, personalizedText: v }) as typeof s)

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) { setIconImage(null); return }
      uploadImage(file)
        .then(({ url }) => setIconImage({ fileName: file.name, url }))
        .catch(() => setIconImage(null))
    },
    [setIconImage]
  )

  const setKind = (kind: IconKind) => {
    updateDisplay(s => ({ ...s, chatIconKind: kind }) as typeof s)
    // Для image/button синхронизируем стандартный icon.type (рантайм лаунчера читает его).
    if (kind === 'image' || kind === 'button') setIconType(kind)
    // При выборе «Аватарка» авто-активируем персонализированные приветствия.
    if (kind === 'avatar') setChatPatch({ personalizedGreetings: true })
  }

  const setGreetings = (next: string[]) =>
    updateDisplay(s => ({ ...s, greetings: next }) as typeof s)

  const greetingsEditor = (
    <div className="w-full flex flex-col gap-2 py-2">
      {greetings.map((g, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={g}
            onChange={e => setGreetings(greetings.map((it, idx) => (idx === i ? e.target.value : it)))}
            placeholder="Текст приветствия"
            className="flex-1 h-11 rounded-[10px] border border-[#E4E4E7] px-3 text-[15px] text-[#1A1A1A] outline-none focus:border-[#5951E5]"
          />
          <button
            type="button"
            aria-label="Удалить приветствие"
            onClick={() => setGreetings(greetings.filter((_, idx) => idx !== i))}
            className="shrink-0 w-9 h-9 rounded-[10px] border border-[#E4E4E7] text-[#9A9A9A] hover:bg-[#F4F4F6]"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGreetings([...greetings, ''])}
        className="self-start text-[15px] text-[#5951E5] font-medium hover:underline"
      >
        + Добавить приветствие
      </button>

      {/* Персонализированные приветствия — авто-вкл при «Аватарке»; вместо поля — текст-подсказка. */}
      <div className="mt-2 pt-3 border-t border-[#EDEDF0] flex items-center justify-between gap-3">
        <span className="text-[15px] text-[#1A1A1A]">Персонализированные приветствия</span>
        <CustomSwitch
          size="sm"
          isSelected={personalized}
          onValueChange={v => setChatPatch({ personalizedGreetings: v })}
          selectedColor="!bg-[#5951E5]"
        />
      </div>
      {personalized && (
        <textarea
          value={personalizedText}
          onChange={e => setPersonalizedText(e.target.value)}
          rows={2}
          placeholder="Снова здравствуйте, (имя пользователя)! Нужна помощь с выбором ноутбука?"
          className="w-full resize-none rounded-[10px] border border-[#E4E4E7] px-3 py-2.5 text-[15px] leading-5 text-[#1A1A1A] outline-none focus:border-[#5951E5]"
        />
      )}
    </div>
  )

  const options: OptionItem[] = [
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
      ),
    },
    { key: 'button', label: 'Кнопка', below: <ButtonSettingsField /> },
    { key: 'avatar', label: 'Аватарка', below: greetingsEditor },
  ]

  return (
    <div className="flex flex-col gap-3">
      <OptionsChooser
        title="Вид иконки"
        options={options}
        value={iconKind}
        onChange={v => setKind(v as IconKind)}
      />

      {/* Размер иконки лаунчера */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[16px] leading-5.5 font-medium text-[#1A1A1A]">Размер иконки</span>
          <span className="text-[16px] leading-5.5 text-[#1A1A1A]">{iconSize} px</span>
        </div>
        <input
          type="range"
          min={40}
          max={96}
          value={iconSize}
          onChange={e => setIconSize(Number(e.target.value))}
          className="w-full accent-[#1A52DB] cursor-pointer"
        />
      </div>
    </div>
  )
}

export default ChatIconTypeField
