import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import { Input } from '@/components'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

// Аи-агент временно отключён (скоро). Тумблер недоступен, настройки скрыты.
const AI_AGENT_COMING_SOON = true

const ChatAiAgentSettings = () => {
  const { enabled, name, knowledge } = useWidgetSettingsStore(
    useShallow(s => {
      const w = s.settings?.widget as ChatWidgetType
      return {
        enabled: w.aiAgentEnabled ?? defaults.aiAgentEnabled,
        name: w.aiAgentName ?? defaults.aiAgentName,
        knowledge: w.aiKnowledge ?? defaults.aiKnowledge,
      }
    })
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const updateKnowledge = (next: string[]) => setChatPatch({ aiKnowledge: next })
  const setItem = (i: number, v: string) =>
    updateKnowledge(knowledge.map((k, idx) => (idx === i ? v : k)))
  const addItem = () => updateKnowledge([...knowledge, ''])
  const removeItem = (i: number) => updateKnowledge(knowledge.filter((_, idx) => idx !== i))

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Аи агент</h2>
          <div className="flex items-center gap-3">
            <span className="text-[14px] leading-4 text-white bg-[#9A96A2] rounded-full px-3 py-1.5">
              {AI_AGENT_COMING_SOON ? 'Скоро' : 'Платно'}
            </span>
            <CustomSwitch
              size="sm"
              isSelected={AI_AGENT_COMING_SOON ? false : enabled}
              isDisabled={AI_AGENT_COMING_SOON}
              onValueChange={v => {
                if (AI_AGENT_COMING_SOON) return
                setChatPatch({ aiAgentEnabled: v })
              }}
              selectedColor={ACCENT}
            />
          </div>
        </div>

        {AI_AGENT_COMING_SOON && (
          <p className="text-[16px] leading-5.5 text-[#9A9A9A]">
            Аи-агент скоро будет доступен — мы готовим эту возможность.
          </p>
        )}

        <AnimatePresence initial={false}>
          {!AI_AGENT_COMING_SOON && enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-1">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
                    Имя вашего аи агента
                  </span>
                  <Input
                    value={name}
                    placeholder="Например, Лемми"
                    onValueChange={v => setChatPatch({ aiAgentName: v })}
                  />
                  <span className="text-[14px] text-[#9A9A9A]">
                    Приветствие: «Здравствуйте! Я {name || '(имя)'}. Чем могу помочь?»
                  </span>
                </label>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
                    Разделы для изучения
                  </span>
                  <p className="text-[14px] text-[#9A9A9A]">
                    О чём агент должен знать и информировать клиента.
                  </p>
                  {knowledge.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={item}
                        placeholder="Раздел"
                        onValueChange={v => setItem(i, v)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        aria-label="Удалить раздел"
                        className={cn(
                          'shrink-0 w-10 h-10 rounded-[10px] border border-[#E4E4E7]',
                          'text-[#B0AEBA] hover:text-[#FF4D4D] hover:border-[#FF4D4D] transition-colors',
                        )}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[14px] text-[#5951E5] text-left hover:underline"
                  >
                    + добавить раздел
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BorderedContainer>
  )
}

export default ChatAiAgentSettings
