import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@heroui/theme'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import NumberStepper from '@/components/NumberStepper'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

const CheckBox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      'w-7 h-7 shrink-0 rounded-[8px] flex items-center justify-center transition-colors',
      checked ? 'bg-[#3D3D3B]' : 'bg-white border border-[#D7D7DB]',
    )}
  >
    {checked && (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    )}
  </button>
)

const ChatAutoOpenSettings = () => {
  const {
    autoOpen,
    delay,
    afterOpenEnabled,
    scrollOpen,
    multiButton,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const w = s.settings?.widget as ChatWidgetType
      return {
        autoOpen: w.autoOpen ?? defaults.autoOpen,
        delay: w.delay ?? defaults.delay,
        afterOpenEnabled: w.afterOpenEnabled ?? defaults.afterOpenEnabled,
        scrollOpen: w.scrollOpen ?? defaults.scrollOpen,
        multiButton: w.multiButton ?? defaults.multiButton,
      }
    })
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  // «Мультикнопка» подтягивается из виджета FAB_MENU проекта: активна только если такой
  // виджет существует и включён, иначе — статус «Не активная».
  const projectId = useWidgetSettingsStore(s => s.projectId)
  const projects = useProjectsStore(s => s.projects)
  const ensureProjectsLoaded = useProjectsStore(s => s.ensureLoaded)
  useEffect(() => {
    void ensureProjectsLoaded()
  }, [ensureProjectsLoaded])
  const multiButtonAvailable = useMemo(
    () =>
      projects
        .find(p => p.id === projectId)
        ?.widgets.some(w => w.type === WidgetTypeEnum.FAB_MENU && w.enabled) ?? false,
    [projects, projectId]
  )

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-5">
        {/* Автоматически открывать чат */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">
              Автоматически открывать чат
            </span>
            <CustomSwitch
              size="sm"
              isSelected={autoOpen}
              onValueChange={v => setChatPatch({ autoOpen: v })}
              selectedColor={ACCENT}
            />
          </div>
          <p className="text-[16px] leading-5.5 text-[#9A9A9A]">
            Установите количество минут и секунд, через которые чат откроется автоматически.
          </p>

          <AnimatePresence initial={false}>
            {autoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="rounded-[14px] border border-[#ECECEC] p-5 flex flex-col gap-4">
                  <h3 className="text-[20px] leading-6 font-bold text-[#1A1A1A]">Настройки показа</h3>

                  {/* При скролле ниже N% */}
                  <div className="rounded-[12px] border border-[#ECECEC] px-4 py-3 flex items-center gap-3">
                    <CheckBox
                      checked={scrollOpen.enabled}
                      onChange={v => setChatPatch({ scrollOpen: { ...scrollOpen, enabled: v } })}
                    />
                    <span className="text-[18px] text-[#1A1A1A]">При скролле ниже</span>
                    <NumberStepper
                      value={scrollOpen.percent}
                      min={0}
                      max={100}
                      onChange={v => setChatPatch({ scrollOpen: { ...scrollOpen, percent: v } })}
                    />
                    <span className="text-[18px] text-[#9A9A9A]">% страницы сайта</span>
                  </div>

                  {/* Через N секунд после открытия страницы */}
                  <div className="rounded-[12px] border border-[#ECECEC] px-4 py-3 flex items-center gap-3">
                    <CheckBox
                      checked={afterOpenEnabled}
                      onChange={v => setChatPatch({ afterOpenEnabled: v })}
                    />
                    <span className="text-[18px] text-[#1A1A1A]">Через</span>
                    <NumberStepper
                      value={delay}
                      min={0}
                      onChange={v => setChatPatch({ delay: v })}
                    />
                    <span className="text-[18px] text-[#9A9A9A]">секунд после открытия страницы</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Мультикнопка */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Мультикнопка</span>
            <div className="flex items-center gap-3">
              {multiButton && !multiButtonAvailable && (
                <span className="text-[14px] leading-4 text-[#9A9A9A] bg-[#F1F1F4] rounded-full px-3 py-1.5">
                  Не активная
                </span>
              )}
              <CustomSwitch
                size="sm"
                isSelected={multiButton}
                onValueChange={v => setChatPatch({ multiButton: v })}
                selectedColor={ACCENT}
              />
            </div>
          </div>
          <p className="text-[16px] leading-5.5 text-[#9A9A9A]">
            {multiButton
              ? multiButtonAvailable
                ? 'Виджет «Мультикнопка» подключён — чат отображается в нём.'
                : 'Включено. Создайте виджет «Мультикнопка» — он подтянется автоматически.'
              : 'Если вы включите виджет мультикнопку'}
          </p>
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatAutoOpenSettings
