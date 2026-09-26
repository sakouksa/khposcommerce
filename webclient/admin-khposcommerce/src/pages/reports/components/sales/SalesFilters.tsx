import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, Building2, Warehouse, User, CreditCard, PackageSearch,
  RefreshCw, Download, RotateCcw, FileSpreadsheet, FileText, Check
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { customerService } from '@/services/customerService'
import { financeService } from '@/services/financeService'
import { productService } from '@/services/productService'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import { DatePicker } from '@/components/common'

export interface SalesFilterState {
  date_from: string
  date_to: string
  branch_id?: string
  warehouse_id?: string
  customer_id?: string
  payment_method_id?: string
  product_id?: string
}

interface SalesFiltersProps {
  filters: SalesFilterState
  onChange: (filters: SalesFilterState) => void
  onExport: (format: 'csv' | 'excel' | 'pdf') => void
  onRefresh: () => void
  isExporting?: boolean
  isRefreshing?: boolean
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  filters,
  onChange,
  onExport,
  onRefresh,
  isExporting = false,
  isRefreshing = false,
}) => {
  const { t } = useTranslation('reports')
  const [activePreset, setActivePreset] = useState<'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches-select'],
    queryFn: () => companyService.getBranches().then((r) => r.data?.data ?? r.data ?? []),
  })

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => companyService.getWarehouses().then((r) => r.data?.data ?? r.data ?? []),
  })

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers-select'],
    queryFn: () => customerService.list({ per_page: 200 }).then((r) => r.data?.data ?? r.data ?? []),
  })

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods-select'],
    queryFn: () => financeService.getPaymentMethods().then((r) => r.data?.data ?? r.data ?? []),
  })

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products-select'],
    queryFn: () => productService.list({ per_page: 200 }).then((r) => r.data?.data ?? r.data ?? []),
  })

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth') => {
    setActivePreset(preset)
    const todayObj = new Date()
    let from = new Date()
    let to = new Date()

    if (preset === 'today') {
      from = todayObj
      to = todayObj
    } else if (preset === 'yesterday') {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      from = y
      to = y
    } else if (preset === 'thisWeek') {
      const day = todayObj.getDay()
      const diff = todayObj.getDate() - day + (day === 0 ? -6 : 1)
      from = new Date(todayObj.setDate(diff))
      to = new Date()
    } else if (preset === 'thisMonth') {
      from = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
      to = new Date()
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    onChange({
      ...filters,
      date_from: formatDate(from),
      date_to: formatDate(to),
    })
  }

  const handleReset = () => {
    setActivePreset(null)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    onChange({
      date_from: thirtyDaysAgo,
      date_to: todayStr,
      branch_id: '',
      warehouse_id: '',
      customer_id: '',
      payment_method_id: '',
      product_id: '',
    })
  }

  // Format options for ModernSelect
  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...branches.map((b: any) => ({ value: String(b.id), label: b.name })),
  ]

  const warehouseOptions = [
    { value: '', label: 'All Warehouses' },
    ...warehouses.map((w: any) => ({ value: String(w.id), label: w.name })),
  ]

  const customerOptions = [
    { value: '', label: 'All Customers' },
    ...customers.map((c: any) => ({
      value: String(c.id),
      label: c.name,
      badge: c.phone || c.email || undefined,
    })),
  ]

  const paymentOptions = [
    { value: '', label: 'All Payment Methods' },
    ...paymentMethods.map((pm: any) => ({
      value: String(pm.id),
      label: pm.name,
      badge: pm.code?.toUpperCase() || undefined,
    })),
  ]

  const productOptions = [
    { value: '', label: 'All Products' },
    ...products.map((p: any) => ({
      value: String(p.id),
      label: p.name,
      badge: p.sku || undefined,
    })),
  ]

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Top row: Quick Date Presets & Custom Colored Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        {/* Date Presets */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground mr-1">
            <Calendar size={14} className="text-primary" />
            Date Filter:
          </span>
          <button
            type="button"
            onClick={() => handleDatePreset('today')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${
              activePreset === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('yesterday')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${
              activePreset === 'yesterday'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('thisWeek')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${
              activePreset === 'thisWeek'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => handleDatePreset('thisMonth')}
            className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${
              activePreset === 'thisMonth'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Standard Clean Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border/80 rounded-xl hover:bg-accent/70 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border/80 rounded-xl hover:bg-accent/70 transition-all shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Custom Modern Select Controls & Custom Date Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Custom Styled Date Pickers */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Date From
          </label>
          <DatePicker
            value={filters.date_from}
            onChange={(val) => {
              setActivePreset(null)
              onChange({ ...filters, date_from: val })
            }}
            placeholder="Select Start Date"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            To Date
          </label>
          <DatePicker
            value={filters.date_to}
            onChange={(val) => {
              setActivePreset(null)
              onChange({ ...filters, date_to: val })
            }}
            placeholder="Select End Date"
            className="w-full"
          />
        </div>

        {/* Modern Select for Branch */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Branch
          </label>
          <ModernSelect
            value={filters.branch_id || ''}
            onChange={(val) => onChange({ ...filters, branch_id: val })}
            options={branchOptions}
            icon={<Building2 size={13} />}
            placeholder="Select Branch"
            className="w-full"
          />
        </div>

        {/* Modern Select for Warehouse */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Warehouse
          </label>
          <ModernSelect
            value={filters.warehouse_id || ''}
            onChange={(val) => onChange({ ...filters, warehouse_id: val })}
            options={warehouseOptions}
            icon={<Warehouse size={13} />}
            placeholder="Select Warehouse"
            className="w-full"
          />
        </div>

        {/* Modern Select for Customer */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Customer
          </label>
          <ModernSelect
            value={filters.customer_id || ''}
            onChange={(val) => onChange({ ...filters, customer_id: val })}
            options={customerOptions}
            icon={<User size={13} />}
            placeholder="Select Customer"
            className="w-full"
            align="right"
          />
        </div>

        {/* Modern Select for Payment Method */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Payment Method
          </label>
          <ModernSelect
            value={filters.payment_method_id || ''}
            onChange={(val) => onChange({ ...filters, payment_method_id: val })}
            options={paymentOptions}
            icon={<CreditCard size={13} />}
            placeholder="Select Payment Method"
            className="w-full"
            align="right"
          />
        </div>
      </div>
    </div>
  )
}

export default SalesFilters
