import { z } from 'zod'
import { IconEnum } from '../widgets/base.js'

export const PositionEnum = z.enum(['bottom-left', 'bottom-right'])
export const TriggerVariantEnum = z.enum(['image', 'button'])

export const TriggerSchema = z.object({
  triggerFontColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  triggerBackgroundColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  triggerText: z
    .string()
    .max(20, 'Текст должен быть не длиннее 20 символов'),
  triggerVariant: TriggerVariantEnum,
  triggerImageUrl: z.string(),
  triggerIcon: IconEnum,
  triggerPosition: PositionEnum,
})

export type PositionType = z.infer<typeof PositionEnum>
export type TriggerVariant = z.infer<typeof TriggerVariantEnum>
export type TriggerType = z.infer<typeof TriggerSchema>
