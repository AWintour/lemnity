import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { cn } from '@heroui/theme'

import EmojiPicker from '@/components/EmojiPicker'
import type { ChatUiMessage } from './types'

type ContactFieldCfg = { enabled: boolean; required: boolean }
export type ContactsCfg = {
  name: ContactFieldCfg
  phone: ContactFieldCfg
  email: ContactFieldCfg
  when: 'inDialog' | 'beforeDialog' | 'never'
}

export type ContactFormValues = { name?: string; phone?: string; email?: string; comment?: string }

export type QuickReply = {
  id: string
  emoji?: string
  label: string
  isHandoff?: boolean
}

type WidgetProps = {
  mobile?: boolean
  open: boolean
  operatorName: string
  operatorAvatarUrl?: string
  operatorOnline: boolean
  onlineMessage: string
  offlineMessage: string
  placeholder: string
  windowFormat: 'sidebar' | 'modal'
  windowRadius: number
  windowBackgroundColor: string
  windowAccentColor: string
  clientColor: string
  companyLogoUrl?: string
  welcomeTitle: string
  welcomeTitleSize: number
  welcomeTitleColor: string
  welcomeTitleAlign: 'left' | 'center' | 'right'
  messages: ChatUiMessage[]
  quickReplies: QuickReply[]
  brandingEnabled: boolean
  view: 'home' | 'chat' | 'form' | 'contacts' | 'callback'
  contacts: ContactsCfg
  contactsTab: ContactsTabData
  formHeader: string
  disabled?: boolean
  preview?: boolean
  // Идёт живой чат с оператором — кнопки сценария неактивны, показан ввод сообщения.
  chatActive: boolean
  // Офлайн-сообщение отправлено — показать подтверждение вместо поля.
  offlineSent: boolean
  onSend: (body: string) => void
  onEnterChat: () => void
  onOfflineSend: (text: string) => void
  onQuickReply: (buttonId: string) => void
  onSubmitForm: (values: ContactFormValues) => void
  onBack: () => void
  onTabChat: () => void
  onTabContacts: () => void
  onTabAi: () => void
  onLeaveMessage: () => void
  onCall: () => void
  onSubmitCallback: (phone: string, when: string) => void
  onClose: () => void
}

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime()) || d.getTime() === 0) return ''
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/* ----------------------------- inline icons ----------------------------- */

const IconChat = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C6.477 3 2 6.79 2 11.5c0 2.32 1.09 4.41 2.86 5.94L4 21l4.07-1.78c1.2.37 2.5.58 3.93.58 5.523 0 10-3.79 10-8.5S17.523 3 12 3Z" />
  </svg>
)

const IconDoc = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v4h4" />
    <path d="M9.5 12h5M9.5 15.5h5" />
  </svg>
)

const IconPin = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21c4-4.5 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 3 6.5 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const IconSparkles = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5l1.7 4.6 4.6 1.7-4.6 1.7L12 15.1l-1.7-4.6L5.7 8.8l4.6-1.7L12 2.5Z" />
    <path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" />
  </svg>
)

const IconSend = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4 3 11l6 2.5L21 4Z" />
    <path d="M21 4 11 21l-2-7.5L21 4Z" />
  </svg>
)

const IconPlus = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6v12M6 12h12" />
  </svg>
)

const IconMic = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0M12 17v3" />
  </svg>
)

const IconClip = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.3-7.3" />
  </svg>
)

const IconEmoji = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    <path d="M9 9.5h.01M15 9.5h.01" />
  </svg>
)

const IconBot = ({ color }: { color: string }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="7" width="16" height="11" rx="3" />
    <path d="M12 7V4M9 12h.01M15 12h.01M9.5 15.5h5" />
  </svg>
)

const IconArrowCircle = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M10 8l4 4-4 4" />
  </svg>
)

/* ------------------------------ subviews -------------------------------- */

const StatusDot = ({ online }: { online: boolean }) => (
  <span
    className={cn(
      'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
      online ? 'bg-[#3BD16F]' : 'bg-[#FF4D4D]',
    )}
  />
)

