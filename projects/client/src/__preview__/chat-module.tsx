/**
 * Превью «Модуля Чат» с мок-данными (без авторизации/сети).
 * Запуск: http://localhost:5173/preview/chat-module.html
 */
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/system'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ChatModulePage from '@/pages/ChatModulePage/ChatModulePage'
import '../index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <HeroUIProvider>
        <ChatModulePage preview />
      </HeroUIProvider>
    </BrowserRouter>
  </QueryClientProvider>,
)
