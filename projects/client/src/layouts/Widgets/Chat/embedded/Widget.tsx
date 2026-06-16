import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { PatternFormat } from 'react-number-format'
import { cn } from '@heroui/theme'

import EmojiPicker from '@/components/EmojiPicker'
import { renderMarkdown } from '@/common/markdownLite'
import type { ChatUiMessage } from './types'
import type { OperatorInfo } from './useChatConnection'

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
  operatorSubtitle?: string
  operatorAvatarUrl?: string
  operatorOnline: boolean
  // Реальные операторы проекта (из чат-модуля) — подтягиваются в шапку.
  operators: OperatorInfo[]
  onlineMessage: string
  onlineMessageEnabled: boolean
  offlineMessage: string
  offlineMessageEnabled: boolean
  placeholder: string
  windowFormat: 'sidebar' | 'modal'
  windowRadius: number
  windowBackgroundColor: string
  windowAccentColor: string
  clientColor: string
  companyLogoUrl?: string
  welcomeTitle: string
  welcomeTitleSize: number
  welcomeTitleWeight: number
  welcomeTitleColor: string
  welcomeTitleAlign: 'left' | 'center' | 'right'
  messages: ChatUiMessage[]
  quickReplies: QuickReply[]
  // Бот «печатает…» — пауза перед авто-переходом шага сценария (показываем анимированные точки).
  typing?: boolean
  // Живой оператор набирает текст — показываем «Оператор набирает текст…» с точками.
  operatorTyping?: boolean
  // Сторона, к которой докуется боковая панель (определяет, с какого края торчит кнопка закрытия).
  sidebarSide?: 'left' | 'right'
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
  // Диалог завершён оператором — вместо поля ввода показываем кнопку «Начать беседу».
  ended?: boolean
  // Доступен ли возврат на предыдущий экран (иконка «Назад» в компактной шапке).
  canGoBack: boolean
  onSend: (body: string) => void
  // Начать новый диалог (после завершения оператором) — сброс на главный экран.
  onRestart?: () => void
  // Выбран файл во вложение (кнопки «+»/«скрепка»). Отправка — на стороне рантайма.
  onAttach?: (file: File) => void
  onEnterChat: () => void
  onOfflineSend: (text: string) => void
  onQuickReply: (buttonId: string) => void
  onSubmitForm: (values: ContactFormValues) => void
  onBack: () => void
  // Меню три-точки в шапке чата.
  onEndDialog: () => void
  onDownloadDialog: () => void
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

// Иконки вкладок — из github/lemnity (chatbubble-ellipses / reader / location / sparkles).
// fill наследуется от <svg fill={color}>, чтобы работала подсветка активной вкладки.
const IconChat = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 13.5C8.32843 13.5 9 12.8284 9 12C9 11.1716 8.32843 10.5 7.5 10.5C6.67157 10.5 6 11.1716 6 12C6 12.8284 6.67157 13.5 7.5 13.5Z" />
    <path d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z" />
    <path d="M16.5 13.5C17.3284 13.5 18 12.8284 18 12C18 11.1716 17.3284 10.5 16.5 10.5C15.6716 10.5 15 11.1716 15 12C15 12.8284 15.6716 13.5 16.5 13.5Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.9921 3C6.99416 3 2.98499 6.95015 3.00004 11.7792L3.00005 11.7804V11.7816C2.99999 13.4614 3.49098 15.1045 4.4124 16.5087C4.46503 16.5806 4.51426 16.655 4.55994 16.7315L4.56356 16.7375L4.56707 16.7437C4.64102 16.873 4.72871 17.0473 4.78914 17.2397C4.84444 17.4157 4.90814 17.7028 4.8249 18.0091L4.82447 18.0107L4.04982 20.8128L6.72864 19.846C6.99497 19.7365 7.28037 19.6805 7.56849 19.6814C7.56897 19.6814 7.56945 19.6814 7.56993 19.6814L7.56708 20.4314L7.56792 19.6814C7.56811 19.6814 7.5683 19.6814 7.56849 19.6814C7.83823 19.6818 8.10563 19.7316 8.35742 19.8284L8.35796 19.8286L8.35851 19.8288C8.51054 19.8875 9.11615 20.1125 9.715 20.2801C10.3037 20.4449 11.3908 20.6447 12.1599 20.6447C17.1329 20.6447 20.9999 16.6518 21 11.7889L21.75 11.7886H21C20.9998 11.1853 20.936 10.5838 20.8095 9.99391L20.8093 9.99313L20.8092 9.99234C19.9657 6.01596 16.3474 3 11.9921 3ZM1.50005 11.7827C1.48294 6.08891 6.19977 1.5 11.9921 1.5C17.047 1.5 21.2837 5.00287 22.2763 9.68C22.4248 10.373 22.4998 11.0796 22.5 11.7883V11.7886C22.5 17.4639 17.9774 22.1447 12.1599 22.1447C11.2133 22.1447 9.98483 21.9133 9.31072 21.7246C8.64759 21.539 7.99308 21.2956 7.81881 21.2283C7.73819 21.1974 7.65259 21.1815 7.56624 21.1814L7.56523 21.1814L7.56423 21.1814C7.47098 21.181 7.37863 21.1996 7.29277 21.236L7.27407 21.2439L4.09314 22.3919C3.96108 22.446 3.82192 22.4811 3.67987 22.4959L3.63987 22.5001L3.59966 22.5C3.4409 22.4995 3.28382 22.4675 3.13751 22.4059C2.99121 22.3443 2.85858 22.2543 2.74731 22.141C2.63605 22.0278 2.54836 21.8936 2.48933 21.7462C2.4303 21.5989 2.40109 21.4412 2.40341 21.2825L2.40374 21.26L2.40542 21.2375C2.4131 21.1349 2.43136 21.0333 2.45992 20.9345L3.35756 17.6875C3.34119 17.6361 3.30995 17.5678 3.26846 17.4945C3.24588 17.4571 3.22151 17.4208 3.19543 17.3858L3.18261 17.3686L3.17079 17.3507C2.08111 15.6981 1.50021 13.7622 1.50005 11.7827Z" />
  </svg>
)

