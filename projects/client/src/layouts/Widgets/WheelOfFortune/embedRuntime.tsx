import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useWidgetActions } from '../useWidgetActions'
import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import useWidgetSettingsStore, {
  type ButtonPosition,
  useWidgetStaticDefaults
} from '@/stores/widgetSettingsStore'
import type { DisplaySettings } from '@/stores/widgetSettings/types'
import { withDefaultsPath } from '@/stores/widgetSettings/utils'
import { useShallow } from 'zustand/react/shallow'
import { wheelActionHandlers } from './actionHandlers'
import Modal from '@/components/Modal/Modal'
import DesktopPreview from '@/layouts/Widgets/Common/DesktopPreview/DesktopPreview'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { sendEvent } from '@/common/api/publicApi'
import type { WidgetLeadFormValues } from '@/layouts/Widgets/registry'
import WheelMobileScreen from './WheelMobileScreen'
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport'

const WHEEL_SPIN_RESULT_KEY_PREFIX = 'lemnity.wheel_of_fortune.spin_result.'

const getSpinResultStorageKey = (widgetId: string) => `${WHEEL_SPIN_RESULT_KEY_PREFIX}${widgetId}`

const useVisualViewportOverlayStyle = (enabled: boolean): CSSProperties => {
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    if (!enabled) return

    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport
        const width = Math.ceil(vv?.width ?? window.innerWidth)
        const height = Math.ceil(vv?.height ?? window.innerHeight)
        setStyle(prev => {
          const prevWidth = typeof prev.width === 'number' ? prev.width : NaN
          const prevHeight = typeof prev.height === 'number' ? prev.height : NaN
          const prevTransform = typeof prev.transform === 'string' ? prev.transform : ''
          if (prevWidth === width && prevHeight === height && prevTransform === '') return prev
          return {
            position: 'fixed',
            left: 0,
            top: 0,
            width,
            height
          }
        })
      })
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    const vv = window.visualViewport
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
    }
  }, [enabled])

  return enabled ? style : {}
}

type WheelModalContentProps = {
  initialScreen?: 'main' | 'prize'
  onSubmit?: () => void
  onRequestClose?: () => void
}

export const WheelModalContent = ({
  initialScreen = 'main',
  onSubmit,
  onRequestClose
}: WheelModalContentProps) => {
  const [screen, setScreen] = useState<'main' | 'prize'>(initialScreen)
  const { run } = useWidgetActions()
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile = useIsMobileViewport()

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current)
      spinTimerRef.current = null
    }
  }, [])

  const handleSubmit = useCallback(
    (values: WidgetLeadFormValues) => {
      const runtime = usePreviewRuntimeStore.getState()
      const status = runtime.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined

      if (status === 'spinning' || status === 'locked') return

      const emit = usePreviewRuntimeStore.getState().emit
      const setTimer = (ms: number, cb: () => void) => {
        clearSpinTimer()
        spinTimerRef.current = setTimeout(() => {
          cb()
          spinTimerRef.current = null
        }, ms)
      }

      const ctx = {
        payload: {
          screen,
          lead: values,
          url: window.location.href,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent
        },
        helpers: {
          emit,
          setScreen: (s: string) => setScreen(s === 'prize' ? 'prize' : 'main'),
          setTimer,
          clearTimer: clearSpinTimer
        }
      }

      const handled = run('spin', ctx, undefined, handlerId => wheelActionHandlers[handlerId ?? ''])
      if (!handled) wheelActionHandlers['wheel.spin']?.(ctx)
      onSubmit?.()
    },
    [clearSpinTimer, onSubmit, run, screen]
  )

  useEffect(() => () => clearSpinTimer(), [clearSpinTimer])

  const definition = getWidgetDefinition(WidgetTypeEnum.WHEEL_OF_FORTUNE)

  return (
    <div className="relative w-full h-full">
      {isMobile ? (
        <WheelMobileScreen
          variant="embed"
          screen={screen}
          onScreenChange={setScreen}
          onSubmit={handleSubmit}
          onClose={onRequestClose}
        />
      ) : (
        <DesktopPreview
          screen={screen}
          hideCloseButton
          onSubmit={handleSubmit}
          screens={definition?.preview?.desktopScreens}
        />
      )}
    </div>
  )
}

