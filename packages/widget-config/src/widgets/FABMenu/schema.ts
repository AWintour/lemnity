import { z } from 'zod'
import {
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'
import { TriggerSchema } from '../../features/trigger.js'

const FABMenuIconEnum = z.enum([
  'email',
  'phone',
  'website',
  'calendar',
  'vk',
  'vk-message',
  'telegram-message',
  'telegram-channel',
  'max-message',
  'whatsapp-message',
  'instagram',
  'youtube',
  'ok',
  'custom'
])

const FABMenuPayloadTypeEnum = z.enum([
  'email',
  'phone',
  'link',
  'nickname',
  'script',
  'anchor'
])

const FABMenuSectorSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: FABMenuIconEnum,
  payload: z.object({
    type: FABMenuPayloadTypeEnum,
    value: z.string(),
    helper: z.string().optional()
  }),
  color: z.string(),
  description: z.string().optional()
})

export const PositionEnum = z.enum(['bottom-left', 'bottom-right'])

export type FABMenuIcon = z.infer<typeof FABMenuIconEnum>
export type FABMenuPayloadType = z.infer<typeof FABMenuPayloadTypeEnum>
export type FABMenuSector = z.infer<typeof FABMenuSectorSchema>
export type FABMenuPosition = z.infer<typeof PositionEnum>


const WidgetType: WidgetTypeId = 'FAB_MENU'

const FABMenuWidgetSchema = z.object({
  type: z.literal(WidgetType),
  sectors: z.array(FABMenuSectorSchema),
  trigger: TriggerSchema.omit({
    triggerVariant: true,
    triggerImageUrl: true,
  }),
  brandingEnabled: z.boolean(),
})

export type FabMenuWidgetType = z.infer<typeof FABMenuWidgetSchema>

const customSurfaces = {
  fields: LooseSurfaceSchema,
  display: LooseSurfaceSchema,
  integration: LooseSurfaceSchema
} as const

export const fabMenuSchema = buildWidgetSettingsSchema(
  WidgetType,
  FABMenuWidgetSchema,
  customSurfaces
)
