import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, CheckCircle2, Store, Globe } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface PaymentMethodStatsCardsProps {
  methods?: any[]
  isLoading?: boolean
}

export const PaymentMethodStatsCards: React.FC<PaymentMethodStatsCardsProps> = ({
  methods = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const stats = useMemo(() => {
    const totalCount = methods.length
    const activeCount = methods.filter((m: any) => m.is_active).length
    const posCount = methods.filter((m: any) => m.available_pos).length
    const onlineCount = methods.filter((m: any) => m.available_online).length

    return {
      totalCount,
      activeCount,
      posCount,
      onlineCount,
      activeRate: totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}%` : '0%',
    }
  }, [methods])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('finance.total_payment_methods', 'Total Methods')}
        value={stats.totalCount}
        suffix={` ${t('finance.methods_unit', 'methods')}`}
        useCounter={true}
        icon={CreditCard}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('finance.active_payment_methods', 'Active Methods')}
        value={stats.activeCount}
        suffix={` ${t('finance.methods_unit', 'methods')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
        change={{
          value: stats.activeRate,
          trend: 'up',
          label: t('finance.of_total', 'of total'),
        }}
      />
      <StatCard
        title={t('finance.pos_payment_methods', 'POS Supported')}
        value={stats.posCount}
        suffix={` ${t('finance.methods_unit', 'methods')}`}
        useCounter={true}
        icon={Store}
        variant="blue"
        loading={isLoading}
      />
      <StatCard
        title={t('finance.online_payment_methods', 'Online Store Supported')}
        value={stats.onlineCount}
        suffix={` ${t('finance.methods_unit', 'methods')}`}
        useCounter={true}
        icon={Globe}
        variant="purple"
        loading={isLoading}
      />
    </div>
  )
}

export default PaymentMethodStatsCards
