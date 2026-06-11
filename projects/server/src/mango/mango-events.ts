/**
 * Разбор итогового события звонка Mango (`events/summary`). Чистый — без БД/сети.
 * Сопоставление с заявкой — по `command_id` (наш id, переданный в команде callback).
 * ⚠️ Точная форма полей Mango подтверждается на боевых вебхуках; парсер защитный. plan-wid-call.md.
 */
export type MangoSummary = {
  commandId: string
  durationSec?: number
  recordingUrl?: string
  answered: boolean
}

/** IP-источники вебхуков Mango (см. plan-wid-call.md). */
const MANGO_SOURCE_IPS = new Set(['81.88.80.132', '81.88.80.133', '81.88.82.36'])

/** Разрешён ли источник вебхука: в dev/при skip — всегда; в prod — только IP Mango. */
export function isAllowedMangoSource(
  ip: string | undefined,
  opts: { isProd: boolean; skip: boolean }
): boolean {
  if (opts.skip || !opts.isProd) return true
  return !!ip && MANGO_SOURCE_IPS.has(ip)
}

export function parseMangoSummaryEvent(json: string): MangoSummary | null {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null

  const commandId = typeof raw.command_id === 'string' ? raw.command_id : ''
  if (!commandId) return null

  const dur =
    typeof raw.talk_time === 'number'
      ? raw.talk_time
      : typeof raw.call_duration === 'number'
        ? raw.call_duration
        : undefined

  const result: MangoSummary = { commandId, answered: typeof dur === 'number' && dur > 0 }
  if (typeof dur === 'number') result.durationSec = dur
  if (typeof raw.recording === 'string' && raw.recording) result.recordingUrl = raw.recording
  return result
}
