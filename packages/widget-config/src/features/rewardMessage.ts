import { z } from 'zod'
import { FontWeightEnum } from '../widgets/base.js'

export const RewardMessageSettingsSchema = z.object({
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
