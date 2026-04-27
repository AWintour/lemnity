import { DisplayTriggerSettings } from '@/components/settings'
import useDisplayTriggerSettings from './hooks/useDisplayTriggerSettings'

const ActionTimerDisplaySettings = () => {
  const triggerSettings = useDisplayTriggerSettings()

  console.log(triggerSettings)

  return (
    <div
      className='w-full flex flex-col gap-2.5'
    >
      <DisplayTriggerSettings {...triggerSettings} />
    </div>
  )
}

export default ActionTimerDisplaySettings
