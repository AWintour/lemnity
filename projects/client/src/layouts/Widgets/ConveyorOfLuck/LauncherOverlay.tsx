import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ButtonPosition } from '@/stores/widgetSettings/types'
import type { WidgetLauncherOverlayProps } from '@/layouts/Widgets/registry'
import { LauncherButton } from './WidgetLauncherPreview'

// Позиция лаунчера на «странице» — как настроено в «Отображение» → «Положение кнопки открытия».
const LAUNCHER_POSITION_CLASS: Record<ButtonPosition, string> = {
  'bottom-left': 'left-6 bottom-6',
  'bottom-right': 'right-6 bottom-6',
  'top-right': 'top-6 right-6'
}

// Шаг 1 «Просмотра» как на реальном сайте: затемнённая страница с кнопкой открытия окна в нужном
// углу. Клик по кнопке (onOpen) открывает окно виджета; клик по фону закрывается через onClose.
const LauncherOverlay = ({ onOpen, onClose }: WidgetLauncherOverlayProps) => {
  const position =
    (useWidgetSettingsStore(s => s.settings?.display?.icon?.position) as ButtonPosition | undefined) ??
    'bottom-left'

  return (
    <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose}>
      <div
        className={`absolute ${LAUNCHER_POSITION_CLASS[position]}`}
        onClick={e => e.stopPropagation()}
      >
        <LauncherButton onOpen={onOpen} />
      </div>
    </div>
  )
}

export default LauncherOverlay
