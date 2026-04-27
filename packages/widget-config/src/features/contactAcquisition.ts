import { z } from 'zod'

export const ContactAcquisitionSchema = z.object({
  contactAcquisitionEnabled: z.boolean(),
  nameFieldEnabled: z.boolean(),
  nameFieldRequired: z.boolean(),
  emailFieldEnabled: z.boolean(),
  emailFieldRequired: z.boolean(),
  phoneFieldEnabled: z.boolean(),
  phoneFieldRequired: z.boolean(),
})

export type ContactAcquisitionSettings =
  z.infer<typeof ContactAcquisitionSchema>
