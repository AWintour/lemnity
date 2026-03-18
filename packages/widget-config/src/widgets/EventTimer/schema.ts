import { z } from 'zod'
import {
  IconEnum,
  ColorSchemeEnum,
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'

const WidgetType: WidgetTypeId = 'EVENT_TIMER'

const ContentAlignmentEnum = z.enum(['top', 'center', 'bottom'])
const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])
const MobileTriggerEnum = z.enum(['image', 'button'])

export type ContentAlignment = z.infer<typeof ContentAlignmentEnum>
export type Icon = z.infer<typeof IconEnum>
export type FontWeight = z.infer<typeof FontWeightEnum>
export type MobileTrigger = z.infer<typeof MobileTriggerEnum>

const WidgetAppearenceSchema = z.object({
  companyLogoEnabled: z.boolean(),
  companyLogoUrl: z.string().optional(),

  colorScheme: ColorSchemeEnum,
  backgroundColor: z
    .string()
    .optional(),
  borderRadius: z.number(),
})

export type WidgetAppearence = z.infer<typeof WidgetAppearenceSchema>

const InfoSettingsSchema = z.object({
  contentEnabled: z.boolean(),
  contentUrl: z
    .string()
    .optional(),

  title: z.string(),
  titleFontWeight: FontWeightEnum,
  titleColor: z.string(),
  description: z.string(),
  descriptionColor: z.string(),
  descriptionFontWeight: FontWeightEnum,

  countdownEnabled: z.boolean(),
  countdownDate: z.string(),
  countdownBackgroundColor: z.string(),
  countdownFontColor: z.string(),

  buttonText: z.string(),
  buttonFontColor: z.string(),
  buttonBackgroundColor: z.string(),
  icon: IconEnum,
  link: z.string(),
})

export type InfoSettings = z.infer<typeof InfoSettingsSchema>

const FormSettingsSchema = z.object({
  title: z.string(),
  titleFontWeight: FontWeightEnum,
  titleFontColor: z.string(),
  description: z.string(),
  descriptionFontWeight: FontWeightEnum,
  descriptionFontColor: z.string(),

  contactAcquisitionEnabled: z.boolean(),
  nameFieldEnabled: z.boolean(),
  nameFieldRequired: z.boolean(),
  emailFieldEnabled: z.boolean(),
  emailFieldRequired: z.boolean(),
  phoneFieldEnabled: z.boolean(),
  phoneFieldRequired: z.boolean(),

  agreement: z.object({
    enabled: z.boolean(),
    policyUrl: z.string(),
    agreementUrl: z.string(),
    color: z.string()
  }),
  adsInfo: z.object({
    enabled: z.boolean(),
    policyUrl: z.string(),
    color: z.string()
  }),
})

export type FormSettings = z.infer<typeof FormSettingsSchema>

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

const EventTimerWidgetSchema = z.object({
  type: z.literal(WidgetType),
  appearence: WidgetAppearenceSchema,
  infoSettings: InfoSettingsSchema,
  formSettings: FormSettingsSchema,
  rewardMessageSettings: RewardMessageSettingsSchema,
  mobileSettings: MobileSchema,
  brandingEnabled: z.boolean(),
})

export type EventTimertWidgetType =
  z.infer<typeof EventTimerWidgetSchema>

const customSurfaces = {
  fields: LooseSurfaceSchema,
  display: LooseSurfaceSchema,
  integration: LooseSurfaceSchema
} as const

export const eventTimerSchema = buildWidgetSettingsSchema(
  WidgetType,
  EventTimerWidgetSchema,
  customSurfaces
)
