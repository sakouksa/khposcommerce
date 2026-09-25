import React from 'react'
import { X, ArrowLeftRight, Package, Warehouse, User, Clock, AlertCircle, RefreshCw, Truck, CheckCircle2, Edit, Printer, ArrowRight, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StockTransferPrintVoucher from './StockTransferPrintVoucher'
import StatusBadge from '@/components/common/StatusBadge'
import { formatShortDate } from '@/utils/formatters'

interface StockTransferDetailPageProps {
  transferId: number
  onClose: () => void
  onEdit?: () => void
}

export const StockTransferDetailPage: React.FC<StockTransferDetailPageProps> = ({
  transferId,
  onClose,
  onEdit
}) => {
  const { t } = useTranslation()

  const { data: detail, isLoading, isError, refetch } = useQuery({
    queryKey: ['stock-transfer-detail', transferId],
    queryFn: () => inventoryService.getTransfer(transferId),
    enabled: !!transferId
  })

  const status = detail?.status || 'draft'
  const isDraft = status === 'draft'
  const isInTransit = status === 'in_transit'
  const isReceived = status === 'received' || status === 'completed'
  const isCancelled = status === 'cancelled'

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'draft': return t('inventory.status_draft', 'Draft')
      case 'in_transit': return t('inventory.status_in_transit', 'In Transit')
      case 'received': return t('inventory.status_received', 'Received')
      case 'completed': return t('inventory.status_completed', 'Completed')
      case 'cancelled': return t('inventory.status_cancelled', 'Cancelled')
      default: return st
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end print:static print:inset-auto print:overflow-visible print:block print:w-full print:bg-white print:p-0 print:m-0">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity print:hidden"
      />

      {/* Slide Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10 print:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card/95 backdrop-blur-md sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                {t('inventory.transfer_card', 'Transfer Card')}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60">
                  REF: #{detail?.reference_number || `TRF-${transferId}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title={t('inventory.printTransferNote', 'Print Note')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground font-medium">{t('inventory.loadingTransferRecord', 'Loading transfer record...')}</p>
          </div>
        ) : isError || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">{t('inventory.failedToLoadTransfer', 'Failed to load transfer')}</h3>
              <p className="text-xs text-muted-foreground">{t('inventory.failedToLoadTransferDesc', 'The requested stock transfer record could not be retrieved.')}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw size={14} />
              {t('common.retry', 'Retry')}
            </button>
          </div>
        ) : (
          <>
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status Step Pipeline Banner */}
              <div className="bg-gradient-to-br from-card via-muted/20 to-muted/40 border border-border/80 rounded-2xl p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {t('inventory.itemsCount', '{{count}} items', { count: detail.items?.length || 0 })}
                  </span>
                </div>

                {/* Stepper Pipeline */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${
                    isDraft || isInTransit || isReceived
                      ? 'bg-primary/5 border-primary/20 text-foreground'
                      : 'bg-muted/20 border-border/40 text-muted-foreground'
                  }`}>
                    <FileText size={16} className={isDraft || isInTransit || isReceived ? 'text-primary mb-1' : 'text-muted-foreground mb-1'} />
                    <span className="text-[10px] font-bold">{t('inventory.status_draft', 'Draft')}</span>
                  </div>

                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${
                    isInTransit || isReceived
                      ? 'bg-sky-500/10 border-sky-500/30 text-foreground'
                      : 'bg-muted/20 border-border/40 text-muted-foreground'
                  }`}>
                    <Truck size={16} className={isInTransit || isReceived ? 'text-sky-500 mb-1' : 'text-muted-foreground mb-1'} />
                    <span className="text-[10px] font-bold">{t('inventory.status_in_transit', 'In Transit')}</span>
                  </div>

                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border transition-all ${
                    isReceived
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                      : 'bg-muted/20 border-border/40 text-muted-foreground'
                  }`}>
                    <CheckCircle2 size={16} className={isReceived ? 'text-emerald-500 mb-1' : 'text-muted-foreground mb-1'} />
                    <span className="text-[10px] font-bold">{t('inventory.status_received', 'Received')}</span>
                  </div>
                </div>
              </div>

              {/* Warehouse Route Card */}
              <div className="border border-border/80 rounded-2xl bg-card p-4 shadow-2xs space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {t('inventory.transferRoute', 'Warehouse Transfer Route')}
                </h4>
                <div className="flex items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/60">
                  {/* Source Warehouse */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                      <Warehouse size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">{t('inventory.sourceWarehouse', 'Source Warehouse')}</span>
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">
                      {detail.from_warehouse?.name || '—'}
                    </p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex flex-col items-center shrink-0 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  {/* Destination Warehouse */}
                  <div className="flex-1 space-y-1 text-right min-w-0">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-[11px] font-medium">
                      <span className="truncate">{t('inventory.destinationWarehouse', 'Destination Warehouse')}</span>
                      <Warehouse size={13} className="text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">
                      {detail.to_warehouse?.name || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* TRANSFER ITEMS BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {t('inventory.transferItemsLedger', 'TRANSFER ITEMS LEDGER')}
                  </h4>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {t('inventory.totalItems', 'Total: {{count}}', {
                      count: (detail.items ?? []).reduce((acc: number, item: any) => acc + Number(item.quantity_requested || item.quantity || 0), 0)
                    })}
                  </span>
                </div>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-3">{t('inventory.colProductName', 'Product Item')}</th>
                        <th className="p-3 text-right">{t('inventory.reqQty', 'Req Qty')}</th>
                        <th className="p-3 text-right">{t('inventory.recQty', 'Rec Qty')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {(detail.items ?? []).map((item: any) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-foreground">{item.product?.name || `Product #${item.product_id}`}</div>
                            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                              {item.product?.sku ? `SKU: ${item.product.sku}` : '—'}
                              {item.variant ? ` • ${item.variant.name || item.variant.sku}` : ''}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-foreground">
                            {Number(item.quantity_requested ?? item.quantity ?? 0)}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(item.quantity_received ?? 0)}
                          </td>
                        </tr>
                      ))}
                      {(detail.items ?? []).length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-muted-foreground text-xs italic">
                            {t('inventory.noItemsInTransfer', 'No items listed in this transfer.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {(detail.items ?? []).length > 0 && (
                      <tfoot>
                        <tr className="bg-muted/40 border-t border-border/60 font-bold text-xs">
                          <td className="p-3 text-foreground">{t('common.total', 'Total')}</td>
                          <td className="p-3 text-right text-foreground">
                            {(detail.items ?? []).reduce((acc: number, item: any) => acc + Number(item.quantity_requested || item.quantity || 0), 0)}
                          </td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">
                            {(detail.items ?? []).reduce((acc: number, item: any) => acc + Number(item.quantity_received || 0), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* REASON / NOTES */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('inventory.reasonRemarks', 'REASON & REMARKS')}
                </h4>
                <div className="text-xs text-foreground bg-muted/30 border border-border/60 rounded-xl p-3.5 italic">
                  "{detail.notes || t('inventory.noNotesAttached', 'No notes attached to this transfer.')}"
                </div>
              </div>

              {/* METADATA GRID */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('common.systemMetadata', 'SYSTEM METADATA')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 border border-border/60 rounded-xl p-3.5">
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {t('inventory.operatorUser', 'Created By')}
                    </span>
                    <span className="font-bold text-foreground block truncate">
                      {detail.user?.name || 'Super Admin'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {t('common.recordCreated', 'Record Created')}
                    </span>
                    <span className="font-semibold text-foreground block">
                      {formatShortDate(detail.created_at)}
                    </span>
                  </div>

                  {detail.shipped_at && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        {t('inventory.shippedAt', 'Shipped Date')}
                      </span>
                      <span className="font-semibold text-foreground block">
                        {formatShortDate(detail.shipped_at)}
                      </span>
                    </div>
                  )}

                  {detail.received_at && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-muted-foreground block font-medium">
                        {t('inventory.receivedAt', 'Received Date')}
                      </span>
                      <span className="font-semibold text-foreground block">
                        {formatShortDate(detail.received_at)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      {t('common.lastUpdated', 'Last Updated')}
                    </span>
                    <span className="font-semibold text-foreground block">
                      {formatShortDate(detail.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card/95 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-20 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  {t('inventory.printTransferNote', 'Print Note')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isDraft && onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onEdit()
                    }}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                  >
                    <Edit size={14} />
                    {t('inventory.editTransfer', 'Edit Transfer')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {t('buttons.close', 'Close')}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Official A4 Stock Transfer Voucher (Print Only) */}
      <StockTransferPrintVoucher detail={detail} />
    </div>
  )
}
export default StockTransferDetailPage
