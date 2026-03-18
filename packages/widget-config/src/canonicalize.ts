import { canonicalizeWheelOfFortune } from './widgets/WheelOfFortune/canonicalize.js'
import { canonicalizeActionTimer } from './widgets/ActionTimer/canonicalize.js'
import { canonicalizeFABMenu } from './widgets/FABMenu/canonicalize.js'
import { canonicalizeAnnouncement } from './widgets/Announcement/canonicalize.js'
import { canonicalizeEventTimer } from './widgets/EventTimer/canonicalize.js'
import { canonicalizeNotification } from './widgets/Notification/canonicalize.js'
import { widgetSchemaAdapters } from './widgets/index.js'
import type {
  CanonicalizerMap,
  MutableWidgetSettings,
  WidgetCanonicalizer,
} from './canonicalizer.types.js'
import type { WidgetTypeId } from './widgets/base.js'

const cloneSettings = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

const WIDGET_TYPES = Object.keys(widgetSchemaAdapters) as WidgetTypeId[]

const isWidgetTypeId = (value: unknown): value is WidgetTypeId =>
  typeof value === 'string' && (WIDGET_TYPES as string[]).includes(value)

const resolveWidgetType = (settings: MutableWidgetSettings): WidgetTypeId | undefined => {
  if (isWidgetTypeId(settings.widgetType)) return settings.widgetType
  const nestedType =
    typeof settings.widget === 'object' && settings.widget && 'type' in settings.widget
      ? (settings.widget.type as unknown)
      : undefined
  if (isWidgetTypeId(nestedType)) return nestedType
  return undefined
}

const identityCanonicalizer: WidgetCanonicalizer = settings => settings

const canonicalizers: CanonicalizerMap = {
  WHEEL_OF_FORTUNE: canonicalizeWheelOfFortune,
  ACTION_TIMER: canonicalizeActionTimer,
  FAB_MENU: canonicalizeFABMenu,
  ANNOUNCEMENT: canonicalizeAnnouncement,
  EVENT_TIMER: canonicalizeEventTimer,
  NOTIFICATION: canonicalizeNotification,
}

const resolveCanonicalizer = (type: WidgetTypeId): WidgetCanonicalizer =>
  canonicalizers[type] ?? identityCanonicalizer

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const canonicalizeWidgetConfig = (raw: unknown): MutableWidgetSettings => {
  if (!isRecord(raw)) return raw as MutableWidgetSettings
  const copy = cloneSettings(raw as MutableWidgetSettings)
  const widgetType = resolveWidgetType(copy)
  if (!widgetType) return copy
  return resolveCanonicalizer(widgetType)(copy)
}

export type { MutableWidgetSettings, WidgetCanonicalizer } from './canonicalizer.types.js'


