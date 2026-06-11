import type { CallItem, CallStatus } from '@/services/calls'

// Переиспользуем хелперы фильтров/проектов из «Заявок».
export {
  buildProjectMenuModel,
  getSelectedProjectLabel,
  periodOptions,
  formatTimeAndDate
} from '../RequestsPage/requests.model'
export type { PeriodKey, ProjectMenuItem } from '../RequestsPage/requests.model'

// Время/Дата | Телефон | Менеджер | Длительность | Статус | Запись
export const CALLS_GRID_CLASS =
  'grid w-full min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.1fr)]'

export const CALL_STATUS_META: Record<CallStatus, { label: string; pill: string; row: string }> = {
  new: { label: 'Новый', pill: 'bg-[#CFEAD6] text-[#1F6B3A]', row: 'border-[#2FB26A] bg-[#F2FFF6]' },
  processed: { label: 'Звоним', pill: 'bg-[#F4CD52] text-black', row: 'border-default-200 bg-white' },
  not_processed: {
    label: 'Не дозвонились',
    pill: 'bg-[#F3D1D1] text-[#D31515]',
    row: 'border-[#FF3A3A] bg-[#FFF3F3]'
  },
  used: { label: 'Состоялся', pill: 'bg-[#CFEAD6] text-[#1F6B3A]', row: 'border-default-200 bg-white' }
}

export function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function buildCallsCsv(calls: CallItem[], projectName: (id: string) => string): string {
  const header = ['created_at', 'project', 'phone', 'manager', 'duration_sec', 'status']
  const rows = calls.map(c => [
    c.createdAt,
    projectName(c.projectId),
    c.phone ?? '',
    c.managerName ?? '',
    String(c.durationSec ?? ''),
    CALL_STATUS_META[c.status].label
  ])
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [header, ...rows].map(r => r.map(v => esc(String(v))).join(',')).join('\n')
}
