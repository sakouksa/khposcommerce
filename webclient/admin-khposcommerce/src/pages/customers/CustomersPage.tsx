import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, Filter, RefreshCw, Download, Settings, X, UsersRound, MapPin, Trash2, AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck, UserX
} from 'lucide-react'
import { customerService } from '@/services/customerService'
import { companyService } from '@/services/companyService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import ResetButton from '@/components/shared/ResetButton'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, AddButton, ExportButton, ImportButton, TableToolbar } from '@/components/common'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import type { ImportResult } from '@/components/shared/CsvImportModal'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv } from '@/utils/export'

import CustomerGroupsPage from './CustomerGroupsPage'
import CustomerAddressesPage from './CustomerAddressesPage'

import { CustomerStatsCards } from './components/CustomerStatsCards'
import { CustomerFilterDrawer } from './components/CustomerFilterDrawer'
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer'
import { CustomerFormModal } from './components/CustomerFormModal'
import { CustomerTableSection } from './components/CustomerTableSection'
import { CustomerImportModal } from './components/CustomerImportModal'
import { CustomerDebtModal } from './components/CustomerDebtModal'
import { CustomerStatementPrintModal } from './components/CustomerStatementPrintModal'
import { getAbsoluteImageUrl } from '@/utils/image'
import type { Customer, CustomerFormData } from './types/customer.types'

