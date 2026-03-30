type SettingsSurface = 'fields' | 'display' | 'integration'
type Props = {
  surface: SettingsSurface
  message?: string
}

const SURFACE_LABELS: Record<SettingsSurface, string> = {
  fields: 'Настройки полей',
  display: 'Настройки отображения',
  integration: 'Настройки интеграции'
}

const SurfaceNotice = ({ surface, message }: Props) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
    <p>Настройки {SURFACE_LABELS[surface]} управляются самим виджетом.</p>
    <p className="mt-1">{message ?? 'Измените конфигурацию в кастомных секциях.'}</p>
  </div>
)

export default SurfaceNotice
