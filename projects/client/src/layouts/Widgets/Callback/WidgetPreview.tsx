/** Панель-превью: переключатели «Форма / Экран звонка» (норм. размер) + свёрнутый лаунчер. */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import * as Icons from '@/components/Icons'
import CallbackWidget, { type CallbackPhase } from './CallbackWidget'
import { callbackExtraDefaults, type CallbackWidgetType } from './defaults'

const PhoneIcon = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const LauncherPreview = () => {
  const l = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as CallbackWidgetType)?.callback?.launcher ?? callbackExtraDefaults.launcher)
  )
  const LibIcon = l.icon && l.icon !== 'HeartDislike' ? Icons[l.icon] : null
  const NotifIcon = l.notifIcon && l.notifIcon !== 'HeartDislike' ? Icons[l.notifIcon] : null
  // Кнопка зафиксирована по выбранному положению и НЕ двигается; уведомление — абсолютно над кнопкой.
  const btnSide = l.position === 'left'
    ? 'left-0'
    : l.position === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'right-0'
  const bubbleSide = l.position === 'left'
    ? 'left-0'
    : l.position === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'right-0'
  return (
    <div className="relative w-full" style={{ minHeight: 220 }}>
      <div className={`absolute bottom-0 ${btnSide}`} style={{ width: l.widgetSize }}>
        {l.notifEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            style={{ background: l.notifColor, color: l.notifTextColor, borderRadius: l.borderRadius, bottom: 'calc(100% + 14px)' }}
            className={`absolute ${bubbleSide} w-max max-w-[320px] px-6 py-4 flex items-center gap-3.5 shadow-[0_16px_40px_-18px_rgba(91,91,214,.6)]`}
          >
            {NotifIcon && <span className="w-7 h-7 shrink-0" style={{ color: l.notifIconColor }}><NotifIcon /></span>}
            <span className="text-[18px] font-medium leading-snug whitespace-pre-line">{l.notifText}</span>
          </motion.div>
        )}
        <div className="relative" style={{ width: l.widgetSize, height: l.widgetSize }}>
          {l.animation && (
            <>
              <span className="absolute inset-0 animate-ping" style={{ background: l.buttonColor, borderRadius: l.borderRadius, opacity: 0.35 }} />
              <span className="absolute inset-0 animate-ping" style={{ background: l.buttonColor, borderRadius: l.borderRadius, opacity: 0.25, animationDelay: '0.7s' }} />
            </>
          )}
          <div
            style={{ background: l.buttonColor, borderRadius: l.borderRadius, width: l.widgetSize, height: l.widgetSize }}
            className="relative grid place-items-center shadow-[0_14px_30px_-8px_rgba(91,91,214,.6)]"
          >
            {LibIcon ? <span className="w-7 h-7" style={{ color: l.iconColor }}><LibIcon /></span> : <PhoneIcon color={l.iconColor} />}
          </div>
        </div>
      </div>
    </div>
  )
}

const SCALE = 0.72
const TABS: { key: CallbackPhase; label: string }[] = [
  { key: 'form', label: 'Форма' },
  { key: 'calling', label: 'Экран звонка' },
]

const WidgetPreview = () => {
  const [tab, setTab] = useState<CallbackPhase>('form')
  return (
    <div className="w-full h-full flex flex-col items-center gap-6 overflow-auto select-none py-3">
      {/* Переключатели экранов */}
      <div className="flex w-full max-w-[360px] rounded-[7px] border border-[#DEE4F2] bg-gray-100 p-0.5 gap-1">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 h-10 rounded-[5px] text-[15px] font-medium transition ${tab === t.key ? 'bg-white text-gray-900 shadow' : 'text-[#5a5a5a]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Выбранный экран — уменьшенный размер */}
      <div style={{ width: 360 * SCALE, height: 700 * SCALE }} className="overflow-hidden">
        <div style={{ width: 360, transformOrigin: 'top left', transform: `scale(${SCALE})` }}>
          <CallbackWidget previewPhase={tab} />
        </div>
      </div>

      {/* Свёрнутый лаунчер */}
      <LauncherPreview />
    </div>
  )
}

export default WidgetPreview
