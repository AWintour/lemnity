import { z } from 'zod'

export const AgreementSchema = z.object({
  enabled: z.boolean(),
  policyUrl: z.string(),
  agreementUrl: z.string(),
  color: z.string(),
})

export type AgreementSettings = z.infer<typeof AgreementSchema>
