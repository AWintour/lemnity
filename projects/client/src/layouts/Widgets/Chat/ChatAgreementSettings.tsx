import { useShallow } from 'zustand/react/shallow'

import AgreementAndPolicy from '@/components/AgreementAndPolicy'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { ChatWidgetType } from '@lemnity/widget-config/widgets/chat'
import { chatWidgetDefaults as defaults } from './defaults'

const AGREEMENT_DEFAULTS = defaults.agreement!

// Блок «Согласие и политика» — переиспользует общий компонент настроек.
const ChatAgreementSettings = () => {
  const agreement = useWidgetSettingsStore(
    useShallow(s => (s.settings?.widget as ChatWidgetType).agreement ?? AGREEMENT_DEFAULTS)
  )
  const setChatPatch = useWidgetSettingsStore(s => s.setChatPatch)

  const patch = (p: Partial<typeof agreement>) => setChatPatch({ agreement: { ...agreement, ...p } })

  return (
    <AgreementAndPolicy
      variant="agreement"
      agreement={agreement}
      errorPath="widget.agreement"
      onToggle={enabled => patch({ enabled })}
      onFontColorChange={color => patch({ color })}
      onAgreementUrlChange={agreementUrl => patch({ agreementUrl })}
      onPolicyUrlChange={policyUrl => patch({ policyUrl })}
    />
  )
}

export default ChatAgreementSettings
