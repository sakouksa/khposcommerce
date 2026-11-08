import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag, CheckCircle2, Package, Sparkles } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface BrandStatsCardsProps {
  brands?: any[]
  total?: number
  isLoading?: boolean
}

export const BrandStatsCards: React.FC<BrandStatsCardsProps> = ({
  brands = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : brands.length
    const activeCount = brands.filter((b: any) => Boolean(b.is_active ?? true)).length
    const withProductsCount = brands.filter((b: any) => Number(b.products_count || 0) > 0).length
    const totalProductsMapped = brands.reduce((sum: number, b: any) => sum + Number(b.products_count || 0), 0)
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (brands.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      withProductsCount,
      totalProductsMapped,
      activeRate,
    }
  }, [brands, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('products.statsTotalBrands', 'Total Brands')}
        value={stats.totalCount}
        suffix={` ${t('products.brandsUnit', 'brands')}`}
        useCounter={true}
        icon={Tag}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsActiveBrands', 'Active Brands')}
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
        title={t('products.statsAssignedBrands', 'In-Use Brands')}
        value={stats.withProductsCount}
        suffix={` ${t('products.brandsUnit', 'brands')}`}
        useCounter={true}
        icon={Package}
        variant="blue"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsTotalBrandedProducts', 'Branded Products')}
        value={stats.totalProductsMapped}
        suffix={` ${t('products.itemsUnit', 'items')}`}
        useCounter={true}
        icon={Sparkles}
        variant="purple"
        loading={isLoading}
      />
    </div>
  )
}

export default BrandStatsCards
