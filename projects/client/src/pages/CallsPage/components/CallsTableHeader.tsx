import { CALLS_GRID_CLASS } from '../calls.model'

const COLUMNS = ['Время / Дата', 'Телефон', 'Менеджер', 'Длительность', 'Статус', 'Запись']

const CallsTableHeader = () => (
  <div className={`${CALLS_GRID_CLASS} px-4 text-[13px] text-default-500`}>
    {COLUMNS.map(c => (
      <div key={c} className="py-2">
        {c}
      </div>
    ))}
  </div>
)

export default CallsTableHeader
