import { useShallow } from 'zustand/react/shallow'

import { TriggerSettings, DisableBranding } from '@/components'
import NotificationSettings from './NotificationSettings'

// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectTriggerText,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerBackgroundColor,
  selectTriggerPosition,
  selectBrandingEnabled,
  triggerTextChanged,
  triggerFontColorChanged,
  triggerIconChanged,
  triggerBackgroundColorChanged,
  triggerPositionChanged,
  brandingEnabledChanged,
} from './notificationSlice'

import type {
  NotificationWidgetType,
  Position,
} from '@lemnity/widget-config/widgets/notification'
import type { Icon } from '@lemnity/widget-config/widgets/base'
// import { notificationWidgetDefaults as defaults } from './defaults'

const NotificationWidgetSettings = () => {
  const triggerText = useAppSelector(selectTriggerText)
  const triggerFontColor = useAppSelector(selectTriggerFontColor)
  const triggerIcon = useAppSelector(selectTriggerIcon)
  const triggerBackgroundColor = useAppSelector(selectTriggerBackgroundColor)
  const triggerPosition = useAppSelector(selectTriggerPosition)
  const brandingEnabled = useAppSelector(selectBrandingEnabled)

  const dispatch = useAppDispatch()
  // const {
  //   triggerText,
  //   triggerFontColor,
  //   triggerIcon,
  //   triggerBackgroundColor,
  //   triggerPosition,

  //   brandingEnabled,
  // } = useWidgetSettingsStore(
  //   useShallow(s => {
  //     const settings = (s.settings?.widget as NotificationWidgetType)
      
  //     return {
  //       triggerText: settings.triggerText
  //         ?? defaults.triggerText,
  //       triggerFontColor: settings.triggerFontColor
  //         ?? defaults.triggerFontColor,
  //       triggerIcon: settings.triggerIcon
  //         ?? defaults.triggerIcon,
  //       triggerBackgroundColor: settings.triggerBackgroundColor
  //         ?? defaults.triggerBackgroundColor,
  //       triggerPosition: settings.triggerPosition
  //         ?? defaults.triggerPosition,

  //       brandingEnabled: settings.brandingEnabled
  //         ?? defaults.brandingEnabled,
  //     }
  //   })
  // )

  const setTriggerText = (value: string) => {
    dispatch(triggerTextChanged(value))
  }
  const setTriggerFontColor = (value: string) => {
    dispatch(triggerFontColorChanged(value))
  }
  const setTriggerIcon = (value: Icon) => {
    dispatch(triggerIconChanged(value))
  }
  const setTriggerBackgroundColor = (value: string) => {
    dispatch(triggerBackgroundColorChanged(value))
  }
  const setTriggerPosition = (value: Position) => {
    dispatch(triggerPositionChanged(value))
  }
  const setBrandingEnabled = (value: boolean) => {
    dispatch(brandingEnabledChanged(value))
  }

  return (
    <div className='w-full min-w-122 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Настройка виджета
      </h1>

      <TriggerSettings
        triggerText={triggerText}
        triggerFontColor={triggerFontColor}
        triggerBackgroundColor={triggerBackgroundColor}
        triggerIcon={triggerIcon}
        triggerPosition={triggerPosition}
        onTriggerTextChange={setTriggerText}
        onTriggerFontColorChange={setTriggerFontColor}
        onTriggerBackgroundColorChange={setTriggerBackgroundColor}
        onTriggerIconChange={setTriggerIcon}
        onTriggerPositionChange={setTriggerPosition}
      />
      <NotificationSettings />
      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default NotificationWidgetSettings
