/**
 * Боевой embedded-runtime виджета «Обратный звонок».
 * Монтирует свёрнутый лаунчер (кнопка → уведомление → форма) в правом нижнем углу.
 * Лаунчер целиком управляется стором; форма уже отправляет заявку через `sendPublicRequest`
 * (см. CallbackWidget.handleSubmit) на существующий `POST /api/public/requests`.
 * Интерактивная область внутри iframe определяется автоматически embedManager-ом
 * по кнопкам/полям (data-lemnity-callback / generic selectors).
 */
import CallbackLauncher from '../CallbackLauncher'

type EmbedRuntimeProps = {
  isPreview?: boolean
}

export const CallbackEmbedRuntime = (_props: EmbedRuntimeProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[2147483000]">
      <CallbackLauncher />
    </div>
  )
}

export default CallbackEmbedRuntime
