/**
 * Тип оператора Callback. Реальные менеджеры теперь хранятся в БД (вкладка «Звонки» → «Менеджеры»,
 * per-project, round-robin) и/или вводятся в редакторе виджета как реальный extension/SIP-ID.
 * Прежний список-заглушка убран (фейковые SIP вызывали Mango error 3330).
 */
export type ManagerType = 'SIP' | 'Телефон'

export type Manager = {
  type: ManagerType
  address: string
  name: string
}
