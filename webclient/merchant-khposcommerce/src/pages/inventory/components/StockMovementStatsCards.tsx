import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface StockMovementStatsCardsProps {
  movements?: any[]
  total?: number
  isLoading?: boolean
}

export const StockMovementStatsCards: React.FC<StockMovementStatsCardsProps> = ({
  movements = [],
  total,
  isLoading = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const stats = useMemo(() => {
    const totalCount = total !== undefined ? total : movements.length
    const inbound = movements.filter((m: any) => m.type === 'in' || m.type === 'addition' || Number(m.quantity) > 0).length
    const outbound = movements.filter((m: any) => m.type === 'out' || m.type === 'subtraction' || Number(m.quantity) < 0).length
    const internal = movements.filter((m: any) => m.type === 'transfer' || m.reference_type?.includes('transfer')).length

    return {
      totalCount,
      inbound,
      outbound,
      internal,
    }
  }, [movements, total])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('inventory.statsTotalMovements', 'Total Stock Logs')}
        value={stats.totalCount}
        suffix={` ${t('inventory.logsUnit', 'entries')}`}
        useCounter={true}
        icon={Activity}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsInbound', 'Stock In & Restock')}
        value={stats.inbound}
        suffix={` ${t('inventory.inUnit', 'received')}`}
        useCounter={true}
        icon={ArrowDownLeft}
        variant="emerald"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsOutbound', 'Stock Out & Sales')}
        value={stats.outbound}
        suffix={` ${t('inventory.outUnit', 'dispatched')}`}
        useCounter={true}
        icon={ArrowUpRight}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('inventory.statsTransfers', 'Transfers & Relocations')}
        value={stats.internal}
        suffix={` ${t('inventory.transferUnit', 'transfers')}`}
        useCounter={true}
        icon={ArrowLeftRight}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default StockMovementStatsCards
