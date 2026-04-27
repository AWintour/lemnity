import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { ButtonPositionChooser } from '@/components'
import useDisplayTriggerSettings from './hooks/useDisplayTriggerSettings'
import type { PositionType } from '@lemnity/widget-config/features/trigger'

const ALLOWED_POSITIONS: PositionType[] = ['bottom-left', 'bottom-right']

const EventTimerDisplaySettings = () => {
  const {
    triggerPosition,
    onTriggerPositionChange,
  } = useDisplayTriggerSettings()

  return (
    <div
      className='w-full flex flex-col gap-2.5'
    >
      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <ButtonPositionChooser
            noBorder
            noPadding
            value={triggerPosition}
            options={ALLOWED_POSITIONS}
            onChange={onTriggerPositionChange}
          />
        </div>
      </BorderedContainer>
    </div>
  )
}

export default EventTimerDisplaySettings
