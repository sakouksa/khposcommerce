import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Truck,
  Loader2, Eye, Mail, Phone, MapPin, DollarSign,
  ChevronUp, ChevronDown, ShoppingCart, Filter,
  Building2, AlertTriangle, CheckCircle2, ShieldCheck,
  Award, Clock, CreditCard, Copy
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supplierService } from '@/services/supplierService'
import { userService } from '@/services/userService'
import { reportService } from '@/services/reportService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import Breadcrumb from '@/components/common/Breadcrumb'
import StatusBadge from '@/components/common/StatusBadge'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  FilterButton,
  RefreshButton,
  ResetButton,
  EmptyState,
  TableToolbar,
  SupplierLogo,
} from '@/components/common'
import { downloadCsv } from '@/utils/export'

// Types & Sub-components
import { type Supplier } from './types/supplier.types'
import { SuppliersStatsCards } from './components/SuppliersStatsCards'
import { SuppliersFilterDrawer } from './components/SuppliersFilterDrawer'

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation(['suppliers', 'common', 'nav'])
  const navigate = useNavigate()
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
  } = useServerPagination({ storageKey: 'suppliers' })

  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Column Customization State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    code: true,
    contacts: true,
    location: true,
    totalPurchases: true,
    dueBalance: true,
    terms: true,
    status: true,
  })

  // Filters State
  const [statusFilter, setStatusFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [createdByFilter, setCreatedByFilter] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  const handleResetFilters = () => {
    setStatusFilter('')
    setCountryFilter('')
    setCityFilter('')
    setCreatedByFilter('')
    setSelectedRows([])
    reset()
  }

  const handleExportCSV = () => {
    const infoId = toast.info(t('suppliers.toast.exportDownloading', 'Downloading supplier dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('suppliers.tableSupplier', 'Supplier'),
          t('suppliers.tableCode', 'Code'),
          t('suppliers.phone', 'Phone'),
          t('suppliers.email', 'Email'),
          t('suppliers.tableLocation', 'Location'),
          t('suppliers.tablePurchases', 'Total Purchases ($)'),
          t('suppliers.tableDue', 'Outstanding AP ($)'),
          t('suppliers.tableTerms', 'Terms'),
          t('suppliers.status', 'Status'),
        ]
        const rows = (suppliers || []).map((s: Supplier) => [
          s.name || '',
          s.code || '',
          s.phone || '',
          s.email || '',
          s.city ? `${s.city}, ${s.country || ''}` : s.address || '',
          Number(s.total_purchases_sum ?? s.total_purchased ?? 0).toFixed(2),
          Number(s.total_due_sum ?? s.total_due ?? s.outstanding_balance ?? 0).toFixed(2),
          s.payment_terms || 'Net 30',
          s.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
        ])
        downloadCsv('suppliers_directory', headers, rows)
        toast.dismiss(infoId)
        toast.success(t('suppliers.toast.exportSuccess', 'Supplier list exported successfully.'))
      } catch (e) {
        toast.dismiss(infoId)
        toast.error(t('toast.error', 'Export failed'))
      }
    }, 300)
  }

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: reportData } = useQuery({
    queryKey: ['purchase-dashboard-stats'],
    queryFn: () => reportService.purchaseSummary(),
  })

  // Suppliers Query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'suppliers', page, debouncedSearch, perPage, sortBy, sortOrder,
      statusFilter, countryFilter, cityFilter, createdByFilter
    ],
    queryFn: () => supplierService.list({
      page,
      search: debouncedSearch,
      per_page: perPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      status: statusFilter !== '' ? statusFilter : undefined,
      is_active: statusFilter !== '' ? statusFilter : undefined,
      country: countryFilter || undefined,
      city: cityFilter || undefined,
      created_by: createdByFilter || undefined
    }),
    placeholderData: (prev) => prev,
  })

  const suppliers: Supplier[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Selection Handlers
  const isAllSelected = suppliers.length > 0 && suppliers.every(s => selectedRows.includes(s.id))
  const isSomeSelected = suppliers.some(s => selectedRows.includes(s.id)) && !isAllSelected

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(suppliers.map(s => s.id))
    }
  }

  const handleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => {
      toast.success(t('suppliers.deletedSuccess', 'Supplier deleted successfully.'))
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('suppliers.deletedFailed', 'Failed to delete supplier.'))
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => supplierService.bulkDelete(ids),
    onSuccess: (res) => {
      toast.success(t('suppliers.bulkDeletedSuccess', { count: selectedRows.length, defaultValue: `Deleted ${selectedRows.length} suppliers successfully.` }))
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('suppliers.bulkDeletedFailed', 'Failed to delete selected suppliers.'))
    },
  })

  const getTierBadge = (tier?: string) => {
    if (!tier) return null
    const tierConfig: Record<string, { label: string; color: string }> = {
      tier_1: { label: 'Tier 1 Strategic', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
      tier_2: { label: 'Tier 2 Preferred', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
      tier_3: { label: 'Tier 3 Standard', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
      tier_4: { label: 'Tier 4 Backup', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    }
    const conf = tierConfig[tier] || { label: tier.replace('_', ' ').toUpperCase(), color: 'bg-muted text-muted-foreground border-border' }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${conf.color}`}>
        {conf.label}
      </span>
    )
  }

  const getTypeBadge = (type?: string) => {
    if (!type) return null
    const typeLabel = t(`suppliers.${type}`, type.replace('_', ' '))
    return (
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        • {typeLabel}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="print:hidden space-y-2">
        <Breadcrumb items={[{ label: t('nav.purchaseManagement', 'Purchase Management') }, { label: t('nav.suppliers', 'Suppliers') }]} />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-1">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('suppliers.title', 'Supplier Directory & Vendor Management')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t('suppliers.subtitle', 'Manage enterprise vendor relationships, logistics points of contact, credit terms, and banking information.')}
            </p>
          </div>
          <HeaderActionsGroup>
            <ExportButton
              onClick={handleExportCSV}
              label={t('common.exportCsv', 'Export CSV')}
            />
            <AddButton
              onClick={() => navigate('/suppliers/create')}
              label={t('suppliers.addSupplier', 'Add Supplier')}
            />
          </HeaderActionsGroup>
        </div>
      </div>

      {/* KPI Cards */}
      <SuppliersStatsCards
        suppliers={suppliers}
        reportData={reportData}
        totalSuppliersCount={pagination.total}
      />

      {/* Bulk Selection Action Banner */}
      <BulkSelectionBanner
        selectedCount={selectedRows.length}
        onClear={() => setSelectedRows([])}
        onDelete={() => setBulkDeleteConfirmOpen(true)}
        deleteLabel={t('suppliers.deleteSelected', 'Delete Selected')}
      />

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={t('suppliers.searchPlaceholder', 'Search Supplier Name, Code, Phone, Email, Company...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={Boolean(statusFilter || countryFilter || cityFilter || createdByFilter)}
        filterActiveCount={[statusFilter, countryFilter, cityFilter, createdByFilter].filter(Boolean).length}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        refreshLoading={isFetching}
        columns={[
          { key: 'name', label: t('suppliers.tableSupplier', 'Supplier') },
          { key: 'code', label: t('suppliers.tableCode', 'Code') },
          { key: 'contacts', label: t('suppliers.tableContacts', 'Contacts') },
          { key: 'location', label: t('suppliers.tableLocation', 'Location') },
          { key: 'totalPurchases', label: t('suppliers.tablePurchases', 'Total Purchases') },
          { key: 'dueBalance', label: t('suppliers.tableDue', 'Outstanding AP') },
          { key: 'terms', label: t('suppliers.tableTerms', 'Terms & Lead Time') },
          { key: 'status', label: t('suppliers.tableStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={(cols) => setVisibleColumns(cols as any)}
      />

        {/* Active Filter Chips */}
        {(Boolean(search) || Boolean(statusFilter) || Boolean(countryFilter) || Boolean(cityFilter) || Boolean(createdByFilter)) && (
          <div className="flex items-center gap-2 flex-wrap text-xs print:hidden px-1 animate-in fade-in duration-200">
            <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              {t('common.activeFilters', 'Active Filters')}:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('common.search', 'Search')}:</span>
                <span className="font-semibold">{search}</span>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('suppliers.status', 'Status')}:</span>
                <span className="font-semibold">{statusFilter === '1' ? t('suppliers.active', 'Active') : t('suppliers.inactive', 'Inactive')}</span>
                <button
                  type="button"
                  onClick={() => { setStatusFilter(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {countryFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('suppliers.country', 'Country')}:</span>
                <span className="font-semibold">{countryFilter}</span>
                <button
                  type="button"
                  onClick={() => { setCountryFilter(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {cityFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('suppliers.city', 'City')}:</span>
                <span className="font-semibold">{cityFilter}</span>
                <button
                  type="button"
                  onClick={() => { setCityFilter(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {createdByFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('suppliers.createdBy', 'Created By')}:</span>
                <span className="font-semibold">{(users ?? []).find((u: any) => String(u.id) === createdByFilter)?.name || createdByFilter}</span>
                <button
                  type="button"
                  onClick={() => { setCreatedByFilter(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer transition-colors"
            >
              {t('common.clearAll', 'Clear all')}
            </button>
          </div>
        )}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:hidden">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    aria-label="Select all suppliers"
                  />
                </th>
                {visibleColumns.name !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableSupplier', 'Supplier')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.code !== false && (
                  <th onClick={() => handleSort('code')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableCode', 'Code')} {renderSortIcon('code')}
                  </th>
                )}
                {visibleColumns.contacts !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableContacts', 'Contacts')}
                  </th>
                )}
                {visibleColumns.location !== false && (
                  <th onClick={() => handleSort('city')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableLocation', 'Location')} {renderSortIcon('city')}
                  </th>
                )}
                {visibleColumns.totalPurchases !== false && (
                  <th className="text-right py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tablePurchases', 'Total Purchases')}
                  </th>
                )}
                {visibleColumns.dueBalance !== false && (
                  <th className="text-right py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableDue', 'Outstanding AP')}
                  </th>
                )}
                {visibleColumns.terms !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableTerms', 'Terms & Lead Time')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                    {t('suppliers.tableStatus', 'Status')} {renderSortIcon('is_active')}
                  </th>
                )}
                <th className="sticky right-0 z-20 bg-card dark:bg-card border-l border-border text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap min-w-[96px]">
                  {t('suppliers.tableActions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4 text-center"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                    {visibleColumns.name !== false && <td className="p-4"><div className="skeleton h-4 w-32 rounded" /></td>}
                    {visibleColumns.code !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                    {visibleColumns.contacts !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                    {visibleColumns.location !== false && <td className="p-4"><div className="skeleton h-4 w-36 rounded" /></td>}
                    {visibleColumns.totalPurchases !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded ml-auto" /></td>}
                    {visibleColumns.dueBalance !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded ml-auto" /></td>}
                    {visibleColumns.terms !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                    {visibleColumns.status !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                    <td className="p-4"><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={2 + Object.values(visibleColumns).filter(Boolean).length} className="p-0">
                    <EmptyState
                      icon={<Truck size={28} className="text-muted-foreground" />}
                      title={t('suppliers.noSuppliersFound', 'No suppliers found')}
                      description={
                        Boolean(search || statusFilter || countryFilter || cityFilter || createdByFilter)
                          ? t('suppliers.noMatchingFilters', 'No suppliers match your active search or filter criteria.')
                          : t('suppliers.noSuppliersYet', 'Get started by creating your first enterprise supplier profile.')
                      }
                      action={
                        Boolean(search || statusFilter || countryFilter || cityFilter || createdByFilter)
                          ? {
                              label: t('common.resetFilters', 'Reset Filters'),
                              onClick: handleResetFilters,
                            }
                          : {
                              label: t('suppliers.addSupplier', 'Add Supplier'),
                              onClick: () => navigate('/suppliers/create'),
                            }
                      }
                    />
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => {
                  const isSelected = selectedRows.includes(supplier.id)
                  const totalPurchased = Number(supplier.total_purchases_sum ?? supplier.total_purchased ?? 0)
                  const dueBalance = Number(supplier.total_due_sum ?? supplier.total_due ?? supplier.outstanding_balance ?? 0)
                  const poCount = Number(supplier.purchases_count ?? 0)

                  return (
                    <tr
                      key={supplier.id}
                      className={`hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-primary/10 dark:bg-primary/15' : ''
                      }`}
                      onClick={() => navigate(`/suppliers/${supplier.id}`)}
                    >
                      <td className="w-10 px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(supplier.id)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          aria-label={`Select supplier ${supplier.name}`}
                        />
                      </td>
                      {visibleColumns.name !== false && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <SupplierLogo
                              logo={supplier.logo}
                              name={supplier.name}
                              size="sm"
                              className="rounded-xl shadow-2xs group-hover:scale-105"
                            />
                            <div className="space-y-1 min-w-0">
                              <span className="font-bold text-foreground text-xs hover:text-primary transition-colors block truncate">
                                {supplier.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {getTierBadge(supplier.tier)}
                                {getTypeBadge(supplier.supplier_type)}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.code !== false && (
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {supplier.code}
                        </td>
                      )}
                      {visibleColumns.contacts !== false && (
                        <td className="py-3 px-4 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            {supplier.phone && (
                              <div className="flex items-center gap-1.5 group/phone">
                                <a
                                  href={`tel:${supplier.phone}`}
                                  className="inline-flex items-center gap-1 font-mono text-foreground/80 hover:text-primary transition-colors"
                                  title={t('suppliers.callPhone', 'Call phone')}
                                >
                                  <Phone size={11} className="text-primary shrink-0" />
                                  <span>{supplier.phone}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(supplier.phone || '')
                                    toast.success(t('common.copiedToClipboard', 'Phone number copied'))
                                  }}
                                  className="opacity-0 group-hover/phone:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                                  title={t('common.copy', 'Copy')}
                                >
                                  <Copy size={10} />
                                </button>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-1.5 group/email">
                                <a
                                  href={`mailto:${supplier.email}`}
                                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors truncate max-w-[180px]"
                                  title={t('suppliers.sendEmail', 'Send email')}
                                >
                                  <Mail size={11} className="text-muted-foreground shrink-0" />
                                  <span className="truncate">{supplier.email}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(supplier.email || '')
                                    toast.success(t('common.copiedToClipboard', 'Email address copied'))
                                  }}
                                  className="opacity-0 group-hover/email:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0"
                                  title={t('common.copy', 'Copy')}
                                >
                                  <Copy size={10} />
                                </button>
                              </div>
                            )}
                            {!supplier.phone && !supplier.email && <span className="text-muted-foreground/60">—</span>}
                          </div>
                        </td>
                      )}
                      {visibleColumns.location !== false && (
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {supplier.city ? `${supplier.city}, ${supplier.country || ''}` : supplier.address || '—'}
                        </td>
                      )}
                      {visibleColumns.totalPurchases !== false && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-xs text-foreground">
                            ${totalPurchased.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold">
                            {poCount} {t('suppliers.posCount', 'POs')}
                          </div>
                        </td>
                      )}
                      {visibleColumns.dueBalance !== false && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {dueBalance > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20">
                              <AlertTriangle size={11} />
                              ${dueBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 size={11} />
                              $0.00
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.terms !== false && (
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block">
                              {supplier.payment_terms || 'Net 30'}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock size={11} />
                              {supplier.lead_time_days ?? 3} {t('suppliers.daysLeadTime', 'days lead')}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.status !== false && (
                        <td className="py-3 px-4 whitespace-nowrap text-xs font-bold">
                          <StatusBadge status={supplier.is_active} />
                        </td>
                      )}
                      <td className={`sticky right-0 z-10 ${isSelected ? 'bg-primary/10 dark:bg-primary/15' : 'bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20'} transition-colors border-l border-border py-3 px-4 text-center whitespace-nowrap min-w-[96px]`} onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          items={[
                            {
                              label: t('suppliers.createPO', 'Create Purchase Order'),
                              icon: ShoppingCart,
                              onClick: () => navigate(`/purchases/create?supplier_id=${supplier.id}`),
                              variant: 'success',
                            },
                          ]}
                          onView={() => navigate(`/suppliers/${supplier.id}`)}
                          onEdit={() => navigate(`/suppliers/${supplier.id}/edit`)}
                          onDelete={() => setDeleteTarget(supplier)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableWrapper>
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      {/* Filter Drawer */}
      <SuppliersFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        users={users || []}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        onReset={handleResetFilters}
        setPage={setPage}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="suppliers.deleteTitle"
        itemName={deleteTarget?.name}
        confirmText="common.confirmDelete"
        cancelText="common.cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('suppliers.bulkDeleteConfirmTitle', 'Delete Selected Suppliers')}
        message={t('suppliers.bulkDeleteConfirmMessage', `Are you sure you want to permanently delete ${selectedRows.length} selected suppliers? This action cannot be undone.`, { count: selectedRows.length })}
        confirmText={t('suppliers.deleteSelected', 'Delete Selected')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        variant="danger"
      />
    </div>
  )
}

export default SuppliersPage
