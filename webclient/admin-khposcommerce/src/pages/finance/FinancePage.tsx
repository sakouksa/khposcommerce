import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, DollarSign, Receipt, Landmark, CreditCard, Search, Filter, RefreshCw,
  FolderTree, ChevronUp, ChevronDown, Globe, Percent, X
} from 'lucide-react'
import { financeService } from '@/services/financeService'
import { expenseService } from '@/services/expenseService'
import { salesService } from '@/services/salesService'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  ActionButton,
  AddButton,
  ExportButton,
  ImportButton,
  TableToolbar,
  ModernSelect,
  ConfirmModal,
  BulkSelectionBanner,
} from '@/components/common'
import ResetButton from '@/components/shared/ResetButton'
import Pagination from '@/components/shared/Pagination'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import { useTranslation } from 'react-i18next'
import { downloadCsv } from '@/utils/export'

import TransactionsTab from './components/tabs/TransactionsTab'
import PaymentMethodsTab from './components/tabs/PaymentMethodsTab'
import { FinanceStatsCards } from './components/FinanceStatsCards'
import { FinanceTrendsChart } from './components/FinanceTrendsChart'
import { FinanceFilterDrawer } from './components/FinanceFilterDrawer'
import { FinanceFormDrawer } from './components/FinanceFormDrawer'
import { FinanceImportModal } from './components/FinanceImportModal'
import { ExpenseVoucherPrintModal } from './components/ExpenseVoucherPrintModal'
import { RegisterCloseModal } from './components/RegisterCloseModal'
import { ExpensesTab } from './components/tabs/ExpensesTab'
import { CategoriesTab } from './components/tabs/CategoriesTab'
import { RegistersTab } from './components/tabs/RegistersTab'
import { CurrenciesTab } from './components/tabs/CurrenciesTab'
import { TaxesTab } from './components/tabs/TaxesTab'
import type {
  TabType, ExpenseForm, CategoryForm, RegisterForm, CurrencyForm, TaxForm,
  PaymentMethodForm, TransactionForm
} from './types/finance.types'

