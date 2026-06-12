import type { ReactElement } from 'react'
import { cn } from '@heroui/theme'
import { WIDGET_CATEGORIES, type WidgetCategory } from '../Widgets/constants'
import './WidgetCategoryFilter.css'

export type WidgetCategoryFilterValue = WidgetCategory | 'all'

interface WidgetCategoryFilterProps {
  value: WidgetCategoryFilterValue
  /** Кол-во виджетов по направлению (id → count); 'all' — общее число. */
  counts: Record<WidgetCategoryFilterValue, number>
  onChange: (value: WidgetCategoryFilterValue) => void
}

const SEGMENTS: { id: WidgetCategoryFilterValue; label: string }[] = [
  { id: 'all', label: 'Все' },
  ...WIDGET_CATEGORIES
]

// Сегментированный фильтр каталога по направлениям (Все / Лиды / Вовлечение / Вознаграждение).
const WidgetCategoryFilter = ({
  value,
  counts,
  onChange
}: WidgetCategoryFilterProps): ReactElement => (
  <div className="widget-filter" role="tablist" aria-label="Направления">
    {SEGMENTS.map(seg => {
      const active = seg.id === value
      return (
        <button
          key={seg.id}
          type="button"
          role="tab"
          aria-selected={active}
          className={cn('widget-filter__seg', active && 'widget-filter__seg--active')}
          onClick={() => onChange(seg.id)}
        >
          {seg.label}
          <span className="widget-filter__count">{counts[seg.id] ?? 0}</span>
        </button>
      )
    })}
  </div>
)

export default WidgetCategoryFilter
