import { useAuthStore } from '@/stores/authStore'
import { normalizePermission } from '@/utils/permissionUtils'

/**
 * Enterprise RBAC React Hook
 * Provides high-level, type-safe permission checks and user role status.
 */
export function usePermission() {
  const user = useAuthStore((s) => s.user)
  const hasRole = useAuthStore((s) => s.hasRole)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission)
  const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions)

  const isSuperAdmin = Boolean(user?.roles?.includes('super_admin'))
  const isAdmin = Boolean(user?.roles?.includes('admin'))
  const isManager = Boolean(user?.roles?.includes('manager'))
  const isCashier = Boolean(user?.roles?.includes('cashier'))
  const isWarehouseStaff = Boolean(user?.roles?.includes('warehouse_staff'))

  return {
    user,
    roles: user?.roles ?? [],
    permissions: user?.permissions ?? [],
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
    isManager,
    isCashier,
    isWarehouseStaff,
    normalizePermission,
  }
}

export default usePermission
