import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import styles from './embed.css?inline'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { FABMenuEmbedRuntime } from '@/layouts/Widgets/FABMenu/embedRuntime'
import { WheelEmbedRuntime } from '@/layouts/Widgets/WheelOfFortune/embedRuntime'
import { ActionTimerEmbedRuntime } from '@/layouts/Widgets/CountDown/embedRuntime'
import { CountdownAnnouncementEmbedRuntime } from '@/layouts/Widgets/Announcement/embedded'
import EventTimerEmbedRuntime from '@/layouts/Widgets/EventTimer/embedded/embedRuntime'
import NotificationEmbedRuntime from '@/layouts/Widgets/Notification/embedded/embedRuntime'
import { VideoWidgetEmbedRuntime } from '@/layouts/Widgets/VideoWidget/embedded'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { InitOptions } from './types'
import { ensureContainer, ensureElement, fetchPublicWidget } from './utils'
import { HeroUIProvider } from '@heroui/system'
import { ModalPortalProvider } from '@/components/Modal/Modal'
import { UNSAFE_PortalProvider } from '@react-aria/overlays'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const EmbedRuntime = ({ widgetType }: { widgetType: WidgetTypeEnum }) => {
  switch (widgetType) {
    case WidgetTypeEnum.FAB_MENU:
      return <FABMenuEmbedRuntime />
    case WidgetTypeEnum.WHEEL_OF_FORTUNE:
      return <WheelEmbedRuntime />
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
    default:
      return <EmbeddedWidget widgetType={widgetType} />
  }
}

export const EmbeddedWidget = ({
  widgetType
}: {
  widgetType: WidgetTypeEnum
}) => {
  const definition = getWidgetDefinition(widgetType)
  const PanelComponent = definition?.preview?.panel
  if (!PanelComponent) return null
  return <PanelComponent mode="desktop"/>
}

class EmbedManager {
  private root: Root | null = null
  private container: HTMLElement | null = null
  private widgetId: string | null = null
  private iframe: HTMLIFrameElement | null = null
  private interactiveRect: { left: number; top: number; width: number; height: number; padding?: number } | null = null
  private pointerLock = false
  private lastClipPath: string | null = null
  private hasVisualViewportListeners = false
  private resizeRaf = 0
  private queryClient = new QueryClient()
  
  private getViewportMetrics() {
    const vv = window.visualViewport
    const scale = vv?.scale ?? 1
    const isScaleStable = Math.abs(scale - 1) < 0.01
    if (vv && isScaleStable) {
      return {
        width: Math.ceil(vv.width),
        height: Math.ceil(vv.height),
        offsetLeft: Math.round(vv.offsetLeft),
        offsetTop: Math.round(vv.offsetTop)
      }
    }
    return {
      width: Math.ceil(window.innerWidth),
      height: Math.ceil(window.innerHeight),
      offsetLeft: 0,
      offsetTop: 0
    }
  }