const CustomersPage: React.FC = () => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['customers', 'common', 'toast'])
  const toast = useToast()
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = usePageTab<string>({
    storageKey: 'customers_active_tab',
    defaultTab: 'customers',
    validTabs: ['customers', 'groups'],
  })

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [groupIdFilter, setGroupIdFilter] = useState<string>('')
  const [genderFilter, setGenderFilter] = useState<string>('')
  const [rfmFilter, setRfmFilter] = useState<string>('')
  const [paymentTermsFilter, setPaymentTermsFilter] = useState<string>('')
  const [creditHoldFilter, setCreditHoldFilter] = useState<string>('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [debtCustomer, setDebtCustomer] = useState<Customer | null>(null)
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoAction, setPhotoAction] = useState<'keep' | 'remove' | 'change'>('keep')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    group: true,
    credit: true,
    wallet: true,
    totalSpent: true,
    orderCount: true,
    status: true,
  })
  const [groupsActions, setGroupsActions] = useState<{ openAdd?: () => void; exportData?: () => void } | null>(null)
  const [addressesActions, setAddressesActions] = useState<{ openAdd?: () => void; exportData?: () => void } | null>(null)
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset: resetPagination,
    adjustAfterDelete
  } = useServerPagination({ storageKey: 'customers-portal' })

  const isFilterActive = 
    (statusFilter !== 'all' && statusFilter !== '') || 
    Boolean(groupIdFilter) || 
    Boolean(genderFilter) || 
    Boolean(rfmFilter) || 
    Boolean(paymentTermsFilter) || 
    Boolean(creditHoldFilter)

  const activeFilterCount = [
    statusFilter !== 'all' && statusFilter !== '' ? statusFilter : '',
    groupIdFilter,
    genderFilter,
    rfmFilter,
    paymentTermsFilter,
    creditHoldFilter,
  ].filter(Boolean).length

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    defaultValues: {
      company_id: '1',
      customer_group_id: '',
      user_id: '',
      name: '',
      email: '',
      phone: '',
      gender: '',
      birth_date: '',
      payment_terms: 'prepaid',
      credit_limit: '1000',
      is_credit_hold: false,
      wallet_balance: '0',
      tax_number: '',
      tax_branch_code: '00001',
      rfm_segment: 'new',
      tags: '',
      notes: '',
      is_active: true
    }
  })

  // Queries
  const { data: companies } = useQuery({
    queryKey: ['companies-list-dropdown'],
    queryFn: () => companyService.getCompanies({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: groups } = useQuery({
    queryKey: ['customer-groups-list'],
    queryFn: () => customerService.groups({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: users } = useQuery({
    queryKey: ['users-list-dropdown'],
    queryFn: () => userService.list({ per_page: 200 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['customers', page, debouncedSearch, perPage, statusFilter, groupIdFilter, genderFilter, rfmFilter, paymentTermsFilter, creditHoldFilter],
    queryFn: () => customerService.list({
      page,
      search: debouncedSearch,
      per_page: perPage,
      status: statusFilter === 'all' ? '' : statusFilter,
      customer_group_id: groupIdFilter,
      gender: genderFilter,
      rfm_segment: rfmFilter,
      payment_terms: paymentTermsFilter,
      is_credit_hold: creditHoldFilter,
    }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'customers',
  })

  // Top stats cards remain active across tab changes for enterprise CRM overview
  const { data: statsData } = useQuery({
    queryKey: ['customers-stats', debouncedSearch, statusFilter, groupIdFilter, genderFilter, rfmFilter, paymentTermsFilter, creditHoldFilter],
    queryFn: () => customerService.getStats({
      search: debouncedSearch,
      status: statusFilter === 'all' ? '' : statusFilter,
      customer_group_id: groupIdFilter,
      gender: genderFilter,
      rfm_segment: rfmFilter,
      payment_terms: paymentTermsFilter,
      is_credit_hold: creditHoldFilter,
    }),
  })

  const customers: Customer[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => customerService.create(formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('toast.created', { item: t('customers.title', 'Customer') }))
      closeModal()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to create customer.'))
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => customerService.update(id, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('toast.updated', { item: t('customers.title', 'Customer') }))
      closeModal()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to update customer.'))
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('toast.deleted', { item: t('customers.title', 'Customer') }))
      setDeleteTarget(null)
      adjustAfterDelete(customers.length)
    },
    onError: () => {
      toast.error(t('toast.error', 'Failed to delete customer.'))
      setDeleteTarget(null)
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => customerService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.bulkDeleteSuccess', 'Selected customers deleted successfully'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      adjustAfterDelete(selectedRows.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to delete selected customers.'))
      setBulkDeleteConfirmOpen(false)
    }
  })

  const bulkActivateMutation = useMutation({
    mutationFn: (ids: number[]) => customerService.bulkActivate(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.bulkActivateSuccess', 'Successfully activated selected customers.'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to activate selected customers.'))
    }
  })

  const bulkDeactivateMutation = useMutation({
    mutationFn: (ids: number[]) => customerService.bulkDeactivate(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.bulkDeactivateSuccess', 'Successfully deactivated selected customers.'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to deactivate selected customers.'))
    }
  })

  const bulkToggleCreditHoldMutation = useMutation({
    mutationFn: ({ ids, isHold }: { ids: number[]; isHold: boolean }) =>
      customerService.bulkToggleCreditHold(ids, isHold),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      if (variables.isHold) {
        toast.success(t('customers.bulkLockCreditSuccess', 'Successfully placed selected customers on credit hold.'))
      } else {
        toast.success(t('customers.bulkUnlockCreditSuccess', 'Successfully unlocked credit for selected customers.'))
      }
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to update credit hold.'))
    }
  })

  // Selected customer states for smart contextual bulk action bar
  const selectedCustomers = React.useMemo(() => {
    return customers.filter((c) => selectedRows.includes(c.id))
  }, [customers, selectedRows])

  const hasInactive = selectedCustomers.some((c) => !c.is_active)
  const hasActive = selectedCustomers.some((c) => c.is_active)
  const allCreditHold = selectedCustomers.length > 0 && selectedCustomers.every((c) => c.is_credit_hold)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(customers.map((c) => c.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((i) => i !== id))
    }
  }

  const openCreateModal = () => {
    navigate('/customers/create')
  }

  const openEditModal = (cust: Customer) => {
    navigate(`/customers/${cust.id}/edit`)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCustomer(null)
  }

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoAction('change')
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoAction('remove')
  }

  const onFormSubmit = (formData: CustomerFormData) => {
    const dataPayload = new FormData()
    dataPayload.append('company_id', formData.company_id)
    if (formData.customer_group_id) dataPayload.append('customer_group_id', formData.customer_group_id)
    if (formData.user_id) dataPayload.append('user_id', formData.user_id)
    dataPayload.append('name', formData.name)
    if (formData.email) dataPayload.append('email', formData.email)
    if (formData.phone) dataPayload.append('phone', formData.phone)
    if (formData.gender) dataPayload.append('gender', formData.gender)
    if (formData.birth_date) dataPayload.append('birth_date', formData.birth_date)
    if (formData.credit_limit) dataPayload.append('credit_limit', formData.credit_limit)
    if (formData.tax_number) dataPayload.append('tax_number', formData.tax_number)
    if (formData.notes) dataPayload.append('notes', formData.notes)
    dataPayload.append('is_active', formData.is_active ? '1' : '0')

    if (photoAction === 'change' && photoFile) {
      dataPayload.append('photo', photoFile)
    } else if (photoAction === 'remove') {
      dataPayload.append('photo', '')
      dataPayload.append('remove_photo', '1')
    }

    if (editingCustomer) {
      dataPayload.append('_method', 'PUT')
      updateMutation.mutate({ id: editingCustomer.id, data: dataPayload })
    } else {
      createMutation.mutate(dataPayload)
    }
  }

  const handleExport = () => {
    const infoId = toast.info(t('customers.toast.exportDownloading', 'Downloading customer dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('customers.id', 'ID'),
          t('customers.name', 'Customer Name'),
          t('customers.email', 'Email'),
          t('customers.phone', 'Phone'),
          t('customers.customerGroup', 'Group'),
          t('customers.totalSpent', 'Total Spent'),
          t('customers.orderCount', 'Orders'),
          t('customers.loyaltyPoints', 'Loyalty Points'),
          t('common.status', 'Status'),
        ]
        const rows = (customers || []).map((c: any) => [
          c.id,
          c.name || '',
          c.email || '',
          c.phone || '',
          c.group?.name || '',
          c.total_spent || 0,
          c.order_count || 0,
          c.loyalty_points || 0,
          c.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
        ])
        downloadCsv('customers', headers, rows)
        toast.dismiss(infoId)
        toast.success(t('customers.toast.exportSuccess', 'Customer list exported successfully.'))
      } catch (e) {
        toast.dismiss(infoId)
        toast.error(t('toast.error', 'Export failed'))
      }
    }, 400)
  }

  const resetAllFilters = () => {
    setStatusFilter('all')
    setGroupIdFilter('')
    setGenderFilter('')
    setRfmFilter('')
    setPaymentTermsFilter('')
    setCreditHoldFilter('')
    setSelectedRows([])
    resetPagination()
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      toast.error(t('customers.selectFileAlert', 'Please select a CSV file before proceeding.'))
      return
    }

    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const res = await customerService.import(formData)
      const payload = res?.data ?? res
      setImportResult({
        success_count: payload?.success_count ?? 0,
        errors: payload?.errors ?? [],
      })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.toast.importSuccess', { count: payload?.success_count ?? 0, defaultValue: `Successfully imported ${payload?.success_count ?? 0} customers.` }))
    } catch (err: any) {
      const errData = err?.response?.data
      setImportResult({
        success_count: errData?.data?.success_count ?? 0,
        errors: errData?.errors ?? [err?.message || 'Import failed'],
      })
      toast.error(errData?.message || t('toast.error', 'Failed to import customers.'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={
          activeTab === 'groups'
            ? [
                { label: t('customers.title', 'Customers'), path: '/customers' },
                { label: t('customers.customerGroups', 'Customer Groups') }
              ]
            : activeTab === 'addresses'
            ? [
                { label: t('customers.title', 'Customers'), path: '/customers' },
                { label: t('customers.customerAddresses', 'Customer Addresses') }
              ]
            : [{ label: t('customers.title', 'Customers') }]
        }
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('customers.headerTitle', 'Customer Relationship Management')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('customers.headerSubtitle', 'Manage customer accounts, purchase history, loyalty rewards, customer groups, and delivery addresses.')}
          </p>
        </div>

        <HeaderActionsGroup>
          {activeTab === 'customers' && (
            <>
              <ImportButton
                onClick={() => {
                  setImportFile(null)
                  setImportResult(null)
                  setImportModalOpen(true)
                }}
                label={t('customers.importCsv', 'Import CSV')}
              />
              <ExportButton
                onClick={handleExport}
                label={t('customers.exportCsv', 'Export CSV')}
              />
            </>
          )}
          <AddButton
            onClick={
              activeTab === 'customers'
                ? openCreateModal
                : activeTab === 'groups'
                ? () => groupsActions?.openAdd?.()
                : () => addressesActions?.openAdd?.()
            }
            label={
              activeTab === 'customers'
                ? t('customers.addCustomer', 'Add Customer')
                : activeTab === 'groups'
                ? t('customers.addGroup', 'Add Customer Group')
                : t('customers.addAddress', 'Add Address')
            }
          />
        </HeaderActionsGroup>
      </div>

      {/* Sub-tabs Navigation */}
      <WorkspaceTabs
        tabs={[
          { id: 'customers', label: t('customers.tab_allCustomers', 'All Customers'), icon: Users },
          { id: 'groups', label: t('customers.tab_groups', 'Customer Groups'), icon: UsersRound },
          { id: 'addresses', label: t('customers.tab_addresses', 'Delivery Addresses'), icon: MapPin },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Top Overview Cards - Only on Main Customers Directory Tab */}
      {activeTab === 'customers' && (
        <CustomerStatsCards 
          stats={statsData} 
          totalFallback={pagination.total}
        />
      )}

      {/* Active Tab View */}
      {activeTab === 'groups' ? (
        <CustomerGroupsPage isTab={true} onRegisterActions={setGroupsActions} />
      ) : activeTab === 'addresses' ? (
        <CustomerAddressesPage isTab={true} onRegisterActions={setAddressesActions} />
      ) : (
        <>
          {/* Bulk actions panel */}
          <BulkSelectionBanner
            selectedCount={selectedRows.length}
            onDelete={() => setBulkDeleteConfirmOpen(true)}
            onClear={() => setSelectedRows([])}
            deleteLabel={t('customers.deleteSelected', t('common.deleteSelected', 'Delete Selected'))}
            deleteLoading={bulkDeleteMutation.isPending}
            extraActions={
              <div className="flex items-center gap-2 flex-wrap">
                {/* Dynamic Status: Only show Activate if there are inactive selected */}
                {hasInactive && (
                  <button
                    type="button"
                    onClick={() => bulkActivateMutation.mutate(selectedRows)}
                    disabled={bulkActivateMutation.isPending}
                    className="h-8 px-3 text-xs font-semibold rounded-xl bg-emerald-600/90 text-white hover:bg-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98]"
                    title={t('common.activate', 'Activate')}
                  >
                    <CheckCircle2 size={13} />
                    <span>{t('common.activate', 'Activate')}</span>
                  </button>
                )}

                {/* Dynamic Status: Only show Deactivate if there are active selected */}
                {hasActive && (
                  <button
                    type="button"
                    onClick={() => bulkDeactivateMutation.mutate(selectedRows)}
                    disabled={bulkDeactivateMutation.isPending}
                    className="h-8 px-3 text-xs font-semibold rounded-xl bg-amber-600/90 text-white hover:bg-amber-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98]"
                    title={t('common.deactivate', 'Deactivate')}
                  >
                    <UserX size={13} />
                    <span>{t('common.deactivate', 'Deactivate')}</span>
                  </button>
                )}

                {/* Dynamic Credit Hold: Toggle between Unlock Credit and Lock Credit */}
                {allCreditHold ? (
                  <button
                    type="button"
                    onClick={() => bulkToggleCreditHoldMutation.mutate({ ids: selectedRows, isHold: false })}
                    disabled={bulkToggleCreditHoldMutation.isPending}
                    className="h-8 px-3 text-xs font-semibold rounded-xl bg-teal-600/90 text-white hover:bg-teal-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98]"
                    title={t('customers.unlockCredit', 'Unlock Credit')}
                  >
                    <ShieldCheck size={13} />
                    <span>{t('customers.unlockCredit', 'Unlock Credit')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => bulkToggleCreditHoldMutation.mutate({ ids: selectedRows, isHold: true })}
                    disabled={bulkToggleCreditHoldMutation.isPending}
                    className="h-8 px-3 text-xs font-semibold rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98]"
                    title={t('customers.lockCredit', 'Lock Credit')}
                  >
                    <ShieldAlert size={13} />
                    <span>{t('customers.lockCredit', 'Credit Hold')}</span>
                  </button>
                )}
              </div>
            }
          />

          {/* Global Standard Table Toolbar */}
          <TableToolbar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder={t('customers.searchPlaceholder', 'Search customer name, email, phone...')}
            onFilterClick={() => setFilterDrawerOpen(true)}
            isFilterActive={isFilterActive}
            filterActiveCount={activeFilterCount}
            onReset={resetAllFilters}
            onRefresh={() => qc.invalidateQueries({ queryKey: ['customers'] })}
            refreshLoading={isFetching}
            columns={[
              { key: 'name', label: t('customers.name', 'Customer Profile') },
              { key: 'email', label: t('customers.email', 'Email / Phone') },
              { key: 'group', label: t('customers.customerGroup', 'Group & Segment') },
              { key: 'credit', label: t('customers.creditAndTerms', 'Credit & Terms') },
              { key: 'wallet', label: t('customers.walletAndPoints', 'Wallet & Points') },
              { key: 'totalSpent', label: t('customers.totalSpent', 'Total Spent') },
              { key: 'orderCount', label: t('customers.ordersCount', 'Orders') },
              { key: 'status', label: t('common.status', 'Status') },
            ]}
            visibleColumns={visibleColumns}
            onColumnChange={setVisibleColumns}
          />

          {/* Active RFM Filter Pill */}
          {rfmFilter && (
            <div className="flex items-center gap-2 px-1 py-0.5 text-xs flex-wrap">
              <span className="text-muted-foreground font-medium">{t('customers.rfmSegment', 'RFM Segment')}:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <span>
                  {rfmFilter === 'champions' ? t('customers.rfmChampions', 'Champions')
                    : rfmFilter === 'loyal' ? t('customers.rfmLoyal', 'Loyal')
                    : rfmFilter === 'potential' ? t('customers.rfmPotential', 'Potential')
                    : rfmFilter === 'at_risk' ? t('customers.rfmAtRisk', 'At-Risk')
                    : rfmFilter === 'hibernating' ? t('customers.rfmHibernating', 'Hibernating')
                    : rfmFilter === 'new' ? t('customers.rfmNew', 'New')
                    : rfmFilter}
                </span>
                <button
                  type="button"
                  onClick={() => { setRfmFilter(''); setPage(1); }}
                  className="hover:text-foreground cursor-pointer rounded-full p-0.5 hover:bg-purple-500/20 transition-colors"
                  title={t('common.clear', 'Clear')}
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          {/* Filter Drawer */}
          <CustomerFilterDrawer
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            statusFilter={statusFilter}
            setStatusFilter={(val) => { setStatusFilter(val); setPage(1); }}
            groupIdFilter={groupIdFilter}
            setGroupIdFilter={(val) => { setGroupIdFilter(val); setPage(1); }}
            genderFilter={genderFilter}
            setGenderFilter={(val) => { setGenderFilter(val); setPage(1); }}
            rfmFilter={rfmFilter}
            setRfmFilter={(val) => { setRfmFilter(val); setPage(1); }}
            paymentTermsFilter={paymentTermsFilter}
            setPaymentTermsFilter={(val) => { setPaymentTermsFilter(val); setPage(1); }}
            creditHoldFilter={creditHoldFilter}
            setCreditHoldFilter={(val) => { setCreditHoldFilter(val); setPage(1); }}
            groups={groups || []}
            rfmBreakdown={statsData?.rfm_breakdown}
            onReset={resetAllFilters}
          />

          {/* Table */}
          <CustomerTableSection
            customers={customers}
            isLoading={isLoading}
            isFetching={isFetching}
            visibleColumns={visibleColumns}
            selectedRows={selectedRows}
            handleSelectAll={handleSelectAll}
            handleSelectRow={handleSelectRow}
            openEditModal={openEditModal}
            setViewCustomer={setViewCustomer}
            setDeleteTarget={setDeleteTarget}
            onSettleDebt={(c) => setDebtCustomer(c)}
            onPrintStatement={(c) => setStatementCustomer(c)}
          />

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />

          {/* Detail Drawer */}
          <CustomerDetailDrawer
            customer={viewCustomer}
            onClose={() => setViewCustomer(null)}
            openEditModal={openEditModal}
          />

          {/* Form Modal */}
          <CustomerFormModal
            isOpen={modalOpen}
            onClose={closeModal}
            editingCustomer={editingCustomer}
            onSubmit={handleSubmit(onFormSubmit)}
            isSubmitting={isSubmitting || createMutation.isPending || updateMutation.isPending}
            register={register}
            errors={errors}
            companies={companies || []}
            groups={groups || []}
            users={users || []}
            photoPreview={photoPreview}
            onPhotoChange={onPhotoChange}
            removePhoto={removePhoto}
            watch={watch}
            setValue={setValue}
          />

          {/* Single Delete Dialog */}
          <ConfirmDialog
            open={!!deleteTarget}
            title="customers.deleteTitle"
            itemName={deleteTarget?.name}
            confirmText="common.confirmDelete"
            cancelText="common.cancel"
            loading={deleteMutation.isPending}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />

          {/* Bulk Delete Dialog */}
          <ConfirmDialog
            open={bulkDeleteConfirmOpen}
            title={t('customers.bulkDeleteTitle', 'Delete Selected Customers')}
            message={t('customers.confirmBulkDeleteMessage', {
              count: selectedRows.length,
              defaultValue: `Are you sure you want to delete ${selectedRows.length} selected customers? This action cannot be undone.`
            }).replace('{{count}}', String(selectedRows.length))}
            confirmText={t('common.confirmDelete', 'Delete')}
            cancelText={t('common.cancel', 'Cancel')}
            loading={bulkDeleteMutation.isPending}
            onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
            onCancel={() => setBulkDeleteConfirmOpen(false)}
          />

          {/* Global CSV Import Modal */}
          <CustomerImportModal
            isOpen={importModalOpen}
            onClose={() => {
              setImportModalOpen(false)
              setImportFile(null)
              setImportResult(null)
            }}
            importFile={importFile}
            setImportFile={setImportFile}
            isImporting={importing}
            importResult={importResult}
            onSubmit={handleImportSubmit}
          />

          {/* Quick Debt Settlement Modal */}
          <CustomerDebtModal
            isOpen={!!debtCustomer}
            onClose={() => setDebtCustomer(null)}
            customer={debtCustomer}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['customers'] })
              qc.invalidateQueries({ queryKey: ['customers-stats'] })
            }}
          />

          {/* Customer Statement GlobalPrint Modal */}
          <CustomerStatementPrintModal
            isOpen={!!statementCustomer}
            onClose={() => setStatementCustomer(null)}
            customer={statementCustomer}
          />
        </>
      )}
    </div>
  )
}

export default CustomersPage
