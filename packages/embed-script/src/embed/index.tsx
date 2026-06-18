import type { InitOptions } from './types'
import EmbedManager from './embedManager'
import { mountInline, type LemnityInnerPayload } from './mountInline'
import { collectEmbedProjectIds, collectEmbedWidgetIds, fetchPublicProjectWidgets } from './utils'

// По одному менеджеру на widgetId: один EmbedManager хостит ровно один виджет
// (init вызывает destroy предыдущего). Так одно исполнение может смонтировать несколько
// разных виджетов, а глобальный гард (__lemnityMounted) не даёт смонтировать один и тот же
// виджет дважды, когда embed.js подключён на странице несколько раз.
const managers = new Map<string, EmbedManager>()

const initWidget = (options: InitOptions) => {
  let manager = managers.get(options.widgetId)
  if (!manager) {
    manager = new EmbedManager()
    managers.set(options.widgetId, manager)
  }
  return manager.init(options)
}

const api = {
  init: (options: InitOptions) => initWidget(options),
  destroy: (widgetId?: string) => {
    if (widgetId) {
      const manager = managers.get(widgetId)
      managers.delete(widgetId)
      return manager ? manager.destroy(widgetId) : Promise.resolve()
    }
    const all = Array.from(managers.values())
    managers.clear()
    return Promise.all(all.map(m => m.destroy())).then(() => undefined)
  },
  postMessage: (message: unknown) => managers.forEach(m => m.postMessage(message))
}

const autoInitFromQuery = () => {
  const widgetIds = collectEmbedWidgetIds()
  console.debug('[LemnityWidgets] autoInit widgetIds', widgetIds)
  widgetIds.forEach(widgetId => {
    api.init({ widgetId }).catch(err => console.error('[LemnityWidgets]', err))
  })

  // Проектное размещение: один тег ?projectId=... → все включённые виджеты проекта одним
  // запросом. Конфиги прокидываем как payload, чтобы менеджеры не делали повторных запросов.
  // Дедуп с одиночными ?widgetId= тегами обеспечивает гард __lemnityMounted в EmbedManager.
  const projectIds = collectEmbedProjectIds()
  console.debug('[LemnityWidgets] autoInit projectIds', projectIds)
  projectIds.forEach(projectId => {
    fetchPublicProjectWidgets(projectId)
      .then(widgets => {
        widgets.forEach(payload => {
          api.init({ widgetId: payload.id, payload }).catch(err =>
            console.error('[LemnityWidgets]', err)
          )
        })
      })
      .catch(err => console.error('[LemnityWidgets]', err))
  })
}

const bootstrap = () => {
  // «Внутренний» реалм: бандл загружен ВНУТРИ srcdoc-iframe конкретного виджета
  // (EmbedManager положил конфиг в window.__lemnityInner). Монтируем ровно один виджет
  // в это окно и выходим — никакого autoInit/проектного скана здесь быть не должно.
  const inner = (window as unknown as { __lemnityInner?: LemnityInnerPayload }).__lemnityInner
  if (inner) {
    mountInline(inner)
    return
  }

  const w = window as unknown as typeof window & {
    LemnityWidgets?: {
      init?: (options: InitOptions) => Promise<void>
      destroy?: (widgetId?: string) => Promise<void>
      postMessage?: (message: unknown) => void
      queue?: { type: 'init'; payload: InitOptions }[]
    }
  }

  const queued = w.LemnityWidgets?.queue ?? []
  w.LemnityWidgets = { ...w.LemnityWidgets, ...api, queue: [] }
  queued.forEach(job => {
    if (job?.type === 'init' && job.payload) {
      api.init(job.payload).catch((err: unknown) => console.error('[LemnityWidgets]', err))
    }
  })  
  autoInitFromQuery()
}

if (document.readyState === 'complete') {
  bootstrap()
} else {
  window.addEventListener('load', bootstrap, { once: true })
}
