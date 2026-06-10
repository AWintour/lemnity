import { WidgetType } from '@lemnity/database'

// Allowlist администраторов по email (на время теста). Можно переопределить
// через env ADMIN_EMAILS (через запятую). Используется до полноценной ролевой модели.
const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? 'simakov@lemnity.ru')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

// Типы виджетов, доступные только администраторам (тестовый период).
export const ADMIN_ONLY_WIDGET_TYPES: ReadonlySet<WidgetType> = new Set([
  WidgetType.VIDEO_WIDGET,
])

export const isAdminUser = (email?: string | null, role?: string | null): boolean =>
  role === 'ADMIN' || (!!email && ADMIN_EMAILS.includes(email.toLowerCase()))
