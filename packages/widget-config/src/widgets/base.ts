import { z } from 'zod'

export type WidgetTypeId =
  | 'WHEEL_OF_FORTUNE'
  | 'ACTION_TIMER'
  | 'FAB_MENU'
  | 'ANNOUNCEMENT'
  | 'EVENT_TIMER'
  | 'NOTIFICATION'

export const IconButtonSchema = z.object({
  text: z.string().min(1, 'Текст обязателен'),
  buttonColor: z.string(),
  textColor: z.string()
})

export const IconImageSchema = z.object({
  fileName: z.string().optional(),
  url: z.string().optional()
})

export const ColorSchemeEnum = z.enum(['primary', 'custom'])
export type ColorScheme = z.infer<typeof ColorSchemeEnum>
export const ImagePositionSchema = z.enum(['center', 'left', 'right'])
export const WindowFormatSchema = z.enum(['sidePanel', 'modalWindow'])

export const DisplaySchemaBase = z
  .object({
    icon: z.object({
      type: z.enum(['image', 'button']),
      image: IconImageSchema.optional(),
      button: IconButtonSchema.optional(),
      position: z.enum(['bottom-left', 'top-right', 'bottom-right']),
      hide: z.enum(['always', 'afterFormSending'])
    }),
    startShowing: z.enum(['onClick', 'timer']),
    timer: z.object({ delayMs: z.number() }),
    weekdays: z.object({
      enabled: z.boolean(),
      days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
      weekdaysOnly: z.boolean()
    }),
    showRules: z.object({
      onExit: z.boolean(),
      scrollBelow: z.object({ enabled: z.boolean(), percent: z.number().nonnegative().nullable() }),
      afterOpen: z.object({ enabled: z.boolean(), seconds: z.number().nonnegative().nullable() })
    }),
    frequency: z.object({
      mode: z.enum(['everyPage', 'periodically']),
      value: z.number().nonnegative().optional(),
      unit: z.enum(['sec', 'min']).optional()
    }),
    dontShow: z.object({ afterWin: z.boolean(), afterShows: z.number().nonnegative().nullable() }),
    limits: z.object({ afterWin: z.boolean(), afterShows: z.number().nonnegative().nullable() }),
    schedule: z.object({
      date: z.object({ enabled: z.boolean(), value: z.string() }),
      time: z.object({ enabled: z.boolean(), value: z.string() })
    })
  })
  .loose()
  .superRefine((val, ctx) => {
    if (val.showRules.scrollBelow.enabled && val.showRules.scrollBelow.percent == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['showRules', 'scrollBelow', 'percent'],
        message: 'percent обязателен, когда включено'
      })
    }
    if (val.showRules.afterOpen.enabled && val.showRules.afterOpen.seconds == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['showRules', 'afterOpen', 'seconds'],
        message: 'seconds обязателен, когда включено'
      })
    }
    if (val.frequency.mode === 'periodically') {
      if (typeof val.frequency.value === 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['frequency', 'value'],
          message: 'value обязателен при periodically'
        })
      }
      if (typeof val.frequency.unit === 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['frequency', 'unit'],
          message: 'unit обязателен при periodically'
        })
      }
    }
  })

export const FieldsSchema = z
  .object({
    brandingEnabled: z.boolean(),
    companyLogo: z.object({
      enabled: z.boolean(),
      fileName: z.string().optional(),
      url: z.url('Файл отсутствует или некорректен').optional()
    }),
    template: z.object({
      enabled: z.boolean(),
      key: z.string().min(1, 'Выберите шаблон').optional(),
      templateSettings: z
        .object({
          image: z
            .object({
              enabled: z.boolean().optional(),
              fileName: z.string().optional(),
              url: z.url().optional()
            })
            .optional(),
          contentPosition: z.enum(['left', 'right']),
          colorScheme: z.enum(['primary', 'custom']),
          customColor: z.string().optional(),
          windowFormat: WindowFormatSchema.optional()
        })
        .optional()
    }),
    formTexts: z.object({
      title: z.object({ text: z.string(), color: z.string() }),
      description: z.object({ text: z.string(), color: z.string() }),
      button: z.object({
        text: z.string(),
        color: z.string(),
        backgroundColor: z.string(),
        icon: z.string()
      })
    }),
    countdown: z.object({ enabled: z.boolean(), endDate: z.any().optional() }),
    contacts: z.object({
      phone: z.object({ enabled: z.boolean(), required: z.boolean() }),
      email: z.object({ enabled: z.boolean(), required: z.boolean() }),
      name: z.object({ enabled: z.boolean(), required: z.boolean() })
    }),
    agreement: z.object({
      enabled: z.boolean(),
      text: z.string(),
      policyUrl: z.string(),
      agreementUrl: z.string(),
      color: z.string()
    }),
    adsInfo: z.object({
      enabled: z.boolean().optional(),
      text: z.string(),
      policyUrl: z.string(),
      color: z.string()
    }),
    link: z.string().optional(),
    border: z
      .object({
        enabled: z.boolean(),
        color: z.string()
      })
      .optional(),
    messages: z.object({
      onWin: z.object({
        enabled: z.boolean(),
        text: z.string(),
        textSize: z.number().nonnegative(),
        description: z.string(),
        descriptionSize: z.number().nonnegative(),
        discount: z.string().optional(),
        discountSize: z.number().nonnegative().optional(),
        promo: z.string().optional(),
        promoSize: z.number().nonnegative().optional(),
        colorScheme: z.object({
          enabled: z.boolean(),
          scheme: ColorSchemeEnum,
          discount: z
            .object({
              color: z.string(),
              bgColor: z.string()
            })
            .optional(),
          promo: z
            .object({
              color: z.string(),
              bgColor: z.string()
            })
            .optional()
        })
      })
    })
  })
  .loose()
  .superRefine((val, ctx) => {
    if (val.template.enabled) {
      if (!val.template.key || val.template.key.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['template', 'key'],
          message: 'Выберите шаблон'
        })
      }
      if (typeof val.template.templateSettings !== 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['template', 'templateSettings'],
          message: 'templateSettings недопустимы при enabled=true'
        })
      }
    } else {
      if (typeof val.template.templateSettings === 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['template', 'templateSettings'],
          message: 'templateSettings обязателен при enabled=false'
        })
      }
      if (typeof val.template.key !== 'undefined') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['template', 'key'],
          message: 'key недопустим при enabled=false'
        })
      }
      const ts = val.template.templateSettings
      if (ts) {
        if (ts.colorScheme === 'custom' && (!ts.customColor || ts.customColor.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['template', 'templateSettings', 'customColor'],
            message: 'customColor обязателен при colorScheme=custom'
          })
        }
        if (ts.image?.enabled && !ts.image?.url) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['template', 'templateSettings', 'image', 'url'],
            message: 'Файл отсутствует или некорректен'
          })
        }
      }
    }
    if (val.agreement.enabled) {
      if (!val.agreement.text || val.agreement.text.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['agreement', 'text'],
          message: 'Текст обязателен'
        })
      }
      if (!val.agreement.policyUrl || val.agreement.policyUrl.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['agreement', 'policyUrl'],
          message: 'URL обязателен'
        })
      }
    }
    if (val.adsInfo.enabled) {
      if (!val.adsInfo.text || val.adsInfo.text.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['adsInfo', 'text'],
          message: 'Текст обязателен'
        })
      }
      if (!val.adsInfo.policyUrl || val.adsInfo.policyUrl.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['adsInfo', 'policyUrl'],
          message: 'URL обязателен'
        })
      }
    }
  })

export const IntegrationSchema = z.object({ scriptSnippet: z.string() }).loose()
export const LooseSurfaceSchema = z.object({}).passthrough()

export type SurfaceSchemas = {
  fields?: z.ZodTypeAny
  display?: z.ZodTypeAny
  integration?: z.ZodTypeAny
}

const resolveSurface = (surfaces: SurfaceSchemas | undefined, key: keyof SurfaceSchemas) => {
  if (surfaces && surfaces[key]) return surfaces[key]!
  if (key === 'fields') return FieldsSchema
  if (key === 'display') return DisplaySchemaBase
  return IntegrationSchema
}

export const buildWidgetSettingsSchema = (
  widgetType: WidgetTypeId,
  widgetSchema: z.ZodTypeAny,
  surfaces?: SurfaceSchemas
) =>
  z.object({
    id: z.string(),
    widgetType: z.literal(widgetType),
    widget: widgetSchema,
    display: resolveSurface(surfaces, 'display'),
    fields: resolveSurface(surfaces, 'fields'),
    integration: resolveSurface(surfaces, 'integration')
  })


export const IconEnum = z.enum([
  "Balloon",
  "Basket",
  "Fish",
  "Flame",
  "Flower",
  "GameController",
  "Hammer",
  "Heart",
  "Key",
  "Moon",
  "Nuclear",
  "Paw",
  "Pizza",
  "Restaurant",
  "Rocket",
  "Send",
  "Sparkles",
  "Star",
  "Sunny",
  "Reload",
  "HeartDislike"
])

export type Icon = z.infer<typeof IconEnum>
