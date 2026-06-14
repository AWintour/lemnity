import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { getCollectorSessionId, getDefaultApiOrigin } from '@/common/api/publicApi'
import type { ChatUiMessage } from './types'

type ServerAttachment = { url: string; type: 'image' | 'video' | 'file'; name?: string }
type ServerMessage = {
  id: string
  sender: 'visitor' | 'manager' | 'system'
  body: string
  createdAt: string
  attachmentUrl?: string | null
  attachmentType?: 'image' | 'video' | 'file' | null
  attachmentName?: string | null
  attachments?: ServerAttachment[] | null
}

// Серверное сообщение → UI: галерея (attachments) рендерится отдельно; одиночная картинка
// дублируется в image (обратная совместимость со сценарными картинками/одиночными вложениями).
const toUiMessage = (m: ServerMessage): ChatUiMessage => {
  const gallery = Array.isArray(m.attachments) && m.attachments.length ? m.attachments : null
  return {
    id: m.id,
    sender: m.sender,
    body: m.body,
    createdAt: m.createdAt,
    ...(gallery ? { attachments: gallery } : {}),
    ...(!gallery && m.attachmentType === 'image' && m.attachmentUrl ? { image: m.attachmentUrl } : {}),
    ...(!gallery && m.attachmentUrl
      ? {
          attachmentUrl: m.attachmentUrl,
          attachmentType: m.attachmentType ?? 'file',
          attachmentName: m.attachmentName ?? undefined,
        }
      : {}),
  }
}

type UseChatConnectionArgs = {
  widgetId?: string
  preview?: boolean
  // Вызывается для каждого входящего/исторического серверного сообщения.
  onIncoming: (message: ChatUiMessage) => void
  // Вызывается, когда диалог закрыт оператором (сервер шлёт `conversation:closed`).
  onClosed?: () => void
}

export type OutgoingAttachment = {
  attachmentUrl: string
  attachmentType: 'image' | 'video' | 'file'
  attachmentName?: string
  body?: string
}

export type VisitorContact = {
  visitorName?: string
  visitorPhone?: string
  visitorEmail?: string
}

// Оператор проекта для шапки виджета (публичные поля).
export type OperatorInfo = {
  id: string
  name: string
  role: string
  avatarUrl?: string | null
  online: boolean
  status: string
}

