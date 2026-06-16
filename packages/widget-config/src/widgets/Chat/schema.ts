import { z } from 'zod'
import {
  buildWidgetSettingsSchema,
  IconEnum,
  LooseSurfaceSchema,
  type WidgetTypeId
} from '../base.js'

const WidgetType: WidgetTypeId = 'CHAT'

const PositionEnum = z.enum(['bottom-left', 'bottom-right'])

export type Position = z.infer<typeof PositionEnum>

// Сценарий бота — дерево быстрых ответов. Шаг = узел canvas (сообщение бота + кнопки),
// кнопка = ребро: ведёт к другому шагу (next = id) либо передаёт оператору (next = null).
const ScenarioButtonSchema = z.object({
  id: z.string(),
  emoji: z.string().max(8).optional(),
  label: z.string().max(60, 'Текст кнопки не длиннее 60 символов'),
  // id шага-получателя; null = «передать менеджеру» (handoff к живому оператору).
  next: z.string().nullable(),
  // id отдела, куда направлять диалог при хэндофе (когда next === null). Опционально.
  department: z.string().nullable().optional(),
})

export type ScenarioButton = z.infer<typeof ScenarioButtonSchema>

const ScenarioStepSchema = z.object({
  id: z.string(),
  message: z.string().max(600, 'Сообщение не длиннее 600 символов'),
  // Опциональное изображение шага (data-URL или внешний URL); показывается в окне чата.
  image: z.string().optional(),
  buttons: z.array(ScenarioButtonSchema),
  // Авто-переход: id следующего шага для шага БЕЗ кнопок (бот сам продолжает после паузы).
  // Отсутствует/null = шаг конечный (без авто-перехода). Используется только когда buttons пуст.
  next: z.string().nullable().optional(),
  // Шаг «Аи агент»: при достижении передаёт диалог ИИ-агенту (free-text, ответы по сайту).
  // Работает при включённом ИИ-агенте (раздел «Ассистент»).
  agent: z.boolean().optional(),
  // Координаты узла на canvas редактора.
  position: z.object({ x: z.number(), y: z.number() }),
})

export type ScenarioStep = z.infer<typeof ScenarioStepSchema>

const ScenarioSchema = z.object({
  enabled: z.boolean(),
  startStepId: z.string(),
  steps: z.array(ScenarioStepSchema),
})

export type Scenario = z.infer<typeof ScenarioSchema>

