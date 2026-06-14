const FALLBACK_PATH = '/embed.js'

const getWindowOrigin = () => {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export const getEmbedScriptUrl = (): string => {
  const origin = getWindowOrigin()
  return origin ? `${origin}${FALLBACK_PATH}` : FALLBACK_PATH
}

// Собирает тег <script ...embed.js?{param}={value}...> для встройки.
const buildSnippet = (param: 'widgetId' | 'projectId', value: string): string => {
  const scriptUrl = getEmbedScriptUrl()
  const url = (() => {
    try {
      const u = new URL(
        scriptUrl,
        typeof window !== 'undefined' ? window.location.origin : undefined
      )
      u.searchParams.set(param, value)
      return u.toString()
    } catch {
      // fallback if URL  не сработал
      const sep = scriptUrl.includes('?') ? '&' : '?'
      return `${scriptUrl}${sep}${param}=${encodeURIComponent(value)}`
    }
  })()

  return `<script src="${url}" type="module" defer></script>`
}

// Персональный скрипт виджета: один тег → один виджет.
export const buildEmbedSnippet = (widgetId: string): string => buildSnippet('widgetId', widgetId)

// Проектный скрипт: один тег → все включённые виджеты проекта (до 3).
export const buildProjectEmbedSnippet = (projectId: string): string =>
  buildSnippet('projectId', projectId)
