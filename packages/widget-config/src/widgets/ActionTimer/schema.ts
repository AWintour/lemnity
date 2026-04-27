import { z } from 'zod'
import {
  FontWeightEnum,
  IconEnum,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'
import { RewardMessageSettingsSchema } from '../../features/rewardMessage.js'
import { WidgetAppearenceSchema } from '../../features/widgetAppearence.js'
import { CountdownSchema } from '../../features/countdown.js'
import { ContactAcquisitionSchema } from '../../features/contactAcquisition.js'
import { AgreementSchema } from '../../features/agreement.js'
import { AdsInfoSchema } from '../../features/adsInfo.js'
import { TriggerSchema } from '../../features/trigger.js'

const WidgetType: WidgetTypeId = 'ACTION_TIMER'

const ContentEnum = z.enum(['imageOnSide', 'background'])
const ContentAlignmentEnum = z.enum(['left', 'center', 'right'])
const ContentPlacementEnum = z.enum(['left', 'right'])

export type Content = z.infer<typeof ContentEnum>
export type ContentPlacement = z.infer<typeof ContentPlacementEnum>
export type ContentAlignment = z.infer<typeof ContentAlignmentEnum>

export type RewardMessageSettings = z.infer<typeof RewardMessageSettingsSchema>

const ActionTimerWidgetSchema = z.object({
  type: z.literal(WidgetType),

  appearence: WidgetAppearenceSchema,
  countdown: CountdownSchema,
  contactAcquisition: ContactAcquisitionSchema,
  agreement: AgreementSchema,
  adsInfo: AdsInfoSchema,
  rewardMessageSettings: RewardMessageSettingsSchema,
  trigger: TriggerSchema,

  contentType: ContentEnum,
  contentAlignment: ContentAlignmentEnum,
  contentUrl: z
    .string()
    .optional(),
  contentPlacement: ContentPlacementEnum,

  badgeText: z.string(),
  badgeBackgroundColor: z.string(),
  badgeFontColor: z.string(),

  title: z.string(),
  titleFontSize: z
    .number()
    .nonnegative(),
  titleFontWeight: FontWeightEnum,
  titleColor: z.string(),

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

  brandingEnabled: z.boolean(),
})

export type ActionTimerWidgetType = z.infer<typeof ActionTimerWidgetSchema>

export const actionTimerSchema = buildWidgetSettingsSchema(
  WidgetType,
  ActionTimerWidgetSchema
)