const ChatWidgetSchema = z.object({
  type: z.literal(WidgetType),

  // Блок «Настройка чата».
  title: z.string().max(60, 'Заголовок не длиннее 60 символов'),

  // Блок «Функционал» (профессиональная версия).
  featuresEnabled: z.boolean(),
  soundEnabled: z.boolean(),
  blockAnonymousProxy: z.boolean(),
  deferredLoad: z.boolean(),

  // Блок «Ограничения времени показа».
  schedule: z.object({
    timezone: z.string(),
    from: z.string(),
    to: z.string(),
    days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
    weekdaysOnly: z.boolean(),
  }),

  // Кнопка-лаунчер (как у «Уведомления»).
  triggerText: z
    .string()
    .max(25, 'Текст должен быть не длиннее 25 символов'),
  triggerFontColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  triggerIcon: IconEnum,
  triggerBackgroundColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  triggerPosition: PositionEnum,

  // Анимация «биение сердца» у кнопки-лаунчера (опционально; старые конфиги валидны).
  triggerPulse: z.boolean().optional(),

  // Окно чата.
  operatorName: z
    .string()
    .max(40, 'Имя должно быть не длиннее 40 символов'),
  operatorSubtitle: z
    .string()
    .max(60, 'Подзаголовок должен быть не длиннее 60 символов')
    .optional(),
  operatorAvatarUrl: z.string().optional(),

  // Логотип компании в шапке окна.
  companyLogo: z.object({
    enabled: z.boolean(),
    fileName: z.string().optional(),
    url: z.string().optional(),
  }),

  // Приветственный заголовок (крупный текст в шапке).
  welcomeTitle: z
    .string()
    .max(200, 'Заголовок не длиннее 200 символов'),
  welcomeTitleSize: z.number().min(8).max(64),
  // Толщина шрифта приветственного заголовка (CSS font-weight).
  welcomeTitleWeight: z.number().min(100).max(900).optional(),
  welcomeTitleColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Цвет должен быть в HEX формате'),
  welcomeTitleAlign: z.enum(['left', 'center', 'right']),

  greetingMessage: z
    .string()
    .max(300, 'Сообщение должно быть не длиннее 300 символов'),
  // Информационный заголовок в шапке: онлайн / офлайн (+ выключатели показа).
  onlineMessage: z
    .string()
    .max(300, 'Сообщение должно быть не длиннее 300 символов'),
  onlineMessageEnabled: z.boolean().optional(),
  offlineMessage: z
    .string()
    .max(300, 'Сообщение должно быть не длиннее 300 символов'),
  offlineMessageEnabled: z.boolean().optional(),
  placeholder: z
    .string()
    .max(60, 'Текст должен быть не длиннее 60 символов'),
  // Формат окна: 'modal' — плавающее окошко (как сейчас), 'sidebar' — панель на всю высоту экрана.
  windowFormat: z.enum(['sidebar', 'modal']),
  // Радиус скругления окна (px), применяется к модальному формату.
  windowRadius: z.number(),
  windowBackgroundColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  windowAccentColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),
  // Клиентский цвет — пузырь сообщения посетителя («Оформление чата»).
  clientColor: z
    .string()
    .regex(
      /^#[0-9A-F]{6}$/i,
      'Цвет должен быть в HEX формате'
    ),

  // Блок «Автоматически открывать чат».
  autoOpen: z.boolean(),
  delay: z
    .number()
    .min(0, 'Временной промежуток не может быть отрицательным'),
  // Открыть через N секунд после открытия страницы (галочка + значение = delay).
  afterOpenEnabled: z.boolean(),
  // Открыть при скролле ниже N% страницы.
  scrollOpen: z.object({
    enabled: z.boolean(),
    percent: z.number().min(0).max(100),
  }),
  // Мультикнопка (объединение виджетов в одну кнопку).
  multiButton: z.boolean(),

  // Персонализированные приветствия (узнаёт пользователя по cookies/аккаунту).
  personalizedGreetings: z.boolean(),

  // ИИ-агент: возможность беседовать с ИИ (4-я иконка-вкладка в окне чата). Платный блок (ГПТ через шлюз).
  aiAgentEnabled: z.boolean(),
  aiAgentName: z.string().max(40, 'Имя не длиннее 40 символов'),
  // Разделы, которые агент должен изучить и о которых информировать клиента.
  aiKnowledge: z.array(z.string()),

  // Обратный звонок: отложенный звонок (посетитель оставляет удобное время + номер).
  deferredCall: z.boolean(),

  // Вкладка «Контакты» в окне чата.
  contactsTab: z.object({
    enabled: z.boolean(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
  }),

  // Социальные сети компании — показываются в 3-й вкладке окна чата.
  // icon — ключ иконки из библиотеки «Мультикнопки» (vk / telegram-message / instagram / …).
  // Опционально (старые конфиги без поля валидны; новые получают [] из defaults).
  companySocials: z
    .array(
      z.object({
        id: z.string(),
        icon: z.string(),
        url: z.string(),
      }),
    )
    .optional(),

  // Заголовок вкладки «Соцсети» (как «Приветственный заголовок»). Все поля опциональны.
  socialsTitle: z.string().optional(),
  socialsTitleSize: z.number().min(8).max(64).optional(),
  socialsTitleWeight: z.number().min(100).max(900).optional(),
  socialsTitleColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Цвет должен быть в HEX формате')
    .optional(),
  socialsTitleAlign: z.enum(['left', 'center', 'right']).optional(),

  // Запрашивать контакт (имя/телефон) перед началом диалога.
  requireContact: z.boolean(),

  // Блок «Контакты» — какие поля собирать в форме «Оставить сообщение» и когда.
  contacts: z.object({
    name: z.object({ enabled: z.boolean(), required: z.boolean() }),
    phone: z.object({ enabled: z.boolean(), required: z.boolean() }),
    email: z.object({ enabled: z.boolean(), required: z.boolean() }),
    when: z.enum(['inDialog', 'beforeDialog', 'never']),
  }),

  // Сценарий бота (дерево быстрых ответов).
  scenario: ScenarioSchema,

  brandingEnabled: z.boolean(),
})

export type ChatWidgetType = z.infer<typeof ChatWidgetSchema>

const customSurfaces = {
  fields: LooseSurfaceSchema,
  display: LooseSurfaceSchema,
  integration: LooseSurfaceSchema,
} as const

export const chatSchema = buildWidgetSettingsSchema(
  WidgetType,
  ChatWidgetSchema,
  customSurfaces
)
