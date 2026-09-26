import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  CreditCard, 
  Wallet, 
  TrendingUp
} from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { useTranslation } from 'react-i18next'
import { EnterpriseStatsCard, EnterpriseStatsGrid } from '@/components/common'
import type { CustomerAnalytics } from '../types/customer.types'

interface CustomerStatsCardsProps {
  stats: CustomerAnalytics | any | undefined
  totalFallback: number
  selectedRfm?: string
  onSelectRfm?: (segment: string) => void
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({ 
  stats, 
  totalFallback,
  selectedRfm = '',
  onSelectRfm
}) => {
  const { t } = useTranslation(['customers', 'common'])

  const total = stats?.total_customers ?? totalFallback ?? 0
  const active = stats?.active_customers ?? 0
  const totalSpent = Number(stats?.total_spent ?? 0)
  const vipCount = stats?.vip_customers ?? 0
  const loyaltyPoints = Number(stats?.total_points ?? 0)
  
  // Enterprise Credit & Wallet Metrics
  const totalCreditLimit = Number(stats?.total_credit_limit ?? 0)
  const totalOutstanding = Number(stats?.total_outstanding_balance ?? 0)
  const creditHoldCount = Number(stats?.credit_hold_count ?? 0)
  const totalWalletBalance = Number(stats?.total_wallet_balance ?? 0)
  const avgChurnRisk = Number(stats?.avg_churn_risk ?? 15)

  const rfm = stats?.rfm_breakdown || {
    champions: 0,
    loyal: 0,
    potential: 0,
    at_risk: 0,
    hibernating: 0,
    new: 0,
  }

  return (
    <div className="print:hidden">
      {/* ─── 4 Standard Enterprise KPI Summary Cards ─── */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Total Registered Customers */}
        <EnterpriseStatsCard
          title={t('customers.cardCustomerDirectory', 'Customer Directory')}
          value={total}
          subtitle={
            <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {active} {t('common.active', 'Active')}
              </span>
              <span>•</span>
              <span className="text-primary font-semibold">
                {vipCount} {t('customers.vip', 'VIP')}
              </span>
            </span>
          }
          icon={Users}
          variant="primary"
        />

        {/* Card 2: B2B Credit & Receivables */}
        <EnterpriseStatsCard
          title={t('customers.b2bCreditLimit', 'B2B Credit & Receivables')}
          value={totalOutstanding}
          prefix="$"
          decimals={2}
          valueClassName="text-primary"
          subtitle={
            <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>
                ${totalCreditLimit.toLocaleString()} {t('customers.limitCap', 'Cap')}
              </span>
              <span>•</span>
              {creditHoldCount > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  {creditHoldCount} {t('customers.onHold', 'Locked')}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t('customers.allActive', 'All Clear')}
                </span>
              )}
            </span>
          }
          icon={CreditCard}
          variant="blue"
          delay={0.05}
        />

        {/* Card 3: Store Wallet & Prepaid Reserves */}
        <EnterpriseStatsCard
          title={t('customers.storeWalletReserves', 'Store Wallet & Prepaid')}
          value={totalWalletBalance}
          prefix="$"
          decimals={2}
          valueClassName="text-emerald-600 dark:text-emerald-400"
          subtitle={
            <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground">
                {loyaltyPoints.toLocaleString()} {t('customers.pts', 'Pts')}
              </span>
              <span>•</span>
              <span className="text-muted-foreground">{t('customers.pointsRewards', 'Rewards')}</span>
            </span>
          }
          icon={Wallet}
          variant="emerald"
          delay={0.1}
        />

        {/* Card 4: RFM Health & Retention Score */}
        <EnterpriseStatsCard
          title={t('customers.rfmHealthScore', 'RFM Health & Retention')}
          value={(100 - avgChurnRisk).toFixed(1)}
          suffix="%"
          useCounter={false}
          subtitle={
            <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="text-primary font-semibold">
                {rfm.champions + rfm.loyal} {t('customers.champions', 'Champions')}
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {rfm.at_risk} {t('customers.atRisk', 'At-Risk')}
              </span>
            </span>
          }
          icon={TrendingUp}
          variant="purple"
          delay={0.15}
        />
      </EnterpriseStatsGrid>
    </div>
  )
}

export default CustomerStatsCards
