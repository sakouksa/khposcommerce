import React from 'react'
import { useTranslation } from 'react-i18next'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import ModernSelect from '@/components/shared/ModernSelect'
import { EnterpriseDatePicker } from '@/components/common'

interface PurchasesFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  suppliers: any[]
  warehouses: any[]
  branches?: any[]
  users: any[]
  supplierFilter: string
  setSupplierFilter: (val: string) => void
  warehouseFilter: string
  setWarehouseFilter: (val: string) => void
  branchFilter?: string
  setBranchFilter?: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  paymentStatusFilter: string
  setPaymentStatusFilter: (val: string) => void
  purchaseDateStartFilter: string
  setPurchaseDateStartFilter: (val: string) => void
  purchaseDateEndFilter: string
  setPurchaseDateEndFilter: (val: string) => void
  dueDateStartFilter: string
  setDueDateStartFilter: (val: string) => void
  dueDateEndFilter: string
  setDueDateEndFilter: (val: string) => void
  minAmountFilter: string
  setMinAmountFilter: (val: string) => void
  maxAmountFilter: string
  setMaxAmountFilter: (val: string) => void
  createdByFilter: string
  setCreatedByFilter: (val: string) => void
  onReset: () => void
  setPage: (page: number) => void
}

const FieldLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
)

