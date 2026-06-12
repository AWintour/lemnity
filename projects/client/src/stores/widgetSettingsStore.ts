import { useMemo } from 'react'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import { isWheelLikeWidgetType } from '@/layouts/Widgets/constants'
import { buildDefaults, getStaticDefaults } from './widgetSettings/defaults'
import { normalize, trimInactiveBranches } from './widgetSettings/normalize'
import { validateCanonical as validateWidgetSettings } from '@lemnity/widget-config'
import type { Issue } from '@lemnity/widget-config'
import type { FieldsSlice } from './widgetSettings/fieldsSlice'
import { createFieldsSlice } from './widgetSettings/fieldsSlice'
import type { DisplaySlice } from './widgetSettings/displaySlice'
import { createDisplaySlice } from './widgetSettings/displaySlice'
import type { IntegrationSlice } from './widgetSettings/integrationSlice'
import { createIntegrationSlice } from './widgetSettings/integrationSlice'
import type { WidgetSlice } from './widgetSettings/widgetActions/types'
import { createWidgetSlice } from './widgetSettings/widgetSlice'
import type {
  WheelOfFortuneWidgetSettings,
  WidgetSettings,
  WidgetSettingsState,
  FieldsUpdater,
  DisplayUpdater,
  IntegrationUpdater
} from './widgetSettings/types'
import type { WidgetAction } from '@/layouts/Widgets/actions'
import { getWidgetDefinition } from '@/layouts/Widgets/registry'

// Re-export public types for existing import paths
export type {
  ButtonPosition,
  StartShowing,
  IconType,
  HideIcon,
  DayKey,
  FrequencyMode,
  FrequencyUnit,
  ContactField,
  SectorItem,
  FieldsSettings,
  DisplaySettings,
  IntegrationSettings
} from './widgetSettings/types'

type CoreActions = {
  init: (
    id: string,
    widgetType: WidgetTypeEnum,
    projectId?: string,
    initial?: Partial<WidgetSettings>
  ) => void
  snapshot: () => WidgetSettings | null
  snapshotNormalized: () => WidgetSettings | null
  validateNow: () => { ok: boolean; issues: Issue[] }
  getErrors: (prefix?: string) => Issue[]
  prepareForSave: () => { ok: true; data: WidgetSettings } | { ok: false; issues: Issue[] }
}

type ValidationState = {
  validationVisible: boolean
  setValidationVisible: (visible: boolean) => void
  reset: () => void
}
export type WidgetSettingsStore = WidgetSettingsState &
  CoreActions &
  ValidationState &
  FieldsSlice &
  DisplaySlice &
  IntegrationSlice &
  WidgetSlice

export const computeIssues = (settings: WidgetSettings | null | undefined): Issue[] => {
  if (!settings) return []
  const defaults = getStaticDefaults(settings.widgetType)
  const normalized = normalize(settings, defaults)
  const trimmed = trimInactiveBranches(normalized)
  const validation = validateWidgetSettings(trimmed)
  return validation.issues
}

const resolveActions = (
  actions: WidgetAction[] | undefined,
  widgetType: WidgetTypeEnum | undefined
): WidgetAction[] => {
  const defaultActions = widgetType ? (getWidgetDefinition(widgetType).actions ?? []) : []
  return actions && actions.length > 0 ? actions : defaultActions
}

// Persist by widget id: store a map { [widgetId]: { state, version } } under one key
const PERSIST_NAME = 'widget-settings'
let activeWidgetId = ''

const mapStorage: PersistStorage<WidgetSettingsStore> = {
  getItem: (name: string): StorageValue<WidgetSettingsStore> | null => {
    const raw = localStorage.getItem(name)
    if (!raw || !activeWidgetId) return null
    try {
      const map = JSON.parse(raw) as Record<string, unknown>
      const entry = map[activeWidgetId]
      return entry ? (entry as StorageValue<WidgetSettingsStore>) : null
    } catch {
      return null
    }
  },
  setItem: (name: string, value: StorageValue<WidgetSettingsStore>): void => {
    const raw = localStorage.getItem(name)
    let map: Record<string, unknown>
    try {
      map = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    } catch {
      map = {}
    }
    if (!activeWidgetId) return
    map[activeWidgetId] = value
    localStorage.setItem(name, JSON.stringify(map))
  },
  removeItem: (name: string): void => {
    const raw = localStorage.getItem(name)
    if (!raw || !activeWidgetId) return
    try {
      const map = JSON.parse(raw) as Record<string, unknown>
      delete (map as Record<string, unknown>)[activeWidgetId]
      localStorage.setItem(name, JSON.stringify(map))
    } catch {
      // ignore
    }
  }
}

