/**
 * Список менеджеров (операторов) — «из файла». В боевой версии заменяется на данные оператора
 * из ProjectIntegration / справочника Mango. Тип: SIP-аккаунт или телефонный номер.
 */
export type ManagerType = 'SIP' | 'Телефон'

export type Manager = {
  type: ManagerType
  address: string
  name: string
}

export const MANAGERS: Manager[] = [
  { type: 'SIP', address: 'sip1@pbx123.mangosip.ru', name: 'Симаков Александр' },
  { type: 'SIP', address: 'sip2@pbx123.mangosip.ru', name: 'Иванова Мария' },
  { type: 'Телефон', address: '+7 999 111 22 33', name: 'Петров Сергей' },
]
