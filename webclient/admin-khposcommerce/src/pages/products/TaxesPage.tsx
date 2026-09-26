import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader } from '@/components/common/ModalHeader'
import { 
  Plus, Edit2, Trash2, X, Percent, ToggleLeft, ToggleRight, Loader2, 
  ChevronUp, ChevronDown, Download, Upload, Trash, RefreshCw, AlertCircle, Settings,
  Save
} from 'lucide-react'
import { taxService } from '@/services/taxService'
import { useToast } from '@/hooks/useToast'
import { downloadBlob } from '@/utils/export'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/common/StatusBadge'
import { FieldError, getFieldClass } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import { TableToolbar } from '@/components/common'

interface Tax {
  id: number
  company_id: number
  name: string
  rate: number
  type: 'percentage' | 'fixed'
  is_active: boolean
  deleted_at?: string | null
}

const TaxesPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
  const { language } = useThemeStore()
  const { t, i18n } = useTranslation(['products', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  // Open add modal only when triggerAdd changes to a positive number
  const prevTriggerRef = React.useRef(triggerAdd || 0)
  React.useEffect(() => {
    if (triggerAdd && triggerAdd > 0 && triggerAdd !== prevTriggerRef.current) {
      openCreateModal()
    }
    prevTriggerRef.current = triggerAdd || 0
  }, [triggerAdd])

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'taxes' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<Tax | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null)
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    rate: true,
    type: true,
    status: true,
  })

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [rate, setRate] = useState('0')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [isActive, setIsActive] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Sorting states
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['taxes', page, debouncedSearch, perPage, sortBy, sortOrder, recycleBinMode, statusFilter],
    queryFn: () => taxService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrder,
      status: recycleBinMode ? 'deleted' : (statusFilter !== 'all' ? statusFilter : undefined)
    }),
    placeholderData: (prev) => prev,
  })

  const taxes: Tax[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: taxes.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => taxService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.created'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => taxService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.updated'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taxService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(taxes.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => taxService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.restored'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => taxService.forceDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(taxes.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => taxService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => taxService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxes'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  // Handlers
  const openCreateModal = () => {
    setEditingTax(null)
    setFormErrors({})
    setName('')
    setRate('0')
    setType('percentage')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (tax: Tax) => {
    setEditingTax(tax)
    setFormErrors({})
    setName(tax.name)
    setRate(String(tax.rate))
    setType(tax.type)
    setIsActive(tax.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTax(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('products.errors.taxNameRequired', 'Please enter tax name')
    }
    if (rate === '' || isNaN(parseFloat(rate))) {
      errors.rate = t('products.errors.taxRateRequired', 'Please enter valid tax rate')
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

    const payload = {
      company_id: 1,
      name,
      rate: parseFloat(rate),
      type,
      is_active: isActive,
    }

    if (editingTax) {
      updateMutation.mutate({ id: editingTax.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    const fd = new FormData()
    fd.append('file', importFile)
    try {
      await taxService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['taxes'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    const infoId = toast.info(t('products.toast.exportDownloading', 'Downloading CSV export...'))
    taxService.export()
      .then(res => {
        if (infoId) toast.dismiss(infoId)
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `taxes_export_${dateStamp}.csv`)
        toast.success(t('products.toast.exportSuccess', 'CSV exported successfully.'))
      })
      .catch(() => {
        if (infoId) toast.dismiss(infoId)
        toast.error(t('products.toast.exportError', 'Failed to export.'))
      })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: t('dashboard.title') || 'Dashboard', path: '/dashboard' }, { label: t('products.tabTaxes') }]} />

          <PageHeader
            icon={<Percent size={24} />}
            title={t('products.tabTaxes')}
            subtitle={t('products.heroSubtitle')}
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download size={15} />
                  {t('products.exportCSV')}
                </button>

                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload size={15} />
                  {t('products.importCSV')}
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white
                             bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  {t('products.addTaxRule')}
                </button>
              </div>
            }
          />
        </>
      )}

      {/* Bulk actions panel */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <AlertCircle size={16} />
            <span>{selectedRows.length} {t('products.selectedCount')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkDeleteConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 cursor-pointer"
            >
              <Trash size={13} />
              {t('products.deleteSelected')}
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('products.searchTaxes', 'Search taxes...')}
        onReset={() => {
          setSearch('')
          setStatusFilter('all')
          setSortBy('created_at')
          setSortOrder('desc')
          setPage(1)
          setRecycleBinMode(false)
          setSelectedRows([])
        }}
        leftActions={
          <ModernSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as 'all' | 'active' | 'inactive')
              setPage(1)
            }}
            options={[
              { value: 'all', label: `${t('common.status', 'Status')}: ${t('common.allStatus', 'All')}` },
              { value: 'active', label: t('common.active', 'Active') },
              { value: 'inactive', label: t('common.inactive', 'Inactive') },
            ]}
            className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
          />
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['taxes'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'name', label: t('products.colTaxName', 'Tax Name') },
          { key: 'rate', label: t('products.colTaxRate', 'Tax Rate') },
          { key: 'type', label: t('products.colCalculationType', 'Calculation Type') },
          { key: 'status', label: t('products.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={taxes.length > 0 && selectedRows.length === taxes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(taxes.map(t => t.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                </th>
                {visibleColumns.name !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colTaxName')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.rate !== false && (
                  <th onClick={() => handleSort('rate')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3 w-32">
                    {t('products.colTaxRate')} {renderSortIcon('rate')}
                  </th>
                )}
                {visibleColumns.type !== false && (
                  <th onClick={() => handleSort('type')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3 w-36">
                    {t('products.colCalculationType')} {renderSortIcon('type')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3 w-28">
                    {t('products.colStatus')} {renderSortIcon('is_active')}
                  </th>
                )}
                <th className="text-right pr-4 py-3 select-none w-28">{t('products.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="w-12"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-28 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-12 rounded ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : (
                taxes.map((tax) => (
                  <tr key={tax.id} className="group border-b border-border/40 hover:bg-muted/30">
                    <td className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(tax.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(prev => [...prev, tax.id])
                          } else {
                            setSelectedRows(prev => prev.filter(id => id !== tax.id))
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                      />
                    </td>
                    {visibleColumns.name !== false && (
                      <td className="font-medium text-foreground text-sm py-3 flex items-center gap-2">
                        <Percent size={16} className="text-blue-500 flex-shrink-0" />
                        <span>{tax.name}</span>
                      </td>
                    )}
                    {visibleColumns.rate !== false && (
                      <td className="font-mono text-sm font-semibold text-foreground py-3">
                        {tax.rate}{tax.type === 'percentage' ? '%' : ''}
                      </td>
                    )}
                    {visibleColumns.type !== false && (
                      <td className="text-sm font-semibold text-muted-foreground py-3">
                        {tax.type === 'percentage' ? t('products.percentage') : t('products.fixed')}
                      </td>
                    )}
                    {visibleColumns.status !== false && (
                      <td>
                        <StatusBadge status={tax.is_active} />
                      </td>
                    )}
                    <td className="text-right pr-4">
                      <TableActionMenu
                        onEdit={() => openEditModal(tax)}
                        onDelete={() => setDeleteTarget(tax)}
                      />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && taxes.length === 0 && (
                <EmptyState cols={6} />
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

      {/* Tax Create/Edit Modal */}
      {modalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-card border border-border/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <ModalHeader
                title={editingTax ? t('products.editTaxRule', 'Edit Tax Rule') : t('products.addTaxRule', 'Add Tax Rule')}
                subtitle={editingTax ? t('products.editTaxDesc', 'Modify tax rate, calculation formula and status') : t('products.addTaxDesc', 'Create a new tax regulation for sales and checkout')}
                icon={<Percent size={20} />}
                iconVariant="blue"
                onClose={closeModal}
              />

              {/* Modal Body Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[calc(85vh-130px)] overflow-y-auto">
                {/* Tax Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colTaxName', 'Tax Name')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      handleClearError('name')
                    }}
                    placeholder={t('products.taxNamePlaceholder', 'e.g. VAT 10%, GST 7%')}
                    className={getFieldClass(
                      formErrors.name,
                      'form-input text-sm h-11 px-3.5 rounded-xl bg-background border border-border/80 transition-all font-medium w-full'
                    )}
                  />
                  <FieldError error={formErrors.name} />
                </div>

                {/* Grid: Rate + Calculation Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      {t('products.colTaxRate', 'Tax Rate')} {type === 'percentage' ? '(%)' : '($)'} <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="rate"
                      name="rate"
                      type="number"
                      step="0.0001"
                      value={rate}
                      onChange={(e) => {
                        setRate(e.target.value)
                        handleClearError('rate')
                      }}
                      min="0"
                      className={getFieldClass(
                        formErrors.rate,
                        'form-input text-sm h-11 px-3.5 rounded-xl bg-background border border-border/80 transition-all font-semibold w-full'
                      )}
                    />
                    <FieldError error={formErrors.rate} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      {t('products.colCalculationType', 'Calculation Type')}
                    </label>
                    <ModernSelect
                      value={type}
                      onChange={(val) => setType(String(val) as any)}
                      options={[
                        { value: 'percentage', label: t('products.percentage', 'Percentage (%)') },
                        { value: 'fixed', label: t('products.fixed', 'Fixed Amount ($)') },
                      ]}
                      placeholder={t('products.colCalculationType')}
                      size="lg"
                      className="w-full"
                      buttonClassName="font-medium text-sm border-border/80 bg-background rounded-xl h-11 px-3.5 cursor-pointer w-full"
                    />
                  </div>
                </div>

                {/* Status Toggle Card */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {isActive ? t('products.active', 'Active') : t('products.inactive', 'Inactive')}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {isActive ? t('products.activeDesc', 'Enabled for sales transactions') : t('products.inactiveDesc', 'Hidden from checkout calculations')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-all cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-primary rounded-xl hover:opacity-90 shadow-md hover:shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{editingTax ? t('common.save', 'Save Changes') : t('products.addTaxRule', 'Create Tax Rule')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* CSV Import Modal */}
      {importOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <ModalHeader
                title={t('products.importCSV', 'Import CSV')}
                subtitle={t('products.taxesImportInstruction', 'Upload CSV file to import tax rules in bulk')}
                icon={<Upload size={18} />}
                iconVariant="blue"
                onClose={() => setImportOpen(false)}
              />

              <form onSubmit={handleImport} className="p-6 space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/10 transition-colors">
                  <Upload className="mx-auto text-primary mb-2 opacity-80" size={32} />
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-tax-upload"
                    required
                  />
                  <label htmlFor="csv-tax-upload" className="cursor-pointer font-bold text-xs text-primary hover:underline block">
                    {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to browse CSV / TXT file')}
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-1">UTF-8 CSV format (name, rate, type)</p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setImportOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-all cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importFile}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {t('products.importCSV', 'Import CSV')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Unified Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="taxes.deleteTitle"
        itemName={deleteTarget?.name}
        confirmText="common.confirmDelete"
        cancelText="common.cancel"
        onConfirm={() => {
          if (deleteTarget) {
            if (recycleBinMode) {
              forceDeleteMutation.mutate(deleteTarget.id)
            } else {
              deleteMutation.mutate(deleteTarget.id)
            }
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending || forceDeleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('taxes.bulkDeleteTitle', 'Delete Selected Taxes')}
        message={t('taxes.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected taxes? This action cannot be undone.`
        }).replace('{{count}}', String(selectedRows.length))}
        confirmText={t('products.deleteSelected', 'Delete Selected')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        variant="danger"
      />
    </div>
  )
}

export default TaxesPage
