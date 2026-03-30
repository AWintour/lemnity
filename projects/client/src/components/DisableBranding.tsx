import { cn } from '@heroui/theme'
import SwitchableField from '@/components/SwitchableField'

type DisableBrandingProps = {
  enabled: boolean
  onBrandingEnabledToggle: (enabled: boolean) => void
}

const DisableBranding = (props: DisableBrandingProps) => {
  return (
    <SwitchableField
      title="Брендинг"
      switchLabel="Функция доступна для бизнес тарифа. Оплатить"
      enabled={props.enabled}
      onToggle={props.onBrandingEnabledToggle}
    >
      <div
        className={cn(
          'border border-[#C0C0C0] rounded-[3.38px] px-2.5',
          'flex flex-row items-center text-left h-7.5'
        )}
      >
        <span className="text-[#AAAAAA] text-[16px] leading-4.75">
          Сделано на Lemnity
        </span>
      </div>
    </SwitchableField>
  )
}

export default DisableBranding
