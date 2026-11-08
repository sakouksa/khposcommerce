import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Percent, Layers, Gift, CheckCircle2 } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface DiscountRulesStatsCardsProps {
  campaigns?: any[]
  isLoading?: boolean
}

export const DiscountRulesStatsCards: React.FC<DiscountRulesStatsCardsProps> = ({
  campaigns = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const stats = useMemo(() => {
    let totalRules = 0
    let bogoCount = 0
    let percentageCount = 0
    let activeCampaigns = 0

    campaigns.forEach((c: any) => {
      if (c.is_active) activeCampaigns++
      const rules = c.rules || []
      totalRules += rules.length
      rules.forEach((r: any) => {
        const type = String(r.type || r.discount_type || '').toLowerCase()
        if (type.includes('bogo') || type.includes('bundle')) bogoCount++
        if (type.includes('percent')) percentageCount++
      })
    })

    return {
      totalRules,
      activeCampaigns,
      bogoCount,
      percentageCount,
    }
  }, [campaigns])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      <StatCard
        title={t('marketing.statsTotalDiscountRules', 'Configured Rules')}
        value={stats.totalRules}
        suffix={` ${t('marketing.rulesUnit', 'rules')}`}
        useCounter={true}
        icon={Percent}
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
        title={t('marketing.statsBogoRules', 'BOGO & Bundles')}
        value={stats.bogoCount}
        suffix={` ${t('marketing.dealsUnit', 'deals')}`}
        useCounter={true}
        icon={Gift}
        variant="purple"
        loading={isLoading}
      />
      <StatCard
        title={t('marketing.statsPercentageRules', 'Percentage Discounts')}
        value={stats.percentageCount}
        suffix={` ${t('marketing.rulesUnit', 'rules')}`}
        useCounter={true}
        icon={Layers}
        variant="blue"
        loading={isLoading}
      />
    </div>
  )
}

export default DiscountRulesStatsCards
