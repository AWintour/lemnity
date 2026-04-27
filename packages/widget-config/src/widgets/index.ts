import type { WidgetTypeId } from './base.js'
import { z } from 'zod'
import { wheelOfFortuneSchema } from './WheelOfFortune/schema.js'
import { actionTimerSchema } from './ActionTimer/schema.js'
import { fabMenuSchema } from './FABMenu/schema.js'
import { announcementSchema } from './Announcement/schema.js'
import { notificationSchema } from './Notification/schema.js'
import { eventTimerSchema } from './EventTimer/schema.js'
import { WidgetType } from '../schema.js'

export type WidgetSchemaAdapter = {
  type: WidgetTypeId
  schema: z.ZodTypeAny
}

const adapters: WidgetSchemaAdapter[] = [
  { type: 'WHEEL_OF_FORTUNE', schema: wheelOfFortuneSchema },
  { type: 'ACTION_TIMER', schema: actionTimerSchema },
  { type: 'FAB_MENU', schema: fabMenuSchema },
  { type: 'ANNOUNCEMENT', schema: announcementSchema },
  { type: 'EVENT_TIMER', schema: eventTimerSchema },
  { type: 'NOTIFICATION', schema: notificationSchema },
]

export const widgetSchemaAdapters: Record<WidgetTypeId, WidgetSchemaAdapter> =
  adapters.reduce<Record<WidgetTypeId, WidgetSchemaAdapter>>((acc, adapter) => {
    acc[adapter.type] = adapter
    return acc
  }, {} as Record<WidgetTypeId, WidgetSchemaAdapter>)

export const widgetSchemas = adapters.map(adapter => adapter.schema)

export const schemas: { [key in WidgetType]: z.ZodType } = {
  'WHEEL_OF_FORTUNE': wheelOfFortuneSchema,
  'ACTION_TIMER': actionTimerSchema,
  'FAB_MENU': fabMenuSchema,
  'ANNOUNCEMENT': announcementSchema,
  'EVENT_TIMER': eventTimerSchema,
  'NOTIFICATION': notificationSchema,
  'POSTCARD': z.object(),
  'TEASER': z.object(),
  'ADVENT_CALENDAR': z.object(),
  'CHEST_WITH_ACTION': z.object(),
  'CONVEYOR_OF_GIFTS': z.object(),
}