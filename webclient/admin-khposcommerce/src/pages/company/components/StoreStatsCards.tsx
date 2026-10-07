import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Store, CheckCircle2, Globe, ShoppingBag } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface StoreStatsCardsProps {
  stores?: any[]
  total?: number
  isLoading?: boolean
}

export const StoreStatsCards: React.FC<StoreStatsCardsProps> = ({
  stores = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['settings', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : stores.length
    const activeCount = stores.filter((s: any) => Boolean(s.is_active ?? true)).length
    const onlineCount = stores.filter((s: any) => s.type === 'online').length
    const physicalOrHybridCount = stores.filter((s: any) => s.type === 'offline' || s.type === 'hybrid').length
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (stores.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      onlineCount,
      physicalOrHybridCount,
      activeRate,
    }
  }, [stores, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('stores.statsTotal', 'Total Stores')}
        value={stats.totalCount}
        suffix={` ${t('stores.storeUnit', 'stores')}`}
        useCounter={true}
        icon={Store}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('stores.statsActive', 'Active Outlets')}
        value={stats.activeCount}
        suffix={` ${t('stores.activeUnit', 'active')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: t('stores.activeRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('stores.statsPOS', 'Physical & Hybrid Outlets')}
        value={stats.physicalOrHybridCount}
        suffix={` ${t('stores.posUnit', 'outlets')}`}
        useCounter={true}
        icon={ShoppingBag}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('stores.statsOnline', 'Online Channels')}
        value={stats.onlineCount}
        suffix={` ${t('stores.onlineUnit', 'channels')}`}
        useCounter={true}
        icon={Globe}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default StoreStatsCards
