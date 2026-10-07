import React from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Ticket, Clock, Layers } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

export interface PromotionAnalyticsData {
  totalPromotions?: number
  runningPromotions?: number
  scheduledPromotions?: number
  expiredPromotions?: number
  pausedPromotions?: number
  draftPromotions?: number
  totalRedemptions?: number
  totalUsageLimit?: number
  totalRules?: number
  expiringSoonPromotions?: number
  totalOrdersGenerated?: number
  totalRevenueGenerated?: number
  totalPromotionDiscount?: number
  totalMarketingCost?: number
  netProfit?: number
  roi?: number
  conversionRate?: number
  totalCustomersReached?: number
  aov?: number
  totalViews?: number
}

interface PromotionStatsCardsProps {
  analytics?: PromotionAnalyticsData
}

export const PromotionStatsCards: React.FC<PromotionStatsCardsProps> = ({ analytics = {} }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const totalPromotions = analytics?.totalPromotions ?? 0
  const runningPromotions = analytics?.runningPromotions ?? 0
  const scheduledPromotions = analytics?.scheduledPromotions ?? 0
  const pausedPromotions = analytics?.pausedPromotions ?? 0
  const expiringSoon = analytics?.expiringSoonPromotions ?? 0
  const totalRedemptions = analytics?.totalRedemptions ?? analytics?.totalOrdersGenerated ?? 0
  const totalUsageLimit = analytics?.totalUsageLimit ?? 0
  const totalRules = analytics?.totalRules ?? 0

  const activeRatio = totalPromotions > 0 ? (runningPromotions / totalPromotions) * 100 : 0
  const redemptionRate = totalUsageLimit > 0 ? Math.min(100, (totalRedemptions / totalUsageLimit) * 100) : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Active Campaigns */}
        <EnterpriseStatsCard
          title={t('marketing.activeCampaigns', 'Active Campaigns')}
          value={runningPromotions}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={runningPromotions} />
              </span>{' '}
              {t('marketing.outOfTotal', 'of {{total}} campaigns', { total: totalPromotions })}
            </span>
          }
          progressRing={{
            percentage: activeRatio,
            colorClass: 'text-emerald-500',
          }}
          icon={Sparkles}
          variant="emerald"
          delay={0.05}
        />

        {/* Card 2: Total Redemptions */}
        <EnterpriseStatsCard
          title={t('marketing.totalRedemptions', 'Total Redemptions')}
          value={totalRedemptions}
          subtitle={
            <span>
              {totalUsageLimit > 0
                ? t('marketing.outOfLimit', 'of {{limit}} quota', { limit: totalUsageLimit.toLocaleString() })
                : t('marketing.unlimitedQuota', 'Unlimited quota')}
            </span>
          }
          progressRing={{
            percentage: totalUsageLimit > 0 ? redemptionRate : 100,
            colorClass: 'text-blue-500',
          }}
          icon={Ticket}
          variant="blue"
          delay={0.1}
        />

        {/* Card 3: Scheduled / Expiring Soon */}
        <EnterpriseStatsCard
          title={t('marketing.scheduledAndUpcoming', 'Scheduled / Upcoming')}
          value={scheduledPromotions}
          subtitle={
            <span>
              {expiringSoon > 0
                ? t('marketing.expiringSoonCount', '{{count}} expiring soon', { count: expiringSoon })
                : pausedPromotions > 0
                ? t('marketing.pausedCount', '{{count}} paused', { count: pausedPromotions })
                : t('marketing.allOnSchedule', 'All active & planned')}
            </span>
          }
          trend={
            expiringSoon > 0
              ? { value: `${expiringSoon} expiring`, isPositive: false }
              : undefined
          }
          icon={Clock}
          variant="amber"
          delay={0.15}
        />

        {/* Card 4: Total Discount Rules */}
        <EnterpriseStatsCard
          title={t('marketing.totalDiscountRules', 'Discount Rules')}
          value={totalRules}
          subtitle={
            <span>
              {t('marketing.activeAcrossCampaigns', 'Configured across campaigns')}
            </span>
          }
          icon={Layers}
          variant="purple"
          delay={0.2}
        />
      </EnterpriseStatsGrid>
    </div>
  )
}

export default PromotionStatsCards
