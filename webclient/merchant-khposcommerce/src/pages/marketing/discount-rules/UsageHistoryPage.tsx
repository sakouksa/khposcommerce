import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { History, RefreshCw } from 'lucide-react'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup } from '@/components/common'
import { marketingService } from '@/services/marketingService'
import { UsageHistorySection } from './components/UsageHistorySection'
import UsageHistoryStatsCards from './components/UsageHistoryStatsCards'
import type { PromotionCampaign } from '../promotions/types'

export const UsageHistoryPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['promotions', 'usage-history'],
    queryFn: () => marketingService.getPromotions({ per_page: 100 }),
  })

  const campaigns: PromotionCampaign[] = React.useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.data)) return data.data.data
    return []
  }, [data])

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')), path: '/marketing/promotions' },
          { label: t('marketing.usageHistoryTitle', 'Usage History') },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <History size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('marketing.usageHistoryTitle', 'Promotion Usage History')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              'marketing.usageHistorySubtitle',
              'Audit log and records of promotional discounts and vouchers redeemed by customers across POS, Web, and App.'
            )}
          </p>
        </div>

        <HeaderActionsGroup>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>{t('marketing.refresh', 'Refresh')}</span>
          </button>
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <UsageHistoryStatsCards campaigns={campaigns} isLoading={isLoading} />

      <UsageHistorySection
        campaigns={campaigns}
        onOpenCampaign={() => {}}
      />
    </div>
  )
}

export default UsageHistoryPage
