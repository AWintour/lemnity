import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type { WidgetSettings } from '@/stores/widgetSettings/types'

export type InitOptions = {
  widgetId: string
  apiBase?: string
  // Префетченный конфиг (проектный режим ?projectId=...): один batch-запрос отдаёт конфиги всех
  // включённых виджетов, поэтому менеджеру не нужно повторно ходить за конфигом по widgetId.
  payload?: PublicWidgetResponse
}

export type PublicWidgetResponse = {
  id: string
  projectId: string
  type: WidgetTypeEnum
  enabled: boolean
  config: WidgetSettings | null
}