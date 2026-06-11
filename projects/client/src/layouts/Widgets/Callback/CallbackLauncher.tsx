/**
 * Свёрнутый виджет: окно (уведомление/форма) всплывает НАД кнопкой.
 * Кнопка всегда снизу: закрыто — иконка телефона, открыто — крестик (закрыть). Сценарий по макету.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import * as Icons from '@/components/Icons'
import szvukUrl from '@/assets/szvuk.mp3'
import { callbackExtraDefaults, type CallbackWidgetType } from './defaults'
import CallbackWidget from './CallbackWidget'

const PhoneIcon = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const CrossIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const CallbackLauncher = () => {
  const l = useWidgetSettingsStore(
    useShallow(
      s => (s.settings?.widget as CallbackWidgetType)?.callback?.launcher ?? callbackExtraDefaults.launcher
    )
  )
  const windowFormat = useWidgetSettingsStore(
    s => (s.settings?.widget as CallbackWidgetType)?.callback?.form?.windowFormat ?? 'modal'
  )
  const [open, setOpen] = useState(false)
  const [bubble, setBubble] = useState(false)
  // Бабл-уведомление показываем один раз; после того как посетитель его закрыл или сам открыл
  // виджет — больше автоматически не всплываем (иначе «через время снова запускается»).
  const [dismissed, setDismissed] = useState(false)
  const LibIcon = l.icon && l.icon !== 'HeartDislike' ? Icons[l.icon] : null
  const NotifIcon = l.notifIcon && l.notifIcon !== 'HeartDislike' ? Icons[l.notifIcon] : null

  // Уведомление всплывает через notifDelaySec секунд (пока закрыто)
  useEffect(() => {
    setBubble(false)
    if (!l.notifEnabled || open || dismissed) return
    const t = setTimeout(() => {
      setBubble(true)
      if (l.notifSound) {
        try {
          const audio = new Audio(szvukUrl)
          audio.volume = 0.6
          void audio.play().catch(() => {})
        } catch {
          /* автозапуск звука может быть заблокирован браузером */
        }
      }
    }, Math.max(0, l.notifDelaySec) * 1000)
    return () => clearTimeout(t)
  }, [l.notifEnabled, l.notifDelaySec, l.notifSound, open, dismissed])

  const alignClass = l.position === 'left' ? 'items-start' : l.position === 'center' ? 'items-center' : 'items-end'

  return (
    <div data-lemnity-callback-root className={`flex flex-col gap-3 ${alignClass}`}>
      {/* Окно НАД кнопкой: форма (если открыто) или уведомление-приветствие */}
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          windowFormat === 'side' ? (
            <motion.div
              key="side"
              initial={{ x: l.position === 'left' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: l.position === 'left' ? '-100%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className={`fixed inset-y-0 ${l.position === 'left' ? 'left-0' : 'right-0'} z-[1300]`}
            >
              <CallbackWidget sideMode onClose={() => setOpen(false)} />
            </motion.div>
          ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            style={{ transformOrigin: 'bottom right' }}
          >
            <CallbackWidget onClose={() => setOpen(false)} />
          </motion.div>
          )
        ) : (
          l.notifEnabled && bubble ? (
            <motion.div
              key="bubble"
              onClick={() => { setDismissed(true); setOpen(true) }}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              style={{ background: l.notifColor, color: l.notifTextColor, borderRadius: l.borderRadius, transformOrigin: 'bottom right' }}
              className="relative max-w-[320px] px-6 py-4 flex items-center gap-3.5 cursor-pointer shadow-[0_16px_40px_-18px_rgba(91,91,214,.6)]"
            >
              {/* Крестик: закрыть уведомление и больше не показывать автоматически */}
              <button
                type="button"
                aria-label="Закрыть уведомление"
                onClick={e => { e.stopPropagation(); setBubble(false); setDismissed(true) }}
                className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-white text-gray-600 shadow-[0_4px_12px_-4px_rgba(0,0,0,.45)] transition hover:scale-110"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              {NotifIcon && <span className="w-7 h-7 shrink-0" style={{ color: l.notifIconColor }}><NotifIcon /></span>}
              <span className="text-[19px] font-medium leading-snug whitespace-pre-line">{l.notifText}</span>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Кнопка: всегда снизу. Открыто → крестик (закрыть), закрыто → иконка из библиотеки/телефон.
          При включённой анимации (и закрытом виджете) от кнопки идут пульсирующие волны. */}
      {(!l.hidden || open) && (
      <div className="relative" style={{ width: l.widgetSize, height: l.widgetSize }}>
        {l.animation && !open && (
          <>
            <span className="absolute inset-0 animate-ping pointer-events-none" style={{ background: l.buttonColor, borderRadius: l.borderRadius, opacity: 0.35 }} />
            <span className="absolute inset-0 animate-ping pointer-events-none" style={{ background: l.buttonColor, borderRadius: l.borderRadius, opacity: 0.25, animationDelay: '0.7s' }} />
          </>
        )}
        <button
          type="button"
          onClick={() => { setDismissed(true); setOpen(o => !o) }}
          aria-label={open ? 'Закрыть' : (l.text || 'Обратный звонок')}
          title={l.text || undefined}
          style={{ background: l.buttonColor, borderRadius: l.borderRadius, width: l.widgetSize, height: l.widgetSize }}
          className="relative grid place-items-center shadow-[0_14px_30px_-8px_rgba(91,91,214,.6)] transition-transform active:scale-95 hover:scale-105"
        >
          {open ? (
            <CrossIcon color={l.iconColor} />
          ) : LibIcon ? (
            <span className="w-7 h-7" style={{ color: l.iconColor }}><LibIcon /></span>
          ) : (
            <PhoneIcon color={l.iconColor} />
          )}
        </button>
      </div>
      )}
    </div>
  )
}

export default CallbackLauncher
