import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import styles from './embed.css?inline'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { FABMenuEmbedRuntime } from '@/layouts/Widgets/FABMenu/embedRuntime'
import { WheelEmbedRuntime } from '@/layouts/Widgets/WheelOfFortune/embedRuntime'
import { ConveyorEmbedRuntime } from '@/layouts/Widgets/ConveyorOfLuck/embedRuntime'
import { ActionTimerEmbedRuntime } from '@/layouts/Widgets/CountDown/embedRuntime'
import { CountdownAnnouncementEmbedRuntime } from '@/layouts/Widgets/Announcement/embedded'
import EventTimerEmbedRuntime from '@/layouts/Widgets/EventTimer/embedded/embedRuntime'
import NotificationEmbedRuntime from '@/layouts/Widgets/Notification/embedded/embedRuntime'
import { VideoWidgetEmbedRuntime } from '@/layouts/Widgets/VideoWidget/embedded'
import { CallbackEmbedRuntime } from '@/layouts/Widgets/Callback/embedded'
import ChatEmbedRuntime from '@/layouts/Widgets/Chat/embedded/embedRuntime'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { ensureElement } from './utils'
import { HeroUIProvider } from '@heroui/system'
import { ModalPortalProvider } from '@/components/Modal/Modal'
import { UNSAFE_PortalProvider } from '@react-aria/overlays'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { WidgetSettings } from '@/stores/widgetSettings/types'

/**
 * Конфиг одного виджета, который внешний EmbedManager кладёт в srcdoc-iframe как
 * `window.__lemnityInner` перед загрузкой бандла. Бандл, исполняясь УЖЕ ВНУТРИ iframe
 * (свой JS-реалм → свои синглтон-сторы), монтирует ровно этот виджет в своё окно.
 */
export type LemnityInnerPayload = {
  widgetId: string
  widgetType: WidgetTypeEnum
  projectId?: string
  config: WidgetSettings | null
}

const EmbeddedWidget = ({ widgetType }: { widgetType: WidgetTypeEnum }) => {
  const definition = getWidgetDefinition(widgetType)
  const PanelComponent = definition?.preview?.panel
  if (!PanelComponent) return null
  return <PanelComponent mode="desktop" />
}

const EmbedRuntime = ({ widgetType }: { widgetType: WidgetTypeEnum }) => {
  switch (widgetType) {
    case WidgetTypeEnum.FAB_MENU:
      return <FABMenuEmbedRuntime />
    case WidgetTypeEnum.WHEEL_OF_FORTUNE:
      return <WheelEmbedRuntime />
    // «Конвейер Удачи» — клон колеса с барабаном вместо круга, свой embed-раннер.
    case WidgetTypeEnum.CONVEYOR_OF_LUCK:
      return <ConveyorEmbedRuntime />
    case WidgetTypeEnum.ACTION_TIMER:
      return <ActionTimerEmbedRuntime />
    case WidgetTypeEnum.ANNOUNCEMENT:
      return <CountdownAnnouncementEmbedRuntime />
    case WidgetTypeEnum.EVENT_TIMER:
      return <EventTimerEmbedRuntime />
    case WidgetTypeEnum.NOTIFICATION:
      return <NotificationEmbedRuntime />
    case WidgetTypeEnum.VIDEO_WIDGET:
      return <VideoWidgetEmbedRuntime />
    case WidgetTypeEnum.CALLBACK:
      return <CallbackEmbedRuntime />
    case WidgetTypeEnum.CHAT:
      return <ChatEmbedRuntime />
    default:
      return <EmbeddedWidget widgetType={widgetType} />
  }
}

let mounted = false

/**
 * Точка входа «внутреннего» реалма: бандл загружен ВНУТРИ srcdoc-iframe конкретного виджета.
 * Инициализирует ИЗОЛИРОВАННЫЙ (этого iframe) стор настроек и рендерит один виджет в свой
 * `#lemnity-root-host`. Поскольку каждый виджет грузит бандл в собственном iframe, синглтоны
 * (`useWidgetSettingsStore`, `usePreviewRuntimeStore`, react-query) у каждого свои — конфиги
 * больше не затирают друг друга, поэтому несколько виджетов проекта показываются одновременно.
 */
export const mountInline = (payload: LemnityInnerPayload) => {
  if (mounted) return
  mounted = true

  const { widgetId, widgetType, projectId, config } = payload
  if (!widgetType) {
    console.error('[LemnityWidgets] inner mount: widget type is missing')
    return
  }

  useWidgetSettingsStore.getState().init(widgetId, widgetType, projectId, config ?? undefined)

  const head = document.head
  ensureElement(head, 'style[data-lemnity-embed]', (doc: Document) => {
    const el = doc.createElement('style')
    el.setAttribute('data-lemnity-embed', 'true')
    el.textContent = styles
    return el
  })

  const host =
    document.getElementById('lemnity-root-host') ??
    (() => {
      const div = document.createElement('div')
      div.id = 'lemnity-root-host'
      document.body.appendChild(div)
      return div
    })()

  const themeRoot = ensureElement(host, '#lemnity-theme-root', (doc: Document) => {
    const div = doc.createElement('div')
    div.id = 'lemnity-theme-root'
    return div
  })

  const mountNode = ensureElement(themeRoot, '.lemnity-embed-root', (doc: Document) => {
    const div = doc.createElement('div')
    div.className = 'lemnity-embed-root'
    return div
  })

  const modalPortalRoot = ensureElement(themeRoot, '#lemnity-modal-root', (doc: Document) => {
    const div = doc.createElement('div')
    div.id = 'lemnity-modal-root'
    return div
  })

  const queryClient = new QueryClient()
  const root = createRoot(mountNode)
  root.render(
    <StrictMode>
      <UNSAFE_PortalProvider getContainer={() => modalPortalRoot}>
        <ModalPortalProvider value={modalPortalRoot}>
          <HeroUIProvider>
            <QueryClientProvider client={queryClient}>
              <EmbedRuntime widgetType={widgetType} />
            </QueryClientProvider>
          </HeroUIProvider>
        </ModalPortalProvider>
      </UNSAFE_PortalProvider>
    </StrictMode>
  )
}
