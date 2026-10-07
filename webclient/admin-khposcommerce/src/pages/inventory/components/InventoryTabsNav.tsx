import React from 'react'
import { useTranslation } from 'react-i18next'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'

interface InventoryTabsNavProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const InventoryTabsNav: React.FC<InventoryTabsNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const tabs = [
    { id: 'levels', label: t('tabs.levels', 'Stock Levels') },
    { id: 'movements', label: t('tabs.movements', 'Stock Movements') },
    { id: 'transfers', label: t('tabs.transfers', 'Stock Transfers') },
    { id: 'adjustments', label: t('tabs.adjustments', 'Stock Adjustments') },
    { id: 'opnames', label: t('tabs.opnames', 'Stock Audits') },
    { id: 'dashboard', label: t('tabs.dashboard', 'Analytics & Reports') },
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
