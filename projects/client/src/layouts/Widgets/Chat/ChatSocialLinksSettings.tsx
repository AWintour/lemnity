import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { Input } from '@/components'
import ColorPicker from '@/components/ColorPicker'
import NumberStepper from '@/components/NumberStepper'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'
import { uuidv4 } from '@/common/utils/uuidv4'
import {
  FAB_MENU_BUTTON_PRESETS,
  FAB_MENU_ICON_OPTIONS,
} from '@/layouts/Widgets/FABMenu/buttonLibrary'
import type { FABMenuIconKey } from '@/layouts/Widgets/FABMenu/types'

type Social = { id: string; icon: string; url: string }
type Align = 'left' | 'center' | 'right'

// Стабильная пустая ссылка: у старых конфигов companySocials отсутствует, и `?? []`
// отдавал бы НОВЫЙ массив каждый рендер внутри useShallow → useSyncExternalStore не может
// закешировать снапшот → бесконечный цикл (React #185). Один общий [] решает это.
const EMPTY_SOCIALS: Social[] = []

// Переиспользуем пресеты иконок из «Мультикнопки» — только мессенджеры и соцсети.
const SOCIAL_PRESETS = FAB_MENU_BUTTON_PRESETS.filter(
  p => p.group === 'social' || p.group === 'messenger',
)
const iconSrc = (icon: string): string | undefined =>
  FAB_MENU_ICON_OPTIONS[icon as FABMenuIconKey]?.icon
// Бренд-подложка для белого логотипа (как в «Мультикнопке»): сплошной цвет или градиент.
const iconBg = (icon: string): string => {
  const p = SOCIAL_PRESETS.find(pr => pr.icon === icon)
  if (!p) return '#5951E5'
  return p.gradientColors?.length
    ? `linear-gradient(135deg, ${p.gradientColors.join(', ')})`
    : p.color
}

const WEIGHTS: { value: number; label: string }[] = [
  { value: 400, label: 'Обычный' },
  { value: 600, label: 'Полужирный' },
  { value: 700, label: 'Жирный' },
]

const ChatSocialLinksSettings = () => {
  const { socials, title, size, weight, color, align } = useWidgetSettingsStore(
    useShallow(s => {
      const cfg = s.settings?.widget as ChatWidgetType
      return {
        socials: (cfg?.companySocials ?? EMPTY_SOCIALS) as Social[],
        title: cfg?.socialsTitle ?? defaults.socialsTitle ?? '',
        size: cfg?.socialsTitleSize ?? defaults.socialsTitleSize ?? 20,
        weight: cfg?.socialsTitleWeight ?? defaults.socialsTitleWeight ?? 600,
        color: cfg?.socialsTitleColor ?? defaults.socialsTitleColor ?? '#1A1A1A',
        align: (cfg?.socialsTitleAlign ?? defaults.socialsTitleAlign ?? 'left') as Align,
      }
    }),
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)
  const update = (next: Social[]) => setChatPatch({ companySocials: next })

  const add = () =>
    update([...socials, { id: uuidv4(), icon: SOCIAL_PRESETS[0]?.icon ?? 'vk', url: '' }])
  const patch = (i: number, p: Partial<Social>) =>
    update(socials.map((s, idx) => (idx === i ? { ...s, ...p } : s)))
  const remove = (i: number) => update(socials.filter((_, idx) => idx !== i))

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">
          Социальные сети компании
        </h2>
        <p className="text-[14px] text-[#9A9A9A]">
          Показываются в третьей вкладке окна чата. Выберите сеть и вставьте ссылку.
        </p>

        {/* Заголовок вкладки (как «Приветственный заголовок») */}
        <div className="flex flex-col gap-3">
          <span className="text-[16px] text-[#1A1A1A]">Заголовок</span>
          <textarea
            value={title}
            onChange={e => setChatPatch({ socialsTitle: e.target.value })}
            rows={2}
            placeholder="Например: Мы в социальных сетях"
            className={cn(
              'w-full resize-none rounded-[12px] border border-[#E4E4E7] px-4 py-3',
              'text-[18px] leading-6 text-[#1A1A1A] outline-none focus:border-[#5951E5]',
            )}
          />

          <div className="flex items-center flex-wrap gap-4">
            {/* Выравнивание */}
            <div className="inline-flex rounded-[10px] border border-[#E4E4E7] overflow-hidden h-11">
              {(['left', 'center', 'right'] as const).map((a, i) => (
                <button
                  key={a}
                  type="button"
                  aria-label={`Выравнивание: ${a}`}
                  aria-pressed={align === a}
                  onClick={() => setChatPatch({ socialsTitleAlign: a })}
                  className={cn(
                    'w-11 flex items-center justify-center transition-colors',
                    i > 0 && 'border-l border-[#E4E4E7]',
                    align === a ? 'bg-[#EEEDFB] text-[#5951E5]' : 'text-[#6E6E76] hover:bg-[#F4F4F6]',
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
              <NumberStepper value={size} min={8} max={64} onChange={v => setChatPatch({ socialsTitleSize: v })} />
            </div>

            <div className="flex items-center rounded-[12px] border border-[#E4E4E7] px-4 h-11">
              <ColorPicker initialColor={color} onColorChange={v => setChatPatch({ socialsTitleColor: v })} />
            </div>

            {/* Толщина */}
            <div className="flex items-center gap-2.5">
              <span className="text-[18px] text-[#1A1A1A] whitespace-nowrap">Толщина</span>
              <div className="inline-flex rounded-[10px] border border-[#E4E4E7] overflow-hidden h-11">
                {WEIGHTS.map((wt, i) => (
                  <button
                    key={wt.value}
                    type="button"
                    aria-pressed={weight === wt.value}
                    onClick={() => setChatPatch({ socialsTitleWeight: wt.value })}
                    style={{ fontWeight: wt.value }}
                    className={cn(
                      'px-3.5 flex items-center justify-center text-[15px] transition-colors',
                      i > 0 && 'border-l border-[#E4E4E7]',
                      weight === wt.value ? 'bg-[#EEEDFB] text-[#5951E5]' : 'text-[#6E6E76] hover:bg-[#F4F4F6]',
                    )}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {socials.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {socials.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center"
                  style={{ background: iconBg(s.icon) }}
                >
                  {iconSrc(s.icon) && (
                    <img src={iconSrc(s.icon)} alt="" className="w-5 h-5 object-contain" />
                  )}
                </span>
                <select
                  value={s.icon}
                  onChange={e => patch(i, { icon: e.target.value })}
                  className="h-10 shrink-0 rounded-[10px] border border-[#E4E4E7] px-2 text-[14px] bg-white outline-none"
                >
                  {SOCIAL_PRESETS.map(p => (
                    <option key={p.icon} value={p.icon}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Input value={s.url} placeholder="https://…" onValueChange={v => patch(i, { url: v })} />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Удалить"
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-[10px] border border-[#E4E4E7]',
                    'text-[#B0AEBA] hover:text-[#FF4D4D] hover:border-[#FF4D4D] transition-colors',
                  )}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={add}
          className="text-[14px] text-[#5951E5] text-left hover:underline self-start"
        >
          + добавить соцсеть
        </button>
      </div>
    </BorderedContainer>
  )
}

export default ChatSocialLinksSettings
