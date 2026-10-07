import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sliders, CheckCircle2, Sparkles, Layers } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface AttributeStatsCardsProps {
  attributes?: any[]
  total?: number
  isLoading?: boolean
}

export const AttributeStatsCards: React.FC<AttributeStatsCardsProps> = ({
  attributes = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : attributes.length
    const activeCount = attributes.filter((a: any) => Boolean(a.is_active ?? true)).length
    const totalValues = attributes.reduce((sum: number, a: any) => sum + (Array.isArray(a.values) ? a.values.length : 0), 0)
    const typesCount = new Set(attributes.map((a: any) => a.type || 'select')).size
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (attributes.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      totalValues,
      typesCount,
      activeRate,
    }
  }, [attributes, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('products.statsTotalAttributes', 'Total Attributes')}
        value={stats.totalCount}
        suffix={` ${t('products.attributesUnit', 'attributes')}`}
        useCounter={true}
        icon={Sliders}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsActiveAttributes', 'Active Attributes')}
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
        title={t('products.statsTotalValues', 'Option Values')}
        value={stats.totalValues}
        suffix={` ${t('products.valuesUnit', 'values')}`}
        useCounter={true}
        icon={Sparkles}
        variant="blue"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsAttributeTypes', 'Attribute Types')}
        value={stats.typesCount}
        suffix={` ${t('products.typesUnit', 'types')}`}
        useCounter={true}
        icon={Layers}
        variant="purple"
        loading={isLoading}
      />
    </div>
  )
}

export default AttributeStatsCards
