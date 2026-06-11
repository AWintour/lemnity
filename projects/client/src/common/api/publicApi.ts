import { uuidv4 } from '@/common/utils/uuidv4'

export type CollectorEvent = {
  event_name: string
  widget_id: string
  project_id?: string
  session_id?: string
  user_id?: string
  url?: string
  referrer?: string
  user_agent?: string
  payload?: Record<string, unknown>
}

const COLLECTOR_SESSION_KEY = 'lemnity.session_id'
let inMemoryCollectorSessionId: string | null = null

const safeSessionGetItem = (key: string): string | null => {
  try {
    return window.sessionStorage?.getItem(key) ?? null
  } catch {
    return null
  }
}

const safeSessionSetItem = (key: string, value: string): void => {
  try {
    window.sessionStorage?.setItem(key, value)
  } catch {
    // ignore
  }
}

export function getCollectorSessionId(): string | null {
  const fromMemory = inMemoryCollectorSessionId
  if (fromMemory) return fromMemory

  const existing = safeSessionGetItem(COLLECTOR_SESSION_KEY)
  if (existing) {
    inMemoryCollectorSessionId = existing
    return existing
  }

  const next = uuidv4()
  inMemoryCollectorSessionId = next
  safeSessionSetItem(COLLECTOR_SESSION_KEY, next)
  return next
}

const isLocalHost = (host: string) =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'

const isLanHost = (host: string) =>
  /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)

const isLocalOrLanHost = (host: string) => isLocalHost(host) || isLanHost(host)

const getDefaultApiOrigin = () => {
  if (typeof window === 'undefined') return 'https://app.lemnity.ru'

  const host = window.location.hostname
  const apiHost = isLanHost(host) ? host : 'localhost'
  const devOrigin = `${window.location.protocol}//${apiHost}:3000`
  if (isLocalOrLanHost(host)) return devOrigin

  const raw = (import.meta.env.VITE_API_URL ?? '') as string
  if (raw) {
    try {
      const parsed = new URL(raw, window.location.origin)
      return parsed.origin
    } catch {
      // ignore
    }
  }

  if (import.meta.env.DEV) return devOrigin
  return 'https://app.lemnity.ru'
}

const getDefaultCollectEndpoint = () => `${getDefaultApiOrigin()}/api/public/collect`

export async function sendEvent(event: CollectorEvent): Promise<boolean> {
  const endpoint = (import.meta.env.VITE_COLLECT_URL ?? getDefaultCollectEndpoint()) as string

  try {
    const session_id = event.session_id ?? getCollectorSessionId() ?? undefined
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...event, session_id }),
      keepalive: true,
      credentials: 'omit'
    })
    return res.ok
  } catch {
    return false
  }
}

export type PublicRequestPayload = {
  widgetId: string
  fullName?: string
  phone?: string
  email?: string
  prizes?: string[]
  sectorId?: string
  isWin?: boolean
  device?: 'desktop' | 'mobile_ios' | 'mobile_android'
  url?: string
  referrer?: string
  userAgent?: string
}

export type PublicWheelSpinSector = {
  id: string
  mode: 'text' | 'icon'
  text?: string
  icon?: string
  promo?: string
  chance?: number
  isWin?: boolean
}

export type PublicWheelSpinResult = {
  sectorId: string
  isWin: boolean
  sector: PublicWheelSpinSector
}

export type PublicWheelSpinAlreadySpun = {
  blocked: true
  reason: 'already_spun'
  sectorId: string
  isWin: boolean
  sector: PublicWheelSpinSector
}

export type PublicWheelSpinResponse = PublicWheelSpinResult | PublicWheelSpinAlreadySpun

const getDefaultPublicRequestsEndpoint = () => `${getDefaultApiOrigin()}/api/public/requests`

const getDefaultPublicCallbackEndpoint = () => `${getDefaultApiOrigin()}/api/public/callback`

const getDefaultPublicWheelSpinEndpoint = (widgetId: string) =>
  `${getDefaultApiOrigin()}/api/public/widgets/${widgetId}/spin`

export async function sendPublicRequest(payload: PublicRequestPayload): Promise<boolean> {
  const endpoint = (import.meta.env.VITE_PUBLIC_REQUESTS_URL ??
    getDefaultPublicRequestsEndpoint()) as string

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit'
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Заявка на обратный звонок (виджет CALLBACK): создаёт лид и планирует звонок через Mango.
 * Возвращает delaySeconds (через сколько перезвоним) или null при ошибке.
 */
export async function sendCallbackRequest(
  payload: PublicRequestPayload
): Promise<{ delaySeconds: number } | null> {
  const endpoint = (import.meta.env.VITE_PUBLIC_CALLBACK_URL ??
    getDefaultPublicCallbackEndpoint()) as string

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit'
    })
    if (!res.ok) return null
    return (await res.json()) as { delaySeconds: number }
  } catch {
    return null
  }
}

export async function fetchPublicWheelSpinResult(
  widgetId: string,
  sessionId: string
): Promise<PublicWheelSpinResponse | null> {
  const endpoint = (import.meta.env.VITE_PUBLIC_WHEEL_SPIN_URL ??
    getDefaultPublicWheelSpinEndpoint(widgetId)) as string

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId }),
      credentials: 'omit'
    })
    if (!res.ok) return null
    return (await res.json()) as PublicWheelSpinResponse
  } catch {
    return null
  }
}
