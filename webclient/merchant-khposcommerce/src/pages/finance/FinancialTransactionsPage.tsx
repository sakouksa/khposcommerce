import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  TableToolbar,
  ModernSelect,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { TransactionForm } from './types/finance.types'
import {
  TransactionStatsCards,
  TransactionFormDrawer,
  FinancialTransactionsTable,
} from './components'

export const FinancialTransactionsPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()

  // Pagination & Search
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
  } = useServerPagination({ storageKey: 'finance_transactions' })

  // Filters
  const [filterType, setFilterType] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    txn_id: true,
    txn_type: true,
    txn_amount: true,
    txn_company: true,
    txn_method: true,
    txn_ref: true,
    txn_description: true,
    txn_date: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    type: 'debit',
    amount: '',
    description: '',
    reference_type: '',
    reference_id: '',
    payment_method_id: '',
  })

  // Queries
  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    isFetching: fetchingTransactions,
  } = useQuery({
    queryKey: ['transactions-tab', page, debouncedSearch, perPage, filterType],
    queryFn: () =>
      financeService.getTransactions({
        page,
        search: debouncedSearch,
        per_page: perPage,
        type: filterType || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const { data: allTransactions, isLoading: loadingAllTransactions } = useQuery({
    queryKey: ['all-transactions-stats'],
    queryFn: () => financeService.getTransactions({ per_page: 1000 }).then((r) => r.data ?? []),
  })

  const transactions = transactionsData?.data ?? []
  const pagination = transactionsData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: TransactionForm) =>
      financeService.createTransaction({ ...payload, company_id: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions-tab'] })
      qc.invalidateQueries({ queryKey: ['all-transactions-stats'] })
      toast.success(t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setTransactionForm({
        type: 'debit',
        amount: '',
        description: '',
        reference_type: '',
        reference_id: '',
        payment_method_id: '',
      })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  // Handlers
  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.txn_id', 'Transaction ID'),
          t('finance.type_col', 'Type'),
          t('finance.amount_col', 'Amount'),
          t('finance.company_col', 'Company'),
          t('finance.payment_method', 'Payment Method'),
          t('finance.ref_col', 'Reference'),
          t('finance.date_col', 'Date'),
        ]
        const rows = (transactions || []).map((txn: any) => [
          txn.id,
          txn.type === 'debit' || txn.type === 'sale' ? t('finance.type_debit', 'Debit') : t('finance.type_credit', 'Credit'),
          Number(txn.amount || 0).toFixed(2),
          txn.company?.name || `Company #${txn.company_id}`,
          txn.payment_method?.name || '-',
          txn.reference_type ? `${txn.reference_type.split('\\').pop()} #${txn.reference_id}` : '-',
          txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '',
        ])
        downloadCsv('finance_transactions', headers, rows)
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
          { label: t('finance.transactions_title', 'Transactions Ledger') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.transactions_title', 'Financial Transactions Ledger')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.transactions_subtitle', 'Record debit inflows, credit disbursements, and inter-account journal movements.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          <AddButton
            onClick={() => setDrawerOpen(true)}
            label={t('finance.add_transaction', 'Log Transaction')}
          />
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <TransactionStatsCards
        transactions={allTransactions && allTransactions.length > 0 ? allTransactions : transactions}
        isLoading={loadingTransactions || loadingAllTransactions}
      />

      {/* Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('finance.search_transactions', 'Search transactions (description, reference)...')}
        filterContent={
          <ModernSelect
            value={filterType}
            onChange={(val) => {
              setFilterType(String(val ?? ''))
              setPage(1)
            }}
            options={[
              { value: '', label: `${t('finance.filter_type', t('common.type', 'Type'))}: ${t('finance.all_types', t('common.all', 'All'))}` },
              { value: 'debit', label: t('finance.type_debit', 'Debit (Inflow)') },
              { value: 'credit', label: t('finance.type_credit', 'Credit (Outflow)') },
            ]}
            className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
          />
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['transactions-tab'] })}
        refreshLoading={fetchingTransactions}
        columns={[
          { key: 'txn_id', label: t('finance.txn_id', 'Transaction ID') },
          { key: 'txn_type', label: t('finance.type_col', 'Type') },
          { key: 'txn_amount', label: t('finance.amount_col', 'Amount') },
          { key: 'txn_company', label: t('finance.company_col', 'Company') },
          { key: 'txn_method', label: t('finance.payment_method', 'Payment Method') },
          { key: 'txn_ref', label: t('finance.ref_col', 'Reference') },
          { key: 'txn_description', label: t('finance.description_col', 'Description') },
          { key: 'txn_date', label: t('finance.date_col', 'Date') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Main Table */}
      <FinancialTransactionsTable
        transactions={transactions}
        isLoading={loadingTransactions}
        isFetching={fetchingTransactions}
        visibleColumns={visibleColumns}
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
      <TransactionFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={null}
        onSubmit={() => saveMutation.mutate(transactionForm)}
        isPending={saveMutation.isPending}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
      />
    </div>
  )
}

export const FinanceTransactionsPage = FinancialTransactionsPage
export default FinancialTransactionsPage
