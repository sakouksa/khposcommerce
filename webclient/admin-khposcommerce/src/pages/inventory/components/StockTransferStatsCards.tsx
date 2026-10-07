import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, CheckCircle2, Clock, Truck } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface StockTransferStatsCardsProps {
  transfers?: any[]
  total?: number
  isLoading?: boolean
}

export const StockTransferStatsCards: React.FC<StockTransferStatsCardsProps> = ({
  transfers = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : transfers.length
    const completed = transfers.filter((tr: any) => tr.status === 'completed' || tr.status === 'received').length
    const inTransit = transfers.filter((tr: any) => tr.status === 'in_transit' || tr.status === 'shipped').length
    const pending = transfers.filter((tr: any) => tr.status === 'pending' || tr.status === 'draft').length
    const completionRate = totalCount > 0 ? `${Math.round((completed / (transfers.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      completed,
      inTransit,
      pending,
      completionRate,
    }
  }, [transfers, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('inventory.statsTotalTransfers', 'Total Stock Transfers')}
        value={stats.totalCount}
        suffix={` ${t('inventory.transfersUnit', 'transfers')}`}
        useCounter={true}
        icon={ArrowLeftRight}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsCompletedTransfers', 'Completed Transfers')}
        value={stats.completed}
        suffix={` ${t('inventory.completedUnit', 'received')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.completionRate,
          trend: 'up',
          label: t('inventory.completedRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('inventory.statsInTransitTransfers', 'In Transit / Logistics')}
        value={stats.inTransit}
        suffix={` ${t('inventory.transitUnit', 'in transit')}`}
        useCounter={true}
        icon={Truck}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsPendingTransfers', 'Pending Preparation')}
        value={stats.pending}
        suffix={` ${t('inventory.pendingUnit', 'pending')}`}
        useCounter={true}
        icon={Clock}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default StockTransferStatsCards
