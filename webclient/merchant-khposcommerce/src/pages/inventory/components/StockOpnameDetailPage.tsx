import React from 'react'
import { X, CheckCircle2, AlertCircle, RefreshCw, Edit } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { formatShortDate } from '@/utils/formatters'

interface StockOpnameDetailPageProps {
  opnameId: number
  onClose: () => void
  onEdit?: () => void
}

export const StockOpnameDetailPage: React.FC<StockOpnameDetailPageProps> = ({
  opnameId,
  onClose,
  onEdit
}) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])

  const { data: detail, isLoading, isError, refetch } = useQuery({
    queryKey: ['stock-opname-detail', opnameId],
    queryFn: () => inventoryService.getOpname(opnameId),
    enabled: !!opnameId
  })

  const status = detail?.status || 'draft'
  const isCompleted = status === 'done' || status === 'completed' || status === 'approved'

  // Calculations
  const totalItemsCount = detail?.items?.length || detail?.checked_items || 0
  const matchedCount = detail?.matched_items ?? (detail?.items ?? []).filter((it: any) => Number(it.system_quantity) === Number(it.physical_quantity)).length
  const accuracyRate = totalItemsCount > 0 ? Math.round((matchedCount / totalItemsCount) * 100) : 100

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print:hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('opname_card', t('inventory.opname_card', 'Stock Audit Card'))}
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                REF: #{detail?.reference_number || `OPN-${opnameId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground font-medium">Loading opname audit record...</p>
          </div>
        ) : isError || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Failed to load opname audit</h3>
              <p className="text-xs text-muted-foreground">The requested stock opname snapshot could not be retrieved.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Banner */}
              <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground truncate">{detail.reference_number || `OPN-${opnameId}`}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {t('warehouse', t('inventory.warehouse', 'Warehouse Hub'))}: {detail.warehouse?.name || 'Main Warehouse'}
                  </p>
                  <div>
                    <StatusBadge status={isCompleted ? 'completed' : 'draft'} />
                  </div>
                </div>
              </div>

              {/* AUDIT SUMMARY STATS */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('auditAccuracySummary', t('inventory.auditAccuracySummary', 'AUDIT ACCURACY & SUMMARY'))}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-bold uppercase tracking-wider mb-1">
                      {t('accuracyRate', t('inventory.accuracyRate', 'Accuracy Rate'))}
                    </span>
                    <span className="font-extrabold text-purple-600 dark:text-purple-400 text-lg">{accuracyRate}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">
                      {t('matchedTotal', t('inventory.matchedTotal', 'Matched / Total'))}
                    </span>
                    <span className="font-extrabold text-foreground text-lg">{matchedCount} / {totalItemsCount}</span>
                  </div>
                </div>
              </div>

              {/* GENERAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('generalInfoCard', t('inventory.generalInfoCard', t('common.generalInfo', 'GENERAL INFORMATION')))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">
                      {t('warehouse', t('inventory.warehouse', 'Warehouse Hub'))}
                    </span>
                    <span className="font-bold text-foreground">{detail.warehouse?.name || 'Main Warehouse'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">
                      {t('colCreatedAt', t('inventory.colCreatedAt', 'Audit Date'))}
                    </span>
                    <span className="font-bold text-foreground">{formatShortDate(detail.opname_date || detail.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">
                      {t('auditor', t('inventory.auditor', 'Auditor / User'))}
                    </span>
                    <span className="font-bold text-foreground">{detail.user?.name || 'Super Admin'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">
                      {t('colStatus', t('inventory.colStatus', 'Status'))}
                    </span>
                    <span className="font-bold text-foreground uppercase">
                      {isCompleted
                        ? t('statusDone', t('inventory.statusDone', t('common.completed', 'Completed')))
                        : t('statusDraft', t('inventory.statusDraft', t('common.draft', 'Draft')))}
                    </span>
                  </div>
                </div>
              </div>

              {/* AUDIT VARIANCE ITEMS TABLE */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('varianceAuditLedger', t('inventory.varianceAuditLedger', 'VARIANCE AUDIT LEDGER'))}
                </h4>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-3">{t('colProductManagement', t('inventory.colProductManagement', 'Product Item'))}</th>
                        <th className="p-3 text-right">{t('system_qty', t('inventory.system_qty', 'System Qty'))}</th>
                        <th className="p-3 text-right">{t('physical_qty', t('inventory.physical_qty', 'Physical Qty'))}</th>
                        <th className="p-3 text-right">{t('diff', t('inventory.diff', 'Diff'))}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {(detail.items ?? []).map((item: any) => {
                        const sysQty = Number(item.system_quantity ?? 0)
                        const physQty = Number(item.physical_quantity ?? sysQty)
                        const diff = physQty - sysQty
                        return (
                          <tr key={item.id} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-bold text-foreground">{item.product?.name || `Product #${item.product_id}`}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">{item.product?.sku || 'SKU-0000'}</div>
                            </td>
                            <td className="p-3 text-right font-bold text-foreground">{sysQty}</td>
                            <td className="p-3 text-right font-bold text-foreground">{physQty}</td>
                            <td className={`p-3 text-right font-extrabold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                          </tr>
                        )
                      })}
                      {(detail.items ?? []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-muted-foreground">
                            {t('noOpnameRecordsYet', t('inventory.noOpnameRecordsYet', 'No items audited in this opname snapshot.'))}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REASON / NOTES */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('reasonRemarks', t('inventory.reasonRemarks', 'REASON & REMARKS'))}
                </h4>
                <p className="text-xs text-foreground bg-muted/30 border border-border/60 rounded-xl p-3.5 italic">
                  "{detail.notes || 'No remarks recorded for this audit count.'}"
                </p>
              </div>

              {/* TIMESTAMPS */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('systemMetadata', t('common.systemMetadata', 'SYSTEM METADATA'))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('recordCreated', t('common.recordCreated', 'Audit Snapshot Created'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('lastUpdated', t('common.lastUpdated', 'Last Updated'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              {!isCompleted && onEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Edit size={14} />
                  <span>{t('continueAuditCount', t('inventory.continueAuditCount', 'Continue Audit Count'))}</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t('buttons.close', t('common.close', 'Close'))}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
export default StockOpnameDetailPage
