import DesktopPreview from '../Common/DesktopPreview/DesktopPreview'
import ConveyorDesktopScreen from './ConveyorDesktopScreen'
import WidgetLauncherPreview from './WidgetLauncherPreview'
import MobilePreview from '../Common/MobilePreview/MobilePreview'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import { simulateWheelSpinResultFromSectors } from '@/layouts/Widgets/WheelOfFortune/actionHandlers'
import type { WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PreviewMode } from '@/stores/widgetPreviewStore'

type ConveyorOfLuckPreviewProps = {
  mode: PreviewMode
}

// Кнопка действия («Крутить ленту») в превью: симулируем результат и запускаем спин
// (разгон → плавная остановка на победителе). Те же runtime-ключи, что у колеса.
const usePreviewSpin = () =>
  useCallback(() => {
    const runtime = usePreviewRuntimeStore.getState()
    const status = runtime.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
    if (status === 'spinning') return

    const widget = useWidgetSettingsStore.getState().settings?.widget as
      | WheelOfFortuneWidgetSettings
      | undefined
    const items = widget?.sectors?.items
    const result = items?.length ? simulateWheelSpinResultFromSectors(items) : null

    if (result) {
      runtime.setValue('wheel.winningSectorId', result.sectorId)
      runtime.setValue('wheel.result', result)
      runtime.setValue('wheel.status', 'spinning')
    }
    runtime.emit('wheel.spin')
    setTimeout(() => runtime.setValue('wheel.status', 'idle'), 5200)
  }, [])

const ConveyorOfLuckPreview = ({ mode }: ConveyorOfLuckPreviewProps) => {
  const windowFormat = useWidgetSettingsStore(
    s => s.settings?.fields?.template?.templateSettings?.windowFormat
  )
  const handleSpin = usePreviewSpin()

  const ref = useRef<HTMLDivElement>(null)
  const modalWindowRef = useRef<HTMLDivElement>(null)
  const [modalWidth, setModalWidth] = useState<number | null>(null)
  // Высота масштабированного (scale) блока экранов: transform не сжимает layout-высоту,
  // поэтому её надо посчитать вручную, иначе под превью будет огромный пустой зазор.
  const [scaledHeight, setScaledHeight] = useState<number | null>(null)

  useEffect(() => {
    if (mode !== 'desktop') return
    if (ref?.current && modalWindowRef?.current) {
      const scaleFactor = ref.current.clientWidth / modalWindowRef.current.clientWidth
      ref.current.style.transform = `scale(${scaleFactor})`
      ref.current.style.transformOrigin = 'top left'
      setModalWidth(modalWindowRef.current.clientWidth)
      setScaledHeight(ref.current.scrollHeight * scaleFactor)
    }
  }, [ref, modalWindowRef, mode, windowFormat])

  if (mode === 'mobile') return <MobilePreview children={undefined} />

  if (windowFormat === 'modalWindow') {
    return (
      <div className="flex flex-col gap-6">
        {/* Обёртка схлопывает layout-высоту под визуальный (scaled) размер экранов */}
        <div style={{ height: scaledHeight ?? undefined, overflow: 'hidden' }}>
          <div ref={ref} className="flex flex-col gap-5">
            <div>
              <p className="font-rubik text-[25px] py-[15px]">Главный экран</p>
              <DesktopPreview
                ref={modalWindowRef}
                screen="main"
                onSubmit={handleSpin}
                screens={{
                  main: ConveyorDesktopScreen,
                  prize: ConveyorDesktopScreen,
                  panel: ConveyorDesktopScreen
                }}
              />
            </div>
            <hr
              className="scale-100 h-px border-0 bg-default-300 self-start "
              style={{ width: modalWidth ? `${modalWidth}px` : undefined }}
            ></hr>
            <div>
              <p className="font-rubik text-[25px] mb-5">Призовой экран</p>
              <DesktopPreview
                screen="prize"
                onSubmit={() => {}}
                ref={modalWindowRef}
                screens={{
                  main: ConveyorDesktopScreen,
                  prize: ConveyorDesktopScreen,
                  panel: ConveyorDesktopScreen
                }}
              />
            </div>
          </div>
        </div>
        {/* Кнопка открытия окна — внизу, в реальном размере (вне scale-обёртки) */}
        <WidgetLauncherPreview onOpen={handleSpin} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <DesktopPreview
        screen="panel"
        onSubmit={handleSpin}
        screens={{
          main: ConveyorDesktopScreen,
          prize: ConveyorDesktopScreen,
          panel: ConveyorDesktopScreen
        }}
      />
      <WidgetLauncherPreview onOpen={handleSpin} />
    </div>
  )
}

export default ConveyorOfLuckPreview
