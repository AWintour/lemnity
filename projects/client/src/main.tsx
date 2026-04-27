import { StrictMode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeroUIProvider } from '@heroui/system'

import useAuthStore, { type AuthState } from '@stores/authStore.ts'
import YandexMetrika from './common/utils/yandexMetrika.ts'
import { useProjectsStore } from '@/stores/projectsStore'

import App from './App.tsx'
import { store } from './stores/redux/store.ts'
import './index.css'

const selectBootstrap = (s: AuthState) => s.bootstrap
const queryClient = new QueryClient()

export const Root = () => {
  const bootstrap = useAuthStore(selectBootstrap)
  const sessionStatus = useAuthStore(s => s.sessionStatus)
  const ensureProjectsLoaded = useProjectsStore(s => s.ensureLoaded)

  useEffect(() => {
    bootstrap().catch(() => undefined)
  }, [bootstrap])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      ensureProjectsLoaded().catch(() => undefined)
    }
  }, [sessionStatus, ensureProjectsLoaded])

  return (
    <StrictMode>
      <Provider store={store}>
        <HeroUIProvider>
          <BrowserRouter
            // done to silence the warning about the opt-in features
            // might need to remove once v7 releases
            future={{
              v7_startTransition: false,
              v7_relativeSplatPath: false,
            }}
          >
            <YandexMetrika />
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </BrowserRouter>
        </HeroUIProvider>
      </Provider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