  private syncFrameSize() {
    if (!this.container) return
    const { width, height, offsetLeft, offsetTop } = this.getViewportMetrics()
    if (!width || !height) return
    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`
    this.container.style.left = `${offsetLeft}px`
    this.container.style.top = `${offsetTop}px`
  }

  private handleResize = () => {
    cancelAnimationFrame(this.resizeRaf)
    this.resizeRaf = requestAnimationFrame(() => {
      this.syncFrameSize()
      this.syncFrameInteractivity(true)
    })
  }

  private handleMessage = (event: MessageEvent) => {
    // if (event.data?.scope?.startsWith('lemnity')) {
    //   console.table('[EmbedManager]', event.data?.rect)
    //   console.trace()
    //   console.log('///////////////////////////////////////////')
    // }

    const scopeOk =
      event.data
      && typeof event.data === 'object'
      && event.data.scope === 'lemnity-embed'

    if (!scopeOk) return

    const fromIframe = event.source === this.iframe?.contentWindow

    if (fromIframe) {
      this.handleChildMessage(event.data)
      return
    }

    if (event.data.type === 'interactive-region') {
      this.handleChildMessage(event.data)
    }

    // Forward external messages with our scope into the iframe
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(event.data, '*')
    }
  }

  private handleChildMessage(data: unknown) {
    if (!data || typeof data !== 'object') return

    const message = data as {
      type?: string
      rect?: { left: number; top: number; width: number; height: number; padding?: number }
      lock?: boolean
      level?: 'log' | 'info' | 'warn' | 'error' | 'debug'
      args?: unknown[]
    }
    if (message.type === 'interactive-region') {
      this.interactiveRect = message.rect ?? null
      this.pointerLock = Boolean(message.lock)
      this.syncFrameInteractivity(true)
    }
  }

  private syncFrameInteractivity(force = false) {
    if (!this.container) return

    const setClipPath = (clipPath: string | null) => {
      if (!clipPath) {
        this.container!.style.clipPath = ''
        ;(this.container!.style as CSSStyleDeclaration & { WebkitClipPath?: string }).WebkitClipPath = ''
        this.lastClipPath = null
        return
      }
      if (this.lastClipPath === clipPath && !force) return
      this.container!.style.clipPath = clipPath
      ;(this.container!.style as CSSStyleDeclaration & { WebkitClipPath?: string }).WebkitClipPath = clipPath
      this.lastClipPath = clipPath
    }

    const { width: vw, height: vh } = this.getViewportMetrics()
    if (!vw || !vh) return

    if (this.pointerLock) {
      this.container!.style.pointerEvents = 'auto'
      setClipPath('inset(0px 0px 0px 0px)')
      return
    }

    if (!this.interactiveRect) {
      this.container!.style.pointerEvents = 'none'
      setClipPath('inset(100% 100% 100% 100%)')
      return
    }

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
    const { left, top, width, height, padding = 24 } = this.interactiveRect
    const x1 = clamp(left - padding, 0, vw)
    const y1 = clamp(top - padding, 0, vh)
    const x2 = clamp(left + width + padding, 0, vw)
    const y2 = clamp(top + height + padding, 0, vh)

    const topInset = y1
    const leftInset = x1
    const rightInset = Math.max(0, vw - x2)
    const bottomInset = Math.max(0, vh - y2)

    this.container!.style.pointerEvents = 'auto'
    setClipPath(`inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px)`)
  }

  async init(options: InitOptions) {
    try {
      const { widgetId, apiBase } = options
      await this.destroy()

      const payload = await fetchPublicWidget(widgetId, apiBase)
      if (!payload.enabled) throw new Error('Widget is disabled')
      if (!payload.config) throw new Error('Widget config is empty')
      const widgetType = (payload.config.widgetType as WidgetTypeEnum | undefined) ?? payload.type
      if (!widgetType) throw new Error('Widget type is missing')

      useWidgetSettingsStore.getState().init(widgetId, widgetType, payload.projectId, payload.config)

      const container = ensureContainer(widgetId)
      const iframe = document.createElement('iframe')
      iframe.setAttribute('data-lemnity-embed-frame', 'true')

      Object.assign(iframe.style, {
        border: 'none',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: '0',
        background: 'transparent',
        colorScheme: 'light',
        zIndex: '2147483001',
        pointerEvents: 'auto'
      })
      
      iframe.srcdoc = `<!DOCTYPE html>
        <html>
        <head>
          <meta name="color-scheme" content="light dark">
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style="margin:0;padding:0;background:transparent;">
          <div id="lemnity-root-host"></div>
          <script>
            (() => {
              const isIOS = (() => {
                const ua = navigator.userAgent || ''
                const platform = navigator.platform || ''
                const iOS = /iP(hone|od|ad)/.test(platform)
                const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1
                return iOS || iPadOS
              })()

              if (isIOS) {
                const existing = document.querySelector('meta[name="viewport"]')
                const meta = existing || document.createElement('meta')
                meta.setAttribute('name', 'viewport')
                meta.setAttribute(
                  'content',
                  'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'
                )
                if (!existing) document.head.appendChild(meta)
              }

              const SCOPE = 'lemnity-embed'
              const postMessage = payload => {
                try {
                  window.parent?.postMessage({ scope: SCOPE, ...payload }, '*')
                } catch {
                }
              }
              const safeStringify = value => {
                try {
                  if (typeof value === 'string') return value
                  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
                  if (value === null) return 'null'
                  if (value === undefined) return 'undefined'
                  if (value instanceof Error) return value.stack || value.message || 'Error'
                  if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']'
                  if (typeof value === 'symbol') return value.toString()
                  if (typeof value === 'object') return JSON.stringify(value)
                  return String(value)
                } catch {
                  try {
                    return String(value)
                  } catch {
                    return '[Unserializable]'
                  }
                }
              }

              const selectors = [
                'button',
                'a[href]',
                '[role="button"]',
                '[data-lemnity-interactive]',
                'input:not([type="hidden"])',
                'select',
                'textarea',
                '[tabindex]:not([tabindex="-1"])'
              ].join(',')

              const getScopeRoot = () => document.getElementById('lemnity-theme-root') || document

              const post = (rect, lock = false) => {
                postMessage({ type: 'interactive-region', rect, lock })
              }

              const toRect = el => {
                if (!el) return null
                const r = el.getBoundingClientRect()
                if (!r || (r.width === 0 && r.height === 0)) return null
                return { left: r.left, top: r.top, width: r.width, height: r.height }
              }

              const fallbackRect = () => {
                const size = 240
                return {
                  left: Math.max(0, window.innerWidth - size - 16),
                  top: Math.max(0, window.innerHeight - size - 16),
                  width: size,
                  height: size
                }
              }

              const mergeRects = rects => {
                const list = rects.filter(Boolean)
                if (!list.length) return null
                const left = Math.min(...list.map(r => r.left))
                const top = Math.min(...list.map(r => r.top))
                const right = Math.max(...list.map(r => r.left + r.width))
                const bottom = Math.max(...list.map(r => r.top + r.height))
                return { left, top, width: right - left, height: bottom - top }
              }

              const hasModal = () => {
                const modalSelector = '[aria-modal="true"],dialog[open],[role="dialog"],[data-lemnity-modal],.ReactModal__Content'
                const root = getScopeRoot()
                const el = root.querySelector(modalSelector)
                if (!el) return false
                const style = window.getComputedStyle(el)
                if (style.display === 'none') return false
                if (style.visibility === 'hidden') return false
                if (style.pointerEvents === 'none') return false
                if (el.getAttribute('aria-hidden') === 'true') return false
                const r = el.getBoundingClientRect()
                if (!r || (r.width === 0 && r.height === 0)) return false
                return true
              }

              let scheduled = false
              const schedule = () => {
                if (scheduled) return
                scheduled = true

                requestAnimationFrame(() => {
                  scheduled = false
                  const lock = hasModal()
                  const scope = getScopeRoot()
                  const merged = mergeRects(Array.from(scope.querySelectorAll(selectors)).map(toRect))

                  const rect = lock
                    ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
                    : merged ?? fallbackRect()

                  post(rect, lock)
                })
              }

              const mo = new MutationObserver(() => {
                const notification = document.querySelector('[data-lemnity-notification]')
                const isNotification = !!notification

                const announcement = document.querySelector('[data-lemnity-announcement]')
                const isAnnouncement = !!announcement
              
                if (!isNotification && !isAnnouncement) {
                  schedule()
                  return
                }
              })
              mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'open', 'aria-hidden', 'aria-modal'] })

              const handleIframeResize = () => {
                const announcement = document.querySelector('[data-lemnity-announcement]')
                const isAnnouncement = !!announcement

                if (!isAnnouncement) {
                  schedule()
                  return
                }

                const boundingRect = announcement
                  ?.firstElementChild
                  ?.getBoundingClientRect()

                post({
                  left: window.innerWidth - boundingRect.width - 3,
                  top: window.innerHeight - boundingRect.height - 3,
                  width: boundingRect.width,
                  height: boundingRect.height,
                }, false)
              }

              const ro = new ResizeObserver(handleIframeResize)
              ro.observe(document.documentElement)

              window.addEventListener('resize', handleIframeResize)
              window.addEventListener('scroll', schedule, true)
              if (isIOS) {
                document.addEventListener(
                  'focusin',
                  e => {
                    const t = e.target
                    if (!(t instanceof HTMLElement)) return
                    if (
                      !t.matches(
                        'input:not([type="hidden"]),textarea,select,[contenteditable="true"]'
                      )
                    )
                      return
                    const scale = window.visualViewport?.scale ?? 1
                    if (Math.abs(scale - 1) >= 0.01) return
                    setTimeout(() => {
                      try {
                        t.scrollIntoView({ block: 'center', inline: 'nearest' })
                      } catch {
                      }
                    }, 60)
                  },
                  true
                )
              }
              if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', handleIframeResize)
                window.visualViewport.addEventListener('scroll', schedule)
              }

              schedule()
            })();
          </script>
        </body>
        </html>`

      container.appendChild(iframe)

      // Wait for iframe to load
      await new Promise<void>(resolve => {
        iframe.onload = () => resolve()
      })

      const iframeDoc = iframe.contentDocument
      if (!iframeDoc) throw new Error('Iframe document is not accessible')

      window.addEventListener('message', this.handleMessage)
      window.addEventListener('resize', this.handleResize, { passive: true })
      this.container = container
      this.iframe = iframe
      this.pointerLock = false
      this.interactiveRect = null
      this.lastClipPath = null
      this.syncFrameSize()
      this.syncFrameInteractivity(true)

      if (!this.hasVisualViewportListeners && window.visualViewport) {
        this.hasVisualViewportListeners = true
        window.visualViewport.addEventListener('resize', this.handleResize, { passive: true })
        window.visualViewport.addEventListener('scroll', this.handleResize, { passive: true })
      }


      const target = iframeDoc.body

      const styleTag = ensureElement(iframeDoc.head, 'style[data-lemnity-embed]', (doc: Document) => {
        const el = doc.createElement('style')
        el.setAttribute('data-lemnity-embed', 'true')
        el.textContent = styles
        return el
      })
      void styleTag

      const themeRoot = ensureElement(target, '#lemnity-theme-root', (doc: Document) => {
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

      const root = createRoot(mountNode)
      root.render(
        <StrictMode>
          <UNSAFE_PortalProvider getContainer={() => modalPortalRoot}>
            <ModalPortalProvider value={modalPortalRoot}>
              <HeroUIProvider>
                <QueryClientProvider client={this.queryClient}>
                  <EmbedRuntime widgetType={widgetType} />
                </QueryClientProvider>
              </HeroUIProvider>
            </ModalPortalProvider>
          </UNSAFE_PortalProvider>
        </StrictMode>
      )

      this.root = root
      this.widgetId = widgetId
    } catch (error) {
      console.error('Error initializing embed manager', error)
    }
  }

  async destroy(widgetId?: string) {
    if (widgetId && this.widgetId && widgetId !== this.widgetId) return
    cancelAnimationFrame(this.resizeRaf)
    if (this.root) {
      this.root.unmount()
    }
    if (this.container) {
      if (this.container.parentElement) {
        this.container.parentElement.removeChild(this.container)
      }
    }
    window.removeEventListener('message', this.handleMessage)
    window.removeEventListener('resize', this.handleResize)
    if (this.hasVisualViewportListeners && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleResize)
      window.visualViewport.removeEventListener('scroll', this.handleResize)
    }
    useWidgetSettingsStore.getState().reset()
    this.root = null
    this.container = null
    this.widgetId = null
    this.iframe = null
    this.interactiveRect = null
    this.pointerLock = false
    this.lastClipPath = null
    this.hasVisualViewportListeners = false
  }

  postMessage(message: unknown) {
    if (!this.iframe?.contentWindow) return
    this.iframe.contentWindow.postMessage(
      {
        scope: 'lemnity-embed',
        ...((message && typeof message === 'object') ? message : { payload: message })
      },
      '*'
    )
  }
}

export default EmbedManager
