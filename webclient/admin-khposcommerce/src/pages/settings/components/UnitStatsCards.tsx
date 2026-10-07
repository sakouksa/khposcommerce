import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Scale, CheckCircle2, Layers, ArrowRightLeft } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface UnitStatsCardsProps {
  units?: any[]
  total?: number
  isLoading?: boolean
}

export const UnitStatsCards: React.FC<UnitStatsCardsProps> = ({
  units = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : units.length
    const activeCount = units.filter((u: any) => Boolean(u.is_active ?? true)).length
    const baseUnitsCount = units.filter((u: any) => !u.operator || Number(u.operator_value || 1) === 1).length
    const conversionUnitsCount = units.filter((u: any) => u.operator && Number(u.operator_value || 1) !== 1).length
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (units.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      baseUnitsCount,
      conversionUnitsCount,
      activeRate,
    }
  }, [units, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('products.statsTotalUnits', 'Total Units')}
        value={stats.totalCount}
        suffix={` ${t('products.unitsUnit', 'units')}`}
        useCounter={true}
        icon={Scale}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsActiveUnits', 'Active Units')}
        value={stats.activeCount}
        suffix={` ${t('products.activeUnit', 'active')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: t('products.activeRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('products.statsBaseUnits', 'Base Reference Units')}
        value={stats.baseUnitsCount}
        suffix={` ${t('products.unitsUnit', 'units')}`}
        useCounter={true}
        icon={Layers}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsConversionUnits', 'Conversion Rules')}
        value={stats.conversionUnitsCount}
        suffix={` ${t('products.rulesUnit', 'rules')}`}
        useCounter={true}
        icon={ArrowRightLeft}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default UnitStatsCards
