import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * TenantBranchCacheSynchronizer listens for global branch-changed and company-changed
 * events dispatched by authStore, ensuring React Query caches are instantly invalidated
 * or purged to prevent any cross-branch or cross-tenant data bleed in the UI.
 */
const TenantBranchCacheSynchronizer: React.FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleBranchChanged = (_event: Event) => {
      // Mark all queries stale and trigger refetch for active views under new branch context
      queryClient.invalidateQueries()
    }

    const handleCompanyChanged = (_event: Event) => {
      // Hard clear all query cache items when switching tenant company
      queryClient.clear()
    }

    window.addEventListener('khpos:branch-changed', handleBranchChanged)
    window.addEventListener('khpos:company-changed', handleCompanyChanged)

    return () => {
      window.removeEventListener('khpos:branch-changed', handleBranchChanged)
      window.removeEventListener('khpos:company-changed', handleCompanyChanged)
    }
  }, [queryClient])

  return null
}

export default TenantBranchCacheSynchronizer
