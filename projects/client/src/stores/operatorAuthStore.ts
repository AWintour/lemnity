import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { API } from '@common/api/endpoints'

export type OperatorSession = {
  id: string
  name: string
  widgetId: string | null
}

type OperatorLoginResponse = {
  accessToken: string
  operator: OperatorSession
}

export interface OperatorAuthState {
  token: string | null
  operator: OperatorSession | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api'

/**
 * Изолированная сессия оператора чата (отдельно от authStore владельца). Токен — операторский JWT
 * из POST /auth/operator/login; используется только для модуля чата (REST + сокет).
 * Логин идёт через fetch (а не общий http), чтобы не создавать циклический импорт с http.ts.
 */
const useOperatorAuthStore = create<OperatorAuthState>()(
  persist(
    set => ({
      token: null,
      operator: null,
      login: async (email: string, password: string) => {
        const res = await fetch(`${apiBase}${API.AUTH.OPERATOR_LOGIN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        if (!res.ok) {
          throw new Error(res.status === 401 ? 'Неверный логин или пароль' : 'Ошибка входа')
        }
        const data = (await res.json()) as OperatorLoginResponse
        set({ token: data.accessToken, operator: data.operator })
      },
      logout: () => set({ token: null, operator: null })
    }),
    {
      name: 'operator-auth',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

export default useOperatorAuthStore