const OperatorAvatars = ({
  primaryAvatarUrl,
  online,
}: {
  primaryAvatarUrl?: string
  online: boolean
}) => (
  <div className="flex items-center justify-center -space-x-2.5">
    {/* Главный оператор (бот) */}
    <div className="relative w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-white flex items-center justify-center">
      {primaryAvatarUrl
        ? <img src={primaryAvatarUrl} alt="" className="w-full h-full object-cover" />
        : <span className="text-[16px]">🤖</span>}
      <StatusDot online={online} />
    </div>
    {/* Доп. операторы из макета */}
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="relative w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-[#E9E4DC] flex items-center justify-center"
      >
        <span className="text-[16px]">🧑‍🚀</span>
        <StatusDot online={false} />
      </div>
    ))}
  </div>
)

const IconPhone = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4h3l1.5 4.5L7.5 10a12 12 0 0 0 6 6l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
)

const IconMail = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5 12 13l8.5-6.5" />
  </svg>
)

type TabKey = 'chat' | 'contacts'

const TabBar = ({
  accent,
  active,
  onChat,
  onContacts,
  onAi,
}: {
  accent: string
  active: TabKey
  onChat: () => void
  onContacts: () => void
  onAi: () => void
}) => (
  <div className="shrink-0 flex items-center justify-around px-6 py-3 border-b border-[#EFEFF2]">
    <button type="button" className="p-1" aria-label="Чат" onClick={onChat}>
      <IconChat color={active === 'chat' ? accent : '#1A1A1A'} />
    </button>
    <button type="button" className="p-1" aria-label="Контакты" onClick={onContacts}>
      <IconDoc color={active === 'contacts' ? accent : '#1A1A1A'} />
    </button>
    <button type="button" className="p-1" aria-label="Карта"><IconPin color="#1A1A1A" /></button>
    <button type="button" className="p-1" aria-label="ИИ-агент" onClick={onAi}>
      <IconSparkles color={accent} />
    </button>
  </div>
)

const MessageBubble = ({ message, clientColor }: { message: ChatUiMessage; clientColor: string }) => {
  const isVisitor = message.sender === 'visitor'
  const isSystem = message.sender === 'system'
  const time = formatTime(message.createdAt)

  if (isSystem) {
    return (
      <div className="w-full flex justify-center my-1">
        <span className="text-xs text-[#979797] text-center px-4">{message.body}</span>
      </div>
    )
  }

  return (
    <div className={cn('w-full flex flex-col', isVisitor ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 text-[16px] leading-[1.35]',
          isVisitor
            ? 'text-white rounded-[16px] rounded-br-[6px]'
            : 'bg-[#F4F2FC] text-[#1A1A1A] rounded-[16px] rounded-bl-[6px]',
          message.pending && 'opacity-60',
        )}
        style={isVisitor ? { backgroundColor: clientColor } : undefined}
      >
        {message.image && (
          <img
            src={message.image}
            alt=""
            className={cn('w-full max-h-[220px] object-cover rounded-[12px]', message.body && 'mb-2')}
          />
        )}
        {message.body}
        {time && (
          <div
            className={cn(
              'text-[12px] mt-1.5',
              isVisitor ? 'text-white/70' : 'text-[#A6A2B0]',
            )}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  )
}

const IconBackCircle = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M14 8l-4 4 4 4" />
  </svg>
)

const FORM_GREEN = '#56B65C'

const ContactForm = ({
  contacts,
  disabled,
  onBack,
  onSubmit,
}: {
  contacts: ContactsCfg
  disabled?: boolean
  onBack: () => void
  onSubmit: (values: ContactFormValues) => void
}) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')

  const req = (f: keyof Pick<ContactsCfg, 'name' | 'phone' | 'email'>) =>
    contacts[f].enabled && contacts[f].required
  const valid =
    (!req('name') || name.trim()) &&
    (!req('phone') || phone.trim()) &&
    (!req('email') || email.trim())

  const inputCx = cn(
    'w-full h-13 px-4 rounded-[12px] border border-[#E4E4E7] bg-white',
    'text-[16px] text-[#1A1A1A] placeholder:text-[#B6B3BE] outline-none focus:border-[#5951E5]',
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid || disabled) return
    onSubmit({
      name: contacts.name.enabled ? name.trim() || undefined : undefined,
      phone: contacts.phone.enabled ? phone.trim() || undefined : undefined,
      email: contacts.email.enabled ? email.trim() || undefined : undefined,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto p-3 gap-3">
      <button
        type="button"
        onClick={onBack}
        className="shrink-0 flex items-center gap-2.5 rounded-[12px] bg-[#F1F1F4] px-3 py-2.5 text-left"
      >
        <IconBackCircle color="#6E6E76" />
        <span className="text-[16px] text-[#6E6E76]">Назад</span>
      </button>

      <form onSubmit={submit} className="rounded-[16px] border border-[#E3E3E8] p-4 flex flex-col gap-3">
        <div className="text-[24px] leading-7 font-bold text-[#1A1A1A]">Оставить сообщение</div>
        <p className="text-[16px] leading-5.5 text-[#1A1A1A]">
          Заполните форму и мы обязательно свяжемся с вами
        </p>

        {contacts.name.enabled && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ФИО" className={inputCx} />
        )}
        {contacts.phone.enabled && (
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 ___ ___ __ __" className={inputCx} />
        )}
        {contacts.email.enabled && (
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCx} />
        )}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Вопрос или комментарий"
          rows={2}
          className={cn(inputCx, 'h-auto py-3 resize-none')}
        />

        <button
          type="submit"
          disabled={!valid || disabled}
          className="h-13 rounded-[12px] flex items-center justify-center gap-2 text-white text-[17px] disabled:opacity-50"
          style={{ backgroundColor: FORM_GREEN }}
        >
          Отправить сообщение
          <IconArrowCircle color="#FFFFFF" />
        </button>
      </form>
    </div>
  )
}

