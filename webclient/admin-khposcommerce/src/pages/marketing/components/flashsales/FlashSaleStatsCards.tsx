import React from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, TrendingUp, DollarSign, Package, Clock, ShoppingBag, AlertTriangle } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import type { FlashSaleAnalytics } from '../../types/flashSale'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface FlashSaleStatsCardsProps {
  analytics: FlashSaleAnalytics
}

export const FlashSaleStatsCards: React.FC<FlashSaleStatsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const activeRatio = analytics.totalSales > 0
    ? (analytics.activeSales / analytics.totalSales) * 100
    : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Flash Sale Campaigns */}
        <EnterpriseStatsCard
          title={t('marketing:totalFlashSales', 'Flash Sale Events')}
          value={analytics.totalSales}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={analytics.activeSales} />
              </span>{' '}
              {t('marketing:active', 'active now')}
            </span>
          }
          progressRing={{
            percentage: activeRatio,
            colorClass: 'text-blue-500',
          }}
          icon={Zap}
          variant="blue"
          delay={0.05}
        />

        {/* Card 2: Orders & Velocity */}
        <EnterpriseStatsCard
          title={t('marketing:orders', 'Flash Orders')}
          value={analytics.totalOrders}
          subtitle={
            <span>
              {analytics.totalProductsSold.toLocaleString()} {t('marketing:itemsSold', 'units sold')}
            </span>
          }
          progressRing={{
            percentage: analytics.conversionRate,
            colorClass: 'text-purple-500',
          }}
          icon={TrendingUp}
          variant="purple"
          delay={0.1}
        />

        {/* Card 3: Flash Sale Revenue */}
        <EnterpriseStatsCard
          title={t('marketing:totalRevenue', 'Flash Sale Revenue')}
          value={analytics.totalRevenue}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              Discounts: ${analytics.totalDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          }
          trend={{
            value: `+$${analytics.profitGenerated.toFixed(0)}`,
            isPositive: true,
          }}
          icon={DollarSign}
          variant="emerald"
          delay={0.15}
        />

        {/* Card 4: Average Order Value & Performance */}
        <EnterpriseStatsCard
          title="Flash Performance"
          value={analytics.aov}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              Conv. Rate: {analytics.conversionRate}%
            </span>
          }
          trend={{
            value: `${analytics.conversionRate}%`,
            isPositive: analytics.conversionRate >= 10,
          }}
          icon={Package}
          variant="amber"
          delay={0.2}
        />
      </EnterpriseStatsGrid>

      {/* Secondary 4 Mini-Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label="Today's Flash Revenue"
          value={`$${analytics.revenueTodayVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          valueColor="emerald"
        />

        <EnterpriseMiniStatsCard
          label="Orders Today"
          value={analytics.salesTodayCount}
          icon={ShoppingBag}
          valueColor="blue"
        />

        <EnterpriseMiniStatsCard
          label="Ending Soon"
          value={analytics.endingSoonCount}
          icon={Clock}
          valueColor={analytics.endingSoonCount > 0 ? 'amber' : 'emerald'}
        />

        <EnterpriseMiniStatsCard
          label="Low Stock Alerts"
          value={analytics.lowStockAlerts}
          icon={AlertTriangle}
          valueColor={analytics.lowStockAlerts > 0 ? 'rose' : 'emerald'}
        />
      </div>
    </div>
  )
}

export default FlashSaleStatsCards