const useWidgetSettingsStore = create<WidgetSettingsStore>()(
  devtools(
    persist(
      (set, get) => {
        const patchFields: FieldsUpdater = mutator =>
          set(state => ({
            ...state,
            settings: state.settings
              ? { ...state.settings, fields: mutator(state.settings.fields) }
              : state.settings
          }))

        const patchDisplay: DisplayUpdater = mutator =>
          set(state => ({
            ...state,
            settings: state.settings
              ? { ...state.settings, display: mutator(state.settings.display) }
              : state.settings
          }))

        const patchIntegration: IntegrationUpdater = mutator =>
          set(state => ({
            ...state,
            settings: state.settings
              ? { ...state.settings, integration: mutator(state.settings.integration) }
              : state.settings
          }))

        return {
          settings: null,
          initialized: false,
          projectId: null,
          validationVisible: false,
          setValidationVisible: (visible: boolean) =>
            set(state => ({ ...state, validationVisible: visible })),
          reset: () =>
            set(state => {
              activeWidgetId = ''
              return {
                ...state,
                settings: null,
                initialized: false,
                projectId: null,
                validationVisible: false
              }
            }),
          init: (id, widgetType, projectId, initial) => {
            activeWidgetId = id
            const baseDefaults = buildDefaults(id, widgetType)
            // if server provided config is null/undefined, try rehydrate draft
            if (!initial) {
              try {
                const raw = localStorage.getItem(PERSIST_NAME)
                if (raw) {
                  const map = JSON.parse(raw) as Record<string, { state?: unknown } | undefined>
                  const entry = map[id]
                  const restored = (entry?.state as { settings?: unknown } | undefined)
                    ?.settings as WidgetSettings | undefined
                  if (restored) {
                    const restoredProjectId = (entry?.state as { projectId?: unknown } | undefined)
                      ?.projectId
                    const nextProjectId =
                      projectId ??
                      (typeof restoredProjectId === 'string' ? restoredProjectId : null)
                    // Force type consistency with requested widgetType
                    const baseDefaults = buildDefaults(id, widgetType)
                    const corrected: WidgetSettings = {
                      ...restored,
                      id,
                      widgetType,
                      widget:
                        restored.widget?.type === widgetType
                          ? restored.widget
                          : baseDefaults.widget,
                      actions: resolveActions(restored.actions, widgetType)
                    }
                    set({ settings: corrected, initialized: true, projectId: nextProjectId })
                    return
                  }
                }
              } catch {
                // ignore
              }
            }
            const resolvedActions = resolveActions(
              initial?.actions ?? baseDefaults.actions,
              widgetType
            )
            set({
              projectId: projectId ?? null,
              settings: initial
                ? {
                    ...baseDefaults,
                    ...initial,
                    widgetType,
                    widget:
                      initial.widget?.type === widgetType ? initial.widget : baseDefaults.widget,
                    actions: resolvedActions
                  }
                : { ...baseDefaults, actions: resolvedActions },
              initialized: true
            })
          },
          snapshot: () => get().settings,
          snapshotNormalized: () => {
            const s = get().settings
            if (!s) return null
            const defaults = getStaticDefaults(s.widgetType)
            const merged = normalize(s, defaults)
            return trimInactiveBranches(merged)
          },
          validateNow: () => {
            const current = get().snapshot()
            if (!current)
              return { ok: false, issues: [{ path: 'settings', message: 'Не инициализировано' }] }
            const issues = computeIssues(current)
            return { ok: issues.length === 0, issues }
          },
          getErrors: (prefix?: string) => {
            const issues = computeIssues(get().snapshot())
            if (!prefix) return issues
            return issues.filter(i => i.path.startsWith(prefix))
          },
          prepareForSave: () => {
            const n = get().snapshotNormalized()
            if (!n) {
              return {
                ok: false as const,
                issues: [{ path: 'settings', message: 'Не инициализировано' }]
              }
            }
            const v = validateWidgetSettings(n)
            if (!v.ok) return { ok: false as const, issues: v.issues }
            return { ok: true as const, data: n }
          },
          ...createFieldsSlice(patchFields),
          ...createDisplaySlice(patchDisplay),
          ...createIntegrationSlice(patchIntegration),
          ...createWidgetSlice(mutator => {
            set(state => {
              if (!state.settings) return state
              const nextWidget = mutator(state.settings.widget)
              return {
                ...state,
                settings: { ...state.settings, widget: nextWidget }
              }
            })
          })
        }
      },
      { name: PERSIST_NAME, storage: mapStorage }
    )
  )
)