export type ContactsTabData = { address: string; phone: string; email: string }

const ContactsTab = ({
  data,
  onLeaveMessage,
  onCall,
}: {
  data: ContactsTabData
  onLeaveMessage: () => void
  onCall: () => void
}) => {
  const row = (icon: React.ReactNode, text: string) =>
    text ? (
      <div className="flex items-center gap-3">
        <span className="shrink-0">{icon}</span>
        <span className="text-[18px] text-[#1A1A1A]">{text}</span>
      </div>
    ) : null

  const actionBtn = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-4 flex items-center justify-between gap-3 rounded-[14px] border border-[#E3E3E8] text-[16px] text-[#6E6E76] hover:bg-[#FAFAFB] transition-colors"
    >
      <span>{label}</span>
      <span className="shrink-0 text-[#1A1A1A]"><IconArrowCircle color="currentColor" /></span>
    </button>
  )

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <h2 className="text-[24px] leading-7 font-medium text-[#1A1A1A]">Контакты</h2>
      <hr className="border-[#EDEDF0]" />
      <div className="flex flex-col gap-4">
        {row(<IconPin color="#1A1A1A" />, data.address)}
        {row(<IconPhone color="#1A1A1A" />, data.phone)}
        {row(<IconMail color="#1A1A1A" />, data.email)}
      </div>
      <hr className="border-[#EDEDF0]" />
      <div className="flex flex-col gap-3">
        {actionBtn('Отправить сообщение', onLeaveMessage)}
        {actionBtn('Позвонить', onCall)}
      </div>
    </div>
  )
}

const IconRocket = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" />
    <path d="M9 11a8 8 0 0 1 9-7 8 8 0 0 1-7 9l-3 3-2-2 3-3Z" />
    <circle cx="14.5" cy="9.5" r="1.3" />
  </svg>
)

