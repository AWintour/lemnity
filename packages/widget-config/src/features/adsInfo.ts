import { z } from 'zod'

export const AdsInfoSchema = z.object({
  enabled: z.boolean(),
  policyUrl: z.string(),
  color: z.string()
})

export type AdsInfoSettings = z.infer<typeof AdsInfoSchema>
