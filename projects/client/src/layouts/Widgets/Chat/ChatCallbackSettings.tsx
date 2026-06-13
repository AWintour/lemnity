import { useShallow } from 'zustand/react/shallow'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

// Блок «Обратный звонок» — сам виджет «Скоро» (тумблер неактивен), но внутри уже доступна
// настройка «Отложенный звонок».
const ChatCallbackSettings = () => {
  const deferredCall = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).deferredCall ?? defaults.deferredCall)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Обратный звонок</span>
          <div className="flex items-center gap-3">
            <span className="text-[14px] leading-4 text-[#9A9A9A] bg-[#F1F1F4] rounded-full px-3 py-1.5">
              Скоро
            </span>
            <CustomSwitch size="sm" isSelected={false} isDisabled selectedColor={ACCENT} />
          </div>
        </div>
        <p className="text-[16px] leading-6 text-[#9A9A9A]">
          Посетитель сможет заказать обратный звонок прямо из чата. Функция скоро появится.
        </p>

        {/* Отложенный звонок */}
        <div className="rounded-[12px] border border-[#ECECEC] p-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-4">
            <span className="text-[18px] leading-5.5 font-medium text-[#1A1A1A]">Отложенный звонок</span>
            <CustomSwitch
              size="sm"
              isSelected={deferredCall}
              onValueChange={v => setChatPatch({ deferredCall: v })}
              selectedColor={ACCENT}
            />
          </div>
          <p className="text-[16px] leading-5.5 text-[#9A9A9A]">
            Посетитель оставляет удобное время для звонка и номер телефона, если не указал его в форме.
          </p>
        </div>
      </div>
    </BorderedContainer>
  )
}

export default ChatCallbackSettings
