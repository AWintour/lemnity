import SwitchableField from '@/components/SwitchableField'
import ColorPicker from '@/components/ColorPicker'

type RewardScreenColorsProps = {
  enabled: boolean
  discountBackgroundColor: string
  promoBackgroundColor: string
  onToggle: (nextEnabled: boolean) => void
  onDiscountBackgrounfColorChange: (value: string) => void
  onPromoBackgroundColorChange: (value: string) => void
}

const RewardScreenColors = (props: RewardScreenColorsProps) => {
  return (
    <SwitchableField
      title="Цветовая гамма"
      enabled={props.enabled}
      onToggle={props.onToggle}
      classNames={{
        title: 'text-[16px] leading-4.75 font-normal',
      }}
    >
      <div className="flex flex-col gap-2.5">
        {props.enabled && (
          <div className="w-full flex flex-col gap-2.5">
            <div className="w-full flex flex-row flex-wrap gap-2.5">
              <ColorPicker
                initialColor={props.discountBackgroundColor}
                onColorChange={props.onDiscountBackgrounfColorChange}
                triggerText="Цвет поля скидки"
                classNames={{ triggerButton: 'min-w-64' }}
              />
              <ColorPicker
                initialColor={props.promoBackgroundColor}
                onColorChange={props.onPromoBackgroundColorChange}
                triggerText="Цвет поля промокод"
                classNames={{ triggerButton: 'min-w-64' }}
              />
            </div>
          </div>
        )}
      </div>
    </SwitchableField>
  )
}

export default RewardScreenColors