const FinancePage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTabRaw] = usePageTab<TabType>({
    storageKey: 'finance_active_tab',
    defaultTab: 'expenses',
    validTabs: ['expenses', 'categories', 'registers', 'transactions', 'payment_methods', 'currencies', 'taxes'],
    onChange: () => {
      setSelectedExpenseIds([])
      setSelectedCategoryIds([])
      reset()
    },
  })

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
  } = useServerPagination({ storageKey: `finance_${activeTab}` })

  const setActiveTab = (tab: TabType) => {
    setActiveTabRaw(tab)
  }

  // Drawers & Modals
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: ''
  })

  // Forms
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    title: '',
    expense_category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    branch_id: '1',
    reference_number: '',
    receipt: '',
    status: 'approved'
  })
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    code: '',
    description: '',
    is_active: true
  })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    title: '',
    status: 'open',
    opening_balance: '0',
    closing_balance: '0',
    branch_id: '1',
    store_id: '1',
    notes: ''
  })
  const [currencyForm, setCurrencyForm] = useState<CurrencyForm>({
    name: '',
    code: '',
    symbol: '',
    exchange_rate: '1.00',
    is_active: true,
    is_default: false
  })
  const [taxForm, setTaxForm] = useState<TaxForm>({
    name: '',
    rate: '',
    type: 'percentage',
    is_active: true
  })
  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethodForm>({
    name: '',
    code: '',
    type: 'cash',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    is_active: true
  })
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    type: 'debit',
    amount: '',
    description: '',
    reference_type: '',
    reference_id: '',
    payment_method_id: '',
  })

  // Sorting State
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    expense_title: true,
    expense_category: true,
    expense_amount: true,
    expense_status: true,
    expense_date: true,
    expense_receipt: true,
    category_name: true,
    category_code: true,
    category_transactions: true,
    category_total_spent: true,
    category_status: true,
    register_title: true,
    register_balance: true,
    register_status: true,
    currency_name: true,
    currency_code: true,
    currency_symbol: true,
    currency_rate: true,
    currency_status: true,
    tax_name: true,
    tax_rate: true,
    tax_type: true,
    tax_status: true,
    pm_name: true,
    pm_code: true,
    pm_type: true,
    pm_fee: true,
    pm_channels: true,
    pm_status: true,
    txn_id: true,
    txn_type: true,
    txn_amount: true,
    txn_company: true,
    txn_method: true,
    txn_ref: true,
    txn_description: true,
    txn_date: true,
  })

  // Advanced Filters
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')
  const [filterAmountMin, setFilterAmountMin] = useState('')
  const [filterAmountMax, setFilterAmountMax] = useState('')
  const [filterCreatedBy, setFilterCreatedBy] = useState('')

  const effectiveCategory = activeCategoryFilter || filterCategory

  const isFilterActive = Boolean(
    filterStatus ||
    filterCategory ||
    activeCategoryFilter ||
    filterDateStart ||
    filterDateEnd ||
    filterAmountMin ||
    filterAmountMax ||
    filterCreatedBy ||
    filterType ||
    filterAccount ||
    filterPaymentMethod
  )

  // Queries
  const { data: expensesData, isLoading: loadingExpenses, isFetching: fetchingExpenses } = useQuery({
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
    queryFn: () => expenseService.getExpenses({
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
    enabled: activeTab === 'expenses',
  })

  const { data: categoriesData, isLoading: loadingCategories, isFetching: fetchingCategories } = useQuery({
    queryKey: ['expense-categories-tab', page, debouncedSearch, perPage, filterStatus, sortBy, sortOrder],
    queryFn: () => expenseService.getCategories({
      page,
      search: debouncedSearch,
      per_page: perPage,
      status: filterStatus || undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'categories' || activeTab === 'expenses',
  })

  const { data: registersData, isLoading: loadingRegisters, isFetching: fetchingRegisters } = useQuery({
    queryKey: ['cash-registers-tab', page, debouncedSearch, perPage, filterStatus],
    queryFn: () => financeService.getCashRegisters({ page, search: debouncedSearch, per_page: perPage, status: filterStatus || undefined }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'registers',
  })

  const { data: currenciesData, isLoading: loadingCurrencies, isFetching: fetchingCurrencies } = useQuery({
    queryKey: ['currencies-tab', page, debouncedSearch, perPage, filterStatus],
    queryFn: () => financeService.getCurrencies({ page, search: debouncedSearch, per_page: perPage, status: filterStatus || undefined }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'currencies',
  })

  const { data: taxesData, isLoading: loadingTaxes, isFetching: fetchingTaxes } = useQuery({
    queryKey: ['taxes-tab', page, debouncedSearch, perPage, filterStatus, filterType],
    queryFn: () => financeService.getTaxes({ page, search: debouncedSearch, per_page: perPage, status: filterStatus || undefined, type: filterType || undefined }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'taxes',
  })

  const { data: paymentMethodsData, isLoading: loadingPaymentMethods, isFetching: fetchingPaymentMethods } = useQuery({
    queryKey: ['payment-methods-tab', page, debouncedSearch, perPage, filterStatus, filterType],
    queryFn: () => financeService.getPaymentMethods({
      page,
      search: debouncedSearch,
      per_page: perPage,
      status: filterStatus || undefined,
      type: filterType || undefined,
    }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'payment_methods',
  })

  const { data: transactionsData, isLoading: loadingTransactions, isFetching: fetchingTransactions } = useQuery({
    queryKey: ['transactions-tab', page, debouncedSearch, perPage, filterType],
    queryFn: () => financeService.getTransactions({
      page,
      search: debouncedSearch,
      per_page: perPage,
      type: filterType || undefined,
    }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'transactions',
  })

  const expenses = expensesData?.data ?? []
  const categories = categoriesData?.data ?? []
  const registers = registersData?.data ?? []
  const currencies = currenciesData?.data ?? []
  const taxes = taxesData?.data ?? []
  const paymentMethods = paymentMethodsData?.data ?? []
  const transactions = transactionsData?.data ?? []

  // Stats & Analytics Queries
  const { data: financeAnalytics } = useQuery({
    queryKey: ['finance-analytics'],
    queryFn: () => financeService.getAnalytics(),
  })

  const { data: allExpenses } = useQuery({
    queryKey: ['all-expenses-stats'],
    queryFn: () => expenseService.getExpenses({ per_page: 1000 }).then(r => r.data ?? []),
  })

  const { data: allRegisters } = useQuery({
    queryKey: ['all-registers-stats'],
    queryFn: () => financeService.getCashRegisters({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: allSales } = useQuery({
    queryKey: ['all-sales-stats-finance'],
    queryFn: () => salesService.list({ per_page: 1000 }).then(r => r.data ?? []),
  })

  const getTabQueryKey = (tab: TabType): string => {
    switch (tab) {
      case 'categories':
        return 'expense-categories-tab'
      case 'registers':
        return 'cash-registers-tab'
      case 'payment_methods':
        return 'payment-methods-tab'
      default:
        return `${tab}-tab`
    }
  }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingItem) {
        return financeService.updateItemByTab(activeTab, editingItem.id, payload)
      } else {
        return financeService.createItemByTab(activeTab, { ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [getTabQueryKey(activeTab)] })
      qc.invalidateQueries({ queryKey: [`${activeTab}-tab`] })
      if (activeTab === 'categories') {
        qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      }
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      qc.invalidateQueries({ queryKey: ['finance-analytics'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      qc.invalidateQueries({ queryKey: ['all-sales-stats-finance'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      closeDrawer()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deleteItemByTab(activeTab, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [getTabQueryKey(activeTab)] })
      qc.invalidateQueries({ queryKey: [`${activeTab}-tab`] })
      if (activeTab === 'categories') {
        qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      }
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      qc.invalidateQueries({ queryKey: ['all-sales-stats-finance'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.'))
  })

  const togglePaymentMethodStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      financeService.updatePaymentMethod(id, { is_active: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      toast.success(t('common.saveSuccess', 'Status updated.'))
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to update status.'))
  })

  // Modal states for Official Voucher Printing & Register Shift Close
  const [printExpenseModalItem, setPrintExpenseModalItem] = useState<any | null>(null)
  const [closeRegisterModalItem, setCloseRegisterModalItem] = useState<any | null>(null)

  // Expense Approval / Rejection Mutation
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
    onError: () => toast.error(t('finance.save_error', 'Failed to update expense status.'))
  })

  // Cash Register Shift Close & Reconciliation Mutation
  const closeRegisterMutation = useMutation({
    mutationFn: ({ id, closingBalance, note, actualCash }: { id: number; closingBalance: number; note: string; actualCash: number }) =>
      financeService.updateCashRegister(id, {
        status: 'closed',
        closing_balance: actualCash,
        closing_note: note,
        notes: note,
        closed_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash-registers-tab'] })
      qc.invalidateQueries({ queryKey: ['registers-tab'] })
      qc.invalidateQueries({ queryKey: ['all-registers-stats'] })
      toast.success(t('finance.close_register_success', 'Cash register shift closed successfully.'))
      setCloseRegisterModalItem(null)
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to close register shift.'))
  })

  // Bulk Selection & Quick Category Filters for Expenses
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return expenseService.bulkDelete(ids)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses-tab'] })
      qc.invalidateQueries({ queryKey: ['all-expenses-stats'] })
      toast.success(t('finance.bulk_delete_success', 'Selected expenses deleted successfully.'))
      setSelectedExpenseIds([])
      adjustAfterDelete(selectedExpenseIds.length)
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete selected expenses.'))
  })

  // Bulk Selection for Categories
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [bulkDeleteCategoryConfirmOpen, setBulkDeleteCategoryConfirmOpen] = useState(false)

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

  const hasInUseSelectedCategories = useMemo(() => {
    return (categories || []).some(
      (c: any) =>
        (selectedCategoryIds.includes(c.id) || selectedCategoryIds.includes(Number(c.id))) &&
        Number(c.expenses_count) > 0
    )
  }, [categories, selectedCategoryIds])

  const bulkDeleteCategoriesMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return expenseService.bulkDeleteCategories(ids)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-categories-tab'] })
      qc.invalidateQueries({ queryKey: ['expense-categories-dropdown'] })
      toast.success(t('finance.bulk_delete_categories_success', 'Selected categories deleted successfully.'))
      setSelectedCategoryIds([])
      adjustAfterDelete(selectedCategoryIds.length)
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete selected categories.'))
  })

  const handleExportCsv = () => {
    const toastId = toast.info(t('finance.export_generating', 'Generating export... download will begin shortly.'))
    setTimeout(() => {
      try {
        let headers: string[] = []
        let rows: (string | number | boolean | null | undefined)[][] = []

        if (activeTab === 'categories') {
          headers = [
            t('finance.code_col', 'Code'),
            t('finance.name_col', 'Name'),
            t('finance.description_col', 'Description'),
            t('finance.status_col', 'Status'),
          ]
          rows = (categories || []).map((cat: any) => [
            cat.code || '',
            cat.name || '',
            cat.description || '',
            cat.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
          ])
        } else if (activeTab === 'registers') {
          headers = [
            t('finance.register_name', 'Register Name'),
            t('finance.opening_balance', 'Opening Balance'),
            t('finance.closing_balance', 'Closing Balance'),
            t('finance.cash_sales', 'Cash Sales'),
            t('finance.status_col', 'Status'),
          ]
          rows = (registers || []).map((reg: any) => [
            reg.title || reg.name || `Register #${reg.id}`,
            Number(reg.opening_balance || 0).toFixed(2),
            Number(reg.closing_balance || 0).toFixed(2),
            Number(reg.cash_sales_amount || 0).toFixed(2),
            reg.status === 'open' ? t('finance.status_open', 'Open') : t('finance.status_closed', 'Closed'),
          ])
        } else if (activeTab === 'transactions') {
          headers = [
            t('finance.txn_id', 'Transaction ID'),
            t('finance.type_col', 'Type'),
            t('finance.amount_col', 'Amount'),
            t('finance.company_col', 'Company'),
            t('finance.payment_method', 'Payment Method'),
            t('finance.ref_col', 'Reference'),
            t('finance.date_col', 'Date'),
          ]
          rows = (transactions || []).map((txn: any) => [
            txn.id,
            txn.type === 'debit' || txn.type === 'sale' ? t('finance.type_debit', 'Debit') : t('finance.type_credit', 'Credit'),
            Number(txn.amount || 0).toFixed(2),
            txn.company?.name || `Company #${txn.company_id}`,
            txn.payment_method?.name || '-',
            txn.reference_type ? `${txn.reference_type.split('\\').pop()} #${txn.reference_id}` : '-',
            txn.created_at ? new Date(txn.created_at).toLocaleDateString() : '',
          ])
        } else if (activeTab === 'payment_methods') {
          headers = [
            t('finance.method_name', 'Method Name'),
            t('finance.code_col', 'Code'),
            t('finance.type_col', 'Type'),
            t('finance.fee_col', 'Fees'),
            t('finance.status_col', 'Status'),
          ]
          rows = (paymentMethods || []).map((pm: any) => [
            pm.name || '',
            pm.code || '',
            t(`finance.pm_type_${pm.type || 'cash'}`, pm.type || 'Cash'),
            Number(pm.fee_percent) === 0 && Number(pm.fee_fixed) === 0
              ? t('finance.fee_free', 'Free')
              : `${Number(pm.fee_percent) || 0}% + $${Number(pm.fee_fixed || 0).toFixed(2)}`,
            pm.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
          ])
        } else if (activeTab === 'currencies') {
          headers = [
            t('finance.code_col', 'Code'),
            t('finance.currency_name', 'Currency Name'),
            t('finance.symbol', 'Symbol'),
            t('finance.exchange_rate', 'Exchange Rate'),
            t('finance.status_col', 'Status'),
          ]
          rows = (currencies || []).map((cur: any) => [
            cur.code || '',
            cur.name || '',
            cur.symbol || '',
            cur.exchange_rate || 1,
            cur.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
          ])
        } else if (activeTab === 'taxes') {
          headers = [
            t('finance.tax_rule_name', 'Tax Rule Name'),
            t('finance.tax_rate', 'Tax Rate (%)'),
            t('finance.type_col', 'Type'),
            t('finance.status_col', 'Status'),
          ]
          rows = (taxes || []).map((tax: any) => [
            tax.name || '',
            tax.rate || 0,
            tax.type === 'percentage' ? t('finance.tax_type_percentage', 'Percentage') : t('finance.tax_type_fixed', 'Fixed'),
            tax.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
          ])
        } else {
          // default expenses tab
          headers = [
            t('finance.title_col', 'Title'),
            t('finance.category_col', 'Category'),
            t('finance.amount_col', 'Amount ($)'),
            t('finance.date_col', 'Date'),
            t('finance.status_col', 'Status'),
            t('finance.reference_number', 'Reference #'),
            t('finance.description_col', 'Description'),
          ]
          rows = (expenses || []).map((exp: any) => [
            exp.title || `Expense #${exp.id}`,
            exp.category?.name || 'General',
            exp.amount || 0,
            exp.date || '',
            exp.status === 'approved' ? t('finance.status_approved', 'Approved') : exp.status === 'pending' ? t('finance.status_pending', 'Pending') : exp.status || 'approved',
            exp.reference_number || `EXP-${String(exp.id).padStart(5, '0')}`,
            exp.description || '',
          ])
        }

        downloadCsv(`finance_${activeTab}`, headers, rows)
        toast.dismiss(toastId)
        toast.success(t('finance.export_success', 'Dataset exported successfully.'))
      } catch {
        toast.dismiss(toastId)
        toast.error(t('finance.export_error', 'Failed to export dataset.'))
      }
    }, 300)
  }

  const handleAddActionClick = () => {
    openCreateDrawer()
  }

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExpenseForm(prev => ({ ...prev, receipt: `receipts/${file.name}` }))
    }
  }

  const openCreateDrawer = () => {
    if (activeTab === 'expenses') {
      navigate('/expenses/create')
      return
    }
    setEditingItem(null)
    setCategoryForm({ name: '', code: '', description: '', is_active: true })
    setRegisterForm({
      title: '',
      status: 'open',
      opening_balance: '0',
      closing_balance: '0',
      branch_id: '1',
      store_id: '1',
      notes: ''
    })
    setCurrencyForm({ name: '', code: '', symbol: '', exchange_rate: '1.00', is_active: true, is_default: false })
    setTaxForm({ name: '', rate: '', type: 'percentage', is_active: true })
    setPaymentMethodForm({
      name: '',
      code: '',
      type: 'cash',
      fee_percent: '0.00',
      fee_fixed: '0.00',
      available_pos: true,
      available_online: true,
      is_active: true
    })
    setTransactionForm({
      type: 'debit',
      amount: '',
      description: '',
      reference_type: '',
      reference_id: '',
      payment_method_id: '',
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (row: any) => {
    if (activeTab === 'expenses') {
      navigate(`/expenses/${row.id}/edit`)
      return
    }
    setEditingItem(row)
    if (activeTab === 'categories') {
      setCategoryForm({
        name: row.name || '',
        code: row.code || '',
        description: row.description || '',
        is_active: !!row.is_active,
      })
    } else if (activeTab === 'registers') {
      setRegisterForm({
        title: row.title || row.name || '',
        status: row.status || 'open',
        opening_balance: String(row.opening_balance ?? '0'),
        closing_balance: String(row.closing_balance ?? '0'),
        branch_id: String(row.branch_id ?? '1'),
        store_id: String(row.store_id ?? '1'),
        notes: row.notes || '',
      })
    } else if (activeTab === 'currencies') {
      setCurrencyForm({
        name: row.name || '',
        code: row.code || '',
        symbol: row.symbol || '',
        exchange_rate: String(row.exchange_rate ?? '1.00'),
        is_active: !!row.is_active,
        is_default: !!row.is_default,
      })
    } else if (activeTab === 'taxes') {
      setTaxForm({
        name: row.name || '',
        rate: String(row.rate ?? ''),
        type: row.type || 'percentage',
        is_active: !!row.is_active,
      })
    } else if (activeTab === 'payment_methods') {
      setPaymentMethodForm({
        name: row.name || '',
        code: row.code || '',
        type: row.type || 'cash',
        fee_percent: String(row.fee_percent ?? '0.00'),
        fee_fixed: String(row.fee_fixed ?? '0.00'),
        available_pos: !!row.available_pos,
        available_online: !!row.available_online,
        is_active: !!row.is_active,
      })
    } else if (activeTab === 'transactions') {
      setTransactionForm({
        type: row.type || 'debit',
        amount: String(row.amount ?? ''),
        description: row.description || '',
        reference_type: row.reference_type || '',
        reference_id: String(row.reference_id ?? ''),
        payment_method_id: String(row.payment_method_id ?? ''),
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (id: number, name?: string) => {
    setDeleteConfirm({ open: true, id, name })
  }

  const handleSubmit = () => {
    let payload: any = {}
    if (activeTab === 'expenses') {
      payload = {
        title: expenseForm.title || `Expense - ${new Date().toLocaleDateString()}`,
        expense_category_id: expenseForm.expense_category_id ? Number(expenseForm.expense_category_id) : null,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description || null,
        branch_id: Number(expenseForm.branch_id || 1),
        reference_number: expenseForm.reference_number || null,
        receipt: expenseForm.receipt || null,
        status: expenseForm.status || 'approved',
      }
    } else if (activeTab === 'categories') {
      payload = {
        name: categoryForm.name,
        code: categoryForm.code || null,
        description: categoryForm.description || null,
        is_active: categoryForm.is_active,
      }
    } else if (activeTab === 'registers') {
      payload = {
        title: registerForm.title,
        status: registerForm.status,
        opening_balance: Number(registerForm.opening_balance),
        closing_balance: registerForm.closing_balance ? Number(registerForm.closing_balance) : null,
        notes: registerForm.notes || null,
        branch_id: Number(registerForm.branch_id || 1),
        store_id: Number(registerForm.store_id || 1),
      }
    } else if (activeTab === 'currencies') {
      payload = {
        name: currencyForm.name,
        code: currencyForm.code,
        symbol: currencyForm.symbol,
        exchange_rate: Number(currencyForm.exchange_rate),
        is_active: currencyForm.is_active,
        is_default: currencyForm.is_default,
      }
    } else if (activeTab === 'taxes') {
      payload = {
        name: taxForm.name,
        rate: Number(taxForm.rate),
        type: taxForm.type,
        is_active: taxForm.is_active,
      }
    } else if (activeTab === 'payment_methods') {
      payload = {
        name: paymentMethodForm.name,
        code: paymentMethodForm.code,
        type: paymentMethodForm.type,
        fee_percent: Number(paymentMethodForm.fee_percent || 0),
        fee_fixed: Number(paymentMethodForm.fee_fixed || 0),
        available_pos: paymentMethodForm.available_pos,
        available_online: paymentMethodForm.available_online,
        is_active: paymentMethodForm.is_active,
      }
    } else if (activeTab === 'transactions') {
      payload = {
        type: transactionForm.type,
        amount: Number(transactionForm.amount),
        description: transactionForm.description || null,
        reference_type: transactionForm.reference_type || null,
        reference_id: transactionForm.reference_id ? Number(transactionForm.reference_id) : null,
        payment_method_id: transactionForm.payment_method_id ? Number(transactionForm.payment_method_id) : null,
      }
    }
    saveMutation.mutate(payload)
  }

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
    return sortOrder === 'asc' ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />
  }

  const handleResetFilters = () => {
    setFilterType('')
    setFilterStatus('')
    setFilterAccount('')
    setFilterCategory('')
    setActiveCategoryFilter('')
    setFilterPaymentMethod('')
    setFilterDateStart('')
    setFilterDateEnd('')
    setFilterAmountMin('')
    setFilterAmountMax('')
    setFilterCreatedBy('')
    setSearch('')
    setPage(1)
  }

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'expenses': return t('finance.add_expense', 'Add Expense')
      case 'categories': return t('finance.add_category', 'Add Category')
      case 'registers': return t('finance.add_register', 'Add Register')
      case 'transactions': return t('finance.add_transaction', 'Log Transaction')
      case 'payment_methods': return t('finance.add_payment_method', 'Add Method')
      case 'currencies': return t('finance.add_currency', 'Add Currency')
      case 'taxes': return t('finance.add_tax', 'Add Tax Rule')
      default: return t('finance.add_transaction', 'Add Transaction')
    }
  }

  const currentTabColumns = useMemo(() => {
    switch (activeTab) {
      case 'expenses':
        return [
          { key: 'expense_title', label: t('finance.title_col', 'Title') },
          { key: 'expense_category', label: t('finance.category_col', 'Category') },
          { key: 'expense_amount', label: t('finance.amount_col', 'Amount') },
          { key: 'expense_status', label: t('finance.status_col', 'Status') },
          { key: 'expense_date', label: t('finance.date_col', 'Date') },
          { key: 'expense_receipt', label: t('finance.receipt', 'Receipt') },
        ]
      case 'categories':
        return [
          { key: 'category_name', label: t('finance.category_name', 'Category Name') },
          { key: 'category_code', label: t('finance.code_col', 'Code') },
          { key: 'category_transactions', label: t('finance.transactions_count_col', 'Transactions') },
          { key: 'category_total_spent', label: t('finance.total_spent_col', 'Total Spent') },
          { key: 'category_status', label: t('finance.status_col', 'Status') },
        ]
      case 'registers':
        return [
          { key: 'register_title', label: t('finance.register_title', 'Register Title') },
          { key: 'register_balance', label: t('finance.current_balance', 'Current Balance') },
          { key: 'register_status', label: t('finance.status_col', 'Status') },
        ]
      case 'payment_methods':
        return [
          { key: 'pm_name', label: t('finance.method_name', 'Method Name') },
          { key: 'pm_code', label: t('finance.code_col', 'Code') },
          { key: 'pm_type', label: t('finance.type_col', 'Type') },
          { key: 'pm_fee', label: t('finance.fee_col', 'Fee') },
          { key: 'pm_channels', label: t('finance.channels_col', 'Channels') },
          { key: 'pm_status', label: t('finance.status_col', 'Status') },
        ]
      case 'transactions':
        return [
          { key: 'txn_id', label: 'ID' },
          { key: 'txn_type', label: t('finance.type_col', 'Type') },
          { key: 'txn_amount', label: t('finance.amount_col', 'Amount') },
          { key: 'txn_company', label: t('finance.company_col', 'Company') },
          { key: 'txn_method', label: t('finance.payment_method', 'Payment Method') },
          { key: 'txn_ref', label: t('finance.ref_col', 'Reference') },
          { key: 'txn_description', label: t('finance.description_col', 'Description') },
          { key: 'txn_date', label: t('finance.date_col', 'Date') },
        ]
      case 'currencies':
        return [
          { key: 'currency_name', label: t('finance.currency_name', 'Currency Name') },
          { key: 'currency_code', label: t('finance.iso_code', 'ISO Code') },
          { key: 'currency_symbol', label: t('finance.symbol_col', 'Symbol') },
          { key: 'currency_rate', label: t('finance.exchange_rate', 'Exchange Rate') },
          { key: 'currency_status', label: t('finance.status_col', 'Status') },
        ]
      case 'taxes':
        return [
          { key: 'tax_name', label: t('finance.tax_rule_name', 'Tax Rule Name') },
          { key: 'tax_rate', label: t('finance.tax_rate', 'Tax Rate (%)') },
          { key: 'tax_type', label: t('finance.type_col', 'Type') },
          { key: 'tax_status', label: t('finance.status_col', 'Status') },
        ]
      default:
        return []
    }
  }, [activeTab, t])

  const isLoading =
    activeTab === 'expenses' ? loadingExpenses :
    activeTab === 'categories' ? loadingCategories :
    activeTab === 'registers' ? loadingRegisters :
    activeTab === 'payment_methods' ? loadingPaymentMethods :
    activeTab === 'transactions' ? loadingTransactions :
    activeTab === 'currencies' ? loadingCurrencies : loadingTaxes

  const isFetching =
    activeTab === 'expenses' ? fetchingExpenses :
    activeTab === 'categories' ? fetchingCategories :
    activeTab === 'registers' ? fetchingRegisters :
    activeTab === 'payment_methods' ? fetchingPaymentMethods :
    activeTab === 'transactions' ? fetchingTransactions :
    activeTab === 'currencies' ? fetchingCurrencies : fetchingTaxes

  const paginationData =
    activeTab === 'expenses' ? expensesData?.pagination :
    activeTab === 'categories' ? categoriesData?.pagination :
    activeTab === 'registers' ? registersData?.pagination :
    activeTab === 'payment_methods' ? paymentMethodsData?.pagination :
    activeTab === 'transactions' ? transactionsData?.pagination :
    activeTab === 'currencies' ? currenciesData?.pagination : taxesData?.pagination

  const pagination = paginationData ?? { total: 0, current_page: 1, last_page: 1 }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb items={[
        { label: t('common.dashboard', 'Dashboard'), path: '/dashboard' },
        { label: t('finance.financial_management', 'Financial Management') }
      ]} />

      {/* Frameless Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.financial_management', 'Financial Management')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.subtitle_desc', 'Track sales revenue, operating expenses, cash registers, multi-currency rates, and taxes across the Enterprise POS system.')}
          </p>
        </div>
        <HeaderActionsGroup>
          {activeTab === 'expenses' && (
            <>
              <ImportButton
                onClick={() => setImportOpen(true)}
                label={t('finance.import_csv', 'Import CSV')}
              />
              <ExportButton
                onClick={handleExportCsv}
                label={t('finance.export_csv', 'Export CSV')}
              />
            </>
          )}
          <AddButton
            onClick={handleAddActionClick}
            label={getAddButtonLabel()}
          />
        </HeaderActionsGroup>
      </div>

      {/* Workspace Tabs Navigation (Matching Product & Customer Catalog Design) */}
      <WorkspaceTabs
        tabs={[
          {
            id: 'expenses',
            label: t('finance.tab_expenses', t('finance.expenses', 'Expenses')),
            icon: Receipt,
            count: expensesData?.pagination?.total ?? (allExpenses?.length || 0),
          },
          {
            id: 'categories',
            label: t('finance.tab_categories', t('finance.categories', 'Categories')),
            icon: FolderTree,
            count: categoriesData?.pagination?.total ?? (categories?.length || 0),
          },
          {
            id: 'registers',
            label: t('finance.tab_registers', t('finance.registers', 'Till Registers')),
            icon: Landmark,
            count: registersData?.pagination?.total ?? (allRegisters?.length || 0),
          },
          {
            id: 'transactions',
            label: t('finance.tab_transactions', t('finance.transactions', 'Transactions')),
            icon: DollarSign,
            count: transactionsData?.pagination?.total ?? (transactions?.length || 0),
          },
          {
            id: 'payment_methods',
            label: t('finance.tab_payment_methods', t('finance.payment_methods', 'Payment Methods')),
            icon: CreditCard,
            count: paymentMethodsData?.pagination?.total ?? (paymentMethods?.length || 0),
          },
          {
            id: 'currencies',
            label: t('finance.tab_currencies', t('finance.currencies', 'Currencies')),
            icon: Globe,
            count: currenciesData?.pagination?.total ?? (currencies?.length || 0),
          },
          {
            id: 'taxes',
            label: t('finance.tab_taxes', t('finance.taxes', 'Tax Rules')),
            icon: Percent,
            count: taxesData?.pagination?.total ?? (taxes?.length || 0),
          },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId as TabType)
          handleResetFilters()
        }}
      />

      {/* Clean Analytics Display Cards & Trend Chart - Only on Main Expenses Overview */}
      {activeTab === 'expenses' && (
        <>
          <FinanceStatsCards
            analytics={financeAnalytics}
            allSales={allSales}
            allExpenses={allExpenses}
            allRegisters={allRegisters}
          />

          <FinanceTrendsChart
            allSales={allSales}
            allExpenses={allExpenses}
          />
        </>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={
          activeTab === 'taxes'
            ? t('finance.search_taxes', 'Search tax rules...')
            : activeTab === 'currencies'
            ? t('finance.search_currencies', 'Search currencies...')
            : activeTab === 'registers'
            ? t('finance.search_registers', 'Search registers...')
            : activeTab === 'categories'
            ? t('finance.search_categories', 'Search categories...')
            : activeTab === 'payment_methods'
            ? t('finance.search_payment_methods', 'Search payment methods...')
            : activeTab === 'transactions'
            ? t('finance.search_transactions', 'Search transactions (description, reference)...')
            : t('finance.search_placeholder', 'Search ledger records...')
        }
        onFilterClick={activeTab === 'expenses' ? () => setFilterDrawerOpen(true) : undefined}
        isFilterActive={activeTab === 'expenses' ? isFilterActive : false}
        onReset={handleResetFilters}
        leftActions={
          <>
            {(activeTab === 'categories' || activeTab === 'currencies') && (
              <ModernSelect
                value={filterStatus}
                onChange={(val) => { setFilterStatus(String(val ?? '')); setPage(1); }}
                options={[
                  { value: '', label: `${t('common.status', 'Status')}: ${t('finance.all_status', 'All')}` },
                  { value: 'active', label: t('finance.status_active', 'Active') },
                  { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
                ]}
                className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
              />
            )}

            {activeTab === 'registers' && (
              <ModernSelect
                value={filterStatus}
                onChange={(val) => { setFilterStatus(String(val ?? '')); setPage(1); }}
                options={[
                  { value: '', label: `${t('common.status', 'Status')}: ${t('finance.all_status', 'All')}` },
                  { value: 'open', label: t('finance.status_open', 'Open') },
                  { value: 'closed', label: t('finance.status_closed', 'Closed') },
                ]}
                className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
              />
            )}

            {activeTab === 'transactions' && (
              <ModernSelect
                value={filterType}
                onChange={(val) => { setFilterType(String(val ?? '')); setPage(1); }}
                options={[
                  { value: '', label: `${t('common.type', 'Type')}: ${t('finance.all_types', 'All')}` },
                  { value: 'debit', label: t('finance.type_debit', 'Debit') },
                  { value: 'credit', label: t('finance.type_credit', 'Credit') },
                ]}
                className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
              />
            )}

            {activeTab === 'payment_methods' && (
              <>
                <ModernSelect
                  value={filterType}
                  onChange={(val) => { setFilterType(String(val ?? '')); setPage(1); }}
                  options={[
                    { value: '', label: `${t('common.type', 'Type')}: ${t('finance.all_pm_types', 'All')}` },
                    { value: 'cash', label: t('finance.pm_type_cash', 'Cash') },
                    { value: 'bank_transfer', label: t('finance.pm_type_bank_transfer', 'Bank Transfer') },
                    { value: 'credit_card', label: t('finance.pm_type_credit_card', 'Credit Card') },
                    { value: 'debit_card', label: t('finance.pm_type_debit_card', 'Debit Card') },
                    { value: 'ewallet', label: t('finance.pm_type_ewallet', 'E-Wallet') },
                    { value: 'qr_code', label: t('finance.pm_type_qr_code', 'QR Code (KHQR)') },
                    { value: 'qris', label: t('finance.pm_type_qris', 'KHQR / Static QR') },
                  ]}
                  className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
                />
                <ModernSelect
                  value={filterStatus}
                  onChange={(val) => { setFilterStatus(String(val ?? '')); setPage(1); }}
                  options={[
                    { value: '', label: `${t('common.status', 'Status')}: ${t('finance.all_status', 'All')}` },
                    { value: 'active', label: t('finance.status_active', 'Active') },
                    { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
                  ]}
                  className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
                />
              </>
            )}

            {activeTab === 'taxes' && (
              <>
                <ModernSelect
                  value={filterType}
                  onChange={(val) => { setFilterType(String(val ?? '')); setPage(1); }}
                  options={[
                    { value: '', label: `${t('common.type', 'Type')}: ${t('finance.all_tax_types', 'All')}` },
                    { value: 'fixed', label: t('finance.tax_type_fixed', 'Fixed') },
                    { value: 'percentage', label: t('finance.tax_type_percentage', 'Percentage') },
                  ]}
                  className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
                />
                <ModernSelect
                  value={filterStatus}
                  onChange={(val) => { setFilterStatus(String(val ?? '')); setPage(1); }}
                  options={[
                    { value: '', label: `${t('common.status', 'Status')}: ${t('finance.all_status', 'All')}` },
                    { value: 'active', label: t('finance.status_active', 'Active') },
                    { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
                  ]}
                  className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
                />
              </>
            )}
          </>
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: [`${activeTab}-tab`] })}
        refreshLoading={isFetching}
        columns={currentTabColumns}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <BulkSelectionBanner
            selectedCount={selectedExpenseIds.length}
            onDelete={() => setBulkDeleteConfirmOpen(true)}
            onClear={() => setSelectedExpenseIds([])}
            deleteLoading={bulkDeleteMutation.isPending}
            deleteLabel={t('finance.delete_selected', t('common.deleteSelected', 'Delete Selected'))}
            clearLabel={t('common.cancel', 'Cancel')}
          />
          <ExpensesTab
            expenses={expenses}
            allExpenses={allExpenses}
            categories={categories}
            isLoading={isLoading}
            isFetching={isFetching}
            visibleColumns={visibleColumns}
            openEditDrawer={openEditDrawer}
            handleDelete={handleDelete}
            renderSortIcon={renderSortIcon}
            handleSort={handleSort}
            selectedRows={selectedExpenseIds}
            handleSelectRow={handleSelectExpenseRow}
            handleSelectAll={handleSelectAllExpenses}
            activeCategoryFilter={activeCategoryFilter}
            setActiveCategoryFilter={setActiveCategoryFilter}
            onPrintVoucher={(exp) => setPrintExpenseModalItem(exp)}
            onApprove={(id) => updateExpenseStatusMutation.mutate({ id, status: 'approved' })}
            onReject={(id) => updateExpenseStatusMutation.mutate({ id, status: 'rejected' })}
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <BulkSelectionBanner
            selectedCount={selectedCategoryIds.length}
            onDelete={() => setBulkDeleteCategoryConfirmOpen(true)}
            onClear={() => setSelectedCategoryIds([])}
            deleteLoading={bulkDeleteCategoriesMutation.isPending}
            deleteLabel={t('finance.delete_selected_categories', t('common.deleteSelected', 'Delete Selected'))}
            clearLabel={t('common.cancel', 'Cancel')}
          />
          <CategoriesTab
            categories={categories}
            isLoading={isLoading}
            isFetching={isFetching}
            visibleColumns={visibleColumns}
            openEditDrawer={openEditDrawer}
            handleDelete={handleDelete}
            renderSortIcon={renderSortIcon}
            handleSort={handleSort}
            selectedRows={selectedCategoryIds}
            handleSelectRow={handleSelectCategoryRow}
            handleSelectAll={handleSelectAllCategories}
          />
        </div>
      )}

      {activeTab === 'registers' && (
        <RegistersTab
          registers={registers}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditDrawer={openEditDrawer}
          handleDelete={handleDelete}
          onCloseShift={(reg) => setCloseRegisterModalItem(reg)}
        />
      )}

      {activeTab === 'payment_methods' && (
        <PaymentMethodsTab
          methods={paymentMethods}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditDrawer={openEditDrawer}
          handleDelete={handleDelete}
          toggleStatus={(method) => togglePaymentMethodStatusMutation.mutate({ id: method.id, active: !method.is_active })}
        />
      )}

      {activeTab === 'transactions' && (
        <TransactionsTab
          transactions={transactions}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditDrawer={openEditDrawer}
          handleDelete={handleDelete}
        />
      )}

      {activeTab === 'currencies' && (
        <CurrenciesTab
          currencies={currencies}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditDrawer={openEditDrawer}
          handleDelete={handleDelete}
        />
      )}

      {activeTab === 'taxes' && (
        <TaxesTab
          taxes={taxes}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditDrawer={openEditDrawer}
          handleDelete={handleDelete}
        />
      )}

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Filter Drawer */}
      <FinanceFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        activeTab={activeTab}
        categories={categories}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterAccount={filterAccount}
        setFilterAccount={setFilterAccount}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterPaymentMethod={filterPaymentMethod}
        setFilterPaymentMethod={setFilterPaymentMethod}
        filterDateStart={filterDateStart}
        setFilterDateStart={setFilterDateStart}
        filterDateEnd={filterDateEnd}
        setFilterDateEnd={setFilterDateEnd}
        filterAmountMin={filterAmountMin}
        setFilterAmountMin={setFilterAmountMin}
        filterAmountMax={filterAmountMax}
        setFilterAmountMax={setFilterAmountMax}
        filterCreatedBy={filterCreatedBy}
        setFilterCreatedBy={setFilterCreatedBy}
        onReset={handleResetFilters}
      />

      {/* Form Drawer */}
      <FinanceFormDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        activeTab={activeTab}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isPending={saveMutation.isPending}
        categories={categories}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        handleReceiptFileChange={handleReceiptFileChange}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        currencyForm={currencyForm}
        setCurrencyForm={setCurrencyForm}
        taxForm={taxForm}
        setTaxForm={setTaxForm}
        paymentMethodForm={paymentMethodForm}
        setPaymentMethodForm={setPaymentMethodForm}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
      />

      {/* Import Modal */}
      <FinanceImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        activeTab={activeTab}
        importFile={importFile}
        setImportFile={setImportFile}
        importing={importing}
        setImporting={setImporting}
      />

      {/* Single Delete Confirmation Dialog */}
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

      {/* Bulk Delete Expenses Confirmation Dialog */}
      <ConfirmModal
        isOpen={bulkDeleteConfirmOpen}
        variant="danger"
        actionType="delete"
        title={t('finance.bulk_delete_title', 'Delete Selected Expenses')}
        message={t('finance.bulk_delete_confirm_msg', {
          count: selectedExpenseIds.length,
          defaultValue: `Are you sure you want to delete all ${selectedExpenseIds.length} selected expenses? This action cannot be undone.`
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
            onSettled: () => setBulkDeleteConfirmOpen(false)
          })
        }}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />

      {/* Bulk Delete Categories Confirmation Dialog */}
      <ConfirmModal
        isOpen={bulkDeleteCategoryConfirmOpen}
        variant="danger"
        actionType="delete"
        title={t('finance.bulk_delete_categories_title', 'Delete Selected Categories')}
        message={t('finance.bulk_delete_categories_confirm_msg', {
          count: selectedCategoryIds.length,
          defaultValue: `Are you sure you want to delete all ${selectedCategoryIds.length} selected categories? This action cannot be undone.`
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
            onSettled: () => setBulkDeleteCategoryConfirmOpen(false)
          })
        }}
        onCancel={() => setBulkDeleteCategoryConfirmOpen(false)}
      />

      {/* Official Expense Voucher Print Modal */}
      <ExpenseVoucherPrintModal
        expense={printExpenseModalItem}
        isOpen={Boolean(printExpenseModalItem)}
        onClose={() => setPrintExpenseModalItem(null)}
      />

      {/* Cash Register Shift Close & Reconciliation Modal */}
      <RegisterCloseModal
        register={closeRegisterModalItem}
        isOpen={Boolean(closeRegisterModalItem)}
        onClose={() => setCloseRegisterModalItem(null)}
        onConfirmClose={(data) => closeRegisterMutation.mutate(data)}
        isSubmitting={closeRegisterMutation.isPending}
      />
    </div>
  )
}

export default FinancePage
