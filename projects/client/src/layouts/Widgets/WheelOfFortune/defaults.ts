import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { createDefaultSector } from './createDefaultSector'
import type { WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
import { buildFieldsSettings } from '@/layouts/Widgets/Common/formDefaults'

const MIN_SECTORS = 4

export const buildWheelWidgetSettings = (): WheelOfFortuneWidgetSettings => ({
  type: WidgetTypeEnum.WHEEL_OF_FORTUNE,
  sectors: {
    randomize: false,
    items: Array.from({ length: MIN_SECTORS }).map(createDefaultSector)
  },
  borderColor: '#0F52E6',
  borderThickness: 12,
  eventMode: false
})

export const buildWheelFieldsSettings = () =>
  buildFieldsSettings({
    formTexts: {
      title: { text: 'Получите скидку в честь дня рождения компании', color: '#FFFFFF' },
      description: {
        text: 'Введите номер вашего телефона, крутите ленту и получите бонус',
        color: '#FFFFFF'
      },
      button: {
        text: 'Получить скидку',
        color: '#FFFFFF',
        backgroundColor: '#0F52E6',
        icon: 'rocket'
      }
    }
  })
