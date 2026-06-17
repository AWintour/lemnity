import { useCallback, useEffect, useState } from 'react'
import { getPushPublicKey, subscribePush, unsubscribePush } from '@/services/push'

// Состояние web-push в кабинете оператора:
//  unsupported — браузер не умеет (или iOS-Safari без установки на домашний экран);
//  denied      — пользователь заблокировал уведомления в браузере (включить нельзя);
//  off         — поддерживается, но подписки нет;
//  on          — подписка активна;
//  loading     — идёт включение/выключение.
export type WebPushStatus = 'unsupported' | 'denied' | 'off' | 'on' | 'loading'

const SW_URL = '/sw.js'

const isSupported = () =>
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

// base64url (VAPID public key) → Uint8Array для applicationServerKey.
const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

const getRegistration = async (): Promise<ServiceWorkerRegistration> => {
  const existing = await navigator.serviceWorker.getRegistration(SW_URL)
  return existing ?? (await navigator.serviceWorker.register(SW_URL))
}

const keyB64 = (sub: PushSubscription, name: 'p256dh' | 'auth'): string => {
  const key = sub.getKey(name)
  if (!key) return ''
  let str = ''
  const bytes = new Uint8Array(key)
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const useWebPush = (projectId?: string | null) => {
  const [status, setStatus] = useState<WebPushStatus>('loading')

  // Первичная синхронизация состояния с реальной подпиской/разрешением.
  useEffect(() => {
    let cancelled = false
    if (!isSupported()) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    void (async () => {
      try {
        const reg = await getRegistration()
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setStatus(sub ? 'on' : 'off')
      } catch {
        if (!cancelled) setStatus('off')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const enable = useCallback(async () => {
    if (!isSupported()) {
      console.warn('[web-push] браузер не поддерживает push (нет serviceWorker/PushManager)')
      return
    }
    if (!projectId) {
      console.warn('[web-push] нет активного проекта (projectId) — кнопка отключена')
      return
    }
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn(`[web-push] разрешение на уведомления не выдано: ${permission}`)
        setStatus(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const publicKey = await getPushPublicKey().catch(err => {
        console.warn('[web-push] GET /chat/push/public-key не удался:', err)
        return null
      })
      if (!publicKey) {
        // Push не настроен на сервере (нет VAPID-ключей) или запрос не прошёл.
        console.warn(
          '[web-push] сервер не вернул VAPID public key — задайте VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY в env и перезапустите сервер'
        )
        setStatus('off')
        return
      }
      const reg = await getRegistration()
      await navigator.serviceWorker.ready
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // cast: под строгой TS-lib Uint8Array — generic (ArrayBufferLike), а DOM ждёт BufferSource.
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }))
      await subscribePush({
        projectId,
        endpoint: sub.endpoint,
        p256dh: keyB64(sub, 'p256dh'),
        auth: keyB64(sub, 'auth'),
        userAgent: navigator.userAgent,
      })
      setStatus('on')
    } catch (err) {
      console.warn('[web-push] не удалось подписаться:', err)
      setStatus('off')
    }
  }, [projectId])

  const disable = useCallback(async () => {
    if (!isSupported()) return
    setStatus('loading')
    try {
      const reg = await getRegistration()
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await unsubscribePush(sub.endpoint).catch(() => undefined)
        await sub.unsubscribe().catch(() => undefined)
      }
      setStatus('off')
    } catch {
      setStatus('off')
    }
  }, [])

  return { status, enable, disable }
}
