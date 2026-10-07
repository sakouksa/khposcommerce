import React from 'react'
import { ProtectedRoute, type ProtectedRouteProps } from './ProtectedRoute'

export interface PermissionRouteProps extends ProtectedRouteProps {
  requiredPermission?: string | string[]
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredPermission,
  permission,
  ...props
}) => {
  return (
    <ProtectedRoute permission={requiredPermission || permission} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export default PermissionRoute
