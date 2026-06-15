import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import { Input } from '@/components'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'
import * as chatModule from '@/services/chatModule'

const ACCENT = '!bg-[#5951E5]'

// Аи-агент доступен. Имя и разделы для изучения задаются здесь; включение и статистика
// остатка сообщений — в разделе «Ассистент» (см. ChatModulePage).
const AI_AGENT_COMING_SOON = false

// Технические id виджета-заглушки (превью / общий редактор без реального чата) — для них
// список страниц с сервера не запрашиваем.
const PLACEHOLDER_IDS = new Set(['chat-module-settings', 'chat-module', 'preview'])

// Путь страницы из абсолютного URL (для отображения). Для не-URL возвращаем как есть.
const pathOf = (u: string) => {
  try {
    const p = new URL(u)
    return p.pathname + p.search || '/'
  } catch {
    return u
  }
}

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
  const widgetId = useWidgetSettingsStore(s => s.settings?.id)
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const updateKnowledge = (next: string[]) => setChatPatch({ aiKnowledge: next })
  const removeItem = (url: string) => updateKnowledge(knowledge.filter(u => u !== url))
  const addItem = (url: string) => {
    if (!knowledge.includes(url)) updateKnowledge([...knowledge, url])
  }

  // Список внутренних страниц сайта (для выбора). Грузим лениво при открытии пикера.
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pages, setPages] = useState<chatModule.AiPage[] | null>(null)
  const [loadingPages, setLoadingPages] = useState(false)
  const [pagesError, setPagesError] = useState(false)

  const canLoadPages = !!widgetId && !PLACEHOLDER_IDS.has(widgetId)

  useEffect(() => {
    if (!pickerOpen || pages || loadingPages || !canLoadPages) return
    setLoadingPages(true)
    setPagesError(false)
    chatModule
      .getAiPages(widgetId as string)
      .then(setPages)
      .catch(() => setPagesError(true))
      .finally(() => setLoadingPages(false))
  }, [pickerOpen, pages, loadingPages, canLoadPages, widgetId])

  const available = (pages ?? []).filter(p => !knowledge.includes(p.url))

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
                    Страницы вашего сайта, которые агент изучит и по которым будет отвечать.
                    Если ничего не выбрано — агент изучает только главную страницу.
                  </p>

                  {/* Выбранные страницы */}
                  {knowledge.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {knowledge.map(url => (
                        <div
                          key={url}
                          className="flex items-center gap-2 rounded-[10px] border border-[#E4E4E7] px-3 h-10"
                        >
                          <span className="flex-1 truncate text-[15px] text-[#1A1A1A]" title={url}>
                            {pathOf(url)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(url)}
                            aria-label="Убрать страницу"
                            className="shrink-0 text-[#B0AEBA] hover:text-[#FF4D4D] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Кнопка-плюс + выпадающий список страниц */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(o => !o)}
                      className="text-[14px] text-[#5951E5] text-left hover:underline"
                    >
                      + добавить страницу
                    </button>

                    {pickerOpen && (
                      <div className="mt-2 rounded-[12px] border border-[#E4E4E7] bg-white shadow-sm overflow-hidden">
                        {!canLoadPages ? (
                          <p className="px-3 py-3 text-[14px] text-[#9A9A9A]">
                            Список страниц доступен в кабинете после сохранения чата.
                          </p>
                        ) : loadingPages ? (
                          <p className="px-3 py-3 text-[14px] text-[#9A9A9A]">Загрузка страниц…</p>
                        ) : pagesError ? (
                          <p className="px-3 py-3 text-[14px] text-[#FF4D4D]">
                            Не удалось загрузить страницы. Проверьте, что у проекта указан сайт.
                          </p>
                        ) : available.length === 0 ? (
                          <p className="px-3 py-3 text-[14px] text-[#9A9A9A]">
                            {pages && pages.length > 0
                              ? 'Все найденные страницы уже добавлены.'
                              : 'Внутренние страницы не найдены.'}
                          </p>
                        ) : (
                          <ul className="max-h-64 overflow-y-auto">
                            {available.map(p => (
                              <li key={p.url}>
                                <button
                                  type="button"
                                  onClick={() => addItem(p.url)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-[#F4F3FF] transition-colors flex flex-col"
                                >
                                  <span className="text-[15px] text-[#1A1A1A] truncate">{p.path}</span>
                                  <span className="text-[12px] text-[#9A9A9A] truncate">{p.url}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
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
