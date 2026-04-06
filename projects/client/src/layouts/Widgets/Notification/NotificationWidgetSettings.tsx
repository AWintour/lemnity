import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { TriggerSettings, DisableBranding } from '@/components'
import NotificationSettings from './NotificationSettings'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectTriggerText,
  selectTriggerFontColor,
  selectTriggerIcon,
  selectTriggerBackgroundColor,
  selectTriggerPosition,
  selectBrandingEnabled,
  selectFetchStatus,
  fetchNotificationWidget,
  triggerTextChanged,
  triggerFontColorChanged,
  triggerIconChanged,
  triggerBackgroundColorChanged,
  triggerPositionChanged,
  brandingEnabledChanged,
} from './notificationSlice'

import type {
  Position,
} from '@lemnity/widget-config/widgets/notification'
import type { Icon } from '@lemnity/widget-config/widgets/base'

const NotificationWidgetSettings = () => {
  const dispatch = useAppDispatch()

  const triggerText = useAppSelector(selectTriggerText)
  const triggerFontColor = useAppSelector(selectTriggerFontColor)
  const triggerIcon = useAppSelector(selectTriggerIcon)
  const triggerBackgroundColor = useAppSelector(selectTriggerBackgroundColor)
  const triggerPosition = useAppSelector(selectTriggerPosition)
  const brandingEnabled = useAppSelector(selectBrandingEnabled)
  const fetchStatus = useAppSelector(selectFetchStatus)

  const { widgetId } = useParams()

  useEffect(() => {
    if (fetchStatus === 'idle' && widgetId && widgetId.length > 0) {
      dispatch(fetchNotificationWidget({ widgetId }))
    }
  }, [fetchStatus, dispatch, widgetId])

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
