/**
 * Round-robin выбор менеджера (чистый). Ключ ротации — счётчик заявок проекта; равномерно
 * распределяет звонки между активными менеджерами. См. plan-wid-call.md, вкладка «Звонки».
 */
export function pickManager<T>(managers: T[], key: number): T | null {
  if (managers.length === 0) return null
  const i = ((Math.floor(key) % managers.length) + managers.length) % managers.length
  return managers[i]
}
