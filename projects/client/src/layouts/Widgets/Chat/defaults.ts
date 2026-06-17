import type {
  DisplaySettings,
  FieldsSettings,
  IntegrationSettings,
} from '@/stores/widgetSettings/types'
import { buildStandardDisplaySettings } from '@/stores/widgetSettings/displayDefaults'
import { WidgetTypeEnum } from '@lemnity/api-sdk'
import type {
  ChatWidgetType,
} from '@lemnity/widget-config/widgets/chat'

export const chatWidgetDefaults: ChatWidgetType = {
  type: WidgetTypeEnum.CHAT,

  title: '',

  featuresEnabled: true,
  soundEnabled: false,
  blockAnonymousProxy: false,
  deferredLoad: true,

  schedule: {
    timezone: '+5 Екатеринбург',
    from: '08:00',
    to: '21:00',
    days: ['tue', 'thu', 'sat'],
    weekdaysOnly: false,
  },

  triggerText: '',
  triggerBackgroundColor: '#5951E5',
  triggerFontColor: '#FFFFFF',
  triggerIcon: 'Send',
  triggerPosition: 'bottom-right',
  triggerPulse: false,

  // «Согласие и политика» — чекбокс согласия над полем ввода.
  agreement: {
    enabled: true,
    color: '#9A9A9A',
    agreementUrl: 'lemnity.ru/agreement',
    policyUrl: 'lemnity.ru/policy',
  },

  // «Мобильная версия» — включена по умолчанию; на мобильных лаунчер берётся отсюда.
  mobileSettings: {
    mobileEnabled: true,
    triggerType: 'button',
    imageUrl: undefined,
    triggerText: 'Чат',
    triggerFontColor: '#FFFFFF',
    triggerBackgroundColor: '#5951E5',
  },

  operatorName: 'Поддержка',
  operatorSubtitle: 'Супер гид города',
  operatorAvatarUrl: undefined,

  companyLogo: { enabled: true, fileName: undefined, url: undefined },

  welcomeTitle: 'Приветствуем!\nЭто наш умный чат для удобства связи с нами.',
  welcomeTitleSize: 20,
  welcomeTitleWeight: 600,
  welcomeTitleColor: '#FFFFFF',
  welcomeTitleAlign: 'left',

  greetingMessage: 'Здравствуйте! Чем можем помочь?',
  onlineMessage: 'Менеджеры онлайн\nОтвечаем в течение 3 мин.',
  onlineMessageEnabled: true,
  offlineMessage: 'Увы, но сейчас нас здесь нет.\nМы вернемся в рабочее время пн-пт с 09:00 по 19:00 мск',
  offlineMessageEnabled: true,
  placeholder: 'Напишите сообщение…',
  windowFormat: 'modal',
  windowRadius: 18,
  windowBackgroundColor: '#FFFFFF',
  windowAccentColor: '#5951E5',
  clientColor: '#5951E5',

  autoOpen: true,
  delay: 20,
  afterOpenEnabled: true,
  scrollOpen: { enabled: true, percent: 20 },
  multiButton: true,

  personalizedGreetings: true,

  // Аи-агент: включение/статистика — в разделе «Ассистент», имя/страницы — в блоке «Аи агент».
  aiAgentEnabled: false,
  aiAgentName: 'Лемми',
  // Выбранные внутренние страницы сайта для изучения (URL). Пусто → агент изучает только главную.
  aiKnowledge: [],

  deferredCall: false,

  contactsTab: {
    enabled: true,
    address: 'г. Тюмень, ул. Пышминская 103',
    phone: '+7 982 13 000 12',
    email: 'hello@lemnity.ru',
  },

  // Социальные сети компании (3-я вкладка окна чата).
  companySocials: [],
  socialsTitle: 'Мы в социальных сетях',
  socialsTitleSize: 20,
  socialsTitleWeight: 600,
  socialsTitleColor: '#1A1A1A',
  socialsTitleAlign: 'left',

  requireContact: false,

  contacts: {
    name: { enabled: false, required: false },
    phone: { enabled: true, required: false },
    email: { enabled: true, required: true },
    when: 'beforeDialog',
  },

  // Стартовый сценарий бота (дерево быстрых ответов) — повторяет макет первого экрана.
  scenario: {
    enabled: true,
    startStepId: 'start',
    steps: [
      {
        id: 'start',
        message: '',
        position: { x: 0, y: 0 },
        buttons: [
          { id: 'b-about', label: 'Что такое Lemnity', next: 'about' },
          { id: 'b-premium', label: 'Хочу премиум аккаунт', next: 'premium' },
          { id: 'b-support', label: 'Наша тех. поддержка', next: 'support' },
          { id: 'b-manager', label: 'Чат с менеджерами', next: null },
        ],
      },
      {
        id: 'about',
        message: 'Lemnity — конструктор виджетов для сайта: чат, формы, акции и многое другое.',
        position: { x: 380, y: -200 },
        buttons: [{ id: 'about-back', label: '← Назад', next: 'start' }],
      },
      {
        id: 'premium',
        message: 'Премиум-аккаунт открывает все виджеты и снимает лимиты. Рассказать подробнее?',
        position: { x: 380, y: 0 },
        buttons: [{ id: 'premium-back', label: '← Назад', next: 'start' }],
      },
      {
        id: 'support',
        message: 'Наша тех. поддержка на связи — опишите вопрос, и мы поможем.',
        position: { x: 380, y: 200 },
        buttons: [{ id: 'support-back', label: '← Назад', next: 'start' }],
      },
    ],
  },

  brandingEnabled: true,
}

export const buildChatWidgetSettings = (): ChatWidgetType =>
  chatWidgetDefaults

export const buildChatFieldsSettings = (): FieldsSettings =>
  ({}) as FieldsSettings
// Чат использует стандартную вкладку «Отображение» → сидим стандартными дефолтами.
// Положение по умолчанию — правый нижний угол; плюс два дефолтных приветствия для лаунчера
// «Аватарка» (плейсхолдер имени подставляется в рантайме).
export const buildChatDisplaySettings = (): DisplaySettings => {
  const base = buildStandardDisplaySettings()
  return {
    ...base,
    icon: { ...base.icon, position: 'bottom-right' },
    greetings: ['Здравствуйте', 'Меня зовут (имя менеджера)', 'Чем могу помочь?'],
  } as DisplaySettings
}
export const buildChatIntegrationSettings = (): IntegrationSettings =>
  ({}) as IntegrationSettings
