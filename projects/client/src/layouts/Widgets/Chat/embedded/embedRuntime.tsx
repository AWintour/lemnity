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
import AvatarWidgetTrigger from './AvatarWidgetTrigger'

// Стабильная ссылка для фолбэка приветствий (свежий [] в селекторе useShallow → бесконечный цикл).
const EMPTY_GREETINGS: string[] = []
import { useChatConnection } from './useChatConnection'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'
import { uuidv4 } from '@/common/utils/uuidv4'
import { MAX_IMAGE_BYTES, IMAGE_TOO_LARGE_MESSAGE, classifyAttachment } from '@/api/upload'
import { uploadPublicChatFile } from '@/common/api/publicApi'
import messageSoundUrl from '@/assets/zvuk-chat.mp3'

import type { ChatWidgetType, Position, Scenario } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from '../defaults'
import type { ChatUiMessage } from './types'
import type { QuickReply } from './Widget'
import { exportChatToPdf } from './exportPdf'

type ChatView = 'home' | 'chat' | 'form' | 'contacts' | 'callback' | 'socials'

// Окно, скролл которого определяет авто-открытие по прокрутке. Виджет живёт в srcdoc-iframe
// (тот же origin) → визитёр скроллит родительскую страницу. Если доступа нет — своё окно.
const getScrollHost = (): Window => {
  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      void window.parent.document // проверка доступа (same-origin)
      return window.parent
    }
  } catch {
    /* кросс-ориджин — используем собственное окно */
  }
  return window
}

// Процент вертикальной прокрутки страницы (0–100).
const scrollPercent = (w: Window): number => {
  const doc = w.document?.documentElement
  if (!doc) return 0
  const scrollTop = w.scrollY || doc.scrollTop || 0
  const max = doc.scrollHeight - w.innerHeight
  if (max <= 0) return 0
  return Math.min(100, (scrollTop / max) * 100)
}


type ChatEmbedRuntimeProps = {
  preview?: boolean
}

