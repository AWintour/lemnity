import type {
  MutableWidgetSettings,
  WidgetCanonicalizer,
} from '../../canonicalizer.types.js'

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Стандартные дефолты вкладки «Отображение» (соответствуют DisplaySchemaBase).
// Кнопку (icon.button) не включаем: дефолтный вид — «Изображение», а лишняя
// кнопка с пустым текстом не прошла бы валидацию IconButtonSchema (text min 1).
const buildStandardDisplay = (): Record<string, any> => ({
  icon: {
    type: 'image',
    image: { fileName: '', url: '' },
    position: 'bottom-right',
    hide: 'always',
  },
  startShowing: 'onClick',
  timer: { delayMs: 20000 },
  weekdays: { enabled: true, days: ['mon', 'tue', 'wed', 'thu', 'fri'], weekdaysOnly: false },
  showRules: {
    onExit: false,
    scrollBelow: { enabled: false, percent: null },
    afterOpen: { enabled: false, seconds: null },
  },
  frequency: { mode: 'everyPage' },
  dontShow: { afterWin: false, afterShows: null },
  limits: { afterWin: false, afterShows: null },
  schedule: {
    date: { enabled: true, value: 'fromDate' },
    time: { enabled: true, value: 'fromTime' },
  },
  brandingEnabled: true,
  // Дефолтные приветствия для лаунчера «Аватарка» (имя оператора подставляется в рантайме).
  greetings: ['Здравствуйте', 'Меня зовут (имя оператора)', 'Чем могу помочь?'],
})

// Чат перешёл на стандартную вкладку «Отображение». Старые конфиги хранят display: {}
// (loose), поэтому при загрузке бэкфилим недостающие поля стандартными дефолтами и
// нормализуем неактивную ветку иконки — иначе DisplaySchemaBase не пройдёт валидацию.
export const canonicalizeChat: WidgetCanonicalizer = settings => {
  const existing = isObject(settings.display) ? settings.display : {}
  // Бэкфил по верхнему уровню: пользовательские значения сохраняем, недостающие — из дефолтов.
  const display: Record<string, any> = { ...buildStandardDisplay(), ...existing }

  // Нормализация ветки иконки: при image убираем button, при button убираем image.
  if (isObject(display.icon)) {
    if (display.icon.type === 'image') delete display.icon.button
    else if (display.icon.type === 'button') delete display.icon.image
  }

  // Нормализация частоты/ограничений (как у остальных виджетов со стандартным display).
  if (isObject(display.frequency) && display.frequency.mode === 'everyPage') {
    display.frequency.value = undefined
    display.frequency.unit = undefined
  }
  if (isObject(display.dontShow) && display.dontShow.afterWin) {
    display.dontShow.afterShows = null
  }

  ;(settings as MutableWidgetSettings).display = display
  return settings
}