const IconDoc = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.75 3C5.92157 3 5.25 3.67157 5.25 4.5V19.5C5.25 20.3284 5.92157 21 6.75 21H17.25C18.0784 21 18.75 20.3284 18.75 19.5V4.5C18.75 3.67157 18.0784 3 17.25 3H6.75ZM3.75 4.5C3.75 2.84315 5.09315 1.5 6.75 1.5H17.25C18.9069 1.5 20.25 2.84315 20.25 4.5V19.5C20.25 21.1569 18.9069 22.5 17.25 22.5H6.75C5.09315 22.5 3.75 21.1569 3.75 19.5V4.5Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 6C7.5 5.58579 7.83579 5.25 8.25 5.25H15.75C16.1642 5.25 16.5 5.58579 16.5 6C16.5 6.41421 16.1642 6.75 15.75 6.75H8.25C7.83579 6.75 7.5 6.41421 7.5 6Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 9.75C7.5 9.33579 7.83579 9 8.25 9H15.75C16.1642 9 16.5 9.33579 16.5 9.75C16.5 10.1642 16.1642 10.5 15.75 10.5H8.25C7.83579 10.5 7.5 10.1642 7.5 9.75Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 13.5C7.5 13.0858 7.83579 12.75 8.25 12.75H12C12.4142 12.75 12.75 13.0858 12.75 13.5C12.75 13.9142 12.4142 14.25 12 14.25H8.25C7.83579 14.25 7.5 13.9142 7.5 13.5Z" />
  </svg>
)

const IconPin = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.5 8.67188C4.5 4.67875 7.89479 1.5 12 1.5C16.1052 1.5 19.5 4.67875 19.5 8.67188C19.5 10.923 18.2829 13.7082 16.9495 16.1155C15.5963 18.559 14.0377 20.7603 13.2019 21.8891C13.064 22.0776 12.8837 22.231 12.6755 22.337C12.4663 22.4435 12.2348 22.499 12 22.499C11.7652 22.499 11.5337 22.4435 11.3245 22.337C11.1163 22.231 10.9359 22.0776 10.798 21.889C9.96224 20.7598 8.40373 18.5577 7.05043 16.1139C5.71719 13.7064 4.5 10.9214 4.5 8.67188ZM12 3C8.65209 3 6 5.57656 6 8.67188C6 10.5004 7.03281 12.9859 8.36265 15.3872C9.66887 17.746 11.1818 19.886 12 20.9917C12.8181 19.8865 14.3311 17.7473 15.6374 15.3888C16.9671 12.9878 18 10.5021 18 8.67188C18 5.57656 15.3479 3 12 3Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 7.5C11.1716 7.5 10.5 8.17157 10.5 9C10.5 9.82843 11.1716 10.5 12 10.5C12.8284 10.5 13.5 9.82843 13.5 9C13.5 8.17157 12.8284 7.5 12 7.5ZM9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9Z" />
  </svg>
)

