import React from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Globe, Users, Clock, DollarSign, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface ShippingStatsCardsProps {
  analytics: {
    totalShipments: number
    deliveredCount: number
    pendingCount: number
    returnedCount: number
    failedCount: number
    onTimeRate: number
    avgDeliveryTimeDays: number
    totalShippingRevenue: number
    avgShippingFee: number
    freeShippingOrders: number
    totalShippingCost: number
    shippingProfit: number
    profitMargin: number
    todaysShipments: number
    todaysDelivered: number
    activeCouriersCount: number
    pendingPickupCount: number
    customerComplaints: number
  }
}

export const ShippingStatsCards: React.FC<ShippingStatsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['shipping', 'common'])

  const deliveryPercentage = analytics.totalShipments > 0
    ? (analytics.deliveredCount / analytics.totalShipments) * 100
    : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Logistics Shipments Volume */}
        <EnterpriseStatsCard
          title={t('shipping:logisticsShipments', 'Logistics Shipments')}
          value={analytics.totalShipments}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={analytics.deliveredCount} />
              </span>{' '}
              {t('shipping:delivered', 'delivered')}
            </span>
          }
          progressRing={{
            percentage: deliveryPercentage,
            colorClass: 'text-blue-500',
          }}
          icon={Truck}
          variant="blue"
          delay={0.05}
        />

        {/* Card 2: Active Courier Fleet */}
        <EnterpriseStatsCard
          title={t('shipping:activeCouriers', 'Active Couriers')}
          value={analytics.activeCouriersCount}
          subtitle={
            <span>
              {analytics.todaysShipments} {t('shipping:totalOrdersShipped', 'orders today')}
            </span>
          }
          trend={{
            value: t('shipping:active', 'Active'),
            isPositive: true,
          }}
          icon={Users}
          variant="emerald"
          delay={0.1}
        />

        {/* Card 3: In Transit & Pending Pickup */}
        <EnterpriseStatsCard
          title={t('shipping:inTransit', 'In Transit')}
          value={analytics.pendingCount}
          subtitle={
            <span>
              {t('shipping:pendingPickup', 'Pending Pickup')}: {analytics.pendingPickupCount}
            </span>
          }
          trend={{
            value: `${analytics.returnedCount} ${t('shipping:returned', 'returned')}`,
            isPositive: analytics.returnedCount === 0,
          }}
          icon={Clock}
          variant="amber"
          delay={0.15}
        />

        {/* Card 4: On-Time SLA Delivery Rate */}
        <EnterpriseStatsCard
          title={t('shipping:onTimeDelivery', 'On-Time Delivery SLA')}
          value={analytics.onTimeRate}
          suffix="%"
          decimals={1}
          subtitle={
            <span>
              {t('shipping:avgSla', 'Avg SLA')}: {analytics.avgDeliveryTimeDays} {t('shipping:days', 'Days')}
            </span>
          }
          progressRing={{
            percentage: analytics.onTimeRate,
            colorClass: 'text-purple-500',
          }}
          icon={Globe}
          variant="purple"
          delay={0.2}
        />
      </EnterpriseStatsGrid>

      {/* Secondary 4 Mini-Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label={t('shipping:shippingRevenue', 'Shipping Revenue')}
          value={`$${analytics.totalShippingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          valueColor="purple"
        />

        <EnterpriseMiniStatsCard
          label={t('shipping:shippingProfit', 'Net Freight Margin')}
          value={`$${analytics.shippingProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+${analytics.profitMargin}%)`}
          icon={TrendingUp}
          valueColor="emerald"
        />

        <EnterpriseMiniStatsCard
          label={t('shipping:delivered', 'Delivered Today')}
          value={analytics.todaysDelivered}
          icon={CheckCircle2}
          valueColor="blue"
        />

        <EnterpriseMiniStatsCard
          label={t('shipping:failed', 'Customer Issues')}
          value={analytics.customerComplaints}
          icon={AlertTriangle}
          valueColor={analytics.customerComplaints > 0 ? 'rose' : 'emerald'}
        />
      </div>
    </div>
  )
}

export default ShippingStatsCards
