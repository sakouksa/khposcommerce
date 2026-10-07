import React from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Calculator } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import Pagination from '@/components/shared/Pagination'
import type { PromotionCampaign } from '../types'

interface PromotionTableSectionProps {
  promotions: PromotionCampaign[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  getPromoStatus: (p: PromotionCampaign) => 'running' | 'scheduled' | 'expired' | 'paused' | 'draft'
  setDetailDrawerPromo: (p: PromotionCampaign) => void
  openEditModal: (p: PromotionCampaign) => void
  handleDuplicate: (p: PromotionCampaign) => void
  setDeleteTarget: (p: PromotionCampaign) => void
  toggleStatusMutation: any
  onOpenSimulator?: (p?: PromotionCampaign) => void
  pagination?: {
    current_page: number
    last_page: number
    total: number
  }
  perPage?: number
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
}

export const PromotionTableSection: React.FC<PromotionTableSectionProps> = ({
  promotions = [],
  isLoading,
  isFetching,
  visibleColumns,
  getPromoStatus,
  setDetailDrawerPromo,
  openEditModal,
  handleDuplicate,
  setDeleteTarget,
  toggleStatusMutation,
  onOpenSimulator,
  pagination,
  perPage = 15,
  onPageChange,
  onPerPageChange,
}) => {
  const { t } = useTranslation(['marketing', 'common'])
  const activeColsCount = Object.values(visibleColumns).filter(Boolean).length || 7

  const renderChannelBadges = (campaign: PromotionCampaign) => {
    const channels = campaign.channels?.map((c) => c.channel) || []
    if (channels.length === 0 || channels.includes('all')) {
      return (
        <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
          {t('marketing.allChannels', 'All Channels')}
        </span>
      )
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {channels.map((ch) => (
          <span
            key={ch}
            className="text-[11px] font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded uppercase"
          >
            {ch}
          </span>
        ))}
      </div>
    )
  }

  const renderBranchBadges = (campaign: PromotionCampaign) => {
    const branches = campaign.branches || []
    if (branches.length === 0) {
      return (
        <span className="text-xs text-muted-foreground">{t('marketing.allBranches', 'All Branches')}</span>
      )
    }

    const allNames = branches.map((b) => b.name).join(', ')

    if (branches.length === 1) {
      return (
        <span className="text-xs text-muted-foreground truncate block max-w-[230px]" title={allNames}>
          {branches[0].name}
        </span>
      )
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0" title={allNames}>
        <span className="truncate max-w-[170px]">{branches[0].name}</span>
        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0 cursor-help border border-border/50">
          +{branches.length - 1}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table border-collapse">
          <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
            <tr>
              {visibleColumns.name && <th className="min-w-[200px] max-w-[280px]">{t('marketing.campaign', 'Campaign')}</th>}
              {visibleColumns.type && <th className="min-w-[180px] max-w-[240px]">{t('marketing.rulesAndScope', 'Rules & Scope')}</th>}
              {visibleColumns.priority && <th className="w-[80px]">{t('marketing.priority', 'Priority')}</th>}
              {visibleColumns.dates && <th className="min-w-[130px]">{t('marketing.scheduleDates', 'Schedule')}</th>}
              {visibleColumns.performance && <th className="min-w-[140px]">{t('marketing.usageLimitRedemptions', 'Usage Limit & Redemptions')}</th>}
              {visibleColumns.status && <th className="w-[100px]">{t('common.status', 'Status')}</th>}
              {visibleColumns.actions && <th className="w-[60px] text-right">{t('common.actions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingSkeleton cols={activeColsCount} />
            ) : promotions.length === 0 ? (
              <EmptyState cols={activeColsCount} message={t('marketing.noCampaignsFound', 'No promotion campaigns found matching query.')} />
            ) : (
              promotions.map((p) => {
                const st = getPromoStatus(p)
                const ruleCount = p.rules?.length || p.rules_count || 0
                const usedCount = p.usage_count || p.usages_count || 0
                const maxUses = p.usage_limit || null
                const usagePercent = maxUses ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : null

                const startDateStr = p.start_at || p.starts_at
                const endDateStr = p.end_at || p.ends_at

                return (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.name && (
                      <td className="max-w-[280px]">
                        <div className="py-0.5 min-w-0">
                          <p
                            onClick={() => setDetailDrawerPromo(p)}
                            className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors text-sm truncate"
                            title={p.name}
                          >
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5" title={p.description}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.type && (
                      <td className="max-w-[240px]">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-foreground shrink-0">
                              {ruleCount} {ruleCount === 1 ? t('marketing.rule', 'Rule') : t('marketing.rules', 'Rules')}
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            {renderChannelBadges(p)}
                          </div>
                          <div className="min-w-0">{renderBranchBadges(p)}</div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.priority && (
                      <td className="text-xs font-mono text-muted-foreground">
                        {p.priority || 0}
                      </td>
                    )}
                    {visibleColumns.dates && (
                      <td className="text-xs text-muted-foreground whitespace-nowrap">
                        <div>{startDateStr ? new Date(startDateStr).toLocaleDateString() : t('marketing.dateImmediate', 'Immediate')}</div>
                        <div className="text-[11px] text-muted-foreground/80">{t('marketing.dateTo', 'to')} {endDateStr ? new Date(endDateStr).toLocaleDateString() : t('marketing.dateNever', 'Never')}</div>
                      </td>
                    )}
                    {visibleColumns.performance && (
                      <td className="text-xs">
                        <div className="space-y-1 min-w-[110px] max-w-[140px]">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{usedCount} {t('marketing.used', 'used')}</span>
                            {maxUses && <span>/ {maxUses}</span>}
                          </div>
                          {maxUses ? (
                            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          ) : (
                            <div className="text-[11px] text-muted-foreground">{t('marketing.unlimited', 'Unlimited')}</div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate({ id: p.id, is_active: !p.is_active })}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <StatusBadge status={st} />
                        </button>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => setDetailDrawerPromo(p)}
                          onEdit={() => openEditModal(p)}
                          onDelete={() => setDeleteTarget(p)}
                          items={[
                            {
                              label: t('marketing.testSimulator', 'Test in Pricing Simulator'),
                              icon: Calculator,
                              onClick: () => onOpenSimulator && onOpenSimulator(p),
                            },
                            {
                              label: t('marketing.duplicateCampaign', 'Duplicate Campaign'),
                              icon: Copy,
                              onClick: () => handleDuplicate(p),
                            },
                          ]}
                        />
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>

      {pagination && onPageChange && onPerPageChange && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </div>
  )
}
export default PromotionTableSection
