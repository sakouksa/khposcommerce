import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export interface PublicRouteProps {
  children: React.ReactNode
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (isLoggedIn) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default PublicRoute
