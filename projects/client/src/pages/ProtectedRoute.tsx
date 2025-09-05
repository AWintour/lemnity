import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '@stores/authStore.ts'

const ProtectedRoute = ({ children }: { children: ReactElement }): ReactElement => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
