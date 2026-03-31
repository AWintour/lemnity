import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import { memo, lazy } from 'react'

const HomePage = lazy(() => import('./pages/HomePage.tsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'))
const ProtectedRoute = lazy(() => import('./pages/ProtectedRoute.tsx'))
const FullWidthLayout = lazy(() => import('./layouts/FullWidthLayout.tsx'))
const PublicRoute = lazy(() => import('./pages/PublicRoute.tsx'))
const ProjectLayout = lazy(() => import('@/layouts/ProjectLayout/ProjectLayout.tsx'))
const ProjectWidgetsPage = lazy(() => import('@/pages/ProjectWidgetsPage.tsx'))
const CreateWidgetPage = lazy(() => import('@/pages/CreateWidgetPage.tsx'))
const WidgetPage = lazy(() => import('@/pages/WidgetPage.tsx'))
const EditWidgetPage = lazy(() => import('@/pages/EditWidgetPage.tsx'))
const WidgetPreviewPage = lazy(() => import('@/pages/WidgetPreviewPage.tsx'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.tsx'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.tsx'))
const RequestsPage = lazy(() => import('./pages/RequestsPage/RequestsPage.tsx'))

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
      <Route
        path="/login"
        element={
          <PublicRoute>
            <FullWidthLayout>
              <LoginPage />
            </FullWidthLayout>
          </PublicRoute>
        }
      />
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
