import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import * as authService from '@services/auth.ts'
import useAuthStore from '@stores/authStore.ts'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  // Таймаут берём из ENV, по умолчанию 1000 мс
  timeout: Number(import.meta.env.VITE_HTTP_TIMEOUT_MS) || 1000
})

http.interceptors.request.use(config => {
  const { token } = useAuthStore.getState()
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

    // retryCount — счётчик попыток повторного запроса после refresh
    const currentRetry = (originalConfig?.retryCount ?? 0) as number
    if (error.response?.status === 401 && originalConfig && currentRetry < 1) {
      originalConfig.retryCount = currentRetry + 1
      const newToken = await authService.refreshToken()
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
