import CustomSwitch from '@/components/CustomSwitch'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

// «Анимация кнопки» — отдельный блок (перенесён на вкладку «Отображение»).
const ChatButtonAnimationSettings = () => {
  const triggerPulse = useWidgetSettingsStore(
    s => (s.settings?.widget as ChatWidgetType).triggerPulse ?? defaults.triggerPulse ?? false
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
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
  )
}

export default ChatButtonAnimationSettings
