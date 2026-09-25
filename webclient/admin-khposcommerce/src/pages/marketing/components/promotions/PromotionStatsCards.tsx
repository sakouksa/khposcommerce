import React from 'react'
import { useTranslation } from 'react-i18next'
import { Megaphone, Target, ShoppingBag, TrendingUp, Eye, Coins, DollarSign } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface PromotionStatsCardsProps {
  analytics?: {
    totalPromotions?: number
    runningPromotions?: number
    scheduledPromotions?: number
    expiredPromotions?: number
    pausedPromotions?: number
    draftPromotions?: number
    totalViews?: number
    totalClicks?: number
    totalCustomersReached?: number
    conversionRate?: number
    totalOrdersGenerated?: number
    totalRevenueGenerated?: number
    aov?: number
    totalPromotionDiscount?: number
    totalMarketingCost?: number
    netProfit?: number
    roi?: number
    profitMargin?: number
    todaysPromotions?: number
    endingToday?: number
    startingTomorrow?: number
    topCampaignName?: string
    highestRevenueVal?: number
    pendingApproval?: number
  }
}

export const PromotionStatsCards: React.FC<PromotionStatsCardsProps> = ({ analytics = {} }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const totalPromotions = analytics?.totalPromotions ?? 0
  const runningPromotions = analytics?.runningPromotions ?? 0
  const conversionRate = analytics?.conversionRate ?? 0
  const totalCustomersReached = analytics?.totalCustomersReached ?? 0
  const totalOrdersGenerated = analytics?.totalOrdersGenerated ?? 0
  const totalRevenueGenerated = analytics?.totalRevenueGenerated ?? 0
  const totalPromotionDiscount = analytics?.totalPromotionDiscount ?? 0
  const totalMarketingCost = analytics?.totalMarketingCost ?? 0
  const netProfit = analytics?.netProfit ?? 0
  const roi = analytics?.roi ?? 0
  const aov = analytics?.aov ?? 0
  const totalViews = analytics?.totalViews ?? 0

  const activeRatio = totalPromotions > 0 ? (runningPromotions / totalPromotions) * 100 : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Active Promotional Campaigns */}
        <EnterpriseStatsCard
          title={t('marketing:activeCampaigns', 'Active Campaigns')}
          value={totalPromotions}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={runningPromotions} />
              </span>{' '}
              {t('marketing:active', 'active now')}
            </span>
          }
          progressRing={{
            percentage: activeRatio,
            colorClass: 'text-blue-500',
          }}
          icon={Megaphone}
          variant="blue"
          delay={0.05}
        />

        {/* Card 2: Conversion Rate */}
        <EnterpriseStatsCard
          title={t('marketing:conversionRate', 'Conversion Rate')}
          value={conversionRate}
          suffix="%"
          decimals={1}
          subtitle={
            <span>
              {totalCustomersReached.toLocaleString()} reached
            </span>
          }
          progressRing={{
            percentage: conversionRate,
            colorClass: 'text-purple-500',
          }}
          icon={Target}
          variant="purple"
          delay={0.1}
        />

        {/* Card 3: Revenue Generated */}
        <EnterpriseStatsCard
          title={t('marketing:revenueGenerated', 'Revenue Generated')}
          value={totalRevenueGenerated}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              {totalOrdersGenerated.toLocaleString()} orders generated
            </span>
          }
          trend={{
            value: `+${roi}% ROI`,
            isPositive: true,
          }}
          icon={ShoppingBag}
          variant="emerald"
          delay={0.15}
        />

        {/* Card 4: Net Profit */}
        <EnterpriseStatsCard
          title={t('marketing:netProfit', 'Net Profit')}
          value={netProfit}
          prefix="$"
          decimals={2}
          subtitle={
            <span>
              Cost: ${totalMarketingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          }
          trend={{
            value: 'NET',
            isPositive: netProfit >= 0,
          }}
          icon={TrendingUp}
          variant="amber"
          delay={0.2}
        />
      </EnterpriseStatsGrid>

      {/* Secondary 4 Mini-Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label="Total Orders"
          value={totalOrdersGenerated}
          icon={ShoppingBag}
          valueColor="blue"
        />

        <EnterpriseMiniStatsCard
          label="Discounts Given"
          value={`$${totalPromotionDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Coins}
          valueColor="rose"
        />

        <EnterpriseMiniStatsCard
          label="Campaign Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          valueColor="purple"
        />

        <EnterpriseMiniStatsCard
          label="Average Ticket (AOV)"
          value={`$${aov.toFixed(2)}`}
          icon={DollarSign}
          valueColor="emerald"
        />
      </div>
    </div>
  )
}

export default PromotionStatsCards
