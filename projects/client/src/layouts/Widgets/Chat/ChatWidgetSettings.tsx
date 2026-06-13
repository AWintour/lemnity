import { useShallow } from 'zustand/react/shallow'

import { TriggerSettings } from '@/components'

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
    </div>
  )
}

export default ChatWidgetSettings
