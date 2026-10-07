import React from 'react'
import { useTranslation } from 'react-i18next'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import ModernSelect from '@/components/shared/ModernSelect'
import { EnterpriseDatePicker } from '@/components/common'

interface PurchaseReturnsFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  suppliers: any[]
  warehouses: any[]
  users: any[]
  statusFilter: string
  setStatusFilter: (val: string) => void
  refundStatusFilter?: string
  setRefundStatusFilter?: (val: string) => void
  supplierFilter: string
  setSupplierFilter: (val: string) => void
  warehouseFilter: string
  setWarehouseFilter: (val: string) => void
  minReturnAmountFilter: string
  setMinReturnAmountFilter: (val: string) => void
  maxReturnAmountFilter: string
  setMaxReturnAmountFilter: (val: string) => void
  returnDateStartFilter: string
  setReturnDateStartFilter: (val: string) => void
  returnDateEndFilter: string
  setReturnDateEndFilter: (val: string) => void
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

export const PurchaseReturnsFilterDrawer: React.FC<PurchaseReturnsFilterDrawerProps> = ({
  isOpen,
  onClose,
  suppliers = [],
  warehouses = [],
  users = [],
  statusFilter,
  setStatusFilter,
  refundStatusFilter = '',
  setRefundStatusFilter,
  supplierFilter,
  setSupplierFilter,
  warehouseFilter,
  setWarehouseFilter,
  minReturnAmountFilter,
  setMinReturnAmountFilter,
  maxReturnAmountFilter,
  setMaxReturnAmountFilter,
  returnDateStartFilter,
  setReturnDateStartFilter,
  returnDateEndFilter,
  setReturnDateEndFilter,
  createdByFilter,
  setCreatedByFilter,
  onReset,
  setPage,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  const activeCount = [
    statusFilter,
    refundStatusFilter,
    supplierFilter,
    warehouseFilter,
    minReturnAmountFilter,
    maxReturnAmountFilter,
    returnDateStartFilter,
    returnDateEndFilter,
    createdByFilter,
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('purchases.advancedFilters', 'Advanced Return Filters')}
      activeCount={activeCount}
      applyLabel={t('common.applyFilters', 'Apply Filters')}
      resetLabel={t('common.reset', 'Reset')}
    >
      {/* Status */}
      <FieldLabel label={t('purchases.status', 'Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={(val) => { setStatusFilter(String(val)); setPage(1); }}
          options={[
            { value: '', label: t('purchases.allStatuses', 'All Statuses') },
            { value: 'draft', label: t('purchases.draft', 'Draft') },
            { value: 'approved', label: t('purchases.approved', 'Approved') },
            { value: 'shipped', label: t('purchases.shipped', 'Shipped') },
            { value: 'completed', label: t('purchases.completed', 'Completed') },
            { value: 'cancelled', label: t('purchases.cancelled', 'Cancelled') },
          ]}
          placeholder={t('purchases.allStatuses', 'All Statuses')}
        />
      </FieldLabel>

      {/* Refund / Settlement Status */}
      {setRefundStatusFilter && (
        <FieldLabel label={t('purchases.refundStatus', 'Refund Status')}>
          <ModernSelect
            value={refundStatusFilter}
            onChange={(val) => { setRefundStatusFilter(String(val)); setPage(1); }}
            options={[
              { value: '', label: t('purchases.allStatuses', 'All Statuses') },
              { value: 'pending', label: t('purchases.statusPendingRefund', 'Pending Refund') },
              { value: 'offset', label: t('purchases.statusOffsetAP', 'Offset Against AP') },
              { value: 'credited', label: t('purchases.statusCredited', 'Supplier Credited') },
              { value: 'refunded', label: t('purchases.statusRefunded', 'Refund Received') },
            ]}
            placeholder={t('purchases.allStatuses', 'All Statuses')}
          />
        </FieldLabel>
      )}

      {/* Supplier */}
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

      {/* Warehouse */}
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

      {/* Return Date Range */}
      <FieldLabel label={t('purchases.purchaseDateRange', 'Return Date Range')}>
        <div className="grid grid-cols-2 gap-2">
          <EnterpriseDatePicker
            value={returnDateStartFilter}
            onChange={(val) => { setReturnDateStartFilter(val); setPage(1); }}
            placeholder={t('fromDate', 'From Date')}
          />
          <EnterpriseDatePicker
            value={returnDateEndFilter}
            minDate={returnDateStartFilter}
            onChange={(val) => { setReturnDateEndFilter(val); setPage(1); }}
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
            value={minReturnAmountFilter}
            onChange={(e) => { setMinReturnAmountFilter(e.target.value); setPage(1); }}
            className="w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400"
          />
          <input
            type="number"
            placeholder={t('purchases.maxValue', 'Max')}
            value={maxReturnAmountFilter}
            onChange={(e) => { setMaxReturnAmountFilter(e.target.value); setPage(1); }}
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

export default PurchaseReturnsFilterDrawer
