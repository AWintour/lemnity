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
    RESET_PASSWORD: '/auth/reset-password' as const
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
    VIDEOS: '/files/videos' as const
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
  MANAGERS: {
    LIST: (projectId: string) => `/projects/${projectId}/managers` as const,
    MANAGER: (projectId: string, id: string) => `/projects/${projectId}/managers/${id}` as const
  }
} as const

export type ApiRegistry = typeof API
