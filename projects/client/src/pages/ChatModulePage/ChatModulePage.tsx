import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@heroui/theme'
import { useNavigate, useParams } from 'react-router-dom'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

import { useChatSocket } from '@/hooks/useChatSocket'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { buildDefaults } from '@/stores/widgetSettings/defaults'
import type { WidgetSettings } from '@/stores/widgetSettings/types'
import { useProjectsStore } from '@/stores/projectsStore'
import useOperatorAuthStore from '@stores/operatorAuthStore'
import * as chatsService from '@/services/chats'
import * as chatModule from '@/services/chatModule'
import {
  uploadImage,
  uploadFile,
  classifyAttachment,
  MAX_IMAGE_BYTES,
  IMAGE_TOO_LARGE_MESSAGE
} from '@/api/upload'
import type { ChatConversation, ChatMessage } from '@/services/chats'
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover'
import FeedbackPopover from '@/components/FeedbackPopover/FeedbackPopover'
import CustomSwitch from '@/components/CustomSwitch'
import ChatAiAgentSettings from '@/layouts/Widgets/Chat/ChatAiAgentSettings'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'

const ACCENT = '#1A52DB' // primary платформы

/* ------------------------------- icons ---------------------------------- */

const Ic = ({ d, size = 22, stroke = 1.7 }: { d: string; size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
)

const IconInbox = () => <Ic d="M3 13h4l2 3h6l2-3h4|M3 13 5 6h14l2 7v5H3z" />
const IconMegaphone = () => <Ic d="M4 10v4h4l8 4V6l-8 4H4z|M18 9a3 3 0 0 1 0 6" />
const IconBubble = () => <Ic d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
const IconPlanet = () => <Ic d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M3.5 9h17M3.5 15h17|M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
const IconUser = () => <Ic d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M4 20a8 8 0 0 1 16 0" />
const IconUsers = () => <Ic d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z|M2 20a7 7 0 0 1 14 0|M17 11a3 3 0 1 0-1.5-5.6|M22 20a6 6 0 0 0-5-5.9" />
const IconDoc = () => <Ic d="M7 3h7l4 4v14H7z|M14 3v4h4|M9.5 12h5M9.5 15.5h5" />
const IconGlobe = () => <Ic d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M3.5 9h17M3.5 15h17|M12 3c2.2 2.6 2.2 15.4 0 18M12 3c-2.2 2.6-2.2 15.4 0 18" size={18} />
const IconEnter = () => <Ic d="M15 3h4v18h-4|M10 8l4 4-4 4M4 12h10" size={18} />
const IconSearch = () => <Ic d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.2-3.2" size={18} />
const IconPhone = () => <Ic d="M5 4h3l1.5 4.5L7.5 10a12 12 0 0 0 6 6l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" size={18} />
const IconMail = () => <Ic d="M3 5h18v14H3z|M3.5 6 12 13l8.5-7" size={18} />
const IconChevron = () => <Ic d="M6 9l6 6 6-6" size={18} stroke={2} />
const IconSparkles = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={ACCENT}>
    <path d="M12 2.5l1.7 4.6 4.6 1.7-4.6 1.7L12 15.1l-1.7-4.6L5.7 8.8l4.6-1.7L12 2.5Z" />
    <path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" />
  </svg>
)
const IconDots = () => <Ic d="M12 6h.01M12 12h.01M12 18h.01" stroke={2.5} size={20} />
const IconSelectAll = () => <Ic d="M4 4h16v16H4z|M8.5 12l2.5 2.5 5-5.5" size={22} stroke={1.8} />
const IconMailUnread = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5 12 12.5 20.5 6.5" />
    <circle cx="19" cy="6" r="3" fill="currentColor" stroke="none" />
  </svg>
)
const IconMailRead = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-5 9 5" />
    <path d="M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
    <path d="M3.5 9.5 12 15l8.5-5.5" />
  </svg>
)
const IconUserPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="8" r="3.2" />
    <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M19 7v6M16 10h6" />
  </svg>
)

/* ----------------------------- helpers ---------------------------------- */

const fmtTime = (iso?: string | null) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
const fmtFull = (iso: string) => {
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('ru-RU')} в ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return ''
  }
}
const dayLabel = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}
const convName = (c: ChatConversation) => c.visitorName || `Клиент #${c.number}`

// Название чата для модуля: сначала «Название чата» из конфига виджета (config.title), затем имя
// проекта (осмысленное, различает чаты), затем имя виджета и в крайнем случае — «Чат».
const chatLabel = (
  widget?: { name?: string; config?: object | null },
  projectName?: string,
): string => {
  const cfgTitle = (widget?.config as { title?: string } | null | undefined)?.title?.trim()
  const widgetName = widget?.name?.trim()
  // «Чат» — дефолтное имя виджета; как имя не используем (берём имя проекта).
  const meaningfulWidgetName = widgetName && widgetName.toLowerCase() !== 'чат' ? widgetName : undefined
  return cfgTitle || projectName?.trim() || meaningfulWidgetName || 'Чат'
}

/* ----------------------------- mock (preview) --------------------------- */

// Мок-чаты для превью (несколько чатов = несколько проектов, по одному CHAT-виджету на проект).
const MOCK_CHATS: { projectId: string; widgetId: string; label: string }[] = [
  { projectId: 'p-site', widgetId: 'w-site', label: 'Чат на сайте' },
  { projectId: 'p-landing', widgetId: 'w-landing', label: 'Чат лендинга' },
]

const mockConv = (
  id: string,
  number: string,
  name: string | null,
  preview: string,
  unread: number,
  widgetId: string,
  contact?: { email?: string; phone?: string }
): ChatConversation => ({
  id,
  number,
  projectId: widgetId === 'w-landing' ? 'p-landing' : 'p-site',
  widgetId,
  sessionId: id,
  status: 'open',
  visitorName: name ?? undefined,
  visitorPhone: contact?.phone,
  visitorEmail: contact?.email,
  lastMessageAt: '2025-11-12T15:27:00',
  lastMessagePreview: preview,
  unreadForManager: unread,
  createdAt: '2025-11-12T15:00:00',
})

const MOCK_CONVERSATIONS: ChatConversation[] = [
  mockConv('m1', '0001', 'Клиент #1', '+2', 2, 'w-site'),
  mockConv('m2', '0002', 'Елизавета', '+1', 1, 'w-site', { email: 'liza@example.com', phone: '+7 905 000-11-22' }),
  mockConv('m3', '0003', 'Клиент #3', '12', 0, 'w-site', { email: 'client3@example.com', phone: '+7 900 123-45-67' }),
  mockConv('m4', '0004', 'Демин Александр', '34', 0, 'w-landing'),
  mockConv('m5', '0005', 'Демин Александр', '34', 0, 'w-landing'),
]

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  m3: [
    { id: 'x1', conversationId: 'm3', sender: 'visitor', body: 'Здравствуйте, хочу купить кроссовки, но их нет в каталоге, хотя в магазине они есть', createdAt: '2025-11-12T17:23:00' },
    { id: 'x2', conversationId: 'm3', sender: 'manager', body: 'Здравствуйте, укажите артикул товара', createdAt: '2025-11-12T16:54:00' },
    { id: 'x3', conversationId: 'm3', sender: 'visitor', body: '27677654', createdAt: '2025-11-12T17:23:00' },
  ],
}
/* ----------------------------- dialogs meta ----------------------------- */

type Channel = 'vk' | 'web' | 'telegram'
type RespKind = 'fast' | 'slow' | 'instant' | 'none'

const STATUS_COLORS: Record<string, string> = {
  'Первичный контакт': '#3BD16F',
  'Повторное обращение': '#F5A623',
  'Завершен с успехом': '#5951E5',
  'В работе': '#3BD16F',
  Спам: '#E5484D',
}
const STATUS_OPTIONS = Object.keys(STATUS_COLORS)

const CHANNEL_LABEL: Record<Channel, string> = {
  vk: 'Апп ВК',
  web: 'Чат на сайте',
  telegram: 'Апп Телеграм',
}

const ChannelIcon = ({ ch }: { ch: Channel }) => {
  if (ch === 'vk')
    return <span className="w-[18px] h-[18px] rounded-[5px] bg-[#0077FF] text-white text-[10px] font-bold flex items-center justify-center">VK</span>
  if (ch === 'telegram')
    return <span className="w-[18px] h-[18px] rounded-full bg-[#29A9EB] text-white flex items-center justify-center"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4 3 11l5 1.7L18 6 9.5 14l-.3 4 2.8-2.7 4 3z" /></svg></span>
  return <span className="text-default-400"><IconGlobe /></span>
}

const RespIcon = ({ kind }: { kind: RespKind }) => {
  const c = 'currentColor'
  if (kind === 'instant') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M9 11a8 8 0 0 1 9-7 8 8 0 0 1-7 9l-3 3-2-2 3-3Z" /></svg>
  if (kind === 'slow') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5a4.5 4.5 0 0 1 7 0M9 9.5h.01M15 9.5h.01" /></svg>
  if (kind === 'none') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9.5a3 3 0 0 1 6 0c0 1.5-1.5 2-1.5 3.5M12 18h.01" /><circle cx="12" cy="12" r="9" /></svg>
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" /></svg>
}

type DialogMeta = { status: string; channel: Channel; resp: string; respKind: RespKind; selected?: boolean }
const MOCK_DIALOG_META: Record<string, DialogMeta> = {
  m1: { status: 'Первичный контакт', channel: 'vk', resp: '30 секунд', respKind: 'fast' },
  m2: { status: 'Первичный контакт', channel: 'web', resp: '20 минут', respKind: 'slow' },
  m3: { status: 'Повторное обращение', channel: 'web', resp: 'Сразу', respKind: 'instant', selected: true },
  m4: { status: 'Завершен с успехом', channel: 'web', resp: '2 минуты', respKind: 'fast' },
  m5: { status: 'Спам', channel: 'telegram', resp: 'Без ответа', respKind: 'none', selected: true },
}
const DEFAULT_META: DialogMeta = { status: 'Первичный контакт', channel: 'web', resp: '—', respKind: 'fast' }

// Реальное время реакции: firstVisitorAt → firstManagerAt (денормализовано на бэкенде).
const respFromConv = (c: ChatConversation): { resp: string; respKind: RespKind } => {
  if (!c.firstManagerAt) return { resp: 'Без ответа', respKind: 'none' }
  const start = c.firstVisitorAt ?? c.createdAt
  const sec = Math.max(0, Math.round((new Date(c.firstManagerAt).getTime() - new Date(start).getTime()) / 1000))
  if (sec < 10) return { resp: 'Сразу', respKind: 'instant' }
  if (sec < 60) return { resp: `${sec} секунд`, respKind: 'fast' }
  const min = Math.round(sec / 60)
  if (min < 60) return { resp: `${min} мин`, respKind: min <= 5 ? 'fast' : 'slow' }
  return { resp: `${Math.round(min / 60)} ч`, respKind: 'slow' }
}
const channelOf = (c: ChatConversation): Channel => {
  const ch = c.channel
  return ch === 'vk' || ch === 'telegram' ? ch : 'web'
}

// Статусы оператора (блок «Мои входящие»).
const OPERATOR_STATUSES = [
  { key: 'work', emoji: '💼', label: 'В работе', dot: '#3BD16F' },
  { key: 'lunch', emoji: '🥪', label: 'На обеде', dot: '#F5A623' },
  { key: 'away', emoji: '👣', label: 'Отошел', dot: '#E5484D' },
  { key: 'rest', emoji: '🏠', label: 'Отдыхаю', dot: '#E5484D' },
] as const

// Библиотека эмодзи для композера.
const EMOJIS = ['😀','😁','😂','🤣','🙂','😉','😍','😘','🤔','😎','🥳','😢','😡','👍','👎','🙏','👌','🔥','🎉','✅','❗','💡','❤️','💬','📞','🚀','⭐','💯']

type GroupMsg = {
  id: string
  author: string
  me?: boolean
  body: string
  createdAt: string
  attachmentUrl?: string | null
  attachmentType?: string | null
  attachmentName?: string | null
}
const INITIAL_GROUP: GroupMsg[] = [
  { id: 'g1', author: 'Анна Смирнова', body: 'Коллеги, кто возьмёт Клиента #3? Спрашивает про артикул.', createdAt: '2025-11-12T10:02:00' },
  { id: 'g2', author: 'Игорь Петров', body: 'Я возьму, уже отвечаю.', createdAt: '2025-11-12T10:03:00' },
  { id: 'g3', author: 'Анна Смирнова', body: 'Спасибо! Если что — пинг сюда.', createdAt: '2025-11-12T10:04:00' },
]

const Avatar = ({ name, size = 40, url }: { name: string; size?: number; url?: string }) =>
  url ? (
    <img src={url} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full bg-[#E9E4DC] flex items-center justify-center text-[#6E6E76] font-medium shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )

/* Вложение в сообщении: картинка (открывается), видео (плеер) или файл (скачать). */
const AttachmentView = ({
  url,
  type,
  name,
}: {
  url: string
  type?: string | null
  name?: string | null
}) => {
  if (type === 'image')
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img
          src={url}
          alt={name ?? ''}
          className="max-w-[220px] max-h-[220px] rounded-[10px] object-cover"
        />
      </a>
    )
  if (type === 'video')
    return (
      <video src={url} controls className="max-w-[260px] max-h-[260px] rounded-[10px]" />
    )
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download
      className="flex items-center gap-2 text-primary hover:underline break-all"
    >
      <Ic d="M7 3h7l4 4v14H7z|M14 3v4h4" size={18} /> {name ?? 'Файл'}
    </a>
  )
}

// Вложения сообщения: галерея картинок (сетка 2 кол.) + файлы-чипсы. Поддерживает массив
// attachments (мультивложения оператора) и одиночные legacy-поля.
const MessageAttachments = ({ message }: { message: ChatMessage }) => {
  const list =
    message.attachments && message.attachments.length
      ? message.attachments
      : message.attachmentUrl
        ? [{ url: message.attachmentUrl, type: (message.attachmentType as 'image' | 'video' | 'file') ?? 'file', name: message.attachmentName ?? undefined }]
        : []
  if (list.length === 0) return null
  const images = list.filter(a => a.type === 'image')
  const files = list.filter(a => a.type !== 'image')
  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className={cn('grid gap-1.5', images.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
          {images.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={a.url}
                alt={a.name ?? ''}
                className={cn(
                  'w-full object-cover rounded-[10px]',
                  images.length === 1 ? 'max-h-[220px] max-w-[220px]' : 'h-[110px]',
                )}
              />
            </a>
          ))}
        </div>
      )}
      {files.map((a, i) => (
        <AttachmentView key={`f${i}`} url={a.url} type={a.type} name={a.name} />
      ))}
    </div>
  )
}

/* ----------------------------- sidebar ---------------------------------- */

