import type { ReactElement } from 'react'
import { useMemo, useState, useCallback } from 'react'
import { Button } from '@heroui/button'
import CustomSwitch from '@/components/CustomSwitch'
import SvgIcon from '@/components/SvgIcon'
import iconProjectEmblem from '@/assets/icons/project-emblem.svg'
import iconEye from '@/assets/icons/eye.svg'
import iconAdd from '@/assets/icons/add.svg'
import './WidgetCard.css'
import { WidgetTypes } from '../Widgets/constants'
import iconPencil from '@/assets/icons/pencil.svg'
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
  onPreview?: () => void
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
  onEdit,
  onPreview
}: WidgetProps): ReactElement => {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled)

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
        active: 'bg-[#e7f7ee] text-[#1f9254]',
        warn: 'bg-[#fff4e0] text-[#b9770a]',
        off: 'bg-[#f0f1f4] text-[#9aa0ad]'
      }[status.tone]
    : ''
  const daysDotClass = status
    ? {
        active: 'bg-[#28b463]',
        warn: 'bg-[#f0a30a]',
        off: 'bg-[#c2c6d0]'
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
      new: { label: 'Новинка', className: 'badge badge-new h-[24px]' },
      popular: { label: 'Популярно', className: 'badge badge-popular h-5' },
      soon: { label: 'Скоро', className: 'badge badge-soon h-5' }
    }
    const { label, className } = map[badge]
    return <span className={className}>{label}</span>
  }, [badge])

  // Заголовок приглушаем у недоступных и у неактивных (неоплаченных) созданных виджетов.
  const titleMuted = !isAvailable || (isCreated && status?.active === false)
  // «Редактировать» доступна, только если виджет активен (оплачен/grandfather).
  const editDisabled = !isAvailable || (isCreated && (!widgetId || status?.active === false))

  return (
    <div className={`widget-card ${!isAvailable ? 'widget-not-available select-none' : ''}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <SvgIcon className="text-[#1A52DB]" size={'36px'} src={iconProjectEmblem} />
        </div>
        <div className="flex items-center gap-2">
          {badgeView}
          {status ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium leading-none whitespace-nowrap z-[1]',
                daysToneClass
              )}
            >
              <span className={cn('w-[7px] h-[7px] rounded-full', daysDotClass)} />
              {status.chip}
            </span>
          ) : null}
          <div className="relative">
            <CustomSwitch
              isDisabled={!isAvailable}
              size="sm"
              selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
              isSelected={isEnabled}
              onValueChange={handleToggle}
            />
          </div>
        </div>
      </div>

      <div className="mt-1.5">
        <div className={`text-md font-semibold ${titleMuted ? 'text-gray-400' : ''}`}>{title}</div>
        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{subtitle}</div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {status?.cta && checkoutUrl ? (
          <Button
            size="sm"
            variant={status.cta === 'activate' ? 'solid' : 'bordered'}
            className={cn(
              'w-full z-[1]',
              status.cta === 'activate'
                ? 'bg-[#1A52DB] text-white'
                : 'border-[#1A52DB] text-[#1A52DB]'
            )}
            onPress={() => window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
          >
            {status.cta === 'activate' ? 'Активировать' : 'Продлить'}
          </Button>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="solid"
            className="bg-[#1A52DB] text-white px-6 [&>svg]:max-w-40 w-32 shrink-0"
            isDisabled={editDisabled}
            onPress={isCreated && widgetId ? () => onEdit?.(widgetId) : onCreate}
            startContent={
              !isCreated ? (
                <SvgIcon src={iconAdd} size={'16px'} />
              ) : (
                <SvgIcon src={iconPencil} size={'16px'} />
              )
            }
          >
            {isCreated ? 'Редактировать' : 'Создать'}
          </Button>
          <Button
            size="sm"
            variant="bordered"
            className=" w-full bg-[#F7F8FA] mx-auto"
            isDisabled={!isAvailable}
            onPress={onPreview}
            startContent={
              <div>
                <SvgIcon src={iconEye} size={'16px'} className="text-[#1A52DB]" />
              </div>
            }
          >
            Демо
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Widget
