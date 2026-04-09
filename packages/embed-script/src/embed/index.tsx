import styles from './embed.css?inline'

import { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from '@heroui/system'
import { cn } from '@heroui/theme'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { store } from '@/stores/redux/store'
import type { WidgetTypeId } from '@lemnity/widget-config/widgets/base'


const NotificationWidget = lazy(
  () => import('@/layouts/Widgets/Notification/embedded/EmbeddedWidget')
)
const AnnouncementWidget = lazy(
  () => import('@/layouts/Widgets/Announcement/embedded/EmbeddedWidget')
)
const EventTimerWidget = lazy(
  () => import('@/layouts/Widgets/EventTimer/embedded/EmbeddedWidget')
)


type WidgetProps = {
  widgetId: string
  type: WidgetTypeId
}

const Widget = ({ widgetId, type }: WidgetProps) => {
  switch (type) {
    case 'ANNOUNCEMENT':
      return <AnnouncementWidget widgetId={widgetId} />
    case 'NOTIFICATION':
      return <NotificationWidget widgetId={widgetId} />
    case 'EVENT_TIMER':
      return <EventTimerWidget widgetId={widgetId} />
  }
}


const displayScriptInstallationGuide = () => {
  console.log('[lemnity] Проверьте, что Вы правильно установили скрипт')
  console.log('[lemnity] Скрипт должен быть следующего вида:')

  const exampleScript = document.createElement('script')

  exampleScript.setAttribute('data-id', 'lemnnity-widgets')
  exampleScript.setAttribute('data-project-id', '<ID ВАШЕГО ПРОЕКТА>')
  exampleScript.src = 'http://app.lemnity.ru/embed.js'
  exampleScript.type = 'module'
  exampleScript.defer = true

  console.log(exampleScript)
}


const getProjectId = () => {
  const self: HTMLScriptElement | null = document.querySelector(
    'script[data-id="lemnnity-widgets"]'
  )
  console.log('[lemnity] script:', self)

  if (!self) {
    displayScriptInstallationGuide()
    return
  }

  const projectId = self.attributes.getNamedItem('data-project-id')?.value

  if (!projectId) {
    console.log('[lemnity] Не найден projectId в атрибутах скрипта')
    displayScriptInstallationGuide()
    return
  }

  console.log('[lemnity] projectId', projectId)

  return projectId
}


type WidgetIdsAndTypes = {
  widgets: { id: string, type: WidgetTypeId }[]
}

const fetchActiveWidgetsForAProject = async (projectId: string) => {
  console.log('[lemnity] BASE_URL', import.meta.env.BASE_URL)

  const fetchWidgetsUrl =
    `http://localhost:3000/api/public/projects/${projectId}`
  const data = await fetch(fetchWidgetsUrl)
  const json: WidgetIdsAndTypes | undefined = await data.json()

  if (!json) {
    console.log('[lemnity] Не удалось загруить идентификаторы виджетов')
    return
  }

  return json.widgets
}


const fetchActiveProjectWidgets = async () => {
  const projectId = getProjectId()
  
  if (!projectId) {
    return
  }
  
  const widgets = await fetchActiveWidgetsForAProject(projectId)
  
  if (!widgets || widgets.length === 0) {
    console.log(
      '[lemnity] Убедитесь, что Вы создали и активировали хотя бы один виджет' +
      'в проекте'
    )
    return
  }
  
  console.log('[lemnity] widgets', widgets)
  return widgets
}


const queryClient = new QueryClient()

const bootstrap = async () => {
  console.log('[OwO] we are in.')

  if ((window as any).LEMNNITY_INITIALIZATION_GUARD) {
    console.log(
      '[lemnity] Скрипт уже был инициализирован, пропускаю повторную' +
      'инициализацию...'
    )
    console.log(
      '[lemnity] Проверьте, что скрипт не установлен дважды на одной странице'
    )
    return
  }

  (window as any).LEMNNITY_INITIALIZATION_GUARD = true

  const widgets = await fetchActiveProjectWidgets()

  if (!widgets || widgets.length === 0) {
    return
  }

  const host = document.createElement('div')
  host.style.zIndex = '9999999'
  host.id = 'shadow-host'
  const shadowRoot = host.attachShadow({ mode: 'closed' })
  const reactRoot = createRoot(shadowRoot)
  
  const shadowStyle = document.createElement('style')
  shadowStyle.textContent = styles
  shadowRoot.appendChild(shadowStyle)

  reactRoot.render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          {widgets.map((widget) => (
            <Widget key={widget.type} widgetId={widget.id} type={widget.type}/>
          ))}
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
