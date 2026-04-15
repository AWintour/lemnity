// this schema will need to be refactored
// it was made before the /features folder was introduced
// features were integrated in a way that does not break existing code
import { z } from 'zod'
import {
  IconEnum,
  ColorSchemeEnum,
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'
import { WidgetAppearenceSchema } from '../../features/widgetAppearence.js'
import { RewardMessageSettingsSchema } from '../../features/rewardMessage.js'
import { MobileSchema } from '../../features/mobileTrigger.js'

const WidgetType: WidgetTypeId = 'ANNOUNCEMENT'

const ContentEnum = z.enum(['imageOnTop', 'background', 'video'])
const ContentAlignmentEnum = z.enum(['top', 'center', 'bottom'])
const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])

export type Content = z.infer<typeof ContentEnum>
export type ContentAlignment = z.infer<typeof ContentAlignmentEnum>
export type Icon = z.infer<typeof IconEnum>
export type FontWeight = z.infer<typeof FontWeightEnum>

const InfoSettingsSchema = z.object({
  contentType: ContentEnum,
  contentAlignment: ContentAlignmentEnum,
  contentUrl: z
    .string()
    .optional(),

  title: z.string(),
  titleFontWeight: FontWeightEnum,
  titleColor: z.string(),
  description: z.string(),
  descriptionColor: z.string(),
  descriptionFontWeight: FontWeightEnum,

  buttonText: z.string(),
  buttonFontColor: z.string(),
  buttonBackgroundColor: z.string(),
  icon: IconEnum,
  link: z.string(),
})

export type InfoSettings = z.infer<typeof InfoSettingsSchema>

const AnnouncementWidgetSchema = z.object({
  type: z.literal(WidgetType),
  appearence: WidgetAppearenceSchema,
  infoSettings: InfoSettingsSchema,
  rewardMessageSettings: RewardMessageSettingsSchema,
  mobileSettings: MobileSchema,
  brandingEnabled: z.boolean(),
})

export type AnnouncementWidgetType =
  z.infer<typeof AnnouncementWidgetSchema>

const customSurfaces = {
  fields: LooseSurfaceSchema,
  display: LooseSurfaceSchema,
  integration: LooseSurfaceSchema
} as const

export const announcementSchema = buildWidgetSettingsSchema(
  WidgetType,
  AnnouncementWidgetSchema,
  customSurfaces
)
