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

import { useAppDispatch } from '@/stores/redux/hooks'
import { currentWidgetChanged } from '@/stores/redux/editorSlice'

const preloadWidgetOnHover = async (type: WidgetTypeEnum) => {
  switch (type) {
    case 'NOTIFICATION':
      import('@/layouts/Widgets/Notification/NotificationWidgetSettings')
      import('@/layouts/Widgets/Notification/WidgetPreview')
      break
    case 'ANNOUNCEMENT':
      import('@/layouts/Widgets/Announcement/AnnouncementWidgetSettings')
      import('@/layouts/Widgets/Announcement/WidgetPreview')
      break
    case 'EVENT_TIMER':
      import('@/layouts/Widgets/EventTimer/EventTimerWidgetSettings')
      import('@/layouts/Widgets/EventTimer/WidgetPreview')
      break
    case 'FAB_MENU':
      import('@/layouts/Widgets/FABMenu/FABMenuSettings')
      import('@/layouts/Widgets/FABMenu/WidgetPreview')
      break
    case 'ACTION_TIMER':
      import('@/layouts/Widgets/ActionTimer/ActionTimerWidgetSettings')
      import('@/layouts/Widgets/ActionTimer/WidgetPreview')
      break
  }
}

interface WidgetProps {
  title?: string
  subtitle?: string
  type: WidgetTypeEnum
  badge?: WidgetBadge
  enabled: boolean
  isAvailable?: boolean
  isCreated?: boolean
  widgetId?: string
  onToggle?: (value: boolean) => void
  onCreate?: () => void
  onEdit?: (widgetId: string) => void
  onPreview?: () => void
}

const Widget = ({
  title,
  type,
  subtitle,
  badge,
  enabled,
  isAvailable = true,
  isCreated = false,
  widgetId,
  onToggle,
  onCreate,
  onEdit,
  onPreview
}: WidgetProps): ReactElement => {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled)
  
  const dispatch = useAppDispatch()

  const handleEdit = () => {
    dispatch(currentWidgetChanged(type))

    if (widgetId && onEdit) {
      onEdit(widgetId)
    }
  }

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

  const handleHover = () => {
    preloadWidgetOnHover(type)
  }

  return (
    <div
      className={`widget-card ${!isAvailable ? 'widget-not-available select-none' : ''}`}
      onMouseOver={handleHover}
      onTouchStart={handleHover}
    >
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

      <div className="flex items-center gap-3 mt-2">
        <Button
          size="sm"
          variant="solid"
          className={cn(
            'bg-[#5951E5] text-white px-6 [&>svg]:max-w-40',
            isCreated && 'w-32 shrink-0'
          )}
          isDisabled={!isAvailable || (isCreated && !widgetId)}
          onPress={isCreated && widgetId ? handleEdit : onCreate}
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
