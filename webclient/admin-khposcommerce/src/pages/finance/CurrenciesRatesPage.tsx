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
import type { CurrencyForm } from './types/finance.types'
import {
  CurrencyStatsCards,
  CurrencyFormDrawer,
  CurrenciesRatesTable,
} from './components'

export const CurrenciesRatesPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateCurrency = hasPermission('currency.create')
  const canUpdateCurrency = hasPermission('currency.update')
  const canDeleteCurrency = hasPermission('currency.delete')

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
  } = useServerPagination({ storageKey: 'finance_currencies' })

  // Filters
  const [filterStatus, setFilterStatus] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    currency_name: true,
    currency_code: true,
    currency_symbol: true,
    currency_rate: true,
    currency_status: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [currencyForm, setCurrencyForm] = useState<CurrencyForm>({
    name: '',
    code: '',
    symbol: '',
    exchange_rate: '1.00',
    is_active: true,
    is_default: false,
  })

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Query
  const {
    data: currenciesData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['currencies-tab', page, debouncedSearch, perPage, filterStatus],
    queryFn: () =>
      financeService.getCurrencies({
        page,
        search: debouncedSearch,
        per_page: perPage,
        status: filterStatus || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const currencies = currenciesData?.data ?? []
  const pagination = currenciesData?.pagination ?? { total: currencies.length, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: CurrencyForm) => {
      if (editingItem) {
        return financeService.updateCurrency(editingItem.id, payload)
      } else {
        return financeService.createCurrency({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies-tab'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteCurrency(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currencies-tab'] })
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
    setCurrencyForm({
      name: '',
      code: '',
      symbol: '',
      exchange_rate: '1.00',
      is_active: true,
      is_default: false,
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setCurrencyForm({
      name: item.name || '',
      code: item.code || '',
      symbol: item.symbol || '',
      exchange_rate: String(item.exchange_rate ?? '1.00'),
      is_active: Boolean(item.is_active ?? true),
      is_default: Boolean(item.is_default ?? false),
    })
    setDrawerOpen(true)
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.code_col', 'Code'),
          t('finance.currency_name', 'Currency Name'),
          t('finance.symbol', 'Symbol'),
          t('finance.exchange_rate', 'Exchange Rate'),
          t('finance.status_col', 'Status'),
        ]
        const rows = (currencies || []).map((cur: any) => [
          cur.code || '',
          cur.name || '',
          cur.symbol || '',
          cur.exchange_rate || 1,
          cur.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
        ])
        downloadCsv('finance_currencies', headers, rows)
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
          { label: t('finance.currencies_title', 'Currencies & Rates') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.currencies_title', 'Currencies & Exchange Rates')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.currencies_subtitle', 'Manage operational currencies (USD, KHR), symbols, and daily exchange rates.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          {canCreateCurrency && (
            <AddButton
              onClick={openCreateDrawer}
              label={t('finance.add_currency', 'Add Currency')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <CurrencyStatsCards
        currencies={currencies}
        isLoading={isLoading}
      />

      {/* Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('finance.search_currencies', 'Search currencies...')}
        filterContent={
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
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['currencies-tab'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'currency_name', label: t('finance.currency_name', 'Currency Name') },
          { key: 'currency_code', label: t('finance.code_col', 'Code') },
          { key: 'currency_symbol', label: t('finance.symbol', 'Symbol') },
          { key: 'currency_rate', label: t('finance.exchange_rate', 'Exchange Rate') },
          { key: 'currency_status', label: t('finance.status_col', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Main Table */}
      <CurrenciesRatesTable
        currencies={currencies}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdateCurrency ? openEditDrawer : undefined}
        handleDelete={canDeleteCurrency ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
      />

      {/* Pagination */}
      {pagination.total > perPage && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* Form Drawer */}
      <CurrencyFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={editingItem}
        onSubmit={() => saveMutation.mutate(currencyForm)}
        isPending={saveMutation.isPending}
        currencyForm={currencyForm}
        setCurrencyForm={setCurrencyForm}
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

export const FinanceCurrenciesPage = CurrenciesRatesPage
export default CurrenciesRatesPage
