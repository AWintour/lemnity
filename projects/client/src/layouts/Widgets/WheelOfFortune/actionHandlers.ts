import type { ActionHandler } from '../actions'
import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import {
  fetchPublicWheelSpinResult,
  getCollectorSessionId,
  sendEvent,
  sendPublicRequest,
  type PublicWheelSpinResult
} from '@/common/api/publicApi'
import { randomFloat, randomInt } from '@/common/utils/random'
import type { SectorItem } from '@/stores/widgetSettings/types'

const WHEEL_SPIN_RESULT_KEY_PREFIX = 'lemnity.wheel_of_fortune.spin_result.'

const getSpinResultStorageKey = (widgetId: string) => `${WHEEL_SPIN_RESULT_KEY_PREFIX}${widgetId}`

const pickWeightedIndex = (weights: number[], totalWeight: number): number => {
  const randomValue = randomFloat(0, totalWeight)
  let acc = 0
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i]
    if (randomValue < acc) return i
  }
  return Math.max(0, weights.length - 1)
}

const pickSectorIndex = (count: number, weights: number[], totalWeight: number): number => {
  if (count <= 1) return 0
  if (totalWeight <= 0) return randomInt(0, count)
  return pickWeightedIndex(weights, totalWeight)
}

export const simulateWheelSpinResultFromSectors = (
  items: SectorItem[]
): PublicWheelSpinResult | null => {
  const count = items.length
  if (!count) return null

  const weights: number[] = new Array(count)
  const missing: number[] = []
  let specifiedSum = 0

  for (let i = 0; i < count; i += 1) {
    const raw = items[i]?.chance
    const chance = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, raw) : undefined

    if (typeof chance === 'number') {
      weights[i] = chance
      specifiedSum += chance
    } else {
      weights[i] = 0
      missing.push(i)
    }
  }

  if (missing.length > 0) {
    const chance = Math.max(0, 100 - specifiedSum) / missing.length
    for (const i of missing) weights[i] = chance
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  const selectedIndex = pickSectorIndex(count, weights, totalWeight)

  const sector = items[selectedIndex]
  if (!sector?.id) return null

  return {
    sectorId: sector.id,
    isWin: Boolean(sector.isWin),
    sector: {
      id: sector.id,
      mode: sector.mode,
      text: sector.text,
      icon: sector.icon,
      promo: sector.promo,
      chance: sector.chance,
      isWin: sector.isWin
    }
  }
}

export const wheelActionHandlers: Record<string, ActionHandler> = {
  'wheel.spin': ctx => {
    const helpers = ctx.helpers ?? {}
    const emit = helpers.emit as ((eventKey: string) => void) | undefined
    const setTimer = helpers.setTimer as ((ms: number, cb: () => void) => void) | undefined
    const clearTimer = helpers.clearTimer as (() => void) | undefined
    const setScreen = helpers.setScreen as ((screen: string) => void) | undefined

    const runtime = usePreviewRuntimeStore.getState()
    const status = runtime.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
    const eventMode =
      (useWidgetSettingsStore.getState().settings?.widget as { eventMode?: boolean } | undefined)
        ?.eventMode === true
    // In event mode the wheel is a kiosk loop, so a previous 'locked' result must not block a new spin.
    if (status === 'spinning' || (!eventMode && status === 'locked')) return
    runtime.setValue('wheel.status', 'spinning')

    const payload = (ctx.payload ?? {}) as Record<string, unknown>
    const lead = (payload.lead ?? {}) as Record<string, unknown>
    const url = payload.url as string | undefined
    const referrer = payload.referrer as string | undefined
    const userAgent = payload.userAgent as string | undefined

    const widgetId = useWidgetSettingsStore.getState().settings?.id
    const projectId = useWidgetSettingsStore.getState().projectId ?? undefined
    if (!widgetId) {
      runtime.setValue('wheel.status', 'idle')
      return
    }

    void (async () => {
      try {
        const sessionId = getCollectorSessionId()
        if (!sessionId) {
          runtime.setValue('wheel.status', 'idle')
          return
        }

        const result = await fetchPublicWheelSpinResult(widgetId, sessionId)
        if (!result) {
          runtime.setValue('wheel.status', 'idle')
          return
        }

        if ('blocked' in result && result.blocked) {
          runtime.setValue('wheel.winningSectorId', result.sectorId)
          runtime.setValue('wheel.result', result)

          if (!eventMode) {
            try {
              window.sessionStorage?.setItem(
                getSpinResultStorageKey(widgetId),
                JSON.stringify(result)
              )
            } catch {
              // ignore
            }
          }

          emit?.('wheel.spin')

          const finish = () => {
            if (result.isWin) setScreen?.('prize')
            runtime.setValue('wheel.status', 'locked')
          }

          if (setTimer) {
            clearTimer?.()
            setTimer(5000, finish)
          } else {
            finish()
          }

          return
        }

        runtime.setValue('wheel.winningSectorId', result.sectorId)
        runtime.setValue('wheel.result', result)

        const prizes: string[] = []
        if (result.isWin) {
          const { promo, text } = result.sector
          if (text) prizes.push(text)
          if (promo) prizes.push(promo)
        }

        void sendPublicRequest({
          widgetId,
          fullName: (lead.name as string | undefined) ?? undefined,
          phone: (lead.phone as string | undefined) ?? undefined,
          email: (lead.email as string | undefined) ?? undefined,
          prizes,
          sectorId: result.sectorId,
          isWin: result.isWin,
          url,
          referrer,
          userAgent
        })

        void sendEvent({
          event_name: 'wheel.spin',
          widget_id: widgetId,
          project_id: projectId,
          url,
          referrer,
          user_agent: userAgent,
          payload: { result }
        })

        emit?.('wheel.spin')

        const resetForNextParticipant = () => {
          setScreen?.('main')
          runtime.setValue('wheel.status', 'idle')
          runtime.setValue('wheel.winningSectorId', undefined)
          runtime.setValue('wheel.result', undefined)
        }

        const finish = () => {
          if (result.isWin) setScreen?.('prize')
          if (eventMode) {
            // Show the result briefly, then return to the form so the next participant can play.
            if (setTimer) setTimer(5000, resetForNextParticipant)
            else resetForNextParticipant()
          } else {
            runtime.setValue('wheel.status', 'locked')
          }
        }

        if (!eventMode) {
          try {
            window.sessionStorage?.setItem(getSpinResultStorageKey(widgetId), JSON.stringify(result))
          } catch {
            // ignore
          }
        }

        if (setTimer) {
          clearTimer?.()
          setTimer(5000, finish)
        } else {
          finish()
        }
      } catch {
        runtime.setValue('wheel.status', 'idle')
      }
    })()
  },
  'wheel.close': ctx => {
    const helpers = ctx.helpers ?? {}
    const clearTimer = helpers.clearTimer as (() => void) | undefined
    const close = helpers.close as (() => void) | undefined
    const setScreen = helpers.setScreen as ((screen: string) => void) | undefined
    const widgetId = useWidgetSettingsStore.getState().settings?.id
    const projectId = useWidgetSettingsStore.getState().projectId ?? undefined
    if (widgetId) {
      void sendEvent({
        event_name: 'wheel.close',
        widget_id: widgetId,
        project_id: projectId
      })
    }
    clearTimer?.()
    close?.()
    setScreen?.('main')
  }
}
