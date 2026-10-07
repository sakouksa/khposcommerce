import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface TransactionStatsCardsProps {
  transactions?: any[]
  isLoading?: boolean
}

export const TransactionStatsCards: React.FC<TransactionStatsCardsProps> = ({
  transactions = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  // Aggregate stats for overview KPI cards
  const stats = useMemo(() => {
    let totalInflow = 0
    let totalOutflow = 0
    let inflowCount = 0
    let outflowCount = 0

    transactions.forEach((tx: any) => {
      const amt = Math.abs(Number(tx.amount || 0))
      const isCredit = tx.type?.toLowerCase() === 'credit'
      if (isCredit) {
        totalOutflow += amt
        outflowCount += 1
      } else {
        totalInflow += amt
        inflowCount += 1
      }
    })

    const netCashflow = totalInflow - totalOutflow
    return {
      totalCount: transactions.length,
      totalInflow,
      totalOutflow,
      inflowCount,
      outflowCount,
      netCashflow,
    }
  }, [transactions])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      {/* Card 1: Total Transactions */}
      <StatCard
        title={t('finance.total_transactions', 'Total Transactions')}
        value={stats.totalCount}
        suffix={` ${t('finance.records_count', 'records')}`}
        useCounter={true}
        icon={Receipt}
        variant="primary"
        loading={isLoading}
      />

      {/* Card 2: Total Inflow */}
      <StatCard
        title={t('finance.total_inflow', 'Total Inflow')}
        value={stats.totalInflow}
        prefix="+$"
        decimals={2}
        useCounter={true}
        icon={ArrowUpRight}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.inflowCount,
          trend: 'up',
          label: t('finance.records_count', 'records'),
        }}
      />

      {/* Card 3: Total Outflow */}
      <StatCard
        title={t('finance.total_outflow', 'Total Outflow')}
        value={stats.totalOutflow}
        prefix="-$"
        decimals={2}
        useCounter={true}
        icon={ArrowDownRight}
        variant="rose"
        loading={isLoading}
        change={{
          value: stats.outflowCount,
          trend: 'down',
          label: t('finance.records_count', 'records'),
        }}
      />

      {/* Card 4: Net Cashflow */}
      <StatCard
        title={t('finance.net_cashflow', 'Net Cashflow')}
        value={Math.abs(stats.netCashflow)}
        prefix={stats.netCashflow >= 0 ? '+$' : '-$'}
        decimals={2}
        useCounter={true}
        icon={TrendingUp}
        variant={stats.netCashflow >= 0 ? 'emerald' : 'rose'}
        loading={isLoading}
        description={
          stats.netCashflow >= 0
            ? t('finance.cashflow_surplus', 'Positive Net Cashflow')
            : t('finance.cashflow_deficit', 'Negative Net Cashflow')
        }
      />
    </div>
  )
}

export default TransactionStatsCards