const ChatEmbedRuntime = (props: ChatEmbedRuntimeProps) => {
  const {
    triggerText,
    triggerFontColor,
    triggerIcon,
    triggerBackgroundColor,
    widgetTriggerPosition,
    triggerPulse,
    operatorName,
    operatorSubtitle,
    operatorAvatarUrl,
    companyLogo,
    welcomeTitle,
    welcomeTitleSize,
    welcomeTitleWeight,
    welcomeTitleColor,
    welcomeTitleAlign,
    greetingMessage,
    onlineMessage,
    onlineMessageEnabled,
    offlineMessage,
    offlineMessageEnabled,
    placeholder,
    windowFormat,
    windowRadius,
    windowBackgroundColor,
    windowAccentColor,
    clientColor,
    displayScrollEnabled,
    displayScrollPercent,
    displayAfterEnabled,
    displayAfterSeconds,
    displayOnExit,
    brandingEnabled,
    soundEnabled,
    scenario,
    contacts,
    contactsTab,
    companySocials,
    socialsTitle,
    socialsTitleSize,
    socialsTitleWeight,
    socialsTitleColor,
    socialsTitleAlign,
    aiAgentEnabled,
    aiAgentName,
    deferredCall,
    agreementEnabled,
    agreementColor,
    agreementUrl,
    agreementPolicyUrl,
    mobileEnabled,
    mobileTriggerType,
    mobileImageUrl,
    mobileTriggerText,
    mobileTriggerFontColor,
    mobileTriggerBackgroundColor,
    // Вкладка «Отображение» (стандартный surface display) — управляет лаунчером и показом.
    displayIconType,
    displayImageUrl,
    displayButtonText,
    displayButtonColor,
    displayButtonTextColor,
    displayPosition,
    displayStartShowing,
    displayIconKind,
    displayGreetings,
    displayIconSize,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)
      const display = s.settings?.display as
        | {
            icon?: {
              type?: 'image' | 'button'
              image?: { url?: string }
              button?: { text?: string; buttonColor?: string; textColor?: string }
              position?: 'bottom-left' | 'top-right' | 'bottom-right'
            }
            startShowing?: 'onClick' | 'timer'
            timer?: { delayMs?: number }
            chatIconKind?: 'image' | 'button' | 'avatar'
            greetings?: string[]
            iconSize?: number
            showRules?: {
              onExit?: boolean
              scrollBelow?: { enabled?: boolean; percent?: number | null }
              afterOpen?: { enabled?: boolean; seconds?: number | null }
            }
          }
        | undefined

      return {
        triggerText: settings.triggerText ?? defaults.triggerText,
        triggerFontColor: settings.triggerFontColor ?? defaults.triggerFontColor,
        triggerIcon: settings.triggerIcon ?? defaults.triggerIcon,
        triggerPulse: settings.triggerPulse ?? defaults.triggerPulse ?? false,
        triggerBackgroundColor:
          settings.triggerBackgroundColor ?? defaults.triggerBackgroundColor,
        widgetTriggerPosition: settings.triggerPosition ?? defaults.triggerPosition,

        operatorName: settings.operatorName ?? defaults.operatorName,
        operatorSubtitle: settings.operatorSubtitle ?? defaults.operatorSubtitle,
        operatorAvatarUrl: settings.operatorAvatarUrl ?? defaults.operatorAvatarUrl,
        companyLogo: settings.companyLogo ?? defaults.companyLogo,
        welcomeTitle: settings.welcomeTitle ?? defaults.welcomeTitle,
        welcomeTitleSize: settings.welcomeTitleSize ?? defaults.welcomeTitleSize,
        welcomeTitleWeight: settings.welcomeTitleWeight ?? defaults.welcomeTitleWeight ?? 600,
        welcomeTitleColor: settings.welcomeTitleColor ?? defaults.welcomeTitleColor,
        welcomeTitleAlign: settings.welcomeTitleAlign ?? defaults.welcomeTitleAlign,
        greetingMessage: settings.greetingMessage ?? defaults.greetingMessage,
        onlineMessage: settings.onlineMessage ?? defaults.onlineMessage,
        onlineMessageEnabled: settings.onlineMessageEnabled ?? defaults.onlineMessageEnabled ?? true,
        offlineMessage: settings.offlineMessage ?? defaults.offlineMessage,
        offlineMessageEnabled: settings.offlineMessageEnabled ?? defaults.offlineMessageEnabled ?? true,
        placeholder: settings.placeholder ?? defaults.placeholder,
        windowFormat: settings.windowFormat ?? defaults.windowFormat,
        windowRadius: settings.windowRadius ?? defaults.windowRadius,
        windowBackgroundColor:
          settings.windowBackgroundColor ?? defaults.windowBackgroundColor,
        windowAccentColor: settings.windowAccentColor ?? defaults.windowAccentColor,
        clientColor: settings.clientColor ?? defaults.clientColor,

        // Авто-открытие управляется вкладкой «Отображение»: мастер — «Автоматически»
        // (startShowing==='timer'), а триггеры — из «Настройки показа» (display.showRules).
        displayScrollEnabled: display?.showRules?.scrollBelow?.enabled ?? false,
        displayScrollPercent: display?.showRules?.scrollBelow?.percent ?? null,
        displayAfterEnabled: display?.showRules?.afterOpen?.enabled ?? false,
        displayAfterSeconds: display?.showRules?.afterOpen?.seconds ?? null,
        displayOnExit: display?.showRules?.onExit ?? false,

        brandingEnabled: settings.brandingEnabled ?? defaults.brandingEnabled,
        soundEnabled: settings.soundEnabled ?? defaults.soundEnabled,
        scenario: (settings.scenario ?? defaults.scenario) as Scenario,
        contacts: settings.contacts ?? defaults.contacts,
        contactsTab: settings.contactsTab ?? defaults.contactsTab,
        companySocials: settings.companySocials ?? defaults.companySocials ?? [],
        // Плоские поля (НЕ объект) — иначе useShallow видит новую ссылку каждый рендер → цикл.
        socialsTitle: settings.socialsTitle ?? defaults.socialsTitle ?? '',
        socialsTitleSize: settings.socialsTitleSize ?? defaults.socialsTitleSize ?? 20,
        socialsTitleWeight: settings.socialsTitleWeight ?? defaults.socialsTitleWeight ?? 600,
        socialsTitleColor: settings.socialsTitleColor ?? defaults.socialsTitleColor ?? '#1A1A1A',
        socialsTitleAlign: (settings.socialsTitleAlign ?? defaults.socialsTitleAlign ?? 'left') as
          | 'left'
          | 'center'
          | 'right',
        aiAgentEnabled: settings.aiAgentEnabled ?? defaults.aiAgentEnabled,
        aiAgentName: settings.aiAgentName ?? defaults.aiAgentName,
        deferredCall: settings.deferredCall ?? defaults.deferredCall,
        // «Согласие и политика» — плоские поля (стабильные примитивы для useShallow).
        agreementEnabled: (settings.agreement ?? defaults.agreement!).enabled,
        agreementColor: (settings.agreement ?? defaults.agreement!).color,
        agreementUrl: (settings.agreement ?? defaults.agreement!).agreementUrl,
        agreementPolicyUrl: (settings.agreement ?? defaults.agreement!).policyUrl,
        // «Мобильная версия» — плоские поля (стабильные примитивы, без новой ссылки в useShallow).
        mobileEnabled: (settings.mobileSettings ?? defaults.mobileSettings!).mobileEnabled,
        mobileTriggerType: (settings.mobileSettings ?? defaults.mobileSettings!).triggerType,
        mobileImageUrl: (settings.mobileSettings ?? defaults.mobileSettings!).imageUrl,
        mobileTriggerText: (settings.mobileSettings ?? defaults.mobileSettings!).triggerText,
        mobileTriggerFontColor: (settings.mobileSettings ?? defaults.mobileSettings!).triggerFontColor,
        mobileTriggerBackgroundColor: (settings.mobileSettings ?? defaults.mobileSettings!).triggerBackgroundColor,
        // Плоские поля вкладки «Отображение» (стабильные примитивы для useShallow).
        displayIconType: display?.icon?.type ?? 'image',
        displayImageUrl: display?.icon?.image?.url ?? '',
        displayButtonText: display?.icon?.button?.text ?? '',
        displayButtonColor: display?.icon?.button?.buttonColor ?? '',
        displayButtonTextColor: display?.icon?.button?.textColor ?? '',
        displayPosition: display?.icon?.position,
        displayStartShowing: display?.startShowing ?? 'onClick',
        displayIconKind: display?.chatIconKind ?? display?.icon?.type ?? 'image',
        displayGreetings: display?.greetings ?? EMPTY_GREETINGS,
        displayIconSize: display?.iconSize ?? 62,
      }
    })
  )

  // Позиция лаунчера: вкладка «Отображение» (display.icon.position) перекрывает «Настройку виджета».
  // Chat поддерживает только bottom-left/right; top-right сводим к bottom-right.
  const triggerPosition: Position =
    displayPosition === 'bottom-left' ? 'bottom-left'
      : displayPosition === 'bottom-right' || displayPosition === 'top-right' ? 'bottom-right'
      : widgetTriggerPosition

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatUiMessage[]>([])
  const [currentStepId, setCurrentStepId] = useState<string | null>(null)
  const [mode, setMode] = useState<'bot' | 'operator'>('bot')
  // Индикатор «печатает…» во время паузы авто-перехода между шагами без кнопок.
  const [typing, setTyping] = useState(false)
  // Живой оператор набирает текст (сервер шлёт `operator:typing`) — отдельно от бота.
  const [operatorTyping, setOperatorTyping] = useState(false)
  // id шагов, уже пройденных авто-переходом в текущей цепочке — защита от зацикливания
  // (шаги-«next» по кругу). Сбрасывается при ручном действии и сбросе диалога.
  const autoChainRef = useRef<Set<string>>(new Set())
  // Офлайн-сообщение отправлено (показываем подтверждение вместо поля).
  const [offlineSent, setOfflineSent] = useState(false)
  // Диалог завершён оператором — показываем кнопку «Начать беседу» вместо поля ввода.
  const [ended, setEnded] = useState(false)
  // 'home' — первый экран (меню), 'chat' — переписка, 'form'/'callback' — формы, 'contacts' — вкладка.
  const [view, setView] = useState<ChatView>('home')
  const [formHeader, setFormHeader] = useState('Чат с менеджерами')

  // Снимок состояния экрана для корректного «Назад»: восстанавливаем не только view,
  // но и шаг сценария, режим и длину ленты (иначе на первом экране остаётся чужой шаг).
  type NavSnapshot = {
    view: ChatView
    stepId: string | null
    mode: 'bot' | 'operator'
    messageCount: number
  }
  const historyRef = useRef<NavSnapshot[]>([])
  // Зеркала состояния в ref — чтобы снимок брал свежие значения без устаревших замыканий.
  const viewRef = useRef(view); viewRef.current = view
  const stepIdRef = useRef(currentStepId); stepIdRef.current = currentStepId
  const modeRef = useRef(mode); modeRef.current = mode
  const messagesRef = useRef(messages); messagesRef.current = messages

  const pushHistory = useCallback(() => {
    historyRef.current.push({
      view: viewRef.current,
      stepId: stepIdRef.current,
      mode: modeRef.current,
      messageCount: messagesRef.current.length,
    })
  }, [])

  // Переход на новый экран/шаг: сначала фиксируем текущее состояние в историю.
  const navigate = useCallback((next: ChatView) => {
    pushHistory()
    setView(next)
  }, [pushHistory])

  // «Назад»: всегда возвращаемся на ГЛАВНЫЙ экран (а не на шаг назад). Переписку НЕ стираем —
  // она остаётся доступной во вкладке «чат». Сбрасываем шаг сценария к началу и историю навигации.
  const goBack = useCallback(() => {
    historyRef.current = []
    // На главном экране кнопки берутся из стартового шага сценария: сбрасываем шаг
    // к старту (а не в null), иначе главный экран остаётся без кнопок — пустым.
    setCurrentStepId(scenario.enabled ? scenario.startStepId : null)
    setMode('bot')
    setView('home')
  }, [scenario.enabled, scenario.startStepId])
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
  const audioUnlockedRef = useRef(false)
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  const ensureAudio = useCallback(() => {
    if (!messageAudioRef.current) {
      const audio = new Audio(messageSoundUrl)
      audio.volume = 0.6
      audio.preload = 'auto'
      messageAudioRef.current = audio
    }
    return messageAudioRef.current
  }, [])

  const playMessageSound = useCallback(() => {
    if (!soundEnabledRef.current) return
    try {
      const audio = ensureAudio()
      audio.currentTime = 0
      void audio.play().catch(() => {})
    } catch {
      /* autoplay/политика браузера — игнорируем */
    }
  }, [ensureAudio])

  // Разблокировка аудио на первом жесте пользователя в окне виджета: браузеры (Safari/Chrome)
  // глушат программный play() без предшествующего взаимодействия. Один раз «прогреваем» элемент,
  // после чего последующие play() при приходе сообщений срабатывают.
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return
      audioUnlockedRef.current = true
      const audio = ensureAudio()
      const prevMuted = audio.muted
      audio.muted = true
      void audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = prevMuted
        })
        .catch(() => {
          audio.muted = prevMuted
        })
    }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [ensureAudio])

  // Добавление сообщения с дедупликацией и сведе́нием optimistic-сообщений посетителя.
  const append = useCallback((incoming: ChatUiMessage) => {
    // Побочные эффекты (звук, счётчик непрочитанных) держим ВНЕ updater'а — он должен быть чистым
    // (иначе в StrictMode-превью эффекты дублируются). Флаг выставляем только для нового manager-сообщения.
    let isNewManagerMessage = false
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
      if (incoming.sender === 'manager') isNewManagerMessage = true
      return [...prev, incoming]
    })
    if (isNewManagerMessage) {
      if (!openRef.current) setUnreadCount(c => c + 1)
      playMessageSound()
    }
  }, [playMessageSound])

  // Диалог закрыт оператором: системное сообщение в ленте + режим «завершён» (кнопка «Начать беседу»).
  const handleClosed = useCallback(() => {
    setView('chat')
    setEnded(true)
    append({
      id: `closed-${uuidv4().slice(0, 6)}`,
      sender: 'system',
      body: 'Оператор завершил беседу',
      createdAt: new Date().toISOString(),
    })
  }, [append])

  // Авто-сброс индикатора набора оператора, если «стоп»-событие не пришло (страховка).
  const opTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleOperatorTyping = useCallback((isTyping: boolean) => {
    if (opTypingTimerRef.current) clearTimeout(opTypingTimerRef.current)
    setOperatorTyping(isTyping)
    if (isTyping) {
      opTypingTimerRef.current = setTimeout(() => setOperatorTyping(false), 6000)
    }
  }, [])

  const { operatorOnline, operators, sendToOperator, sendAttachment, markRead, updateContact, closeConversation } = useChatConnection({
    widgetId: useWidgetSettingsStore.getState().settings?.id,
    preview: props.preview,
    onIncoming: append,
    onClosed: handleClosed,
    onOperatorTyping: handleOperatorTyping,
  })

  // Сброс к первому экрану: при включённом сценарии лента пустая (приветствие — крупным
  // заголовком в шапке, варианты — кнопки стартового шага). Без сценария — приветствие
  // отдельным сообщением сразу в переписке. Используется для сида и «Завершить диалог».
  const resetConversation = useCallback(() => {
    historyRef.current = []
    autoChainRef.current = new Set()
    setTyping(false)
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
    setEnded(false)
  }, [scenario, stepById, greetingMessage])

  useEffect(() => {
    resetConversation()
  }, [resetConversation, props.preview])

  // Авто-открытие окна управляется вкладкой «Отображение»:
  //  • мастер-тумблер — «Автоматически» (display.startShowing==='timer');
  //  • конкретные триггеры — из «Настройки показа» (display.showRules):
  //    через N секунд после открытия страницы / при скролле ниже N% / когда покидает сайт.
  // Виджет встроен в srcdoc-iframe (тот же origin), поэтому скролл/уход считаем у родительской
  // страницы (window.parent); при недоступности — фоллбэк на собственное окно.
  const displayTimerOpen = displayStartShowing === 'timer'
  useEffect(() => {
    if (props.preview) return
    if (!displayTimerOpen) return
    if (openRef.current) return

    let done = false
    const openOnce = () => {
      if (done || openRef.current) return
      done = true
      setOpen(true)
      cleanup()
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    if (displayAfterEnabled) {
      timer = setTimeout(openOnce, Math.max(0, displayAfterSeconds ?? 0) * 1000)
    }

    let scrollHost: Window | null = null
    let onScroll: (() => void) | undefined
    if (displayScrollEnabled && displayScrollPercent != null) {
      scrollHost = getScrollHost()
      onScroll = () => {
        if (scrollHost && scrollPercent(scrollHost) >= displayScrollPercent) openOnce()
      }
      scrollHost.addEventListener('scroll', onScroll, { passive: true })
      onScroll() // вдруг страница уже прокручена ниже порога
    }

    let exitDoc: Document | null = null
    let onMouseOut: ((e: MouseEvent) => void) | undefined
    if (displayOnExit) {
      exitDoc = getScrollHost().document
      onMouseOut = (e: MouseEvent) => {
        // Уход курсора за верхнюю границу окна (намерение покинуть сайт).
        if (e.clientY <= 0 && !e.relatedTarget) openOnce()
      }
      exitDoc?.addEventListener('mouseout', onMouseOut)
    }

    function cleanup() {
      if (timer) clearTimeout(timer)
      if (scrollHost && onScroll) scrollHost.removeEventListener('scroll', onScroll)
      if (exitDoc && onMouseOut) exitDoc.removeEventListener('mouseout', onMouseOut)
    }

    return cleanup
  }, [props.preview, displayTimerOpen, displayAfterEnabled, displayAfterSeconds, displayScrollEnabled, displayScrollPercent, displayOnExit])

  // Кнопки текущего шага показываем всегда (закреплены над текстом); в режиме оператора
  // Widget рендерит их неактивными (см. chatActive). Поэтому без гейта по mode.
  const quickReplies: QuickReply[] = useMemo(() => {
    if (!scenario.enabled || !currentStepId) return []
    const step = stepById.get(currentStepId)
    if (!step) return []
    // Кнопки-«Назад» сценария не показываем — возврат есть иконкой в шапке.
    const isBackButton = (label: string) => {
      const t = label.replace(/^[\s←⟵«»<-]+/, '').trim().toLowerCase()
      return t === 'назад' || t === 'back'
    }
    return step.buttons
      .filter(b => !isBackButton(b.label))
      .map(b => ({ id: b.id, emoji: b.emoji, label: b.label, isHandoff: b.next === null }))
  }, [scenario.enabled, currentStepId, stepById])

  const nowIso = () => new Date().toISOString()

  const handleQuickReply = useCallback((buttonId: string) => {
    const step = currentStepId ? stepById.get(currentStepId) : undefined
    const button = step?.buttons.find(b => b.id === buttonId)
    if (!button) return
    // Ручной выбор — начинаем новую цепочку авто-переходов с чистого листа.
    autoChainRef.current = new Set()
    setTyping(false)

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
      // pending → серверное эхо (message:new) схлопнётся с этим оптимистичным сообщением,
      // иначе надпись кнопки дублируется (см. реконсиляцию в onIncoming).
      append({ id: uuidv4(), sender: 'visitor', body: `${button.emoji ? button.emoji + ' ' : ''}${button.label}`, createdAt: nowIso(), pending: !props.preview })
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
  }, [currentStepId, stepById, append, sendToOperator, contacts, props.preview])

  // Авто-переход: шаг БЕЗ кнопок с заданным next бот продолжает сам после паузы (с «печатает…»).
  // Перезапускается при смене шага → получается цепочка сообщений. Защита от циклов — autoChainRef.
  useEffect(() => {
    const canAuto =
      scenario.enabled &&
      mode === 'bot' &&
      !!currentStepId &&
      (view === 'home' || view === 'chat')
    if (!canAuto) { setTyping(false); return }

    const step = stepById.get(currentStepId)
    if (!step || step.buttons.length > 0 || !step.next) { setTyping(false); return }

    const nextId = step.next
    const nextStep = stepById.get(nextId)
    if (!nextStep || autoChainRef.current.has(nextId)) { setTyping(false); return }

    setTyping(true)
    const timer = setTimeout(() => {
      autoChainRef.current.add(nextId)
      setTyping(false)
      // Лента сообщений видна только на экране чата — переводим с первого экрана.
      setView(v => (v === 'home' ? 'chat' : v))
      if (nextStep.message.trim() || nextStep.image) {
        append({
          id: `step-${nextStep.id}-${uuidv4().slice(0, 6)}`,
          sender: 'manager',
          body: nextStep.message,
          image: nextStep.image,
          createdAt: nowIso(),
        })
      }
      setCurrentStepId(nextId)
      // Живее: задержка набора зависит от длины следующего сообщения (имитация печати).
    }, Math.min(4500, 900 + (nextStep.message?.length ?? 0) * 35))

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.enabled, mode, currentStepId, view, stepById, append])

  // Шаг «Аи агент»: при достижении передаём диалог ИИ-ассистенту — переключаемся в free-text,
  // дальше сообщения посетителя уходят на сервер, где отвечает ИИ-агент (как с оператором).
  useEffect(() => {
    if (!scenario.enabled || mode !== 'bot' || !currentStepId) return
    const step = stepById.get(currentStepId)
    if (!step?.agent) return
    setTyping(false)
    navigate('chat')
    setMode('operator')
    const greeting =
      step.message?.trim() || `Здравствуйте! Я ${aiAgentName || 'ИИ-агент'}. Чем могу помочь?`
    append({ id: `ai-${step.id}-${uuidv4().slice(0, 6)}`, sender: 'manager', body: greeting, createdAt: nowIso() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.enabled, mode, currentStepId, stepById, aiAgentName, append])

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

  // Отправка формы контактов перед чатом.
  // Онлайн («Начать чат»): сохраняем контакты и входим в живой диалог (без поля сообщения).
  // Офлайн («Отправить сообщение»): отправляем заявку с контактами и комментарием.
  const handleSubmitForm = useCallback(
    (values: { name?: string; phone?: string; email?: string; comment?: string }) => {
      // Сохраняем контакт в диалог — чтобы имя/телефон/email были в карточке оператора.
      updateContact({ visitorName: values.name, visitorPhone: values.phone, visitorEmail: values.email })

      const contactLines = [
        values.name && `Имя: ${values.name}`,
        values.phone && `Телефон: ${values.phone}`,
        values.email && `Email: ${values.email}`,
      ].filter(Boolean) as string[]

      navigate('chat')
      setMode('operator')

      if (operatorOnline) {
        // Живой чат: открываем диалог; контакты уже в карточке. Уведомляем оператора.
        const opener = contactLines.join('\n') || 'Здравствуйте!'
        append({ id: uuidv4(), sender: 'visitor', body: opener, createdAt: nowIso(), pending: !props.preview })
        sendToOperator(opener)
        return
      }

      // Офлайн: заявка с комментарием — придёт оператору в рабочее время.
      const body = [...contactLines, values.comment && `Сообщение: ${values.comment}`]
        .filter(Boolean)
        .join('\n') || 'Заявка из чата'
      append({ id: uuidv4(), sender: 'visitor', body, createdAt: nowIso(), pending: !props.preview })
      append({ id: uuidv4(), sender: 'system', body: 'Спасибо! Мы свяжемся с вами.', createdAt: nowIso() })
      sendToOperator(body)
    },
    [append, sendToOperator, updateContact, props.preview, operatorOnline]
  )

  // Кнопка «Назад» — всегда на предыдущий экран.
  const handleBack = goBack

  // Меню три-точки: «Завершить диалог» — закрываем на сервере и возвращаемся на первый экран.
  const handleEndDialog = useCallback(() => {
    closeConversation()
    resetConversation()
  }, [closeConversation, resetConversation])

  // «Скачать диалог» — PDF всей видимой переписки (jsPDF подгружается динамически).
  const handleDownloadDialog = useCallback(() => {
    void exportChatToPdf(messages, { operatorName, title: 'Переписка' })
  }, [messages, operatorName])

  // Вкладки окна.
  const handleTabChat = useCallback(() => navigate(messages.length ? 'chat' : 'home'), [messages.length, navigate])
  const handleTabContacts = useCallback(() => {
    if (contactsTab.enabled) navigate('contacts')
  }, [contactsTab.enabled, navigate])
  const handleTabSocials = useCallback(() => navigate('socials'), [navigate])
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

  // Вложение посетителя (картинка/файл): грузим через ПУБЛИЧНЫЙ эндпоинт (визитёр не авторизован) →
  // оптимистично показываем у себя → отправляем оператору (сервер сохранит и разошлёт в комнату).
  const handleAttach = useCallback((file: File) => {
    if (props.preview) return
    if (file.size > MAX_IMAGE_BYTES) {
      append({ id: uuidv4(), sender: 'system', body: IMAGE_TOO_LARGE_MESSAGE, createdAt: nowIso() })
      return
    }
    const widgetId = useWidgetSettingsStore.getState().settings?.id
    if (!widgetId) return
    navigate('chat')
    setMode('operator')
    void uploadPublicChatFile(file, widgetId).then(res => {
      if (!res) {
        append({ id: uuidv4(), sender: 'system', body: 'Не удалось загрузить файл. Попробуйте ещё раз.', createdAt: nowIso() })
        return
      }
      const type = classifyAttachment(res.contentType || file.type)
      const isImg = type === 'image'
      append({
        id: uuidv4(),
        sender: 'visitor',
        body: '',
        ...(isImg
          ? { image: res.url }
          : { attachmentUrl: res.url, attachmentType: type, attachmentName: res.name }),
        createdAt: nowIso(),
        pending: true,
      })
      sendAttachment({ attachmentUrl: res.url, attachmentType: type, attachmentName: res.name })
    })
  }, [props.preview, append, navigate, sendAttachment])

  // «Начать беседу» после завершения оператором — сброс на главный экран (новый диалог).
  // Следующее сообщение переоткроет диалог на сервере (appendMessage ставит status: 'open').
  const handleRestart = useCallback(() => {
    resetConversation()
  }, [resetConversation])

  const sendBoundingRectToIframe = useCallback((clipOnlyTrigger?: boolean) => {
    if (!containerRef.current || !triggerRef.current) return
    const isBottomRight = triggerPosition === 'bottom-right'
    const offset = 24
    // Боковая панель докована: кнопка закрытия вынесена за внутренний край (~48px) —
    // расширяем кликабельную зону iframe с внутренней стороны, иначе клик «провалится» на сайт.
    const sidebarDockedNow = windowFormat === 'sidebar' && open && !isMobileViewport && !props.preview
    const innerPad = sidebarDockedNow ? 64 : offset
    const boundingRect = containerRef.current.getBoundingClientRect()
    const triggerWidth = triggerRef.current.clientWidth
    const triggerHeight = triggerRef.current.clientHeight
    let left: number
    let top: number
    if (open) {
      left = isBottomRight ? window.innerWidth - boundingRect.width - innerPad : 0
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
        width: open ? boundingRect.width + innerPad : clipOnlyTrigger ? triggerWidth + 8 : 233,
        height: open ? boundingRect.height + offset : triggerHeight + 10,
      },
    })
  }, [open, triggerPosition, windowFormat, isMobileViewport, props.preview])

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

  // Привязка к вкладке «Отображение»: значения display.* перекрывают поля «Настройка виджета»,
  // но только когда они реально заданы — пустые дефолты сохраняют текущий вид лаунчера.
  // Лаунчер-«кнопка»: текст/цвета из display перекрывают; «картинка»: url из display.
  const useDisplayButton = displayIconType === 'button'
  const useDisplayImage = displayIconType === 'image' && !!displayImageUrl
  const effectiveTriggerText = useDisplayButton && displayButtonText ? displayButtonText : triggerText
  const effectiveTriggerFontColor = useDisplayButton && displayButtonTextColor ? displayButtonTextColor : triggerFontColor
  const effectiveTriggerBackgroundColor = useDisplayButton && displayButtonColor ? displayButtonColor : triggerBackgroundColor
  const desktopImageUrl = useDisplayImage ? displayImageUrl : undefined

  const triggerStyle: CSSProperties = {
    color: effectiveTriggerFontColor,
    backgroundColor: effectiveTriggerBackgroundColor,
    willChange: 'transform',
  }
  // На мобильных лаунчер берёт собственные цвета из блока «Мобильная версия».
  const mobileTriggerStyle: CSSProperties = {
    color: mobileTriggerFontColor,
    backgroundColor: mobileTriggerBackgroundColor,
    willChange: 'transform',
  }
  const closeIconStyle: CSSProperties = { color: effectiveTriggerFontColor }

  // Когда ИИ-агент включён, посетитель видит имя агента из настроек как отвечающего
  // (без пометки «бот» — пометку «ИИ» видит только оператор в кабинете).
  const effectiveOperatorName = aiAgentEnabled && aiAgentName ? aiAgentName : operatorName

  // Лаунчер «Аватарка»: если есть онлайн-оператор — показываем его (живой); иначе — бот
  // (дефолтный аватар/имя из настроек, при включённом ИИ — имя агента).
  const onlineOperator = operators.find(o => o.online)
  const launcherAvatarUrl = onlineOperator ? (onlineOperator.avatarUrl ?? undefined) : operatorAvatarUrl
  const launcherName = onlineOperator ? onlineOperator.name : effectiveOperatorName

  const widgetProps = {
    operatorName: effectiveOperatorName,
    operatorSubtitle,
    operatorAvatarUrl,
    operatorOnline,
    operators,
    onlineMessage,
    onlineMessageEnabled,
    offlineMessage,
    offlineMessageEnabled,
    placeholder,
    windowFormat,
    windowRadius,
    windowBackgroundColor,
    windowAccentColor,
    clientColor,
    companyLogoUrl: companyLogo.enabled ? companyLogo.url : undefined,
    welcomeTitle,
    welcomeTitleSize,
    welcomeTitleWeight,
    welcomeTitleColor,
    welcomeTitleAlign,
    messages,
    quickReplies,
    typing,
    operatorTyping,
    brandingEnabled,
    // Сторона дока боковой панели (для кнопки закрытия, выступающей за внутренний край).
    sidebarSide: triggerPosition === 'bottom-left' ? ('left' as const) : ('right' as const),
    view,
    contacts,
    contactsTab,
    // «Позвонить» в контактах ведёт на форму отложенного звонка; без этой функции кнопку гасим.
    callbackEnabled: deferredCall,
    // «Согласие и политика» — чекбокс согласия над полем ввода.
    agreement: agreementEnabled
      ? { color: agreementColor, agreementUrl, policyUrl: agreementPolicyUrl }
      : undefined,
    companySocials,
    socialsHeading: {
      title: socialsTitle,
      size: socialsTitleSize,
      weight: socialsTitleWeight,
      color: socialsTitleColor,
      align: socialsTitleAlign,
    },
    formHeader,
    preview: props.preview,
    chatActive: mode === 'operator',
    offlineSent,
    ended,
    // «Назад» видна на любом экране, кроме главного, и всегда ведёт на главный.
    canGoBack: view !== 'home',
    onSend: handleSend,
    onAttach: handleAttach,
    onRestart: handleRestart,
    onEnterChat: handleEnterChat,
    onOfflineSend: handleOfflineMessage,
    onQuickReply: handleQuickReply,
    onSubmitForm: handleSubmitForm,
    onBack: handleBack,
    onEndDialog: handleEndDialog,
    onDownloadDialog: handleDownloadDialog,
    onTabChat: handleTabChat,
    onTabContacts: handleTabContacts,
    onTabSocials: handleTabSocials,
    onTabAi: handleTabAi,
    onLeaveMessage: handleLeaveMessage,
    onCall: handleOpenCallback,
    onSubmitCallback: handleSubmitCallback,
    onClose: toggleOpen,
  }

  // Боковая панель: формат «панель на всю высоту» (только desktop).
  const isSidebarFmt = windowFormat === 'sidebar' && !isMobileViewport
  // В live докуется к краю экрана на всю высоту; в preview заполняет область превью.
  const sidebarDocked = isSidebarFmt && open && !props.preview
  // В боковой панели закрытие — кнопкой НА панели (слева), поэтому круглый баббл-триггер прячем.
  const hideTrigger = isSidebarFmt && open

  // «Мобильная версия» выключена → на мобильных виджет не показываем (в превью настроек показываем всегда).
  if (isMobileViewport && !mobileEnabled && !props.preview) return null

  return (
    <div
      ref={containerRef}
      data-lemnity-interactive
      data-lemnity-chat={isMobileViewport ? undefined : true}
      className={cn(
        'flex flex-col gap-3',
        props.preview
          ? isSidebarFmt
            ? cn(
                'relative h-full justify-end',
                triggerPosition === 'bottom-right' ? 'items-end' : 'items-start',
                // Закрытый баббл-триггер не прижимаем к краям — отступ как у модального формата.
                !open && (triggerPosition === 'bottom-right' ? 'pb-3 pr-3' : 'pb-3 pl-3'),
              )
            : 'relative'
          : sidebarDocked
            ? cn('fixed top-0 bottom-0', triggerPosition === 'bottom-right' ? 'right-0' : 'left-0')
            : cn('fixed bottom-3', triggerPosition === 'bottom-right' ? 'right-3' : 'left-3'),
      )}
    >
      {isMobileViewport
        ? <MobileWidgetTrigger
            ref={triggerRef}
            open={open}
            unreadCount={unreadCount}
            toggleOpen={toggleOpen}
            triggerStyle={mobileTriggerStyle}
            triggerText={mobileTriggerText}
            triggerType={mobileTriggerType}
            imageUrl={mobileImageUrl}
            pulse={triggerPulse}
          >
            <Widget open={open} mobile {...widgetProps} />
          </MobileWidgetTrigger>
        : displayIconKind === 'avatar'
        ? <AvatarWidgetTrigger
            ref={triggerRef}
            open={open}
            toggleOpen={toggleOpen}
            greetings={displayGreetings}
            operatorName={launcherName}
            operatorAvatarUrl={launcherAvatarUrl}
            online={!!onlineOperator}
            unreadCount={unreadCount}
            accent={effectiveTriggerBackgroundColor}
            size={displayIconSize}
            pulse={triggerPulse}
            preview={props.preview}
            agreement={agreementEnabled
              ? { color: agreementColor, agreementUrl, policyUrl: agreementPolicyUrl }
              : undefined}
          >
            {/* В режиме «Аватарка» согласие гейтит ОТКРЫТИЕ (в тизере), поэтому в окне его не дублируем. */}
            <Widget open={open} {...widgetProps} agreement={undefined} />
          </AvatarWidgetTrigger>
        : <DesktopWidgetTrigger
            ref={triggerRef}
            hideTrigger={hideTrigger}
            closeIconStyle={closeIconStyle}
            unreadCount={unreadCount}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            toggleOpen={toggleOpen}
            open={open}
            triggerIcon={triggerIcon}
            triggerPosition={triggerPosition}
            triggerStyle={triggerStyle}
            triggerText={effectiveTriggerText}
            imageUrl={desktopImageUrl}
            size={displayIconSize}
            pulse={triggerPulse}
          >
            <Widget open={open} {...widgetProps} />
          </DesktopWidgetTrigger>
      }
    </div>
  )
}

export default ChatEmbedRuntime
