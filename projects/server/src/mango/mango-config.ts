/**
 * Резолвер параметров звонка Mango (чистый). Сливает СЕКРЕТЫ (источник выбирает вызывающий:
 * глобальный env или ProjectIntegration для BYO — гибрид) и НАСТРОЙКИ звонка из конфига виджета
 * (`callback.call`). Источник секретов абстрагирован, поэтому функция одинакова для обеих веток.
 * См. plan-wid-call.md, «Согласованный план реализации Фазы 2».
 */

export type MangoCallConfig = {
  apiKey: string
  apiSalt: string
  /** Внутренний extension оператора (managerType=SIP). */
  fromExtension?: string
  /** Внешний номер оператора (managerType=Телефон). */
  fromNumber?: string
  /** АОН, который увидит клиент. */
  lineNumber?: string
}

export type ResolveMangoInput = {
  secrets: { apiKey?: string; apiSalt?: string }
  call: {
    callMode?: string
    managerType?: string
    managerAddress?: string
    clientLineNumber?: string
  }
  /** Глобальный АОН по умолчанию (если у виджета не задан свой). */
  defaultLineNumber?: string
}

export type ResolveMangoResult =
  | { ok: true; config: MangoCallConfig }
  | { ok: false; reason: 'mango_secrets_missing' | 'manager_missing' }

export function resolveMangoCallConfig(input: ResolveMangoInput): ResolveMangoResult {
  const apiKey = (input.secrets.apiKey ?? '').trim()
  const apiSalt = (input.secrets.apiSalt ?? '').trim()
  if (!apiKey || !apiSalt) return { ok: false, reason: 'mango_secrets_missing' }

  const address = (input.call.managerAddress ?? '').trim()
  if (!address) return { ok: false, reason: 'manager_missing' }

  const config: MangoCallConfig = { apiKey, apiSalt }
  // Телефон → внешний номер оператора; иначе (SIP/extension) → внутренний extension.
  if (input.call.managerType === 'Телефон') config.fromNumber = address
  else config.fromExtension = address

  const lineNumber = (input.call.clientLineNumber || input.defaultLineNumber || '').trim()
  if (lineNumber) config.lineNumber = lineNumber

  return { ok: true, config }
}
