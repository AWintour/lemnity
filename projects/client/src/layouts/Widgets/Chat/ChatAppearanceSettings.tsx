import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

// Палитра системного цвета (как на макете).
const SYSTEM_PALETTE = [
  '#D9D9D9', '#6E6E6E', '#E24B2E', '#F2A33C', '#F5C84B', '#74C56E',
  '#6CD3C0', '#5BA8F5', '#7B4DE3', '#ED5BB0', '#F4B9DE',
]
// Палитра клиентского цвета.
const CLIENT_PALETTE = ['#D9D9D9', '#6E6E6E', '#E24B2E', '#5BA8F5', '#7B4DE3']
// Палитра цвета фона окна (светлые тона).
const BG_PALETTE = ['#FFFFFF', '#F7F7F9', '#F4F2FC', '#FFF5F5', '#F0F7FF', '#F2FBF4']

type ColorDotProps = {
  color: string
  selected: boolean
  onClick: () => void
}

const ColorDot = ({ color, selected, onClick }: ColorDotProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={color}
    className={cn(
      'w-11 h-11 rounded-full shrink-0 box-content border-[3px] transition-colors',
      'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]',
      selected ? 'border-[#9747FF]' : 'border-white',
    )}
    style={{ backgroundColor: color }}
  />
)

const isHex = (v: string) => /^#[0-9A-F]{6}$/i.test(v)

const ChatAppearanceSettings = () => {
  const { systemColor, clientColor, backgroundColor } = useWidgetSettingsStore(
    useShallow(s => {
      const w = s.settings?.widget as ChatWidgetType
      return {
        systemColor: w.windowAccentColor ?? defaults.windowAccentColor,
        clientColor: w.clientColor ?? defaults.clientColor,
        backgroundColor: w.windowBackgroundColor ?? defaults.windowBackgroundColor,
      }
    })
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const systemIsPreset = SYSTEM_PALETTE.some(c => c.toLowerCase() === systemColor.toLowerCase())

  return (
    <div className="w-full min-w-122 flex flex-col gap-5">
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">Оформление чата</h1>

      {/* Системный цвет */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Системный цвет</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            {SYSTEM_PALETTE.map(c => (
              <ColorDot
                key={c}
                color={c}
                selected={c.toLowerCase() === systemColor.toLowerCase()}
                onClick={() => setChatPatch({ windowAccentColor: c })}
              />
            ))}
            {/* Произвольный цвет (контур) */}
            <span
              className={cn(
                'w-11 h-11 rounded-full shrink-0 box-content border-[3px] flex items-center justify-center',
                !systemIsPreset ? 'border-[#9747FF]' : 'border-white',
              )}
            >
              <span className="w-11 h-11 rounded-full border border-[#6E4949] bg-white" />
            </span>

            <input
              value={systemColor}
              onChange={e => {
                const v = e.target.value
                if (isHex(v) || v === '' || v.startsWith('#')) setChatPatch({ windowAccentColor: v })
              }}
              className={cn(
                'ml-1 flex-1 min-w-40 h-13.5 rounded-[12px] border border-[#E4E4E7]',
                'text-center text-[18px] text-[#1A1A1A] outline-none focus:border-[#5951E5]',
              )}
            />
          </div>
        </div>
      </BorderedContainer>

      {/* Клиентский цвет */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Клиентский цвет</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            {CLIENT_PALETTE.map(c => (
              <ColorDot
                key={c}
                color={c}
                selected={c.toLowerCase() === clientColor.toLowerCase()}
                onClick={() => setChatPatch({ clientColor: c })}
              />
            ))}
          </div>
        </div>
      </BorderedContainer>

      {/* Цвет фона */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Цвет фона</span>
          <div className="flex items-center gap-2.5 flex-wrap">
            {BG_PALETTE.map(c => (
              <ColorDot
                key={c}
                color={c}
                selected={c.toLowerCase() === backgroundColor.toLowerCase()}
                onClick={() => setChatPatch({ windowBackgroundColor: c })}
              />
            ))}
          </div>
        </div>
      </BorderedContainer>
    </div>
  )
}

export default ChatAppearanceSettings
