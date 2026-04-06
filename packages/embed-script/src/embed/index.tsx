import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/system'
import { cn } from '@heroui/theme'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  fetchAnnouncementWidget,
} from '@/layouts/Widgets/Announcement/announcementSlice'

import { PublicWidgetsApi, Configuration } from '@lemnity/api-sdk'
import { store } from '@/stores/redux/store'
import {
  fetchNotificationWidget,
  triggerPositionChanged,
} from '@/layouts/Widgets/Notification/notificationSlice'
import styles from './embed.css?inline'

const NotificationEmbedRuntime = lazy(
  () => import('@/layouts/Widgets/Notification/embedded/embedRuntime')
)
const AnnouncementEmbedRuntime = lazy(
  () => import('@/layouts/Widgets/Announcement/embedded/embedRuntime')
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

  const host = document.createElement('div')
  host.style.zIndex = '9999999'
  host.id = 'shadow-host'
  const shadowRoot = host.attachShadow({ mode: 'closed' })
  const reactRoot = createRoot(shadowRoot)
  
  const shadowStyle = document.createElement('style')
  shadowStyle.textContent = styles
  shadowRoot.appendChild(shadowStyle)

  const notificationWidgetId = 'cmmahc07x0000dbn8t7ss7ldn'
  const announcementWidgetId = 'cmm4qe93a0000diqwr5bfdsq6'

  store.dispatch(fetchAnnouncementWidget({
    widgetId: announcementWidgetId,
    embedded: true,
  }))

  store.dispatch(fetchNotificationWidget({
    widgetId: notificationWidgetId,
    embedded: true,
  }))

  setTimeout(() => {
    store.dispatch(triggerPositionChanged('bottom-left'))
  }, 1000)

  const el = document.getElementById('root')

  reactRoot.render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <Widgets allowed={ el ? 2 : 1} />
        </HeroUIProvider>
      </QueryClientProvider>
    </Provider>
  )
  
  document.body.appendChild(host)
}

if (document.readyState === 'complete') {
  bootstrap()
} else {
  window.addEventListener('load', bootstrap, { once: true })
}
