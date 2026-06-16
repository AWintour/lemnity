import { useShallow } from 'zustand/react/shallow'

import { TriggerSettings } from '@/components'
import CustomSwitch from '@/components/CustomSwitch'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'

import type { Icon } from '@lemnity/widget-config/widgets/base'
import type {
  ChatWidgetType,
  Position,
} from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ChatWidgetSettings = () => {
  const {
    triggerText,
    triggerFontColor,
    triggerIcon,
    triggerBackgroundColor,
    triggerPosition,
    triggerPulse,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const settings = (s.settings?.widget as ChatWidgetType)

      return {
        triggerText: settings.triggerText
          ?? defaults.triggerText,
        triggerFontColor: settings.triggerFontColor
          ?? defaults.triggerFontColor,
        triggerIcon: settings.triggerIcon
          ?? defaults.triggerIcon,
        triggerBackgroundColor: settings.triggerBackgroundColor
          ?? defaults.triggerBackgroundColor,
        triggerPosition: settings.triggerPosition
          ?? defaults.triggerPosition,
        triggerPulse: settings.triggerPulse ?? defaults.triggerPulse ?? false,
      }
    })
  )

  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
    <div className='w-full min-w-122 flex flex-col gap-2.5'>
      <TriggerSettings
        triggerText={triggerText}
        triggerFontColor={triggerFontColor}
        triggerBackgroundColor={triggerBackgroundColor}
        triggerIcon={triggerIcon}
        triggerPosition={triggerPosition}
        onTriggerTextChange={(triggerText: string) => setChatPatch({ triggerText })}
        onTriggerFontColorChange={(triggerFontColor: string) => setChatPatch({ triggerFontColor })}
        onTriggerBackgroundColorChange={(triggerBackgroundColor: string) =>
          setChatPatch({ triggerBackgroundColor })}
        onTriggerIconChange={(triggerIcon: Icon) => setChatPatch({ triggerIcon })}
        onTriggerPositionChange={(triggerPosition: Position) => setChatPatch({ triggerPosition })}
      />

      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex flex-col">
          <span className="text-[16px] text-[#1A1A1A]">Анимация кнопки</span>
          <span className="text-[13px] text-[#9A9A9A]">Расходящиеся волны привлекают внимание.</span>
        </div>
        <CustomSwitch
          size="sm"
          isSelected={triggerPulse}
          onValueChange={(v: boolean) => setChatPatch({ triggerPulse: v })}
          selectedColor="!bg-[#5951E5]"
        />
      </div>
    </div>
  )
}

export default ChatWidgetSettings
