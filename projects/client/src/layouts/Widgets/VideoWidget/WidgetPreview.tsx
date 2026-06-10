import { useShallow } from 'zustand/react/shallow'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { VideoWidgetType } from '@lemnity/widget-config/widgets/video-widget'
import VideoWidget from './VideoWidget'

const SCALE = 0.6
// Карточка виджета: w-99.5 (398px) × min-h-129.5 (518px) — как у «Анонса»
const CARD_W = 398
const CARD_H = 518

type ScreenProps = {
  label: string
  previewForm?: boolean
}

const PreviewScreen = ({ label, previewForm }: ScreenProps) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-[#666]">{label}</span>
    <div
      style={{ width: CARD_W * SCALE, height: CARD_H * SCALE }}
      className="overflow-hidden"
    >
      <div style={{ width: CARD_W, transformOrigin: 'top left', transform: `scale(${SCALE})` }}>
        <VideoWidget variant="announcement" focused previewForm={previewForm} />
      </div>
    </div>
  </div>
)

const WidgetPreview = () => {
  const formEnabled = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as VideoWidgetType | undefined)?.formEnabled ?? false)
  )

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 overflow-auto select-none py-2">
      <PreviewScreen label="Видео" />
      {formEnabled && <PreviewScreen label="Форма" previewForm />}
    </div>
  )
}

export default WidgetPreview
