import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react'
import api from '@/api/client'
import type { InventoryFilterState } from './InventoryFilters'

interface Props {
  filters: InventoryFilterState
}

export const InventoryMovementTable: React.FC<Props> = ({ filters }) => {
  const { t } = useTranslation('reports')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-movements-table', filters, page, search],
    queryFn: () =>
      api
        .get('/reports/inventory/movements', {
          params: { ...filters, page, search, per_page: 15 },
        })
        .then((r) => r.data?.data ?? r.data),
  })

  const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  const lastPage = data?.last_page || 1

  const getMovementBadge = (type: string) => {
    const lower = type.toLowerCase()
    if (lower.includes('purchase') || lower.includes('in')) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
    if (lower.includes('sale') || lower.includes('out')) {
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    }
    if (lower.includes('transfer')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            {t('inventory.movementTableTitle', 'Stock Movement Transaction Logs')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.movementTableSubtitle', 'Real-time stock audit trail across purchases, sales, transfers & adjustments')}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search product or ref..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/60 bg-background text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-muted/50 border-b border-border/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Before</th>
              <th className="px-4 py-3 text-right">After</th>
              <th className="px-4 py-3">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={9} className="px-4 py-3.5 bg-muted/20" />
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No stock movement records matching active filters.
                </td>
              </tr>
            ) : (
              items.map((row: any) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{row.date?.split('T')[0] || row.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getMovementBadge(row.movement_type)}`}>
                      {row.movement_type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.product_name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.sku}</td>
                  <td className="px-4 py-3">{row.warehouse_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{Number(row.quantity)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{Number(row.before_stock)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{Number(row.after_stock)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.user_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">
          Page {page} of {lastPage}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
