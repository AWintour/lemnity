import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import useAuthStore from '@stores/authStore'
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

type UseChatSocketResult = {
  connected: boolean
  subscribe: (conversationId: string) => void
  sendMessage: (conversationId: string, body: string) => void
  markRead: (conversationId: string) => void
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

    const connect = (token: string) => {
      const socket = io(`${getApiOrigin()}/chat`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        auth: { role: 'manager', token },
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
        if (disposed || refreshing) return
        refreshing = true
        const newToken = await useAuthStore.getState().refreshToken()
        refreshing = false
        if (disposed) return
        if (newToken) {
          socket.auth = { role: 'manager', token: newToken }
          socket.connect()
        }
      })
    }

    const token = useAuthStore.getState().accessToken
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

  const sendMessage = useCallback((conversationId: string, body: string) => {
    socketRef.current?.emit('message:send', { conversationId, body })
  }, [])

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:read', { conversationId })
  }, [])

  return { connected, subscribe, sendMessage, markRead }
}
