import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Building2,
  Warehouse,
  Truck,
  RotateCcw,
  RefreshCw,
  Download,
  CheckCircle2,
  ChevronDown,
  Filter,
  DollarSign,
  Tag
} from 'lucide-react'
import { supplierService } from '@/services/supplierService'
import { companyService } from '@/services/companyService'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import { EnterpriseDatePicker } from '@/components/common/DatePicker'

export interface PurchaseFilterState {
  date_from?: string
  date_to?: string
  supplier_id?: string
  branch_id?: string
  warehouse_id?: string
  status?: string
  payment_status?: string
  currency_code?: string
  quick_range?: string
}

interface PurchaseFiltersProps {
  filters: PurchaseFilterState
  onChange: (newFilters: PurchaseFilterState) => void
  onExport: (presetRange?: string) => void
  onRefresh: () => void
  isExporting?: boolean
}

export const PurchaseFilters: React.FC<PurchaseFiltersProps> = ({
  filters,
  onChange,
  onExport,
  onRefresh,
  isExporting = false
}) => {
  const { t } = useTranslation('reports')

  const [suppliers, setSuppliers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [showExcelMenu, setShowExcelMenu] = useState(false)

  useEffect(() => {
    // Fetch dropdown options
    const fetchOptions = async () => {
      try {
        const [supRes, brRes, whRes] = await Promise.allSettled([
          supplierService.list(),
          companyService.getBranches(),
          companyService.getWarehouses()
        ])

        if (supRes.status === 'fulfilled' && (supRes.value.data?.data || supRes.value.data)) {
          setSuppliers(supRes.value.data.data || supRes.value.data)
        }
        if (brRes.status === 'fulfilled' && (brRes.value.data?.data || brRes.value.data)) {
          setBranches(brRes.value.data.data || brRes.value.data)
        }
        if (whRes.status === 'fulfilled' && (whRes.value.data?.data || whRes.value.data)) {
          setWarehouses(whRes.value.data.data || whRes.value.data)
        }
      } catch (err) {
        console.error('Failed to load purchase filter options', err)
      }
    }
    fetchOptions()
  }, [])

  const handleQuickRange = (rangeKey: string) => {
    const today = new Date()
    let from = ''
    let to = today.toISOString().split('T')[0]

    if (rangeKey === 'today') {
      from = to
    } else if (rangeKey === 'yesterday') {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      from = y.toISOString().split('T')[0]
      to = from
    } else if (rangeKey === 'this_week') {
      const first = today.getDate() - today.getDay()
      const firstDay = new Date(today.setDate(first))
      from = firstDay.toISOString().split('T')[0]
      to = new Date().toISOString().split('T')[0]
    } else if (rangeKey === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      from = firstDay.toISOString().split('T')[0]
    } else if (rangeKey === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
      from = firstDay.toISOString().split('T')[0]
      to = lastDay.toISOString().split('T')[0]
    } else if (rangeKey === 'this_year') {
      const firstDay = new Date(today.getFullYear(), 0, 1)
      from = firstDay.toISOString().split('T')[0]
    }

    onChange({
      ...filters,
      date_from: from,
      date_to: to,
      quick_range: rangeKey
    })
  }

  const handleReset = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    onChange({
      date_from: thirtyDaysAgo,
      date_to: todayStr,
      supplier_id: '',
      branch_id: '',
      warehouse_id: '',
      status: '',
      payment_status: '',
      currency_code: 'USD',
      quick_range: ''
    })
  }

  // Format options for ModernSelect
  const supplierOptions = [
    { value: '', label: t('purchase.allSuppliers', 'All Suppliers') },
    ...suppliers.map((s) => ({ value: String(s.id), label: s.name }))
  ]

  const branchOptions = [
    { value: '', label: t('purchase.allBranches', 'All Branches') },
    ...branches.map((b) => ({ value: String(b.id), label: b.name }))
  ]

  const warehouseOptions = [
    { value: '', label: t('purchase.allWarehouses', 'All Warehouses') },
    ...warehouses.map((w) => ({ value: String(w.id), label: w.name }))
  ]

  const statusOptions = [
    { value: '', label: t('purchase.allStatus', 'All Statuses') },
    { value: 'received', label: t('purchase.statusReceived', 'Received') },
    { value: 'ordered', label: t('purchase.statusOrdered', 'Ordered') },
    { value: 'partial', label: t('purchase.statusPartial', 'Partial') },
    { value: 'pending', label: t('purchase.statusPending', 'Pending') },
    { value: 'cancelled', label: t('purchase.statusCancelled', 'Cancelled') }
  ]

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Top row: Quick Date Presets & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground mr-1">
            <Calendar size={14} className="text-primary" />
            Date Filter:
          </span>

          {[
            { key: 'today', label: t('purchase.today', 'Today') },
            { key: 'yesterday', label: t('purchase.yesterday', 'Yesterday') },
            { key: 'this_week', label: t('purchase.thisWeek', 'This Week') },
            { key: 'this_month', label: t('purchase.thisMonth', 'This Month') },
            { key: 'last_month', label: t('purchase.lastMonth', 'Last Month') },
            { key: 'this_year', label: t('purchase.thisYear', 'This Year') }
          ].map((item) => {
            const isActive = filters.quick_range === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleQuickRange(item.key)}
                className={`px-3 py-1.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Action Buttons */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border/80 rounded-xl hover:bg-accent/70 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Filter Dropdowns using ModernSelect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Date From */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Date From
          </label>
          <EnterpriseDatePicker
            value={filters.date_from || ''}
            onChange={(val) => onChange({ ...filters, date_from: val, quick_range: '' })}
            placeholder="Select Start Date"
            className="w-full"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            To Date
          </label>
          <EnterpriseDatePicker
            value={filters.date_to || ''}
            onChange={(val) => onChange({ ...filters, date_to: val, quick_range: '' })}
            placeholder="Select End Date"
            className="w-full"
          />
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Supplier
          </label>
          <ModernSelect
            value={filters.supplier_id || ''}
            onChange={(val) => onChange({ ...filters, supplier_id: val })}
            options={supplierOptions}
            icon={<Truck size={13} />}
            placeholder={t('purchase.allSuppliers', 'All Suppliers')}
            className="w-full"
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Branch
          </label>
          <ModernSelect
            value={filters.branch_id || ''}
            onChange={(val) => onChange({ ...filters, branch_id: val })}
            options={branchOptions}
            icon={<Building2 size={13} />}
            placeholder={t('purchase.allBranches', 'All Branches')}
            className="w-full"
          />
        </div>

        {/* Warehouse */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Warehouse
          </label>
          <ModernSelect
            value={filters.warehouse_id || ''}
            onChange={(val) => onChange({ ...filters, warehouse_id: val })}
            options={warehouseOptions}
            icon={<Warehouse size={13} />}
            placeholder={t('purchase.allWarehouses', 'All Warehouses')}
            className="w-full"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
            Purchase Status
          </label>
          <ModernSelect
            value={filters.status || ''}
            onChange={(val) => onChange({ ...filters, status: val })}
            options={statusOptions}
            icon={<Tag size={13} />}
            placeholder={t('purchase.allStatus', 'All Statuses')}
            className="w-full"
            align="right"
          />
        </div>
      </div>
    </div>
  )
}

export default PurchaseFilters
