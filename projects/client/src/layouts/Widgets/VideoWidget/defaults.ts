import type {
  DisplaySettings,
  FieldsSettings,
  IntegrationSettings,
} from '@/stores/widgetSettings/types'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { buildFieldsSettings } from '@/layouts/Widgets/Common/formDefaults'
import type {
  VideoWidgetType,
} from '@lemnity/widget-config/widgets/video-widget'

export const videoWidgetDefaults: VideoWidgetType = {
  type: WidgetTypeEnum.VIDEO_WIDGET,
  appearence: {
    companyLogoEnabled: true,
    companyLogoUrl: undefined,
    companyLogoSize: 36,

    colorScheme: 'primary',
    backgroundColor: '#000000',
    borderRadius: 18,

    position: 'bottom-right',
  },
  videoSettings: {
    videos: [],

    posterEnabled: false,
    posterUrl: undefined,

    muted: true,
    loop: true,

    showControls: true,
    showProgressBar: true,
  },
  infoSettings: {
    title: 'Супер акция!\nТолько сегодня скидка до 40 %',
    titleFontWeight: 'bold',
    titleColor: '#FFFFFF',

    buttonText: 'Получить скидку',
    buttonFontColor: '#000000',
    buttonBackgroundColor: '#FFB400',
    icon: 'HeartDislike',
    link: 'https://lemnity.ru',
  },
  mobileSettings: {
    mobileEnabled: true,
    triggerType: 'button',
    triggerText: 'Смотреть видео',
    triggerBackgroundColor: '#FFB34F',
    triggerFontColor: '#000000',
    imageUrl: 'https://app.lemnity.ru/uploads/images/2026/01/57534833-dc83-4a33-9108-79c952ca1940-sparkles.svg',
  },
  formEnabled: true,
  formTitleFontSize: 28,
  brandingEnabled: true,
}

export const buildVideoWidgetSettings = (): VideoWidgetType =>
  videoWidgetDefaults

export const buildVideoWidgetFieldsSettings = (): FieldsSettings =>
  buildFieldsSettings({
    formTexts: {
      title: {
        text: 'Оставьте заявку и мы вам перезвоним',
        color: '#000000',
      },
      description: { text: '', color: '#000000' },
      button: {
        text: 'Получить скидку',
        color: '#FFFFFF',
        backgroundColor: '#FFB400',
        icon: 'rocket',
      },
    },
  })
export const buildVideoWidgetDisplaySettings = (): DisplaySettings =>
  ({}) as DisplaySettings
export const buildVideoWidgetIntegrationSettings = (): IntegrationSettings =>
  ({}) as IntegrationSettings
