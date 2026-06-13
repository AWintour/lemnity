import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@heroui/theme'
import { useShallow } from 'zustand/react/shallow'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import { Input } from '@/components'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

type FeatureRowProps = {
  title: string
  description: ReactNode
  enabled: boolean
  onToggle: (next: boolean) => void
}

const FeatureRow = ({ title, description, enabled, onToggle }: FeatureRowProps) => (
  <div className="rounded-[12px] border border-[#ECECEC] p-4 flex flex-col gap-2.5">
    <div className="flex items-start justify-between gap-4">
      <span className="text-[18px] leading-5.5 font-medium text-[#1A1A1A]">{title}</span>
      <CustomSwitch
        size="sm"
        isSelected={enabled}
        onValueChange={onToggle}
        selectedColor={ACCENT}
      />
    </div>
    <p className="text-[16px] leading-5.5 text-[#9A9A9A]">{description}</p>
  </div>
)

const ChatGeneralSettings = () => {
  const {
    title,
    featuresEnabled,
    soundEnabled,
    blockAnonymousProxy,
    brandingEnabled,
    deferredLoad,
    windowFormat,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = s.settings?.widget as ChatWidgetType
      return {
        title: settings.title ?? defaults.title,
        featuresEnabled: settings.featuresEnabled ?? defaults.featuresEnabled,
        soundEnabled: settings.soundEnabled ?? defaults.soundEnabled,
        blockAnonymousProxy: settings.blockAnonymousProxy ?? defaults.blockAnonymousProxy,
        brandingEnabled: settings.brandingEnabled ?? defaults.brandingEnabled,
        deferredLoad: settings.deferredLoad ?? defaults.deferredLoad,
        windowFormat: settings.windowFormat ?? defaults.windowFormat,
      }
    })
  )

  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  // Контент «Функционала» можно свернуть при включённом режиме; при выключенном — свёрнут сразу.
  // По умолчанию блок свёрнут.
  const [expanded, setExpanded] = useState(false)
  const featuresOpen = featuresEnabled && expanded

  return (
    <div className="w-full min-w-122 flex flex-col gap-5">
      <h1 className="text-[25px] leading-7.5 font-normal text-[#060606]">Настройка чата</h1>

      {/* Блок «Название чата» */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">Название чата</span>
          <Input
            value={title}
            placeholder="Укажите заголовок"
            onValueChange={value => setChatPatch({ title: value })}
            classNames={{ inputWrapper: 'min-h-12.5' }}
          />
        </div>
      </BorderedContainer>

      {/* Блок «Функционал» */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {featuresEnabled && (
                <button
                  type="button"
                  onClick={() => setExpanded(v => !v)}
                  aria-label={expanded ? 'Свернуть' : 'Развернуть'}
                  className={cn(
                    'w-7 h-7 shrink-0 rounded-[8px] flex items-center justify-center',
                    'bg-[#EEEDFB] text-[#5951E5] hover:bg-[#E2E0F7] transition-colors',
                  )}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={cn('transition-transform', expanded ? 'rotate-0' : '-rotate-90')}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              )}
              <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Функционал</h2>
            </div>
            <div className="flex items-center gap-3">
              <CustomSwitch
                size="sm"
                isSelected={featuresEnabled}
                onValueChange={next => setChatPatch({ featuresEnabled: next })}
                selectedColor={ACCENT}
              />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {featuresOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 pt-1">
                  <p className="text-[16px] leading-5.5 text-[#9A9A9A]">
                    Эти функции доступны только в профессиональной версии. Вы можете настроить сейчас, а
                    оплатить после установки скрипта на чат.
                  </p>

                  <FeatureRow
                    title="Звук сообщений"
                    enabled={soundEnabled}
                    onToggle={next => setChatPatch({ soundEnabled: next })}
                    description="Включите настройку, чтобы при получении сообщений от оператора и активных приглашений посетителю проигрывался звук"
                  />

                  <FeatureRow
                    title="Не принимать сообщения с анонимных прокси"
                    enabled={blockAnonymousProxy}
                    onToggle={next => setChatPatch({ blockAnonymousProxy: next })}
                    description="Включите эту настройку, чтобы запретить обход блокировки по IP"
                  />

                  <FeatureRow
                    title="Сделано на Lemnity"
                    enabled={brandingEnabled}
                    onToggle={next => setChatPatch({ brandingEnabled: next })}
                    description="Вы можете отключить отображение логотипа «Сделано на Lemnity» для вашего чата."
                  />

                  <FeatureRow
                    title="Отложенная загрузка"
                    enabled={deferredLoad}
                    onToggle={next => setChatPatch({ deferredLoad: next })}
                    description="Функция позволяет загрузку виджета после полной загрузки сайта, чтобы избежать нагрузку на хостинг"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BorderedContainer>

      {/* Блок «Формат окна» */}
      <BorderedContainer>
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Формат окна</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'sidebar', label: 'Боковая панель', desc: 'Окно открывается панелью на всю высоту экрана' },
              { key: 'modal', label: 'Модальное окно', desc: 'Компактное плавающее окно в углу' },
            ] as const).map(opt => {
              const on = windowFormat === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setChatPatch({ windowFormat: opt.key })}
                  className={cn(
                    'rounded-[12px] border p-4 text-left flex items-start gap-3 transition-colors',
                    on ? 'border-[#5951E5]' : 'border-[#ECECEC] hover:border-[#D9D7E2]',
                  )}
                >
                  <span className={cn('w-5 h-5 shrink-0 mt-0.5 rounded-full border flex items-center justify-center', on ? 'border-[#5951E5]' : 'border-[#C9C7D2]')}>
                    {on && <span className="w-2.5 h-2.5 rounded-full bg-[#5951E5]" />}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className={cn('text-[18px] leading-5.5 font-medium', on ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]')}>{opt.label}</span>
                    <span className="text-[14px] leading-4.5 text-[#9A9A9A]">{opt.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </BorderedContainer>
    </div>
  )
}

export default ChatGeneralSettings
