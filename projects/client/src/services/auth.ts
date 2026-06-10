import axios from 'axios'
import { http } from '@common/api/http.ts'
import { API } from '@common/api/endpoints.ts'
import type { LoginResponse, RegisterResponse, User } from '@lemnity/api-sdk'

interface IAuthPayload {
  email: string
  password: string
}

interface IRegisterPayload extends IAuthPayload {
  name: string
  phone: string
}

export async function login(payload: IAuthPayload): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(API.AUTH.LOGIN, payload, {
    withCredentials: true
  })
  return data
}

export async function register(payload: IRegisterPayload): Promise<RegisterResponse> {
  const { data } = await http.post<RegisterResponse>(API.AUTH.REGISTER, payload, {
    withCredentials: true
  })
  return data
}

export async function refreshToken(): Promise<string | null> {
  try {
    // Используем "чистый" axios, без интерсепторов http, чтобы избежать циклов
    const baseURL = import.meta.env.VITE_API_URL || http.defaults.baseURL
    const res = await axios.post<{ accessToken: string }>(API.AUTH.REFRESH, null, {
      baseURL,
      withCredentials: true,
      timeout: 1000
    })
    return res.data?.accessToken ?? null
  } catch {
    return null
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await http.get<User>(API.AUTH.ME, { withCredentials: true })
    return data
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

export async function forgotPassword(email: string): Promise<void> {
  await http.post(API.AUTH.FORGOT_PASSWORD, { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await http.post(API.AUTH.RESET_PASSWORD, { token, newPassword })
}
