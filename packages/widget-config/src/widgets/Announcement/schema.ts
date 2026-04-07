import { z } from 'zod'
import {
  IconEnum,
  ColorSchemeEnum,
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'

const WidgetType: WidgetTypeId = 'ANNOUNCEMENT'

const ContentEnum = z.enum(['imageOnTop', 'background', 'video'])
const ContentAlignmentEnum = z.enum(['top', 'center', 'bottom'])
const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])
const MobileTriggerEnum = z.enum(['image', 'button'])

export type Content = z.infer<typeof ContentEnum>
export type ContentAlignment = z.infer<typeof ContentAlignmentEnum>
export type Icon = z.infer<typeof IconEnum>
export type FontWeight = z.infer<typeof FontWeightEnum>
export type MobileTrigger = z.infer<typeof MobileTriggerEnum>

const WidgetAppearenceSchema = z.object({
  companyLogoEnabled: z.boolean(),
  companyLogoUrl: z.string().optional(),

  colorScheme: ColorSchemeEnum,
  backgroundColor: z.string(),
  borderRadius: z.number(),
})

export type WidgetAppearence = z.infer<typeof WidgetAppearenceSchema>

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

const RewardMessageSettingsSchema = z.object({
  rewardScreenEnabled: z.boolean(),

  title: z.string(),
  titleFontSize: z
    .number()
    .nonnegative(),
  titleFontWeight: FontWeightEnum,
  titleFontColor: z.string(),

  description: z.string(),
  descriptionFontSize: z
    .number()
    .nonnegative(),
  descriptionFontWeight: FontWeightEnum,
  descriptionFontColor: z.string(),

  discount: z.string(),
  discountFontSize: z
    .number()
    .nonnegative(),
  discountFontWeight: FontWeightEnum,
  discountFontColor: z.string(),

  promo: z.string(),
  promoFontSize: z
    .number()
    .nonnegative(),
  promoFontWeight: FontWeightEnum,
  promoFontColor: z.string(),

  customColorSchemeEnabled: z.boolean(),
  customDiscountBackgroundColor: z.string(),
  customPromoBackgroundColor: z.string(),
})

export type RewardMessageSettings = z.infer<typeof RewardMessageSettingsSchema>

const MobileSchema = z.object({
  mobileEnabled: z.boolean(),
  triggerType: MobileTriggerEnum,
  imageUrl: z.string().optional(),
  triggerText: z.string(),
  triggerFontColor: z.string(),
  triggerBackgroundColor: z.string(),
})

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
