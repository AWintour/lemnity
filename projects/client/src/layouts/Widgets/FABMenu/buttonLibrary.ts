import iconCalendar from '@/assets/icons/calendar.svg'
import iconVK from '@/assets/icons/vk.svg'
import iconCustom from '@/assets/icons/project-emblem.svg'
import iconEmail from '@/assets/icons/closed-envelope.svg'
import iconPhone from '@/assets/icons/telephone.svg'
import iconTelegram from '@/assets/icons/telegram.svg'
import iconWebsite from '@/assets/icons/web-globe.svg'
import iconMaxMessage from '@/assets/icons/max-messenger.svg'
import iconWhatsappMessage from '@/assets/icons/whatsapp.svg'
import iconInstagram from '@/assets/icons/instagram.svg'
import iconYoutube from '@/assets/icons/youtube.svg'
import iconOk from '@/assets/icons/ok.svg'
import type {
  FABMenuIconKey,
  FABMenuPayloadType,
  FABMenuSectorPayload
} from '@/layouts/Widgets/FABMenu/types'

export type FABMenuButtonGroupId = 'universal' | 'messenger' | 'social' | 'misc'

export type FABMenuButtonDefinition = {
  icon: FABMenuIconKey
  label: string
  buttonLabel: string
  group: FABMenuButtonGroupId
  payload: FABMenuSectorPayload
  description?: string
  color: string
  gradientColors?: string[]
  textColor?: string
  showIcon?: boolean
  messengerBaseUrl?: string
}

export const FAB_MENU_BUTTON_GROUPS:
  { id: FABMenuButtonGroupId; label: string }[] = [
    { id: 'universal', label: 'Универсальные' },
    { id: 'messenger', label: 'Общение' },
    { id: 'social', label: 'Соцсети' },
    { id: 'misc', label: 'Разное' }
  ]

export const FAB_MENU_PAYLOAD_PLACEHOLDERS:
  Record<FABMenuPayloadType, string> = {
    email: 'hello@lemnity.ru',
    phone: '+7 (000) 000-00-00',
    link: 'lemnity',
    nickname: 'lemnity',
    script: "<script id='pixel-script-poptin' src='https://'></script>",
    anchor: '#form'
  }

export const FAB_MENU_BUTTON_PRESETS: FABMenuButtonDefinition[] = [
  {
    icon: 'email',
    label: 'Написать на email',
    buttonLabel: 'Email',
    group: 'universal',
    color: '#5951E5',
    payload: { type: 'email', value: FAB_MENU_PAYLOAD_PLACEHOLDERS.email },
    description: 'Отправьте письмо на мыло'
  },
  {
    icon: 'phone',
    label: 'Обратный звонок',
    buttonLabel: 'Телефон',
    group: 'universal',
    color: '#5951E5',
    payload: { type: 'phone', value: FAB_MENU_PAYLOAD_PLACEHOLDERS.phone },
    description: 'Наш менеджер перезвонит'
  },
  {
    icon: 'website',
    label: 'Наш сайт',
    buttonLabel: 'Сайт',
    group: 'universal',
    color: '#5951E5',
    payload: { type: 'link', value: 'lemnity.ru' }
  },
  {
    icon: 'calendar',
    label: 'Забронировать',
    buttonLabel: 'Забронировать',
    group: 'universal',
    color: '#5951E5',
    payload: { type: 'script', value: FAB_MENU_PAYLOAD_PLACEHOLDERS.script }
  },
  {
    icon: 'custom',
    label: 'Свободная форма',
    buttonLabel: 'Свободная форма',
    group: 'universal',
    color: '#5951E5',
    payload: { type: 'link', value: '' },
    showIcon: false
  },
  {
    icon: 'telegram-message',
    label: 'Telegram',
    buttonLabel: 'Телеграм',
    group: 'messenger',
    messengerBaseUrl: 'https://t.me/',
    color: '#2F80ED',
    payload: { type: 'nickname', value: '@lemnity' }
  },
  {
    icon: 'vk-message',
    label: 'VK Мессенджер',
    buttonLabel: 'ВК Мессенджер',
    group: 'messenger',
    messengerBaseUrl: 'https://vk.me/',
    color: '#4C77A6',
    payload: { type: 'nickname', value: 'lemnity' }
  },
  {
    icon: 'max-message',
    label: 'MAX',
    buttonLabel: 'MAX',
    group: 'messenger',
    color: '#FFFFFF',
    messengerBaseUrl: 'https://',
    gradientColors: ['#3AB4FD', '#A652DD'],
    textColor: '#FFFFFF',
    payload: { type: 'nickname', value: '@lemnity' }
  },
  {
    icon: 'whatsapp-message',
    label: 'WhatsApp',
    buttonLabel: 'WhatsApp*',
    group: 'messenger',
    color: '#0DC143',
    payload: { type: 'nickname', value: '@lemnity' }
  },
  {
    icon: 'telegram-channel',
    label: 'Телеграм канал',
    buttonLabel: 'Телеграм канал',
    group: 'social',
    color: '#2F80ED',
    payload: { type: 'link', value: 't.me/lemnity' }
  },
  {
    icon: 'vk',
    label: 'ВКонтакте',
    buttonLabel: 'Вконтакте',
    group: 'social',
    color: '#4C77A6',
    payload: { type: 'link', value: 'vk.com/lemnity' }
  },
  {
    icon: 'instagram',
    label: 'Instagram',
    buttonLabel: 'Instagram*',
    group: 'social',
    color: '#14B8A6',
    gradientColors: ['#7524C0', '#C3266B', '#D98741'],
    payload: { type: 'link', value: 't.me/lemnity' }
  },
  {
    icon: 'youtube',
    label: 'YouTube',
    buttonLabel: 'YouTube',
    group: 'social',
    color: '#FF0000',
    payload: { type: 'link', value: 't.me/lemnity' }
  },
  {
    icon: 'ok',
    label: 'OK',
    buttonLabel: 'OK',
    group: 'social',
    color: '#EE8208',
    payload: { type: 'link', value: 't.me/lemnity' }
  }
]

const FAB_MENU_ICON_MAP: Record<FABMenuIconKey, string> = {
  email: iconEmail,
  phone: iconPhone,
  website: iconWebsite,
  calendar: iconCalendar,
  vk: iconVK,
  'vk-message': iconVK,
  'telegram-message': iconTelegram,
  'telegram-channel': iconTelegram,
  'max-message': iconMaxMessage,
  'whatsapp-message': iconWhatsappMessage,
  instagram: iconInstagram,
  youtube: iconYoutube,
  ok: iconOk,
  custom: iconCustom
}

export const FAB_MENU_ICON_OPTIONS: Record<
  FABMenuIconKey,
  { label: string; icon: string; showIcon: boolean }
> = FAB_MENU_BUTTON_PRESETS.reduce(
  (acc, preset) => {
    if (!preset.icon) return acc

    const iconSrc = FAB_MENU_ICON_MAP[preset.icon]
    if (!iconSrc) return acc

    acc[preset.icon] = {
      label: preset.label,
      icon: iconSrc,
      showIcon: preset.showIcon ?? true,
    }
    return acc
  },
  {} as Record<
          FABMenuIconKey,
          { label: string; icon: string; showIcon: boolean }
        >
)
