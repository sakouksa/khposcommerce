import React from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, Percent, Coins, TrendingUp, Users, Clock } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface CouponStatsCardsProps {
  analytics?: {
    totalCoupons?: number
    activeCoupons?: number
    expiredCoupons?: number
    disabledCoupons?: number
    totalRedeemed?: number
    redemptionRate?: number
    unusedCoupons?: number
    avgRedemptionPerCoupon?: number
    totalDiscountGiven?: number
    avgDiscountAmount?: number
    highestDiscount?: number
    todayDiscount?: number
    revenueGenerated?: number
    campaignCost?: number
    campaignProfit?: number
    roi?: number
    aov?: number
    todayCoupons?: number
    couponsUsedToday?: number
    newCustomersCoupons?: number
    returningCustomersCoupons?: number
    pendingCoupons?: number
    expiringSoon?: number
  }
}

export const CouponStatsCards: React.FC<CouponStatsCardsProps> = ({ analytics = {} }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const totalCoupons = analytics?.totalCoupons ?? 0
  const activeCoupons = analytics?.activeCoupons ?? 0
  const expiringSoon = analytics?.expiringSoon ?? 0
  const redemptionRate = analytics?.redemptionRate ?? 0
  const totalRedeemed = analytics?.totalRedeemed ?? 0
  const couponsUsedToday = analytics?.couponsUsedToday ?? 0
  const newCustomersCoupons = analytics?.newCustomersCoupons ?? 0
  const totalDiscountGiven = analytics?.totalDiscountGiven ?? 0
  const revenueGenerated = analytics?.revenueGenerated ?? 0
  const campaignProfit = analytics?.campaignProfit ?? 0
  const aov = analytics?.aov ?? 0
  const roi = analytics?.roi ?? 0

  const activeRatio = totalCoupons > 0 ? (activeCoupons / totalCoupons) * 100 : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Total Discount Vouchers */}
        <EnterpriseStatsCard
          title={t('marketing:totalCoupons', 'Discount Coupons')}
          value={totalCoupons}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={activeCoupons} />
              </span>{' '}
              {t('marketing:active', 'active')}
            </span>
          }
          progressRing={{
            percentage: activeRatio,
            colorClass: 'text-blue-500',
          }}
          icon={Ticket}
          variant="blue"
          delay={0.05}
        />

        {/* Card 2: Redemption Rate */}
        <EnterpriseStatsCard
          title={t('marketing:redemptionRate', 'Redemption Rate')}
          value={redemptionRate}
          suffix="%"
          decimals={1}
          subtitle={
            <span>
              {t('marketing:totalRedeemed', 'Total Redeemed')}: {totalRedeemed.toLocaleString()}
            </span>
          }
          progressRing={{
            percentage: redemptionRate,
            colorClass: 'text-purple-500',
          }}
          icon={Percent}
          variant="purple"
          delay={0.1}
        />

        {/* Card 3: Revenue Generated */}
        <EnterpriseStatsCard
          title={t('marketing:revenueGenerated', 'Revenue Generated')}
          value={revenueGenerated}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              {t('marketing:customerSavings', 'Savings')}: ${totalDiscountGiven.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          }
          trend={{
            value: `+${roi}% ROI`,
            isPositive: true,
          }}
          icon={Coins}
          variant="emerald"
          delay={0.15}
        />

        {/* Card 4: Campaign Profit */}
        <EnterpriseStatsCard
          title={t('marketing:campaignProfit', 'Campaign Profit')}
          value={campaignProfit}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              AOV: ${aov.toFixed(1)}
            </span>
          }
          trend={{
            value: 'PROFIT',
            isPositive: campaignProfit >= 0,
          }}
          icon={TrendingUp}
          variant="amber"
          delay={0.2}
        />
      </EnterpriseStatsGrid>

      {/* Secondary 4 Mini-Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label={t('marketing:usedToday', 'Used Today')}
          value={couponsUsedToday}
          icon={Ticket}
          valueColor="blue"
        />

        <EnterpriseMiniStatsCard
          label={t('marketing:customerSavings', 'Customer Savings')}
          value={`$${totalDiscountGiven.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Coins}
          valueColor="purple"
        />

        <EnterpriseMiniStatsCard
          label={t('marketing:newCustomers', 'New Customers')}
          value={newCustomersCoupons}
          icon={Users}
          valueColor="emerald"
        />

        <EnterpriseMiniStatsCard
          label={t('marketing:expiringSoon', 'Expiring Soon')}
          value={expiringSoon}
          icon={Clock}
          valueColor={expiringSoon > 0 ? 'amber' : 'emerald'}
        />
      </div>
    </div>
  )
}

export default CouponStatsCards
