import { z } from 'zod'
import {
  ColorSchemeEnum,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'

const WheelSectorSchema = z
  .object({
    id: z.string(),
    mode: z.enum(['text', 'icon']),
    text: z.string().optional(),
    icon: z.string().optional(),
    color: z.string(),
    promo: z.string().optional(),
    chance: z.number().nonnegative().max(100).optional(),
    isWin: z.boolean().optional(),
    textSize: z.number().nonnegative().optional(),
    iconSize: z.number().nonnegative().optional(),
    textColor: z.string().optional()
  })
  .superRefine((v, ctx) => {
    if (v.mode === 'text') {
      if (!v.text) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['text'],
          message: 'Введите текст для сектора'
        })
      }
      if (typeof v.icon !== 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['icon'],
          message: 'Иконка не может быть выбрана при режиме текста'
        })
      }
    }
    if (v.mode === 'icon') {
      if (!v.icon) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['icon'],
          message: 'Выберите иконку для сектора'
        })
      }
      if (typeof v.text !== 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['text'],
          message: 'Сектор не может иметь текст в режиме иконки'
        })
      }
    }
  })

const WidgetType: WidgetTypeId = 'WHEEL_OF_FORTUNE'

const WheelWidgetSchema = z
.object({
    type: z.literal(WidgetType),
    sectors: z.object({
      randomize: z.boolean(),
      items: z.array(WheelSectorSchema)
    }),
    borderColor: z.string().optional(),
    borderThickness: z.number().min(0).max(20).optional(),
    eventMode: z.boolean().optional(),
    messages: z
      .object({
        onWin: z.object({
          enabled: z.boolean(),
          text: z.string(),
          textSize: z.number().nonnegative(),
          description: z.string(),
          descriptionSize: z.number().nonnegative(),
          colorScheme: z.object({
            enabled: z.boolean(),
            scheme: ColorSchemeEnum,
            discount: z.object({ color: z.string(), bgColor: z.string() }),
            promo: z.object({ color: z.string(), bgColor: z.string() })
          })
        }),
        limitShows: z.object({ enabled: z.boolean(), text: z.string() }),
        limitWins: z.object({ enabled: z.boolean(), text: z.string() }),
        allPrizesGiven: z.object({ enabled: z.boolean(), text: z.string() })
      })
      .optional()
  })
  .superRefine((v, ctx) => {
    const totalChance = v.sectors.items.reduce((sum, item) => sum + (item.chance ?? 0), 0)
    if (totalChance > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sectors', 'items'],
        message: 'Сумма шансов выпадения секторов не должна превышать 100%'
      })
    }
  })

export const wheelOfFortuneSchema = buildWidgetSettingsSchema(WidgetType, WheelWidgetSchema)
