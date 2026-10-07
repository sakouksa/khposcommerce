import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'

export interface RouteGuardProps {
  children: React.ReactNode
}

/**
 * Route guard that requires the customer to be logged in.
 * Redirects unauthenticated users to the login page.
 */
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />
  }
  return <>{children}</>
}

/**
 * Route guard that only permits guest (unauthenticated) users.
 * Redirects logged-in users to their account dashboard.
 */
export const GuestRoute: React.FC<RouteGuardProps> = ({ children }) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (isLoggedIn) {
    return <Navigate to="/account" replace />
  }
  return <>{children}</>
}