export const WheelEmbedRuntime = () => {
  const [open, setOpen] = useState(false)
  const [initialScreen, setInitialScreen] = useState<'main' | 'prize'>('main')
  const isMobile = useIsMobileViewport()
  const staticDefaults = useWidgetStaticDefaults()
  const widgetId = useWidgetSettingsStore(s => s.settings?.id)
  const projectId = useWidgetSettingsStore(s => s.projectId)
  const staticIcon = staticDefaults?.display?.icon
  const defaultIcon: NonNullable<DisplaySettings['icon']> = {
    type: staticIcon?.type ?? 'button',
    position: 'bottom-right',
    hide: staticIcon?.hide ?? 'always',
    image: staticIcon?.image ?? { fileName: '', url: '' },
    button: staticIcon?.button ?? {
      text: 'Испытай удачу',
      buttonColor: '#5951E5',
      textColor: '#FFFFFF'
    }
  }
  const iconConfig = useWidgetSettingsStore(
    useShallow(s => withDefaultsPath(s.settings?.display, 'icon', defaultIcon))
  )
  const buttonPosition = (iconConfig.position as ButtonPosition | undefined) ?? 'bottom-right'
  const buttonConfig = iconConfig.button ?? defaultIcon.button
  const iconType = iconConfig.type ?? defaultIcon.type
  const imageUrl = iconConfig.image?.url

  const postInteractivityLock = useCallback((lock: boolean) => {
    window.parent?.postMessage(
      {
        scope: 'lemnity-embed',
        type: 'interactive-region',
        lock,
        ...(lock
          ? { rect: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } }
          : {})
      },
      '*'
    )
  }, [])

  const handleOpen = useCallback(() => {
    postInteractivityLock(true)
    if (widgetId) {
      const runtime = usePreviewRuntimeStore.getState()
      const eventMode =
        (useWidgetSettingsStore.getState().settings?.widget as { eventMode?: boolean } | undefined)
          ?.eventMode === true

      if (eventMode) {
        // Kiosk mode always starts fresh — no restoring a previous participant's locked result.
        setInitialScreen('main')
        runtime.setValue('wheel.status', 'idle')
        runtime.setValue('wheel.winningSectorId', undefined)
        runtime.setValue('wheel.result', undefined)
      } else {
        try {
          const raw = window.sessionStorage?.getItem(getSpinResultStorageKey(widgetId))
          const parsed = raw ? (JSON.parse(raw) as unknown) : null
          const hasSectorId =
            typeof (parsed as { sectorId?: unknown } | null)?.sectorId === 'string' &&
            Boolean((parsed as { sectorId?: unknown } | null)?.sectorId)
          const isWin = Boolean((parsed as { isWin?: unknown } | null)?.isWin)

          if (parsed && hasSectorId) {
            const sectorId = (parsed as { sectorId: string }).sectorId
            setInitialScreen(isWin ? 'prize' : 'main')
            runtime.setValue('wheel.status', isWin ? 'locked' : 'idle')
            runtime.setValue('wheel.winningSectorId', sectorId)
            runtime.setValue('wheel.result', parsed)
          } else {
            setInitialScreen('main')
            runtime.setValue('wheel.status', 'idle')
            runtime.setValue('wheel.winningSectorId', undefined)
            runtime.setValue('wheel.result', undefined)
          }
        } catch {
          setInitialScreen('main')
          runtime.setValue('wheel.status', 'idle')
          runtime.setValue('wheel.winningSectorId', undefined)
          runtime.setValue('wheel.result', undefined)
        }
      }
    }

    setOpen(true)
    if (widgetId)
      void sendEvent({
        event_name: 'wheel.open',
        widget_id: widgetId,
        project_id: projectId ?? undefined
      })
  }, [postInteractivityLock, projectId, widgetId])

  const handleClose = useCallback(() => {
    postInteractivityLock(false)
    setOpen(false)
    if (widgetId) {
      const runtime = usePreviewRuntimeStore.getState()
      runtime.setValue('wheel.status', 'idle')
      runtime.setValue('wheel.winningSectorId', undefined)
      runtime.setValue('wheel.result', undefined)
    }
    if (widgetId)
      void sendEvent({
        event_name: 'wheel.close',
        widget_id: widgetId,
        project_id: projectId ?? undefined
      })
  }, [postInteractivityLock, projectId, widgetId])

  useEffect(() => {
    if (!open || !isMobile) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose, isMobile, open])

  useEffect(() => {
    if (!isMobile) return
    postInteractivityLock(open)
  }, [isMobile, open, postInteractivityLock])

  const anchorStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 2147483641
  }
  switch (buttonPosition) {
    case 'bottom-left':
      anchorStyle.bottom = '24px'
      anchorStyle.left = '24px'
      break
    case 'top-right':
      anchorStyle.top = '24px'
      anchorStyle.right = '24px'
      break
    case 'bottom-right':
    default:
      anchorStyle.bottom = '24px'
      anchorStyle.right = '24px'
      break
  }

  const Trigger =
    iconType === 'image' && imageUrl ? (
      <button
        type="button"
        onClick={handleOpen}
        className="block rounded-full transform transition-transform duration-200 ease-out hover:scale-[1.05]"
      >
        <img
          src={imageUrl}
          alt={buttonConfig?.text?.trim() || 'Lemnity'}
          className="h-16 w-16 block"
        />
      </button>
    ) : (
      <button
        type="button"
        className="rounded-full px-5 py-3 shadow-lg transform transition duration-200 ease-out hover:scale-[1.05] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{
          backgroundColor: buttonConfig?.buttonColor,
          color: buttonConfig?.textColor
        }}
        onClick={handleOpen}
      >
        {buttonConfig?.text?.trim() || 'Испытай удачу'}
      </button>
    )

  const overlayStyle = useVisualViewportOverlayStyle(Boolean(open && isMobile))

  return (
    <>
      <div style={anchorStyle}>{Trigger}</div>
      {isMobile ? (
        open ? (
          <div
            data-lemnity-modal
            role="dialog"
            aria-modal="true"
            style={{
              ...overlayStyle,
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y'
            }}
            className="fixed left-0 top-0 w-full h-full z-[2147483646] overflow-hidden bg-[#F5F6F8] flex flex-col"
          >
            <div className="flex-1 min-h-0">
              <WheelModalContent initialScreen={initialScreen} onRequestClose={handleClose} />
            </div>
          </div>
        ) : null
      ) : (
        <Modal isOpen={open} onClose={handleClose} containerClassName="max-w-[928px]">
          <WheelModalContent initialScreen={initialScreen} />
        </Modal>
      )}
    </>
  )
}
