import { z } from 'zod'
import { ColorSchemeEnum } from '../widgets/base.js'

export const WidgetAppearenceSchema = z.object({
  companyLogoEnabled: z.boolean(),
  companyLogoUrl: z.string().optional(),
  colorScheme: ColorSchemeEnum,
  backgroundColor: z.string(),
  borderRadius: z.number(),
})

export type WidgetAppearence = z.infer<typeof WidgetAppearenceSchema>
