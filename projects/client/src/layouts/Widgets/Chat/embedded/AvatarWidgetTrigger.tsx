import { useEffect, useState, type CSSProperties, type HTMLProps } from 'react'
import { motion } from 'framer-motion'

import Badge from './Badge'

// Приветствие показываем один раз за сессию (вход на сайт). В превью — не запоминаем.
const GREETING_SHOWN_KEY = 'lemnity-chat-greeting-shown'

// Пульс-анимация «биение сердца» вокруг кружка-аватара (как у обычной кнопки-лаунчера).
const RIPPLE_CSS =
  '@keyframes lemnity-ripple{0%{transform:scale(1);opacity:.5}55%{transform:scale(2.1);opacity:0}100%{transform:scale(2.1);opacity:0}}'
const ripple = (color: string, delay: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 9999,
  background: color,
  zIndex: 0,
  pointerEvents: 'none',
  animation: `lemnity-ripple 1.4s ease-out infinite ${delay}`,
})

type AvatarWidgetTriggerProps =
  Pick<HTMLProps<HTMLElement>, 'children'>
  & Pick<HTMLProps<HTMLButtonElement>, 'ref'>
  & {
      open: boolean
      toggleOpen: () => void
      greetings: string[]
      operatorName: string
      operatorAvatarUrl?: string
      unreadCount: number
      accent: string
      // Размер кружка-аватара (px) из «Размер иконки». По умолчанию 62.
      size?: number
      // Есть онлайн-оператор → зелёная точка «онлайн» (иначе бот, без точки).
      online?: boolean
      // Анимация «биение сердца» (как у обычной кнопки).
      pulse?: boolean
      // «Согласие и политика»: если задано — открытие чата требует отметить чекбокс согласия.
      agreement?: { color: string; agreementUrl: string; policyUrl: string }
      // В превью настроек не запоминаем «показано» — чтобы приветствие было видно при каждой перезагрузке.
      preview?: boolean
    }

