import type { IconName } from '@/components/IconPicker'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

export type FABMenuIconKey =
  | 'email'
  | 'phone'
  | 'website'
  | 'calendar'
  | 'vk'
  | 'vk-message'
  | 'telegram-message'
  | 'telegram-channel'
  | 'max-message'
  | 'whatsapp-message'
  | 'instagram'
  | 'youtube'
  | 'ok'
  | 'custom'

export type FABMenuPayloadType = 'email' | 'phone' | 'link' | 'nickname' | 'script' | 'anchor'

export type FABMenuSectorPayload = {
  type: FABMenuPayloadType
  value: string
  helper?: string
}

export type FABMenuSectorItem = {
  id: string
  label: string
  icon: FABMenuIconKey
  payload: FABMenuSectorPayload
  color: string
  description?: string
}

export type FABMenuWidgetSettings = {
  type: typeof WidgetTypeEnum.FAB_MENU
  sectors: {
    items: FABMenuSectorItem[]
  }
  triggerTextColor: string
  triggerBackgroundColor: string
  triggerText: string
  triggerIcon: IconName
}