const CallbackView = ({
  accent,
  preview,
  onBack,
  onSubmit,
}: {
  accent: string
  preview?: boolean
  onBack: () => void
  onSubmit: (phone: string, when: string) => void
}) => {
  const [phone, setPhone] = useState('')
  const [when, setWhen] = useState('')
  const [done, setDone] = useState(false)

  const submit = () => {
    if (!phone.trim()) return
    onSubmit(phone.trim(), when)
    if (!preview) setDone(true)
    else setDone(true)
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="shrink-0 flex items-center gap-2.5 rounded-[12px] bg-[#F1F1F4] px-3 py-2.5 text-left"
      >
        <IconBackCircle color="#6E6E76" />
        <span className="text-[16px] text-[#6E6E76]">Назад</span>
      </button>

      <div
        className="w-full px-4 py-4 flex items-center justify-between gap-3 rounded-[14px] border text-[16px]"
        style={{ borderColor: accent, color: accent }}
      >
        <span>Обратный звонок</span>
        <IconArrowCircle color={accent} />
      </div>

      {done ? (
        <div
          className="rounded-[16px] p-6 min-h-50 flex items-center justify-center text-center"
          style={{ backgroundColor: '#DFF3E2' }}
        >
          <span className="text-[18px] leading-6 text-[#1A1A1A]">
            Спасибо! В указанное время с вами свяжется наш менеджер.
          </span>
        </div>
      ) : (
        <div className="rounded-[16px] border border-[#E3E3E8] p-4 flex flex-col gap-3">
          <div className="text-[24px] leading-7 font-bold text-[#1A1A1A]">Обратный звонок</div>
          <p className="text-[16px] leading-5.5 text-[#1A1A1A]">
            Укажите номер телефона, и выберите время для звонка
          </p>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+7 ___ ___ __ __"
            className="w-full h-13 px-4 rounded-[12px] border border-[#E4E4E7] text-[16px] text-[#1A1A1A] placeholder:text-[#B6B3BE] outline-none focus:border-[#5951E5]"
          />
          <p className="text-[16px] leading-5.5 text-[#1A1A1A]">Когда нам лучше позвонить?</p>
          <div className="flex items-stretch gap-2.5">
            <input
              type="datetime-local"
              value={when}
              onChange={e => setWhen(e.target.value)}
              className="flex-1 h-14 px-4 rounded-[12px] border border-[#E4E4E7] text-[16px] text-[#1A1A1A] outline-none focus:border-[#5951E5]"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!phone.trim()}
              aria-label="Заказать звонок"
              className="shrink-0 w-16 rounded-[12px] flex items-center justify-center text-white disabled:opacity-50"
              style={{ backgroundColor: accent }}
            >
              <IconRocket color="#FFFFFF" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------- widget --------------------------------- */

const Widget = (props: WidgetProps) => {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [props.messages, props.open])

  const submit = (body: string) => {
    const text = body.trim()
    if (!text || props.disabled) return
    props.onSend(text)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit(draft)
    setDraft('')
  }

  const motionInitial = { opacity: 0, translateY: '12px' }
  const motionAnimate = { opacity: 1, translateY: '0' }
  const motionExit = { opacity: 0, translateY: '12px' }
  const motionTransition: Transition = { duration: 0.3, ease: 'easeInOut' }

  const accent = props.windowAccentColor
  const showQuickReplies = props.quickReplies.length > 0

  const isSidebar = props.windowFormat === 'sidebar' && !props.mobile

  const mobileStyle: CSSProperties | undefined = props.mobile
    ? { maxHeight: window.innerHeight - 96, width: 'min(380px, 94vw)' }
    : undefined

  return (
    <AnimatePresence>
      {props.open && (
        <div style={mobileStyle} className={cn(isSidebar && 'h-[100dvh]')}>
          <motion.div
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionTransition}
            className={cn(
              'w-[380px] max-w-[94vw] shrink-0 flex flex-col overflow-hidden',
              isSidebar ? 'h-[100dvh] max-h-[100dvh]' : 'h-[620px] max-h-[78vh]',
              'shadow-[0px_8px_24px_rgba(0,0,0,0.10)]',
            )}
            style={{
              backgroundColor: props.windowBackgroundColor,
              borderRadius: isSidebar ? 0 : props.windowRadius,
            }}
          >
            <>
            {/* Шапка — статична на всех экранах; логотип и приветствие только на home */}
            <div className="shrink-0 p-3">
              <div
                className="relative rounded-[18px] px-5 pt-4 pb-4 flex flex-col gap-2.5"
                style={{ backgroundColor: accent }}
              >
                {isSidebar && (
                  <button
                    type="button"
                    onClick={props.onClose}
                    aria-label="Закрыть чат"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                )}
                {props.view === 'home' && (
                  <div className="h-9 flex items-center">
                    {props.companyLogoUrl
                      ? <img src={props.companyLogoUrl} alt="" className="max-h-9 max-w-[120px] object-contain" />
                      : <IconBot color="#FFFFFF" />}
                  </div>
                )}

                <OperatorAvatars
                  primaryAvatarUrl={props.operatorAvatarUrl}
                  online={props.operatorOnline}
                />

                <div className="text-center text-white whitespace-pre-line text-[15px] leading-5 opacity-90">
                  {props.operatorOnline ? props.onlineMessage : props.offlineMessage}
                </div>

                {props.view === 'home' && props.welcomeTitle.trim() && (
                  <div
                    className="whitespace-pre-line font-semibold mt-1"
                    style={{
                      color: props.welcomeTitleColor,
                      fontSize: props.welcomeTitleSize,
                      lineHeight: 1.2,
                      textAlign: props.welcomeTitleAlign,
                    }}
                  >
                    {props.welcomeTitle}
                  </div>
                )}
              </div>
            </div>

            {/* Ряд иконок-вкладок */}
            <TabBar
              accent={accent}
              active={props.view === 'contacts' || props.view === 'callback' ? 'contacts' : 'chat'}
              onChat={props.onTabChat}
              onContacts={props.onTabContacts}
              onAi={props.onTabAi}
            />

            {props.view === 'contacts' && (
              <ContactsTab
                data={props.contactsTab}
                onLeaveMessage={props.onLeaveMessage}
                onCall={props.onCall}
              />
            )}

            {props.view === 'callback' && (
              <CallbackView
                accent={accent}
                preview={props.preview}
                onBack={props.onBack}
                onSubmit={props.onSubmitCallback}
              />
            )}

            {props.view === 'form' && (
              <ContactForm
                contacts={props.contacts}
                disabled={props.disabled}
                onBack={props.onBack}
                onSubmit={props.onSubmitForm}
              />
            )}

            {(props.view === 'home' || props.view === 'chat') && (
            <>
            {/* Лента сообщений */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            >
              {props.messages.map(message => (
                <MessageBubble key={message.id} message={message} clientColor={props.clientColor} />
              ))}
            </div>

            {/* Кнопки сценария — закреплены над текстом; неактивны во время живого чата */}
            {showQuickReplies && (() => {
              const regular = props.quickReplies.filter(q => !q.isHandoff)
              const handoff = props.quickReplies.filter(q => q.isHandoff)
              const btnDisabled = props.disabled || props.chatActive
              return (
                <div className="shrink-0 px-4 pb-1 flex flex-col gap-3">
                  {regular.length > 0 && (
                    <div className={cn('rounded-[14px] border border-[#E3E3E8] overflow-hidden', btnDisabled && 'opacity-50')}>
                      {regular.map((qr, i) => (
                        <button
                          key={qr.id}
                          type="button"
                          disabled={btnDisabled}
                          onClick={() => props.onQuickReply(qr.id)}
                          className={cn(
                            'w-full px-4 py-4 flex items-center justify-between gap-3 text-left',
                            'text-[16px] leading-5 text-[#1A1A1A] hover:bg-[#FAFAFB] transition-colors disabled:cursor-not-allowed',
                            i !== regular.length - 1 && 'border-b border-[#EDEDF0]',
                          )}
                        >
                          <span>{qr.emoji ? `${qr.emoji} ` : ''}{qr.label}</span>
                          <span className="shrink-0 text-[#1A1A1A]"><IconArrowCircle color="currentColor" /></span>
                        </button>
                      ))}
                    </div>
                  )}

                  {handoff.map(qr => (
                    <button
                      key={qr.id}
                      type="button"
                      disabled={btnDisabled}
                      onClick={() => props.onQuickReply(qr.id)}
                      className={cn(
                        'w-full px-4 py-4 flex items-center justify-between gap-3 text-left',
                        'rounded-[14px] border text-[16px] leading-5 transition-colors disabled:cursor-not-allowed',
                        btnDisabled && 'opacity-50',
                      )}
                      style={{ borderColor: accent, color: accent }}
                    >
                      <span>{qr.emoji ? `${qr.emoji} ` : ''}{qr.label}</span>
                      <span className="shrink-0"><IconArrowCircle color={accent} /></span>
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* Низ окна: живой чат / «Войти в чат» (онлайн) / поле сообщения (офлайн) / подтверждение */}
            {props.chatActive ? (
              <>
                <form onSubmit={handleSubmit} className="shrink-0 px-4 pt-2">
                  <div className="flex items-center gap-2 border-t border-[#EFEFF2] pt-3">
                    <input
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      disabled={props.disabled}
                      placeholder={props.placeholder}
                      className="flex-1 text-[17px] leading-6 text-[#1A1A1A] placeholder:text-[#B6B3BE] outline-none bg-transparent"
                    />
                    <button
                      type="submit"
                      disabled={props.disabled || draft.trim().length === 0}
                      className="shrink-0 p-1 disabled:opacity-40"
                      aria-label="Отправить"
                    >
                      <IconSend color="#8E8B97" />
                    </button>
                  </div>
                </form>

                <div className="shrink-0 px-4 py-3 flex items-center gap-6">
                  <button type="button" aria-label="Добавить" className="shrink-0">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ border: `1.6px solid ${accent}` }}
                    >
                      <IconPlus color={accent} />
                    </span>
                  </button>
                  <button type="button" aria-label="Голос"><IconMic color="#8E8B97" /></button>
                  <button type="button" aria-label="Вложение"><IconClip color="#8E8B97" /></button>
                  <EmojiPicker onPick={em => setDraft(d => d + em)}>
                    <IconEmoji color="#8E8B97" />
                  </EmojiPicker>
                </div>
              </>
            ) : props.operatorOnline ? (
              <div className="shrink-0 px-4 pt-2 pb-3">
                <button
                  type="button"
                  onClick={props.onEnterChat}
                  className="w-full h-12 rounded-[12px] text-white text-[16px] font-medium"
                  style={{ backgroundColor: accent }}
                >
                  Войти в чат
                </button>
              </div>
            ) : props.offlineSent ? (
              <div className="shrink-0 px-4 pt-2 pb-3">
                <div
                  className="rounded-[12px] p-4 text-center text-[15px] leading-5 text-[#1A1A1A]"
                  style={{ backgroundColor: '#DFF3E2' }}
                >
                  Ваше сообщение отправлено, менеджер свяжется в рабочее время.
                </div>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const text = draft.trim()
                  if (!text || props.disabled) return
                  props.onOfflineSend(text)
                  setDraft('')
                }}
                className="shrink-0 px-4 pt-2 pb-3"
              >
                <div className="flex items-center gap-2 border border-[#E3E3E8] rounded-[12px] px-3 h-12">
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    disabled={props.disabled}
                    placeholder="Сообщение"
                    className="flex-1 text-[16px] text-[#1A1A1A] placeholder:text-[#B6B3BE] outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={props.disabled || draft.trim().length === 0}
                    className="shrink-0 p-1 disabled:opacity-40"
                    aria-label="Отправить"
                  >
                    <IconSend color="#8E8B97" />
                  </button>
                </div>
              </form>
            )}

            {/* Футер брендинга */}
            {props.brandingEnabled && (
              <div className="shrink-0 bg-[#F2F1F4] py-3 flex justify-center">
                <a
                  href="https://lemnity.ru"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] leading-4 text-[#9A96A2] hover:underline"
                >
                  Сделано на Lemnity
                </a>
              </div>
            )}
            </>
            )}
            </>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Widget
