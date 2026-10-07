import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  TableToolbar,
  ModernSelect,
  ConfirmModal,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { TaxForm } from './types/finance.types'
import { TaxFormDrawer, TaxRulesRatesTable } from './components'

export const TaxRulesRatesPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateTax = hasPermission('tax.create')
  const canUpdateTax = hasPermission('tax.update')
  const canDeleteTax = hasPermission('tax.delete')

  // Pagination & Search
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'finance_taxes' })

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    tax_name: true,
    tax_rate: true,
    tax_type: true,
    tax_status: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [taxForm, setTaxForm] = useState<TaxForm>({
    name: '',
    rate: '',
    type: 'percentage',
    is_active: true,
  })

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Query
  const {
    data: taxesData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['taxes-tab', page, debouncedSearch, perPage, filterStatus, filterType],
    queryFn: () =>
      financeService.getTaxes({
        page,
        search: debouncedSearch,
        per_page: perPage,
        status: filterStatus || undefined,
        type: filterType || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const taxes = taxesData?.data ?? []
  const pagination = taxesData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: TaxForm) => {
      if (editingItem) {
        return financeService.updateTax(editingItem.id, payload)
      } else {
        return financeService.createTax({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes-tab'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteTax(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes-tab'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.'))
    },
  })

  // Handlers
  const openCreateDrawer = () => {
    setEditingItem(null)
    setTaxForm({
      name: '',
      rate: '',
      type: 'percentage',
      is_active: true,
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setTaxForm({
      name: item.name || '',
      rate: String(item.rate ?? ''),
      type: item.type || 'percentage',
      is_active: Boolean(item.is_active ?? true),
    })
    setDrawerOpen(true)
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.tax_rule_name', 'Tax Rule Name'),
          t('finance.tax_rate', 'Tax Rate (%)'),
          t('finance.type_col', 'Type'),
          t('finance.status_col', 'Status'),
        ]
        const rows = (taxes || []).map((tax: any) => [
          tax.name || '',
          tax.rate || 0,
          tax.type === 'percentage' ? t('finance.tax_type_percentage', 'Percentage') : t('finance.tax_type_fixed', 'Fixed'),
          tax.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
        ])
        downloadCsv('finance_taxes', headers, rows)
        toast.dismiss(toastId)
        toast.success(t('finance.export_success', 'Dataset exported successfully.'))
      } catch {
        toast.dismiss(toastId)
        toast.error(t('finance.export_error', 'Failed to export dataset.'))
      }
    }, 300)
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.financeManagement', t('finance.financial_management', 'Finance')), path: '/finance/expenses' },
          { label: t('finance.taxes_title', 'Tax Rules') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.taxes_title', 'Tax Rules & Rates')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.taxes_subtitle', 'Configure VAT, sales tax rules, percentage or fixed deductions, and application rates.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          {canCreateTax && (
            <AddButton
              onClick={openCreateDrawer}
              label={t('finance.add_tax', 'Add Tax Rule')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('finance.search_taxes', 'Search tax rules...')}
        filterContent={
          <div className="flex items-center gap-2">
            <ModernSelect
              value={filterType}
              onChange={(val) => {
                setFilterType(String(val ?? ''))
                setPage(1)
              }}
              options={[
                { value: '', label: `${t('finance.filter_type', t('common.type', 'Type'))}: ${t('finance.all_types', t('common.all', 'All'))}` },
                { value: 'fixed', label: t('finance.tax_type_fixed', 'Fixed') },
                { value: 'percentage', label: t('finance.tax_type_percentage', 'Percentage') },
              ]}
              className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
            />
            <ModernSelect
              value={filterStatus}
              onChange={(val) => {
                setFilterStatus(String(val ?? ''))
                setPage(1)
              }}
              options={[
                { value: '', label: `${t('finance.filter_status', t('common.status', 'Status'))}: ${t('finance.all_status', t('common.all', 'All'))}` },
                { value: 'active', label: t('finance.status_active', 'Active') },
                { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
              ]}
              className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
            />
          </div>
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['taxes-tab'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'tax_name', label: t('finance.tax_rule_name', 'Tax Rule Name') },
          { key: 'tax_rate', label: t('finance.tax_rate', 'Tax Rate (%)') },
          { key: 'tax_type', label: t('finance.type_col', 'Type') },
          { key: 'tax_status', label: t('finance.status_col', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Main Table */}
      <TaxRulesRatesTable
        taxes={taxes}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdateTax ? openEditDrawer : undefined}
        handleDelete={canDeleteTax ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Form Drawer */}
      <TaxFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={editingItem}
        onSubmit={() => saveMutation.mutate(taxForm)}
        isPending={saveMutation.isPending}
        taxForm={taxForm}
        setTaxForm={setTaxForm}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.open}
        variant="danger"
        actionType="delete"
        title={t('finance.delete_confirm_title', 'Delete Record')}
        message={t('finance.delete_confirm_msg', 'Are you sure you want to delete this record? This action cannot be undone.')}
        itemName={deleteConfirm.name}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
      />
    </div>
  )
}

export const FinanceTaxRulesPage = TaxRulesRatesPage
export default TaxRulesRatesPage