const IconSparkles = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M9.75016 24.0008C9.51313 24.0021 9.28139 23.9309 9.08589 23.7969C8.89039 23.6629 8.74044 23.4724 8.65609 23.2508L6.78859 18.3946C6.75077 18.2967 6.69291 18.2079 6.61872 18.1337C6.54454 18.0595 6.45567 18.0016 6.35781 17.9638L1.50016 16.0949C1.27888 16.01 1.08856 15.86 0.954304 15.6646C0.820052 15.4693 0.748183 15.2379 0.748183 15.0008C0.748183 14.7638 0.820052 14.5324 0.954304 14.3371C1.08856 14.1417 1.27888 13.9917 1.50016 13.9068L6.35641 12.0393C6.45426 12.0015 6.54313 11.9436 6.61732 11.8694C6.6915 11.7952 6.74936 11.7064 6.78719 11.6085L8.65609 6.75085C8.74102 6.52957 8.89105 6.33925 9.08637 6.20499C9.2817 6.07074 9.51314 5.99887 9.75016 5.99887C9.98717 5.99887 10.2186 6.07074 10.4139 6.20499C10.6093 6.33925 10.7593 6.52957 10.8442 6.75085L12.7117 11.6071C12.7495 11.705 12.8074 11.7938 12.8816 11.868C12.9558 11.9422 13.0446 12.0001 13.1425 12.0379L17.9706 13.8955C18.2009 13.9809 18.3993 14.1351 18.5388 14.3373C18.6783 14.5394 18.7521 14.7796 18.7502 15.0252C18.7466 15.2581 18.6732 15.4846 18.5395 15.6753C18.4058 15.866 18.2179 16.0122 18.0002 16.0949L13.1439 17.9624C13.046 18.0002 12.9572 18.0581 12.883 18.1323C12.8088 18.2065 12.7509 18.2953 12.7131 18.3932L10.8442 23.2508C10.7599 23.4724 10.6099 23.6629 10.4144 23.7969C10.2189 23.9309 9.98718 24.0021 9.75016 24.0008Z" />
    <path d="M4.12516 8.25085C3.9862 8.25084 3.8505 8.20873 3.73595 8.13008C3.62139 8.05142 3.53336 7.93991 3.48344 7.81022L2.69312 5.75522C2.676 5.71028 2.64956 5.66946 2.61555 5.63545C2.58154 5.60144 2.54072 5.57501 2.49578 5.55788L0.440781 4.76757C0.311115 4.71763 0.199617 4.62959 0.120977 4.51504C0.0423369 4.40048 0.000244141 4.2648 0.000244141 4.12585C0.000244141 3.9869 0.0423369 3.85121 0.120977 3.73666C0.199617 3.6221 0.311115 3.53406 0.440781 3.48413L2.49578 2.69382C2.54068 2.67661 2.58145 2.65015 2.61545 2.61615C2.64945 2.58215 2.67592 2.54137 2.69312 2.49647L3.47641 0.459753C3.52058 0.339848 3.59659 0.234248 3.69628 0.154301C3.79596 0.0743549 3.91555 0.0230855 4.04219 0.00600317C4.19423 -0.0124795 4.34808 0.0203229 4.47936 0.0992091C4.61064 0.178095 4.71183 0.29855 4.76687 0.441472L5.55719 2.49647C5.57439 2.54137 5.60086 2.58215 5.63486 2.61615C5.66886 2.65015 5.70963 2.67661 5.75453 2.69382L7.80953 3.48413C7.9392 3.53406 8.05069 3.6221 8.12933 3.73666C8.20797 3.85121 8.25007 3.9869 8.25007 4.12585C8.25007 4.2648 8.20797 4.40048 8.12933 4.51504C8.05069 4.62959 7.9392 4.71763 7.80953 4.76757L5.75453 5.55788C5.70959 5.57501 5.66877 5.60144 5.63476 5.63545C5.60075 5.66946 5.57432 5.71028 5.55719 5.75522L4.76687 7.81022C4.71696 7.93991 4.62892 8.05142 4.51436 8.13008C4.39981 8.20873 4.26411 8.25084 4.12516 8.25085Z" />
    <path d="M18.7502 12.0008C18.5986 12.0008 18.4505 11.9548 18.3256 11.869C18.2007 11.7831 18.1047 11.6614 18.0503 11.5199L16.9797 8.73694C16.9609 8.6879 16.9319 8.64337 16.8948 8.60622C16.8576 8.56908 16.8131 8.54015 16.7641 8.52132L13.9811 7.45069C13.8397 7.39621 13.7181 7.30019 13.6324 7.17526C13.5467 7.05033 13.5008 6.90237 13.5008 6.75085C13.5008 6.59933 13.5467 6.45136 13.6324 6.32643C13.7181 6.20151 13.8397 6.10548 13.9811 6.051L16.7641 4.98038C16.8131 4.96154 16.8576 4.93262 16.8948 4.89547C16.9319 4.85833 16.9609 4.81379 16.9797 4.76475L18.0423 2.00147C18.0909 1.8708 18.1739 1.75572 18.2826 1.66847C18.3913 1.58123 18.5216 1.52508 18.6597 1.506C18.8256 1.48592 18.9935 1.52182 19.1366 1.60802C19.2798 1.69422 19.3901 1.82576 19.45 1.98178L20.5206 4.76475C20.5395 4.81379 20.5684 4.85833 20.6055 4.89547C20.6427 4.93262 20.6872 4.96154 20.7362 4.98038L23.5192 6.051C23.6606 6.10548 23.7822 6.20151 23.8679 6.32643C23.9537 6.45136 23.9996 6.59933 23.9996 6.75085C23.9996 6.90237 23.9537 7.05033 23.8679 7.17526C23.7822 7.30019 23.6606 7.39621 23.5192 7.45069L20.7362 8.52132C20.6872 8.54015 20.6427 8.56908 20.6055 8.60622C20.5684 8.64337 20.5395 8.6879 20.5206 8.73694L19.45 11.5199C19.3956 11.6614 19.2996 11.7831 19.1747 11.869C19.0498 11.9548 18.9017 12.0008 18.7502 12.0008Z" />
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

