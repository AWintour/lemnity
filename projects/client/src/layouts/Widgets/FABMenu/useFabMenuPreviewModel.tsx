import { useState, useCallback, type CSSProperties } from 'react'
import type { FABMenuSectorItem } from './types'
import { FAB_MENU_BUTTON_PRESETS } from './buttonLibrary'
import { sendEvent } from '@/common/api/publicApi'
import type { FABMenuPosition } from '@lemnity/widget-config/widgets/fab-menu'
import { useAppSelector } from '@/stores/redux/hooks'
import { initialState, selectAllSectors, selectProjectId, selectTriggerBackgroundColor, selectTriggerIcon, selectTriggerPosition, selectTriggerText, selectTriggerTextColor, selectWidgetId } from './FABMenuSlice'

const normalizePosition = (position: FABMenuPosition): FABMenuPosition =>
  position === 'bottom-left' ? 'bottom-left' : 'bottom-right'

const sanitizeNickname = (value: string) => value.replace(/^@/, '').trim()
const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, '')
const ensureHttpUrl = (value: string) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value.replace(/^\/+/, '')}`
}

const NICKNAME_URL_RESOLVERS: Partial<
  Record<FABMenuSectorItem['icon'], (value: string) => string | null>
> = {
  'telegram-message': value => `https://t.me/${sanitizeNickname(value)}`,
  'telegram-channel': value => `https://t.me/${sanitizeNickname(value)}`,
  'vk-message': value => `https://vk.me/${sanitizeNickname(value)}`
}

const ICON_URL_RESOLVERS: Partial<
  Record<FABMenuSectorItem['icon'], (value: string) => string | null>
> = {
  'max-message': value => `https://max.ru/${sanitizeNickname(value)}`,
  vk: value => `https://vk.com/${sanitizeNickname(value)}`,
  ok: value => `https://ok.ru/profile/${sanitizeNickname(value)}`,
  instagram: value => `https://instagram.com/${sanitizeNickname(value)}`,
  youtube: value => `https://youtube.com/${sanitizeNickname(value)}`,
  'telegram-channel': value => `https://t.me/${sanitizeNickname(value)}`,
  'telegram-message': value => `https://t.me/${sanitizeNickname(value)}`,
  'whatsapp-message': value => {
    const phone = sanitizePhone(value)
    return phone ? `https://wa.me/${phone}` : null
  }
}

const buildActionHref = (item: FABMenuSectorItem): string | null => {
  const { type, value } = item.payload
  if (!value) return null
  switch (type) {
    case 'email':
      return `mailto:${value}`
    case 'phone':
      return `tel:${sanitizePhone(value)}`
    case 'link':
      return ensureHttpUrl(value)
    case 'anchor':
      return value.startsWith('#') ? value : `#${value}`
    case 'nickname': {
      const resolver = NICKNAME_URL_RESOLVERS[item.icon] ?? ICON_URL_RESOLVERS[item.icon]
      return resolver ? resolver(value) : null
    }
    case 'script':
      return null
    default:
      return null
  }
}

export const useFabMenuPreviewModel = (widgetIdParam?: string) => {
  const triggerTextColor =
    useAppSelector(selectTriggerTextColor)
      || initialState.triggerTextColor
  const triggerBackgroundColor =
    useAppSelector(selectTriggerBackgroundColor)
      || initialState.triggerBackgroundColor
  const triggerText =
    useAppSelector(selectTriggerText)
  const triggerIcon =
    useAppSelector(selectTriggerIcon)
  const buttonPosition =
    useAppSelector(selectTriggerPosition)
  const widgetId =
    useAppSelector(selectWidgetId)
  const projectId =
    useAppSelector(selectProjectId)
  const menuItems =
    useAppSelector(selectAllSectors)

  const [expanded, setExpanded] = useState(false)

  const safePosition = normalizePosition(buttonPosition)
  const alignClassName =
    safePosition === 'bottom-left' ? 'items-start text-left' : 'items-end text-right'

  const renderBackground = useCallback(
    (item: FABMenuSectorItem): CSSProperties => {
      const preset = FAB_MENU_BUTTON_PRESETS.find(p => p.icon === item.icon)
      const gradientStops = preset?.gradientColors?.join(', ')
      const hasGradient = Boolean(gradientStops)
      // const isMaxButton = item.icon === 'max-message'
      const isNotMessenger =
        item.icon === 'custom' ||
        item.icon === 'email' ||
        item.icon === 'phone' ||
        item.icon === 'website' ||
        item.icon === 'calendar'
      const baseColor = preset?.color ?? item.color
      const style: CSSProperties = {}

      // if (isMaxButton && hasGradient) {
      //   style.backgroundImage = `linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, ${gradientStops})`
      //   style.backgroundOrigin = 'padding-box, border-box'
      //   style.backgroundClip = 'padding-box, border-box'
      //   style.border = '1px solid transparent'
      //   style.color = preset?.textColor ?? '#6B21A8'
      // } else
      if (hasGradient) {
        style.backgroundImage = `linear-gradient(135deg, ${gradientStops})`
        style.backgroundColor = preset?.gradientColors?.[0] ?? baseColor
        style.color = preset?.textColor ?? '#ffffff'
      } else if (isNotMessenger) {
        style.backgroundColor = triggerBackgroundColor
        style.color = triggerTextColor
      } else {
        style.backgroundColor = baseColor
        style.color = preset?.textColor ?? '#ffffff'
      }

      return style
    },
    [triggerBackgroundColor, triggerTextColor]
  )

  const toggleExpanded = () => {
    setExpanded(prev => {
      const next = !prev
      const id = widgetIdParam ?? widgetId
      if (id) {
        void sendEvent({
          event_name: next ? 'fab_menu.open' : 'fab_menu.close',
          widget_id: id,
          project_id: projectId ?? undefined
        })
      }
      return next
    })
  }

  const handleItemAction = (item: FABMenuSectorItem) => {
    const id = widgetIdParam ?? widgetId
    if (id) {
      void sendEvent({
        event_name: 'fab_menu.item_click',
        widget_id: id,
        project_id: projectId ?? undefined,
        payload: {
          item_id: item.id,
          label: item.label,
          action_type: item.payload.type
        }
      })
    }

    const href = buildActionHref(item)
    if (href && typeof window !== 'undefined') {
      if (href.startsWith('#')) {
        window.location.hash = href
      } else {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
      return
    }

    const { type, value } = item.payload
    if (type === 'script' && value && typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(value)
      alert('Скрипт скопирован в буфер обмена')
      return
    }
    if (value && typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(value)
      alert('Данные скопированы в буфер обмена')
    }
  }

  return {
    triggerTextColor,
    triggerBackgroundColor,
    triggerText,
    triggerIcon,
    menuItems,
    alignClassName,
    safePosition,
    expanded,
    toggleExpanded,
    renderBackground,
    handleItemAction
  }
}
