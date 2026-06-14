import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import useAuthStore from '@stores/authStore.ts'
import useOperatorAuthStore from '@stores/operatorAuthStore.ts'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
})

http.interceptors.request.use(config => {
  // Сессия оператора (если активна) имеет приоритет: операторы используют только модуль чата
  // и не имеют owner-токена. Иначе — обычный токен владельца.
  const operatorToken = useOperatorAuthStore.getState().token
  const token = operatorToken ?? useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    type RetriableAxiosRequestConfig = AxiosRequestConfig & {
      retryCount?: number
    }
    const originalConfig = error.config as RetriableAxiosRequestConfig | undefined

    // Операторская сессия: рефреша нет — при 401 сбрасываем и уводим на вход оператора.
    if (error.response?.status === 401 && useOperatorAuthStore.getState().token) {
      useOperatorAuthStore.getState().logout()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/operator')) {
        window.location.assign('/operator')
      }
      return Promise.reject(error)
    }

    // retryCount — счётчик попыток повторного запроса после refresh
    const currentRetry = (originalConfig?.retryCount ?? 0) as number
    if (error.response?.status === 401 && originalConfig && currentRetry < 1) {
      originalConfig.retryCount = currentRetry + 1
      const newToken = await useAuthStore.getState().refreshToken()
      if (newToken) {
        originalConfig.headers = originalConfig.headers ?? {}
        originalConfig.headers.Authorization = `Bearer ${newToken}`
        return http.request(originalConfig)
      }
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(error)
  }
)
