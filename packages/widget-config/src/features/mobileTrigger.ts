import { z } from 'zod'

const MobileTriggerEnum = z.enum(['image', 'button'])
export type MobileTrigger = z.infer<typeof MobileTriggerEnum>

export const MobileSchema = z.object({
  mobileEnabled: z.boolean(),
  triggerType: MobileTriggerEnum,
  imageUrl: z.string().optional(),
  triggerText: z.string(),
  triggerFontColor: z.string(),
  triggerBackgroundColor: z.string(),
})

export type MobileTriggerSettings = z.infer<typeof MobileSchema>
