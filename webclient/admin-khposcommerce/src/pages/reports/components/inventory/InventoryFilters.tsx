import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar, Warehouse, Building2, Tag, Layers, RefreshCw, Filter, RotateCcw
} from 'lucide-react'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import { DatePicker } from '@/components/common'

export interface InventoryFilterState {
  date_from: string
  date_to: string
  warehouse_id: string
  branch_id: string
  category_id: string
  brand_id: string
  movement_type: string
  status: string
  stock_status?: string
  search?: string
  [key: string]: any
}

interface Props {
  filters: InventoryFilterState
  onChange: (newFilters: InventoryFilterState) => void
  onReset: () => void
  onRefresh: () => void
  isFetching?: boolean
}

export const InventoryFilters: React.FC<Props> = ({
  filters,
  onChange,
  onReset,
  onRefresh,
  isFetching,
}) => {
  const { t } = useTranslation('reports')

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const getThisWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff)).toISOString().split('T')[0]
    return { from: monday, to: todayStr }
  }

  const getThisMonth = () => {
    const d = new Date()
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
    return { from: firstDay, to: todayStr }
  }

  const handleQuickPreset = (type: 'today' | 'yesterday' | 'week' | 'month') => {
    if (type === 'today') {
      onChange({ ...filters, date_from: todayStr, date_to: todayStr })
    } else if (type === 'yesterday') {
      onChange({ ...filters, date_from: yesterdayStr, date_to: yesterdayStr })
    } else if (type === 'week') {
      const { from, to } = getThisWeek()
      onChange({ ...filters, date_from: from, date_to: to })
    } else if (type === 'month') {
      const { from, to } = getThisMonth()
      onChange({ ...filters, date_from: from, date_to: to })
    }
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-sm mb-6 space-y-4">
      {/* Top Filter Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('inventory.quickPreset', 'Quick Range')}:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleQuickPreset('today')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickPreset('yesterday')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickPreset('week')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickPreset('month')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
            >
              This Month
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border/80 rounded-xl hover:bg-accent/70 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border/80 rounded-xl hover:bg-accent/70 transition-all shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Date From */}
        <div>
          <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.dateFrom', 'Date From')}
          </label>
          <DatePicker
            value={filters.date_from}
            onChange={(val) => onChange({ ...filters, date_from: val })}
            placeholder="Select Start Date"
            className="w-full"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.dateTo', 'Date To')}
          </label>
          <DatePicker
            value={filters.date_to}
            onChange={(val) => onChange({ ...filters, date_to: val })}
            placeholder="Select End Date"
            className="w-full"
          />
        </div>

        {/* Warehouse */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.warehouse', 'Warehouse')}
          </label>
          <ModernSelect
            value={filters.warehouse_id}
            onChange={(val) => onChange({ ...filters, warehouse_id: val })}
            icon={<Warehouse className="h-4 w-4 text-amber-500" />}
            options={[
              { value: '', label: t('inventory.allWarehouses', 'All Warehouses') },
              { value: '1', label: 'Main Warehouse' },
              { value: '2', label: 'Warehouse North' },
              { value: '3', label: 'Warehouse South' },
            ]}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.category', 'Category')}
          </label>
          <ModernSelect
            value={filters.category_id}
            onChange={(val) => onChange({ ...filters, category_id: val })}
            icon={<Tag className="h-4 w-4 text-indigo-500" />}
            options={[
              { value: '', label: t('inventory.allCategories', 'All Categories') },
              { value: '1', label: 'Electronics' },
              { value: '2', label: 'Accessories' },
              { value: '3', label: 'Apparel' },
            ]}
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.brand', 'Brand')}
          </label>
          <ModernSelect
            value={filters.brand_id}
            onChange={(val) => onChange({ ...filters, brand_id: val })}
            icon={<Layers className="h-4 w-4 text-purple-500" />}
            options={[
              { value: '', label: t('inventory.allBrands', 'All Brands') },
              { value: '1', label: 'Apple' },
              { value: '2', label: 'Samsung' },
              { value: '3', label: 'Sony' },
            ]}
          />
        </div>

        {/* Movement Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {t('inventory.movementType', 'Movement Type')}
          </label>
          <ModernSelect
            value={filters.movement_type}
            onChange={(val) => onChange({ ...filters, movement_type: val })}
            icon={<Filter className="h-4 w-4 text-emerald-500" />}
            options={[
              { value: '', label: t('inventory.allMovements', 'All Movement Types') },
              { value: 'purchase', label: 'Purchase In' },
              { value: 'sale', label: 'Sale Out' },
              { value: 'transfer', label: 'Transfer' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
