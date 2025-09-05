// Централизованный реестр эндпоинтов API
// Используем функции для динамических путей и as const для автодополнения

export const API = {
  AUTH: {
    LOGIN: '/auth/login' as const,
    LOGOUT: '/auth/logout' as const,
    REFRESH: '/auth/refresh' as const
  },
  WIDGETS: {
    LIST: '/widgets' as const, // GET
    CREATE: '/widgets' as const, // POST
    WIDGET: (id: string) => `/widgets/${id}` as const // GET/PUT/PATCH/DELETE
  }
} as const

export type ApiRegistry = typeof API
