import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface SalesStatsCardsProps {
  sales?: any[]
  total?: number
  isLoading?: boolean
}

export const SalesStatsCards: React.FC<SalesStatsCardsProps> = ({
  sales = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['sales', 'common'])

  const stats = useMemo(() => {
    const totalOrders = total !== undefined ? total : sales.length
    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0)
    const completedOrders = sales.filter((s) => s.status === 'completed').length
    const pendingOrders = sales.filter((s) => s.status === 'pending').length
    const refundedOrCancelled = sales.filter((s) => s.status === 'refunded' || s.status === 'cancelled').length
    const completionRate = totalOrders > 0 ? `${Math.round((completedOrders / (sales.length || 1)) * 100)}%` : '100%'

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      refundedOrCancelled,
      completionRate,
    }
  }, [sales, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('sales.statsTotalRevenue', 'Total Revenue')}
        value={stats.totalRevenue}
        prefix="$"
        decimals={2}
        useCounter={true}
        icon={DollarSign}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('sales.statsCompleted', 'Completed Transactions')}
        value={stats.completedOrders}
        suffix={` ${t('sales.ordersUnit', 'orders')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.completionRate,
          trend: 'up',
          label: t('sales.completionRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('sales.statsPending', 'Pending / Unpaid')}
        value={stats.pendingOrders}
        suffix={` ${t('sales.pendingUnit', 'pending')}`}
        useCounter={true}
        icon={Clock}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('sales.statsReturnsRefunds', 'Refunds & Returns')}
        value={stats.refundedOrCancelled}
        suffix={` ${t('sales.returnsUnit', 'reversed')}`}
        useCounter={true}
        icon={RotateCcw}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default SalesStatsCards
