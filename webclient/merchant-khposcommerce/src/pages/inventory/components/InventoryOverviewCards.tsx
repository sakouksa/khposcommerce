import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  StockAlertOverviewCards,
  EnterpriseMiniStatsCard,
} from '@/components/common'

// Re-export for any external modules that imported them from here
export { AnimatedCounter, CircularProgressRing } from '@/components/common'

export interface InventoryOverviewCardsProps {
  analytics: any
  onFilterStatus?: (status: string) => void
  selectedStatus?: string
  loading?: boolean
  threshold?: number
  onRefresh?: () => void
  showTotalCard?: boolean
  showFilterPills?: boolean
  showMiniStats?: boolean
}

/**
 * InventoryOverviewCards
 *
 * Renders the global Stripe/Accent StockAlertOverviewCards (Card ឆូត)
 * seamlessly for the "Stock Levels & Alerts" tab cloned exactly from MiniStore KH.
 */
export const InventoryOverviewCards: React.FC<InventoryOverviewCardsProps> = ({
  analytics,
  onFilterStatus,
  selectedStatus = '',
  loading = false,
  threshold = 5,
  onRefresh,
  showTotalCard = false,
  showFilterPills = true,
  showMiniStats = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const outOfStock = Number(analytics?.outOfStock ?? analytics?.out_of_stock ?? 0)
  const lowStock = Number(analytics?.lowStock ?? analytics?.low_stock ?? 0)
  const total = Number(analytics?.totalProducts ?? analytics?.total_products ?? 0)
  const highStock = Number(analytics?.overstock ?? analytics?.high_stock ?? 0)
  const inStock = Math.max(0, total - outOfStock - lowStock)

  const activeTab =
    selectedStatus === 'overstock' || selectedStatus === 'high_stock'
      ? 'high_stock'
      : selectedStatus === ''
      ? 'all'
      : selectedStatus

  const handleSelectTab = (tab: string) => {
    if (tab === 'all') {
      onFilterStatus?.('')
    } else if (tab === 'high_stock') {
      onFilterStatus?.('overstock')
    } else {
      onFilterStatus?.(tab)
    }
  }

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 1. Global Stripe / Accent Stock Alert Overview Cards (Card ឆូត) + Filter Pills (MiniStore KH Clone) */}
      <StockAlertOverviewCards
        counts={{
          out_of_stock: outOfStock,
          low_stock: lowStock,
          in_stock: inStock,
          high_stock: highStock,
          total,
        }}
        threshold={threshold}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        loading={loading}
        onRefresh={onRefresh}
        showTotalCard={showTotalCard}
        showFilterPills={showFilterPills}
        showSubtitles={false}
      />

      {/* 2. Optional Mini KPI summary bar */}
      {showMiniStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EnterpriseMiniStatsCard
            label={t('todayStockIn', "Today's Inflow")}
            value={`+${analytics?.todayStockIn ?? 0} units`}
            valueColor="emerald"
          />
          <EnterpriseMiniStatsCard
            label={t('todayStockOut', "Today's Outflow")}
            value={`-${analytics?.todayStockOut ?? 0} units`}
            valueColor="rose"
          />
          <EnterpriseMiniStatsCard
            label={t('pendingTransfers', 'In-Transit Transfers')}
            value={`${analytics?.pendingTransfers ?? 0} active`}
            valueColor="blue"
          />
          <EnterpriseMiniStatsCard
            label={t('auditAccuracy', 'Cycle Count Accuracy')}
            value={`${analytics?.opnameAccuracy ?? 98.4}%`}
            valueColor="primary"
          />
        </div>
      )}
    </div>
  )
}

export default InventoryOverviewCards
