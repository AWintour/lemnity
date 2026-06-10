import { create } from 'zustand'
import * as authService from '@services/auth.ts'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import useUserStore from './userStore'

type SessionStatus = 'unknown' | 'authenticated' | 'guest'

export interface AuthState {
  accessToken: string | null
  sessionStatus: SessionStatus
  setSession: (token: string) => void
  clearSession: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone: string) => Promise<void>
  refreshToken: () => Promise<string | null>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
}

const initialState: Pick<AuthState, 'accessToken' | 'sessionStatus'> = {
  accessToken: null,
  sessionStatus: 'unknown'
}

// Дедупликация параллельных вызовов refresh
let refreshPromise: Promise<string | null> | null = null

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        login: async (email: string, password: string) => {
          const data = await authService.login({ email, password })
          const { user, accessToken } = data

          get().setSession(accessToken)
          useUserStore.getState().setUser(user)
        },
        register: async (email: string, password: string, name: string, phone: string) => {
          const data = await authService.register({ email, password, name, phone })
          const { user, accessToken } = data

          get().setSession(accessToken)
          useUserStore.getState().setUser(user)
        },
        setSession: (token: string) =>
          set({ accessToken: token, sessionStatus: 'authenticated' }, false, 'auth/setSession'),
        clearSession: () => {
          set(initialState, false, 'auth/clearSession')
          useUserStore.getState().clearUser()
        },
        refreshToken: async () => {
          if (!refreshPromise) {
            refreshPromise = authService.refreshToken().finally(() => {
              refreshPromise = null
            })
          }
          const newToken = await refreshPromise
          if (newToken) {
            set(
              { accessToken: newToken, sessionStatus: 'authenticated' },
              false,
              'auth/refresh:success'
            )
            return newToken
          }
          set({ accessToken: null, sessionStatus: 'guest' }, false, 'auth/refresh:fail')
          return null
        },
        logout: async () => {
          await authService.logout()
          get().clearSession()
        },
        bootstrap: async () => {
          // ВСЕГДА сверяем сессию с сервером по httpOnly refresh-cookie, а НЕ доверяем
          // закэшированному в sessionStorage accessToken. Иначе сквозной выход из ЛК
          // (кабинет гасит app refresh-cookie beacon'ом GET /api/auth/sso-logout) не
          // подхватывался бы, пока access-токен (1ч) не протухнет — пользователь
          // оставался бы «залогинен» на app после выхода из профиля. См. plans/plan-wid.md.
          const endAsGuest = (reason: string) => {
            // Не затираем сессию, если за время await её уже подняли (EditorSsoPage
            // → setSession после обмена тикета): иначе SSO-вход гонкой сбрасывался бы.
            const s = get()
            if (s.sessionStatus === 'authenticated' && s.accessToken) return
            set({ accessToken: null, sessionStatus: 'guest' }, false, reason)
            useUserStore.getState().clearUser()
          }
          try {
            const refreshed = await authService.refreshToken()
            if (refreshed) {
              set(
                { accessToken: refreshed, sessionStatus: 'authenticated' },
                false,
                'auth/bootstrap:refresh-from-cookie'
              )
              // Подтягиваем текущего пользователя (с ролью/email) — нужно для
              // ролевого/админ-гейтинга UI. Без этого user в сторе остаётся null
              // после обычной загрузки страницы.
              const me = await authService.getMe()
              if (me) useUserStore.getState().setUser(me)
              return
            }
            endAsGuest('auth/bootstrap:no-cookie')
          } catch {
            endAsGuest('auth/bootstrap:error')
          }
        }
      }),
      {
        name: 'auth',
        version: 1,
        storage: createJSONStorage(() => sessionStorage),
        partialize: s => ({ accessToken: s.accessToken })
      }
    ),
    { name: 'authStore' }
  )
)

export default useAuthStore
