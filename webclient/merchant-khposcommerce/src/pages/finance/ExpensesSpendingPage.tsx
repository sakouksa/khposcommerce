import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { expenseService } from '@/services/expenseService'
import { salesService } from '@/services/salesService'
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
  ImportButton,
  TableToolbar,
  ConfirmModal,
  BulkSelectionBanner,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'

import {
  ExpenseStatsCards,
  ExpenseFilterDrawer,
  ExpenseVoucherPrintModal,
  ExpensesSpendingTable,
  FinanceImportModal,
  FinanceTrendsChart,
} from './components'

export const ExpensesSpendingPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateExpense = hasPermission('expense.create')
  const canUpdateExpense = hasPermission('expense.update')
  const canDeleteExpense = hasPermission('expense.delete')
  const canApproveExpense = hasPermission('expense.approve')
  const canExportExpense = hasPermission('expense.export')

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
  } = useServerPagination({ storageKey: 'finance_expenses' })

  // Sorting
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filters
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')
  const [filterAmountMin, setFilterAmountMin] = useState('')
  const [filterAmountMax, setFilterAmountMax] = useState('')
  const [filterCreatedBy, setFilterCreatedBy] = useState('')

  const effectiveCategory = activeCategoryFilter || filterCategory

  // Selection & Modals
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [printExpenseModalItem, setPrintExpenseModalItem] = useState<any | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    expense_title: true,
    expense_category: true,
    expense_amount: true,
    expense_status: true,
    expense_date: true,
    expense_receipt: true,
  })

  // Queries
  const {
    data: expensesData,
    isLoading: loadingExpenses,
    isFetching: fetchingExpenses,
  } = useQuery({
    queryKey: [
      'expenses-tab',
      page,
      debouncedSearch,
      perPage,
      sortBy,
      sortOrder,
      effectiveCategory,
      filterStatus,
      filterDateStart,
      filterDateEnd,
      filterAmountMin,
      filterAmountMax,
      filterCreatedBy,
    ],
    queryFn: () =>
      expenseService.getExpenses({
        page,
        search: debouncedSearch,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        category_id: effectiveCategory || undefined,
        status: filterStatus || undefined,
        start_date: filterDateStart || undefined,
        end_date: filterDateEnd || undefined,
        min_amount: filterAmountMin || undefined,
        max_amount: filterAmountMax || undefined,
        user_id: filterCreatedBy || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories-dropdown'],
    queryFn: () => expenseService.getCategories({ per_page: 200 }),
  })

  // Analytics queries for stats
  const { data: financeAnalytics } = useQuery({
    queryKey: ['finance-analytics'],
    queryFn: () => financeService.getAnalytics(),
  })

  const { data: allExpenses } = useQuery({
    queryKey: ['all-expenses-stats'],
    queryFn: () => expenseService.getExpenses({ per_page: 1000 }).then((r) => r.data ?? []),
  })

  const { data: allRegisters } = useQuery({
    queryKey: ['all-registers-stats'],
    queryFn: () => financeService.getCashRegisters({ per_page: 100 }).then((r) => r.data ?? []),
  })

  const { data: allSales } = useQuery({
    queryKey: ['all-sales-stats-finance'],
    queryFn: () => salesService.list({ per_page: 1000 }).then((r) => r.data ?? []),
  })

  const expenses = expensesData?.data ?? []
  const categories = categoriesData?.data ?? []
  const pagination = expensesData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses-tab'] })
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      qc.invalidateQueries({ queryKey: ['finance-analytics'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.')),
  })

  const updateExpenseStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: 'approved' | 'rejected'; reason?: string }) =>
      expenseService.updateStatus(id, status, reason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses-tab'] })
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      qc.invalidateQueries({ queryKey: ['finance-analytics'] })
      toast.success(
        vars.status === 'approved'
          ? t('finance.approve_success', 'Expense approved successfully.')
          : t('finance.reject_success', 'Expense rejected.')
      )
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to update expense status.')),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => expenseService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses-tab'] })
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      toast.success(t('finance.bulk_delete_success', 'Selected expenses deleted successfully.'))
      setSelectedExpenseIds([])
      adjustAfterDelete(selectedExpenseIds.length)
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete selected expenses.')),
  })

  // Handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return (
      <span className="text-[10px] text-primary font-bold">
        {sortOrder === 'asc' ? ' ▲' : ' ▼'}
      </span>
    )
  }

  const handleSelectExpenseRow = (id: number) => {
    const numId = Number(id)
    setSelectedExpenseIds((prev) =>
      prev.includes(numId) ? prev.filter((item) => item !== numId) : [...prev, numId]
    )
  }

  const handleSelectAllExpenses = (allIds: number[]) => {
    const numIds = allIds.map(Number)
    if (numIds.every((id) => selectedExpenseIds.includes(id))) {
      setSelectedExpenseIds([])
    } else {
      setSelectedExpenseIds(numIds)
    }
  }

  const hasApprovedSelectedExpenses = useMemo(() => {
    return (expenses || []).some(
      (e: any) =>
        (selectedExpenseIds.includes(e.id) || selectedExpenseIds.includes(Number(e.id))) &&
        (e.status === 'approved' || e.status === 'paid')
    )
  }, [expenses, selectedExpenseIds])

  const handleResetFilters = () => {
    setFilterStatus('')
    setFilterCategory('')
    setActiveCategoryFilter('')
    setFilterDateStart('')
    setFilterDateEnd('')
    setFilterAmountMin('')
    setFilterAmountMax('')
    setFilterCreatedBy('')
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.title_col', 'Title'),
          t('finance.category_col', 'Category'),
          t('finance.amount_col', 'Amount ($)'),
          t('finance.date_col', 'Date'),
          t('finance.status_col', 'Status'),
          t('finance.reference_number', 'Reference #'),
          t('finance.description_col', 'Description'),
        ]
        const rows = (expenses || []).map((exp: any) => [
          exp.title || `Expense #${exp.id}`,
          exp.category?.name || 'General',
          exp.amount || 0,
          exp.date || '',
          exp.status === 'approved'
            ? t('finance.status_approved', 'Approved')
            : exp.status === 'pending'
            ? t('finance.status_pending', 'Pending')
            : exp.status || 'approved',
          exp.reference_number || `EXP-${String(exp.id).padStart(5, '0')}`,
          exp.description || '',
        ])
        downloadCsv('finance_expenses', headers, rows)
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
          { label: t('finance.expenses_title', 'Operating Expenses') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.expenses_title', 'Operating Expenses')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.expenses_subtitle', 'Track and manage operating expense records, disbursement vouchers, and receipts across the enterprise.')}
          </p>
        </div>
        <HeaderActionsGroup>
          {canCreateExpense && (
            <ImportButton
              onClick={() => setImportOpen(true)}
              label={t('finance.import_csv', 'Import CSV')}
            />
          )}
          {canExportExpense && (
            <ExportButton
              onClick={handleExportCsv}
              label={t('finance.export_csv', 'Export CSV')}
            />
          )}
          {canCreateExpense && (
            <AddButton
              onClick={() => navigate('/finance/expenses/create')}
              label={t('finance.add_expense', 'Record Expense')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <ExpenseStatsCards
        analytics={financeAnalytics}
        allSales={allSales}
        allExpenses={allExpenses}
        allRegisters={allRegisters}
      />

      {/* Trends Chart */}
      <FinanceTrendsChart allSales={allSales} allExpenses={allExpenses} />

      {/* Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('finance.search_expenses', 'Search expenses (title, category, reference)...')}
        onFilterToggle={() => setFilterDrawerOpen(true)}
        isFilterActive={Boolean(filterStatus || filterCategory || activeCategoryFilter || filterDateStart || filterDateEnd || filterAmountMin || filterAmountMax)}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['expenses-tab'] })}
        refreshLoading={fetchingExpenses}
        columns={[
          { key: 'expense_title', label: t('finance.title_col', 'Title') },
          { key: 'expense_category', label: t('finance.category_col', 'Category') },
          { key: 'expense_amount', label: t('finance.amount_col', 'Amount') },
          { key: 'expense_status', label: t('finance.status_col', 'Status') },
          { key: 'expense_date', label: t('finance.date_col', 'Date') },
          { key: 'expense_receipt', label: t('finance.receipt', 'Receipt') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Bulk Delete Banner */}
      {selectedExpenseIds.length > 0 && canDeleteExpense && (
        <BulkSelectionBanner
          selectedCount={selectedExpenseIds.length}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
          onClear={() => setSelectedExpenseIds([])}
          deleteLoading={bulkDeleteMutation.isPending}
          deleteLabel={t('finance.delete_selected', t('common.deleteSelected', 'Delete Selected'))}
          clearLabel={t('common.cancel', 'Cancel')}
        />
      )}

      {/* Main Table */}
      <ExpensesSpendingTable
        expenses={expenses}
        allExpenses={allExpenses}
        categories={categories}
        isLoading={loadingExpenses}
        isFetching={fetchingExpenses}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdateExpense ? (row) => navigate(`/finance/expenses/${row.id}/edit`) : undefined}
        handleDelete={canDeleteExpense ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
        renderSortIcon={renderSortIcon}
        handleSort={handleSort}
        selectedRows={selectedExpenseIds}
        handleSelectRow={handleSelectExpenseRow}
        handleSelectAll={handleSelectAllExpenses}
        activeCategoryFilter={activeCategoryFilter}
        setActiveCategoryFilter={setActiveCategoryFilter}
        onPrintVoucher={(exp) => setPrintExpenseModalItem(exp)}
        onApprove={canApproveExpense ? (id) => updateExpenseStatusMutation.mutate({ id, status: 'approved' }) : undefined}
        onReject={canApproveExpense ? (id) => updateExpenseStatusMutation.mutate({ id, status: 'rejected' }) : undefined}
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

      {/* Filter Drawer */}
      <ExpenseFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterDateStart={filterDateStart}
        setFilterDateStart={setFilterDateStart}
        filterDateEnd={filterDateEnd}
        setFilterDateEnd={setFilterDateEnd}
        filterAmountMin={filterAmountMin}
        setFilterAmountMin={setFilterAmountMin}
        filterAmountMax={filterAmountMax}
        setFilterAmountMax={setFilterAmountMax}
        onReset={handleResetFilters}
      />

      {/* Import Modal */}
      <FinanceImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        activeTab="expenses"
        importFile={importFile}
        setImportFile={setImportFile}
        importing={importing}
        setImporting={setImporting}
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

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        variant="danger"
        actionType="delete"
        title={t('finance.bulk_delete_title', 'Delete Selected Expenses')}
        message={t('finance.bulk_delete_confirm_msg', {
          count: selectedExpenseIds.length,
          defaultValue: `Are you sure you want to delete all ${selectedExpenseIds.length} selected expenses? This action cannot be undone.`,
        }).replace('{{count}}', String(selectedExpenseIds.length))}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        warningText={
          hasApprovedSelectedExpenses
            ? t('finance.bulk_delete_approved_warning', 'Warning: Expenses that are Approved or Paid cannot be deleted according to financial audit regulations.')
            : undefined
        }
        onConfirm={() => {
          bulkDeleteMutation.mutate(selectedExpenseIds, {
            onSettled: () => setBulkDeleteConfirmOpen(false),
          })
        }}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />

      {/* Print Voucher Modal */}
      <ExpenseVoucherPrintModal
        expense={printExpenseModalItem}
        isOpen={Boolean(printExpenseModalItem)}
        onClose={() => setPrintExpenseModalItem(null)}
      />
    </div>
  )
}

export const FinanceExpensesPage = ExpensesSpendingPage
export default ExpensesSpendingPage
