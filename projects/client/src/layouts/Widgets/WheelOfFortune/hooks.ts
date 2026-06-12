import { useMemo } from 'react'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import type { WheelOfFortuneWidgetSettings } from '@/stores/widgetSettings/types'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'

export const useWheelOfFortuneSettings = () => {
  const widget = useWidgetSettingsStore(s => s?.settings?.widget)
  const setWheelRandomize = useWidgetSettingsStore(s => s.setWheelRandomize)
  const setWheelSectors = useWidgetSettingsStore(s => s.setWheelSectors)
  const updateWheelSector = useWidgetSettingsStore(s => s.updateWheelSector)
  const addWheelSector = useWidgetSettingsStore(s => s.addWheelSector)
  const deleteWheelSector = useWidgetSettingsStore(s => s.deleteWheelSector)
  const setWheelBorderColor = useWidgetSettingsStore(s => s.setWheelBorderColor)
  const setWheelBorderThickness = useWidgetSettingsStore(s => s.setWheelBorderThickness)
  const setWheelEventMode = useWidgetSettingsStore(s => s.setWheelEventMode)

  const settings = isWheelLikeWidgetType(widget?.type)
    ? (widget as WheelOfFortuneWidgetSettings)
    : null
  return useMemo(
    () => ({
      settings,
      setWheelRandomize,
      setWheelSectors,
      updateWheelSector,
      addWheelSector,
      deleteWheelSector,
      setWheelBorderColor,
      setWheelBorderThickness,
      setWheelEventMode
    }),
    [
      settings,
      setWheelRandomize,
      setWheelSectors,
      updateWheelSector,
      addWheelSector,
      deleteWheelSector,
      setWheelBorderColor,
      setWheelBorderThickness,
      setWheelEventMode
    ]
  )
}
