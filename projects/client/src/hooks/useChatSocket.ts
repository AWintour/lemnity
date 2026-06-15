import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import useAuthStore from '@stores/authStore'
import useOperatorAuthStore from '@stores/operatorAuthStore'
import type { ChatMessage } from '@/services/chats'

const getApiOrigin = () => {
  const raw = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api') as string
  try {
    return new URL(raw, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

type UseChatSocketHandlers = {
  onMessage?: (message: ChatMessage) => void
  onConversationUpdated?: (conversationId: string) => void
  onPresence?: (online: boolean) => void
}

export type SocketAttachment = {
  attachmentUrl: string
  attachmentType: 'image' | 'video' | 'file'
  attachmentName?: string
}

export type MessageAttachment = {
  url: string
  type: 'image' | 'video' | 'file'
  name?: string
}

type UseChatSocketResult = {
  connected: boolean
  subscribe: (conversationId: string) => void
  // attachment — одиночное (legacy), attachments — галерея (до 10) одним сообщением.
  sendMessage: (
    conversationId: string,
    body: string,
    attachment?: SocketAttachment,
    attachments?: MessageAttachment[]
  ) => void
  markRead: (conversationId: string) => void
  // Сообщает посетителю, что оператор набирает/перестал набирать текст.
  sendTyping: (conversationId: string, typing: boolean) => void
}

/**
 * Менеджерский socket кабинета (namespace `/chat`, auth role=manager + JWT).
 * Первичная загрузка списка/истории — через REST (services/chats), realtime-апдейты — здесь.
 * При истечении accessToken (connect_error) дёргаем refresh и переподключаемся.
 */
export const useChatSocket = (handlers: UseChatSocketHandlers): UseChatSocketResult => {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    let disposed = false
    let refreshing = false

    // Операторская сессия (если есть) — приоритет: role 'operator' + операторский токен.
    const operatorToken = useOperatorAuthStore.getState().token
    const isOperator = !!operatorToken
    const role = isOperator ? 'operator' : 'manager'

    const connect = (token: string) => {
      const socket = io(`${getApiOrigin()}/chat`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { role, token },
      })
      socketRef.current = socket

      socket.on('connect', () => !disposed && setConnected(true))
      socket.on('disconnect', () => !disposed && setConnected(false))

      socket.on('message:new', (msg: ChatMessage) => {
        handlersRef.current.onMessage?.(msg)
      })
      socket.on('conversation:updated', (p: { conversationId: string }) => {
        if (p?.conversationId) handlersRef.current.onConversationUpdated?.(p.conversationId)
      })
      socket.on('operator:presence', (p: { online: boolean }) => {
        handlersRef.current.onPresence?.(Boolean(p?.online))
      })

      socket.on('connect_error', async () => {
        // У операторской сессии рефреша нет — переподключение по токену из стора.
        if (disposed || refreshing || isOperator) return
        refreshing = true
        const newToken = await useAuthStore.getState().refreshToken()
        refreshing = false
        if (disposed) return
        if (newToken) {
          socket.auth = { role, token: newToken }
          socket.connect()
        }
      })
    }

    const token = operatorToken ?? useAuthStore.getState().accessToken
    if (token) connect(token)

    return () => {
      disposed = true
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  const subscribe = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:subscribe', { conversationId })
  }, [])

  const sendMessage = useCallback(
    (
      conversationId: string,
      body: string,
      attachment?: SocketAttachment,
      attachments?: MessageAttachment[]
    ) => {
      socketRef.current?.emit('message:send', {
        conversationId,
        body,
        ...attachment,
        ...(attachments?.length ? { attachments } : {})
      })
    },
    []
  )

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:read', { conversationId })
  }, [])

  const sendTyping = useCallback((conversationId: string, typing: boolean) => {
    socketRef.current?.emit('operator:typing', { conversationId, typing })
  }, [])

  return { connected, subscribe, sendMessage, markRead, sendTyping }
}
