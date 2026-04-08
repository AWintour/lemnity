import styles from './embed.css?inline'

import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/system'
import { cn } from '@heroui/theme'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { store } from '@/stores/redux/store'

const NotificationEmbedRuntime = lazy(
  () => import('@/layouts/Widgets/Notification/embedded/embedRuntime')
)
const AnnouncementEmbedRuntime = lazy(
  () => import('@/layouts/Widgets/Announcement/embedded/embedRuntime')
)
const EventTimerEmbedRuntime = lazy(
  () => import('@/layouts/Widgets/EventTimer/embedded/embedRuntime')
)

type WidgetsProps = {
  allowed: number
}

const Widgets = ({ allowed }: WidgetsProps) => {
  if (allowed === 2) {
    return (
      <>
        <NotificationEmbedRuntime />
        <AnnouncementEmbedRuntime />
      </>
    )
  }
  else {
    return <AnnouncementEmbedRuntime />
  }
}

// const autoInitFromQuery = () => {
//   const currentScript = findEmbedScript()
//   console.debug('[LemnityWidgets] autoInitFromQuery start', currentScript?.src ?? null)
//   if (!currentScript?.src) return
//   try {
//     const url = new URL(currentScript.src)
//     const widgetId = url.searchParams.get('widgetId')
//     if (!widgetId) return

//     console.debug('[LemnityWidgets] init from query', { widgetId })
//     // api.init({ widgetId }).catch(err => console.error('[LemnityWidgets]', err))
//   } catch {
//     // ignore parse errors
//   }
// }

const queryClient = new QueryClient()

const bootstrap = async () => {
  console.log('[OwO] we are in.')

  const self: HTMLScriptElement | null = document.querySelector(
    'script[data-id="lemnnity-widgets"]'
  )
  console.log('[lemnity] script:', self)

  if (!self) {
    console.log('[lemnity] Проверьте, что Вы правильно установили скрипт')
    console.log('[lemnity] Скрипт должен быть следующего вида:')

    const exampleScript = document.createElement('script')

    exampleScript.setAttribute('data-id', 'lemnnity-widgets')
    exampleScript.src =
      'http://app.lemnity.ru/embed.js?projectId=<ID ВАШЕГО ПРОЕКТА>'
    exampleScript.type = 'module'
    exampleScript.defer = true

    console.log(exampleScript)
    return
  }

  const url = new URL(self.src)
  console.log('[lemnity]', url)

  const projectId = url.searchParams.get('projectId')
  console.log('[lemnity] projectId', projectId)

  const fetchWidgetsUrl = `http://localhost:3000/api/public/projects/${projectId}`
  const data = await fetch(fetchWidgetsUrl)
  const widgets = await data.json()

  console.log('[lemnity] widgets', widgets)
  // const host = document.createElement('div')
  // host.style.zIndex = '9999999'
  // host.id = 'shadow-host'
  // const shadowRoot = host.attachShadow({ mode: 'closed' })
  // const reactRoot = createRoot(shadowRoot)
  
  // const shadowStyle = document.createElement('style')
  // shadowStyle.textContent = styles
  // shadowRoot.appendChild(shadowStyle)

  // const el = document.getElementById('root')

  // reactRoot.render(
  //   <Provider store={store}>
  //     <QueryClientProvider client={queryClient}>
  //       <HeroUIProvider>
  //         <Widgets allowed={ el ? 2 : 1} />
  //       </HeroUIProvider>
  //     </QueryClientProvider>
  //   </Provider>
  // )
  
  // document.body.appendChild(host)
}

if (document.readyState === 'complete') {
  bootstrap()
} else {
  window.addEventListener('load', bootstrap, { once: true })
}
