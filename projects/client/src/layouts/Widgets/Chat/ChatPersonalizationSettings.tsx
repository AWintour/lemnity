import { useShallow } from 'zustand/react/shallow'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

const ChatPersonalizationSettings = () => {
  const enabled = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).personalizedGreetings ?? defaults.personalizedGreetings)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">
            Персонализированные приветствия
          </span>
          <CustomSwitch
            size="sm"
            isSelected={enabled}
            onValueChange={v => setChatPatch({ personalizedGreetings: v })}
            selectedColor={ACCENT}
          />
        </div>
        <p className="text-[16px] leading-6 text-[#9A9A9A]">
          Виджет «узнает» пользователя (по cookies или аккаунту) и показывает сообщение вида
          «Снова здравствуйте, Иван! Нужна помощь с выбором ноутбука?».
        </p>
      </div>
    </BorderedContainer>
  )
}

export default ChatPersonalizationSettings
