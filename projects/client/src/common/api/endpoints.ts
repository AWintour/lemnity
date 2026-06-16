// Централизованный реестр эндпоинтов API
// Используем функции для динамических путей и as const для автодополнения

export const API = {
  AUTH: {
    LOGIN: '/auth/login' as const,
    REGISTER: '/auth/register' as const,
    LOGOUT: '/auth/logout' as const,
    REFRESH: '/auth/login/refresh' as const,
    ME: '/auth/me' as const,
    FORGOT_PASSWORD: '/auth/forgot-password' as const,
    RESET_PASSWORD: '/auth/reset-password' as const,
    OPERATOR_LOGIN: '/auth/operator/login' as const
  },
  PROJECTS: {
    LIST: '/projects' as const, // GET
    CREATE: '/projects' as const, // POST
    PROJECT: (id: string) => `/projects/${id}` as const // GET/PUT/PATCH/DELETE
  },
  WIDGETS: {
    LIST: '/widgets' as const, // GET
    CREATE: '/widgets' as const, // POST
    WIDGET: (id: string) => `/widgets/${id}` as const // GET/PUT/PATCH/DELETE
  },
  FILES: {
    CREATE: '/files' as const,
    IMAGES: '/files/images' as const,
    VIDEOS: '/files/videos' as const,
    UPLOADS: '/files/uploads' as const
  },
  STATS: {
    SUMMARY: '/stats/summary' as const,
    TIMESERIES: '/stats/timeseries' as const,
    EVENTS: '/stats/events' as const
  },
  REQUESTS: {
    LIST: '/requests' as const,
    REQUEST: (id: string) => `/requests/${id}` as const
  },
  CALLS: {
    LIST: '/calls' as const,
    RECORDING: (id: string) => `/calls/${id}/recording` as const
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations' as const,
    CONVERSATION: (id: string) => `/chat/conversations/${id}` as const,
    MESSAGES: (id: string) => `/chat/conversations/${id}/messages` as const,
    AI_USAGE: (widgetId: string) => `/chat/ai-usage?widgetId=${encodeURIComponent(widgetId)}` as const,
    AI_PAGES: (widgetId: string) => `/chat/ai-pages?widgetId=${encodeURIComponent(widgetId)}` as const,
    SUBSCRIPTION: (widgetId: string) => `/chat/subscription?widgetId=${encodeURIComponent(widgetId)}` as const
  },
  MANAGERS: {
    LIST: (projectId: string) => `/projects/${projectId}/managers` as const,
    MANAGER: (projectId: string, id: string) => `/projects/${projectId}/managers/${id}` as const
  },
  // Командные сущности «Модуля Чат» (операторы/отделы/распределение/соцсети/групповой чат).
  CHAT_OPS: {
    OPERATORS: (projectId: string) => `/projects/${projectId}/chat/operators` as const,
    OPERATOR: (projectId: string, id: string) => `/projects/${projectId}/chat/operators/${id}` as const,
    DEPARTMENTS: (projectId: string) => `/projects/${projectId}/chat/departments` as const,
    DEPARTMENT: (projectId: string, id: string) => `/projects/${projectId}/chat/departments/${id}` as const,
    DISTRIBUTION: (projectId: string) => `/projects/${projectId}/chat/distribution` as const,
    INTEGRATIONS: (projectId: string) => `/projects/${projectId}/chat/integrations` as const,
    INTEGRATION: (projectId: string, type: string) => `/projects/${projectId}/chat/integrations/${type}` as const,
    INTEGRATION_CONNECT: (projectId: string, type: string) => `/projects/${projectId}/chat/integrations/${type}/connect` as const,
    INTEGRATION_DISCONNECT: (projectId: string, type: string) => `/projects/${projectId}/chat/integrations/${type}/disconnect` as const,
    GROUP_MESSAGES: (projectId: string) => `/projects/${projectId}/chat/group-messages` as const
  },
  FEEDBACK: {
    SUBMIT: '/feedback' as const // POST — «Есть идея или замечания?»
  }
} as const

export type ApiRegistry = typeof API
