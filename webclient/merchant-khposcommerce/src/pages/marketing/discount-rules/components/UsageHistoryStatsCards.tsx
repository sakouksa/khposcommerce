import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { History, CheckCircle2, Ticket, TrendingUp } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface UsageHistoryStatsCardsProps {
  campaigns?: any[]
  isLoading?: boolean
}

export const UsageHistoryStatsCards: React.FC<UsageHistoryStatsCardsProps> = ({
  campaigns = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const stats = useMemo(() => {
    let totalRedemptions = 0
    let totalCap = 0
    let activeCampaigns = 0

    campaigns.forEach((c: any) => {
      if (c.is_active) activeCampaigns++
      const redemptions = Number(c.usage_count || c.usages_count || 0)
      totalRedemptions += redemptions
      if (c.usage_limit) totalCap += Number(c.usage_limit)
    })

    const avgRedemptions = campaigns.length > 0 ? Math.round(totalRedemptions / campaigns.length) : 0

    return {
      totalRedemptions,
      totalCap,
      activeCampaigns,
      avgRedemptions,
    }
  }, [campaigns])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('marketing.statsTotalRedemptions', 'Total Redemptions')}
        value={stats.totalRedemptions}
        suffix={` ${t('marketing.timesUnit', 'times')}`}
        useCounter={true}
        icon={History}
        variant="primary"
        loading={isLoading}
      />
      <StatCard
        title={t('marketing.statsActiveCampaigns', 'Active Campaigns')}
        value={stats.activeCampaigns}
        suffix={` ${t('marketing.campaignsUnit', 'campaigns')}`}
        useCounter={true}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
      />
      <StatCard
        title={t('marketing.statsAvgRedemption', 'Avg per Campaign')}
        value={stats.avgRedemptions}
        suffix={` ${t('marketing.timesUnit', 'times')}`}
        useCounter={true}
        icon={TrendingUp}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('marketing.statsAllocatedLimit', 'Total Allocated Limit')}
        value={stats.totalCap > 0 ? stats.totalCap : 'Unlimited'}
        suffix={stats.totalCap > 0 ? ` ${t('marketing.quotaUnit', 'quota')}` : ''}
        useCounter={typeof stats.totalCap === 'number' && stats.totalCap > 0}
        icon={Ticket}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default UsageHistoryStatsCards
