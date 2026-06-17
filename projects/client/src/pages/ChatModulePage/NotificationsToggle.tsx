import { useState } from 'react'
import { cn } from '@heroui/theme'
import { useWebPush } from '@/common/push/useWebPush'

// Колокольчик web-push уведомлений оператора (рядом со статусом «В работе»).
// Включены — синий; выключены/заблокированы — зачёркнутый серый. На неподдерживаемых браузерах скрыт.
const BellIcon = ({ crossed }: { crossed?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    {crossed && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
)

const BellButton = ({
  on,
  disabled,
  label,
  onClick,
}: {
  on: boolean
  disabled?: boolean
  label: string
  onClick: () => void
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center w-9 h-9 rounded-[8px] transition-colors disabled:opacity-50',
      on ? 'text-primary hover:bg-primary/10' : 'text-default-400 hover:bg-default-100',
    )}
  >
    <BellIcon crossed={!on} />
  </button>
)

// Превью (без сети): чисто визуальный тумблер, чтобы видеть оба состояния колокольчика.
const PreviewBell = () => {
  const [on, setOn] = useState(false)
  return (
    <BellButton
      on={on}
      label={on ? 'Уведомления включены (превью)' : 'Включить уведомления (превью)'}
      onClick={() => setOn(v => !v)}
    />
  )
}

// Реальный кабинет: настоящая подписка на web-push через сервер.
const RealBell = ({ projectId }: { projectId?: string | null }) => {
  const { status, enable, disable } = useWebPush(projectId)
  if (status === 'unsupported') return null
  const on = status === 'on'
  const denied = status === 'denied'
  const loading = status === 'loading'
  const label = denied
    ? 'Уведомления заблокированы в браузере'
    : on
      ? 'Уведомления включены — отключить'
      : 'Включить уведомления о новых сообщениях'
  return (
    <BellButton
      on={on}
      disabled={denied || loading || !projectId}
      label={label}
      onClick={() => (on ? void disable() : void enable())}
    />
  )
}

const NotificationsToggle = ({
  projectId,
  preview,
}: {
  projectId?: string | null
  preview?: boolean
}) => (preview ? <PreviewBell /> : <RealBell projectId={projectId} />)

export default NotificationsToggle
