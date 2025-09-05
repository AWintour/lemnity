import { create } from 'zustand'
import * as authService from '@services/auth.ts'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setSession: (token: string) => void
  clearSession: () => void
  login: (email: string, password: string) => Promise<void>
  refreshToken: () => Promise<string | null>
  logout: () => Promise<void>
}

const initialState: Pick<AuthState, 'isAuthenticated' | 'token'> = {
  isAuthenticated: false,
  token: null
}

// Дедупликация параллельных вызовов refresh
let refreshPromise: Promise<string | null> | null = null

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        ...initialState,
        // TODO(backend): заменить на реальный вызов authService.login
        login: async (email: string, password: string) => {
          const { token } = await authService.login({ email, password })
          set({ isAuthenticated: true, token }, false, 'auth/login')
        },
        setSession: (token: string) => set({ token }, false, 'auth/setSession'),
        clearSession: () => set(initialState, false, 'auth/clearSession'),
        refreshToken: async () => {
          if (!refreshPromise) {
            refreshPromise = authService.refreshToken().finally(() => {
              refreshPromise = null
            })
          }
          const newToken = await refreshPromise
          if (newToken) {
            set({ token: newToken, isAuthenticated: true }, false, 'auth/refresh:success')
            return newToken
          }
          return null
        },
        logout: async () => {
          await authService.logout()
          set(initialState, false, 'auth/logout')
        }
      }),
      {
        name: 'auth',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: s => ({ token: s.token })
      }
    ),
    { name: 'authStore' }
  )
)

export default useAuthStore