const NavItem = ({
  icon,
  label,
  active,
  badge,
  onClick,
  collapsed,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  collapsed?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    title={collapsed ? label : undefined}
    aria-label={collapsed ? label : undefined}
    className={cn(
      'w-full h-11 rounded-[10px] flex items-center text-[16px] transition-colors relative',
      collapsed ? 'justify-center px-0' : 'px-3 gap-3',
      active
        ? 'bg-white shadow-[0_2px_8px_rgba(26,82,219,0.12)] ring-1 ring-primary/30 text-primary font-medium'
        : 'text-[#3D3D3B] hover:bg-white hover:text-[#1A1A1A]',
    )}
  >
    <span className={cn('relative', active ? 'text-primary' : 'text-[#3D3D3B]')}>
      {icon}
      {/* В свёрнутом режиме бейдж — точкой на иконке. */}
      {collapsed && badge ? (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#3BB240]" />
      ) : null}
    </span>
    {!collapsed && <span className="flex-1 text-left">{label}</span>}
    {!collapsed && badge ? (
      <span className="bg-[#3BB240] text-white text-[12px] px-2 py-0.5 rounded-full">+ {badge}</span>
    ) : null}
  </button>
)

type Section = 'inbox' | 'dialogs' | 'social' | 'assistant' | 'operators' | 'departments' | 'settings'

const SECTION_TITLES: Record<Section, string> = {
  inbox: 'Входящие',
  dialogs: 'Диалоги',
  social: 'Соцсети',
  assistant: 'Асистент',
  operators: 'Операторы',
  departments: 'Отделы',
  settings: 'Настройки',
}

// Глобальный выбор чата: «Все» (диалоги всех активных чатов) или конкретный чат-виджет.
// Фильтрует Входящие и Диалоги. chats — активные CHAT-виджеты всех проектов (один чат на проект).
const SidebarChatSelect = ({
  chats,
  value,
  onChange,
}: {
  chats: { widgetId: string; label: string }[]
  value: 'all' | string
  onChange: (v: 'all' | string) => void
}) => {
  const [open, setOpen] = useState(false)
  const current = value === 'all' ? 'Все чаты' : chats.find(c => c.widgetId === value)?.label ?? 'Все чаты'
  const options = [{ widgetId: 'all', label: 'Все чаты' }, ...chats]
  return (
    <div className="relative px-2 pb-2 mb-1 border-b border-default-200">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-9 px-3 flex items-center justify-between gap-2 rounded-[10px] border border-default-200 bg-white text-[14px] text-[#1A1A1A]"
      >
        <span className="truncate">{current}</span>
        <IconChevron />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-2 right-2 top-full mt-1 z-20 rounded-[12px] border border-default-200 bg-white shadow-lg py-1.5 max-h-64 overflow-y-auto">
            {options.map(c => (
              <button
                key={c.widgetId}
                type="button"
                onClick={() => {
                  onChange(c.widgetId as 'all' | string)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-[14px] hover:bg-default-50 truncate',
                  value === c.widgetId && 'text-primary font-medium',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Карточка техподдержки: «Написать» открывает попап обратной связи (как «идеи и
// предложения» в шапке ЛК), а не почтовый клиент. Своё состояние попапа.
const SupportWriteButton = () => {
  const [open, setOpen] = useState(false)
  const [nonce, setNonce] = useState(0)
  return (
    <div className="rounded-[10px] border border-default-200 bg-white p-3 flex flex-col items-center gap-2">
      <span className="text-[14px] text-[#1A1A1A] text-center">Техническая поддержка</span>
      <Popover
        placement="top"
        offset={12}
        isOpen={open}
        onOpenChange={v => { setOpen(v); if (v) setNonce(n => n + 1) }}
      >
        <PopoverTrigger>
          <button type="button" className="w-full h-9 rounded-[6px] bg-[#E7E8EA] text-[15px] flex items-center justify-center hover:bg-[#DCDDE0] transition-colors">
            Написать
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-2xl">
          <FeedbackPopover key={nonce} onSent={() => setTimeout(() => setOpen(false), 1500)} />
        </PopoverContent>
      </Popover>
      <a href="mailto:support@lemnity.ru" className="text-[13px] underline text-[#292D32]">support@lemnity.ru</a>
    </div>
  )
}

const ModuleSidebar = ({
  section,
  onSection,
  inboxCount,
  onExit,
  chats,
  dialogChat,
  onDialogChat,
  isOperator,
  collapsed,
  onToggleCollapsed,
}: {
  section: Section
  onSection: (s: Section) => void
  inboxCount: number
  onExit: () => void
  chats: { widgetId: string; label: string }[]
  dialogChat: 'all' | string
  onDialogChat: (v: 'all' | string) => void
  isOperator?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}) => (
  <aside className={cn(
    'shrink-0 sidebar-bg flex flex-col p-4 gap-1.5 transition-[width] duration-200',
    collapsed ? 'w-[72px] items-center' : 'w-60',
  )}>
    <div className={cn('flex items-center', collapsed ? 'justify-center w-full' : 'justify-between')}>
      {!collapsed && (
        <h1 className="text-[20px] font-semibold text-[#1A1A1A] px-2 pt-1">
          Модуль "Чат"
        </h1>
      )}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        title={collapsed ? 'Развернуть' : 'Свернуть'}
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[8px] text-[#3D3D3B] hover:bg-white hover:text-primary transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('transition-transform', collapsed && 'rotate-180')}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
    <button
      type="button"
      onClick={onExit}
      title={isOperator ? 'Выйти' : 'Личный кабинет'}
      className={cn(
        'flex items-center gap-2 text-[14px] text-[#3D3D3B] hover:text-primary pb-3 mb-1 border-b border-default-200',
        collapsed ? 'justify-center w-full' : 'px-2',
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      {!collapsed && (isOperator ? 'Выйти' : 'Личный кабинет')}
    </button>
    {/* Оператору селектор чата не нужен — доступ уже ограничен сервером. */}
    {!isOperator && !collapsed && chats.length > 0 && (
      <SidebarChatSelect chats={chats} value={dialogChat} onChange={onDialogChat} />
    )}
    <NavItem icon={<IconInbox />} label="Входящие" active={section === 'inbox'} badge={inboxCount || undefined} onClick={() => onSection('inbox')} collapsed={collapsed} />
    <NavItem icon={<IconMegaphone />} label="Диалоги" active={section === 'dialogs'} onClick={() => onSection('dialogs')} collapsed={collapsed} />
    {/* Owner-разделы скрыты для оператора. */}
    {!isOperator && (
      <>
        <NavItem icon={<IconBubble />} label="Соцсети" active={section === 'social'} onClick={() => onSection('social')} collapsed={collapsed} />
        <div className="h-px bg-default-200 my-2 w-full" />
        <NavItem icon={<IconPlanet />} label="Асистент" active={section === 'assistant'} onClick={() => onSection('assistant')} collapsed={collapsed} />
        <NavItem icon={<IconUser />} label="Операторы" active={section === 'operators'} onClick={() => onSection('operators')} collapsed={collapsed} />
        <NavItem icon={<IconUsers />} label="Отделы" active={section === 'departments'} onClick={() => onSection('departments')} collapsed={collapsed} />
        <NavItem
          icon={<Ic d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M19.4 13a1.7 1.7 0 0 0 .3 1.9 2 2 0 1 1-2.8 2.8 1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2 2 2 0 1 1-2.8-2.8A1.7 1.7 0 0 0 4.6 13a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.5-2.9 2 2 0 1 1 2.8-2.8A1.7 1.7 0 0 0 11.8 4 2 2 0 1 1 15.8 4a1.7 1.7 0 0 0 2.9 1.2 2 2 0 1 1 2.8 2.8A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.6 1Z" size={22} stroke={1.6} />}
          label="Настройки"
          active={section === 'settings'}
          onClick={() => onSection('settings')}
          collapsed={collapsed}
        />
      </>
    )}

    <div className={cn('mt-auto flex flex-col gap-3', collapsed && 'items-center')}>
      <a
        href="https://help.lemnity.ru"
        target="_blank"
        rel="noreferrer"
        title="Документация"
        className={cn('flex items-center gap-2 text-[15px] text-[#3D3D3B] hover:text-[#1A1A1A]', collapsed ? 'justify-center' : 'px-2')}
      >
        <IconDoc /> {!collapsed && 'Документация'}
      </a>
      {!collapsed && <SupportWriteButton />}
    </div>
  </aside>
)

/* ----------------------------- dialogs ---------------------------------- */

const CheckBox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className={cn(
      'w-6 h-6 shrink-0 rounded-[6px] border flex items-center justify-center transition-colors',
      checked ? 'bg-primary border-primary' : 'bg-white border-default-300',
    )}
  >
    {checked && (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
    )}
  </button>
)

const StatusSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative w-full h-11 rounded-[10px] bg-default-100 flex items-center px-3">
    <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: STATUS_COLORS[value] ?? '#9A96A2' }} />
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 min-w-0 appearance-none bg-transparent text-[15px] outline-none cursor-pointer pr-6"
    >
      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
    </select>
    <span className="pointer-events-none absolute right-3 text-default-400"><IconChevron /></span>
  </div>
)

/** Карточка беседы (как в макете): профиль клиента + история диалога + события. Реальные данные. */
const DialogCard = ({
  conv,
  preview,
  onClose,
  onOpen,
}: {
  conv: ChatConversation
  preview?: boolean
  onClose: () => void
  onOpen: (id: string) => void
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (preview) {
      setMessages(MOCK_MESSAGES[conv.id] ?? [])
      return
    }
    let alive = true
    void (async () => {
      try {
        const res = await chatsService.getConversationMessages(conv.id)
        if (alive) setMessages(res.messages)
      } catch (e) {
        console.error('DialogCard messages failed', e)
        if (alive) setMessages([])
      }
    })()
    return () => {
      alive = false
    }
  }, [conv.id, preview])

  const groups = useMemo(() => {
    const out: { day: string; items: ChatMessage[] }[] = []
    for (const m of messages) {
      const day = dayLabel(m.createdAt)
      const last = out[out.length - 1]
      if (last && last.day === day) last.items.push(m)
      else out.push({ day, items: [m] })
    }
    return out
  }, [messages])

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[13px] text-default-400">{label}</span>
      <span className="text-[15px] text-[#1A1A1A] break-words">{value || '—'}</span>
    </div>
  )
  const EventItem = ({ title, time, rows }: { title: string; time?: string | null; rows: [string, string][] }) => (
    <div className="relative pl-5">
      <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-primary" />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-medium text-[#1A1A1A]">{title}</span>
        <span className="text-[12px] text-default-400 shrink-0">{time ? fmtFull(time) : ''}</span>
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-default-400 shrink-0">{k}</span>
            <span className="text-[#1A1A1A] text-right break-words min-w-0">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // Расширенная аналитика посетителя.
  const deviceLabel = conv.deviceType
    ? (({ desktop: 'Компьютер', mobile_ios: 'iPhone/iPad', mobile_android: 'Android' } as Record<string, string>)[conv.deviceType] ?? conv.deviceType)
    : null
  const geoStr = [conv.city, conv.region, conv.country].filter(Boolean).join(', ') || null

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[1240px] h-[88vh] bg-white rounded-[16px] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Шапка */}
        <div className="h-16 shrink-0 px-5 flex items-center gap-3 border-b border-default-200">
          <Avatar name={convName(conv)} size={40} />
          <span className="text-[18px] font-semibold text-[#1A1A1A] truncate flex-1 min-w-0">{convName(conv)}</span>
          <button type="button" onClick={() => { onOpen(conv.id); onClose() }} className="h-9 px-4 rounded-[10px] bg-primary text-white text-[14px]">Перейти в диалог</button>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="w-9 h-9 rounded-[8px] hover:bg-default-100 flex items-center justify-center text-default-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {/* Тело: 3 колонки */}
        <div className="flex-1 min-h-0 flex">
          {/* Профиль */}
          <aside className="w-[320px] shrink-0 border-r border-default-200 overflow-y-auto p-5 flex flex-col gap-4">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Профиль клиента</h3>
            <Field label="Имя" value={conv.visitorName} />
            <Field label="Email" value={conv.visitorEmail} />
            <Field label="Телефон" value={conv.visitorPhone} />
            <div className="h-px bg-default-200" />
            <Field label="Статус беседы" value={conv.category || (conv.status === 'closed' ? 'Завершён' : 'Открыт')} />
            <Field label="Канал" value={conv.channel || 'Чат на сайте'} />
            <Field label="Заметка оператора" value={conv.note} />
          </aside>

          {/* История диалогов */}
          <section className="flex-1 min-w-0 flex flex-col">
            <div className="px-6 py-4 border-b border-default-200 shrink-0">
              <h3 className="text-[16px] font-semibold text-[#1A1A1A]">История диалогов</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {groups.length === 0 ? (
                <div className="text-center text-default-400 text-[14px] py-10">Сообщений пока нет</div>
              ) : (
                groups.map((g, gi) => (
                  <div key={gi} className="flex flex-col gap-3">
                    <div className="text-center text-[13px] text-default-400">{g.day}</div>
                    {g.items.map(m =>
                      m.sender === 'system' ? (
                        <div key={m.id} className="text-center text-[13px] text-default-400">{m.body}</div>
                      ) : (
                        <div key={m.id} className={cn('w-full flex', m.sender === 'manager' ? 'justify-end' : 'justify-start')}>
                          <div className={cn('max-w-[70%] px-4 py-2.5 rounded-[14px] text-[15px] leading-5', m.sender === 'manager' ? 'bg-primary/10 rounded-br-[4px]' : 'bg-default-100 rounded-bl-[4px]')}>
                            {m.aiGenerated && (
                              <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#5951E5]/12 px-2 py-0.5 text-[11px] font-medium text-[#5951E5]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5951E5]" />
                                ИИ
                              </div>
                            )}
                            {m.body}
                            <div className="text-[11px] text-default-400 mt-1">{fmtTime(m.createdAt)}</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-default-200 shrink-0">
              <button type="button" onClick={() => { onOpen(conv.id); onClose() }} className="w-full h-11 rounded-[10px] border border-default-200 text-[15px] text-[#1A1A1A] hover:bg-default-50">Перейти в диалог</button>
            </div>
          </section>

          {/* События пользователя */}
          <aside className="w-[340px] shrink-0 border-l border-default-200 overflow-y-auto p-5 flex flex-col gap-5">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A]">События пользователя</h3>
            <div className="flex flex-col gap-5">
              {conv.lastMessageAt && (
                <EventItem title="Последнее сообщение" time={conv.lastMessageAt} rows={[['Превью', conv.lastMessagePreview ?? '—']]} />
              )}
              <EventItem
                title="Начат чат"
                time={conv.createdAt}
                rows={[
                  ['ID диалога', conv.number],
                  ['Первое сообщение', messages[0]?.body ?? '—'],
                ]}
              />
              <EventItem
                title="Зашёл на сайт"
                time={conv.createdAt}
                rows={[
                  ['IP', conv.ip ?? '—'],
                  ['Браузер', conv.browser ?? '—'],
                  ['ОС', conv.os ?? '—'],
                  ['Устройство', deviceLabel ?? '—'],
                  ['Местоположение', geoStr ?? '—'],
                  ['Часовой пояс', conv.timezone ?? '—'],
                  ['Источник', conv.referer ?? '—'],
                ]}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const DialogsSection = ({
  conversations,
  onOpen,
  preview,
}: {
  conversations: ChatConversation[]
  onOpen: (id: string) => void
  preview?: boolean
}) => {
  const [cardId, setCardId] = useState<string | null>(null)
  const cardConv = cardId ? conversations.find(c => c.id === cardId) ?? null : null
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(conversations.filter(c => MOCK_DIALOG_META[c.id]?.selected).map(c => c.id))
  )
  const [statusById, setStatusById] = useState<Record<string, string>>(
    () => Object.fromEntries(conversations.map(c => [c.id, (preview ? MOCK_DIALOG_META[c.id]?.status : c.category) ?? DEFAULT_META.status]))
  )
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(conversations.map(c => [c.id, c.unreadForManager > 0]))
  )

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(c => convName(c).toLowerCase().includes(q))
  }, [conversations, search])

  const allChecked = list.length > 0 && list.every(c => selected.has(c.id))
  const toggle = (id: string) =>
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(list.map(c => c.id)))
  const setRead = (read: boolean) => {
    setUnreadMap(prev => {
      const n = { ...prev }
      selected.forEach(id => (n[id] = !read))
      return n
    })
    setSelected(new Set())
  }

  const ActionBtn = ({
    icon,
    label,
    onClick,
    muted,
  }: {
    icon: ReactNode
    label: string
    onClick?: () => void
    muted?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 text-[15px] transition-opacity hover:opacity-80',
        muted ? 'text-default-300' : 'text-[#1A1A1A]',
      )}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="flex-1 min-w-0 flex flex-col border-l border-default-200">
      <div className="p-4 flex items-center gap-4 border-b border-default-200">
        <button type="button" className="text-[16px] font-medium flex items-center gap-1 shrink-0">
          Все диалоги <span className="text-default-400">{list.length}</span> <IconChevron />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-default-100 rounded-[10px] px-3 h-10">
          <span className="text-default-400"><IconSearch /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по чатам"
            className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-default-400"
          />
        </div>
      </div>

      <div className="px-4 py-3 flex items-center border-b border-default-200" style={{ gap: '2.75rem' }}>
        <button type="button" onClick={toggleAll} className="flex items-center text-[15px] text-[#1A1A1A] whitespace-nowrap" style={{ gap: '0.625rem' }}>
          <IconSelectAll />
          Выбрать все {selected.size > 0 && <span className="text-default-400" style={{ marginLeft: '0.25rem' }}>{selected.size}</span>}
        </button>
        <ActionBtn icon={<IconMailUnread />} label="Не прочитано" muted onClick={() => setRead(false)} />
        <ActionBtn icon={<IconMailRead />} label="Прочитано" onClick={() => setRead(true)} />
        <ActionBtn icon={<IconUserPlus />} label="Назначить оператора" onClick={() => setSelected(new Set())} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {list.map(c => {
          // В preview — мок-метаданные; в боевом — реальные поля диалога.
          const mock = preview ? MOCK_DIALOG_META[c.id] : undefined
          const status = statusById[c.id] ?? mock?.status ?? c.category ?? 'Первичный контакт'
          const channel = mock?.channel ?? channelOf(c)
          const { resp, respKind } = mock ? { resp: mock.resp, respKind: mock.respKind } : respFromConv(c)
          return (
            <div
              key={c.id}
              className="px-4 py-3 grid items-center gap-4 border-b border-default-200 hover:bg-default-50"
              style={{ gridTemplateColumns: '24px 232px 60px minmax(0,1fr) 132px 160px' }}
            >
              <CheckBox checked={selected.has(c.id)} onChange={() => toggle(c.id)} />

              <button type="button" onClick={() => setCardId(c.id)} className="flex items-center gap-3 min-w-0 text-left">
                <Avatar name={convName(c)} />
                <div className="min-w-0">
                  <div className="text-[15px] font-medium truncate flex items-center gap-1.5">
                    {unreadMap[c.id] && <span className="w-2 h-2 rounded-full bg-default-400 shrink-0" />}
                    {convName(c)}
                  </div>
                  <div className="text-[13px] text-default-400 truncate">{c.lastMessagePreview ?? '—'}</div>
                </div>
              </button>

              <div className="flex flex-col items-center gap-1 text-default-400">
                <span className="text-[12px]">{fmtTime(c.lastMessageAt)}</span>
                <div className="flex items-center gap-1">
                  <ChannelIcon ch={channel} />
                  <IconEnter />
                </div>
              </div>

              <StatusSelect
                value={status}
                onChange={v => {
                  setStatusById(prev => ({ ...prev, [c.id]: v }))
                  if (!preview) void chatModule.updateConversationFields(c.id, { category: v })
                }}
              />

              <div className="flex items-center gap-2 text-[15px] text-[#1A1A1A] min-w-0">
                <span className="text-default-500 shrink-0"><RespIcon kind={respKind} /></span>
                <span className="truncate">{resp}</span>
              </div>

              <div className="flex items-center gap-2 text-[15px] text-[#1A1A1A] min-w-0">
                <span className="shrink-0"><ChannelIcon ch={channel} /></span>
                <span className="truncate">{CHANNEL_LABEL[channel]}</span>
              </div>
            </div>
          )
        })}
        {list.length === 0 && <div className="p-6 text-[15px] text-default-400">Диалогов нет</div>}
      </div>

      {cardConv && (
        <DialogCard conv={cardConv} preview={preview} onClose={() => setCardId(null)} onOpen={onOpen} />
      )}
    </div>
  )
}

/* ------------------------------- social --------------------------------- */

const SocialTile = ({ kind }: { kind: 'telegram' | 'max' | 'vk' }) => {
  if (kind === 'telegram')
    return (
      <span className="w-12 h-12 rounded-[12px] bg-[#29A9EB] text-white flex items-center justify-center shrink-0">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4 3 11l5 1.7L18 6 9.5 14l-.3 4 2.8-2.7 4 3z" /></svg>
      </span>
    )
  if (kind === 'vk')
    return <span className="w-12 h-12 rounded-[12px] bg-[#0077FF] text-white text-[15px] font-bold flex items-center justify-center shrink-0">VK</span>
  return <span className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#7B61FF] to-[#3D6BFF] text-white text-[20px] font-bold flex items-center justify-center shrink-0">M</span>
}

const SOCIALS: { key: 'telegram' | 'max' | 'vk'; name: string; desc: string }[] = [
  { key: 'telegram', name: 'Telegram', desc: 'Принимайте и отвечайте на сообщения из Telegram-бота.' },
  { key: 'max', name: 'MAX', desc: 'Мессенджер MAX — приём сообщений из чата сообщества.' },
  { key: 'vk', name: 'ВКонтакте', desc: 'Сообщения из сообщества ВКонтакте — прямо в чате.' },
]

// Подсказки по токену для каждой платформы (что и где взять).
const SOCIAL_HELP: Record<chatModule.SocialType, { tokenLabel: string; tokenHint: string; needGroup?: boolean }> = {
  telegram: { tokenLabel: 'Токен бота', tokenHint: 'Создайте бота у @BotFather и вставьте его токен.' },
  max: { tokenLabel: 'Токен бота', tokenHint: 'Токен бота MAX (раздел разработчика dev.max.ru).' },
  vk: { tokenLabel: 'Токен сообщества', tokenHint: 'Управление сообществом → Работа с API → Ключ доступа (с правами на сообщения).', needGroup: true },
}

const SocialSection = ({
  preview,
  projectId,
}: {
  preview?: boolean
  projectId?: string | null
}) => {
  const [connected, setConnected] = useState<Record<string, boolean>>({ vk: false, telegram: false, max: false })
  const [accountName, setAccountName] = useState<Record<string, string | undefined>>({})
  // Модалка подключения: какая платформа открыта + поля ввода + статус.
  const [modalKey, setModalKey] = useState<chatModule.SocialType | null>(null)
  const [token, setToken] = useState('')
  const [groupId, setGroupId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (preview || !projectId) return
    let alive = true
    void (async () => {
      try {
        const res = await chatModule.listIntegrations(projectId)
        if (!alive) return
        const nextOn: Record<string, boolean> = { vk: false, telegram: false, max: false }
        const nextName: Record<string, string | undefined> = {}
        res.integrations.forEach(i => { nextOn[i.type] = i.connected; nextName[i.type] = i.config?.accountName })
        setConnected(nextOn)
        setAccountName(nextName)
      } catch (e) {
        console.error('listIntegrations failed', e)
      }
    })()
    return () => { alive = false }
  }, [preview, projectId])

  const openConnect = (k: chatModule.SocialType) => {
    setModalKey(k)
    setToken('')
    setGroupId('')
    setError('')
  }

  const submitConnect = () => {
    if (!modalKey || !projectId || busy) return
    if (!token.trim()) { setError('Введите токен'); return }
    setBusy(true)
    setError('')
    void (async () => {
      try {
        const res = await chatModule.connectIntegration(projectId, modalKey, {
          token: token.trim(),
          groupId: groupId.trim() || undefined,
        })
        setConnected(p => ({ ...p, [modalKey]: res.connected }))
        setAccountName(p => ({ ...p, [modalKey]: res.config?.accountName }))
        setModalKey(null)
      } catch (e) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg || 'Не удалось подключить. Проверьте токен.')
      } finally {
        setBusy(false)
      }
    })()
  }

  const disconnect = (k: chatModule.SocialType) => {
    if (!projectId) return
    setConnected(p => ({ ...p, [k]: false }))
    setAccountName(p => ({ ...p, [k]: undefined }))
    void chatModule.disconnectIntegration(projectId, k).catch(e => {
      console.error('disconnectIntegration failed', e)
      setConnected(p => ({ ...p, [k]: true }))
    })
  }

  const help = modalKey ? SOCIAL_HELP[modalKey] : null
  const modalName = modalKey ? SOCIALS.find(s => s.key === modalKey)?.name : ''

  return (
    <div className="flex-1 min-w-0 flex flex-col border-l border-default-200 overflow-y-auto">
      <div className="p-6 flex flex-col gap-1 border-b border-default-200">
        <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Соцсети</h2>
        <p className="text-[15px] text-default-400">
          Подключите мессенджеры и соцсети, чтобы вести все диалоги в одном окне.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-3 max-w-[760px]">
        {SOCIALS.map(s => {
          const on = connected[s.key]
          return (
            <div key={s.key} className="rounded-[14px] border border-default-200 p-5 flex items-center gap-4">
              <SocialTile kind={s.key} />
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-medium text-[#1A1A1A]">{s.name}</div>
                <div className="text-[14px] text-default-400">
                  {on && accountName[s.key] ? `Подключён аккаунт: ${accountName[s.key]}` : s.desc}
                </div>
              </div>
              {on && (
                <span className="flex items-center gap-1.5 text-[14px] text-[#3BB240]">
                  <span className="w-2 h-2 rounded-full bg-[#3BB240]" /> Подключено
                </span>
              )}
              <button
                type="button"
                onClick={() => (on ? disconnect(s.key) : openConnect(s.key))}
                disabled={preview}
                className={cn(
                  'h-10 px-5 rounded-[10px] text-[15px] shrink-0 disabled:opacity-50',
                  on ? 'border border-default-200 text-[#1A1A1A]' : 'bg-primary text-white',
                )}
              >
                {on ? 'Отключить' : 'Подключить'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Модалка подключения */}
      {modalKey && help && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => !busy && setModalKey(null)}>
          <div className="w-full max-w-[460px] rounded-[16px] bg-white p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <SocialTile kind={modalKey} />
              <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Подключить {modalName}</h3>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] text-[#1A1A1A]">{help.tokenLabel}</span>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Вставьте токен"
                className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary"
              />
              <span className="text-[13px] text-default-400">{help.tokenHint}</span>
            </label>

            {help.needGroup && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-[#1A1A1A]">ID сообщества (необязательно)</span>
                <input
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  placeholder="Определится автоматически из токена"
                  className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary"
                />
              </label>
            )}

            {error && <div className="text-[14px] text-[#E5484D]">{error}</div>}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setModalKey(null)}
                disabled={busy}
                className="h-10 px-5 rounded-[10px] border border-default-200 text-[15px] text-[#1A1A1A] disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={submitConnect}
                disabled={busy}
                className="h-10 px-5 rounded-[10px] bg-primary text-white text-[15px] disabled:opacity-50"
              >
                {busy ? 'Подключение…' : 'Подключить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------------------- operators -------------------------------- */

type Operator = { id: string; name: string; email: string; role: string; online: boolean; avatar?: string; dept: string; isOwner?: boolean; widgetId?: string | null; hasLogin?: boolean; active?: boolean }

// Общий список отделов (используется и в «Отделах», и в форме оператора).
const DEPARTMENT_NAMES = ['Техническая поддержка', 'Коммерческий отдел', 'Общие вопросы']

// Загрузка оператора: текущая занятость + диалоги по дням недели.
const LOAD_WEEK = [
  { day: 'Пн', value: 12 },
  { day: 'Вт', value: 18 },
  { day: 'Ср', value: 9 },
  { day: 'Чт', value: 22 },
  { day: 'Пт', value: 15 },
  { day: 'Сб', value: 6 },
  { day: 'Вс', value: 3 },
]

const OperatorLoad = ({ week, active = 5, capacity = 8 }: { week?: { day: string; value: number }[]; active?: number; capacity?: number }) => {
  const data = week && week.length ? week : LOAD_WEEK
  const pct = capacity > 0 ? Math.min(100, Math.round((active / capacity) * 100)) : 0
  const loadColor = pct >= 80 ? '#E5484D' : pct >= 50 ? '#F5A623' : '#3BB240'
  const max = Math.max(1, ...data.map(d => d.value))

  return (
    <div className="rounded-[14px] border border-default-200 p-5 flex flex-col gap-5">
      <span className="text-[15px] text-default-500">Загрузка оператора</span>

      {/* Текущая загрузка */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-default-500">Текущая загрузка</span>
          <span className="text-[15px] font-semibold" style={{ color: loadColor }}>{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-default-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: loadColor }} />
        </div>
        <span className="text-[13px] text-default-400">{active} из {capacity} активных диалогов</span>
      </div>

      {/* Диалоги по дням недели */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-default-500">Диалогов по дням</span>
        <div className="flex items-end gap-2 h-32">
          {data.map((d, i) => (
            <div key={`${d.day}-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
              <span className="text-[12px] text-default-500">{d.value}</span>
              <div
                className="w-full rounded-t-[6px] bg-primary/80 min-h-[4px]"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {data.map((d, i) => (
            <span key={`${d.day}-${i}`} className="flex-1 text-center text-[12px] text-default-400">{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const TRANSFER_OPERATORS: { name: string; dept: string; online: boolean }[] = [
  { name: 'Анна Смирнова', dept: 'Техническая поддержка', online: true },
  { name: 'Игорь Петров', dept: 'Коммерческий отдел', online: true },
  { name: 'Мария Котова', dept: 'Общие вопросы', online: false },
]

const INITIAL_OPERATORS: Operator[] = [
  { id: 'o1', name: 'Анна Смирнова', email: 'anna@lemnity.ru', role: 'Администратор', online: true, dept: 'Техническая поддержка' },
  { id: 'o2', name: 'Игорь Петров', email: 'igor@lemnity.ru', role: 'Оператор', online: true, dept: 'Коммерческий отдел' },
  { id: 'o3', name: 'Мария Котова', email: 'maria@lemnity.ru', role: 'Оператор', online: false, dept: 'Общие вопросы' },
]

const OperatorsSection = ({
  conversations,
  onOpenDialog,
  preview,
  projectId,
}: {
  conversations: ChatConversation[]
  onOpenDialog: (id: string) => void
  preview?: boolean
  projectId?: string | null
}) => {
  const real = !preview && !!projectId
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS)
  // Карта id отдела → имя (и обратная), нужна для отображения и форм.
  const [deptList, setDeptList] = useState<{ id: string; name: string }[]>([])
  // В реальном режиме НЕ подставляем мок-отделы: если их нет — покажем «Создайте отдел».
  const deptNames = real ? deptList.map(d => d.name) : DEPARTMENT_NAMES
  const noDepts = real && deptList.length === 0
  const deptNameById = useMemo(() => Object.fromEntries(deptList.map(d => [d.id, d.name])), [deptList])
  const deptIdByName = useMemo(() => Object.fromEntries(deptList.map(d => [d.name, d.id])), [deptList])
  // Сырые операторы из бэка — чтобы знать departmentId по id оператора.
  const rawOpsRef = useRef<Record<string, chatModule.ChatOperatorItem>>({})

  const mapOp = useCallback(
    (o: chatModule.ChatOperatorItem, names: Record<string, string>): Operator => ({
      id: o.id,
      name: o.name,
      email: o.email ?? '',
      role: o.role,
      online: o.online,
      avatar: o.avatarUrl ?? undefined,
      dept: o.departmentId ? (names[o.departmentId] ?? '') : '',
      isOwner: o.isOwner,
      widgetId: o.widgetId,
      hasLogin: o.hasLogin,
      active: o.active,
    }),
    []
  )

  // Список чатов владельца (проекты с CHAT-виджетом) — опции дропдауна «Чат» оператора.
  const allProjects = useProjectsStore(s => s.projects)
  const chatOptions = useMemo(
    () =>
      preview
        ? MOCK_CHATS.map(c => ({ widgetId: c.widgetId, label: c.label }))
        : allProjects
            .filter(p => p.widgets.some(w => w.type === WidgetTypeEnum.CHAT))
            .map(p => {
              const w = p.widgets.find(x => x.type === WidgetTypeEnum.CHAT)!
              // Единое правило подписи чата (config.title → имя проекта → …), как во всех селекторах.
              return { widgetId: w.id, label: chatLabel(w, p.name) }
            }),
    [allProjects, preview]
  )
  const chatLabelById = useMemo(
    () => Object.fromEntries(chatOptions.map(c => [c.widgetId, c.label])) as Record<string, string>,
    [chatOptions]
  )

  useEffect(() => {
    if (!real || !projectId) return
    let alive = true
    void (async () => {
      try {
        const [depRes, opRes] = await Promise.all([
          chatModule.listDepartments(projectId),
          chatModule.listOperators(projectId),
        ])
        if (!alive) return
        const names = Object.fromEntries(depRes.departments.map(d => [d.id, d.name]))
        setDeptList(depRes.departments.map(d => ({ id: d.id, name: d.name })))
        rawOpsRef.current = Object.fromEntries(opRes.operators.map(o => [o.id, o]))
        setOperators(opRes.operators.map(o => mapOp(o, names)))
      } catch (e) {
        console.error('load operators/departments failed', e)
      }
    })()
    return () => { alive = false }
  }, [real, projectId, mapOp])

  const [archiveOf, setArchiveOf] = useState<Operator | null>(null)
  const [archivePeriod, setArchivePeriod] = useState('30d')
  const [adding, setAdding] = useState(false)

  // Карточка настроек оператора.
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sName, setSName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sPass, setSPass] = useState('')
  const [sActive, setSActive] = useState(true)
  const [sAvatar, setSAvatar] = useState<string | undefined>(undefined)
  const [avatarError, setAvatarError] = useState('')
  // Идёт загрузка аватара в хранилище — пока не завершится, не даём сохранить (иначе уйдёт старое/битое).
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [sMsgr, setSMsgr] = useState<'telegram' | 'vk' | 'max'>('telegram')
  const [sMsgrHandle, setSMsgrHandle] = useState('')
  const avatarRef = useRef<HTMLInputElement | null>(null)

  const openSettings = (op: Operator) => {
    setSName(op.name)
    setSEmail(op.email)
    setSPass('')
    setSActive(op.active ?? true)
    setSAvatar(op.avatar)
    setSMsgr('telegram')
    setSMsgrHandle('')
    setSettingsOpen(true)
  }
  const saveSettings = () => {
    if (!archiveOf) return
    // Аватар сохраняем только как постоянную ссылку (S3/относительную). blob:/data: — временные
    // браузерные URL, в БД бесполезны; такое значение очищаем (→ инициал), чтобы не плодить битое.
    const persistAvatar = sAvatar && /^(https?:\/\/|\/)/i.test(sAvatar) ? sAvatar : null
    const next = {
      ...archiveOf,
      name: sName.trim() || archiveOf.name,
      email: sEmail.trim(),
      avatar: persistAvatar ?? undefined,
      active: sActive,
      hasLogin: archiveOf.hasLogin || !!sPass,
    }
    setOperators(prev => prev.map(o => (o.id === archiveOf.id ? next : o)))
    setArchiveOf(next)
    setSettingsOpen(false)
    if (real && projectId) {
      void (async () => {
        try {
          const saved = await chatModule.updateOperator(projectId, next.id, {
            name: next.name,
            email: next.email,
            // Постоянная ссылка или '' (стирает битый blob на сервере). undefined не шлём, чтобы очистка сработала.
            avatarUrl: persistAvatar ?? '',
            active: sActive,
            // Учётка: email = логин; пароль обновляем только если введён новый.
            loginEmail: sEmail.trim() || undefined,
            password: sPass || undefined,
          })
          // Синхронизируем локально серверным значением (в т.ч. avatarUrl), чтобы UI = БД.
          rawOpsRef.current[saved.id] = saved
          setOperators(prev => prev.map(o => (o.id === saved.id ? mapOp(saved, deptNameById) : o)))
          setArchiveOf(prev => (prev && prev.id === saved.id ? mapOp(saved, deptNameById) : prev))
        } catch (e) {
          const resp = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message
          const msg = typeof resp === 'string' ? resp : (e as Error)?.message ?? 'неизвестная ошибка'
          console.error('updateOperator failed', e)
          alert('Не удалось сохранить оператора: ' + msg)
        }
      })()
    }
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState('Оператор')
  const [dept, setDept] = useState(DEPARTMENT_NAMES[0])
  // '' = все чаты владельца; иначе widgetId конкретного чата.
  const [chatSel, setChatSel] = useState('')
  const [addError, setAddError] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
    setPass('')
    setShowPass(false)
    setRole('Оператор')
    setDept(deptNames[0] ?? '')
    setChatSel('')
    setAdding(false)
  }
  const add = () => {
    if (!name.trim()) return
    if (pass && !email.trim()) {
      setAddError('Для входа оператора укажите email')
      return
    }
    if (real && projectId) {
      const departmentId = deptIdByName[dept] ?? null
      const loginEmail = email.trim() || undefined
      void (async () => {
        try {
          setAddError('')
          const created = await chatModule.createOperator(projectId, {
            name: name.trim(),
            email: loginEmail,
            role,
            departmentId,
            widgetId: chatSel || null,
            // Логин оператора = email; пароль — если задан владельцем.
            loginEmail: pass ? loginEmail : undefined,
            password: pass || undefined,
          })
          rawOpsRef.current[created.id] = created
          setOperators(prev => [...prev, mapOp(created, deptNameById)])
          reset()
        } catch (e) {
          const msg =
            (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Не удалось добавить оператора'
          setAddError(typeof msg === 'string' ? msg : 'Не удалось добавить оператора')
        }
      })()
      return
    }
    setOperators(prev => [
      ...prev,
      { id: `op-${prev.length}-${name.length}-${Date.now()}`, name: name.trim(), email: email.trim(), role, online: false, dept, widgetId: chatSel || null, hasLogin: !!pass, active: true },
    ])
    reset()
  }
  const remove = (id: string) => {
    setOperators(prev => prev.filter(o => o.id !== id))
    if (real && projectId) {
      void (async () => {
        try {
          await chatModule.deleteOperator(projectId, id)
        } catch (e) {
          console.error('deleteOperator failed', e)
        }
      })()
    }
  }

  // Реальная статистика выбранного оператора — из назначенных ему диалогов.
  const assignedToArchive = useMemo(
    () => (archiveOf ? conversations.filter(c => c.assignedOperatorId === archiveOf.id) : []),
    [conversations, archiveOf]
  )
  const archiveStats = useMemo(() => {
    const open = assignedToArchive.filter(c => c.status === 'open').length
    const closed = assignedToArchive.filter(c => c.status === 'closed').length
    return { open, closed, total: assignedToArchive.length }
  }, [assignedToArchive])
  const weeklyLoad = useMemo(() => {
    const labels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const out: { day: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(d.getDate() + 1)
      const value = assignedToArchive.filter(c => {
        const t = new Date(c.lastMessageAt ?? c.createdAt)
        return t >= d && t < next
      }).length
      out.push({ day: labels[d.getDay()], value })
    }
    return out
  }, [assignedToArchive])
  // Среднее время ответа — считаем по сообщениям назначенных диалогов (visitor → следующий manager).
  const [avgRespSec, setAvgRespSec] = useState<number | null>(null)
  useEffect(() => {
    if (!archiveOf || !real) {
      setAvgRespSec(null)
      return
    }
    let alive = true
    void (async () => {
      try {
        const gaps: number[] = []
        for (const c of assignedToArchive.slice(0, 15)) {
          const { messages } = await chatsService.getConversationMessages(c.id)
          for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender === 'visitor') {
              const reply = messages.slice(i + 1).find(m => m.sender === 'manager')
              if (reply) {
                gaps.push((new Date(reply.createdAt).getTime() - new Date(messages[i].createdAt).getTime()) / 1000)
                break
              }
            }
          }
        }
        if (!alive) return
        setAvgRespSec(gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null)
      } catch {
        if (alive) setAvgRespSec(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [archiveOf, real, assignedToArchive])

  // Экран архива оператора со статистикой.
  if (archiveOf) {
    const op = archiveOf
    const fmtDur = (s: number) => (s < 60 ? `${s} сек` : `${Math.floor(s / 60)} мин ${s % 60} сек`)
    // Качество: ≤0 c — отлично (1), ≥5 мин — плохо (0).
    const quality = avgRespSec == null ? null : Math.max(0, Math.min(1, 1 - avgRespSec / 300))
    const stat = (label: string, value: string) => (
      <div className="rounded-[14px] border border-default-200 p-4 flex flex-col gap-1">
        <span className="text-[14px] text-default-400">{label}</span>
        <span className="text-[20px] font-semibold text-[#1A1A1A]">{value}</span>
      </div>
    )
    return (
      <div className="flex-1 min-w-0 flex flex-col border-l border-default-200 overflow-y-auto">
        <div className="p-4 border-b border-default-200">
          <button type="button" onClick={() => setArchiveOf(null)} className="flex items-center gap-2.5 rounded-[12px] bg-default-100 px-3 py-2.5 text-[15px] text-[#6E6E76]">
            <Ic d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M13 8l-4 4 4 4" size={18} /> Операторы
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-w-[860px]">
          {/* Карточка оператора */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={op.name} size={56} url={op.avatar} />
              <span className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white', op.online ? 'bg-[#3BD16F]' : 'bg-default-300')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[20px] font-semibold text-[#1A1A1A] truncate">{op.name}</span>
                <button
                  type="button"
                  onClick={() => openSettings(op)}
                  className="shrink-0 flex items-center gap-1.5 text-[14px] text-primary hover:opacity-80"
                >
                  <Ic d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 5 13.6a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 1.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 8.4h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" size={16} />
                  Настройки
                </button>
              </div>
              <div className="text-[15px] text-default-400">{op.role} · {op.email || '—'}</div>
            </div>
            <span className={cn('flex items-center gap-1.5 text-[14px]', op.online ? 'text-[#3BB240]' : 'text-default-400')}>
              <span className={cn('w-2 h-2 rounded-full', op.online ? 'bg-[#3BB240]' : 'bg-default-300')} />
              {op.online ? 'Онлайн' : 'Офлайн'}
            </span>
          </div>

          {/* Статистика (реальная, по назначенным диалогам) */}
          <div className="grid grid-cols-3 gap-3">
            {stat('Активных диалогов', String(archiveStats.open))}
            {stat('Решено диалогов', String(archiveStats.closed))}
            {stat('Всего диалогов', String(archiveStats.total))}
          </div>

          {/* Среднее время ответа — шкала плохо → отлично */}
          <div className="rounded-[14px] border border-default-200 p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-default-500">Среднее время ответа</span>
              <span className="text-[18px] font-semibold text-[#1A1A1A]">{avgRespSec == null ? '—' : fmtDur(avgRespSec)}</span>
            </div>
            {/* Указатель над шкалой (только если есть данные) */}
            <div className="relative h-6">
              {quality != null && (
                <div
                  className="absolute flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${quality * 100}%` }}
                >
                  <span className="text-[12px] font-medium text-[#1A1A1A] whitespace-nowrap">{avgRespSec != null ? fmtDur(avgRespSec) : ''}</span>
                  <svg width="14" height="9" viewBox="0 0 14 9" className="text-[#1A1A1A]"><path d="M7 9 0 0h14z" fill="currentColor" /></svg>
                </div>
              )}
            </div>
            <div className="h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg,#E5484D 0%,#F5A623 50%,#3BD16F 100%)' }} />
            <div className="flex items-center justify-between text-[13px] text-default-400">
              <span>плохо{quality == null ? ' · нет данных' : ''}</span>
              <span>отлично</span>
            </div>
          </div>

          {/* Загрузка оператора */}
          <OperatorLoad week={weeklyLoad} active={archiveStats.open} />

          {/* Архив диалогов */}
          <div className="flex items-center justify-between mt-1">
            <h3 className="text-[16px] font-medium text-[#1A1A1A]">Архив диалогов</h3>
            <div className="relative">
              <select
                value={archivePeriod}
                onChange={e => setArchivePeriod(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 rounded-[10px] border border-default-200 text-[14px] outline-none bg-white cursor-pointer"
              >
                <option value="7d">За 7 дней</option>
                <option value="30d">За 30 дней</option>
                <option value="90d">За 90 дней</option>
                <option value="all">За всё время</option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400"><IconChevron /></span>
            </div>
          </div>
          <div className="rounded-[14px] border border-default-200 overflow-hidden">
            {conversations.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpenDialog(c.id)}
                className={cn('w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-default-50', i !== conversations.length - 1 && 'border-b border-default-200')}
              >
                <Avatar name={convName(c)} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium truncate">{convName(c)}</div>
                  <div className="text-[13px] text-default-400 truncate">{c.lastMessagePreview ?? '—'}</div>
                </div>
                <span className="text-[12px] text-default-400 shrink-0">{fmtTime(c.lastMessageAt)}</span>
              </button>
            ))}
            {conversations.length === 0 && <div className="p-6 text-[15px] text-default-400">Диалогов нет</div>}
          </div>
        </div>

        {/* Карточка настроек оператора */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSettingsOpen(false)}>
            <div className="w-[460px] max-w-full bg-white rounded-[16px] shadow-xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Настройки оператора</h3>
                <button type="button" onClick={() => setSettingsOpen(false)} className="text-default-400 hover:text-[#1A1A1A]">✕</button>
              </div>

              {/* Аватар */}
              <div className="flex items-center gap-4">
                <Avatar name={sName || op.name} size={64} url={sAvatar} />
                <div className="flex flex-col gap-1">
                  <button type="button" disabled={avatarUploading} onClick={() => avatarRef.current?.click()} className="h-9 px-4 rounded-[10px] border border-default-200 text-[14px] disabled:opacity-50">
                    {avatarUploading ? 'Загрузка…' : 'Загрузить аватар'}
                  </button>
                  {avatarError && <span className="text-[12px] text-[#E5484D]">{avatarError}</span>}
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  if (f.size > MAX_IMAGE_BYTES) {
                    setAvatarError(IMAGE_TOO_LARGE_MESSAGE)
                    return
                  }
                  setAvatarError('')
                  // Грузим в персональное хранилище → постоянный URL (не data-URL/blob в БД).
                  setAvatarUploading(true)
                  uploadImage(f)
                    .then(({ url }) => setSAvatar(url))
                    .catch(() => setAvatarError('Не удалось загрузить. ' + IMAGE_TOO_LARGE_MESSAGE))
                    .finally(() => setAvatarUploading(false))
                }} />
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-default-500">Имя</span>
                <input value={sName} onChange={e => setSName(e.target.value)} className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-default-500">Email</span>
                <input value={sEmail} onChange={e => setSEmail(e.target.value)} type="email" className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] text-default-500">Пароль</span>
                <input value={sPass} onChange={e => setSPass(e.target.value)} type="password" placeholder="Новый пароль" className="h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
              </label>

              <label className="flex items-center justify-between gap-3">
                <span className="text-[14px] text-default-500">Доступ активен <span className="text-default-400">(может входить)</span></span>
                <input type="checkbox" checked={sActive} onChange={e => setSActive(e.target.checked)} className="w-5 h-5 accent-[#5951E5]" />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[14px] text-default-500">Мессенджер для уведомлений</span>
                <div className="flex gap-2">
                  <select value={sMsgr} onChange={e => setSMsgr(e.target.value as 'telegram' | 'vk' | 'max')} className="w-[140px] shrink-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none bg-white">
                    <option value="telegram">Telegram</option>
                    <option value="vk">ВКонтакте</option>
                    <option value="max">MAX</option>
                  </select>
                  <input value={sMsgrHandle} onChange={e => setSMsgrHandle(e.target.value)} placeholder="@username или ссылка" className="flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-1">
                <button type="button" onClick={() => setSettingsOpen(false)} className="h-10 px-4 rounded-[10px] border border-default-200 text-[15px]">Отмена</button>
                <button type="button" onClick={saveSettings} disabled={avatarUploading} className="h-10 px-5 rounded-[10px] bg-primary text-white text-[15px] disabled:opacity-50">
                  {avatarUploading ? 'Загрузка фото…' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col border-l border-default-200 overflow-y-auto">
      <div className="p-6 flex items-center justify-between border-b border-default-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Операторы</h2>
          <p className="text-[15px] text-default-400">{operators.length} в команде</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(v => !v)}
          className="h-10 px-5 rounded-[10px] bg-primary text-white text-[15px] flex items-center gap-2"
        >
          <IconUserPlus /> Добавить оператора
        </button>
      </div>

      <div className="p-6 flex flex-col gap-3 w-full">
        {adding && (
          <div className="rounded-[14px] border border-default-200 p-4 flex flex-wrap items-center gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя оператора" className="flex-1 min-w-[160px] h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email (логин)" className="flex-1 min-w-[160px] h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
            <div className="relative flex-1 min-w-[150px]">
              <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Пароль для входа" className="w-full h-11 pl-3 pr-10 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                title={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-default-400 hover:text-default-600"
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M6.1 6.1A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.9-2.1" />
                    <path d="M2 2l20 20" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-[150px] shrink-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none bg-white">
              <option>Оператор</option>
              <option>Администратор</option>
            </select>
            {noDepts ? (
              <span className="w-[170px] shrink-0 h-11 px-3 rounded-[10px] border border-dashed border-default-300 text-[14px] text-default-400 flex items-center">
                Создайте отдел
              </span>
            ) : (
              <select value={dept} onChange={e => setDept(e.target.value)} className="w-[170px] shrink-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none bg-white">
                {deptNames.map(d => <option key={d}>{d}</option>)}
              </select>
            )}
            <select
              value={chatSel}
              onChange={e => setChatSel(e.target.value)}
              title="Чат, к которому ограничен оператор"
              className="w-[170px] shrink-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none bg-white"
            >
              <option value="">Все чаты</option>
              {chatOptions.map(c => <option key={c.widgetId} value={c.widgetId}>{c.label}</option>)}
            </select>
            <button type="button" onClick={reset} className="shrink-0 h-11 px-4 rounded-[10px] border border-default-200 text-[15px]">Отмена</button>
            <button type="button" onClick={add} disabled={!name.trim()} className="shrink-0 h-11 px-5 rounded-[10px] bg-primary text-white text-[15px] disabled:opacity-50">Добавить</button>
            <div className="w-full basis-full flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {addError && <span className="text-[13px] text-[#E5484D]">{addError}</span>}
                <span className="text-[12px] text-default-400">Пароль задаёт вход оператора. Без пароля — обычная запись без входа.</span>
              </div>
              <span className="text-[12px] text-default-400">
                Ссылка для входа операторов:{' '}
                <a
                  href="https://app.lemnity.ru/operator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  app.lemnity.ru/operator
                </a>
              </span>
            </div>
          </div>
        )}

        {operators.map(o => (
          <div
            key={o.id}
            onClick={() => setArchiveOf(o)}
            className="rounded-[14px] border border-default-200 p-4 flex items-center gap-4 cursor-pointer hover:bg-default-50 transition-colors"
          >
            <div className="relative">
              <Avatar name={o.name} url={o.avatar} />
              <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', o.online ? 'bg-[#3BD16F]' : 'bg-default-300')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-medium text-[#1A1A1A] truncate flex items-center gap-2">
                {o.name}
                {o.hasLogin && !o.isOwner && (
                  <span className="text-[11px] text-primary border border-primary/40 rounded-[6px] px-1.5 py-0.5 shrink-0" title="Есть вход в модуль">вход</span>
                )}
                {o.active === false && (
                  <span className="text-[11px] text-[#E5484D] border border-[#E5484D]/40 rounded-[6px] px-1.5 py-0.5 shrink-0">отключён</span>
                )}
              </div>
              <div className="text-[14px] text-default-400 truncate">{o.email || '—'}</div>
            </div>
            <span className="text-[14px] text-default-500 flex-1 min-w-0 truncate">{o.dept}</span>
            <span className="text-[14px] text-default-500 w-[150px] shrink-0 truncate" title="Доступный чат">
              {o.isOwner ? 'Все чаты' : o.widgetId ? (chatLabelById[o.widgetId] ?? 'Чат') : 'Все чаты'}
            </span>
            <span className="text-[14px] text-default-500 w-[120px] shrink-0">{o.role}</span>
            <span className="text-[14px] text-default-400 w-[80px] shrink-0">{o.online ? 'Онлайн' : 'Офлайн'}</span>
            {o.isOwner ? (
              <span className="w-9 h-9 shrink-0" />
            ) : (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  remove(o.id)
                }}
                aria-label="Удалить"
                className="w-9 h-9 shrink-0 rounded-[8px] border border-default-200 text-default-400 hover:text-[#E5484D] hover:border-[#E5484D] transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------- departments ------------------------------- */

type Department = { id: string; name: string; desc: string; members: { name: string; online: boolean }[] }

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Техническая поддержка', desc: 'Помощь по работе и настройке', members: [
    { name: 'Анна Смирнова', online: true },
    { name: 'Игорь Петров', online: true },
    { name: 'Мария Котова', online: false },
  ] },
  { id: 'd2', name: 'Коммерческий отдел', desc: 'Продажи, тарифы, оплата', members: [
    { name: 'Игорь Петров', online: true },
    { name: 'Анна Смирнова', online: true },
  ] },
  { id: 'd3', name: 'Общие вопросы', desc: 'Прочие обращения', members: [
    { name: 'Мария Котова', online: false },
  ] },
]

const DepartmentsSection = ({
  preview,
  projectId,
}: {
  preview?: boolean
  projectId?: string | null
}) => {
  const real = !preview && !!projectId
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS)
  const [adding, setAdding] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const mapDept = useCallback(
    (d: chatModule.ChatDepartmentItem): Department => ({
      id: d.id,
      name: d.name,
      desc: d.description ?? '',
      members: d.operators.map(o => ({ name: o.name, online: o.online })),
    }),
    []
  )

  useEffect(() => {
    if (!real || !projectId) return
    let alive = true
    void (async () => {
      try {
        const res = await chatModule.listDepartments(projectId)
        if (!alive) return
        setDepartments(res.departments.map(mapDept))
      } catch (e) {
        console.error('listDepartments failed', e)
      }
    })()
    return () => { alive = false }
  }, [real, projectId, mapDept])

  const reset = () => {
    setName('')
    setDesc('')
    setAdding(false)
  }
  const add = () => {
    if (!name.trim()) return
    if (real && projectId) {
      const dtoName = name.trim()
      const dtoDesc = desc.trim()
      void (async () => {
        try {
          const created = await chatModule.createDepartment(projectId, { name: dtoName, description: dtoDesc || undefined })
          setDepartments(prev => [...prev, mapDept(created)])
        } catch (e) {
          console.error('createDepartment failed', e)
        }
      })()
      reset()
      return
    }
    setDepartments(prev => [
      ...prev,
      { id: `dep-${prev.length}-${Date.now()}`, name: name.trim(), desc: desc.trim(), members: [] },
    ])
    reset()
  }
  const remove = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
    if (real && projectId) {
      void (async () => {
        try {
          await chatModule.deleteDepartment(projectId, id)
        } catch (e) {
          console.error('deleteDepartment failed', e)
        }
      })()
    }
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col border-l border-default-200 overflow-y-auto">
      <div className="p-6 flex items-center justify-between border-b border-default-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Отделы</h2>
          <p className="text-[15px] text-default-400">Группы, по которым распределяются чаты</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(v => !v)}
          className="h-10 px-5 rounded-[10px] bg-primary text-white text-[15px] flex items-center gap-2"
        >
          + Добавить отдел
        </button>
      </div>

      <div className="p-6 flex flex-col gap-3 max-w-[760px]">
        {adding && (
          <div className="rounded-[14px] border border-default-200 p-4 flex items-center gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Название отдела" className="flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание" className="flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-default-200 text-[15px] outline-none focus:border-primary" />
            <button type="button" onClick={reset} className="shrink-0 h-11 px-4 rounded-[10px] border border-default-200 text-[15px]">Отмена</button>
            <button type="button" onClick={add} disabled={!name.trim()} className="shrink-0 h-11 px-5 rounded-[10px] bg-primary text-white text-[15px] disabled:opacity-50">Добавить</button>
          </div>
        )}

        {departments.map(d => {
          const open = expandedId === d.id
          return (
            <div key={d.id} className="rounded-[14px] border border-default-200 overflow-hidden">
              <div
                onClick={() => setExpandedId(open ? null : d.id)}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-default-50 transition-colors"
              >
                <span className="w-11 h-11 shrink-0 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center"><IconUsers /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-medium text-[#1A1A1A] truncate">{d.name}</div>
                  <div className="text-[14px] text-default-400 truncate">{d.desc || '—'}</div>
                </div>
                <span className="text-[14px] text-default-400 w-[120px] shrink-0">{d.members.length} операторов</span>
                <span className={cn('text-default-400 transition-transform', open && 'rotate-180')}><IconChevron /></span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); remove(d.id) }}
                  aria-label="Удалить"
                  className="w-9 h-9 shrink-0 rounded-[8px] border border-default-200 text-default-400 hover:text-[#E5484D] hover:border-[#E5484D] transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {open && (
                <div className="border-t border-default-200 px-4 py-2">
                  {d.members.length === 0 && <div className="py-2 text-[14px] text-default-400">В отделе пока нет операторов</div>}
                  {d.members.map(m => (
                    <div key={m.name} className="py-2 flex items-center gap-3">
                      <Avatar name={m.name} size={32} />
                      <span className="flex-1 text-[15px] text-[#1A1A1A] truncate">{m.name}</span>
                      <span className="flex items-center gap-1.5 text-[13px] text-default-400">
                        <span className={cn('w-2 h-2 rounded-full', m.online ? 'bg-[#3BD16F]' : 'bg-default-300')} />
                        {m.online ? 'Онлайн' : 'Офлайн'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* --------------------- групповой чат: архив вложений -------------------- */

// Архив вложений общего чата операторов — собирается из реальных сообщений группы.
const GroupInfoPanel = ({ messages }: { messages: GroupMsg[] }) => {
  const [tab, setTab] = useState<'photos' | 'media' | 'docs'>('photos')
  const atts = useMemo(() => messages.filter(m => m.attachmentUrl), [messages])
  const photos = useMemo(() => atts.filter(m => m.attachmentType === 'image'), [atts])
  const media = useMemo(() => atts.filter(m => m.attachmentType === 'video'), [atts])
  const docs = useMemo(
    () => atts.filter(m => m.attachmentType !== 'image' && m.attachmentType !== 'video'),
    [atts]
  )
  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: 'photos', label: 'Фото', count: photos.length },
    { key: 'media', label: 'Медиа', count: media.length },
    { key: 'docs', label: 'Документы', count: docs.length },
  ]
  return (
    <aside className="w-[340px] shrink-0 border-l border-default-200 p-5 flex flex-col gap-4 overflow-y-auto">
      <span className="text-[18px] font-medium">Информация:</span>
      <p className="text-[14px] text-default-400">Архив вложений общего чата операторов</p>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 h-9 rounded-[10px] text-[14px] transition-colors',
              tab === t.key ? 'bg-primary text-white' : 'bg-default-100 text-[#3D3D3B] hover:bg-default-200',
            )}
          >
            {t.label} {t.count}
          </button>
        ))}
      </div>

      {tab === 'photos' && (
        photos.length ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(m => (
              <a
                key={m.id}
                href={m.attachmentUrl!}
                target="_blank"
                rel="noreferrer"
                className="aspect-square rounded-[10px] overflow-hidden bg-default-100"
              >
                <img src={m.attachmentUrl!} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-default-400">Фото пока нет</p>
        )
      )}

      {tab === 'media' && (
        media.length ? (
          <div className="grid grid-cols-2 gap-2">
            {media.map(m => (
              <video
                key={m.id}
                src={m.attachmentUrl!}
                controls
                className="aspect-video rounded-[10px] bg-black/80 object-cover"
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-default-400">Видео пока нет</p>
        )
      )}

      {tab === 'docs' && (
        docs.length ? (
          <div className="flex flex-col gap-2">
            {docs.map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-[10px] border border-default-200 p-3">
                <span className="w-9 h-9 shrink-0 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center">
                  <Ic d="M7 3h7l4 4v14H7z|M14 3v4h4" size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-[#1A1A1A] truncate">{m.attachmentName ?? 'Файл'}</div>
                  <div className="text-[12px] text-default-400">{fmtFull(m.createdAt)}</div>
                </div>
                <a
                  href={m.attachmentUrl!}
                  target="_blank"
                  rel="noreferrer"
                  download
                  aria-label="Скачать"
                  className="text-default-400 hover:text-primary"
                >
                  <Ic d="M12 4v10M8 11l4 4 4-4M5 20h14" size={18} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-default-400">Документов пока нет</p>
        )
      )}
    </aside>
  )
}

/* ------------------------ автораспределение ----------------------------- */

const AutoDistributionPanel = ({
  preview,
  projectId,
}: {
  preview?: boolean
  projectId?: string | null
}) => {
  const real = !preview && !!projectId
  const [enabled, setEnabled] = useState(false)
  const [method, setMethod] = useState<'common' | 'balanced'>('common')
  const [how, setHow] = useState<'queue' | 'load'>('queue')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  // Список операторов для чеклиста: реальные в real-режиме, иначе мок.
  const [ops, setOps] = useState<{ id: string; name: string; dept: string; online: boolean }[]>(
    INITIAL_OPERATORS.map(o => ({ id: o.id, name: o.name, dept: o.dept, online: o.online }))
  )

  useEffect(() => {
    if (!real || !projectId) return
    let alive = true
    void (async () => {
      try {
        const [dist, opRes] = await Promise.all([
          chatModule.getDistribution(projectId),
          chatModule.listOperators(projectId),
        ])
        if (!alive) return
        setEnabled(dist.enabled)
        setMethod(dist.method)
        setHow(dist.how)
        setSelected(new Set(dist.operatorIds))
        setOps(opRes.operators.map(o => ({ id: o.id, name: o.name, dept: '', online: o.online })))
      } catch (e) {
        console.error('getDistribution failed', e)
      }
    })()
    return () => { alive = false }
  }, [real, projectId])

  const toggleOp = (id: string) => {
    setSaved(false)
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  // Кого реально задействуем в распределении (из выбранных).
  const activeNames = ops.filter(o => selected.has(o.id)).map(o => o.name)
  const canSave = !enabled || selected.size > 0

  const handleSave = () => {
    setSaved(true)
    if (real && projectId) {
      void (async () => {
        try {
          await chatModule.saveDistribution(projectId, { enabled, method, how, operatorIds: [...selected] })
        } catch (e) {
          console.error('saveDistribution failed', e)
          setSaved(false)
        }
      })()
    }
  }

  const Check = ({ on }: { on: boolean }) => (
    <span className={cn('w-6 h-6 shrink-0 rounded-[6px] border flex items-center justify-center', on ? 'bg-primary border-primary' : 'bg-white border-default-300')}>
      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>}
    </span>
  )
  const Radio = ({ on }: { on: boolean }) => (
    <span className={cn('w-5 h-5 shrink-0 rounded-full border flex items-center justify-center mt-0.5', on ? 'border-primary' : 'border-default-300')}>
      {on && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </span>
  )

  const methods = [
    { key: 'common' as const, title: 'Общий', icon: 'M6 20V8a3 3 0 0 1 3-3h6|M9 5 6 8 3 5|M14 5h6v6|M20 5l-9 9', desc: 'Уведомление о новом диалоге поступит всем выбранным операторам. Оператор берёт диалог сам.' },
    { key: 'balanced' as const, title: 'Сбалансированный', icon: 'M4 7h4l9 10h4|M4 17h4l3-3.5|M14 7h6m0 0v6m0-6L4 17', desc: 'Диалог автоматически назначается оператору по выбранному алгоритму. Возможно назначение вручную.' },
  ]

  return (
    <div className="w-full max-w-[820px] mx-auto px-6 py-6 flex flex-col gap-6">
      {/* Тумблер */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setEnabled(v => !v); setSaved(false) }}
            className={cn('w-11 h-6 rounded-full relative transition-colors shrink-0', enabled ? 'bg-primary' : 'bg-default-300')}
          >
            <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', enabled ? 'left-[22px]' : 'left-0.5')} />
          </button>
          <span className="text-[20px] font-semibold text-[#1A1A1A]">Автораспределение диалогов</span>
        </div>
        <p className="text-[15px] text-default-400">
          Поможет увеличить скорость ответа от оператора и решит вопрос конкуренции за диалоги.
        </p>
      </div>

      <hr className="border-default-200" />

      <div className={cn('flex flex-col gap-6 transition-opacity', !enabled && 'opacity-50 pointer-events-none select-none')}>
        {/* Метод распределения */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Метод распределения</h3>
          <div className="grid grid-cols-2 gap-3">
            {methods.map(m => {
              const on = method === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => { setMethod(m.key); setSaved(false) }}
                  className={cn('rounded-[14px] border p-5 text-left flex flex-col gap-2 transition-colors', on ? 'border-[#3BB240]' : 'border-default-200 hover:border-default-300')}
                >
                  <div className={cn('flex items-center gap-2 text-[17px] font-semibold', on ? 'text-[#3BB240]' : 'text-[#1A1A1A]')}>
                    <Ic d={m.icon} size={20} /> {m.title}
                  </div>
                  <p className={cn('text-[14px]', on ? 'text-[#3BB240]' : 'text-default-400')}>{m.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* На кого распределяются — чекбоксы операторов */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold text-[#1A1A1A]">На кого распределяются диалоги</h3>
          <p className="text-[15px] text-default-400">
            Отметьте операторов, которые участвуют в распределении. Новые неразобранные диалоги
            будут поступать только им.
          </p>
          {selected.size === 0 && (
            <p className="text-[15px] text-[#E5484D]">Пока не выбран ни один оператор для распределения диалогов</p>
          )}
          <div className="rounded-[12px] border border-default-200 overflow-hidden mt-1">
            {ops.map((o, i) => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleOp(o.id)}
                className={cn('w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-default-50', i !== ops.length - 1 && 'border-b border-default-200')}
              >
                <Check on={selected.has(o.id)} />
                <Avatar name={o.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-[#1A1A1A] truncate">{o.name}</div>
                  <div className="text-[13px] text-default-400 truncate">{o.dept}</div>
                </div>
                <span className="flex items-center gap-1.5 text-[13px] text-default-400 shrink-0">
                  <span className={cn('w-2 h-2 rounded-full', o.online ? 'bg-[#3BD16F]' : 'bg-default-300')} />
                  {o.online ? 'Онлайн' : 'Офлайн'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Как распределять — только для сбалансированного */}
        {method === 'balanced' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Как распределять?</h3>
            <button type="button" onClick={() => { setHow('queue'); setSaved(false) }} className="flex items-start gap-3 text-left">
              <Radio on={how === 'queue'} />
              <span>
                <span className="text-[16px] text-[#1A1A1A]">По очереди</span>
                <span className="block text-[14px] text-default-400">Диалоги назначаются поочерёдно каждому выбранному оператору (round-robin)</span>
              </span>
            </button>
            <button type="button" onClick={() => { setHow('load'); setSaved(false) }} className="flex items-start gap-3 text-left">
              <Radio on={how === 'load'} />
              <span>
                <span className="text-[16px] text-[#1A1A1A]">В зависимости от нагрузки</span>
                <span className="block text-[14px] text-default-400">Каждый новый диалог попадает к оператору с наименьшим числом открытых диалогов</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Итог настройки */}
      {enabled && (
        <div className="rounded-[12px] bg-default-50 border border-default-200 p-4 text-[14px] text-default-500">
          {selected.size === 0
            ? 'Выберите хотя бы одного оператора, чтобы включить распределение.'
            : method === 'common'
              ? `Новые диалоги уведомляют ${activeNames.length} оператор(ов): ${activeNames.join(', ')}. Оператор берёт диалог сам.`
              : `Новые диалоги авто-назначаются ${how === 'queue' ? 'по очереди' : 'наименее загруженному'} среди: ${activeNames.join(', ')}.`}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="h-12 px-6 rounded-[10px] bg-primary text-white text-[16px] self-start disabled:opacity-50"
        >
          Сохранить настройки
        </button>
        {saved && <span className="text-[14px] text-[#3BB240]">Сохранено</span>}
      </div>
    </div>
  )
}

/* ----------------------------- settings --------------------------------- */

const SETTINGS_WIDGET_ID = 'chat-module-settings'

/* ----------------------------- assistant -------------------------------- */

const ASSISTANT_ACCENT = '!bg-[#5951E5]'

// Раздел «Ассистент»: включение ИИ-агента и статистика остатка месячной квоты сообщений.
// Имя агента и разделы для изучения настраиваются в блоке «Аи агент» (Настройки).
const AssistantSection = ({
  preview,
  projectId
}: {
  preview?: boolean
  projectId?: string | null
}) => {
  const projects = useProjectsStore(s => s.projects)
  const saveWidgetConfig = useProjectsStore(s => s.saveWidgetConfig)
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)
  const liveSettings = useWidgetSettingsStore(s => s.settings)

  // Чаты пользователя (один CHAT-виджет на проект); дропдаун выбирает, какой чат настраиваем.
  const chats = useMemo(
    () =>
      preview
        ? MOCK_CHATS.map(c => ({ projectId: c.projectId, widget: undefined, label: c.label }))
        : projects
            .filter(p => p.widgets.some(w => w.type === WidgetTypeEnum.CHAT))
            .map(p => {
              const widget = p.widgets.find(w => w.type === WidgetTypeEnum.CHAT)
              return { projectId: p.id, widget, label: chatLabel(widget, p.name) }
            }),
    [projects, preview]
  )

  const [chatSel, setChatSel] = useState<string | null>(null)
  useEffect(() => {
    if (chatSel && chats.some(c => c.projectId === chatSel)) return
    setChatSel(chats.find(c => c.projectId === projectId)?.projectId ?? chats[0]?.projectId ?? null)
  }, [chats, projectId, chatSel])

  const realWidget = useMemo(
    () => chats.find(c => c.projectId === chatSel)?.widget,
    [chats, chatSel]
  )

  // Инициализация общего стора настроек выбранным чатом (как в SettingsSection) — чтобы тумблер
  // писал в тот же config, что и блок «Аи агент».
  const baselineRef = useRef<string>('')
  const markClean = useCallback(() => {
    baselineRef.current = JSON.stringify(useWidgetSettingsStore.getState().settings?.widget ?? null)
  }, [])
  const appliedRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const s = useWidgetSettingsStore.getState()
    if (!preview && realWidget && chatSel) {
      const sig = `${realWidget.id}:${JSON.stringify(realWidget.config ?? null)}`
      if (appliedRef.current !== sig) {
        s.init(
          realWidget.id,
          WidgetTypeEnum.CHAT,
          chatSel,
          realWidget.config as Partial<WidgetSettings> | undefined
        )
        appliedRef.current = sig
      }
    } else if ((preview || !realWidget) && s.settings?.id !== SETTINGS_WIDGET_ID) {
      s.init(SETTINGS_WIDGET_ID, WidgetTypeEnum.CHAT, 'chat-module')
      appliedRef.current = null
    }
    markClean()
    setReady(true)
  }, [preview, realWidget, chatSel, markClean])

  const widgetCfg = liveSettings?.widget as ChatWidgetType | undefined
  const enabled = widgetCfg?.aiAgentEnabled ?? false
  const agentName = widgetCfg?.aiAgentName?.trim() || 'Лемми'
  const dirty = ready && JSON.stringify(liveSettings?.widget ?? null) !== baselineRef.current
  const [showSettings, setShowSettings] = useState(false)

  const [saving, setSaving] = useState(false)
  const handleSave = useCallback(async () => {
    const s = useWidgetSettingsStore.getState()
    const res = s.prepareForSave()
    if (!res.ok) {
      alert('Исправьте ошибки перед сохранением')
      return
    }
    if (preview) {
      alert('В превью сохранение недоступно — проверьте в кабинете')
      return
    }
    if (!realWidget || !chatSel) return
    setSaving(true)
    try {
      const updated = await saveWidgetConfig(chatSel, realWidget.id, res.data)
      useWidgetSettingsStore.getState().clearPersistedDraft(realWidget.id)
      const base =
        useWidgetSettingsStore.getState().settings ?? buildDefaults(realWidget.id, WidgetTypeEnum.CHAT)
      const next = updated?.config ? ({ ...base, ...updated.config } as typeof base) : undefined
      useWidgetSettingsStore.getState().init(realWidget.id, WidgetTypeEnum.CHAT, chatSel, next)
      appliedRef.current = `${realWidget.id}:${JSON.stringify(updated?.config ?? null)}`
      markClean()
      alert('Сохранено')
    } catch (e) {
      console.error('save assistant failed', e)
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }, [preview, realWidget, chatSel, saveWidgetConfig, markClean])

  // Статистика месячной квоты ИИ.
  const [usage, setUsage] = useState<chatModule.AiUsage | null>(null)
  const [usageErr, setUsageErr] = useState(false)
  useEffect(() => {
    setUsage(null)
    setUsageErr(false)
    if (preview) {
      setUsage({
        configured: true,
        limit: 1000,
        used: 137,
        remaining: 863,
        resetAt: '',
        dailyLimit: 40,
        dailyUsed: 12,
        dailyRemaining: 28,
        dailyResetAt: ''
      })
      return
    }
    const id = realWidget?.id
    if (!id) return
    let alive = true
    chatModule
      .getAiUsage(id)
      .then(u => alive && setUsage(u))
      .catch(() => alive && setUsageErr(true))
    return () => {
      alive = false
    }
  }, [preview, realWidget?.id])

  const usedPct = usage && usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0
  const nearLimit = usedPct >= 80
  const barColor = usage && usage.remaining <= 0 ? '#FF4D4D' : nearLimit ? '#F5A623' : '#5951E5'
  const resetLabel = usage?.resetAt
    ? new Date(usage.resetAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : null

  // Статус агента для кабинета (без захода в логи).
  const status = !usage
    ? null
    : !usage.configured
      ? { label: 'Не подключён', cls: 'bg-[#FFE9E9] text-[#D33]' }
      : !enabled
        ? { label: 'Выключен', cls: 'bg-[#EEEEF2] text-[#9A9A9A]' }
        : usage.remaining <= 0
          ? { label: 'Месячный лимит', cls: 'bg-[#FFE9E9] text-[#D33]' }
          : usage.dailyRemaining <= 0
            ? { label: 'Лимит на сегодня', cls: 'bg-[#FFF3E0] text-[#B26A00]' }
            : { label: 'Активен', cls: 'bg-[#E7F8EF] text-[#1B9E5E]' }

  return (
    <div className="flex-1 overflow-y-auto border-l border-default-200 p-6">
      <div className="max-w-[720px] mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[24px] leading-7 font-semibold text-[#1A1A1A]">Ассистент</h1>
          {dirty && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-[10px] bg-[#5951E5] text-white text-[15px] disabled:opacity-60"
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          )}
        </div>

        {chats.length > 1 && (
          <select
            value={chatSel ?? ''}
            onChange={e => setChatSel(e.target.value || null)}
            className="h-11 px-3 rounded-[10px] border border-[#E4E4E7] text-[15px] bg-white"
          >
            {chats.map(c => (
              <option key={c.projectId} value={c.projectId}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        {!realWidget && !preview ? (
          <div className="rounded-[14px] border border-[#E4E4E7] p-6 text-[15px] text-[#9A9A9A]">
            Чтобы настроить ИИ-агента, создайте чат-виджет в проекте.
          </div>
        ) : (
          <>
            {/* Включение агента */}
            <div className="rounded-[14px] border border-[#E4E4E7] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] leading-6 font-semibold text-[#1A1A1A]">
                      ИИ-агент
                    </span>
                    {status && (
                      <span className={cn('text-[12px] px-2 py-0.5 rounded-full font-medium', status.cls)}>
                        {status.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] leading-5 text-[#9A9A9A]">
                    Отвечает посетителям на их языке на основе вашего сайта и продукта.
                  </span>
                  {usage && !usage.configured && (
                    <span className="text-[13px] text-[#D33]">
                      Ключ OpenRouter не задан на сервере — агент не отвечает. Добавьте OPENROUTER_API_KEY.
                    </span>
                  )}
                </div>
                <CustomSwitch
                  size="sm"
                  isSelected={enabled}
                  onValueChange={v => setChatPatch({ aiAgentEnabled: v })}
                  selectedColor={ASSISTANT_ACCENT}
                />
              </div>
              <p className="text-[13px] leading-5 text-[#9A9A9A]">
                Имя агента («{agentName}») и разделы для изучения — в блоке «Аи агент» (Настройки).
              </p>
            </div>

            {/* Статистика остатка сообщений */}
            <div className="rounded-[14px] border border-[#E4E4E7] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[16px] leading-5 font-medium text-[#1A1A1A]">
                  Осталось сообщений в этом месяце
                </span>
                {usage && (
                  <span className="text-[18px] font-semibold text-[#1A1A1A]">
                    {usage.remaining}{' '}
                    <span className="text-[14px] font-normal text-[#9A9A9A]">/ {usage.limit}</span>
                  </span>
                )}
              </div>
              {usageErr ? (
                <span className="text-[14px] text-[#FF4D4D]">Не удалось загрузить статистику.</span>
              ) : !usage ? (
                <span className="text-[14px] text-[#9A9A9A]">Загрузка…</span>
              ) : (
                <>
                  <div className="h-2 w-full rounded-full bg-[#EEEEF2] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${usedPct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[13px] text-[#9A9A9A]">
                    <span>Использовано {usage.used} из {usage.limit}</span>
                    {resetLabel && <span>Обновится {resetLabel}</span>}
                  </div>
                  {/* Дневной лимит — фактический потолок на бесплатном тарифе ИИ. */}
                  <div className="mt-1 flex items-center justify-between text-[13px] text-[#9A9A9A] border-t border-[#EEEEF2] pt-2">
                    <span>Сегодня осталось</span>
                    <span
                      className={cn(
                        'font-medium',
                        usage.dailyRemaining <= 0 ? 'text-[#FF4D4D]' : 'text-[#1A1A1A]'
                      )}
                    >
                      {usage.dailyRemaining} / {usage.dailyLimit}
                    </span>
                  </div>
                  {usage.remaining <= 0 ? (
                    <span className="text-[13px] text-[#FF4D4D]">
                      Месячный лимит исчерпан — до обновления отвечают операторы.
                    </span>
                  ) : usage.dailyRemaining <= 0 ? (
                    <span className="text-[13px] text-[#FF4D4D]">
                      Дневной лимит исчерпан — сегодня отвечают операторы, завтра ИИ снова доступен.
                    </span>
                  ) : null}
                </>
              )}
            </div>

            {/* Кнопка настройки ИИ-агента: имя и страницы для изучения. */}
            <button
              type="button"
              onClick={() => setShowSettings(v => !v)}
              className="h-11 px-5 self-start rounded-[10px] border border-[#5951E5] text-[#5951E5] text-[15px] hover:bg-[#5951E5]/5 transition-colors"
            >
              {showSettings ? 'Скрыть настройки ИИ-агента' : 'Настроить ИИ-агента'}
            </button>

            {showSettings && <ChatAiAgentSettings />}
          </>
        )}
      </div>
    </div>
  )
}

const SettingsSection = ({
  preview,
  projectId,
}: {
  preview?: boolean
  projectId?: string | null
}) => {
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subview, setSubview] = useState<'settings' | 'scenario' | 'autodist'>('settings')
  const projects = useProjectsStore(s => s.projects)
  const saveWidgetConfig = useProjectsStore(s => s.saveWidgetConfig)
  // Все чаты пользователя = проекты с CHAT-виджетом (один чат на проект). Выпадашка переключает,
  // конфиг какого чата (Настройки/Сценарий/Автораспределение) сейчас редактируется.
  const chats = useMemo(
    () =>
      preview
        ? MOCK_CHATS.map(c => ({ projectId: c.projectId, widget: undefined, label: c.label }))
        : projects
            .filter(p => p.widgets.some(w => w.type === WidgetTypeEnum.CHAT))
            .map(p => {
              const widget = p.widgets.find(w => w.type === WidgetTypeEnum.CHAT)
              return { projectId: p.id, widget, label: chatLabel(widget, p.name) }
            }),
    [projects, preview]
  )
  // chatSel хранит projectId выбранного чата; дефолт — переданный projectId (activeProjectId) или первый.
  const [chatSel, setChatSel] = useState<string | null>(null)
  useEffect(() => {
    if (chatSel && chats.some(c => c.projectId === chatSel)) return
    setChatSel(chats.find(c => c.projectId === projectId)?.projectId ?? chats[0]?.projectId ?? null)
  }, [chats, projectId, chatSel])

  const realWidget = useMemo(
    () => chats.find(c => c.projectId === chatSel)?.widget,
    [chats, chatSel]
  )

  // Реактивный снимок настроек из стора — нужен, чтобы определять «есть несохранённые изменения».
  const liveSettings = useWidgetSettingsStore(s => s.settings)

  // Лейбл выбранного чата берём из ЖИВОГО стора (config.title) — чтобы название обновлялось сразу
  // при вводе и гарантированно после сохранения, а не только после рефетча projects.
  const chatsForSelect = useMemo(() => {
    const liveTitle =
      realWidget && liveSettings?.id === realWidget.id
        ? (liveSettings?.widget as { title?: string } | undefined)?.title?.trim()
        : undefined
    if (!liveTitle) return chats
    return chats.map(c => (c.projectId === chatSel ? { ...c, label: liveTitle } : c))
  }, [chats, chatSel, realWidget, liveSettings])
  // Сигнатура «чистого» конфига (на момент загрузки/сохранения). Кнопка «Сохранить» активна, только
  // если текущий конфиг в сторе отличается от базового.
  const baselineRef = useRef<string>('')
  const markClean = useCallback(() => {
    baselineRef.current = JSON.stringify(useWidgetSettingsStore.getState().settings?.widget ?? null)
  }, [])

  // Последний применённый в стор конфиг (id + сигнатура). Переинициализируем стор не только при
  // смене виджета, но и когда у того же виджета изменился config (правка в редакторе → подтянуть).
  const appliedRef = useRef<string | null>(null)
  useEffect(() => {
    const s = useWidgetSettingsStore.getState()
    if (!preview && realWidget && chatSel) {
      const sig = `${realWidget.id}:${JSON.stringify(realWidget.config ?? null)}`
      if (appliedRef.current !== sig) {
        s.init(realWidget.id, WidgetTypeEnum.CHAT, chatSel, realWidget.config as Partial<WidgetSettings> | undefined)
        appliedRef.current = sig
      }
    } else if ((preview || !realWidget) && s.settings?.id !== SETTINGS_WIDGET_ID) {
      s.init(SETTINGS_WIDGET_ID, WidgetTypeEnum.CHAT, 'chat-module')
      appliedRef.current = null
    }
    // Текущее состояние стора считаем «чистым» (новый виджет/конфиг загружен).
    markClean()
    setReady(true)
  }, [preview, realWidget, chatSel, markClean])

  // Есть ли несохранённые изменения относительно базового конфига.
  const dirty = ready && JSON.stringify(liveSettings?.widget ?? null) !== baselineRef.current

  // Сохранение настроек чата на сервер (по образцу EditWidgetPage.handleSave). Секции редактора
  // пишут только в стор/черновик — без этого изменения никуда не подтягиваются.
  const handleSaveSettings = useCallback(async () => {
    const s = useWidgetSettingsStore.getState()
    s.setValidationVisible(true)
    const res = s.prepareForSave()
    if (!res.ok) {
      alert('Исправьте ошибки перед сохранением')
      return
    }
    if (preview) {
      s.setValidationVisible(false)
      alert('В превью сохранение недоступно — проверьте в кабинете')
      return
    }
    if (!realWidget || !chatSel) return
    setSaving(true)
    try {
      const updated = await saveWidgetConfig(chatSel, realWidget.id, res.data)
      useWidgetSettingsStore.getState().clearPersistedDraft(realWidget.id)
      const base = useWidgetSettingsStore.getState().settings ?? buildDefaults(realWidget.id, WidgetTypeEnum.CHAT)
      const next = updated?.config ? ({ ...base, ...updated.config } as typeof base) : undefined
      useWidgetSettingsStore.getState().init(realWidget.id, WidgetTypeEnum.CHAT, chatSel, next)
      // Синхронизируем сигнатуру, чтобы init-эффект не делал повторный re-init после обновления стора.
      appliedRef.current = `${realWidget.id}:${JSON.stringify(updated?.config ?? null)}`
      markClean()
      useWidgetSettingsStore.getState().setValidationVisible(false)
      alert('Сохранено')
    } catch (e) {
      console.error('save chat settings failed', e)
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }, [preview, realWidget, chatSel, saveWidgetConfig, markClean])

  const allSections = getWidgetDefinition(WidgetTypeEnum.CHAT).settings.sections
  const settingsSections = allSections.filter(s => s.id !== 'chat.scenario')
  const scenarioSection = allSections.find(s => s.id === 'chat.scenario')

  const SubBtn = ({ id, label }: { id: 'settings' | 'scenario' | 'autodist'; label: string }) => (
    <button
      type="button"
      onClick={() => setSubview(id)}
      className={cn(
        'w-full h-11 px-4 rounded-[10px] text-[15px] text-left transition-colors',
        subview === id ? 'bg-primary text-white' : 'text-[#3D3D3B] hover:bg-default-100',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex-1 min-w-0 flex border-l border-default-200">
      {/* Левый блок: выбор чата + кнопки */}
      <div className="w-60 shrink-0 border-r border-default-200 p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-default-400">Чат</span>
          <div className="relative">
            <select
              value={chatSel ?? ''}
              onChange={e => setChatSel(e.target.value)}
              disabled={chats.length === 0}
              className="w-full appearance-none h-11 pl-3 pr-9 rounded-[10px] border border-default-200 text-[15px] outline-none bg-white cursor-pointer disabled:opacity-60"
            >
              {chatsForSelect.length === 0 ? (
                <option value="">Нет чатов</option>
              ) : (
                chatsForSelect.map(c => <option key={c.projectId} value={c.projectId}>{c.label}</option>)
              )}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-default-400"><IconChevron /></span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <SubBtn id="settings" label="Настройки" />
          <SubBtn id="scenario" label="Сценарий" />
          <SubBtn id="autodist" label="Автораспределение" />
        </div>
        {subview === 'settings' && (
          <button
            type="button"
            onClick={() => void handleSaveSettings()}
            disabled={saving || !dirty || (!preview && !realWidget)}
            className="w-full h-11 rounded-[10px] bg-primary text-white text-[15px] disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        )}
      </div>

      {/* Центр */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {!ready ? (
          <div className="p-6 text-[15px] text-default-400">Загрузка…</div>
        ) : subview === 'autodist' ? (
          <AutoDistributionPanel preview={preview} projectId={chatSel ?? projectId} />
        ) : subview === 'scenario' ? (
          <div className="w-full h-full flex flex-col px-6 py-6">
            <Suspense fallback={<div className="text-[15px] text-default-400">Загрузка…</div>}>
              {scenarioSection && <scenarioSection.Component />}
            </Suspense>
          </div>
        ) : (
          <div className="w-full max-w-[860px] mx-auto px-6 py-6">
            <Suspense fallback={<div className="text-[15px] text-default-400">Загрузка…</div>}>
              <div className="flex flex-col gap-5">
                {settingsSections.map(s => <s.Component key={s.id} />)}
              </div>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- page ----------------------------------- */

const ChatModulePage = ({ preview }: { preview?: boolean }): ReactElement => {
  const navigate = useNavigate()
  const projects = useProjectsStore(s => s.projects)
  const loadProjects = useProjectsStore(s => s.loadProjects)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [opStatus, setOpStatus] = useState<string>('work')
  const [opMenuOpen, setOpMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('Первичный контакт')
  const [note, setNote] = useState('')
  // Режим оператора: только Входящие/Диалоги; owner-разделы скрыты; доступ ограничен сервером.
  const operatorSession = useOperatorAuthStore(s => s.operator)
  const operatorLogout = useOperatorAuthStore(s => s.logout)
  const isOperator = !preview && !!operatorSession
  // Раздел — из URL (/chat-module/:section). В preview-стенде нет <Routes>, поэтому там стейт.
  const { section: sectionParam } = useParams<{ section?: string }>()
  const [previewSection, setPreviewSection] = useState<Section>('inbox')
  const VALID_SECTIONS = Object.keys(SECTION_TITLES) as Section[]
  const urlSection: Section = preview
    ? previewSection
    : VALID_SECTIONS.includes(sectionParam as Section)
      ? (sectionParam as Section)
      : 'inbox'
  // Оператору доступны только Входящие/Диалоги — прочее зажимаем в inbox (и при прямом URL).
  const section: Section =
    isOperator && urlSection !== 'inbox' && urlSection !== 'dialogs' ? 'inbox' : urlSection
  const go = useCallback(
    (s: Section) => {
      if (preview) setPreviewSection(s)
      else navigate(s === 'inbox' ? '/chat-module' : `/chat-module/${s}`)
    },
    [preview, navigate]
  )
  useEffect(() => {
    if (isOperator && urlSection !== 'inbox' && urlSection !== 'dialogs') go('inbox')
  }, [isOperator, urlSection, go])
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [groupDraft, setGroupDraft] = useState('')
  const [groupMsgs, setGroupMsgs] = useState<GroupMsg[]>(preview ? INITIAL_GROUP : [])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const groupFileRef = useRef<HTMLInputElement | null>(null)
  const [attachErr, setAttachErr] = useState<string | null>(null)
  // Стейджинг вложений оператора: до 10 файлов прикрепляются БЕЗ отправки, шлются одним сообщением.
  const [staged, setStaged] = useState<{ id: string; url: string; type: 'image' | 'video' | 'file'; name: string }[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  useEffect(() => {
    // Оператор не владеет проектами и не должен дёргать owner-эндпоинты (иначе 401 → выход).
    // Форсируем загрузку (не кэширующий ensureLoaded), чтобы правки виджета из редактора подтянулись.
    if (!preview && !isOperator) void loadProjects()
  }, [preview, isOperator, loadProjects])

  const firstChatProjectId = useMemo(
    () =>
      projects.find(p => p.widgets.some(w => w.type === WidgetTypeEnum.CHAT && w.enabled))?.id ??
      projects[0]?.id ??
      null,
    [projects]
  )

  // Живое название редактируемого чата (config.title из виджет-стора) — чтобы переименование
  // подтягивалось во ВСЕ селекторы сразу, а не только в выбранную опцию настроек.
  const liveChatSettings = useWidgetSettingsStore(s => s.settings)
  const liveChat = useMemo(() => {
    const t = (liveChatSettings?.widget as { title?: string } | undefined)?.title?.trim()
    return liveChatSettings?.id && t ? { id: liveChatSettings.id, title: t } : null
  }, [liveChatSettings])
  const labelOf = useCallback(
    (w: { id?: string; name?: string; config?: object | null } | undefined, projectName?: string) =>
      liveChat && w?.id === liveChat.id ? liveChat.title : chatLabel(w, projectName),
    [liveChat]
  )

  // Активные чаты всех проектов (один чат на проект) — опции глобального селектора диалогов.
  const dialogChats = useMemo(
    () =>
      preview
        ? MOCK_CHATS.map(c => ({ widgetId: c.widgetId, label: c.label }))
        : projects
            .filter(p => p.widgets.some(w => w.type === WidgetTypeEnum.CHAT && w.enabled))
            .map(p => {
              const w = p.widgets.find(x => x.type === WidgetTypeEnum.CHAT && x.enabled)!
              return { widgetId: w.id, label: labelOf(w, p.name) }
            }),
    [projects, preview, labelOf]
  )
  // widgetId → название чата (для блока «источник» в панели «Информация»). Берём ВСЕ CHAT-виджеты,
  // не только enabled, чтобы диалог завершённого/выключенного чата тоже подписался.
  const chatNameByWidgetId = useMemo(() => {
    const m = new Map<string, string>()
    if (preview) {
      MOCK_CHATS.forEach(c => m.set(c.widgetId, c.label))
      return m
    }
    projects.forEach(p =>
      p.widgets
        .filter(w => w.type === WidgetTypeEnum.CHAT)
        .forEach(w => m.set(w.id, labelOf(w, p.name)))
    )
    return m
  }, [projects, preview, labelOf])
  // 'all' — диалоги всех активных чатов; иначе widgetId конкретного чата.
  const [dialogChat, setDialogChat] = useState<'all' | string>('all')
  // Свёрнутый сайдбар чат-модуля (иконки без подписей).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  useEffect(() => {
    if (dialogChat !== 'all' && !dialogChats.some(c => c.widgetId === dialogChat)) {
      setDialogChat('all')
    }
  }, [dialogChats, dialogChat])

  // Проект, которым управляем в модуле (Операторы/Отделы/Соцсети/Настройки/групп-чат): из выбранного
  // в сайдбаре чата (dialogChat); «Все чаты» → первый проект. Позволяет добавлять операторов/отделы
  // в НУЖНЫЙ проект (в т.ч. новый), а не только в первый.
  const activeProjectId = useMemo(() => {
    if (dialogChat === 'all') return firstChatProjectId
    return projects.find(p => p.widgets.some(w => w.id === dialogChat))?.id ?? firstChatProjectId
  }, [dialogChat, projects, firstChatProjectId])

  const loadConversations = useCallback(async () => {
    // Новые сообщения/диалоги — в начале списка: сортируем по последней активности убыванием.
    const byRecency = (list: ChatConversation[]) =>
      [...list].sort(
        (a, b) =>
          new Date(b.lastMessageAt ?? b.createdAt).getTime() -
          new Date(a.lastMessageAt ?? a.createdAt).getTime(),
      )
    if (preview) {
      setConversations(byRecency(MOCK_CONVERSATIONS))
      return
    }
    const res = await chatsService.listConversations({ period: 'all' })
    setConversations(byRecency(res.conversations))
  }, [preview])

  useEffect(() => {
    void loadConversations()
    if (preview) {
      setSelectedId('m3')
      setMessages(MOCK_MESSAGES.m3)
    }
  }, [loadConversations, preview])

  // Групповой чат операторов — загрузка истории (real-режим, при монтировании: нужна и для счётчика на карточке).
  useEffect(() => {
    if (preview || !activeProjectId) return
    let alive = true
    void (async () => {
      try {
        const res = await chatModule.listGroupMessages(activeProjectId)
        if (!alive) return
        setGroupMsgs(
          res.messages.map(m => ({
            id: m.id,
            author: m.senderName ?? 'Оператор',
            me: !!m.senderUserId,
            body: m.body,
            createdAt: m.createdAt,
            attachmentUrl: m.attachmentUrl,
            attachmentType: m.attachmentType,
            attachmentName: m.attachmentName,
          }))
        )
      } catch (e) {
        console.error('listGroupMessages failed', e)
      }
    })()
    return () => { alive = false }
  }, [preview, activeProjectId])

  const { subscribe, sendMessage, markRead, sendTyping } = useChatSocket({
    onMessage: useCallback((msg: ChatMessage) => {
      if (msg.conversationId === selectedIdRef.current) {
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]))
      }
    }, []),
    onConversationUpdated: useCallback(() => void loadConversations(), [loadConversations]),
  })

  // Индикатор «оператор печатает» для посетителя: шлём typing=true при наборе,
  // а через паузу 2с без ввода (или при отправке) — typing=false. Дебаунс, чтобы не спамить.
  const typingActiveRef = useRef(false)
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopTyping = useCallback(() => {
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current)
      typingStopTimerRef.current = null
    }
    if (typingActiveRef.current) {
      typingActiveRef.current = false
      const id = selectedIdRef.current
      if (id && !preview) sendTyping(id, false)
    }
  }, [preview, sendTyping])
  const notifyTyping = useCallback(() => {
    const id = selectedIdRef.current
    if (!id || preview) return
    if (!typingActiveRef.current) {
      typingActiveRef.current = true
      sendTyping(id, true)
    }
    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current)
    typingStopTimerRef.current = setTimeout(stopTyping, 2000)
  }, [preview, sendTyping, stopTyping])

  const select = useCallback(
    async (id: string) => {
      setGroupOpen(false)
      setSelectedId(id)
      setConversations(prev => prev.map(c => (c.id === id ? { ...c, unreadForManager: 0 } : c)))
      if (preview) {
        setMessages(MOCK_MESSAGES[id] ?? [])
        return
      }
      subscribe(id)
      markRead(id)
      const res = await chatsService.getConversationMessages(id)
      setMessages(res.messages)
    },
    [subscribe, markRead, preview]
  )

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const body = draft.trim()
      if (!selectedId || (!body && staged.length === 0)) return
      const gallery = staged.map(s => ({ url: s.url, type: s.type, name: s.name }))
      if (preview) {
        setMessages(prev => [
          ...prev,
          {
            id: `local-${prev.length}`,
            conversationId: selectedId,
            sender: 'manager',
            body,
            createdAt: new Date().toISOString(),
            attachments: gallery.length ? gallery : null,
            attachmentUrl: gallery[0]?.url ?? null,
            attachmentType: gallery[0]?.type ?? null,
            attachmentName: gallery[0]?.name ?? null,
          },
        ])
        setDraft('')
        setStaged([])
        return
      }
      stopTyping()
      sendMessage(selectedId, body, undefined, gallery.length ? gallery : undefined)
      setDraft('')
      setStaged([])
    },
    [draft, staged, selectedId, sendMessage, preview, stopTyping]
  )

  const handleComplete = useCallback(async () => {
    if (!selectedId) return
    if (preview) {
      setConversations(prev => prev.filter(c => c.id !== selectedId))
      setSelectedId(null)
      setMessages([])
      return
    }
    await chatsService.updateConversationStatus(selectedId, 'closed')
    void loadConversations()
  }, [selectedId, loadConversations, preview])

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.accept = ''
      fileRef.current.click()
    }
  }, [])
  const handleAttachImage = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.accept = 'image/*'
      fileRef.current.click()
    }
  }, [])
  // Выбор файлов → стейджинг (до 10), БЕЗ отправки. Картинки/файлы грузятся в хранилище заранее.
  const onFilesPicked = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setAttachErr(null)
      const picked = Array.from(files)
      for (const file of picked) {
        const type = classifyAttachment(file.type)
        if (file.size > MAX_IMAGE_BYTES) {
          setAttachErr(type === 'image' ? IMAGE_TOO_LARGE_MESSAGE : 'Файл слишком большой (до 5 МБ)')
          continue
        }
        const id = crypto.randomUUID()
        if (preview) {
          setStaged(prev =>
            prev.length >= 10
              ? (setAttachErr('Не более 10 файлов в сообщении'), prev)
              : [...prev, { id, url: URL.createObjectURL(file), type, name: file.name }]
          )
          continue
        }
        setUploadingCount(c => c + 1)
        try {
          const up = await uploadFile(file)
          setStaged(prev =>
            prev.length >= 10
              ? (setAttachErr('Не более 10 файлов в сообщении'), prev)
              : [...prev, { id, url: up.url, type: up.type, name: up.name }]
          )
        } catch {
          setAttachErr('Не удалось загрузить файл')
        } finally {
          setUploadingCount(c => c - 1)
        }
      }
    },
    [preview]
  )
  const removeStaged = useCallback((id: string) => {
    setStaged(prev => prev.filter(s => s.id !== id))
  }, [])

  // Загрузка вложения во внутренний групповой чат операторов.
  const handleGroupAttach = useCallback(() => groupFileRef.current?.click(), [])
  const onGroupFilePicked = useCallback(
    async (file: File | null) => {
      if (!file) return
      setAttachErr(null)
      const type = classifyAttachment(file.type)
      if (file.size > MAX_IMAGE_BYTES) {
        setAttachErr(type === 'image' ? IMAGE_TOO_LARGE_MESSAGE : 'Файл слишком большой (до 5 МБ)')
        return
      }
      const pushLocal = (url: string) =>
        setGroupMsgs(prev => [
          ...prev,
          {
            id: `gm-${prev.length}-${Date.now()}`,
            author: 'Вы',
            me: true,
            body: '',
            createdAt: new Date().toISOString(),
            attachmentUrl: url,
            attachmentType: type,
            attachmentName: file.name,
          },
        ])
      if (preview) {
        pushLocal(URL.createObjectURL(file))
        return
      }
      try {
        const up = await uploadFile(file)
        pushLocal(up.url)
        if (activeProjectId) {
          await chatModule.sendGroupMessage(activeProjectId, {
            body: '',
            senderName: 'Вы',
            attachmentUrl: up.url,
            attachmentType: up.type,
            attachmentName: up.name,
          })
        }
      } catch {
        setAttachErr('Не удалось загрузить файл')
      }
    },
    [preview, activeProjectId]
  )
  const handleSparkles = useCallback(
    () => setDraft('Здравствуйте! Уточните, пожалуйста, детали — и я помогу подобрать решение.'),
    []
  )
  // Текстовое сообщение оператора (без вложений) — для служебных реплик (запрос контакта/передача).
  const sendManagerText = useCallback(
    (body: string) => {
      if (!selectedId || !body.trim()) return
      if (preview) {
        setMessages(prev => [
          ...prev,
          { id: `local-${prev.length}-${body.length}`, conversationId: selectedId, sender: 'manager', body, createdAt: new Date().toISOString() },
        ])
        return
      }
      sendMessage(selectedId, body)
    },
    [selectedId, preview, sendMessage]
  )
  const handleRequestContact = useCallback(
    () => sendManagerText('Оставьте, пожалуйста, ваш телефон или email — так мы точно с вами свяжемся.'),
    [sendManagerText]
  )
  const handleTransfer = useCallback(
    (name?: string) => sendManagerText(name ? `Передаю диалог оператору: ${name}.` : 'Передаю диалог другому оператору.'),
    [sendManagerText]
  )
  const handleRefresh = useCallback(() => void loadConversations(), [loadConversations])

  const selected = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? null,
    [conversations, selectedId]
  )

  // Сидируем тему/заметку из выбранного диалога (real-режим хранит category/note).
  useEffect(() => {
    if (preview) return
    setTopic(selected?.category ?? 'Первичный контакт')
    setNote(selected?.note ?? '')
  }, [preview, selectedId, selected?.category, selected?.note])

  // Обновление полей диалога (категория/заметка/назначение) в real-режиме.
  const persistFields = useCallback(
    (fields: Parameters<typeof chatModule.updateConversationFields>[1]) => {
      if (preview || !selectedId) return
      void (async () => {
        try {
          await chatModule.updateConversationFields(selectedId, fields)
        } catch (e) {
          console.error('updateConversationFields failed', e)
        }
      })()
    },
    [preview, selectedId]
  )

  // Реальные операторы для передачи диалога (real-режим).
  const [transferOps, setTransferOps] = useState<{ id: string; name: string; dept: string; online: boolean }[]>([])
  useEffect(() => {
    if (preview || !activeProjectId) return
    let alive = true
    void (async () => {
      try {
        const res = await chatModule.listOperators(activeProjectId)
        if (!alive) return
        setTransferOps(res.operators.map(o => ({ id: o.id, name: o.name, dept: '', online: o.online })))
      } catch (e) {
        console.error('listOperators (transfer) failed', e)
      }
    })()
    return () => { alive = false }
  }, [preview, activeProjectId])

  // Беседы под выбранным в сайдбаре чатом ('all' — все). На этом строятся Входящие и Диалоги.
  const dialogScoped = useMemo(() => {
    if (dialogChat === 'all') return conversations
    return conversations.filter(c => c.widgetId === dialogChat)
  }, [conversations, dialogChat])

  const inboxCount = useMemo(
    () => dialogScoped.filter(c => c.unreadForManager > 0).length,
    [dialogScoped]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return dialogScoped.filter(c => {
      if (filter === 'unread' && c.unreadForManager === 0) return false
      if (filter === 'archived' && c.status !== 'closed') return false
      if (filter === 'all' && c.status === 'closed') return false
      if (!q) return true
      return convName(c).toLowerCase().includes(q) || (c.lastMessagePreview ?? '').toLowerCase().includes(q)
    })
  }, [dialogScoped, search, filter])

  /* messages grouped by day */
  const grouped = useMemo(() => {
    const groups: { day: string; items: ChatMessage[] }[] = []
    for (const m of messages) {
      const day = dayLabel(m.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.day === day) last.items.push(m)
      else groups.push({ day, items: [m] })
    }
    return groups
  }, [messages])

  const threadRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, selectedId])

  return (
    <div className="h-screen w-full flex bg-white text-[#1A1A1A] overflow-hidden">
      <ModuleSidebar
        section={section}
        onSection={go}
        inboxCount={preview ? 13 : inboxCount}
        onExit={isOperator ? () => { operatorLogout(); navigate('/operator') } : () => navigate('/')}
        chats={dialogChats}
        dialogChat={dialogChat}
        onDialogChat={setDialogChat}
        isOperator={isOperator}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
      />

      {section === 'dialogs' ? (
        <DialogsSection
          conversations={dialogScoped}
          preview={preview}
          onOpen={id => {
            go('inbox')
            void select(id)
          }}
        />
      ) : section === 'social' ? (
        <SocialSection preview={preview} projectId={activeProjectId} />
      ) : section === 'operators' ? (
        <OperatorsSection
          conversations={conversations}
          onOpenDialog={id => {
            go('inbox')
            void select(id)
          }}
          preview={preview}
          projectId={activeProjectId}
        />
      ) : section === 'departments' ? (
        <DepartmentsSection preview={preview} projectId={activeProjectId} />
      ) : section === 'settings' ? (
        <SettingsSection preview={preview} projectId={activeProjectId} />
      ) : section === 'assistant' ? (
        <AssistantSection preview={preview} projectId={activeProjectId} />
      ) : section !== 'inbox' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 border-l border-default-200 text-default-400">
          <span className="text-[18px] font-medium text-[#1A1A1A]">{SECTION_TITLES[section]}</span>
          <span className="text-[15px]">Раздел в разработке</span>
        </div>
      ) : (
      <>
      {/* Входящие */}
      <div className="w-[360px] shrink-0 sidebar-bg border-l border-default-200 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <span className="text-[18px] font-medium">Мои входящие</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpMenuOpen(v => !v)}
              className="flex items-center gap-1.5 text-[15px]"
            >
              {(() => {
                const s = OPERATOR_STATUSES.find(o => o.key === opStatus) ?? OPERATOR_STATUSES[0]
                return (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.dot }} />
                    {s.label}
                  </>
                )
              })()}
              <IconChevron />
            </button>
            {opMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-[12px] border border-default-200 bg-white shadow-lg py-1.5">
                  {OPERATOR_STATUSES.map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setOpStatus(s.key)
                        setOpMenuOpen(false)
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 flex items-center gap-3 text-[15px] text-left hover:bg-default-50',
                        opStatus === s.key && 'bg-default-50',
                      )}
                    >
                      <span className="text-[18px]">{s.emoji}</span>
                      <span className="flex-1">{s.label}</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Групповой чат — внутренний чат сотрудников, клиентам не виден */}
        <button
          type="button"
          onClick={() => { setGroupOpen(true); setSelectedId(null) }}
          className={cn(
            'mx-4 mb-3 rounded-[12px] bg-white border p-3 text-left transition-colors hover:bg-default-50',
            groupOpen ? 'border-primary' : 'border-default-200',
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar name="О" size={36} />
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] text-default-400">Групповой чат</span>
              <span className="text-[15px] font-medium truncate">Общий чат операторов</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px] text-default-400">
            <span className="flex items-center gap-1"><IconUsers /> {preview ? INITIAL_OPERATORS.length : transferOps.length}</span>
            <span className="flex items-center gap-1 text-primary">{groupMsgs.length} <IconBubble /></span>
          </div>
        </button>

        <div className="px-4 flex items-center gap-3 mb-2">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterOpen(v => !v)}
              className="text-[15px] font-medium flex items-center gap-1"
            >
              {filter === 'all' ? 'Все диалоги' : filter === 'unread' ? 'Непрочитанные' : 'Завершённые'}
              <span className="text-default-400">{filtered.length}</span>
              <IconChevron />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute left-0 top-full mt-2 z-20 w-48 rounded-[12px] border border-default-200 bg-white shadow-lg py-1.5">
                  {([['all', 'Все диалоги'], ['unread', 'Непрочитанные'], ['archived', 'Завершённые']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setFilter(key); setFilterOpen(false) }}
                      className={cn('w-full px-4 py-2.5 text-left text-[15px] hover:bg-default-50', filter === key && 'text-primary font-medium')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white border border-default-200 rounded-[10px] px-3 h-9">
            <span className="text-[#B0AEBA]"><IconSearch /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по чатам"
              className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-[#B0AEBA]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {filtered.length === 0 && (
            <div className="p-4 text-[14px] text-default-400">Диалогов нет</div>
          )}
          {filtered.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => void select(c.id)}
              className={cn(
                'w-full px-3 py-3 rounded-[12px] flex items-start gap-3 text-left transition-colors relative',
                c.id === selectedId
                  ? 'bg-white ring-2 ring-primary shadow-[0_4px_14px_rgba(26,82,219,0.18)] border-l-4 border-primary pl-2.5'
                  : 'hover:bg-white/60',
              )}
            >
              <Avatar name={convName(c)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-medium truncate flex items-center gap-1.5">
                    {c.unreadForManager > 0 && <span className="w-2 h-2 rounded-full bg-[#5951E5]" />}
                    {convName(c)}
                  </span>
                  <span className="text-[12px] text-default-400 shrink-0">{fmtTime(c.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-[13px] text-default-400 truncate">
                    {c.lastMessagePreview ?? '—'}
                  </span>
                  <span className="flex items-center gap-1.5 text-default-400 shrink-0">
                    <IconGlobe />
                    <IconEnter />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Переписка */}
      <div className="flex-1 min-w-0 flex flex-col border-l border-default-200">
        {groupOpen ? (
          <>
            <div className="h-16 shrink-0 px-6 flex items-center gap-3 border-b border-default-200">
              <Avatar name="Операторы" />
              <span className="text-[18px] font-medium">Общий чат операторов</span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-white">
              {groupMsgs.map(m => (
                <div key={m.id} className={cn('w-full flex flex-col', m.me ? 'items-end' : 'items-start')}>
                  {!m.me && <span className="text-[12px] text-default-400 mb-0.5 px-1">{m.author}</span>}
                  <div className={cn('max-w-[60%] px-4 py-3 rounded-[14px] text-[15px] leading-5', m.me ? 'bg-primary/10 rounded-br-[4px]' : 'bg-default-100 rounded-bl-[4px]')}>
                    {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
                    {m.attachmentUrl && (
                      <div className={cn(m.body && 'mt-2')}>
                        <AttachmentView url={m.attachmentUrl} type={m.attachmentType} name={m.attachmentName} />
                      </div>
                    )}
                    <div className="text-[11px] text-[#A6A2B0] mt-1.5 text-right">{fmtFull(m.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                const b = groupDraft.trim()
                if (!b) return
                setGroupMsgs(prev => [...prev, { id: `gm-${prev.length}-${Date.now()}`, author: 'Вы', me: true, body: b, createdAt: new Date().toISOString() }])
                setGroupDraft('')
                if (!preview && activeProjectId) {
                  void (async () => {
                    try {
                      await chatModule.sendGroupMessage(activeProjectId, { body: b, senderName: 'Вы' })
                    } catch (err) {
                      console.error('sendGroupMessage failed', err)
                    }
                  })()
                }
              }}
              className="shrink-0 p-4"
            >
              {attachErr && <div className="mb-2 text-[13px] text-[#E5484D]">{attachErr}</div>}
              <div className="rounded-[14px] bg-default-100 px-4 py-3 flex items-center gap-2">
                <button type="button" onClick={handleGroupAttach} aria-label="Прикрепить файл" className="text-[#6E6E76] hover:text-[#1A1A1A] shrink-0">
                  <Ic d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.3-7.3" size={20} />
                </button>
                <input ref={groupFileRef} type="file" className="hidden" onChange={e => { onGroupFilePicked(e.target.files?.[0] ?? null); e.target.value = '' }} />
                <input value={groupDraft} onChange={e => setGroupDraft(e.target.value)} placeholder="Сообщение коллегам" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-default-400" />
                <button type="submit" disabled={!groupDraft.trim()} className="h-9 px-5 rounded-[8px] text-white text-[15px] disabled:opacity-50" style={{ backgroundColor: ACCENT }}>Отправить</button>
              </div>
            </form>
          </>
        ) : selected ? (
          <>
            <div className="h-16 shrink-0 px-6 flex items-center gap-3 border-b border-default-200">
              <Avatar name={convName(selected)} />
              <span className="text-[18px] font-medium">{convName(selected)}</span>
            </div>

            <div ref={threadRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-white">
              {grouped.map(g => (
                <div key={g.day} className="flex flex-col gap-3">
                  <div className="w-full flex justify-center my-2">
                    <span className="text-[14px] font-semibold text-[#1A1A1A]">{g.day}</span>
                  </div>
                  {g.items.map(m => {
                    if (m.sender === 'system') {
                      return (
                        <div key={m.id} className="w-full flex justify-center">
                          <span className="text-[12px] text-default-400">{m.body}</span>
                        </div>
                      )
                    }
                    const isManager = m.sender === 'manager'
                    return (
                      <div key={m.id} className={cn('w-full flex items-end gap-2', isManager ? 'justify-end' : 'justify-start')}>
                        {!isManager && <Avatar name={convName(selected)} size={32} />}
                        <div
                          className={cn(
                            'max-w-[60%] px-4 py-3 rounded-[14px] text-[15px] leading-5',
                            isManager ? 'bg-primary/10 rounded-br-[4px]' : 'bg-default-100 rounded-bl-[4px]',
                          )}
                        >
                          {/* Пометка «ИИ» — видна ТОЛЬКО оператору (визиторский API флаг не отдаёт). */}
                          {m.aiGenerated && (
                            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#5951E5]/12 px-2 py-0.5 text-[11px] font-medium text-[#5951E5]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5951E5]" />
                              ИИ
                            </div>
                          )}
                          {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
                          {(m.attachmentUrl || (m.attachments && m.attachments.length > 0)) && (
                            <div className={cn(m.body && 'mt-2')}>
                              <MessageAttachments message={m} />
                            </div>
                          )}
                          <div className="text-[11px] text-[#A6A2B0] mt-1.5 text-right">{fmtFull(m.createdAt)}</div>
                        </div>
                        {isManager && <Avatar name="Я" size={32} />}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {selected?.status === 'closed' && (
              <div className="shrink-0 px-4 pt-3 -mb-1 flex justify-center">
                <span className="rounded-[10px] bg-default-100 px-4 py-2 text-[13px] text-default-400">
                  Беседа завершена
                </span>
              </div>
            )}

            <form onSubmit={handleSend} className="shrink-0 p-4">
              {attachErr && <div className="mb-2 text-[13px] text-[#E5484D]">{attachErr}</div>}
              <div className="rounded-[14px] bg-default-100 px-4 py-3">
                {(staged.length > 0 || uploadingCount > 0) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {staged.map(s => (
                      <div key={s.id} className="relative">
                        {s.type === 'image' ? (
                          <img src={s.url} alt="" className="w-16 h-16 object-cover rounded-[8px] border border-default-200" />
                        ) : (
                          <div className="w-16 h-16 rounded-[8px] border border-default-200 bg-white flex flex-col items-center justify-center px-1 gap-0.5 text-[10px] text-default-400 text-center">
                            <span className="text-[18px]">📄</span>
                            <span className="truncate w-full">{s.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeStaged(s.id)}
                          aria-label="Убрать вложение"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#3D3D3B] text-white text-[12px] leading-none flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {uploadingCount > 0 && (
                      <div className="w-16 h-16 rounded-[8px] border border-default-200 flex items-center justify-center text-[13px] text-default-400">…</div>
                    )}
                  </div>
                )}
                <textarea
                  value={draft}
                  onChange={e => { setDraft(e.target.value); notifyTyping() }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                  rows={2}
                  placeholder="Введите текст"
                  className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-default-400"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-4 text-[14px] text-[#6E6E76]">
                    <button type="button" onClick={handleAttach} className="flex items-center gap-1.5 hover:text-[#1A1A1A]">
                      <Ic d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.3-7.3" size={20} /> Прикрепить файл
                    </button>
                    <div className="relative">
                      <button type="button" onClick={() => setEmojiOpen(v => !v)} aria-label="Эмодзи" className="hover:text-[#1A1A1A] flex items-center">
                        <Ic d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8.5 14.5a4.5 4.5 0 0 0 7 0|M9 9.5h.01M15 9.5h.01" size={20} />
                      </button>
                      {emojiOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setEmojiOpen(false)} />
                          <div className="absolute left-0 bottom-full mb-2 z-20 w-64 rounded-[12px] border border-default-200 bg-white shadow-lg p-2 grid grid-cols-7 gap-1">
                            {EMOJIS.map(em => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => { setDraft(d => d + em); setEmojiOpen(false) }}
                                className="h-8 rounded-[8px] text-[18px] hover:bg-default-100"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <button type="button" onClick={handleAttachImage} aria-label="Изображение" className="hover:text-[#1A1A1A] flex items-center">
                      <Ic d="M4 5h16v14H4z|M8 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3|M5 18l5-5 4 4 2-2 3 3" size={20} />
                    </button>
                    <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { void onFilesPicked(e.target.files); e.target.value = '' }} />
                  </div>
                  <button
                    type="submit"
                    disabled={(!draft.trim() && staged.length === 0) || uploadingCount > 0}
                    className="h-9 px-5 rounded-[8px] text-white text-[15px] disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[15px] text-default-400">
            Выберите диалог
          </div>
        )}
      </div>

      {/* Информация */}
      {groupOpen ? (
      <GroupInfoPanel messages={groupMsgs} />
      ) : (
      <aside className="w-[340px] shrink-0 border-l border-default-200 p-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-medium">Информация:</span>
          <button type="button" onClick={handleRefresh} aria-label="Обновить" className="text-default-400 hover:text-[#1A1A1A]"><IconDots /></button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleComplete()}
            disabled={!selected || selected.status === 'closed'}
            className={cn(
              'flex-1 h-10 rounded-[8px] text-[15px] disabled:cursor-default',
              selected?.status === 'closed'
                ? 'bg-default-100 text-default-400'
                : 'bg-[#FDE7E7] text-[#E5484D] disabled:opacity-50',
            )}
          >
            {selected?.status === 'closed' ? 'Завершено' : 'Завершить'}
          </button>
          <button
            type="button"
            onClick={handleSparkles}
            disabled={!selected}
            aria-label="Подсказка ИИ"
            className="w-11 h-10 rounded-[8px] border border-default-200 flex items-center justify-center disabled:opacity-50"
          >
            <IconSparkles />
          </button>
        </div>

        {/* Источник диалога: с какого чата (виджета) и по какому каналу идёт общение */}
        {selected && (() => {
          const ch = preview ? (MOCK_DIALOG_META[selected.id]?.channel ?? channelOf(selected)) : channelOf(selected)
          return (
            <div className="flex items-center gap-2 -mt-1 text-[14px] text-default-400">
              <ChannelIcon ch={ch} />
              <span className="truncate">
                {chatNameByWidgetId.get(selected.widgetId) ?? 'Чат'} · {CHANNEL_LABEL[ch]}
              </span>
            </div>
          )
        })()}

        {/* Контакты клиента */}
        <div className="flex flex-col gap-3">
          {[
            { icon: <IconUser />, label: selected ? convName(selected) : 'Клиент', checked: true },
            { icon: <IconPhone />, label: selected?.visitorPhone || 'Телефон', checked: !!selected?.visitorPhone },
            { icon: <IconMail />, label: selected?.visitorEmail || '—', checked: !!selected?.visitorEmail },
            { icon: <IconUser />, label: 'Адрес', checked: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[#6E6E76]">{row.icon}</span>
              <span className="flex-1 text-[15px] truncate">{row.label}</span>
              <span className={cn('w-5 h-5 rounded-[5px] border flex items-center justify-center', row.checked ? 'bg-[#3D3D3B] border-[#3D3D3B]' : 'border-[#C7C7CC]')}>
                {row.checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                )}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={handleRequestContact}
            disabled={!selected}
            className="text-[15px] text-primary text-right disabled:opacity-50"
          >
            Запросить
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-medium">Информация о беседе</span>
          <div className="relative h-11 rounded-[10px] border border-default-200 flex items-center px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3BD16F] mr-2 shrink-0" />
            <select
              value={topic}
              onChange={e => { setTopic(e.target.value); persistFields({ category: e.target.value }) }}
              className="flex-1 appearance-none bg-transparent text-[15px] outline-none cursor-pointer pr-6"
            >
              <option>Первичный контакт</option>
              <option>В работе</option>
              <option>Ожидает ответа</option>
              <option>Завершён</option>
              <option>Спам</option>
            </select>
            <span className="pointer-events-none absolute right-3 text-default-400"><IconChevron /></span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-medium">Заметки</span>
          <div className="flex items-center gap-2 text-[#6E6E76]">
            <IconDoc />
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => persistFields({ note })}
              placeholder="Комментарий"
              className="flex-1 text-[15px] outline-none bg-transparent placeholder:text-default-400"
            />
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setTransferOpen(v => !v)}
            disabled={!selected}
            className="flex items-center gap-2 text-[15px] text-[#1A1A1A] disabled:opacity-50"
          >
            <IconUserPlus /> Передать оператору
          </button>
          {transferOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTransferOpen(false)} />
              <div className="absolute left-0 bottom-full mb-2 z-20 w-72 rounded-[12px] border border-default-200 bg-white shadow-lg py-1.5">
                {(!preview && transferOps.length > 0 ? transferOps : TRANSFER_OPERATORS).map(op => (
                  <button
                    key={op.name}
                    type="button"
                    onClick={() => {
                      handleTransfer(op.name)
                      const opId = (op as { id?: string }).id
                      if (opId) persistFields({ assignedOperatorId: opId })
                      setTransferOpen(false)
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-default-50"
                  >
                    <Avatar name={op.name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-[#1A1A1A] truncate">{op.name}</div>
                      <div className="text-[13px] text-default-400 truncate">{op.dept}</div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[12px] text-default-400 shrink-0">
                      <span className={cn('w-2 h-2 rounded-full', op.online ? 'bg-[#3BD16F]' : 'bg-default-300')} />
                      {op.online ? 'Онлайн' : 'Офлайн'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button type="button" onClick={() => navigate('/')} className="mt-auto text-[13px] text-default-400 text-left">
          ← В кабинет
        </button>
      </aside>
      )}
      </>
      )}
    </div>
  )
}

export default memo(ChatModulePage)
