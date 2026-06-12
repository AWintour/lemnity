import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { createDefaultSector } from '@/layouts/Widgets/WheelOfFortune/createDefaultSector'
import type { ConveyorOfLuckWidgetSettings, DisplaySettings } from '@/stores/widgetSettings/types'
import { buildFieldsSettings } from '@/layouts/Widgets/Common/formDefaults'
import { buildStandardDisplaySettings } from '@/stores/widgetSettings/displayDefaults'

// «Конвейер Удачи» — клон «Колеса фортуны». Форма настроек идентична, отличается тип
// виджета (CONVEYOR_OF_LUCK) и хранилище спинов в БД.
const MIN_SECTORS = 4

export const buildConveyorWidgetSettings = (): ConveyorOfLuckWidgetSettings => ({
  type: WidgetTypeEnum.CONVEYOR_OF_LUCK,
  sectors: {
    randomize: false,
    // Размер текста по умолчанию — 25, размер иконки — 52 (% стороны карточки).
    items: Array.from({ length: MIN_SECTORS }).map(() => ({
      ...createDefaultSector(),
      textSize: 25,
      iconSize: 52
    }))
  },
  borderColor: '#0F52E6',
  borderThickness: 12,
  cardRadius: 24,
  eventMode: false
})

export const buildConveyorFieldsSettings = () => {
  const fields = buildFieldsSettings({
    formTexts: {
      title: { text: 'Получите скидку', color: '#FFFFFF' },
      description: {
        text: 'Введите номер вашего телефона, крутите ленту и получите бонус',
        color: '#FFFFFF'
      },
      button: {
        text: 'Крутить ленту',
        color: '#FFFFFF',
        backgroundColor: '#FFBF1A',
        icon: 'reload'
      }
    }
  })
  // Раскладка как в макете: лента слева, форма справа.
  if (fields.template?.templateSettings) {
    fields.template.templateSettings.contentPosition = 'right'
  }
  return fields
}

// «Отображение» — как у колеса (стандартная поверхность), но лаунчер по умолчанию —
// «Кнопка» (а не картинка), чтобы виджет открывался кнопкой-триггером.
export const buildConveyorDisplaySettings = (): DisplaySettings => {
  const base = buildStandardDisplaySettings()
  return {
    ...base,
    icon: {
      ...base.icon,
      type: 'button',
      button: { text: 'Испытай удачу', buttonColor: '#5951E5', textColor: '#FFFFFF' }
    }
  }
}
