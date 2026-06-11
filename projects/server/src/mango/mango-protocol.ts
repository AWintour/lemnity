import { createHash } from 'node:crypto'

/**
 * Чистый протокол Server API Mango Office (ВАТС) — без БД/сети, тестируется изолированно.
 * Команда callback отправляется POST-ом с тремя form-полями: vpbx_api_key, json, sign,
 * где sign = sha256(api_key + json + api_salt). См. plan-wid-call.md, «Контракт API».
 */

/** Подпись запроса: hex sha256 от конкатенации ключ+json+соль. */
export function mangoSign(apiKey: string, json: string, apiSalt: string): string {
  return createHash('sha256').update(apiKey + json + apiSalt).digest('hex')
}

export type CallbackCommandParams = {
  /** Идентификатор команды (наш) — для сопоставления с вебхуками статуса. */
  commandId: string
  /** Внутренний extension оператора/менеджера (взаимоисключимо с fromNumber). */
  fromExtension?: string
  /** Внешний номер оператора/менеджера (если без extension). */
  fromNumber?: string
  /** Телефон клиента-посетителя (кого соединяем). */
  toNumber: string
  /** Номер АОН, который увидит клиент. */
  lineNumber?: string
}

/**
 * Детерминированная JSON-строка команды callback. Порядок ключей фиксирован
 * (command_id → from → to_number → line_number), т.к. подпись считается по точной строке.
 */
export function buildCallbackCommandJson(params: CallbackCommandParams): string {
  const cmd: Record<string, unknown> = { command_id: params.commandId }
  const from: Record<string, string> = {}
  if (params.fromExtension) from.extension = params.fromExtension
  if (params.fromNumber) from.number = params.fromNumber
  cmd.from = from
  cmd.to_number = params.toNumber
  if (params.lineNumber) cmd.line_number = params.lineNumber
  return JSON.stringify(cmd)
}

/** Три form-поля тела запроса к Mango (json подписывается как есть). */
export function buildMangoCallbackForm(
  apiKey: string,
  apiSalt: string,
  json: string
): { vpbx_api_key: string; json: string; sign: string } {
  return { vpbx_api_key: apiKey, json, sign: mangoSign(apiKey, json, apiSalt) }
}
