import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'

import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import CustomSwitch from '@/components/CustomSwitch'
import { Input } from '@/components'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const ACCENT = '!bg-[#5951E5]'

const ChatCompanyContactsSettings = () => {
  const contactsTab = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).contactsTab ?? defaults.contactsTab)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const patch = (p: Partial<ChatWidgetType['contactsTab']>) =>
    setChatPatch({ contactsTab: { ...contactsTab, ...p } })

  return (
    <BorderedContainer>
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[20px] leading-6 font-semibold text-[#1A1A1A]">Контакты компании</span>
          <CustomSwitch
            size="sm"
            isSelected={contactsTab.enabled}
            onValueChange={v => patch({ enabled: v })}
            selectedColor={ACCENT}
          />
        </div>

        <AnimatePresence initial={false}>
          {contactsTab.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex flex-col gap-1.5">
                  <span className="text-base leading-3.75 text-[#1A1A1A]">Адрес</span>
                  <Input value={contactsTab.address} onValueChange={v => patch({ address: v })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-base leading-3.75 text-[#1A1A1A]">Телефон</span>
                  <Input value={contactsTab.phone} onValueChange={v => patch({ phone: v })} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-base leading-3.75 text-[#1A1A1A]">Email</span>
                  <Input value={contactsTab.email} onValueChange={v => patch({ email: v })} />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BorderedContainer>
  )
}

export default ChatCompanyContactsSettings