type UseChatConnectionResult = {
  operatorOnline: boolean
  // Операторы проекта (имя/роль/аватар/онлайн) — для шапки.
  operators: OperatorInfo[]
  sendToOperator: (body: string) => void
  // Отправка вложения оператору (картинка/видео/файл) — message:send с attachment*.
  sendAttachment: (attachment: OutgoingAttachment) => void
  markRead: () => void
  // Сохраняет контакт посетителя в диалог (visitorName/Phone/Email), чтобы он был в карточке оператора.
  updateContact: (contact: VisitorContact) => void
  // Закрывает диалог на сервере (status: 'closed') — по действию «Завершить диалог».
  closeConversation: () => void
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T | null> => {
  try {
    const res = await fetch(url, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * Транспорт диалога с живым оператором (после хэндофа из бота).
 * preview: ничего не подключает. Боевой режим: POST /api/public/chat/conversations →
 * загрузка истории (через onIncoming) → socket.io namespace `/chat` (message:new, presence).
 * Владение списком сообщений и логика сценария бота — на стороне embedRuntime.
 */
export const useChatConnection = (
  args: UseChatConnectionArgs
): UseChatConnectionResult => {
  const [operatorOnline, setOperatorOnline] = useState(false)
  const [operators, setOperators] = useState<OperatorInfo[]>([])
  const socketRef = useRef<Socket | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const onIncomingRef = useRef(args.onIncoming)
  onIncomingRef.current = args.onIncoming
  const onClosedRef = useRef(args.onClosed)
  onClosedRef.current = args.onClosed

  useEffect(() => {
    if (args.preview) {
      // В превью нет сокета — симулируем присутствие оператора, чтобы показать онлайн-сценарий
      // («Начать чат»). По умолчанию онлайн; ?offline=1 в URL — проверить офлайн-вариант.
      const offline =
        typeof window !== 'undefined' && /[?&]offline=1\b/.test(window.location.search)
      setOperatorOnline(!offline)
      // Демо-операторы для шапки.
      setOperators([
        { id: 'p1', name: 'Анна', role: 'Менеджер', avatarUrl: null, online: !offline, status: 'work' },
        { id: 'p2', name: 'Игорь', role: 'Поддержка', avatarUrl: null, online: false, status: 'away' },
      ])
      return
    }
    if (!args.widgetId) return
    const sessionId = getCollectorSessionId()
    if (!sessionId) return

    const apiOrigin = getDefaultApiOrigin()
    let disposed = false

    // Относительный URL аватара (напр. `/files/...`) в iframe на чужом сайте резолвится против
    // чужого домена → 404. Префиксуем origin API, чтобы аватар грузился из хранилища Lemnity.
    const toAbsolute = (url?: string | null): string | null =>
      url && url.startsWith('/') ? `${apiOrigin}${url}` : url ?? null

    // Операторы проекта для шапки.
    void fetchJson<OperatorInfo[]>(
      `${apiOrigin}/api/public/chat/operators?widgetId=${encodeURIComponent(args.widgetId)}`
    ).then(list => {
      if (!disposed && Array.isArray(list)) {
        setOperators(list.map(o => ({ ...o, avatarUrl: toAbsolute(o.avatarUrl) })))
      }
    })

    const start = async () => {
      const conversation = await fetchJson<{ id: string }>(
        `${apiOrigin}/api/public/chat/conversations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgetId: args.widgetId, sessionId }),
        }
      )
      if (disposed || !conversation?.id) return
      conversationIdRef.current = conversation.id

      const history = await fetchJson<{ messages: ServerMessage[] }>(
        `${apiOrigin}/api/public/chat/conversations/${conversation.id}/messages` +
          `?sessionId=${encodeURIComponent(sessionId)}`
      )
      if (disposed) return
      history?.messages?.forEach(m => onIncomingRef.current(toUiMessage(m)))

      const socket = io(`${apiOrigin}/chat`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { role: 'visitor', widgetId: args.widgetId, sessionId },
      })
      socketRef.current = socket
      socket.on('message:new', (msg: ServerMessage) => onIncomingRef.current(toUiMessage(msg)))
      socket.on('operator:presence', (p: { online: boolean }) =>
        setOperatorOnline(Boolean(p?.online))
      )
      socket.on('conversation:closed', () => onClosedRef.current?.())
    }

    void start()

    return () => {
      disposed = true
      socketRef.current?.disconnect()
      socketRef.current = null
      conversationIdRef.current = null
    }
  }, [args.preview, args.widgetId])

  const sendToOperator = useCallback((body: string) => {
    const trimmed = body.trim()
    if (!trimmed || args.preview) return
    socketRef.current?.emit('message:send', { body: trimmed })
  }, [args.preview])

  const sendAttachment = useCallback((attachment: OutgoingAttachment) => {
    if (args.preview || !attachment.attachmentUrl) return
    socketRef.current?.emit('message:send', {
      body: attachment.body ?? '',
      attachmentUrl: attachment.attachmentUrl,
      attachmentType: attachment.attachmentType,
      attachmentName: attachment.attachmentName
    })
  }, [args.preview])

  const markRead = useCallback(() => {
    const id = conversationIdRef.current
    if (!args.preview && id) {
      socketRef.current?.emit('conversation:read', { conversationId: id })
    }
  }, [args.preview])

  const closeConversation = useCallback(() => {
    const id = conversationIdRef.current
    if (!args.preview && id) {
      socketRef.current?.emit('conversation:close', { conversationId: id })
    }
  }, [args.preview])

  // Контакт сохраняется повторным POST'ом на создание диалога: upsert обновляет
  // visitorName/Phone/Email у существующего диалога (см. ChatService.getOrCreateConversation).
  const updateContact = useCallback((contact: VisitorContact) => {
    if (args.preview || !args.widgetId) return
    const sessionId = getCollectorSessionId()
    if (!sessionId) return
    const hasAny = contact.visitorName || contact.visitorPhone || contact.visitorEmail
    if (!hasAny) return
    const apiOrigin = getDefaultApiOrigin()
    void fetchJson(`${apiOrigin}/api/public/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetId: args.widgetId, sessionId, ...contact }),
    })
  }, [args.preview, args.widgetId])

  return { operatorOnline, operators, sendToOperator, sendAttachment, markRead, updateContact, closeConversation }
}
