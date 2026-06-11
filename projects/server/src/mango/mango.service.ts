import { Injectable } from '@nestjs/common'
import { buildCallbackCommandJson, buildMangoCallbackForm, mangoSign } from './mango-protocol'
import type { MangoCallConfig } from './mango-config'

const DEFAULT_ENDPOINT = 'https://app.mango-office.ru/vpbx/commands/callback'
const DEFAULT_RECORDING_ENDPOINT = 'https://app.mango-office.ru/vpbx/queries/recording/post/'

export type MangoRecordingResult = {
  ok: boolean
  body?: Buffer
  contentType?: string
  status?: number
  error?: string
}

export type MangoCallResult = {
  /** true только при успешном приёме команды (код 1000). */
  ok: boolean
  /** Код ответа Mango (1000 = принято) или null, если не распарсился. */
  code: number | null
  status?: number
  error?: string
}

/**
 * Server API Mango Office: инициация обратного звонка. Команда callback набирает сначала оператора
 * (from.extension/number), затем клиента (to_number) и соединяет их. Успешный приём → код 1000
 * (звонок происходит асинхронно). Секреты не логируем. См. plan-wid-call.md.
 */
@Injectable()
export class MangoService {
  private readonly endpoint = (process.env.MANGO_VPBX_BASE_URL || DEFAULT_ENDPOINT).trim()

  async initCall(
    config: MangoCallConfig,
    call: { commandId: string; toNumber: string },
    opts?: { fetchImpl?: typeof fetch; endpoint?: string }
  ): Promise<MangoCallResult> {
    const json = buildCallbackCommandJson({
      commandId: call.commandId,
      fromExtension: config.fromExtension,
      fromNumber: config.fromNumber,
      toNumber: call.toNumber,
      lineNumber: config.lineNumber
    })
    const form = buildMangoCallbackForm(config.apiKey, config.apiSalt, json)
    const body = new URLSearchParams(form).toString()
    const endpoint = opts?.endpoint ?? this.endpoint
    const doFetch = opts?.fetchImpl ?? fetch

    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      const raw = await res.text()
      let code: number | null = null
      try {
        const parsed = JSON.parse(raw) as { result?: unknown; code?: unknown }
        if (typeof parsed.result === 'number') code = parsed.result
        else if (typeof parsed.code === 'number') code = parsed.code
      } catch {
        /* тело не JSON — оставим code=null */
      }
      return { ok: res.ok && code === 1000, code, status: res.status }
    } catch (e) {
      return { ok: false, code: null, error: e instanceof Error ? e.message : String(e) }
    }
  }

  /**
   * Выгрузка записи разговора по recording_id (приватна в Mango — нужен подписанный запрос).
   * ⚠️ TODO: точный endpoint/параметры подтвердить на боевом аккаунте Mango.
   */
  async fetchRecording(
    config: { apiKey: string; apiSalt: string },
    recordingId: string,
    opts?: { fetchImpl?: typeof fetch; endpoint?: string }
  ): Promise<MangoRecordingResult> {
    const json = JSON.stringify({ recording_id: recordingId, action: 'download' })
    const form = {
      vpbx_api_key: config.apiKey,
      json,
      sign: mangoSign(config.apiKey, json, config.apiSalt)
    }
    const body = new URLSearchParams(form).toString()
    const endpoint = opts?.endpoint ?? (process.env.MANGO_VPBX_RECORDING_URL || DEFAULT_RECORDING_ENDPOINT).trim()
    const doFetch = opts?.fetchImpl ?? fetch

    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      if (!res.ok) return { ok: false, status: res.status }
      const buf = Buffer.from(await res.arrayBuffer())
      return {
        ok: true,
        body: buf,
        contentType: res.headers.get('content-type') ?? 'audio/mpeg',
        status: res.status
      }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  }
}
