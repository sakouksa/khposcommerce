import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, RefreshCw, X, Loader2, 
  DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw as RefundIcon,
  Filter, Download, Landmark, ArrowLeftRight
} from 'lucide-react'
import { financeService } from '@/services/financeService'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { EnterpriseModal } from '@/components/common/Modal'
import { ModalFooter } from '@/components/common/ModalFooter'
import TableActionMenu from '@/components/shared/TableActionMenu'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import { FieldError, getFieldClass } from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { useTranslation } from 'react-i18next'

interface Transaction {
  id: number
  company_id: number
  company?: { id: number; name: string }
  payment_method_id?: number
  payment_id?: number
  payment_method?: { id: number; name: string; type: string }
  type: string
  amount: number
  description?: string
  reference_type?: string
  reference_id?: number
  created_at: string
  [key: string]: any
}

interface TransactionForm {
  company_id: string
  payment_method_id: string
  payment_id?: string
  type: string
  amount: string
  description: string
  reference_type: string
  reference_id: string
  [key: string]: any
}

const BLANK_FORM: TransactionForm = {
  company_id: '',
  payment_method_id: '',
  payment_id: '',
  type: 'debit',
  amount: '',
  description: '',
  reference_type: '',
  reference_id: '',
}

const TransactionsPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const qc = useQueryClient()
  
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
  } = useServerPagination({ storageKey: 'transactions' })

  React.useEffect(() => {
    if (triggerAdd && triggerAdd > 0) {
      openCreateDrawer()
    }
  }, [triggerAdd])
    const [typeFilter, setTypeFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  
  // Form states
  const [form, setForm] = useState<TransactionForm>(BLANK_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transactions', page, debouncedSearch, perPage, typeFilter],
    queryFn: () => financeService.getTransactions({ 
      page, search: debouncedSearch, type: typeFilter, per_page: perPage 
    }),
    placeholderData: (prev) => prev,
  })

  const { data: companies } = useQuery({
    queryKey: ['companies-select'],
    queryFn: () => companyService.getCompanies({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods-select'],
    queryFn: () => financeService.getPaymentMethods({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: any) => financeService.createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction logged successfully')
      closeDrawer()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to log transaction')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => financeService.updateTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction updated successfully')
      closeDrawer()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update transaction')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction deleted successfully')
      setDeleteTarget(null)
      adjustAfterDelete(transactions.length)
    },
    onError: () => {
      toast.error('Failed to delete transaction')
      setDeleteTarget(null)
    }
  })

  const transactions: Transaction[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Stats calculation
  const totalVolume = transactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const salesVolume = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + Number(t.amount), 0)
  const purchaseVolume = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + Number(t.amount), 0)

  const openCreateDrawer = () => {
    setEditingTransaction(null)
    setForm(BLANK_FORM)
    setFormErrors({})
    setDrawerOpen(true)
  }

  const openEditDrawer = (tx: Transaction) => {
    setEditingTransaction(tx)
    setForm({
      company_id: String(tx.company_id),
      payment_method_id: tx.payment_method_id ? String(tx.payment_method_id) : '',
      payment_id: tx.payment_id ? String(tx.payment_id) : (tx.payment_method_id ? String(tx.payment_method_id) : ''),
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description ?? '',
      reference_type: tx.reference_type ?? '',
      reference_id: tx.reference_id ? String(tx.reference_id) : '',
    })
    setFormErrors({})
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingTransaction(null)
    setFormErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!form.company_id) {
      errors.company_id = t('finance.errors.companyRequired', 'Please select company or branch')
    }
    if (!form.type) {
      errors.type = t('finance.errors.typeRequired', 'Please select transaction type')
    }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errors.amount = t('finance.errors.amountRequired', 'Please enter a valid amount')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      company_id: Number(form.company_id),
      payment_id: form.payment_id ? Number(form.payment_id) : null,
      type: form.type,
      amount: Number(form.amount),
      description: form.description || null,
      reference_type: form.reference_type || null,
      reference_id: form.reference_id ? Number(form.reference_id) : null,
    }

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Company ID', 'Type', 'Amount', 'Reference Type', 'Reference ID', 'Description', 'Created At']
    const rows = transactions.map(t => [
      t.id,
      t.company_id,
      t.type,
      t.amount,
      t.reference_type || '',
      t.reference_id || '',
      t.description || '',
      t.created_at
    ])
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transactions_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Transactions exported successfully')
  }

  return (
    <div className="space-y-6">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Payments', path: '/payments/methods' }, { label: 'Transactions' }]} />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <PageHeader 
              icon={<ArrowLeftRight size={24} />}
              title="Transaction History" 
              subtitle="Real-time audit log of all sales, purchases, and refund transactions across branches."
            />
            <div className="flex items-center gap-3">
              <button onClick={exportCSV} className="btn btn-secondary flex items-center gap-2">
                <Download size={16} /> Export CSV
              </button>
              <button onClick={openCreateDrawer} className="btn btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 shadow-sm cursor-pointer font-semibold">
                <Plus size={16} /> Log Transaction
              </button>
            </div>
          </div>
        </>
      )}

      {/* Stats Cards */}
      {!isTab && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-sm font-medium">Total Volume</span>
              <h3 className="text-2xl font-bold text-foreground">
                ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-sm font-medium">Sales Inflow</span>
              <h3 className="text-2xl font-bold text-green-600">
                +${salesVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
              <ArrowUpRight size={24} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-sm font-medium">Purchases Outflow</span>
              <h3 className="text-2xl font-bold text-red-500">
                -${purchaseVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar (Frameless Standard) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-1">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder={t('finance.search_transactions', 'Search transactions (description, reference)...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-10 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={typeFilter} 
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="form-select w-full sm:w-44 bg-background border border-input rounded-lg text-sm px-3 py-2"
          >
            <option value="">{t('finance.all_types', 'All Types')}</option>
            <option value="debit">{t('finance.type_debit', 'Debit')}</option>
            <option value="credit">{t('finance.type_credit', 'Credit')}</option>
          </select>

          <button onClick={() => refetch()} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw size={16} />
          </button>
          
          {isTab && (
            <button onClick={exportCSV} className="btn btn-secondary flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
            <thead>
              <tr>
                <th className="w-[8%] text-left py-4 px-5">ID</th>
                <th className="w-[15%] text-left py-4 px-5">{t('finance.type_col', 'Type')}</th>
                <th className="w-[15%] text-left py-4 px-5">{t('finance.amount_col', 'Amount')}</th>
                <th className="w-[20%] text-left py-4 px-5">{t('finance.company_col', 'Company')}</th>
                <th className="w-[20%] text-left py-4 px-5">{t('finance.payment_method', 'Payment Method')}</th>
                <th className="w-[20%] text-left py-4 px-5">{t('finance.ref_col', 'Reference')}</th>
                <th className="w-[18%] text-left py-4 px-5">{t('finance.date_col', 'Created At')}</th>
                <th className="w-[100px] text-right py-4 px-5">{t('finance.actions_col', t('common.actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 px-5"><div className="skeleton h-4 w-8 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-16 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-4 w-28 rounded" /></td>
                    <td className="py-4 px-5"><div className="skeleton h-6 w-12 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Landmark className="text-muted-foreground/40" size={40} />
                      <span>{t('finance.no_data_transactions', 'No transactions logged in this period.')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-xs">{item.id}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        (item.type === 'sale' || item.type === 'debit') ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        (item.type === 'purchase' || item.type === 'credit') ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                        'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                      }`}>
                        {(item.type === 'sale' || item.type === 'debit') && <ArrowUpRight size={12} />}
                        {(item.type === 'purchase' || item.type === 'credit') && <ArrowDownRight size={12} />}
                        {item.type !== 'sale' && item.type !== 'debit' && item.type !== 'purchase' && item.type !== 'credit' && <ArrowUpRight size={12} />}
                        {item.type === 'debit' || item.type === 'sale' ? t('finance.type_debit', 'Debit') : t('finance.type_credit', 'Credit')}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-foreground">
                      ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-sm">{item.company?.name ?? `Company #${item.company_id}`}</td>
                    <td className="py-4 px-5 text-sm">{item.payment_method?.name ?? '-'}</td>
                    <td className="py-4 px-5 text-xs text-muted-foreground font-medium">
                      {item.reference_type ? `${item.reference_type.split('\\').pop()} #${item.reference_id}` : '-'}
                    </td>
                    <td className="py-4 px-5 text-xs text-muted-foreground whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        onEdit={() => openEditDrawer(item)}
                        onDelete={() => setDeleteTarget(item)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </TableWrapper>
        <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Add / Edit Center Modal */}
      <EnterpriseModal
        isOpen={drawerOpen}
        title={editingTransaction ? t('finance.edit_transaction', 'Edit Transaction') : t('finance.add_transaction', 'Record Transaction')}
        subtitle={t('finance.transaction_subtitle', 'Record debit or credit transaction entry in ledger')}
        icon={<Landmark size={20} />}
        iconVariant="emerald"
        size="lg"
        onClose={closeDrawer}
        footer={
          <ModalFooter
            onCancel={closeDrawer}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={(e) => { if (e?.preventDefault) e.preventDefault(); handleSubmit(e as any); }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEdit={!!editingTransaction}
            submitLabel={editingTransaction ? t('common.saveChanges', 'Save Changes') : t('finance.confirm_transaction', 'Confirm Transaction')}
          />
        }
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.select_company', 'Select Company')} <span className="text-rose-500">*</span></label>
            <select
              id="company_id"
              name="company_id"
              value={form.company_id}
              onChange={e => {
                setForm({ ...form, company_id: e.target.value })
                handleClearError('company_id')
              }}
              className={getFieldClass(
                formErrors.company_id,
                'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border bg-background text-foreground transition-all font-medium cursor-pointer'
              )}
            >
              <option value="">-- {t('finance.select_company', 'Select Company')} --</option>
              {companies?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FieldError error={formErrors.company_id} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.payment_method', 'Payment Method')}</label>
              <select
                id="payment_id"
                name="payment_id"
                value={form.payment_id}
                onChange={e => setForm({ ...form, payment_id: e.target.value })}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
              >
                <option value="">-- Cash / Direct --</option>
                {paymentMethods?.map((pm: any) => (
                  <option key={pm.id} value={pm.id}>{pm.name} ({pm.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.transaction_type', 'Transaction Type')} <span className="text-rose-500">*</span></label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={e => {
                  setForm({ ...form, type: e.target.value })
                  handleClearError('type')
                }}
                className={getFieldClass(
                  formErrors.type,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border bg-background text-foreground transition-all font-medium cursor-pointer capitalize'
                )}
              >
                <option value="debit">{t('finance.type_debit', 'Debit (Inflow)')}</option>
                <option value="credit">{t('finance.type_credit', 'Credit (Outflow)')}</option>
              </select>
              <FieldError error={formErrors.type} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.amount_col', 'Amount ($)')} <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => {
                  setForm({ ...form, amount: e.target.value })
                  handleClearError('amount')
                }}
                placeholder="e.g. 250.00"
                className={getFieldClass(
                  formErrors.amount,
                  'w-full h-10 min-h-[40px] pl-8 pr-3.5 py-2 text-xs sm:text-[13px] rounded-lg border bg-background text-foreground font-mono font-bold placeholder:text-muted-foreground/70 transition-all'
                )}
              />
            </div>
            <FieldError error={formErrors.amount} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.ref_type', 'Reference Type')}</label>
              <input
                type="text"
                placeholder="e.g. order, invoice"
                value={form.reference_type}
                onChange={e => setForm({ ...form, reference_type: e.target.value })}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.ref_id', 'Reference ID')}</label>
              <input
                type="number"
                placeholder="e.g. 104"
                value={form.reference_id}
                onChange={e => setForm({ ...form, reference_id: e.target.value })}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.description_col', 'Description / Note')}</label>
            <textarea
              rows={3}
              placeholder={t('finance.placeholder_desc', 'Provide additional transaction notes...')}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Transaction Entry"
        message="Are you sure you want to delete this transaction record? This action cannot be undone and will permanently remove this entry from the system audits."
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default TransactionsPage
