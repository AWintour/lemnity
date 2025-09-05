import axios from 'axios'
import { http } from '@common/api/http.ts'
import { API } from '@common/api/endpoints.ts'

type LoginResponse = { token: string }

export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
  // Пока бэкенд не подключён: предотвращаем предупреждения линтера/TS об неиспользуемом параметре
  void payload
  // TODO: заменить на реальный вызов, когда бэкенд будет готов
  // const { data } = await http.post<LoginResponse>(API.AUTH.LOGIN, payload)
  // return data
  return Promise.resolve({ token: 'demo-token' })
}

export async function refreshToken(): Promise<string | null> {
  try {
    // Используем "чистый" axios, без интерсепторов http, чтобы избежать циклов
    const res = await axios.post<{ token: string }>(API.AUTH.REFRESH, null, {
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      timeout: 1000
    })
    return res.data?.token ?? null
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await http.post(API.AUTH.LOGOUT, null, { withCredentials: true })
  } catch {
    // игнорируем сетевые ошибки при попытке логаута
  }
}
