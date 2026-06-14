import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import Widget from './Widget'
import DesktopWidgetTrigger from './DesktopWidgetTrigger'
import MobileWidgetTrigger from './MobileWidgetTrigger'
import { useChatConnection } from './useChatConnection'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { uuidv4 } from '@/common/utils/uuidv4'
import messageSoundUrl from '@/assets/zvuk-chat.mp3'

import type { ChatWidgetType, Scenario } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from '../defaults'
import type { ChatUiMessage } from './types'
import type { QuickReply } from './Widget'

type ChatView = 'home' | 'chat' | 'form' | 'contacts' | 'callback'

type ChatEmbedRuntimeProps = {
  preview?: boolean
}

const ChatEmbedRuntime = (props: ChatEmbedRuntimeProps) => {
  const {
    triggerText,
    triggerFontColor,
    triggerIcon,
    triggerBackgroundColor,
    triggerPosition,
    operatorName,
    operatorAvatarUrl,
    companyLogo,
    welcomeTitle,
    welcomeTitleSize,
    welcomeTitleColor,
    welcomeTitleAlign,
    greetingMessage,
    onlineMessage,
    offlineMessage,
    placeholder,
    windowFormat,
    windowRadius,
    windowBackgroundColor,
    windowAccentColor,
    clientColor,
    autoOpen,
    delay,
    brandingEnabled,
    soundEnabled,
    scenario,
    contacts,
    contactsTab,
    aiAgentEnabled,
    aiAgentName,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)

      return {
        triggerText: settings.triggerText ?? defaults.triggerText,
        triggerFontColor: settings.triggerFontColor ?? defaults.triggerFontColor,
        triggerIcon: settings.triggerIcon ?? defaults.triggerIcon,
        triggerBackgroundColor:
          settings.triggerBackgroundColor ?? defaults.triggerBackgroundColor,
        triggerPosition: settings.triggerPosition ?? defaults.triggerPosition,

        operatorName: settings.operatorName ?? defaults.operatorName,
        operatorAvatarUrl: settings.operatorAvatarUrl ?? defaults.operatorAvatarUrl,
        companyLogo: settings.companyLogo ?? defaults.companyLogo,
        welcomeTitle: settings.welcomeTitle ?? defaults.welcomeTitle,
        welcomeTitleSize: settings.welcomeTitleSize ?? defaults.welcomeTitleSize,
        welcomeTitleColor: settings.welcomeTitleColor ?? defaults.welcomeTitleColor,
        welcomeTitleAlign: settings.welcomeTitleAlign ?? defaults.welcomeTitleAlign,
        greetingMessage: settings.greetingMessage ?? defaults.greetingMessage,
        onlineMessage: settings.onlineMessage ?? defaults.onlineMessage,
        offlineMessage: settings.offlineMessage ?? defaults.offlineMessage,
        placeholder: settings.placeholder ?? defaults.placeholder,
        windowFormat: settings.windowFormat ?? defaults.windowFormat,
        windowRadius: settings.windowRadius ?? defaults.windowRadius,
        windowBackgroundColor:
          settings.windowBackgroundColor ?? defaults.windowBackgroundColor,
        windowAccentColor: settings.windowAccentColor ?? defaults.windowAccentColor,
        clientColor: settings.clientColor ?? defaults.clientColor,

        autoOpen: settings.autoOpen ?? defaults.autoOpen,
        delay: settings.delay ?? defaults.delay,

        brandingEnabled: settings.brandingEnabled ?? defaults.brandingEnabled,
        soundEnabled: settings.soundEnabled ?? defaults.soundEnabled,
        scenario: (settings.scenario ?? defaults.scenario) as Scenario,
        contacts: settings.contacts ?? defaults.contacts,
        contactsTab: settings.contactsTab ?? defaults.contactsTab,
        aiAgentEnabled: settings.aiAgentEnabled ?? defaults.aiAgentEnabled,
        aiAgentName: settings.aiAgentName ?? defaults.aiAgentName,
      }
    })
  )

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatUiMessage[]>([])
  const [currentStepId, setCurrentStepId] = useState<string | null>(null)
  const [mode, setMode] = useState<'bot' | 'operator'>('bot')
  // Офлайн-сообщение отправлено (показываем подтверждение вместо поля).
  const [offlineSent, setOfflineSent] = useState(false)
  // 'home' — первый экран (меню), 'chat' — переписка, 'form'/'callback' — формы, 'contacts' — вкладка.
  const [view, setView] = useState<ChatView>('home')
  const [formHeader, setFormHeader] = useState('Чат с менеджерами')
  // Стек экранов — кнопка «Назад» возвращает на предыдущий.
  const historyRef = useRef<ChatView[]>([])
  const navigate = useCallback((next: ChatView) => {
    setView(prev => {
      if (prev !== next) historyRef.current.push(prev)
      return next
    })
  }, [])
  const goBack = useCallback(() => {
    setView(historyRef.current.pop() ?? 'home')
  }, [])
  const [unreadCount, setUnreadCount] = useState(0)
  const openRef = useRef(false)
  openRef.current = open

  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const mouseLeaveTimeoutRef = useRef<number | null>(null)
  const firstMountCrutchRef = useRef(false)
  const isMobileViewport = useIsMobileViewport()

  const stepById = useMemo(
    () => new Map(scenario.steps.map(s => [s.id, s])),
    [scenario.steps]
  )

  // Звук нового сообщения (играет только если включён в настройках «Звук сообщений»).
  const messageAudioRef = useRef<HTMLAudioElement | null>(null)
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled
  const playMessageSound = useCallback(() => {
    if (!soundEnabledRef.current) return
    try {
      let audio = messageAudioRef.current
      if (!audio) {
        audio = new Audio(messageSoundUrl)
        audio.volume = 0.6
        messageAudioRef.current = audio
      }
      audio.currentTime = 0
      void audio.play().catch(() => {})
    } catch {
      /* autoplay/политика браузера — игнорируем */
    }
  }, [])

  // Добавление сообщения с дедупликацией и сведе́нием optimistic-сообщений посетителя.
  const append = useCallback((incoming: ChatUiMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === incoming.id)) return prev
      if (incoming.sender === 'visitor') {
        const idx = prev.findIndex(
          m => m.pending && m.sender === 'visitor' && m.body === incoming.body
        )
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = incoming
          return next
        }
      }
      if (incoming.sender === 'manager') {
        if (!openRef.current) setUnreadCount(c => c + 1)
        playMessageSound()
      }
      return [...prev, incoming]
    })
  }, [playMessageSound])

  const { operatorOnline, sendToOperator, markRead, updateContact } = useChatConnection({
    widgetId: useWidgetSettingsStore.getState().settings?.id,
    preview: props.preview,
    onIncoming: append,
  })

  // Сид: при включённом сценарии лента пустая (приветствие — крупным заголовком в шапке,
  // варианты — кнопки стартового шага). Без сценария — приветствие отдельным сообщением.
  useEffect(() => {
    historyRef.current = []
    if (scenario.enabled) {
      const start = stepById.get(scenario.startStepId)
      setMessages([])
      setCurrentStepId(start?.id ?? null)
      setView('home')
    } else {
      setMessages([
        { id: 'greeting', sender: 'manager', body: greetingMessage, createdAt: new Date(0).toISOString() },
      ])
      setCurrentStepId(null)
      setView('chat')
    }
    setMode('bot')
    setOfflineSent(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greetingMessage, scenario, props.preview])

  // Автооткрытие окна.
  useEffect(() => {
    if (props.preview || !autoOpen) return
    const timer = setTimeout(() => setOpen(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [props.preview, autoOpen, delay])

  // Кнопки текущего шага показываем всегда (закреплены над текстом); в режиме оператора
  // Widget рендерит их неактивными (см. chatActive). Поэтому без гейта по mode.
  const quickReplies: QuickReply[] = useMemo(() => {
    if (!scenario.enabled || !currentStepId) return []
    const step = stepById.get(currentStepId)
    if (!step) return []
    return step.buttons.map(b => ({ id: b.id, emoji: b.emoji, label: b.label, isHandoff: b.next === null }))
  }, [scenario.enabled, currentStepId, stepById])

  const nowIso = () => new Date().toISOString()

  const handleQuickReply = useCallback((buttonId: string) => {
    const step = currentStepId ? stepById.get(currentStepId) : undefined
    const button = step?.buttons.find(b => b.id === buttonId)
    if (!button) return

    if (button.next === null) {
      // Хэндоф к живому оператору. Если включён сбор контактов — сначала форма.
      const needForm =
        contacts.when !== 'never' &&
        (contacts.name.enabled || contacts.phone.enabled || contacts.email.enabled)
      if (needForm) {
        setFormHeader(button.label || 'Чат с менеджерами')
        navigate('form')
        return
      }
      navigate('chat')
      setMode('operator')
      append({ id: uuidv4(), sender: 'visitor', body: `${button.emoji ? button.emoji + ' ' : ''}${button.label}`, createdAt: nowIso() })
      append({ id: uuidv4(), sender: 'system', body: 'Передаю менеджеру…', createdAt: nowIso() })
      sendToOperator(`${button.emoji ? button.emoji + ' ' : ''}${button.label}`)
      return
    }

    // Переход по шагу сценария открывает окно переписки.
    navigate('chat')
    append({ id: uuidv4(), sender: 'visitor', body: `${button.emoji ? button.emoji + ' ' : ''}${button.label}`, createdAt: nowIso() })
    const nextStep = stepById.get(button.next)
    setCurrentStepId(button.next)
    if (nextStep && (nextStep.message.trim() || nextStep.image)) {
      append({ id: `step-${nextStep.id}-${uuidv4().slice(0, 6)}`, sender: 'manager', body: nextStep.message, image: nextStep.image, createdAt: nowIso() })
    }
  }, [currentStepId, stepById, append, sendToOperator, contacts])

  // Онлайн: «Войти в чат» — открываем переписку с живым оператором.
  const handleEnterChat = useCallback(() => {
    navigate('chat')
    setMode('operator')
  }, [navigate])

  // Офлайн: одно поле сообщения — отправляем оператору (придёт в рабочее время) + подтверждение.
  const handleOfflineMessage = useCallback(
    (text: string) => {
      const t = text.trim()
      if (!t) return
      append({ id: uuidv4(), sender: 'visitor', body: t, createdAt: nowIso(), pending: !props.preview })
      sendToOperator(t)
      setOfflineSent(true)
    },
    [append, sendToOperator, props.preview]
  )

  // Отправка формы «Оставить сообщение»: собираем контакт + комментарий и уходим к оператору.
  const handleSubmitForm = useCallback(
    (values: { name?: string; phone?: string; email?: string; comment?: string }) => {
      const lines = [
        values.name && `Имя: ${values.name}`,
        values.phone && `Телефон: ${values.phone}`,
        values.email && `Email: ${values.email}`,
        values.comment && `Сообщение: ${values.comment}`,
      ].filter(Boolean) as string[]
      const body = lines.join('\n') || 'Заявка из чата'

      // Сохраняем контакт в диалог — чтобы имя/телефон/email были в карточке оператора.
      updateContact({ visitorName: values.name, visitorPhone: values.phone, visitorEmail: values.email })

      navigate('chat')
      setMode('operator')
      append({ id: uuidv4(), sender: 'visitor', body, createdAt: nowIso(), pending: !props.preview })
      append({ id: uuidv4(), sender: 'system', body: 'Спасибо! Мы свяжемся с вами.', createdAt: nowIso() })
      sendToOperator(body)
    },
    [append, sendToOperator, updateContact, props.preview]
  )

  // Кнопка «Назад» — всегда на предыдущий экран.
  const handleBack = goBack

  // Вкладки окна.
  const handleTabChat = useCallback(() => navigate(messages.length ? 'chat' : 'home'), [messages.length, navigate])
  const handleTabContacts = useCallback(() => {
    if (contactsTab.enabled) navigate('contacts')
  }, [contactsTab.enabled, navigate])
  const handleTabAi = useCallback(() => {
    if (!aiAgentEnabled) return
    navigate('chat')
    setMode('operator')
    append({
      id: 'ai-greeting',
      sender: 'manager',
      body: `Здравствуйте! Я ${aiAgentName || 'ИИ-агент'}. Чем могу помочь?`,
      createdAt: nowIso(),
    })
  }, [aiAgentEnabled, aiAgentName, navigate, append])

  // Действия вкладки «Контакты».
  const handleLeaveMessage = useCallback(() => {
    setFormHeader('Чат с менеджерами')
    navigate('form')
  }, [navigate])
  const handleOpenCallback = useCallback(() => {
    setFormHeader('Чат с менеджерами')
    navigate('callback')
  }, [navigate])
  const handleSubmitCallback = useCallback(
    (phone: string, when: string) => {
      const body = `Обратный звонок\nТелефон: ${phone}${when ? `\nКогда: ${when}` : ''}`
      append({ id: uuidv4(), sender: 'visitor', body, createdAt: nowIso(), pending: !props.preview })
      sendToOperator(body)
    },
    [append, sendToOperator, props.preview]
  )

  // Свободный ввод всегда уходит оператору (и переключает режим).
  const handleSend = useCallback((body: string) => {
    const text = body.trim()
    if (!text) return
    navigate('chat')
    setMode('operator')
    append({ id: uuidv4(), sender: 'visitor', body: text, createdAt: nowIso(), pending: !props.preview })
    sendToOperator(text)
  }, [append, sendToOperator, props.preview])

  const sendBoundingRectToIframe = useCallback((clipOnlyTrigger?: boolean) => {
    if (!containerRef.current || !triggerRef.current) return
    const isBottomRight = triggerPosition === 'bottom-right'
    const offset = 24
    const boundingRect = containerRef.current.getBoundingClientRect()
    const triggerWidth = triggerRef.current.clientWidth
    const triggerHeight = triggerRef.current.clientHeight
    let left: number
    let top: number
    if (open) {
      left = isBottomRight ? window.innerWidth - boundingRect.width - offset : 0
      top = window.innerHeight - boundingRect.height - offset
    } else {
      const width = clipOnlyTrigger ? triggerWidth + 8 + offset : 233 + offset
      left = isBottomRight ? window.innerWidth - width : 0
      top = window.innerHeight - triggerHeight - 10
    }
    window.parent.postMessage({
      scope: 'lemnity-embed',
      type: 'interactive-region',
      lock: false,
      rect: {
        left,
        top,
        width: open ? boundingRect.width + offset : clipOnlyTrigger ? triggerWidth + 8 : 233,
        height: open ? boundingRect.height + offset : triggerHeight + 10,
      },
    })
  }, [open, triggerPosition])

  const toggleOpen = () => {
    setOpen(prev => {
      const next = !prev
      if (next) {
        setUnreadCount(0)
        markRead()
      }
      return next
    })
  }

  const handleTriggerMouseEnter = () => {
    if (mouseLeaveTimeoutRef.current) clearTimeout(mouseLeaveTimeoutRef.current)
    sendBoundingRectToIframe(false)
  }
  const handleTriggerMouseLeave = () => {
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      sendBoundingRectToIframe(true)
      mouseLeaveTimeoutRef.current = null
    }, 300)
  }

  useEffect(() => {
    if (!firstMountCrutchRef.current) return
    if (isMobileViewport) return
    sendBoundingRectToIframe(!open)
  }, [open, sendBoundingRectToIframe, isMobileViewport])

  useEffect(() => {
    if (isMobileViewport) return
    sendBoundingRectToIframe(true)
    firstMountCrutchRef.current = true
  }, [])

  const triggerStyle: CSSProperties = {
    color: triggerFontColor,
    backgroundColor: triggerBackgroundColor,
    willChange: 'transform',
  }
  const closeIconStyle: CSSProperties = { color: triggerFontColor }

  const widgetProps = {
    operatorName,
    operatorAvatarUrl,
    operatorOnline,
    onlineMessage,
    offlineMessage,
    placeholder,
    windowFormat,
    windowRadius,
    windowBackgroundColor,
    windowAccentColor,
    clientColor,
    companyLogoUrl: companyLogo.enabled ? companyLogo.url : undefined,
    welcomeTitle,
    welcomeTitleSize,
    welcomeTitleColor,
    welcomeTitleAlign,
    messages,
    quickReplies,
    brandingEnabled,
    view,
    contacts,
    contactsTab,
    formHeader,
    preview: props.preview,
    chatActive: mode === 'operator',
    offlineSent,
    onSend: handleSend,
    onEnterChat: handleEnterChat,
    onOfflineSend: handleOfflineMessage,
    onQuickReply: handleQuickReply,
    onSubmitForm: handleSubmitForm,
    onBack: handleBack,
    onTabChat: handleTabChat,
    onTabContacts: handleTabContacts,
    onTabAi: handleTabAi,
    onLeaveMessage: handleLeaveMessage,
    onCall: handleOpenCallback,
    onSubmitCallback: handleSubmitCallback,
    onClose: toggleOpen,
  }

  // Боковая панель в открытом виде докуется к краю экрана на всю высоту (только desktop-embed).
  const sidebarDocked = windowFormat === 'sidebar' && open && !isMobileViewport && !props.preview

  return (
    <div
      ref={containerRef}
      data-lemnity-interactive
      data-lemnity-chat={isMobileViewport ? undefined : true}
      className={cn(
        'flex flex-col gap-3',
        props.preview
          ? 'relative'
          : sidebarDocked
            ? cn('fixed top-0 bottom-0 justify-end pb-3', triggerPosition === 'bottom-right' ? 'right-0' : 'left-0')
            : cn('fixed bottom-3', triggerPosition === 'bottom-right' ? 'right-3' : 'left-3'),
      )}
    >
      {isMobileViewport
        ? <MobileWidgetTrigger
            ref={triggerRef}
            open={open}
            unreadCount={unreadCount}
            toggleOpen={toggleOpen}
            triggerStyle={triggerStyle}
            triggerText={triggerText}
          >
            <Widget open={open} mobile {...widgetProps} />
          </MobileWidgetTrigger>
        : <DesktopWidgetTrigger
            ref={triggerRef}
            closeIconStyle={closeIconStyle}
            unreadCount={unreadCount}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            toggleOpen={toggleOpen}
            open={open}
            triggerIcon={triggerIcon}
            triggerPosition={triggerPosition}
            triggerStyle={triggerStyle}
            triggerText={triggerText}
          >
            <Widget open={open} {...widgetProps} />
          </DesktopWidgetTrigger>
      }
    </div>
  )
}

export default ChatEmbedRuntime
