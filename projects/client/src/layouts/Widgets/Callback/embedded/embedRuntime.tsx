/**
 * Боевой embedded-runtime виджета «Обратный звонок».
 * Монтирует свёрнутый лаунчер (кнопка → уведомление → форма) в углу экрана СОГЛАСНО положению
 * из настроек (`launcher.position`: left / center / right). Форма уже отправляет заявку через
 * `sendPublicRequest` (см. CallbackWidget.handleSubmit) на существующий `POST /api/public/requests`.
 * Интерактивная область внутри iframe определяется автоматически embedManager-ом
 * по `[data-lemnity-callback-root]` (footprint лаунчера + запас на ореол/бабл).
 */
import { useShallow } from 'zustand/react/shallow'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import CallbackLauncher from '../CallbackLauncher'
import { callbackExtraDefaults, type CallbackWidgetType } from '../defaults'

type EmbedRuntimeProps = {
  isPreview?: boolean
}

export const CallbackEmbedRuntime = (_props: EmbedRuntimeProps) => {
  const position = useWidgetSettingsStore(
    useShallow(
      s =>
        (s.settings?.widget as CallbackWidgetType)?.callback?.launcher?.position
        ?? callbackExtraDefaults.launcher.position
    )
  )
  // Кнопка стоит в углу согласно положению; для «center» центрируем по горизонтали.
  const side =
    position === 'left'
      ? 'left-6'
      : position === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'right-6'

  return (
    <div className={`fixed bottom-6 ${side} z-[2147483000]`}>
      <CallbackLauncher />
    </div>
  )
}

export default CallbackEmbedRuntime
