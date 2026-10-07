import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AccessDeniedPage from '@/components/shared/AccessDeniedPage'

export interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string | string[]
  role?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission, role }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const hasRole = useAuthStore((s) => s.hasRole)
  const hasPermission = useAuthStore((s) => s.hasPermission)

  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (role && !hasRole(role)) {
    return <AccessDeniedPage />
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDeniedPage />
  }

  return <>{children}</>
}

export default ProtectedRoute
