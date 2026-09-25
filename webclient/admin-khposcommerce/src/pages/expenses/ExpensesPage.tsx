import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X,
  DollarSign, Loader2,
} from 'lucide-react'
import { expenseService } from '@/services/expenseService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { FieldError, getFieldClass, TableToolbar, EnterpriseDatePicker } from '@/components/common'

interface Expense {
  id:          number
  category?:   { id: number; name: string }
  amount:      number
  date:        string
  description?: string
}

// Fallback categories if API endpoint doesn't exist
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Office Supplies' },
  { id: 2, name: 'Utilities' },
  { id: 3, name: 'Rent' },
  { id: 4, name: 'Salaries' },
  { id: 5, name: 'Marketing' },
  { id: 6, name: 'Transportation' },
  { id: 7, name: 'Maintenance' },
  { id: 8, name: 'Other' },
]

const ExpensesPage: React.FC = () => {
  const qc    = useQueryClient()
  const toast = useToast()

    const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'expenses' })
  const { t } = useTranslation(['finance', 'common'])
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<Expense | null>(null)

  // Form states
  const [categoryId, setCategoryId]     = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [amount, setAmount]             = useState('')
  const [date, setDate]                 = useState('')
  const [description, setDescription]   = useState('')
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseService.getCategories().then(r => r.data ?? []).catch(() => DEFAULT_CATEGORIES),
  })
  const categories = (categoriesData ?? DEFAULT_CATEGORIES)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['expenses', page, debouncedSearch, perPage],
    queryFn: () => expenseService.getExpenses({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => expenseService.createExpense(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense recorded successfully.')
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to record expense.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => expenseService.updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update expense.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense deleted successfully.')
      setDeleteTarget(null)
      adjustAfterDelete(expenses.length)
    },
    onError: () => {
      toast.error('Failed to delete expense.')
      setDeleteTarget(null)
    },
  })

  const expenses: Expense[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingExpense(null)
    setFormErrors({})
    setCategoryId('')
    setCategoryName('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setModalOpen(true)
  }

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp)
    setFormErrors({})
    setCategoryId(String(exp.category?.id ?? ''))
    setCategoryName(exp.category?.name ?? '')
    setAmount(String(exp.amount))
    setDate(exp.date.split('T')[0])
    setDescription(exp.description ?? '')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingExpense(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.amount = t('finance.amount_required', 'Please enter a valid expense amount')
    }
    if (!date) {
      errors.date = t('finance.date_required', 'Please select a date')
    }
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload: any = {
      company_id:          1,
      amount:              parseFloat(amount),
      date:                date,
      description:         description,
    }
    if (categoryId) payload.expense_category_id = parseInt(categoryId)

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Expenses</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{pagination.total} expenses total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                     bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          Record Expense
        </button>
      </div>

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search expenses..."
        onReset={reset}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['expenses'] })}
        refreshLoading={isFetching}
      />

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Category</th>
                <th className="text-left">Description</th>
                <th className="text-left">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton h-4 w-24 rounded" /></td>
                      <td><div className="skeleton h-4 w-32 rounded" /></td>
                      <td><div className="skeleton h-4 w-48 rounded" /></td>
                      <td><div className="skeleton h-4 w-20 rounded" /></td>
                      <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                    </tr>
                  ))
                : expenses.map((exp) => (
                    <tr key={exp.id} className="group">
                      <td className="text-sm text-foreground">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="text-sm text-primary font-medium">
                        {exp.category?.name ?? 'General'}
                      </td>
                      <td className="text-muted-foreground text-sm">{exp.description ?? '—'}</td>
                      <td className="font-semibold text-sm text-foreground">
                        Rp {exp.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onEdit={() => openEditModal(exp)}
                          onDelete={() => setDeleteTarget(exp)}
                        />
                      </td>
                    </tr>
                  ))
              }
              {!isLoading && expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <DollarSign size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No expenses recorded</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Click "Record Expense" to add one</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </TableWrapper>

        <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">
                  {editingExpense ? 'Edit Expense' : 'Record Expense'}
                </h3>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {(categories ?? []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Amount <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value)
                      handleClearError('amount')
                    }}
                    placeholder="0.00"
                    className={getFieldClass(formErrors.amount, 'form-input w-full')}
                  />
                  <FieldError error={formErrors.amount} />
                </div>

                <div id="date" data-field="date">
                  <EnterpriseDatePicker
                    label="Date"
                    required
                    value={date}
                    onChange={(val) => {
                      setDate(val)
                      handleClearError('date')
                    }}
                    error={Boolean(formErrors.date)}
                  />
                  <FieldError error={formErrors.date} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description / Notes</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Expense details..."
                    rows={3}
                    className="form-input resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-primary rounded-lg
                               hover:opacity-90 shadow-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                    {isSaving ? 'Saving...' : editingExpense ? 'Save Changes' : 'Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete Expense"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ExpensesPage