export default useWidgetSettingsStore

// UI-дериват: подписывает компонент на состояние и возвращает актуальные ошибки
export const useErrors = (prefix?: string) => {
  const settings = useWidgetSettingsStore(s => s.settings)
  const issues = computeIssues(settings)
  return prefix ? issues.filter(i => i.path.startsWith(prefix)) : issues
}

// Версия с управлением видимостью, чтобы не считать вхолостую и не триггерить перерендеры
export const useVisibleErrors = (visible: boolean, prefix?: string) => {
  const errors = useErrors(prefix)
  return visible ? errors : []
}

// Slice hooks for cleaner component usage
export const useDisplaySettings = () => {
  const settings = useWidgetSettingsStore(s => s.settings?.display)
  const setStartShowing = useWidgetSettingsStore(s => s.setStartShowing)
  const setTimerDelay = useWidgetSettingsStore(s => s.setTimerDelay)
  const setIconType = useWidgetSettingsStore(s => s.setIconType)
  const setIconImage = useWidgetSettingsStore(s => s.setIconImage)
  const setButtonPosition = useWidgetSettingsStore(s => s.setButtonPosition)
  const setHideIcon = useWidgetSettingsStore(s => s.setHideIcon)
  const setWeekdaysEnabled = useWidgetSettingsStore(s => s.setWeekdaysEnabled)
  const setWeekdays = useWidgetSettingsStore(s => s.setWeekdays)
  const setWeekdaysOnly = useWidgetSettingsStore(s => s.setWeekdaysOnly)
  const setShowOnExit = useWidgetSettingsStore(s => s.setShowOnExit)
  const setScrollBelow = useWidgetSettingsStore(s => s.setScrollBelow)
  const setAfterOpen = useWidgetSettingsStore(s => s.setAfterOpen)
  const setFrequency = useWidgetSettingsStore(s => s.setFrequency)
  const setDontShow = useWidgetSettingsStore(s => s.setDontShow)
  const setLimits = useWidgetSettingsStore(s => s.setLimits)
  const setButtonIcon = useWidgetSettingsStore(s => s.setButtonIcon)
  const setButtonIconName = useWidgetSettingsStore(s => s.setButtonIconName)
  const setScheduleDate = useWidgetSettingsStore(s => s.setScheduleDate)
  const setScheduleTime = useWidgetSettingsStore(s => s.setScheduleTime)

  return {
    settings,
    setStartShowing,
    setTimerDelay,
    setIconType,
    setIconImage,
    setButtonPosition,
    setHideIcon,
    setWeekdaysEnabled,
    setWeekdays,
    setWeekdaysOnly,
    setShowOnExit,
    setScrollBelow,
    setAfterOpen,
    setFrequency,
    setDontShow,
    setLimits,
    setButtonIcon,
    setButtonIconName,
    setScheduleDate,
    setScheduleTime
  }
}

export const useIntegrationSettings = () => {
  const settings = useWidgetSettingsStore(s => s.settings?.integration)
  const setScriptSnippet = useWidgetSettingsStore(s => s.setScriptSnippet)

  return {
    settings,
    setScriptSnippet
  }
}

export const useWidgetStaticDefaults = () => {
  const widgetType = useWidgetSettingsStore(s => s.settings?.widgetType)
  return useMemo(() => (widgetType ? getStaticDefaults(widgetType) : undefined), [widgetType])
}

// Slice hook for Wheel of Fortune widget-specific settings
export const useFieldsSettings = () => {
  const settings = useWidgetSettingsStore(s =>
    isWheelLikeWidgetType(s.settings?.widget.type)
      ? (s.settings?.widget as WheelOfFortuneWidgetSettings)
      : null
  )
  const setRandomize = useWidgetSettingsStore(s => s.setWheelRandomize)
  const setSectors = useWidgetSettingsStore(s => s.setWheelSectors)
  const updateSector = useWidgetSettingsStore(s => s.updateWheelSector)
  const addSector = useWidgetSettingsStore(s => s.addWheelSector)
  const deleteSector = useWidgetSettingsStore(s => s.deleteWheelSector)

  return {
    settings,
    setRandomize,
    setSectors,
    updateSector,
    addSector,
    deleteSector
  }
}
