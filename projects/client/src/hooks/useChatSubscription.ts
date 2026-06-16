import { useCallback, useEffect, useState } from 'react'
import * as chatModule from '@/services/chatModule'

type UseChatSubscriptionResult = {
  subscription: chatModule.ChatSubscription | null
  loading: boolean
  error: boolean
  reload: () => void
}

/**
 * Тариф/подписка «Модуля Чат» по чат-виджету.
 * При ошибке загрузки subscription = null — вызывающий код трактует это
 * как «разрешено» (permissive), чтобы UI никогда не падал из-за фетча.
 */
export function useChatSubscription(widgetId?: string): UseChatSubscriptionResult {
  const [subscription, setSubscription] = useState<chatModule.ChatSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce(n => n + 1), [])

  useEffect(() => {
    if (!widgetId) {
      setSubscription(null)
      setError(false)
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    setError(false)
    chatModule
      .getChatSubscription(widgetId)
      .then(s => {
        if (!alive) return
        setSubscription(s)
      })
      .catch(() => {
        if (!alive) return
        setSubscription(null)
        setError(true)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [widgetId, nonce])

  return { subscription, loading, error, reload }
}

export default useChatSubscription
