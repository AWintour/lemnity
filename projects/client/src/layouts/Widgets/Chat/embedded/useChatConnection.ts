import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { getCollectorSessionId, getDefaultApiOrigin } from '@/common/api/publicApi'
import type { ChatUiMessage } from './types'

type ServerMessage = {
  id: string
  sender: 'visitor' | 'manager' | 'system'
  body: string
  createdAt: string
}

type UseChatConnectionArgs = {
  widgetId?: string
  preview?: boolean
  // Вызывается для каждого входящего/исторического серверного сообщения.
  onIncoming: (message: ChatUiMessage) => void
}

type UseChatConnectionResult = {
  operatorOnline: boolean
  sendToOperator: (body: string) => void
  markRead: () => void
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
  const socketRef = useRef<Socket | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const onIncomingRef = useRef(args.onIncoming)
  onIncomingRef.current = args.onIncoming

  useEffect(() => {
    if (args.preview || !args.widgetId) return
    const sessionId = getCollectorSessionId()
    if (!sessionId) return

    const apiOrigin = getDefaultApiOrigin()
    let disposed = false

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
      history?.messages?.forEach(m => onIncomingRef.current({ ...m }))

      const socket = io(`${apiOrigin}/chat`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { role: 'visitor', widgetId: args.widgetId, sessionId },
      })
      socketRef.current = socket
      socket.on('message:new', (msg: ServerMessage) => onIncomingRef.current({ ...msg }))
      socket.on('operator:presence', (p: { online: boolean }) =>
        setOperatorOnline(Boolean(p?.online))
      )
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

  const markRead = useCallback(() => {
    const id = conversationIdRef.current
    if (!args.preview && id) {
      socketRef.current?.emit('conversation:read', { conversationId: id })
    }
  }, [args.preview])

  return { operatorOnline, sendToOperator, markRead }
}