export const PurchasesFilterDrawer: React.FC<PurchasesFilterDrawerProps> = ({
  isOpen,
  onClose,
  suppliers = [],
  warehouses = [],
  branches = [],
  users = [],
  supplierFilter,
  setSupplierFilter,
  warehouseFilter,
  setWarehouseFilter,
  branchFilter = '',
  setBranchFilter,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  purchaseDateStartFilter,
  setPurchaseDateStartFilter,
  purchaseDateEndFilter,
  setPurchaseDateEndFilter,
  dueDateStartFilter,
  setDueDateStartFilter,
  dueDateEndFilter,
  setDueDateEndFilter,
  minAmountFilter,
  setMinAmountFilter,
  maxAmountFilter,
  setMaxAmountFilter,
  createdByFilter,
  setCreatedByFilter,
  onReset,
  setPage,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  const activeCount = [
    supplierFilter,
    warehouseFilter,
    branchFilter,
    statusFilter,
    paymentStatusFilter,
    purchaseDateStartFilter,
    purchaseDateEndFilter,
    dueDateStartFilter,
    dueDateEndFilter,
    minAmountFilter,
    maxAmountFilter,
    createdByFilter,
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('purchases.advancedFilters', 'Advanced Purchase Filters')}
      activeCount={activeCount}
      applyLabel={t('common.applyFilters', 'Apply Filters')}
      resetLabel={t('common.reset', 'Reset')}
    >
      {/* Supplier Filter */}
      <FieldLabel label={t('purchases.supplier', 'Supplier')}>
        <ModernSelect
          value={supplierFilter}
          onChange={(val) => { setSupplierFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allSuppliers', 'All Suppliers') },
            ...(suppliers ?? []).map((s: any) => ({ value: String(s.id), label: s.name })),
          ]}
          placeholder={t('purchases.allSuppliers', 'All Suppliers')}
        />
      </FieldLabel>

      {/* Warehouse Filter */}
      <FieldLabel label={t('purchases.warehouse', 'Warehouse')}>
        <ModernSelect
          value={warehouseFilter}
          onChange={(val) => { setWarehouseFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allWarehouses', 'All Warehouses') },
            ...(warehouses ?? []).map((w: any) => ({ value: String(w.id), label: w.name })),
          ]}
          placeholder={t('purchases.allWarehouses', 'All Warehouses')}
        />
      </FieldLabel>

      {/* Branch Filter */}
      {setBranchFilter && (
        <FieldLabel label={t('purchases.branch', 'Branch')}>
          <ModernSelect
            value={branchFilter}
            onChange={(val) => { setBranchFilter(String(val)); setPage(1); }}
            options={[
              { value: '', label: t('purchases.allBranches', 'All Branches') },
              ...(branches ?? []).map((b: any) => ({ value: String(b.id), label: b.name })),
            ]}
            placeholder={t('purchases.allBranches', 'All Branches')}
          />
        </FieldLabel>
      )}

      {/* Status Filter */}
      <FieldLabel label={t('purchases.status', 'Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={(val) => { setStatusFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allStatuses', 'All Statuses') },
            { value: 'draft', label: t('purchases.draft', 'Draft') },
            { value: 'ordered', label: t('purchases.ordered', 'Ordered') },
            { value: 'partial', label: t('purchases.partial', 'Partially Received') },
            { value: 'received', label: t('purchases.received', 'Received') },
            { value: 'completed', label: t('purchases.completed', 'Completed') },
            { value: 'cancelled', label: t('purchases.cancelled', 'Cancelled') },
          ]}
          placeholder={t('purchases.allStatuses', 'All Statuses')}
        />
      </FieldLabel>

      {/* Payment Status Filter */}
      <FieldLabel label={t('purchases.paymentStatus', 'Payment Status')}>
        <ModernSelect
          value={paymentStatusFilter}
          onChange={(val) => { setPaymentStatusFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allPaymentStatuses', 'All Payment Statuses') },
            { value: 'unpaid', label: t('purchases.unpaid', 'Unpaid') },
            { value: 'partial', label: t('purchases.partial', 'Partially Paid') },
            { value: 'paid', label: t('purchases.paid', 'Paid') },
          ]}
          placeholder={t('purchases.allPaymentStatuses', 'All Payment Statuses')}
        />
      </FieldLabel>

      {/* Purchase Date Range */}
      <FieldLabel label={t('purchases.purchaseDateRange', 'Purchase Date Range')}>
        <div className="grid grid-cols-2 gap-2">
          <EnterpriseDatePicker
            value={purchaseDateStartFilter}
            onChange={(val) => { setPurchaseDateStartFilter(val); setPage(1); }}
            placeholder={t('fromDate', 'From Date')}
          />
          <EnterpriseDatePicker
            value={purchaseDateEndFilter}
            minDate={purchaseDateStartFilter}
            onChange={(val) => { setPurchaseDateEndFilter(val); setPage(1); }}
            placeholder={t('toDate', 'To Date')}
          />
        </div>
      </FieldLabel>

      {/* Due Date Range */}
      <FieldLabel label={t('purchases.dueDateRange', 'Due Date Range')}>
        <div className="grid grid-cols-2 gap-2">
          <EnterpriseDatePicker
            value={dueDateStartFilter}
            onChange={(val) => { setDueDateStartFilter(val); setPage(1); }}
            placeholder={t('fromDate', 'From Date')}
          />
          <EnterpriseDatePicker
            value={dueDateEndFilter}
            minDate={dueDateStartFilter}
            onChange={(val) => { setDueDateEndFilter(val); setPage(1); }}
            placeholder={t('toDate', 'To Date')}
          />
        </div>
      </FieldLabel>

      {/* Amount Range */}
      <FieldLabel label={t('purchases.amountRange', 'Amount Range ($)')}>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t('purchases.minValue', 'Min')}
            value={minAmountFilter}
            onChange={(e) => { setMinAmountFilter(e.target.value); setPage(1); }}
            className="w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400"
          />
          <input
            type="number"
            placeholder={t('purchases.maxValue', 'Max')}
            value={maxAmountFilter}
            onChange={(e) => { setMaxAmountFilter(e.target.value); setPage(1); }}
            className="w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400"
          />
        </div>
      </FieldLabel>

      {/* Created By User */}
      <FieldLabel label={t('purchases.createdBy', 'Created By')}>
        <ModernSelect
          value={createdByFilter}
          onChange={(val) => { setCreatedByFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allUsers', 'All Users') },
            ...(users ?? []).map((u: any) => ({ value: String(u.id), label: u.name })),
          ]}
          placeholder={t('purchases.allUsers', 'All Users')}
        />
      </FieldLabel>
    </FilterDrawerShell>
  )
}

export default PurchasesFilterDrawer
