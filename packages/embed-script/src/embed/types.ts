import { WidgetTypeEnum } from '@lemnity/api-sdk'
// import type { WidgetSettings } from '@/stores/widgetSettings/types'

export type InitOptions = {
  widgetId: string
  apiBase?: string
}

export type PublicWidgetResponse = {
  id: string
  projectId: string
  type: WidgetTypeEnum
  enabled: boolean
  config: object | null
}