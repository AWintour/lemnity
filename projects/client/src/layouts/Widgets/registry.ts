import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type { ComponentType, LazyExoticComponent } from 'react'
import { wheelWidgetMetadata } from './WheelOfFortune/metadata'
import { actionTimerWidgetMetadata } from './CountDown/metadata'
import { fabMenuWidgetMetadata } from './FABMenu/metadata'
import { announcementWidgetMetadata } from './Announcement/metadata'
import { eventTimerWidgetMetadata } from './EventTimer/metadata'
import { notificationWidgetMetadata } from './Notification/metadata'
import {
  StubWidgetPanelPreview,
  StubDesktopScreen,
  StubMobilePreview
} from './Common/StubWidgetPreview'
import {
  WIDGET_DEFINITIONS_BASE,
  type WidgetDefinitionBase
} from '@/stores/widgetSettings/widgetDefinitions'
import type { PreviewMode } from '@/stores/widgetPreviewStore'
import { resolveWidgetDefinition } from '@/stores/widgetSettings/resolveWidgetDefinition'
import type { SettingsSurface } from '@lemnity/widget-config'
import type { WidgetAction } from './actions'

export type WidgetPreviewScreen = 'main' | 'prize' | 'panel'

export type WidgetLeadFormValues = {
  phone?: string
  email?: string
  name?: string
}

export type DesktopPreviewProps = {
  screen: WidgetPreviewScreen
  onSubmit: (values: WidgetLeadFormValues) => void
  spinTrigger?: number
  hideCloseButton?: boolean
}

export type MobilePreviewProps = Record<string, never>

export type WidgetPanelPreviewProps = {
  mode: PreviewMode
}

export type DesktopScreenProps = {
  screen: WidgetPreviewScreen
  onSubmit: (values: WidgetLeadFormValues) => void
}

export type WidgetModalPreviewProps = {
  screen: WidgetPreviewScreen
  onSubmit: (values: WidgetLeadFormValues) => void
}

export type WidgetInlinePreviewProps = {
  onClose: () => void
}

export type WidgetPreviewLauncher = 'modal' | 'inline'

export type WidgetSettingsSection = {
  id: string
  Component: ComponentType
}

export type WidgetSettingsSurfaceRegistry = Partial<Record<SettingsSurface, ComponentType>>

type AnyComponent<P = Record<string, unknown>> =
  | ComponentType<P>
  | LazyExoticComponent<ComponentType<P>>

export type WidgetDefinition = WidgetDefinitionBase & {
  preview: {
    panel: AnyComponent<WidgetPanelPreviewProps>
    desktopScreens: Partial<Record<WidgetPreviewScreen, AnyComponent<DesktopScreenProps>>>
    mobile: AnyComponent<MobilePreviewProps> | null
    modal?: AnyComponent<WidgetModalPreviewProps>
    inline?: AnyComponent<WidgetInlinePreviewProps>
    launcher?: WidgetPreviewLauncher
  }
  settings: {
    sections: WidgetSettingsSection[]
    surfaces?: WidgetSettingsSurfaceRegistry
  }
  actions?: WidgetAction[]
}

const stubSettingsSections: WidgetSettingsSection[] = []

/**
 * Полная карта определений виджетов по всем значениям WidgetTypeEnum.
 * Для реализованных типов — реальные preview и секции.
 * Для остальных — единые stub‑preview и пустые секции.
 */
const allWidgetTypes = Object.values(WidgetTypeEnum) as WidgetTypeEnum[]

const baseMetadata = () => ({
  preview: {
    panel: StubWidgetPanelPreview,
    desktopScreens: {
      main: StubDesktopScreen,
      prize: StubDesktopScreen,
      panel: StubDesktopScreen
    },
    mobile: StubMobilePreview,
    launcher: 'modal' as WidgetPreviewLauncher
  },
  settings: {
    sections: stubSettingsSections
  },
  actions: [] as WidgetAction[]
})

const widgetMetadata: Partial<
  Record<WidgetTypeEnum, Pick<WidgetDefinition, 'preview' | 'settings' | 'actions'>>
> = {
  [WidgetTypeEnum.WHEEL_OF_FORTUNE]: wheelWidgetMetadata,
  [WidgetTypeEnum.ACTION_TIMER]: actionTimerWidgetMetadata,
  [WidgetTypeEnum.FAB_MENU]: fabMenuWidgetMetadata,
  [WidgetTypeEnum.ANNOUNCEMENT]: announcementWidgetMetadata,
  [WidgetTypeEnum.EVENT_TIMER]: eventTimerWidgetMetadata,
  [WidgetTypeEnum.NOTIFICATION]: notificationWidgetMetadata,
}

const definitions: Record<WidgetTypeEnum, WidgetDefinition> = Object.fromEntries(
  allWidgetTypes.map(widgetType => {
    const base = WIDGET_DEFINITIONS_BASE[widgetType]
    const metadata = widgetMetadata[widgetType] ?? baseMetadata()
    return [
      widgetType,
      {
        ...base,
        preview: metadata.preview,
        settings: metadata.settings,
        actions: metadata.actions ?? []
      }
    ]
  })
) as Record<WidgetTypeEnum, WidgetDefinition>

/**
 * Gets widget definition for the given widget type.
 * Returns the full definition including preview components and settings sections.
 *
 * For unimplemented widget types, returns a stub definition with placeholder components.
 */
const resolveWidgetDefinitionForRegistry = resolveWidgetDefinition<
  typeof definitions,
  WidgetDefinition
>(definitions)

export const getWidgetDefinition = (widgetType: WidgetTypeEnum): WidgetDefinition =>
  resolveWidgetDefinitionForRegistry(widgetType)

export const WIDGET_DEFINITIONS = definitions
