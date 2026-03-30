import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import ButtonAppearenceSettings from '@/layouts/WidgetSettings/DisplaySettingsTab/ButtonAppearenceSettings/ButtonAppearenceSettings'
import ButtonPositionChooser from '@/components/ButtonPositionChooser'

import type { ButtonPosition } from '@/components/ButtonPositionChooser'
import type { Icon } from '@lemnity/widget-config/widgets/base'
import type { Position } from '@lemnity/widget-config/widgets/notification'

const ALLOWED_POSITIONS: ButtonPosition[] = ['bottom-left', 'bottom-right']

type TriggerSettingsProps = {
  triggerText: string
  triggerFontColor: string
  triggerIcon?: Icon
  triggerBackgroundColor: string
  triggerPosition: Position
  onTriggerTextChange: (text: string) => void
  onTriggerFontColorChange: (color: string) => void
  onTriggerIconChange?: (icon: Icon) => void
  onTriggerBackgroundColorChange: (color: string) => void
  onTriggerPositionChange: (position: Position) => void
}

const TriggerSettings = (props: TriggerSettingsProps) => {
  return (
    <BorderedContainer>
      <div className='w-full flex flex-col gap-6'>
        <h2 className='text-[16px] leading-4.75 font-medium'>Форма</h2>

        <div className='w-full flex flex-col gap-2.5'>
          <span className='leading-4.75'>Кнопка</span>

          <ButtonAppearenceSettings
            buttonIcon={props.triggerIcon}
            buttonText={props.triggerText}
            buttonBackgroundColor={props.triggerBackgroundColor}
            buttonTextColor={props.triggerFontColor}
            onBackgroundColorChange={props.onTriggerBackgroundColorChange}
            onFontColorChange={props.onTriggerFontColorChange}
            onTriggerTextChange={props.onTriggerTextChange}
            onTriggerIconChange={props.onTriggerIconChange}
          />
          <ButtonPositionChooser
            noBorder
            noPadding
            value={props.triggerPosition}
            options={ALLOWED_POSITIONS}
            // ButtonPosition is a superset of Position
            // i do not want to create a wrapper just to handle this case
            onChange={props.onTriggerPositionChange as (p: ButtonPosition) => void}
          />
        </div>
      </div>
    </BorderedContainer>
  )
}

export default TriggerSettings
