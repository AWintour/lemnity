import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

const textareaCx = cn(
  'w-full resize-none rounded-[12px] border border-[#E4E4E7] px-4 py-3.5',
  'text-[18px] leading-6 text-[#1A1A1A] outline-none focus:border-[#5951E5]',
)

const ChatInfoHeadingsSettings = () => {
  const { onlineMessage, onlineMessageEnabled, offlineMessage, offlineMessageEnabled } =
    useWidgetSettingsStore(
      useShallow(s => {
        const w = s.settings?.widget as ChatWidgetType
        return {
          onlineMessage: w.onlineMessage ?? defaults.onlineMessage,
          onlineMessageEnabled: w.onlineMessageEnabled ?? defaults.onlineMessageEnabled ?? true,
          offlineMessage: w.offlineMessage ?? defaults.offlineMessage,
          offlineMessageEnabled: w.offlineMessageEnabled ?? defaults.offlineMessageEnabled ?? true,
        }
      })
    )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
              Информационный заголовок онлайн
            </span>
            <CustomSwitch
              size="sm"
              isSelected={onlineMessageEnabled}
              onValueChange={v => setChatPatch({ onlineMessageEnabled: v })}
              selectedColor={ACCENT}
            />
          </div>
          <textarea
            value={onlineMessage}
            onChange={e => setChatPatch({ onlineMessage: e.target.value })}
            rows={2}
            disabled={!onlineMessageEnabled}
            className={cn(textareaCx, 'font-semibold', !onlineMessageEnabled && 'opacity-50')}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
              Информационный заголовок офлайн
            </span>
            <CustomSwitch
              size="sm"
              isSelected={offlineMessageEnabled}
              onValueChange={v => setChatPatch({ offlineMessageEnabled: v })}
              selectedColor={ACCENT}
            />
          </div>
          <textarea
            value={offlineMessage}
            onChange={e => setChatPatch({ offlineMessage: e.target.value })}
            rows={3}
            disabled={!offlineMessageEnabled}
            className={cn(textareaCx, !offlineMessageEnabled && 'opacity-50')}
          />
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatInfoHeadingsSettings
