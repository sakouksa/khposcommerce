import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { formatCurrency } from '@/utils/formatters'

export interface PurchaseReportRow {
  id: number
  reference_number?: string
  date?: string
  supplier?: { name: string }
  branch?: { name: string }
  warehouse?: { name: string }
  creator?: { name: string }
  status?: string
  payment_status?: string
  subtotal_base?: number
  tax_amount_base?: number
  discount_amount_base?: number
  shipping_cost_base?: number
  grand_total_base?: number
  paid_amount_base?: number
  due_amount_base?: number
}

interface PurchaseReportTableProps {
  data?: PurchaseReportRow[]
  pagination?: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
  isLoading?: boolean
  search?: string
  onSearchChange?: (val: string) => void
  onPageChange?: (page: number) => void
}

export const PurchaseReportTable: React.FC<PurchaseReportTableProps> = ({
  data = [],
  pagination,
  isLoading = false,
  search = '',
  onSearchChange,
  onPageChange
}) => {
  const { t } = useTranslation('reports')

  const renderStatusBadge = (status?: string) => <StatusBadge status={status || 'received'} />

  const renderPaymentStatusBadge = (status?: string) => <StatusBadge status={status || 'unpaid'} />

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary shadow-2xs">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {t('purchase.purchaseTransactions', 'Purchase Order Transactions Log')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Detailed list of all purchase orders, suppliers, and settlement status
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={t('purchase.searchPlaceholder', 'Search ref no, supplier...')}
            className="w-full h-9 pl-9 pr-3 bg-muted/20 border border-border/60 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="py-16 text-center text-xs font-semibold text-muted-foreground animate-pulse">
          Loading Purchase Transactions Log...
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center text-xs font-semibold text-muted-foreground">
          No purchase transactions found matching the filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-extrabold bg-muted/20 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3">{t('purchase.refNo', 'Ref No')}</th>
                <th className="py-3 px-3">{t('purchase.date', 'Date')}</th>
                <th className="py-3 px-3">{t('purchase.supplier', 'Supplier')}</th>
                <th className="py-3 px-3">{t('purchase.branch', 'Branch')}</th>
                <th className="py-3 px-3">{t('purchase.warehouse', 'Warehouse')}</th>
                <th className="py-3 px-3 text-center">{t('purchase.status', 'Status')}</th>
                <th className="py-3 px-3 text-center">{t('purchase.payment', 'Payment')}</th>
                <th className="py-3 px-3 text-right">{t('purchase.grandTotal', 'Grand Total')}</th>
                <th className="py-3 px-3 text-right">{t('purchase.paid', 'Paid')}</th>
                <th className="py-3 px-3 text-right">{t('purchase.due', 'Due')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-accent/40 transition-colors group">
                  <td className="py-3 px-3 font-extrabold text-foreground whitespace-nowrap font-mono text-[11px]">
                    {row.reference_number || `PUR-${row.id}`}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">
                    {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                    {row.supplier?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">
                    {row.branch?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">
                    {row.warehouse?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {renderStatusBadge(row.status)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {renderPaymentStatusBadge(row.payment_status)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-foreground whitespace-nowrap">
                    {formatCurrency(row.grand_total_base)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(row.paid_amount_base)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(row.due_amount_base)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs font-bold text-muted-foreground">
          <div>
            Showing Page <span className="text-foreground">{pagination.current_page}</span> of{' '}
            <span className="text-foreground">{pagination.last_page}</span> ({pagination.total} records)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.current_page - 1)}
              className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black">
              {pagination.current_page}
            </span>
            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => onPageChange && onPageChange(pagination.current_page + 1)}
              className="p-1.5 rounded-lg bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseReportTable
