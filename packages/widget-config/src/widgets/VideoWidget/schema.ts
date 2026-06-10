import { z } from 'zod'
import {
  IconEnum,
  ColorSchemeEnum,
  LooseSurfaceSchema,
  type WidgetTypeId,
  buildWidgetSettingsSchema
} from '../base.js'

const WidgetType: WidgetTypeId = 'VIDEO_WIDGET'

const FontWeightEnum = z.enum(['regular', 'medium', 'bold'])
const MobileTriggerEnum = z.enum(['image', 'button'])
const PositionEnum = z.enum(['bottom-left', 'bottom-right'])

export type Icon = z.infer<typeof IconEnum>
export type FontWeight = z.infer<typeof FontWeightEnum>
export type MobileTrigger = z.infer<typeof MobileTriggerEnum>
export type Position = z.infer<typeof PositionEnum>

const WidgetAppearenceSchema = z.object({
  companyLogoEnabled: z.boolean(),
  companyLogoUrl: z.string().optional(),

  colorScheme: ColorSchemeEnum,
  backgroundColor: z.string().optional(),
  borderRadius: z.number(),

  // Расположение виджета на странице
  position: PositionEnum,
})

export type WidgetAppearence = z.infer<typeof WidgetAppearenceSchema>

// Настройки самого видео (вертикальный сторис-плеер)
const VideoSettingsSchema = z.object({
  // До 3 видео, проигрываются по очереди (плейлист)
  videos: z.array(z.string()).max(3),

  // «Превью видео»: если включено — показываем постер и НЕ автозапускаем,
  // если выключено — видео проигрывается сразу
  posterEnabled: z.boolean(),
  posterUrl: z.string().optional(),

  muted: z.boolean(),
  loop: z.boolean(),

  showControls: z.boolean(),
  showProgressBar: z.boolean(),
})

export type VideoSettings = z.infer<typeof VideoSettingsSchema>

// Нижний оверлей: заголовок + CTA-кнопка
const InfoSettingsSchema = z.object({
  title: z.string(),
  titleFontWeight: FontWeightEnum,
  titleColor: z.string(),

  buttonText: z.string(),
  buttonFontColor: z.string(),
  buttonBackgroundColor: z.string(),
  icon: IconEnum,
  link: z.string(),
})

export type InfoSettings = z.infer<typeof InfoSettingsSchema>

const MobileSchema = z.object({
  mobileEnabled: z.boolean(),
  triggerType: MobileTriggerEnum,
  imageUrl: z.string().optional(),
  triggerText: z.string(),
  triggerFontColor: z.string(),
  triggerBackgroundColor: z.string(),
})

const VideoWidgetSchema = z.object({
  type: z.literal(WidgetType),
  appearence: WidgetAppearenceSchema,
  videoSettings: VideoSettingsSchema,
  infoSettings: InfoSettingsSchema,
  mobileSettings: MobileSchema,
  // Показывать ли форму захвата лида после нажатия CTA-кнопки
  formEnabled: z.boolean(),
  // Размер шрифта заголовка формы (px)
  formTitleFontSize: z.number().nonnegative(),
  brandingEnabled: z.boolean(),
})

export type VideoWidgetType = z.infer<typeof VideoWidgetSchema>

const customSurfaces = {
  fields: LooseSurfaceSchema,
  display: LooseSurfaceSchema,
  integration: LooseSurfaceSchema
} as const

export const videoWidgetSchema = buildWidgetSettingsSchema(
  WidgetType,
  VideoWidgetSchema,
  customSurfaces
)
