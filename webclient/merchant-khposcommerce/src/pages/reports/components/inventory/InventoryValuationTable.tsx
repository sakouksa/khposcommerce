import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, FileSpreadsheet, DollarSign } from 'lucide-react'
import api from '@/api/client'
import { formatCurrency } from '@/utils/formatters'
import type { InventoryFilterState } from './InventoryFilters'

interface Props {
  filters: InventoryFilterState
}

export const InventoryValuationTable: React.FC<Props> = ({ filters }) => {
  const { t } = useTranslation('reports')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-valuation-table', filters, page, search],
    queryFn: () =>
      api
        .get('/reports/inventory/valuation', {
          params: { ...filters, page, search, per_page: 15 },
        })
        .then((r) => r.data?.data ?? r.data),
  })

  const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  const lastPage = data?.last_page || 1

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            {t('inventory.valuationTableTitle', 'Inventory Valuation Log')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.valuationTableSubtitle', 'Comprehensive itemized stock valuation and profit margin breakdown')}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
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
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3 text-right">Cost Price</th>
              <th className="px-4 py-3 text-right">Total Valuation</th>
              <th className="px-4 py-3 text-right">Selling Price</th>
              <th className="px-4 py-3 text-right">Potential Revenue</th>
              <th className="px-4 py-3 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={10} className="px-4 py-3.5 bg-muted/20" />
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  No inventory valuation records matching active filters.
                </td>
              </tr>
            ) : (
              items.map((row: any) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.sku}</td>
                  <td className="px-4 py-3">{row.category_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.warehouse_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{Number(row.quantity)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.cost_price))}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-500">{formatCurrency(Number(row.inventory_value))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.selling_price))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-500">{formatCurrency(Number(row.potential_revenue))}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-500">{Number(row.margin_pct).toFixed(1)}%</td>
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