// Всего аватарок в шапке — не более этого числа (главный бот + доп. операторы).
const MAX_OPERATOR_AVATARS = 5

// Кружок аватара: сама картинка обрезается по кругу (overflow-hidden), а индикатор статуса
// вынесен в внешний контейнер — иначе он обрезался бы кругом и показывался не полностью.
const AvatarCircle = ({
  online,
  bg,
  z,
  children,
}: {
  online: boolean
  bg: string
  z: number
  children: React.ReactNode
}) => (
  <div className="relative w-9 h-9 shrink-0" style={{ zIndex: z }}>
    <div className={cn('w-full h-full rounded-full ring-2 ring-white overflow-hidden flex items-center justify-center', bg)}>
      {children}
    </div>
    <StatusDot online={online} />
  </div>
)

// <img> с фолбэком: при ошибке загрузки (битый/недоступный URL) скрываем картинку и показываем
// запасной контент (инициал / иконку), а не «сломанное изображение».
const ImgWithFallback = ({
  src,
  className,
  fallback,
}: {
  src: string
  className: string
  fallback: ReactNode
}) => {
  const [broken, setBroken] = useState(false)
  if (broken) return <>{fallback}</>
  return <img src={src} alt="" className={className} onError={() => setBroken(true)} />
}

const OperatorAvatars = ({
  operators,
  primaryAvatarUrl,
  online,
}: {
  operators?: OperatorInfo[]
  primaryAvatarUrl?: string
  online: boolean
}) => {
  // Реальные операторы проекта (если подтянулись) — аватар или инициал, индикатор по каждому.
  const list = (operators ?? []).slice(0, MAX_OPERATOR_AVATARS)
  if (list.length > 0) {
    return (
      <div className="flex items-center justify-center -space-x-2">
        {list.map((op, i) => (
          <AvatarCircle key={op.id} online={op.online} bg="bg-[#E9E4DC]" z={list.length - i}>
            {op.avatarUrl
              ? <ImgWithFallback src={op.avatarUrl} className="w-full h-full object-cover" fallback={<span className="text-[15px] font-semibold text-[#6E6E76]">{(op.name || '?').charAt(0).toUpperCase()}</span>} />
              : <span className="text-[15px] font-semibold text-[#6E6E76]">{(op.name || '?').charAt(0).toUpperCase()}</span>}
          </AvatarCircle>
        ))}
      </div>
    )
  }

  // Фолбэк (операторы не подтянулись): бот + плейсхолдеры.
  const secondaryCount = Math.max(0, Math.min(3, MAX_OPERATOR_AVATARS - 1))
  const total = secondaryCount + 1
  return (
    <div className="flex items-center justify-center -space-x-2">
      <AvatarCircle online={online} bg="bg-white" z={total}>
        {primaryAvatarUrl
          ? <ImgWithFallback src={primaryAvatarUrl} className="w-full h-full object-cover" fallback={<span className="text-[16px]">🤖</span>} />
          : <span className="text-[16px]">🤖</span>}
      </AvatarCircle>
      {Array.from({ length: secondaryCount }).map((_, i) => (
        <AvatarCircle key={i} online={false} bg="bg-[#E9E4DC]" z={total - 1 - i}>
          <span className="text-[16px]">🧑‍🚀</span>
        </AvatarCircle>
      ))}
    </div>
  )
}

