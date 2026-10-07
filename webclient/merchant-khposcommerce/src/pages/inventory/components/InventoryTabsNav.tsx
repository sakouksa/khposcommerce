import React from 'react'
import { useTranslation } from 'react-i18next'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import { usePermission } from '@/hooks/usePermission'

interface InventoryTabsNavProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const InventoryTabsNav: React.FC<InventoryTabsNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation(['inventory', 'common'])
  const { hasPermission, hasAnyPermission } = usePermission()

  const canViewLevels = hasPermission('inventory.view')
  const canViewTransfers = hasAnyPermission(['stock_transfer.view', 'stock_transfer.transfer'])
  const canViewAdjustments = hasAnyPermission(['stock_adjustment.view', 'stock_adjustment.adjust'])
  const canViewOpnames = hasAnyPermission(['stock_opname.view', 'stock_opname.opname'])
  const canViewReports = hasAnyPermission(['report.view', 'inventory.view'])

  const tabs = [
    ...(canViewLevels ? [{ id: 'levels', label: t('tabs.levels', 'Stock Levels') }] : []),
    ...(canViewLevels ? [{ id: 'movements', label: t('tabs.movements', 'Stock Movements') }] : []),
    ...(canViewTransfers ? [{ id: 'transfers', label: t('tabs.transfers', 'Stock Transfers') }] : []),
    ...(canViewAdjustments ? [{ id: 'adjustments', label: t('tabs.adjustments', 'Stock Adjustments') }] : []),
    ...(canViewOpnames ? [{ id: 'opnames', label: t('tabs.opnames', 'Stock Audits') }] : []),
    ...(canViewReports ? [{ id: 'dashboard', label: t('tabs.dashboard', 'Analytics & Reports') }] : []),
  ]

  return (
    <WorkspaceTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onTabChange}
    />
  )
}

export default InventoryTabsNav
