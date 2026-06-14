import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import ColorPicker from '@/components/ColorPicker'
import NumberStepper from '@/components/NumberStepper'
import SvgIcon from '@/components/SvgIcon'
import imageUpload from '@/assets/icons/image-upload.svg'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'
import { uploadImage, MAX_IMAGE_BYTES, IMAGE_TOO_LARGE_MESSAGE } from '@/api/upload'

const ACCENT = '!bg-[#5951E5]'

const ChatHeaderSettings = () => {
  const { companyLogo, welcomeTitle, welcomeTitleSize, welcomeTitleColor, welcomeTitleAlign } =
    useWidgetSettingsStore(
      useShallow(s => {
        const w = s.settings?.widget as ChatWidgetType
        return {
          companyLogo: w.companyLogo ?? defaults.companyLogo,
          welcomeTitle: w.welcomeTitle ?? defaults.welcomeTitle,
          welcomeTitleSize: w.welcomeTitleSize ?? defaults.welcomeTitleSize,
          welcomeTitleColor: w.welcomeTitleColor ?? defaults.welcomeTitleColor,
          welcomeTitleAlign: w.welcomeTitleAlign ?? defaults.welcomeTitleAlign,
        }
      })
    )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [logoError, setLogoError] = useState('')

  const onPickFile = (file: File | null) => {
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setLogoError(IMAGE_TOO_LARGE_MESSAGE)
      return
    }
    setLogoError('')
    // Грузим в персональное хранилище → URL (не blob/data-URL в конфиге).
    uploadImage(file)
      .then(({ url }) => setChatPatch({ companyLogo: { ...companyLogo, fileName: file.name, url } }))
      .catch(() => setLogoError('Не удалось загрузить. ' + IMAGE_TOO_LARGE_MESSAGE))
  }

  return (
    <div className="w-full min-w-122 flex flex-col gap-5">
      {/* Логотип компании */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Логотип компании</span>
            <CustomSwitch
              size="sm"
              isSelected={companyLogo.enabled}
              onValueChange={v => setChatPatch({ companyLogo: { ...companyLogo, enabled: v } })}
              selectedColor={ACCENT}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                'flex-1 min-h-15 rounded-[12px] bg-[#F4F2FC] px-4 py-3.5',
                'flex items-center gap-3 text-left hover:bg-[#ECEAF9] transition-colors',
              )}
            >
              <div className="w-7 h-7 shrink-0">
                <SvgIcon src={imageUpload} />
              </div>
              <span className="text-[18px] text-[#1A1A1A]">
                {companyLogo.fileName ?? 'Нажмите чтобы выбрать файл'}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={e => onPickFile(e.target.files?.[0] ?? null)}
            />

            <div className="flex flex-col justify-center text-[16px] leading-6 text-[#9A9A9A]">
              <span>Размер файла: до 5 МБ</span>
              <span>Рекомендуемый размер: 120x70</span>
              <span>Формат: png без фона</span>
            </div>
          </div>
          {logoError && <span className="text-[14px] text-[#E5484D]">{logoError}</span>}
        </div>
      </BorderedContainer>

      {/* Приветственный заголовок */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">
            Приветственный заголовок
          </span>

          <textarea
            value={welcomeTitle}
            onChange={e => setChatPatch({ welcomeTitle: e.target.value })}
            rows={2}
            className={cn(
              'w-full resize-none rounded-[12px] border border-[#E4E4E7] px-4 py-3',
              'text-[18px] leading-6 text-[#9A9A9A] outline-none focus:border-[#5951E5]',
            )}
          />

          <div className="flex items-center flex-wrap gap-4">
            {/* Выравнивание текста */}
            <div className="inline-flex rounded-[10px] border border-[#E4E4E7] overflow-hidden h-11">
              {(['left', 'center', 'right'] as const).map((a, i) => (
                <button
                  key={a}
                  type="button"
                  aria-label={`Выравнивание: ${a}`}
                  aria-pressed={welcomeTitleAlign === a}
                  onClick={() => setChatPatch({ welcomeTitleAlign: a })}
                  className={cn(
                    'w-11 flex items-center justify-center transition-colors',
                    i > 0 && 'border-l border-[#E4E4E7]',
                    welcomeTitleAlign === a ? 'bg-[#EEEDFB] text-[#5951E5]' : 'text-[#6E6E76] hover:bg-[#F4F4F6]',
                  )}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16" />
                    <path d={a === 'left' ? 'M4 12h10' : a === 'center' ? 'M6 12h12' : 'M10 12h10'} />
                    <path d="M4 18h16" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[18px] text-[#1A1A1A] whitespace-nowrap">Размер текста</span>
              <NumberStepper
                value={welcomeTitleSize}
                min={8}
                max={64}
                onChange={v => setChatPatch({ welcomeTitleSize: v })}
              />
            </div>

            <div className="flex items-center rounded-[12px] border border-[#E4E4E7] px-4 h-11">
              <ColorPicker
                initialColor={welcomeTitleColor}
                onColorChange={v => setChatPatch({ welcomeTitleColor: v })}
              />
            </div>
          </div>
        </div>
      </BorderedContainer>
    </div>
  )
}

export default ChatHeaderSettings
