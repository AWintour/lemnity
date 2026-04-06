import type { PublicWidgetResponse } from './types'

export const getWindowOrigin = () => {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

const isLocalHost = (host: string) =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'

const isLanHost = (host: string) =>
  /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)

const isLocalOrLanHost = (host: string) => isLocalHost(host) || isLanHost(host)

const isLocalEnv = () => {
  const { hostname } = window.location
  return isLocalOrLanHost(hostname)
}

export const getApiBase = () => {
  const { hostname } = window.location
  if (isLocalOrLanHost(hostname)) {
    const apiHost = isLanHost(hostname) ? hostname : 'localhost'
    return `http://${apiHost}:3000/api`
  }

  return 'https://app.lemnity.ru/api'
}

export const findEmbedScript = () => {
  if (typeof document === 'undefined') return null
  const scripts = [
    document.currentScript as HTMLScriptElement | null | undefined,
    ...Array.from(document.querySelectorAll<HTMLScriptElement>('script'))
  ]
  const isProd = !isLocalEnv()
  for (const script of scripts) {
    if (script?.src?.includes(isProd ? 'app.lemnity.ru/embed.js' : '/embed.js')) {
      return script
    }
  }
  return null
}

const buildPublicWidgetUrl = (widgetId: string, apiBase?: string) => {
  const base = apiBase ?? getApiBase()
  return `${base}/public/widgets/${encodeURIComponent(widgetId)}`
}

export const fetchPublicWidget = async (
  widgetId: string,
  apiBase?: string
): Promise<PublicWidgetResponse> => {
  const res = await fetch(buildPublicWidgetUrl(widgetId, apiBase), {
    method: 'GET',
    credentials: 'omit'
  })
  if (!res.ok) {
    throw new Error(`Failed to load widget ${widgetId}: ${res.status}`)
  }
  return (await res.json()) as PublicWidgetResponse
}

/**
 * Создает контейнер-хост на сайте партнера.
 * Этот элемент остается в основном DOM, в него мы вставим <iframe>.
 */
export const ensureContainer = (widgetId: string) => {
  const id = `lemnity-widget-${widgetId}`
  const existing = document.getElementById(id)
  if (existing) return existing

  const el = document.createElement('div')
  el.setAttribute('data-lemnity-embed-container', 'true')
  el.id = id
  el.style.zIndex = '2147483000'
  el.style.display = 'block'
  el.style.position = 'fixed'
  el.style.pointerEvents = 'none'
  el.style.top = '0'
  el.style.left = '0'
  el.style.width = '100vw'
  el.style.height = '100vh'
  document.body.appendChild(el)

  return el
}

/**
 * Важно: используем parent.ownerDocument, чтобы создавать элементы 
 * именно в том документе, где находится parent (внутри iframe).
 */
export const ensureElement = <T extends HTMLElement>(
  parent: ParentNode,
  selector: string,
  create: (doc: Document) => T
): T => {
  const existing = (parent as HTMLElement).querySelector<T>(selector)
  if (existing) return existing

  const doc = parent.ownerDocument || (parent as Document)
  const el = create(doc)
  parent.appendChild(el)

  return el
}
