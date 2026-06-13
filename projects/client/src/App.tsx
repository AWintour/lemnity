import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
// import WidgetsPage from './pages/WidgetsPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx'
import FullWidthLayout from './layouts/FullWidthLayout.tsx'
import PublicRoute from './pages/PublicRoute.tsx'
import ProjectLayout from '@/layouts/ProjectLayout/ProjectLayout'
import ProjectWidgetsPage from '@/pages/ProjectWidgetsPage'
import CreateWidgetPage from '@/pages/CreateWidgetPage'
import WidgetPage from '@/pages/WidgetPage'
import EditWidgetPage from '@/pages/EditWidgetPage'
import WidgetPreviewPage from '@/pages/WidgetPreviewPage'
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'
import AnalyticsPage from './pages/AnalyticsPage'
import RequestsPage from './pages/RequestsPage/RequestsPage.tsx'
import CallsPage from './pages/CallsPage/CallsPage.tsx'
import ChatsPage from './pages/ChatsPage/ChatsPage.tsx'
import ChatModulePage from './pages/ChatModulePage/ChatModulePage.tsx'
import EditorSsoPage from './pages/EditorSsoPage.tsx'
import { memo, useEffect } from 'react'

// Единый вход через общий ЛК lemnity.ru: у app нет своего логина — /login уводит на
// главную страницу входа. Покрывает и прямой заход на /login, и внутренние редиректы
// (ProtectedRoute, выход). Домен настраивается через VITE_LK_URL.
const LK_URL = import.meta.env.VITE_LK_URL || 'https://lemnity.ru'

const ExternalLoginRedirect = () => {
  useEffect(() => {
    window.location.replace(`${LK_URL}/login`)
  }, [])
  return null
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <HomePage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      {/* У app нет своего входа — /login уводит на общий ЛК lemnity.ru. */}
      <Route path="/login" element={<ExternalLoginRedirect />} />
      {/* SSO из ЛК: /editor?ticket=… меняет тикет на сессию app и уводит в редактор. */}
      <Route path="/editor" element={<EditorSsoPage />} />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <FullWidthLayout>
              <ResetPasswordPage />
            </FullWidthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <DashboardPage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <AnalyticsPage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <RequestsPage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <CallsPage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <FullWidthLayout>
              <ChatsPage />
            </FullWidthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-module"
        element={
          <ProtectedRoute>
            <ChatModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path=":projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="widgets" replace />} />
          <Route path="widgets">
            <Route index element={<ProjectWidgetsPage />} />
            <Route path="new" element={<CreateWidgetPage />} />
            <Route path=":widgetId">
              <Route index element={<WidgetPage />} />
              <Route path="edit" element={<EditWidgetPage />} />
              <Route path="preview" element={<WidgetPreviewPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      {/* Страница обслуживания может быть включена при необходимости */}
      <Route
        path="*"
        element={
          <FullWidthLayout>
            <NotFoundPage />
          </FullWidthLayout>
        }
      />
    </Routes>
  )
}

export default memo(App)
