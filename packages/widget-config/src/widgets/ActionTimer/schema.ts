import { z } from 'zod'
import {
  ColorSchemeEnum,
  IconEnum,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'

const WidgetType: WidgetTypeId = 'ACTION_TIMER'

const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])
const ContentEnum = z.enum(['imageOnSide', 'background'])
const ContentAlignmentEnum = z.enum(['left', 'center', 'right'])
const ContentPlacementEnum = z.enum(['left', 'right'])

export type FontWeight = z.infer<typeof FontWeightEnum>
export type Content = z.infer<typeof ContentEnum>
export type ContentPlacement = z.infer<typeof ContentPlacementEnum>
export type ContentAlignment = z.infer<typeof ContentAlignmentEnum>

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

const ActionTimerWidgetSchema = z.object({
  type: z.literal(WidgetType),

  companyLogoEnabled: z.boolean(),
  companyLogoUrl: z.string().optional(),
  colorScheme: ColorSchemeEnum,
  backgroundColor: z.string(),
  contentType: ContentEnum,
  contentAlignment: ContentAlignmentEnum,
  contentUrl: z
    .string()
    .optional(),
  contentPlacement: ContentPlacementEnum,
  borderRadius: z.number(),

  badgeText: z.string(),
  badgeBackgroundColor: z.string(),
  badgeFontColor: z.string(),

  title: z.string(),
  titleFontSize: z
    .number()
    .nonnegative(),
  titleFontWeight: FontWeightEnum,
  titleColor: z.string(),
  
  // subTitle: z.string(),
  // subTitleFontSize: z
  //   .number()
  //   .nonnegative(),
  // subTitleFontWeight: FontWeightEnum,
  // subTitleColor: z.string(),

  description: z.string(),
  descriptionFontSize: z
    .number()
    .nonnegative(),
  descriptionFontWeight: FontWeightEnum,
  descriptionColor: z.string(),

  buttonText: z.string(),
  buttonFontColor: z.string(),
  buttonIcon: IconEnum,
  buttonBackgroundColor: z.string(),
  buttonLink: z.string(),

  formBorderEnabled: z.boolean(),
  formBorderColor: z.string(),

  countdownEnabled: z.boolean(),
  textBeforeCountdown: z.string(),
  textBeforeCountdownColor: z.string(),
  countdownDate: z.string(),
  countdownBackgroundColor: z.string(),
  countdownFontColor: z.string(),

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

  rewardMessageSettings: RewardMessageSettingsSchema,
  brandingEnabled: z.boolean(),
})

export type ActionTimerWidgetType = z.infer<typeof ActionTimerWidgetSchema>

export const actionTimerSchema = buildWidgetSettingsSchema(
  WidgetType,
  ActionTimerWidgetSchema
)

