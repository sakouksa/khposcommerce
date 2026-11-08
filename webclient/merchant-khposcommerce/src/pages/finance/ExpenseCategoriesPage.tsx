import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { expenseService } from '@/services/expenseService'
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
  BulkSelectionBanner,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { CategoryForm } from './types/finance.types'
import { CategoryFormDrawer, ExpenseCategoriesTable } from './components'

export const ExpenseCategoriesPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreateCategory = hasPermission('expense_category.create')
  const canUpdateCategory = hasPermission('expense_category.update')
  const canDeleteCategory = hasPermission('expense_category.delete')

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
  } = useServerPagination({ storageKey: 'finance_categories' })

  // Sorting
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filters
  const [filterStatus, setFilterStatus] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    category_name: true,
    category_code: true,
    category_transactions: true,
    category_total_spent: true,
    category_status: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    code: '',
    description: '',
    is_active: true,
  })

  // Selection & Modals
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [bulkDeleteCategoryConfirmOpen, setBulkDeleteCategoryConfirmOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Query
  const {
    data: categoriesData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['expense-categories-tab', page, debouncedSearch, perPage, filterStatus, sortBy, sortOrder],
    queryFn: () =>
      expenseService.getCategories({
        page,
        search: debouncedSearch,
        per_page: perPage,
        status: filterStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: (prev) => prev,
  })

  const categories = categoriesData?.data ?? []
  const pagination = categoriesData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: CategoryForm) => {
      if (editingItem) {
        return expenseService.updateCategory(editingItem.id, payload)
      } else {
        return expenseService.createCategory(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-categories-tab'] })
      qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-categories-tab'] })
      qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.'))
    },
  })

  const bulkDeleteCategoriesMutation = useMutation({
    mutationFn: (ids: number[]) => expenseService.bulkDeleteCategories(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-categories-tab'] })
      qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      toast.success(t('finance.bulk_delete_categories_success', 'Selected categories deleted successfully.'))
      setSelectedCategoryIds([])
      adjustAfterDelete(selectedCategoryIds.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete selected categories.'))
    },
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

  const handleSelectCategoryRow = (id: number) => {
    const numId = Number(id)
    setSelectedCategoryIds((prev) =>
      prev.includes(numId) ? prev.filter((item) => item !== numId) : [...prev, numId]
    )
  }

  const handleSelectAllCategories = (allIds: number[]) => {
    const numIds = allIds.map(Number)
    if (numIds.every((id) => selectedCategoryIds.includes(id))) {
      setSelectedCategoryIds([])
    } else {
      setSelectedCategoryIds(numIds)
    }
  }

  const openCreateDrawer = () => {
    setEditingItem(null)
    setCategoryForm({ name: '', code: '', description: '', is_active: true })
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setCategoryForm({
      name: item.name || '',
      code: item.code || '',
      description: item.description || '',
      is_active: Boolean(item.is_active ?? true),
    })
    setDrawerOpen(true)
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.category_name', 'Category Name'),
          t('finance.code_col', 'Code'),
          t('finance.description_col', 'Description'),
          t('finance.status_col', 'Status'),
        ]
        const rows = (categories || []).map((cat: any) => [
          cat.name || '',
          cat.code || '',
          cat.description || '',
          cat.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
        ])
        downloadCsv('finance_categories', headers, rows)
        toast.dismiss(toastId)
        toast.success(t('finance.export_success', 'Dataset exported successfully.'))
      } catch {
        toast.dismiss(toastId)
        toast.error(t('finance.export_error', 'Failed to export dataset.'))
      }
    }, 300)
  }

  const hasInUseSelectedCategories = useMemo(() => {
    return (categories || []).some(
      (c: any) =>
        (selectedCategoryIds.includes(c.id) || selectedCategoryIds.includes(Number(c.id))) &&
        Number(c.expenses_count || 0) > 0
    )
  }, [categories, selectedCategoryIds])

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.financeManagement', t('finance.financial_management', 'Finance')), path: '/finance/expenses' },
          { label: t('finance.categories_title', 'Expense Categories') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.categories_title', 'Expense Categories')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.categories_subtitle', 'Configure expense classification categories, ledger codes, and budget allocations.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          {canCreateCategory && (
            <AddButton
              onClick={openCreateDrawer}
              label={t('finance.add_category', 'New Category')}
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
        searchPlaceholder={t('finance.search_categories', 'Search categories...')}
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
        onRefresh={() => qc.invalidateQueries({ queryKey: ['expense-categories-tab'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'category_name', label: t('finance.category_name', 'Category Name') },
          { key: 'category_code', label: t('finance.code_col', 'Code') },
          { key: 'category_transactions', label: t('finance.transactions_count_col', 'Transactions') },
          { key: 'category_total_spent', label: t('finance.total_spent_col', 'Total Spent') },
          { key: 'category_status', label: t('finance.status_col', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Bulk Delete Banner */}
      {selectedCategoryIds.length > 0 && canDeleteCategory && (
        <BulkSelectionBanner
          selectedCount={selectedCategoryIds.length}
          onDelete={() => setBulkDeleteCategoryConfirmOpen(true)}
          onClear={() => setSelectedCategoryIds([])}
          deleteLoading={bulkDeleteCategoriesMutation.isPending}
          deleteLabel={t('finance.delete_selected_categories', t('common.deleteSelected', 'Delete Selected'))}
          clearLabel={t('common.cancel', 'Cancel')}
        />
      )}

      {/* Categories Table */}
      <ExpenseCategoriesTable
        categories={categories}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdateCategory ? openEditDrawer : undefined}
        handleDelete={canDeleteCategory ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
        renderSortIcon={renderSortIcon}
        handleSort={handleSort}
        selectedRows={selectedCategoryIds}
        handleSelectRow={handleSelectCategoryRow}
        handleSelectAll={handleSelectAllCategories}
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
      <CategoryFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={editingItem}
        onSubmit={() => saveMutation.mutate(categoryForm)}
        isPending={saveMutation.isPending}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
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

      {/* Bulk Delete Categories Confirmation Dialog */}
      <ConfirmModal
        isOpen={bulkDeleteCategoryConfirmOpen}
        variant="danger"
        actionType="delete"
        title={t('finance.bulk_delete_categories_title', 'Delete Selected Categories')}
        message={t('finance.bulk_delete_categories_confirm_msg', {
          count: selectedCategoryIds.length,
          defaultValue: `Are you sure you want to delete all ${selectedCategoryIds.length} selected categories? This action cannot be undone.`,
        }).replace('{{count}}', String(selectedCategoryIds.length))}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteCategoriesMutation.isPending}
        warningText={
          hasInUseSelectedCategories
            ? t('finance.bulk_delete_categories_warning', 'Warning: Categories with linked active expenses cannot be deleted to protect historical financial records.')
            : undefined
        }
        onConfirm={() => {
          bulkDeleteCategoriesMutation.mutate(selectedCategoryIds, {
            onSettled: () => setBulkDeleteCategoryConfirmOpen(false),
          })
        }}
        onCancel={() => setBulkDeleteCategoryConfirmOpen(false)}
      />
    </div>
  )
}

export const FinanceCategoriesPage = ExpenseCategoriesPage
export default ExpenseCategoriesPage
