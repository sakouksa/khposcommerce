import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Warehouse, CheckCircle2, Star, MapPin } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface WarehouseStatsCardsProps {
  warehouses?: any[]
  total?: number
  isLoading?: boolean
}

export const WarehouseStatsCards: React.FC<WarehouseStatsCardsProps> = ({
  warehouses = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['settings', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : warehouses.length
    const activeCount = warehouses.filter((w: any) => Boolean(w.is_active ?? true)).length
    const mainWarehouses = warehouses.filter((w: any) => Boolean(w.is_main)).length
    const citiesCount = new Set(warehouses.map((w: any) => w.city).filter(Boolean)).size
    const activeRate = totalCount > 0 ? `${Math.round((activeCount / (warehouses.length || 1)) * 100)}%` : '100%'

    return {
      totalCount,
      activeCount,
      mainWarehouses,
      citiesCount,
      activeRate,
    }
  }, [warehouses, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('warehouses.statsTotal', 'Total Warehouses')}
        value={stats.totalCount}
        suffix={` ${t('warehouses.warehouseUnit', 'depots')}`}
        useCounter={true}
        icon={Warehouse}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('warehouses.statsActive', 'Active Facilities')}
        value={stats.activeCount}
        suffix={` ${t('warehouses.activeUnit', 'active')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: t('warehouses.activeRate', 'ratio'),
        }}
      />
      <StatCard
        title={t('warehouses.statsMain', 'Main / Central Depots')}
        value={stats.mainWarehouses}
        suffix={` ${t('warehouses.mainUnit', 'central')}`}
        useCounter={true}
        icon={Star}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('warehouses.statsCities', 'Covered Regions')}
        value={stats.citiesCount}
        suffix={` ${t('warehouses.regionsUnit', 'regions')}`}
        useCounter={true}
        icon={MapPin}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default WarehouseStatsCards
