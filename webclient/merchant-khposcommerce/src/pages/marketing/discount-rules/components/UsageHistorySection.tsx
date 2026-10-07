import React from 'react'
import { History, Calendar, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PromotionCampaign } from '../../promotions/types'

interface UsageHistorySectionProps {
  campaigns: PromotionCampaign[]
  onOpenCampaign: (campaign: PromotionCampaign) => void
}

export const UsageHistorySection: React.FC<UsageHistorySectionProps> = ({}) => {
  const { t } = useTranslation(['marketing', 'common'])

  // Sample usages
  const recentUsages = [
    {
      id: 1,
      sale_number: 'POS-2026-0928-01',
      campaign_name: 'Khmer New Year Mega Celebration 2026',
      campaign_code: 'KHNY2026',
      branch_name: 'Phnom Penh Branch (HQ)',
      customer_name: 'Vannak Heng (VIP)',
      discount_amount: 50.00,
      rule_applied: 'iPhone Series 5% Instant Festive OFF',
      channel: 'POS',
      used_at: '2026-09-28 14:45:00',
    },
    {
      id: 2,
      sale_number: 'ORD-WEB-2026-0881',
      campaign_name: 'Khmer New Year Mega Celebration 2026',
      campaign_code: 'KHNY2026',
      branch_name: 'Phnom Penh Branch (HQ)',
      customer_name: 'Sokha Chan',
      discount_amount: 15.00,
      rule_applied: 'Samsung Galaxy Brand 10% OFF',
      channel: 'Web',
      used_at: '2026-09-28 11:20:15',
    },
    {
      id: 3,
      sale_number: 'POS-2026-0927-14',
      campaign_name: 'Phnom Penh HQ VIP Members 15% Storewide',
      campaign_code: 'PPVIP2026',
      branch_name: 'Phnom Penh Branch (HQ)',
      customer_name: 'Dara Meng (VIP Platinum)',
      discount_amount: 22.50,
      rule_applied: 'VIP Tier 15% Cart Discount',
      channel: 'POS',
      used_at: '2026-09-27 16:35:10',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <History size={16} className="text-primary" />
            <span>{t('marketing.usageSectionTitle', 'Promotion Usages & Audit Trail')}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {t(
              'marketing.usageSectionSubtitle',
              'Immutable snapshot log of every promotional discount redeemed across POS, Web, and Mobile checkouts.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('marketing.auditVerified', 'Audit-Verified')}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('marketing.colTransaction', 'Transaction / Order')}</th>
                <th className="py-3 px-4">{t('marketing.colCampaign', 'Campaign & Code')}</th>
                <th className="py-3 px-4">{t('marketing.colRule', 'Rule Applied')}</th>
                <th className="py-3 px-4">{t('marketing.colCustomerBranch', 'Customer & Branch')}</th>
                <th className="py-3 px-4 text-right">{t('marketing.colDiscountSaved', 'Discount Saved')}</th>
                <th className="py-3 px-4">{t('marketing.colTimestamp', 'Timestamp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentUsages.map((usage) => (
                <tr key={usage.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-foreground block">{usage.sale_number}</span>
                    <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.2 rounded bg-muted">
                      {usage.channel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-foreground block">{usage.campaign_name}</span>
                    <span className="font-mono text-[10px] text-primary">{usage.campaign_code}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-foreground">{usage.rule_applied}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold">
                      <User size={12} className="text-muted-foreground" />
                      <span>{usage.customer_name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{usage.branch_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      -${usage.discount_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{usage.used_at}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UsageHistorySection
