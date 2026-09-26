import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, FileText, Download, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { formatCurrency } from '@/utils/formatters'

export interface SaleRecord {
  id: number
  invoice_number: string
  date: string
  customer?: { id: number; name: string; email?: string; phone?: string }
  branch?: { id: number; name: string }
  warehouse?: { id: number; name: string }
  paymentMethod?: { id: number; name: string; code?: string }
  items_count?: number
  subtotal: number
  discount_amount: number
  tax_amount: number
  grand_total: number
  profit?: number
  status: string
  notes?: string
}

interface SalesReportTableProps {
  data?: SaleRecord[]
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  isLoading?: boolean
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onExport: (format: 'csv' | 'excel' | 'pdf') => void
}

export const SalesReportTable: React.FC<SalesReportTableProps> = ({
  data = [],
  pagination,
  isLoading = false,
  search,
  onSearchChange,
  onPageChange,
  onSortChange,
  sortBy,
  sortOrder,
  onExport,
}) => {
  const { t } = useTranslation('reports')
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null)
  const [visibleColumns, setVisibleColumns] = useState({
    invoice: true,
    date: true,
    customer: true,
    branch: true,
    warehouse: true,
    paymentMethod: true,
    items: true,
    subtotal: true,
    discount: true,
    tax: true,
    grandTotal: true,
    profit: true,
    status: true,
  })
  const [showColumnConfig, setShowColumnConfig] = useState(false)

  const getStatusBadge = (status: string) => <StatusBadge status={status} />

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">{t('sales.detailedReport', 'Detailed Sales Transactions')}</h3>
          <p className="text-xs text-muted-foreground font-medium">Comprehensive transactional log and profit audit</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search invoice or customer..."
              className="pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background w-48 focus:w-64 transition-all focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Column Toggle dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnConfig(!showColumnConfig)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background hover:bg-muted transition-colors text-muted-foreground"
            >
              <SlidersHorizontal size={13} />
              <span>Columns</span>
            </button>

            {showColumnConfig && (
              <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 p-2 text-xs space-y-1.5">
                <div className="font-semibold text-foreground border-b border-border pb-1 mb-1">
                  Toggle Columns
                </div>
                {Object.keys(visibleColumns).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer capitalize hover:bg-muted p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[key]}
                      onChange={(e) =>
                        setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })
                      }
                      className="rounded border-border text-blue-600 focus:ring-blue-500"
                    />
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm space-y-1">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="font-medium">No sales transaction records found.</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filters or date range.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium bg-muted/30">
                {visibleColumns.invoice && (
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onSortChange('invoice_number')}
                  >
                    <div className="flex items-center gap-1">
                      {t('sales.invoiceNumber')}
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.date && (
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onSortChange('date')}
                  >
                    <div className="flex items-center gap-1">
                      {t('sales.date')}
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.customer && <th className="py-2.5 px-3">{t('sales.customer')}</th>}
                {visibleColumns.branch && <th className="py-2.5 px-3">{t('sales.branch')}</th>}
                {visibleColumns.warehouse && <th className="py-2.5 px-3">{t('sales.warehouse')}</th>}
                {visibleColumns.paymentMethod && <th className="py-2.5 px-3">{t('sales.paymentMethod')}</th>}
                {visibleColumns.items && <th className="py-2.5 px-3 text-center">{t('sales.items')}</th>}
                {visibleColumns.subtotal && <th className="py-2.5 px-3 text-right">{t('sales.subtotal')}</th>}
                {visibleColumns.discount && <th className="py-2.5 px-3 text-right">{t('sales.discount')}</th>}
                {visibleColumns.tax && <th className="py-2.5 px-3 text-right">{t('sales.tax')}</th>}
                {visibleColumns.grandTotal && (
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => onSortChange('grand_total')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('sales.grandTotal')}
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                )}
                {visibleColumns.profit && <th className="py-2.5 px-3 text-right">{t('sales.profit')}</th>}
                {visibleColumns.status && <th className="py-2.5 px-3 text-center">{t('sales.status')}</th>}
                <th className="py-2.5 px-3 text-center">{t('sales.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                  {visibleColumns.invoice && (
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {sale.invoice_number}
                    </td>
                  )}
                  {visibleColumns.date && (
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}
                    </td>
                  )}
                  {visibleColumns.customer && (
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </td>
                  )}
                  {visibleColumns.branch && (
                    <td className="py-2.5 px-3 text-muted-foreground">{sale.branch?.name || 'Main'}</td>
                  )}
                  {visibleColumns.warehouse && (
                    <td className="py-2.5 px-3 text-muted-foreground">{sale.warehouse?.name || 'Main'}</td>
                  )}
                  {visibleColumns.paymentMethod && (
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-muted rounded text-[11px]">
                        {sale.paymentMethod?.name || 'Cash'}
                      </span>
                    </td>
                  )}
                  {visibleColumns.items && (
                    <td className="py-2.5 px-3 text-center font-medium">{sale.items_count ?? 0}</td>
                  )}
                  {visibleColumns.subtotal && (
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      {formatCurrency(sale.subtotal)}
                    </td>
                  )}
                  {visibleColumns.discount && (
                    <td className="py-2.5 px-3 text-right text-rose-500">
                      -{formatCurrency(sale.discount_amount)}
                    </td>
                  )}
                  {visibleColumns.tax && (
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      {formatCurrency(sale.tax_amount)}
                    </td>
                  )}
                  {visibleColumns.grandTotal && (
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {formatCurrency(sale.grand_total)}
                    </td>
                  )}
                  {visibleColumns.profit && (
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sale.profit)}
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="py-2.5 px-3 text-center">{getStatusBadge(sale.status)}</td>
                  )}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedSale(sale)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
          <span className="text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{pagination.current_page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.last_page}</span> ({pagination.total} total sales)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
              className="p-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    pagination.current_page === p
                      ? 'bg-blue-600 text-white'
                      : 'border border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => onPageChange(pagination.current_page + 1)}
              className="p-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="text-base font-bold text-foreground">Sale Details</h4>
                <p className="text-xs text-muted-foreground">Invoice #{selectedSale.invoice_number}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-semibold text-foreground">{selectedSale.customer?.name || 'Walk-in'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-semibold text-foreground">
                    {selectedSale.date ? new Date(selectedSale.date).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Branch:</span>
                  <p className="font-semibold text-foreground">{selectedSale.branch?.name || 'Main'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-semibold text-foreground">{selectedSale.paymentMethod?.name || 'Cash'}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedSale.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedSale.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedSale.grand_total)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Estimated Profit</span>
                  <span>{formatCurrency(selectedSale.profit)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesReportTable
