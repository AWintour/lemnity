import { useCallback, useEffect, useRef, useState } from 'react'
import { useWidgetActions } from '../useWidgetActions'
import ConveyorReel from './ConveyorReel'
import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
import CloseButton from '../Common/CloseButton/CloseButton'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'

import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import RewardContent from '../Common/RewardContent/RewardContent'
import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
import { wheelActionHandlers } from '@/layouts/Widgets/WheelOfFortune/actionHandlers'
import type { WidgetLeadFormValues } from '@/layouts/Widgets/registry'
import type { PublicWheelSpinResponse } from '@/common/api/publicApi'

type ConveyorMobileScreenProps = {
  variant?: 'preview' | 'embed'
  screen?: 'main' | 'prize'
  onScreenChange?: (next: 'main' | 'prize') => void
  onSubmit?: (values: WidgetLeadFormValues) => void
  onClose?: () => void
}

// Клон мобильного экрана колеса с барабаном вместо круга. Спин/обработчики — общие (wheel.*).
const ConveyorMobileScreen = ({
  variant = 'preview',
  screen: controlledScreen,
  onScreenChange,
  onSubmit,
  onClose
}: ConveyorMobileScreenProps) => {
  const spinTrigger = usePreviewRuntimeStore(s => s.counters['wheel.spin'] ?? 0)
  const template = useWidgetSettingsStore(s => s?.settings?.fields?.template)
  const { colorScheme, customColor } = template?.templateSettings || {}
  const { settings } = useWheelOfFortuneSettings()
  const { settings: fieldsSettings } = useFieldsSettings()
  const companyLogo = useWidgetSettingsStore(s => s?.settings?.fields?.companyLogo)
  const winningSectorId = usePreviewRuntimeStore(
    s => (s.values['wheel.winningSectorId'] as string | null | undefined) ?? undefined
  )
  const wheelResult = usePreviewRuntimeStore(
    s => s.values['wheel.result'] as PublicWheelSpinResponse | undefined
  )
  const spinStatus = usePreviewRuntimeStore(
    s => s.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
  )
  const { run } = useWidgetActions()
  const [uncontrolledScreen, setUncontrolledScreen] = useState<'main' | 'prize'>('main')
  const screen = controlledScreen ?? uncontrolledScreen
  const setScreen = useCallback(
    (next: 'main' | 'prize') => {
      if (controlledScreen) onScreenChange?.(next)
      else setUncontrolledScreen(next)
    },
    [controlledScreen, onScreenChange]
  )
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSpinTimer = useCallback(() => {
    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current)
      spinTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearSpinTimer(), [clearSpinTimer])

  const handleClose = useCallback(() => {
    clearSpinTimer()
    if (onClose) {
      onClose()
      return
    }
    setScreen('main')
    const runtime = usePreviewRuntimeStore.getState()
    runtime.setValue('wheel.status', 'idle')
    runtime.setValue('wheel.winningSectorId', undefined)
    runtime.setValue('wheel.result', undefined)
  }, [clearSpinTimer, onClose, setScreen])

  const handleSubmit = useCallback(
    (values: WidgetLeadFormValues) => {
      const runtime = usePreviewRuntimeStore.getState()
      const status = runtime.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined

      if (status === 'spinning' || status === 'locked') return

      const emit = runtime.emit
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
    },
    [clearSpinTimer, run, screen, setScreen]
  )

  if (!settings) return null

  const sectors = settings.sectors
  const submitDisabled = spinStatus === 'spinning' || spinStatus === 'locked'

  const bgStyle = { backgroundColor: colorScheme === 'primary' ? '#725DFF' : customColor }

  const reel = (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full px-2 pt-4">
        <ConveyorReel
          orientation="horizontal"
          sectors={sectors.items}
          sectorsRandomize={sectors.randomize}
          winningSectorId={winningSectorId}
          spinTrigger={spinTrigger}
          borderColor={settings?.borderColor}
          borderThickness={settings?.borderThickness}
          backgroundColor={colorScheme === 'primary' ? '#725DFF' : (customColor ?? '#725DFF')}
          cardRadius={settings?.cardRadius}
        />
      </div>
      <div className="w-full px-4">
        <DynamicFieldsForm
          isMobile
          centered
          submitDisabled={submitDisabled}
          onSubmit={onSubmit ?? handleSubmit}
        />
      </div>
    </div>
  )

  if (variant === 'embed') {
    const content =
      screen === 'prize' ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <RewardContent
            companyLogo={companyLogo}
            discountText={wheelResult?.sector?.text?.trim()}
            promo={wheelResult?.sector?.promo?.trim()}
            onWin={fieldsSettings?.messages?.onWin}
          />
        </div>
      ) : (
        reel
      )

    return (
      <div className="w-full h-full bg-[#F5F6F8] flex flex-col">
        <div
          style={bgStyle}
          className="w-full flex-1 min-h-0 text-white pb-4 pt-0 relative overflow-hidden flex flex-col"
        >
          <CloseButton position="right" onClose={handleClose} />
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl bg-[#F5F6F8] border border-[#E6E6E6] p-4 overflow-y-auto">
      <div
        style={bgStyle}
        className="mx-auto w-[360px] rounded-2xl text-white pb-4 pt-0 relative overflow-hidden"
      >
        <CloseButton position="right" onClose={handleClose} />
        {screen === 'prize' ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <RewardContent
              companyLogo={companyLogo}
              discountText={wheelResult?.sector?.text?.trim()}
              promo={wheelResult?.sector?.promo?.trim()}
              onWin={fieldsSettings?.messages?.onWin}
            />
          </div>
        ) : (
          reel
        )}
      </div>
    </div>
  )
}

export default ConveyorMobileScreen
