import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sliders, PlusCircle, MinusCircle, CheckCircle2 } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface StockAdjustmentStatsCardsProps {
  adjustments?: any[]
  total?: number
  isLoading?: boolean
}

export const StockAdjustmentStatsCards: React.FC<StockAdjustmentStatsCardsProps> = ({
  adjustments = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : adjustments.length
    const additions = adjustments.filter((a: any) => a.type === 'addition' || a.type === 'in' || a.type === 'surplus').length
    const subtractions = adjustments.filter((a: any) => a.type === 'subtraction' || a.type === 'out' || a.type === 'damage' || a.type === 'shrinkage').length
    const approved = adjustments.filter((a: any) => a.status === 'approved' || a.status === 'completed').length
    const approvalRate = totalCount > 0 ? `${Math.round((approved / (adjustments.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      additions,
      subtractions,
      approved,
      approvalRate,
    }
  }, [adjustments, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('inventory.statsTotalAdjustments', 'Total Stock Adjustments')}
        value={stats.totalCount}
        suffix={` ${t('inventory.adjustmentsUnit', 'records')}`}
        useCounter={true}
        icon={Sliders}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsApprovedAdjustments', 'Approved & Reconciled')}
        value={stats.approved}
        suffix={` ${t('inventory.approvedUnit', 'approved')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.approvalRate,
          trend: 'up',
          label: t('inventory.approvedRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('inventory.statsPositiveAdjustments', 'Stock Additions / Found')}
        value={stats.additions}
        suffix={` ${t('inventory.additionUnit', 'items')}`}
        useCounter={true}
        icon={PlusCircle}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsNegativeAdjustments', 'Damages & Discrepancies')}
        value={stats.subtractions}
        suffix={` ${t('inventory.deductionUnit', 'deductions')}`}
        useCounter={true}
        icon={MinusCircle}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default StockAdjustmentStatsCards
