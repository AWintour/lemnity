import { useShallow } from 'zustand/react/shallow'

import MobileVersionSettings from '@/components/settings/MobileVersionSettings'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type {
  ChatWidgetType,
  MobileSettings,
  MobileTrigger,
} from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

// Дефолт «Мобильной версии» — стабильная ссылка для фолбэков (в схеме поле опционально).
const MOBILE_DEFAULTS = defaults.mobileSettings!

// Блок «Мобильная версия» — вынесен отдельным компонентом, чтобы рендерить на вкладке «Отображение».
const ChatMobileVersionSettings = () => {
  const {
    mobileEnabled,
    mobileTriggerType,
    mobileImageUrl,
    mobileTriggerText,
    mobileTriggerFontColor,
    mobileTriggerBackgroundColor,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const mobile = (s.settings?.widget as ChatWidgetType).mobileSettings ?? MOBILE_DEFAULTS
      return {
        // Плоские поля — иначе useShallow видит новую ссылку каждый рендер → цикл.
        mobileEnabled: mobile.mobileEnabled,
        mobileTriggerType: mobile.triggerType,
        mobileImageUrl: mobile.imageUrl,
        mobileTriggerText: mobile.triggerText,
        mobileTriggerFontColor: mobile.triggerFontColor,
        mobileTriggerBackgroundColor: mobile.triggerBackgroundColor,
      }
    })
  )

  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  // setChatPatch мёржит поверхностно, поэтому собираем полный объект mobileSettings.
  const patchMobile = (partial: Partial<MobileSettings>) =>
    setChatPatch({
      mobileSettings: {
        mobileEnabled,
        triggerType: mobileTriggerType,
        imageUrl: mobileImageUrl,
        triggerText: mobileTriggerText,
        triggerFontColor: mobileTriggerFontColor,
        triggerBackgroundColor: mobileTriggerBackgroundColor,
        ...partial,
      },
    })

  return (
    <MobileVersionSettings
      enabled={mobileEnabled}
      triggerType={mobileTriggerType}
      imageUrl={mobileImageUrl}
      triggerText={mobileTriggerText}
      triggerFontColor={mobileTriggerFontColor}
      triggerBackgroundColor={mobileTriggerBackgroundColor}
      onToggle={(mobileEnabled: boolean) => patchMobile({ mobileEnabled })}
      onTriggerTypeChange={(triggerType: MobileTrigger) => patchMobile({ triggerType })}
      onImageUrlChange={(imageUrl: string | undefined) => patchMobile({ imageUrl })}
      onTriggerTextChange={(triggerText: string) => patchMobile({ triggerText })}
      onTriggerFontColorChange={(triggerFontColor: string) => patchMobile({ triggerFontColor })}
      onTriggerBackgroundColorChange={(triggerBackgroundColor: string) =>
        patchMobile({ triggerBackgroundColor })}
    />
  )
}

export default ChatMobileVersionSettings
