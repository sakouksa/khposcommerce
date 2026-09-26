import React from 'react'
import { useTranslation } from 'react-i18next'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface InventoryFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab?: string
  warehouses: any[]
  categories: any[]
  brands: any[]
  suppliers: any[]
  users: any[]
  selectedWarehouse: string
  setSelectedWarehouse: (val: string) => void
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  selectedBrand: string
  setSelectedBrand: (val: string) => void
  selectedStatus: string
  setSelectedStatus: (val: string) => void
  selectedSupplier: string
  setSelectedSupplier: (val: string) => void
  filterStartDate: string
  setFilterStartDate: (val: string) => void
  filterEndDate: string
  setFilterEndDate: (val: string) => void
  selectedCreatedBy: string
  setSelectedCreatedBy: (val: string) => void
  onReset: () => void
  setPage: (page: number) => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

const inputCls = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const InventoryFilterDrawer: React.FC<InventoryFilterDrawerProps> = ({
  isOpen,
  onClose,
  activeTab = 'levels',
  warehouses = [],
  categories = [],
  brands = [],
  suppliers = [],
  users = [],
  selectedWarehouse,
  setSelectedWarehouse,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedStatus,
  setSelectedStatus,
  selectedSupplier,
  setSelectedSupplier,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  selectedCreatedBy,
  setSelectedCreatedBy,
  onReset,
  setPage,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  const safeWarehouses = Array.isArray(warehouses) ? warehouses : ((warehouses as any)?.data ?? [])
  const safeCategories = Array.isArray(categories) ? categories : ((categories as any)?.data ?? [])
  const safeBrands = Array.isArray(brands) ? brands : ((brands as any)?.data ?? [])
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : ((suppliers as any)?.data ?? [])
  const safeUsers = Array.isArray(users) ? users : ((users as any)?.data ?? [])

  const activeCount = [
    selectedWarehouse,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    selectedSupplier,
    filterStartDate,
    filterEndDate,
    selectedCreatedBy,
  ].filter(Boolean).length

  const set = (fn: (val: string) => void) => (val: string) => {
    fn(val)
    setPage(1)
  }

  // Determine context-appropriate status filter based on the active tab
  const getStatusConfig = () => {
    switch (activeTab) {
      case 'movements':
        return {
          label: t('type', 'Movement Type'),
          placeholder: t('allMovementTypes', 'All Movement Types'),
          options: [
            { value: '', label: t('allMovementTypes', 'All Movement Types') },
            { value: 'in', label: t('movementTypeIn', 'Stock In') },
            { value: 'out', label: t('movementTypeOut', 'Stock Out') },
            { value: 'transfer_in', label: t('transferIn', 'Transfer In') },
            { value: 'transfer_out', label: t('transferOut', 'Transfer Out') },
            { value: 'adjustment', label: t('adjustment', 'Adjustment') },
            { value: 'opname', label: t('opnameAudit', 'Audit / Opname') },
          ]
        }
      case 'transfers':
        return {
          label: t('transferStatus', 'Transfer Status'),
          placeholder: t('allStatus', 'All Statuses'),
          options: [
            { value: '', label: t('allStatus', 'All Statuses') },
            { value: 'pending', label: t('statusPending', 'Pending') },
            { value: 'in_transit', label: t('statusInTransit', 'In Transit') },
            { value: 'completed', label: t('statusCompleted', 'Completed') },
            { value: 'cancelled', label: t('statusCancelled', 'Cancelled') },
          ]
        }
      case 'adjustments':
        return {
          label: t('adjustmentStatus', 'Adjustment Status'),
          placeholder: t('allStatus', 'All Statuses'),
          options: [
            { value: '', label: t('allStatus', 'All Statuses') },
            { value: 'pending', label: t('statusPending', 'Pending') },
            { value: 'approved', label: t('statusApproved', 'Approved') },
            { value: 'rejected', label: t('statusRejected', 'Rejected') },
          ]
        }
      case 'opnames':
        return {
          label: t('auditStatus', 'Audit Status'),
          placeholder: t('allStatus', 'All Statuses'),
          options: [
            { value: '', label: t('allStatus', 'All Statuses') },
            { value: 'draft', label: t('statusDraft', 'Draft') },
            { value: 'in_progress', label: t('statusInProgress', 'In Progress') },
            { value: 'completed', label: t('statusCompleted', 'Completed') },
            { value: 'cancelled', label: t('statusCancelled', 'Cancelled') },
          ]
        }
      case 'levels':
      default:
        return {
          label: t('stockStatus', 'Stock Level Status'),
          placeholder: t('allStatus', 'All Stock Statuses'),
          options: [
            { value: '', label: t('allStatus', 'All Stock Statuses') },
            { value: 'in_stock', label: t('inStockHealthy', 'In Stock (Healthy)') },
            { value: 'low_stock', label: t('lowStockAlert', 'Low Stock (Alert)') },
            { value: 'out_of_stock', label: t('outOfStockZero', 'Out of Stock (Zero)') },
            { value: 'overstock', label: t('overstock', 'Overstock (>100)') },
          ]
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('advancedFilters', 'Advanced Inventory Filters')}
      activeCount={activeCount}
      applyLabel={t('common.apply', 'Apply')}
      resetLabel={t('common.reset', 'Reset')}
    >
      {/* Warehouse */}
      <FL label={t('warehouse', 'Warehouse Location')}>
        <ModernSelect
          value={selectedWarehouse}
          onChange={set(setSelectedWarehouse)}
          options={[
            { value: '', label: t('allWarehouses', 'All Warehouses') },
            ...safeWarehouses.map((w: any) => ({ value: String(w.id), label: w.name })),
          ]}
          placeholder={t('allWarehouses', 'All Warehouses')}
        />
      </FL>

      {/* Dynamic Status / Type */}
      <FL label={statusConfig.label}>
        <ModernSelect
          value={selectedStatus}
          onChange={set(setSelectedStatus)}
          options={statusConfig.options}
          placeholder={statusConfig.placeholder}
        />
      </FL>

      {/* Category */}
      <FL label={t('category', 'Category')}>
        <ModernSelect
          value={selectedCategory}
          onChange={set(setSelectedCategory)}
          options={[
            { value: '', label: t('allCategories', 'All Categories') },
            ...safeCategories.map((c: any) => ({ value: String(c.id), label: c.name })),
          ]}
          placeholder={t('allCategories', 'All Categories')}
        />
      </FL>

      {/* Brand */}
      <FL label={t('brand', 'Brand')}>
        <ModernSelect
          value={selectedBrand}
          onChange={set(setSelectedBrand)}
          options={[
            { value: '', label: t('allBrands', 'All Brands') },
            ...safeBrands.map((b: any) => ({ value: String(b.id), label: b.name })),
          ]}
          placeholder={t('allBrands', 'All Brands')}
        />
      </FL>

      {/* Supplier */}
      <FL label={t('supplier', 'Supplier')}>
        <ModernSelect
          value={selectedSupplier}
          onChange={set(setSelectedSupplier)}
          options={[
            { value: '', label: t('allSuppliers', 'All Suppliers') },
            ...safeSuppliers.map((s: any) => ({ value: String(s.id), label: s.name })),
          ]}
          placeholder={t('allSuppliers', 'All Suppliers')}
        />
      </FL>

      {/* Date Range */}
      <FL label={t('dateRange', 'Date Range')}>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="block text-[10px] font-medium text-muted-foreground dark:text-slate-400 mb-1">{t('startDate', 'Start Date')}</span>
            <EnterpriseDatePicker
              value={filterStartDate}
              onChange={(val) => { setFilterStartDate(val); setPage(1) }}
              placeholder={t('startDate', 'Start Date')}
            />
          </div>
          <div>
            <span className="block text-[10px] font-medium text-muted-foreground dark:text-slate-400 mb-1">{t('endDate', 'End Date')}</span>
            <EnterpriseDatePicker
              value={filterEndDate}
              onChange={(val) => { setFilterEndDate(val); setPage(1) }}
              placeholder={t('endDate', 'End Date')}
            />
          </div>
        </div>
      </FL>

      {/* Operator / Created By */}
      <FL label={t('createdBy', 'Operator / Created By')}>
        <ModernSelect
          value={selectedCreatedBy}
          onChange={set(setSelectedCreatedBy)}
          options={[
            { value: '', label: t('allUsers', 'All Users') },
            ...safeUsers.map((u: any) => ({ value: String(u.id), label: u.name })),
          ]}
          placeholder={t('allUsers', 'All Users')}
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default InventoryFilterDrawer
