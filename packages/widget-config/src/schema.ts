import { z } from 'zod'
import { widgetSchemas, schemas } from './widgets/index.js'

const combineSchemas = (schemas: z.ZodTypeAny[]) =>
  schemas.reduce<z.ZodTypeAny | null>((acc, schema) => {
    if (!acc) return schema
    return z.union([acc, schema])
  }, null) ?? z.never()

export const WidgetSettingsSchema = combineSchemas(widgetSchemas)

export type CanonicalWidgetSettings = z.infer<typeof WidgetSettingsSchema>
export type Issue = { path: string; message: any }

export type WidgetType =
  | 'WHEEL_OF_FORTUNE'
  | 'CONVEYOR_OF_GIFTS'
  | 'ACTION_TIMER'
  | 'POSTCARD'
  | 'CHEST_WITH_ACTION'
  | 'ADVENT_CALENDAR'
  | 'TEASER'
  | 'FAB_MENU'
  | 'ANNOUNCEMENT'
  | 'EVENT_TIMER'
  | 'NOTIFICATION'

export function validate(
  widgetType: WidgetType,
  settings: unknown
): { ok: boolean; issues: any } {
  const schema = schemas[widgetType]
  const parsed = schema.safeParse(settings)

  if (parsed.success) return { ok: true, issues: [] }

  console.error(
    'Zod schema validation failed with following issues:',
    JSON.stringify(parsed.error.issues)
  )

  return {
    ok: false,
    issues: parsed.error.issues
  }
}

// Legacy exports for backward compatibility during migration
export const validateCanonical = validate