const IconDots = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
)

const IconBackHeader = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

/** Компактная шапка экрана чата (из макета): «Назад» · аватар · имя/подзаголовок · меню. */
const CompactHeader = ({
  accent,
  operatorName,
  operatorSubtitle,
  operatorAvatarUrl,
  avatarInitial,
  operatorOnline,
  canGoBack,
  showClose,
  onBack,
  onClose,
  onEndDialog,
  onDownloadDialog,
}: {
  accent: string
  operatorName: string
  operatorSubtitle?: string
  operatorAvatarUrl?: string
  avatarInitial?: string
  operatorOnline: boolean
  canGoBack: boolean
  showClose?: boolean
  onBack: () => void
  onClose: () => void
  onEndDialog: () => void
  onDownloadDialog: () => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="relative rounded-[18px] px-3.5 py-2.5 flex items-center gap-2.5"
      style={{ backgroundColor: accent }}
    >
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="shrink-0 -ml-0.5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <IconBackHeader color="#FFFFFF" />
        </button>
      )}

      <div className="relative w-9 h-9 shrink-0">
        <div className="w-full h-full rounded-full ring-2 ring-white/70 overflow-hidden bg-white flex items-center justify-center">
          {operatorAvatarUrl
            ? <ImgWithFallback src={operatorAvatarUrl} className="w-full h-full object-cover" fallback={avatarInitial ? <span className="text-[15px] font-semibold text-[#6E6E76]">{avatarInitial}</span> : <span className="text-[15px]">🤖</span>} />
            : avatarInitial
              ? <span className="text-[15px] font-semibold text-[#6E6E76]">{avatarInitial}</span>
              : <span className="text-[15px]">🤖</span>}
        </div>
        <StatusDot online={operatorOnline} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-white text-[16px] leading-5 font-semibold truncate">{operatorName}</div>
        {operatorSubtitle && (
          <div className="text-white/80 text-[13px] leading-4 truncate">{operatorSubtitle}</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Меню диалога"
        aria-expanded={menuOpen}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
      >
        <IconDots color="#FFFFFF" />
      </button>

      {showClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть чат"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}

      {menuOpen && (
        <>
          {/* Клик вне меню — закрыть. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-2 top-[50px] z-20 min-w-49 rounded-[14px] bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.18)] overflow-hidden">
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onEndDialog() }}
              className="w-full px-5 py-3.5 text-left text-[17px] text-[#1A1A1A] hover:bg-[#F4F2FC] transition-colors"
            >
              Завершить диалог
            </button>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onDownloadDialog() }}
              className="w-full px-5 py-3.5 text-left text-[17px] text-[#1A1A1A] border-t border-[#EDEDF0] hover:bg-[#F4F2FC] transition-colors"
            >
              Скачать диалог
            </button>
          </div>
        </>
      )}
    </div>
  )
}

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
  <div className="shrink-0 h-10 flex items-center justify-around px-6 border-b border-[#EFEFF2]">
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
  const [imgBroken, setImgBroken] = useState(false)

  if (isSystem) {
    return (
      <div className="w-full flex justify-center my-1">
        <span className="text-xs text-[#979797] text-center px-4">{message.body}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('w-full flex flex-col', isVisitor ? 'items-end' : 'items-start')}
    >
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
        {/* Галерея (мультивложения от оператора): картинки сеткой + видео/файлы */}
        {message.attachments && message.attachments.length > 0 && (() => {
          const imgs = message.attachments.filter(a => a.type === 'image')
          const files = message.attachments.filter(a => a.type !== 'image')
          return (
            <div className={cn('flex flex-col gap-1.5', message.body && 'mb-2')}>
              {imgs.length > 0 && (
                <div className={cn('grid gap-1.5', imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                  {imgs.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block">
                      <img src={a.url} alt={a.name ?? ''} className={cn('w-full object-cover rounded-[12px]', imgs.length === 1 ? 'max-h-[220px]' : 'h-[110px]')} />
                    </a>
                  ))}
                </div>
              )}
              {files.map((a, i) =>
                a.type === 'video' ? (
                  <video key={`v${i}`} src={a.url} controls className="w-full max-h-[240px] rounded-[12px]" />
                ) : (
                  <a key={`f${i}`} href={a.url} target="_blank" rel="noreferrer" download className={cn('flex items-center gap-2 underline break-all', isVisitor ? 'text-white' : 'text-[#1A52DB]')}>
                    📎 {a.name ?? 'Файл'}
                  </a>
                ),
              )}
            </div>
          )
        })()}
        {!message.attachments?.length && message.image && !imgBroken && (
          <a href={message.image} target="_blank" rel="noreferrer" className="block">
            <img
              src={message.image}
              alt=""
              onError={() => setImgBroken(true)}
              className={cn('w-full max-h-[220px] object-cover rounded-[12px]', message.body && 'mb-2')}
            />
          </a>
        )}
        {!message.attachments?.length && message.attachmentType === 'video' && message.attachmentUrl && (
          <video
            src={message.attachmentUrl}
            controls
            className={cn('w-full max-h-[240px] rounded-[12px]', message.body && 'mb-2')}
          />
        )}
        {!message.attachments?.length && message.attachmentType === 'file' && message.attachmentUrl && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            download
            className={cn(
              'flex items-center gap-2 underline break-all',
              message.body && 'mb-2',
              isVisitor ? 'text-white' : 'text-[#1A52DB]',
            )}
          >
            📎 {message.attachmentName ?? 'Файл'}
          </a>
        )}
        {message.body && (
          <span className="whitespace-pre-wrap break-words">{renderMarkdown(message.body)}</span>
        )}
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
    </motion.div>
  )
}

// Пузырь «печатает…»: три точки с лёгкой волной (имитация набора оператором).
const TypingBubble = () => (
  <div className="w-full flex items-start">
    <div className="bg-[#F4F2FC] rounded-[16px] rounded-bl-[6px] px-4 py-3.5 flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#B0AEBA] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
        />
      ))}
    </div>
  </div>
)

