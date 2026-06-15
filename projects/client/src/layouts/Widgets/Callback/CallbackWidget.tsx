/**
 * Рендер виджета «Обратный звонок»: форма + экран звонка (одинаковые ширина/высота).
 * Конфиг из стора. Анимация круга/полосы — плавная (requestAnimationFrame).
 */
import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'

import lemnityLogo from '@/assets/logos/lemnity.svg'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { sendCallbackRequest } from '@/common/api/publicApi'
import { callbackExtraDefaults, callbackWidgetDefaults, type CallbackWidgetType } from './defaults'
import CallbackForm, { type CallbackFormValues } from './CallbackForm'

export type CallbackPhase = 'form' | 'calling' | 'done'

const RING_COLOR = '#16A34A'
const CARD_W = 360
const CARD_H = 560

const fmtClock = (sec: number) => {
  const s = Math.max(0, Number.isFinite(sec) ? sec : 0)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

type Props = { ref?: Ref<HTMLDivElement>; previewPhase?: CallbackPhase; onClose?: () => void; sideMode?: boolean }

const CloseBtn = ({ onPress }: { onPress?: () => void }) => (
  <button
    type="button"
    onClick={onPress}
    style={{ position: 'absolute', top: 18, right: 18, width: 54, height: 42 }}
    className="rounded-[14px] border border-[#E2E0DB] bg-white flex items-center justify-center text-[#3a3a3a] z-20"
    aria-label="Закрыть"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
  </button>
)

/** Плавное кольцо отсчёта (SVG). frac: 0..1 */
const Ring = ({ frac, seconds, color }: { frac: number; seconds: number; color: string }) => {
  const R = 86
  const C = 2 * Math.PI * R
  return (
    <div className="relative my-3" style={{ width: 200, height: 200 }}>
      <svg width={200} height={200} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#ECEAE5" strokeWidth="13" />
        <circle
          cx="100" cy="100" r={R} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center text-[30px] font-bold text-[#161616] tabular-nums" style={{ lineHeight: 1, height: '1em' }}>
          <span>{fmtClock(seconds).slice(0, 6)}</span>
          <span className="relative inline-block overflow-hidden" style={{ width: '2ch', height: '1em' }}>
            <AnimatePresence initial={false}>
              <motion.span
                key={fmtClock(seconds).slice(6)}
                initial={{ y: '-110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '110%', opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {fmtClock(seconds).slice(6)}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <div className="text-[20px] text-[#161616] leading-tight mt-1">секунд</div>
      </div>
    </div>
  )
}

const CallbackWidget = ({ ref, previewPhase, onClose, sideMode }: Props) => {
  const v = useWidgetSettingsStore(
    useShallow(s => {
      const w = (s.settings?.widget as CallbackWidgetType) ?? callbackWidgetDefaults
      const a = w.appearence ?? callbackWidgetDefaults.appearence
      const i = w.infoSettings ?? callbackWidgetDefaults.infoSettings
      const c = w.callback ?? callbackExtraDefaults
      const ag = (s.settings?.fields as { agreement?: { enabled?: boolean; color?: string; policyUrl?: string } } | undefined)?.agreement
      return {
        borderRadius: a.borderRadius ?? 26,
        logoEnabled: a.companyLogoEnabled,
        logoUrl: a.companyLogoUrl,
        title: i.title,
        titleFontSize: c.titleFontSize ?? 25,
        buttonText: i.buttonText,
        buttonBg: i.buttonBackgroundColor || '#F4B400',
        buttonFont: i.buttonFontColor || '#1A1A1A',
        brandingEnabled: w.brandingEnabled ?? true,
        delaySeconds: c.delaySeconds ?? 20,
        nameEnabled: c.contacts?.name?.enabled ?? true,
        phoneRequired: c.contacts?.phone?.required ?? true,
        deferredEnabled: c.deferredCall?.enabled ?? true,
        agreementEnabled: ag?.enabled ?? true,
        agreementColor: ag?.color ?? '#797979',
        policyUrl: ag?.policyUrl ?? '',
        cancelEnabled: c.callScreen?.cancelEnabled ?? true,
        animation: c.callScreen?.animation ?? 'circle',
        animationColor: c.callScreen?.animationColor ?? '#16A34A',
        callTextScheme: c.callScreen?.textScheme ?? 'primary',
        callTextColor: c.callScreen?.textColor ?? '#161616',
        countdownFieldColor: c.form?.countdownFieldColor ?? '#EDEDED',
        countdownFontColor: c.form?.countdownFontColor ?? '#161616',
        buttonHidden: c.form?.buttonHidden ?? false,
        buttonShape: c.form?.buttonShape ?? 'rounded',
      }
    })
  )
  const widgetId = useWidgetSettingsStore(s => s.settings?.id)

  const [phase, setPhase] = useState<CallbackPhase>(previewPhase ?? 'form')
  const [phone, setPhone] = useState('')
  const [frac, setFrac] = useState(0)
  const [secLeft, setSecLeft] = useState(v.delaySeconds)
  const rafRef = useRef<number | null>(null)

  useEffect(() => { if (previewPhase) setPhase(previewPhase) }, [previewPhase])

  // Плавный отсчёт через requestAnimationFrame
  useEffect(() => {
    const active = (previewPhase ?? phase) === 'calling'
    if (!active) return
    if (previewPhase === 'calling') {
      // статичный кадр для панели-превью
      setFrac(0.4)
      setSecLeft(Math.ceil(v.delaySeconds * 0.6))
      return
    }
    const total = Math.max(1, v.delaySeconds) * 1000
    const start = performance.now()
    const loop = (now: number) => {
      const el = now - start
      const f = Math.min(1, el / total)
      setFrac(f)
      setSecLeft(Math.max(0, Math.ceil((total - el) / 1000)))
      if (f < 1) rafRef.current = requestAnimationFrame(loop)
      else setPhase('done')
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [phase, previewPhase, v.delaySeconds])

  const handleSubmit = (vals: CallbackFormValues) => {
    setPhone(vals.phone)
    if (widgetId && !previewPhase) {
      // Создаёт лид + планирует звонок через Mango (возвращает delaySeconds — UX-отсчёт уже идёт от конфига).
      void sendCallbackRequest({
        widgetId,
        fullName: vals.name,
        phone: vals.phone,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
    }
    setPhase('calling')
  }
  const cancel = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); setPhase('form') }

  const shown = previewPhase ?? phase
  const containerStyle: CSSProperties = sideMode
    ? { width: 400, maxWidth: '100vw', height: '100%', minHeight: '100vh', borderRadius: 0 }
    : { width: CARD_W, minHeight: CARD_H, borderRadius: v.borderRadius }

  return (
    <div
      ref={ref}
      data-lemnity-callback
      style={containerStyle}
      className={`relative bg-white border border-[#ECE9E3] shadow-[0_30px_80px_-40px_rgba(0,0,0,.45)] px-6 pb-6 flex flex-col select-none ${sideMode ? 'overflow-y-auto' : ''}`}
    >
      <CloseBtn onPress={onClose} />
      {v.logoEnabled && v.logoUrl
        ? <img src={v.logoUrl} alt="logo" className="h-9 mx-auto mb-6 object-contain" style={{ marginTop: 64 }} />
        : <img src={lemnityLogo} alt="Lemnity" className="h-8 mx-auto mb-6 object-contain" style={{ marginTop: 64 }} />}

      {shown === 'form' && (
        <div className={`flex flex-col flex-1 ${sideMode ? 'justify-center' : ''}`}>
          <h2 className="font-extrabold text-center text-[#161616] mb-5 px-2" style={{ fontSize: v.titleFontSize, lineHeight: 1.13 }}>{v.title}</h2>
          <div className="rounded-[14px] h-[54px] flex items-center justify-center mb-4" style={{ background: v.countdownFieldColor }}>
            <span className="text-[20px] font-medium" style={{ color: v.countdownFontColor }}>В течение&nbsp;&nbsp;{fmtClock(v.delaySeconds)} сек</span>
          </div>
          <CallbackForm
            nameEnabled={v.nameEnabled}
            phoneRequired={v.phoneRequired}
            buttonText={v.buttonText}
            buttonBg={v.buttonBg}
            buttonFont={v.buttonFont}
            buttonHidden={v.buttonHidden}
            buttonShape={v.buttonShape}
            deferredEnabled={v.deferredEnabled}
            agreementEnabled={v.agreementEnabled}
            agreementColor={v.agreementColor}
            policyUrl={v.policyUrl}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {shown === 'calling' && (
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          {v.animation === 'circle' ? (
            <Ring frac={frac} seconds={secLeft} color={v.animationColor} />
          ) : (
            <div className="w-full my-6">
              <div className="text-[30px] font-bold text-center tabular-nums mb-3">{fmtClock(secLeft)} <span className="text-[18px]">секунд</span></div>
              <div className="h-3 rounded-full bg-[#ECEAE5] overflow-hidden">
                <div style={{ width: `${frac * 100}%`, background: v.animationColor }} className="h-full rounded-full" />
              </div>
            </div>
          )}
          <p className="text-[16px] leading-[1.4] mt-2 mb-5 px-2" style={{ color: v.callTextScheme === 'custom' ? v.callTextColor : '#3a3a3a' }}>
            Идет звонок…<br />Возьмите телефон в руки, чтобы не пропустить его
          </p>
          {v.cancelEnabled && (
            <button type="button" onClick={cancel} className="text-[#E5484D] text-[17px] font-medium">Отменить</button>
          )}
        </div>
      )}

      {shown === 'done' && (
        <div className="flex flex-col flex-1 items-center justify-center text-center">
          <div className="rounded-full grid place-items-center mb-5" style={{ width: 88, height: 88, background: '#EAF7EE' }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={RING_COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </div>
          <h2 className="text-[26px] leading-[1.15] font-extrabold text-[#161616] mb-2">Заявка принята</h2>
          <p className="text-[15px] text-[#6a6a6a] leading-[1.5] mb-6 px-2">Мы уже звоним на номер <b className="text-[#161616]">{phone || '+7 999 123 45 67'}</b></p>
          {!previewPhase && (
            <button type="button" onClick={() => setPhase('form')} style={{ height: 50, background: v.buttonBg, color: v.buttonFont }} className="w-full rounded-[12px] font-bold text-[16px]">Готово</button>
          )}
        </div>
      )}

      {v.brandingEnabled && (
        <div className="text-center mt-auto pt-5">
          <a href="https://lemnity.ru" className="text-[13px] text-[#9A968F] hover:underline">Создано на Lemnity</a>
        </div>
      )}
    </div>
  )
}

export default CallbackWidget