// Лаунчер «Аватарка» (стиль Crisp): кружок-аватар оператора + всплывающие пузыри-приветствия
// (с анимацией появления) и кнопка «Написать ответ». В открытом состоянии — окно чата (children).
const AvatarWidgetTrigger = ({ ref, ...props }: AvatarWidgetTriggerProps) => {
  // Уже показывали приветствие в этой сессии? (в превью — всегда показываем заново)
  const [dismissed, setDismissed] = useState(() => {
    if (props.preview) return false
    try {
      return sessionStorage.getItem(GREETING_SHOWN_KEY) === '1'
    } catch {
      return false
    }
  })

  const markShown = () => {
    if (props.preview) return
    try {
      sessionStorage.setItem(GREETING_SHOWN_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  // Чат открыли → приветствие больше не показываем (и при сворачивании оно не вернётся).
  useEffect(() => {
    if (props.open) {
      setDismissed(true)
      markShown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  // Подстановка реального имени оператора вместо плейсхолдера «(имя оператора)».
  const subst = (g: string) => g.replace(/\(имя оператора\)/gi, props.operatorName)
  const greetings = props.greetings.map(subst).filter(g => g.trim().length > 0)
  const showTeaser = !props.open && !dismissed && greetings.length > 0
  const badge = props.unreadCount > 0 ? props.unreadCount : dismissed ? greetings.length : 0

  // Первый показ приветствия в сессии — запоминаем, чтобы при перезагрузке оно не повторялось.
  useEffect(() => {
    if (showTeaser) markShown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTeaser])
  const size = props.size ?? 62
  const doPulse = props.pulse && !props.open

  // Согласие гейтит открытие: по клику на CTA показываем чекбокс; после отметки появляется
  // кнопка «Продолжить», которая открывает чат. Без галочки чат не открывается.
  const [consentRevealed, setConsentRevealed] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const href = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)
  const onCta = () => {
    if (props.agreement) setConsentRevealed(true)
    else props.toggleOpen()
  }
  const agreeAndOpen = () => {
    setConsentRevealed(false)
    props.toggleOpen()
  }

  const Avatar = ({ size: s }: { size: number }) =>
    props.operatorAvatarUrl ? (
      <img
        src={props.operatorAvatarUrl}
        alt={props.operatorName}
        className="rounded-full object-cover"
        style={{ width: s, height: s }}
      />
    ) : (
      <div
        className="rounded-full bg-[#EDEDED] text-[#6E6E76] flex items-center justify-center font-medium"
        style={{ width: s, height: s, fontSize: s * 0.42 }}
      >
        {(props.operatorName || 'О').trim().charAt(0).toUpperCase()}
      </div>
    )

  return (
    <>
      {props.children}

      <div className="relative w-fit self-end flex flex-col items-end gap-3">
        {showTeaser && (
          <div className="relative w-[340px] max-w-[85vw] flex flex-col items-end gap-2.5">
            {/* Крестик справа */}
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                aria-label="Скрыть"
                onClick={() => setDismissed(true)}
                className="w-7 h-7 flex items-center justify-center text-[#9A9A9A] hover:text-[#6E6E76]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Пузыри-приветствия (справа, лавандовые), с анимацией появления */}
            {greetings.map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: 'easeOut', delay: i * 0.18 }}
                className="max-w-[88%] self-end rounded-3xl rounded-br-lg bg-[#F1F0F8] px-5 py-3.5 shadow-sm"
              >
                <span className="text-[18px] leading-6 text-[#1A1A1A]">{g}</span>
              </motion.div>
            ))}

            {/* Согласие гейтит открытие: чекбокс появляется по клику на CTA, до отметки чат не открывается */}
            {consentRevealed && props.agreement ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="w-full rounded-2xl bg-[#F1F0F8] px-4 py-3 flex items-start gap-2.5"
                >
                  <button
                    type="button"
                    aria-label="Согласие на обработку данных"
                    aria-pressed={consentChecked}
                    onClick={() => setConsentChecked(c => !c)}
                    style={{
                      background: consentChecked ? '#1A1A1A' : '#fff',
                      borderColor: consentChecked ? '#1A1A1A' : '#C9C9CE',
                    }}
                    className="mt-0.5 w-5 h-5 rounded-[5px] border flex items-center justify-center flex-none"
                  >
                    {consentChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    )}
                  </button>
                  <span className="text-[14px] leading-[1.45]" style={{ color: props.agreement.color }}>
                    Я даю{' '}
                    <a href={href(props.agreement.agreementUrl)} target="_blank" rel="noreferrer" className="underline">согласие</a>
                    {' '}на{' '}
                    <a href={href(props.agreement.policyUrl)} target="_blank" rel="noreferrer" className="underline">обработку персональных данных</a>
                  </span>
                </motion.div>

                {/* Кнопка «Продолжить» появляется только после отметки чекбокса */}
                {consentChecked && (
                  <motion.button
                    type="button"
                    onClick={agreeAndOpen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="self-end rounded-full px-5 py-2.5 flex items-center gap-2 text-[15px] text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: props.accent }}
                  >
                    <span>Продолжить</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M10 8l4 4-4 4" />
                    </svg>
                  </motion.button>
                )}
              </>
            ) : (
              <motion.button
                type="button"
                onClick={onCta}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut', delay: greetings.length * 0.18 }}
                className="self-end rounded-full px-4 py-2.5 flex items-center gap-2 text-[15px] text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: props.accent }}
              >
                <span>Да, у меня есть вопрос</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M10 8l4 4-4 4" />
                </svg>
              </motion.button>
            )}
          </div>
        )}

        {/* Кружок-аватар (launcher); при открытом чате — крестик закрытия (как в обычном режиме). */}
        {doPulse && <style>{RIPPLE_CSS}</style>}
        <div className="relative" style={{ width: size, height: size }}>
        {doPulse && (
          <>
            <span aria-hidden style={ripple(props.accent, '0s')} />
            <span aria-hidden style={ripple(props.accent, '0.18s')} />
          </>
        )}
        <button
          ref={ref}
          type="button"
          onClick={props.toggleOpen}
          aria-label={props.open ? 'Скрыть чат' : 'Открыть чат'}
          className="relative z-10 rounded-full overflow-visible"
          style={{
            width: size,
            height: size,
            boxShadow: props.open
              ? `0 0 0 3px ${props.accent}`
              : '0 0 0 4px #FFFFFF, 0 6px 18px rgba(0,0,0,0.14)',
          }}
        >
          {props.open ? (
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ backgroundColor: props.accent }}
            >
              <svg
                width={Math.round(size * 0.42)}
                height={Math.round(size * 0.42)}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden">
              <Avatar size={size} />
            </div>
          )}
          {/* Зелёная точка «онлайн» — только если есть живой оператор онлайн */}
          {!props.open && props.online && (
            <span
              className="absolute rounded-full bg-[#2DBE6A] border-2 border-white"
              style={{ width: Math.round(size * 0.26), height: Math.round(size * 0.26), right: 0, bottom: 0 }}
            />
          )}
          {!props.open && badge > 0 && <Badge badgeContent={badge} />}
        </button>
        </div>
      </div>
    </>
  )
}

export default AvatarWidgetTrigger
