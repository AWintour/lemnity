import { UserRoleEnum } from '@lemnity/api-sdk'
import useUserStore from '@/stores/userStore'

// Allowlist админов по email (на время теста; синхронно с ProjectWidgetsPage и сервером).
export const ADMIN_EMAILS: string[] = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ??
  'simakov@lemnity.ru,lemnitycom@gmail.com'
)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

/** Текущий пользователь — администратор (роль ADMIN или email из allowlist). */
export const useIsAdmin = (): boolean => {
  const user = useUserStore(s => s.user)
  return (
    user?.role === UserRoleEnum.ADMIN ||
    (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
  )
}
