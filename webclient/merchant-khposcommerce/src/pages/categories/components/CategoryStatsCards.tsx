import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderTree, Folder, Layers, CheckCircle2 } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface CategoryStatsCardsProps {
  categories?: any[]
  total?: number
  isLoading?: boolean
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({
  categories = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : categories.length
    const rootCategories = categories.filter((c: any) => !c.parent_id).length
    const subCategories = categories.filter((c: any) => Boolean(c.parent_id)).length
    const activeCount = categories.filter((c: any) => Boolean(c.is_active ?? true)).length
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (categories.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      rootCategories,
      subCategories,
      activeCount,
      activeRate,
    }
  }, [categories, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('products.statsTotalCategories', 'Total Categories')}
        value={stats.totalCount}
        suffix={` ${t('products.categoriesUnit', 'categories')}`}
        useCounter={true}
        icon={FolderTree}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsRootCategories', 'Root Departments')}
        value={stats.rootCategories}
        suffix={` ${t('products.mainUnit', 'main')}`}
        useCounter={true}
        icon={Layers}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsSubcategories', 'Subcategories')}
        value={stats.subCategories}
        suffix={` ${t('products.subUnit', 'sub')}`}
        useCounter={true}
        icon={Folder}
        variant="blue"
        loading={isLoading}
      />
      <StatCard
        title={t('products.statsActiveCategories', 'Active Categories')}
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
    </div>
  )
}

export default CategoryStatsCards
