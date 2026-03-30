// import type { InitOptions } from './types'
// import EmbedManager from './embedManager'
// import { findEmbedScript } from './utils'

// const manager = new EmbedManager()

// const api = {
//   init: (options: InitOptions) => manager.init(options),
//   destroy: (widgetId?: string) => manager.destroy(widgetId),
//   postMessage: (message: unknown) => manager.postMessage(message)
// }

// const autoInitFromQuery = () => {
//   const currentScript = findEmbedScript()
//   console.debug('[LemnityWidgets] autoInitFromQuery start', currentScript?.src ?? null)
//   if (!currentScript?.src) return
//   try {
//     const url = new URL(currentScript.src)
//     const widgetId = url.searchParams.get('widgetId')
//     if (!widgetId) return

//     console.debug('[LemnityWidgets] init from query', { widgetId })
//     api.init({ widgetId }).catch(err => console.error('[LemnityWidgets]', err))
//   } catch {
//     // ignore parse errors
//   }
// }

// const bootstrap = () => {
//   const w = window as unknown as typeof window & {
//     LemnityWidgets?: {
//       init?: (options: InitOptions) => Promise<void>
//       destroy?: (widgetId?: string) => Promise<void>
//       postMessage?: (message: unknown) => void
//       queue?: { type: 'init'; payload: InitOptions }[]
//     }
//   }

//   const queued = w.LemnityWidgets?.queue ?? []
//   w.LemnityWidgets = { ...w.LemnityWidgets, ...api, queue: [] }
//   queued.forEach(job => {
//     if (job?.type === 'init' && job.payload) {
//       api.init(job.payload).catch((err: unknown) => console.error('[LemnityWidgets]', err))
//     }
//   })  
//   autoInitFromQuery()
// }

// if (document.readyState === 'complete') {
//   bootstrap()
// } else {
//   window.addEventListener('load', bootstrap, { once: true })
// }
