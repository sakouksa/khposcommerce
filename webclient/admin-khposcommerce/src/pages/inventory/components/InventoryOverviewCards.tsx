import React from 'react'
import { useTranslation } from 'react-i18next'
import { Package, AlertTriangle, DollarSign } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { formatCurrency } from '@/utils/formatters'

// Re-export for any external modules that imported them from here
export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface InventoryOverviewCardsProps {
  analytics: any
  onFilterStatus?: (status: string) => void
  selectedStatus?: string
}

export const InventoryOverviewCards: React.FC<InventoryOverviewCardsProps> = ({
  analytics,
  onFilterStatus,
  selectedStatus = '',
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Total SKUs & Stock Levels */}
        <EnterpriseStatsCard
          title={t('totalItems', 'Total SKUs')}
          value={analytics.totalProducts}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={analytics.totalQty} />
              </span>{' '}
              {t('unitsInStock', 'units total')}
            </span>
          }
          icon={Package}
          variant="blue"
          onClick={() => onFilterStatus?.('')}
          isActive={selectedStatus === ''}
          tooltip={t('showAllStock', 'Click to view all stock levels')}
        />

        {/* Card 2: Inventory Valuation */}
        <EnterpriseStatsCard
          title={t('inventoryValuation', 'Stock Valuation')}
          value={analytics.inventoryValue}
          prefix="$"
          decimals={2}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                +{formatCurrency(analytics.potentialProfit || 0, 'USD')}
              </span>{' '}
              margin
            </span>
          }
          icon={DollarSign}
          variant="purple"
          delay={0.05}
        />

        {/* Card 3: Low Stock Alerts */}
        <EnterpriseStatsCard
          title={t('lowStockAlert', 'Low Stock Items')}
          value={analytics.lowStock}
          valueClassName="text-amber-500"
          subtitle={
            analytics.lowStock > 0
              ? t('reorderNeeded', 'Needs Replenishment')
              : t('healthyStock', 'Stock is Healthy')
          }
          icon={AlertTriangle}
          variant="amber"
          onClick={() => onFilterStatus?.(selectedStatus === 'low_stock' ? '' : 'low_stock')}
          isActive={selectedStatus === 'low_stock'}
          activeRingClass="ring-2 ring-amber-500/60 bg-amber-500/5"
          tooltip={t('filterLowStockItems', 'Click to filter low stock items')}
          delay={0.1}
        />

        {/* Card 4: Warehouse Utilization */}
        <EnterpriseStatsCard
          title={t('warehouseUtilization', 'Capacity Rate')}
          value={analytics.capacityUsage}
          suffix="%"
          decimals={1}
          subtitle={`${analytics.totalWarehouses} ${t('activeWarehouses', 'Active Warehouses')}`}
          progressRing={{
            percentage: analytics.capacityUsage,
            colorClass: 'text-primary',
          }}
          delay={0.15}
        />
      </EnterpriseStatsGrid>

      {/* Mini KPI summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label={t('todayStockIn', "Today's Inflow")}
          value={`+${analytics.todayStockIn} units`}
          valueColor="emerald"
        />
        <EnterpriseMiniStatsCard
          label={t('todayStockOut', "Today's Outflow")}
          value={`-${analytics.todayStockOut} units`}
          valueColor="rose"
        />
        <EnterpriseMiniStatsCard
          label={t('pendingTransfers', 'In-Transit Transfers')}
          value={`${analytics.pendingTransfers} active`}
          valueColor="blue"
        />
        <EnterpriseMiniStatsCard
          label={t('auditAccuracy', 'Cycle Count Accuracy')}
          value={`${analytics.opnameAccuracy}%`}
          valueColor="primary"
        />
      </div>
    </div>
  )
}

export default InventoryOverviewCards

