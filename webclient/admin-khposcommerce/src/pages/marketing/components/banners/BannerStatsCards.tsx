import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, Eye, MousePointerClick, DollarSign, Store, Globe, Smartphone } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import type { BannerAnalytics } from '../../types/banner'

export { AnimatedCounter, CircularProgressRing } from '@/components/common'

interface BannerStatsCardsProps {
  analytics: BannerAnalytics
}

export const BannerStatsCards: React.FC<BannerStatsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['marketing', 'common'])

  const activeRatio = analytics.totalBanners > 0
    ? (analytics.activeBanners / analytics.totalBanners) * 100
    : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* 4 Main Global Enterprise KPI Cards */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Total Banners */}
        <EnterpriseStatsCard
          title={t('marketing:totalBanners', 'Store Banners')}
          value={analytics.totalBanners}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-500 font-bold">
                <AnimatedCounter value={analytics.activeBanners} />
              </span>{' '}
              {t('marketing:active', 'active now')}
            </span>
          }
          progressRing={{
            percentage: activeRatio,
            colorClass: 'text-blue-500',
          }}
          icon={ImageIcon}
          variant="blue"
          delay={0.05}
        />

        {/* Card 2: Total Impressions */}
        <EnterpriseStatsCard
          title={t('marketing:totalImpressions', 'Total Impressions')}
          value={analytics.totalImpressions}
          subtitle={
            <span>
              {analytics.viewsToday.toLocaleString()} views today
            </span>
          }
          progressRing={{
            percentage: Math.min(analytics.avgCtrPercent * 5, 100),
            colorClass: 'text-purple-500',
          }}
          icon={Eye}
          variant="purple"
          delay={0.1}
        />

        {/* Card 3: Click-Through Rate (CTR) */}
        <EnterpriseStatsCard
          title={t('marketing:clickThroughRate', 'Click-Through Rate')}
          value={analytics.avgCtrPercent}
          suffix="%"
          decimals={1}
          subtitle={
            <span>
              {analytics.totalClicks.toLocaleString()} total clicks
            </span>
          }
          trend={{
            value: `${analytics.clicksToday} today`,
            isPositive: analytics.clicksToday > 0,
          }}
          icon={MousePointerClick}
          variant="amber"
          delay={0.15}
        />

        {/* Card 4: Attributed Revenue */}
        <EnterpriseStatsCard
          title={t('marketing:attributedRevenue', 'Attributed Revenue')}
          value={analytics.totalRevenueAttributed}
          prefix="$"
          decimals={2}
          subtitle="Omnichannel conversions"
          trend={{
            value: '+ROI',
            isPositive: true,
          }}
          icon={DollarSign}
          variant="emerald"
          delay={0.2}
        />
      </EnterpriseStatsGrid>

      {/* Secondary 4 Mini-Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label="Hero Main Banners"
          value={analytics.heroBannersCount}
          icon={Globe}
          valueColor="blue"
        />

        <EnterpriseMiniStatsCard
          label="POS Customer Displays"
          value={analytics.posCfdBannersCount}
          icon={Store}
          valueColor="emerald"
        />

        <EnterpriseMiniStatsCard
          label="Mobile App Slides"
          value={analytics.appBannersCount}
          icon={Smartphone}
          valueColor="purple"
        />

        <EnterpriseMiniStatsCard
          label="Clicks Today"
          value={analytics.clicksToday}
          icon={MousePointerClick}
          valueColor="amber"
        />
      </div>
    </div>
  )
}

export default BannerStatsCards
