import type { ReactElement } from 'react'
import { useMemo, useState, useCallback } from 'react'
import { Button } from '@heroui/button'
import CustomSwitch from '@/components/CustomSwitch'
import SvgIcon from '@/components/SvgIcon'
import iconAdd from '@/assets/icons/add.svg'
import iconPencil from '@/assets/icons/pencil.svg'
import iconLock from '@/assets/icons/key.svg'
import './WidgetCard.css'
import { WidgetTypes } from '../Widgets/constants'
import { getWidgetVisual } from './widgetVisuals'
import { cn } from '@heroui/theme'
export type WidgetType = (typeof WidgetTypes)[keyof typeof WidgetTypes]
export type WidgetBadge = 'new' | 'popular' | 'soon' | null
import type { WidgetTypeEnum } from '@lemnity/api-sdk'

// Общий ЛК lemnity.ru: оплата/продление подписки виджета. См. plans/plan-wid.md.
const LK_URL = (import.meta.env.VITE_LK_URL || 'https://lemnity.ru').replace(/\/+$/, '')

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Русское склонение: [одна, две-четыре, пять+] — 1 день, 3 дня, 5 дней.
const plural = (n: number, forms: [string, string, string]): string => {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

// Остаток ровно в днях со склонением: «1 день» / «3 дня» / «90 дней».
const formatDays = (days: number): string => `${days} ${plural(days, ['день', 'дня', 'дней'])}`

interface WidgetProps {
  title?: string
  subtitle?: string
  type: WidgetTypeEnum
  badge?: WidgetBadge
  enabled: boolean
  isAvailable?: boolean
  isCreated?: boolean
  widgetId?: string
  /** ISO/Date: активен пока > now. null/undefined — без срока (grandfather, создан до тарификации) → активен. */
  paidUntil?: string | Date | null
  onToggle?: (value: boolean) => void
  onCreate?: () => void
  onEdit?: (widgetId: string) => void
}

const Widget = ({
  title,
  subtitle,
  type,
  badge,
  enabled,
  isAvailable = true,
  isCreated = false,
  widgetId,
  paidUntil,
  onToggle,
  onCreate,
  onEdit
}: WidgetProps): ReactElement => {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled)

  const visual = getWidgetVisual(type)

  const handleToggle = useCallback(
    (value: boolean) => {
      setIsEnabled(value)
      onToggle?.(value)
    },
    [onToggle]
  )

  // Статус подписки определяется ТОЛЬКО оплатой (paidUntil), тумблер enabled на него не влияет:
  // выключенный, но оплаченный виджет сохраняет остаток дней и доступен к редактированию.
  // tone — цвет чипа, chip — текст остатка, active — активен ли (влияет на дизейбл «Редактировать»),
  // cta — нужна ли кнопка оплаты ('activate' просрочен / 'renew' скоро истекает).
  const status = useMemo(() => {
    if (!isCreated) return null
    // grandfather: без срока, но активен (бэкенд рендерит виджеты с paidUntil = null).
    if (paidUntil == null) {
      return { active: true, tone: 'active' as const, chip: 'Активен', cta: null as null | 'renew' }
    }
    const until = new Date(paidUntil).getTime()
    if (!Number.isFinite(until)) {
      return { active: true, tone: 'active' as const, chip: 'Активен', cta: null as null | 'renew' }
    }
    const daysLeft = until > Date.now() ? Math.ceil((until - Date.now()) / MS_PER_DAY) : 0
    if (daysLeft <= 0) {
      return { active: false, tone: 'off' as const, chip: '0 дней', cta: 'activate' as const }
    }
    if (daysLeft <= 5) {
      return { active: true, tone: 'warn' as const, chip: formatDays(daysLeft), cta: 'renew' as const }
    }
    return { active: true, tone: 'active' as const, chip: formatDays(daysLeft), cta: null as null | 'renew' }
  }, [isCreated, paidUntil])

  const daysToneClass = status
    ? {
        active: 'bg-[#e9f3ec] text-[#1f7a48]',
        warn: 'bg-[#f7efdd] text-[#9a6b00]',
        off: 'bg-[#efedea] text-[#8a8784]'
      }[status.tone]
    : ''
  const daysDotClass = status
    ? {
        active: 'bg-[#1f7a48]',
        warn: 'bg-[#c89a2b]',
        off: 'bg-[#bdbab6]'
      }[status.tone]
    : ''

  const checkoutUrl =
    isCreated && widgetId
      ? `${LK_URL}/api/widgets/checkout?widgetId=${encodeURIComponent(
          widgetId
        )}&type=${encodeURIComponent(type)}`
      : null

  const badgeView = useMemo(() => {
    if (!badge) return null
    const map: Record<Exclude<WidgetBadge, null>, { label: string; className: string }> = {
      new: { label: 'Новинка', className: 'badge badge-new' },
      popular: { label: 'Популярно', className: 'badge badge-popular' },
      soon: { label: 'Скоро', className: 'badge badge-soon' }
    }
    const { label, className } = map[badge]
    return <span className={className}>{label}</span>
  }, [badge])

  const iconTile = (muted: boolean): ReactElement => (
    <div
      className="widget-icon"
      data-muted={muted ? 'true' : undefined}
      style={muted ? undefined : { color: visual.accent, backgroundColor: `${visual.accent}1f` }}
    >
      {visual.icon}
    </div>
  )

  // «Скоро» / недоступные виджеты — отдельное приглушённое состояние с замком, без действий.
  if (!isAvailable) {
    return (
      <div className="widget-card widget-card--locked select-none">
        <div className="flex items-center justify-between gap-2">
          {iconTile(true)}
          {badgeView}
        </div>
        <div className="mt-[15px] flex-1">
          <div className="widget-title text-[#8a8784]">{title}</div>
          <div className="widget-desc">{subtitle}</div>
        </div>
        <div className="widget-lock">
          <SvgIcon src={iconLock} size={'15px'} />
          <span>Появится в ближайшем обновлении</span>
        </div>
      </div>
    )
  }

  const openCheckout = (): void => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
  }

  // Кнопки — Tailwind arbitrary-классы перекрывают дефолтный фон HeroUI (как в исходном коде).
  const btnBase = 'flex-1 min-w-0 h-10 rounded-[10px] font-semibold text-[13.5px]'
  const btnPrimary = cn(btnBase, 'bg-[#1A52DB] text-white data-[hover=true]:!bg-[#1647c0]')
  const btnPay = cn(
    btnBase,
    'bg-white text-[#1A52DB] border border-[#c9d6f4] data-[hover=true]:!bg-[#EEF3FF]'
  )

  // Ряд действий. Оплата живёт во 2-м слоте: «Продлить» когда срок истекает; когда истёк —
  // редактирование недоступно, поэтому «Активировать» занимает всю ширину.
  const renderActions = (): ReactElement => {
    if (!isCreated) {
      return (
        <Button
          size="sm"
          className={btnPrimary}
          onPress={onCreate}
          startContent={<SvgIcon src={iconAdd} size={'15px'} />}
        >
          Создать
        </Button>
      )
    }

    const editButton = (
      <Button
        size="sm"
        className={btnPrimary}
        isDisabled={!widgetId || status?.active === false}
        onPress={widgetId ? () => onEdit?.(widgetId) : undefined}
        startContent={<SvgIcon src={iconPencil} size={'15px'} />}
      >
        Редактировать
      </Button>
    )

    if (status?.cta === 'activate') {
      return (
        <Button size="sm" className={btnPrimary} isDisabled={!checkoutUrl} onPress={openCheckout}>
          Активировать
        </Button>
      )
    }

    if (status?.cta === 'renew') {
      return (
        <>
          {editButton}
          <Button
            size="sm"
            variant="bordered"
            className={btnPay}
            isDisabled={!checkoutUrl}
            onPress={openCheckout}
          >
            Продлить
          </Button>
        </>
      )
    }

    return editButton
  }

  return (
    <div className="widget-card">
      <div className="flex items-center justify-between gap-2">
        {iconTile(false)}
        <div className="flex items-center gap-2">
          {badgeView}
          {status ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11.5px] font-semibold leading-none whitespace-nowrap',
                daysToneClass
              )}
            >
              <span className={cn('w-[7px] h-[7px] rounded-full', daysDotClass)} />
              {status.chip}
            </span>
          ) : null}
          <CustomSwitch
            size="sm"
            selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
            isSelected={isEnabled}
            onValueChange={handleToggle}
          />
        </div>
      </div>

      <div className="mt-[15px] flex-1">
        <div className="widget-title">{title}</div>
        <div className="widget-desc">{subtitle}</div>
      </div>

      <div className="widget-actions">{renderActions()}</div>
    </div>
  )
}

export default Widget
