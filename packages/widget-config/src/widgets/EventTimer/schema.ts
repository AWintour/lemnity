// this schema will need to be refactored
// it was made before the /features folder was introduced
// features were integrated in a way that does not break existing code
import { z } from 'zod'
import {
  IconEnum,
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'
import { WidgetAppearenceSchema } from '../../features/widgetAppearence.js'
import { RewardMessageSettingsSchema } from '../../features/rewardMessage.js'
import { MobileSchema } from '../../features/mobileTrigger.js'
import { CountdownSchema } from '../../features/countdown.js'
import { AgreementSchema } from '../../features/agreement.js'
import { AdsInfoSchema } from '../../features/adsInfo.js'
import { ContactAcquisitionSchema } from '../../features/contactAcquisition.js'
import { TriggerSchema } from '../../features/trigger.js'

const WidgetType: WidgetTypeId = 'EVENT_TIMER'

const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])

export type Icon = z.infer<typeof IconEnum>
export type FontWeight = z.infer<typeof FontWeightEnum>

const InfoSettingsSchema = z.object({
  ...CountdownSchema
    .omit({
      textBeforeCountdown: true,
      textBeforeCountdownColor: true,
    })
    .shape,

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

  ...ContactAcquisitionSchema.shape,

  agreement: AgreementSchema,
  adsInfo: AdsInfoSchema,
})

export type FormSettings = z.infer<typeof FormSettingsSchema>

const EventTimerWidgetSchema = z.object({
  type: z.literal(WidgetType),
  appearence: WidgetAppearenceSchema,
  infoSettings: InfoSettingsSchema,
  formSettings: FormSettingsSchema,
  rewardMessageSettings: RewardMessageSettingsSchema,
  mobileSettings: MobileSchema,
  trigger: TriggerSchema.pick({
    triggerPosition: true,
  }),
  brandingEnabled: z.boolean(),
})

export type EventTimerWidgetType =
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