// Индикатор живого набора оператором: подпись «Оператор набирает текст…» + три точки.
const OperatorTypingBubble = () => (
  <div className="w-full flex items-start">
    <div className="bg-[#F4F2FC] rounded-[16px] rounded-bl-[6px] px-4 py-3 flex items-center gap-2">
      <span className="text-[13px] text-[#7A7785]">Оператор набирает текст</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#B0AEBA] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
          />
        ))}
      </span>
    </div>
  </div>
)

const FORM_GREEN = '#56B65C'

const ContactForm = ({
  contacts,
  disabled,
  online,
  onSubmit,
}: {
  contacts: ContactsCfg
  disabled?: boolean
  // Оператор онлайн — собираем только контакты и «Начать чат» (без поля сообщения).
  online?: boolean
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
      <form onSubmit={submit} className="rounded-[16px] border border-[#E3E3E8] p-4 flex flex-col gap-3">
        <div className="text-[24px] leading-7 font-bold text-[#1A1A1A]">
          {online ? 'Начать чат' : 'Оставить сообщение'}
        </div>
        <p className="text-[16px] leading-5.5 text-[#1A1A1A]">
          {online
            ? 'Оставьте контакты, и мы начнём диалог'
            : 'Заполните форму и мы обязательно свяжемся с вами'}
        </p>

        {contacts.name.enabled && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ФИО" className={inputCx} />
        )}
        {contacts.phone.enabled && (
          <PatternFormat
            value={phone.startsWith('+7') ? phone.slice(2) : phone}
            format="+7 ### ### ## ##"
            mask=" "
            type="tel"
            inputMode="numeric"
            placeholder="+7 ___ ___ __ __"
            onValueChange={v => setPhone(v.value ? `+7${v.value}` : '')}
            className={inputCx}
          />
        )}
        {contacts.email.enabled && (
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCx} />
        )}
        {/* Поле сообщения — только когда оператор офлайн (заявка). */}
        {!online && (
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Вопрос или комментарий"
            rows={2}
            className={cn(inputCx, 'h-auto py-3 resize-none')}
          />
        )}

        <button
          type="submit"
          disabled={!valid || disabled}
          className="h-13 rounded-[12px] flex items-center justify-center gap-2 text-white text-[17px] disabled:opacity-50"
          style={{ backgroundColor: FORM_GREEN }}
        >
          {online ? 'Начать чат' : 'Отправить сообщение'}
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
  onSubmit,
}: {
  accent: string
  preview?: boolean
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
          <PatternFormat
            value={phone.startsWith('+7') ? phone.slice(2) : phone}
            format="+7 ### ### ## ##"
            mask=" "
            type="tel"
            inputMode="numeric"
            placeholder="+7 ___ ___ __ __"
            onValueChange={v => setPhone(v.value ? `+7${v.value}` : '')}
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

// Лоадер при переключении разделов-вкладок.
const Spinner = ({ color }: { color: string }) => (
  <span
    className="inline-block w-8 h-8 rounded-full animate-spin"
    style={{ border: `3px solid ${color}33`, borderTopColor: color }}
  />
)

const Widget = (props: WidgetProps) => {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Текущая вкладка-раздел (home/chat — одна группа). При смене показываем краткий
  // лоадер и плавно проявляем контент — иначе мгновенная подмена «мигает».
  const viewKey = props.view === 'home' || props.view === 'chat' ? 'chat' : props.view
  const [tabLoading, setTabLoading] = useState(false)
  const prevViewKeyRef = useRef(viewKey)
  useEffect(() => {
    if (prevViewKeyRef.current === viewKey) return
    prevViewKeyRef.current = viewKey
    setTabLoading(true)
    const t = setTimeout(() => setTabLoading(false), 280)
    return () => clearTimeout(t)
  }, [viewKey])

  useEffect(() => {
    // Автоскролл вниз — только на экране чата; на главном экране (только кнопки) не трогаем скролл.
    if (props.view !== 'chat') return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [props.messages, props.open, props.view, props.typing, props.operatorTyping])

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

  // Шапка: подтягиваем реальных операторов проекта. Главный = первый онлайн (иначе первый);
  // имя/роль/аватар берём у него, иначе — значения из конфига.
  const onlineOperators = props.operators.filter(o => o.online)
  const primaryOperator = onlineOperators[0] ?? props.operators[0]
  const headerName = primaryOperator?.name ?? props.operatorName
  const headerSubtitle = primaryOperator?.role ?? props.operatorSubtitle
  // Аватар: фото оператора → его инициал (единый фолбэк, в т.ч. если фото не загрузилось) → конфиг → бот.
  const headerAvatarUrl = primaryOperator ? primaryOperator.avatarUrl ?? undefined : props.operatorAvatarUrl
  const headerAvatarInitial = primaryOperator
    ? (primaryOperator.name || '?').charAt(0).toUpperCase()
    : undefined
  const showQuickReplies = props.quickReplies.length > 0

  const isSidebar = props.windowFormat === 'sidebar' && !props.mobile

  const mobileStyle: CSSProperties | undefined = props.mobile
    ? { maxHeight: window.innerHeight - 96, width: 'min(380px, 94vw)' }
    : undefined

  const sidebarSide = props.sidebarSide ?? 'right'

  return (
    <AnimatePresence>
      {props.open && (
        <div style={mobileStyle} className={cn('relative', isSidebar && 'h-full')}>
          {/* Боковая панель: круглая кнопка закрытия, выступающая за внутренний край блока. */}
          {isSidebar && (
            <button
              type="button"
              onClick={props.onClose}
              aria-label="Закрыть чат"
              className={cn(
                'absolute top-4 z-20 w-10 h-10 rounded-full flex items-center justify-center',
                'text-white shadow-[0px_4px_14px_rgba(0,0,0,0.25)] hover:opacity-90 transition-opacity',
                // Полностью за блоком: ширина 40px + зазор 8px → 48px наружу.
                sidebarSide === 'right' ? '-left-12' : '-right-12',
              )}
              style={{ backgroundColor: accent }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
          <motion.div
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionTransition}
            className={cn(
              'w-[380px] max-w-[94vw] shrink-0 flex flex-col overflow-hidden',
              isSidebar ? 'h-full max-h-full' : 'h-[620px] max-h-[78vh]',
              'shadow-[0px_8px_24px_rgba(0,0,0,0.10)]',
            )}
            style={{
              backgroundColor: props.windowBackgroundColor,
              borderRadius: isSidebar ? 0 : props.windowRadius,
            }}
          >
            <>
            {/* Шапка: на первом экране — большая (логотип, аватары, статус, приветствие);
                на экране чата и глубже — компактная из макета (аватар, имя, три точки). */}
            <div className="shrink-0 p-3">
              {props.view === 'home' ? (
                <div
                  className="relative rounded-[18px] px-5 pt-4 pb-4 flex flex-col gap-2.5"
                  style={{ backgroundColor: accent }}
                >
                  {/* Логотип слева, аватары операторов на одном уровне справа. */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-9 flex items-center">
                      {props.companyLogoUrl
                        ? <ImgWithFallback src={props.companyLogoUrl} className="max-h-9 max-w-[120px] object-contain" fallback={<IconBot color="#FFFFFF" />} />
                        : <IconBot color="#FFFFFF" />}
                    </div>

                    <OperatorAvatars
                      operators={props.operators}
                      primaryAvatarUrl={props.operatorAvatarUrl}
                      online={props.operatorOnline}
                    />
                  </div>

                  {(props.operatorOnline ? props.onlineMessageEnabled : props.offlineMessageEnabled) && (
                    <div className="text-center text-white whitespace-pre-line text-[15px] leading-5 opacity-90">
                      {props.operatorOnline ? props.onlineMessage : props.offlineMessage}
                    </div>
                  )}

                  {props.welcomeTitle.trim() && (
                    <div
                      className="whitespace-pre-line mt-1"
                      style={{
                        color: props.welcomeTitleColor,
                        fontSize: props.welcomeTitleSize,
                        fontWeight: props.welcomeTitleWeight,
                        lineHeight: 1.2,
                        textAlign: props.welcomeTitleAlign,
                      }}
                    >
                      {props.welcomeTitle}
                    </div>
                  )}
                </div>
              ) : (
                <CompactHeader
                  accent={accent}
                  operatorName={headerName}
                  operatorSubtitle={headerSubtitle}
                  operatorAvatarUrl={headerAvatarUrl ?? undefined}
                  avatarInitial={headerAvatarInitial}
                  operatorOnline={props.operatorOnline}
                  canGoBack={props.canGoBack}
                  showClose={false}
                  onBack={props.onBack}
                  onClose={props.onClose}
                  onEndDialog={props.onEndDialog}
                  onDownloadDialog={props.onDownloadDialog}
                />
              )}
            </div>

            {/* Ряд иконок-вкладок */}
            <TabBar
              accent={accent}
              active={props.view === 'contacts' || props.view === 'callback' ? 'contacts' : 'chat'}
              onChat={props.onTabChat}
              onContacts={props.onTabContacts}
              onAi={props.onTabAi}
            />

            {/* Переключение разделов-вкладок: краткий лоадер + плавное появление (без «мигания»). */}
            {tabLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner color={accent} />
              </div>
            ) : (
            <motion.div
              key={viewKey}
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
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
                onSubmit={props.onSubmitCallback}
              />
            )}

            {props.view === 'form' && (
              <ContactForm
                contacts={props.contacts}
                disabled={props.disabled}
                online={props.operatorOnline}
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
              {/* Лента сообщений — только на экране чата (первый экран показывает только кнопки) */}
              {props.view === 'chat' && props.messages.map(message => (
                <MessageBubble key={message.id} message={message} clientColor={props.clientColor} />
              ))}

              {/* Бот «печатает…» перед авто-переходом к следующему шагу. */}
              {props.view === 'chat' && props.typing && <TypingBubble />}

              {/* Живой оператор набирает текст. */}
              {props.view === 'chat' && props.operatorTyping && <OperatorTypingBubble />}

            {/* Кнопки сценария: на главном экране (меню) и в переписке под сообщениями.
                В режиме живого оператора (chatActive) кнопки бота не показываем. */}
            {(props.view === 'home' || (props.view === 'chat' && !props.chatActive)) && showQuickReplies && (() => {
              const regular = props.quickReplies.filter(q => !q.isHandoff)
              const handoff = props.quickReplies.filter(q => q.isHandoff)
              const btnDisabled = props.disabled || props.chatActive
              return (
                <div className="w-full flex flex-col gap-3 mt-1">
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
            </div>

            {/* Низ окна — только на экране чата (на первом экране поля сообщения нет):
                завершён оператором → «Начать беседу»; иначе живой чат / «Войти в чат» (онлайн) /
                поле сообщения (офлайн) / подтверждение. */}
            {props.view === 'chat' && (props.ended ? (
              <div className="shrink-0 px-4 pt-2 pb-3">
                <button
                  type="button"
                  onClick={() => props.onRestart?.()}
                  className="w-full h-12 rounded-[12px] text-white text-[16px] font-medium"
                  style={{ backgroundColor: accent }}
                >
                  Начать беседу
                </button>
              </div>
            ) : props.chatActive ? (
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
                  {/* Скрытый input — открывается кнопками «+» и «скрепка». */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) props.onAttach?.(file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Добавить вложение"
                    className="shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ border: `1.6px solid ${accent}` }}
                    >
                      <IconPlus color={accent} />
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Вложение"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconClip color="#8E8B97" />
                  </button>
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
            ))}

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
            </motion.div>
            )}
            </>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Widget
