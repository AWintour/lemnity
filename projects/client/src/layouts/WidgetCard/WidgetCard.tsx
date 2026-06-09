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

interface WidgetProps {
  title?: string
  subtitle?: string
  type: WidgetTypeEnum
  badge?: WidgetBadge
  enabled: boolean
  isAvailable?: boolean
  isCreated?: boolean
  widgetId?: string
  /** ISO/Date: активен пока > now. null/undefined — без оплаты (grandfather) или неизвестно. */
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

  // Статус подписки + ссылка на оплату в ЛК. paidUntil null/undefined (grandfather/неизвестно)
  // — ничего не показываем. Просрочен → «Активировать», скоро истекает → «Продлить».
  const subscription = useMemo(() => {
    if (!isCreated || !widgetId || paidUntil == null) return null
    const until = new Date(paidUntil).getTime()
    if (!Number.isFinite(until)) return null
    const now = Date.now()
    const daysLeft = Math.ceil((until - now) / 86_400_000)
    const url = `${LK_URL}/api/widgets/checkout?widgetId=${encodeURIComponent(
      widgetId
    )}&type=${encodeURIComponent(type)}`
    if (until <= now) {
      return { tone: 'off' as const, label: 'Не активен', cta: 'Активировать', url }
    }
    if (daysLeft <= 5) {
      return { tone: 'warn' as const, label: `Осталось ${daysLeft} дн.`, cta: 'Продлить', url }
    }
    return {
      tone: 'ok' as const,
      label: `Активен до ${new Date(until).toLocaleDateString('ru-RU')}`,
      cta: 'Продлить',
      url
    }
  }, [isCreated, widgetId, paidUntil, type])

  const handleToggle = useCallback(
    (value: boolean) => {
      setIsEnabled(value)
      onToggle?.(value)
    },
    [onToggle]
  )

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

  return (
    <div className={`widget-card ${!isAvailable ? 'widget-not-available select-none' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <SvgIcon className="text-[#9747FF]" size={'36px'} src={iconProjectEmblem} />
        </div>
        <div className="flex items-center gap-2">
          {badgeView}
          <div className="relative">
            <CustomSwitch
              isDisabled={!isAvailable}
              size="sm"
              selectedColor="group-data-[selected=true]:!bg-[#5951E5]"
              isSelected={isEnabled}
              onValueChange={handleToggle}
            />
          </div>
        </div>
      </div>

      <div className="mt-1.5">
        <div className={`text-md font-semibold ${!isAvailable ? 'text-gray-400' : ''}`}>
          {title}
        </div>
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      </div>

      {subscription ? (
        <div className="flex items-center justify-between gap-2 mt-2">
          <span
            className={cn(
              'text-xs font-medium',
              subscription.tone === 'ok'
                ? 'text-green-600'
                : subscription.tone === 'warn'
                  ? 'text-amber-600'
                  : 'text-gray-500'
            )}
          >
            {subscription.label}
          </span>
          <Button
            size="sm"
            variant={subscription.tone === 'ok' ? 'bordered' : 'solid'}
            className={cn(
              'px-4 shrink-0',
              subscription.tone !== 'ok' && 'bg-[#5951E5] text-white'
            )}
            onPress={() => window.open(subscription.url, '_blank', 'noopener,noreferrer')}
          >
            {subscription.cta}
          </Button>
        </div>
      ) : null}

      <div className="flex items-center gap-3 mt-2">
        <Button
          size="sm"
          variant="solid"
          className={cn(
            'bg-[#5951E5] text-white px-6 [&>svg]:max-w-40',
            isCreated && 'w-32 shrink-0'
          )}
          isDisabled={!isAvailable || (isCreated && !widgetId)}
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
              <SvgIcon src={iconEye} size={'16px'} className="text-[#5951E5]" />
            </div>
          }
        >
          Посмотреть демо
        </Button>
      </div>
    </div>
  )
}

export default Widget
