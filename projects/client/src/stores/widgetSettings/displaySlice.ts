import type {
  DisplayUpdater,
  StartShowing,
  IconType,
  ButtonPosition,
  HideIcon,
  DayKey,
  FrequencyMode,
  FrequencyUnit,
  DisplaySettings
} from './types'

export type DisplayActions = {
  setStartShowing: (v: StartShowing) => void
  setTimerDelay: (ms: number) => void
  setIconType: (v: IconType) => void
  setIconImage: (payload: { fileName: string; url: string } | null) => void
  setButtonPosition: (v: ButtonPosition) => void
  setHideIcon: (v: HideIcon) => void
  setWeekdaysEnabled: (enabled: boolean) => void
  setWeekdays: (days: DayKey[]) => void
  setWeekdaysOnly: (v: boolean) => void
  setShowOnExit: (v: boolean) => void
  setScrollBelow: (enabled: boolean, percent: number | null) => void
  setAfterOpen: (enabled: boolean, seconds: number | null) => void
  setFrequency: (mode?: FrequencyMode, value?: number, unit?: FrequencyUnit) => void
  setDontShow: (afterWin: boolean, afterShows?: number | null) => void
  setLimits: (afterWin: boolean, afterShows?: number | null) => void
  setButtonIcon: (text: string, buttonColor: string, textColor: string) => void
  setButtonIconName: (icon: string) => void
  setScheduleDate: (enabled: boolean, value?: string) => void
  setScheduleTime: (enabled: boolean, value?: string) => void
  setBrandingEnabled: (enabled: boolean) => void
}

export type DisplaySlice = {
  displaySettingsUpdater: DisplayUpdater
} & DisplayActions

export const createDisplaySlice = (updateDisplay: DisplayUpdater): DisplaySlice => {
  const patch = <K extends keyof DisplaySettings>(key: K, partial: Partial<DisplaySettings[K]>) =>
    updateDisplay(s => ({
      ...s,
      [key]: { ...(s[key] as object), ...(partial as object) } as DisplaySettings[K]
    }))

  return {
    displaySettingsUpdater: updateDisplay,
    setStartShowing: v => updateDisplay(s => ({ ...s, startShowing: v })),
    setTimerDelay: ms => patch('timer', { delayMs: ms }),
    setIconType: v => updateDisplay(s => ({ ...s, icon: { ...s.icon, type: v } })),
    setIconImage: payload =>
      updateDisplay(s => ({ ...s, icon: { ...s.icon, image: payload ?? undefined } })),
    setButtonPosition: v => updateDisplay(s => ({ ...s, icon: { ...s.icon, position: v } })),
    setHideIcon: v => updateDisplay(s => ({ ...s, icon: { ...s.icon, hide: v } })),
    setWeekdaysEnabled: enabled => patch('weekdays', { enabled }),
    setWeekdays: days => patch('weekdays', { days }),
    setWeekdaysOnly: v => patch('weekdays', { weekdaysOnly: v }),
    setShowOnExit: v => patch('showRules', { onExit: v }),
    setScrollBelow: (enabled, percent) =>
      updateDisplay(s => ({
        ...s,
        showRules: { ...s.showRules, scrollBelow: { enabled, percent } }
      })),
    setAfterOpen: (enabled, seconds) =>
      updateDisplay(s => ({
        ...s,
        showRules: { ...s.showRules, afterOpen: { enabled, seconds } }
      })),
    setFrequency: (mode, value, unit) =>
      updateDisplay(s => ({
        ...s,
        frequency: {
          mode: mode ?? s.frequency.mode,
          value: typeof value === 'undefined' ? s.frequency.value : value,
          unit: typeof unit === 'undefined' ? s.frequency.unit : (unit as FrequencyUnit)
        }
      })),
    setDontShow: (afterWin, afterShows) =>
      updateDisplay(s => ({
        ...s,
        dontShow: { afterWin, afterShows: afterShows ?? s.dontShow.afterShows }
      })),
    setLimits: (afterWin, afterShows) =>
      updateDisplay(s => ({
        ...s,
        limits: { afterWin, afterShows: afterShows ?? s.limits.afterShows }
      })),
    setButtonIcon: (text, buttonColor, textColor) =>
      updateDisplay(s => ({
        ...s,
        icon: { ...s.icon, button: { ...s.icon.button, text, buttonColor, textColor } }
      })),
    setButtonIconName: icon =>
      updateDisplay(s => ({
        ...s,
        icon: {
          ...s.icon,
          button: {
            text: s.icon.button?.text ?? '',
            buttonColor: s.icon.button?.buttonColor ?? '#5951E5',
            textColor: s.icon.button?.textColor ?? '#FFFFFF',
            icon
          }
        }
      })),
    setScheduleDate: (enabled, value) =>
      updateDisplay(s => ({
        ...s,
        schedule: {
          ...s.schedule,
          date: { enabled, value: value ?? s.schedule.date.value }
        }
      })),
    setScheduleTime: (enabled, value) =>
      updateDisplay(s => ({
        ...s,
        schedule: {
          ...s.schedule,
          time: { enabled, value: value ?? s.schedule.time.value }
        }
      })),
    setBrandingEnabled: enabled =>
      updateDisplay(s => ({
        ...s,
        brandingEnabled: enabled
      }))
  }
}
