import type { PublicWidgetResponse } from './types'

// Имя файла embed.js в src скрипта зависит от окружения (prod-домен vs относительный путь).
const getEmbedScriptMatch = () => (isLocalEnv() ? '/embed.js' : 'app.lemnity.ru/embed.js')

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

/**
 * Абсолютный URL бандла embed.js (без query). Нужен, чтобы загрузить бандл ВНУТРЬ
 * srcdoc-iframe каждого виджета — так каждый виджет исполняется в собственном JS-реалме
 * со своими синглтон-сторами (см. mountInline). Берём из тега на странице партнёра,
 * с фолбэком на прод/локальный origin.
 */
export const getEmbedBundleUrl = (): string => {
  const script = findEmbedScript()
  if (script?.src) {
    try {
      const u = new URL(script.src)
      u.search = ''
      return u.toString()
    } catch {
      // ignore parse errors
    }
  }
  return isLocalEnv() ? `${getWindowOrigin()}/embed.js` : 'https://app.lemnity.ru/embed.js'
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

/**
 * Собирает ВСЕ уникальные widgetId со всех тегов <script src=".../embed.js?widgetId=...">.
 *
 * Почему так: сниппет встраивается как `type="module"`, для модулей `document.currentScript`
 * всегда `null`, а скрипт грузится отложенно (defer) — поэтому в момент `load` нельзя надёжно
 * определить «свой» тег. Если на странице два тега embed.js, `findEmbedScript()` для обоих
 * исполнений возвращал ПЕРВЫЙ тег → первый виджет монтировался дважды. Сбор всех id + монтаж
 * каждого ровно один раз (см. дедуп в EmbedManager.init) делает бутстрап идемпотентным.
 */
export const collectEmbedWidgetIds = (): string[] => {
  if (typeof document === 'undefined') return []
  const isProd = !isLocalEnv()
  const match = isProd ? 'app.lemnity.ru/embed.js' : '/embed.js'
  const ids: string[] = []
  for (const script of Array.from(document.querySelectorAll<HTMLScriptElement>('script'))) {
    const src = script.src || ''
    if (!src.includes(match)) continue
    try {
      const id = new URL(src).searchParams.get('widgetId')
      if (id && !ids.includes(id)) ids.push(id)
    } catch {
      // ignore parse errors
    }
  }
  return ids
}

/**
 * Собирает уникальные projectId со всех тегов <script src=".../embed.js?projectId=...">.
 * Зеркалит collectEmbedWidgetIds, но для проектного размещения: один тег → все включённые
 * виджеты проекта.
 */
export const collectEmbedProjectIds = (): string[] => {
  if (typeof document === 'undefined') return []
  const match = getEmbedScriptMatch()
  const ids: string[] = []
  for (const script of Array.from(document.querySelectorAll<HTMLScriptElement>('script'))) {
    const src = script.src || ''
    if (!src.includes(match)) continue
    try {
      const id = new URL(src).searchParams.get('projectId')
      if (id && !ids.includes(id)) ids.push(id)
    } catch {
      // ignore parse errors
    }
  }
  return ids
}

const buildPublicWidgetUrl = (widgetId: string, apiBase?: string) => {
  const base = apiBase ?? getApiBase()
  return `${base}/public/widgets/${encodeURIComponent(widgetId)}`
}

const buildPublicProjectWidgetsUrl = (projectId: string, apiBase?: string) => {
  const base = apiBase ?? getApiBase()
  return `${base}/public/projects/${encodeURIComponent(projectId)}/widgets`
}

export const fetchPublicProjectWidgets = async (
  projectId: string,
  apiBase?: string
): Promise<PublicWidgetResponse[]> => {
  const res = await fetch(buildPublicProjectWidgetsUrl(projectId, apiBase), {
    method: 'GET',
    credentials: 'omit'
  })
  if (!res.ok) {
    throw new Error(`Failed to load project widgets ${projectId}: ${res.status}`)
  }
  return (await res.json()) as PublicWidgetResponse[]
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
