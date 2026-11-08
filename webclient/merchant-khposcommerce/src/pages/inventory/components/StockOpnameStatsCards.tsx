import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, FileCheck, Layers } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface StockOpnameStatsCardsProps {
  opnames?: any[]
  total?: number
  isLoading?: boolean
}

export const StockOpnameStatsCards: React.FC<StockOpnameStatsCardsProps> = ({
  opnames = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : opnames.length
    const completed = opnames.filter((o: any) => o.status === 'completed' || o.status === 'approved' || o.status === 'reconciled').length
    const inProgress = opnames.filter((o: any) => o.status === 'in_progress' || o.status === 'pending' || o.status === 'draft').length
    const totalVariance = opnames.reduce((sum: number, o: any) => sum + Math.abs(Number(o.variance_quantity || o.total_difference || 0)), 0)
    const completionRate = totalCount > 0 ? `${Math.round((completed / (opnames.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      completed,
      inProgress,
      totalVariance,
      completionRate,
    }
  }, [opnames, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('inventory.statsTotalOpnames', 'Total Stock Audits')}
        value={stats.totalCount}
        suffix={` ${t('inventory.auditsUnit', 'sessions')}`}
        useCounter={true}
        icon={Layers}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsCompletedOpnames', 'Completed & Reconciled')}
        value={stats.completed}
        suffix={` ${t('inventory.completedAuditsUnit', 'audited')}`}
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
        title={t('inventory.statsInProgressOpnames', 'Active Counting Sessions')}
        value={stats.inProgress}
        suffix={` ${t('inventory.activeAuditsUnit', 'counting')}`}
        useCounter={true}
        icon={Clock}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsReconciledVariance', 'Reconciled Variances')}
        value={stats.totalVariance}
        suffix={` ${t('inventory.varianceUnit', 'units')}`}
        useCounter={true}
        icon={FileCheck}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default StockOpnameStatsCards
