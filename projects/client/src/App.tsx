import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import WidgetsPage from './pages/WidgetsPage.tsx'
import CreateCardPage from './pages/CreateCardPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import ProtectedRoute from './pages/ProtectedRoute.tsx'
import CenteredLayout from './layouts/CenteredLayout.tsx'
import FullWidthLayout from './layouts/FullWidthLayout.tsx'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <FullWidthLayout>
            <HomePage />
          </FullWidthLayout>
        }
      />
      <Route
        path="/login"
        element={
          <CenteredLayout>
            <LoginPage />
          </CenteredLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CenteredLayout>
              <DashboardPage />
            </CenteredLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/widgets"
        element={
          <ProtectedRoute>
            <CenteredLayout>
              <WidgetsPage />
            </CenteredLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cards/create"
        element={
          <ProtectedRoute>
            <CenteredLayout>
              <CreateCardPage />
            </CenteredLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <CenteredLayout>
            <NotFoundPage />
          </CenteredLayout>
        }
      />
    </Routes>
  )
}

export default App
