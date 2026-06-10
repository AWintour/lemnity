import SwitchableField from '@/components/SwitchableField'
import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'

const WheelEventField = () => {
  const { settings, setWheelEventMode } = useWheelOfFortuneSettings()

  return (
    <SwitchableField
      title="Событие"
      enabled={settings?.eventMode ?? false}
      onToggle={setWheelEventMode}
    >
      <p className="text-[13px] text-[#AAAAAA] leading-snug">
        Режим для офлайн-мероприятий: колесо можно крутить и заполнять форму без
        ограничений — после каждого приза оно сбрасывается к форме для следующего
        участника.
      </p>
    </SwitchableField>
  )
}

export default WheelEventField
