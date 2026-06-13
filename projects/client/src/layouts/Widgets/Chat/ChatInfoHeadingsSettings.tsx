import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const textareaCx = cn(
  'w-full resize-none rounded-[12px] border border-[#E4E4E7] px-4 py-3.5',
  'text-[18px] leading-6 text-[#1A1A1A] outline-none focus:border-[#5951E5]',
)

const ChatInfoHeadingsSettings = () => {
  const { onlineMessage, offlineMessage } = useWidgetSettingsStore(
    useShallow(s => {
      const w = s.settings?.widget as ChatWidgetType
      return {
        onlineMessage: w.onlineMessage ?? defaults.onlineMessage,
        offlineMessage: w.offlineMessage ?? defaults.offlineMessage,
      }
    })
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
            Информационный заголовок онлайн
          </span>
          <textarea
            value={onlineMessage}
            onChange={e => setChatPatch({ onlineMessage: e.target.value })}
            rows={2}
            className={cn(textareaCx, 'font-semibold')}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[18px] leading-5.5 text-[#1A1A1A]">
            Информационный заголовок офлайн
          </span>
          <textarea
            value={offlineMessage}
            onChange={e => setChatPatch({ offlineMessage: e.target.value })}
            rows={3}
            className={textareaCx}
          />
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatInfoHeadingsSettings
