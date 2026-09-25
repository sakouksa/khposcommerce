import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader } from '@/components/common/ModalHeader'
import { 
  Plus, Edit2, Trash2, X, Tag, ToggleLeft, ToggleRight, Loader2, 
  ChevronUp, ChevronDown, Download, Upload, Trash, RefreshCw, AlertCircle, 
  Sliders, Paintbrush, ListPlus, Settings, Save
} from 'lucide-react'
import { attributeService } from '@/services/attributeService'
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

interface AttributeValue {
  id: number
  attribute_id: number
  value: string
  color_code?: string | null
  sort_order: number
}

interface Attribute {
  id: number
  company_id: number
  name: string
  type: 'select' | 'color' | 'button' | 'text'
  is_active: boolean
  values?: AttributeValue[]
  deleted_at?: string | null
}

const AttributesPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
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
  } = useServerPagination({ storageKey: 'attributes' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null)
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    type: true,
    values: true,
    status: true,
  })

  // Nested values list management state
  const [valuesList, setValuesList] = useState<Omit<AttributeValue, 'id'>[]>([])
  const [newValueText, setNewValueText] = useState('')
  const [newColorCode, setNewColorCode] = useState('#4f46e5')
  const [newValueSort, setNewValueSort] = useState('0')

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [type, setType] = useState<'select' | 'color' | 'button' | 'text'>('select')
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
    queryKey: ['attributes', page, debouncedSearch, perPage, sortBy, sortOrder, recycleBinMode, statusFilter],
    queryFn: () => attributeService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrder,
      status: recycleBinMode ? 'deleted' : (statusFilter !== 'all' ? statusFilter : undefined)
    }),
    placeholderData: (prev) => prev,
  })

  const attributes: Attribute[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: attributes.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => attributeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.created'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => attributeService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.updated'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attributeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(attributes.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => attributeService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.restored'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => attributeService.forceDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(attributes.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => attributeService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => attributeService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  // Value list builder handlers
  const handleAddValue = () => {
    if (!newValueText.trim()) {
      toast.warning(t('products.enterValueWarning', 'Please enter a value name (e.g. Red, Medium) first.'))
      return
    }
    const valText = newValueText.trim()
    setValuesList(prev => [
      ...prev,
      {
        attribute_id: editingAttr?.id ?? 0,
        value: valText,
        color_code: type === 'color' ? newColorCode : null,
        sort_order: parseInt(newValueSort) || 0
      }
    ])
    toast.success(`${t('products.valueAdded', 'Value added')}: ${valText}`)
    setNewValueText('')
    setNewValueSort('0')
  }

  const handleRemoveValue = (index: number) => {
    setValuesList(prev => prev.filter((_, i) => i !== index))
  }

  // Modal Handlers
  const openCreateModal = () => {
    setEditingAttr(null)
    setFormErrors({})
    setName('')
    setType('select')
    setIsActive(true)
    setValuesList([])
    setNewValueText('')
    setNewColorCode('#4f46e5')
    setNewValueSort('0')
    setModalOpen(true)
  }

  const openEditModal = (attr: Attribute) => {
    setEditingAttr(attr)
    setFormErrors({})
    setName(attr.name)
    setType(attr.type)
    setIsActive(attr.is_active)
    setValuesList(attr.values ? attr.values.map(v => ({ attribute_id: v.attribute_id, value: v.value, color_code: v.color_code, sort_order: v.sort_order })) : [])
    setNewValueText('')
    setNewColorCode('#4f46e5')
    setNewValueSort('0')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingAttr(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('products.errors.attrNameRequired', 'Please enter attribute name')
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

    let currentValues = [...valuesList]
    if (newValueText.trim()) {
      currentValues.push({
        attribute_id: editingAttr?.id ?? 0,
        value: newValueText.trim(),
        color_code: type === 'color' ? newColorCode : null,
        sort_order: parseInt(newValueSort) || 0
      })
      setNewValueText('')
      setNewValueSort('0')
    }

    const payload = {
      company_id: 1,
      name,
      type,
      is_active: isActive,
      values: currentValues
    }

    if (editingAttr) {
      updateMutation.mutate({ id: editingAttr.id, payload })
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
      await attributeService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['attributes'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    attributeService.export()
      .then(res => {
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `attributes_export_${dateStamp}.csv`)
        toast.success(t('toast.exportSuccess'))
      })
      .catch(() => toast.error(t('toast.exportError')))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: t('dashboard.title') || 'Dashboard', path: '/dashboard' }, { label: t('products.tabAttributes') }]} />

          <PageHeader
            icon={<Sliders size={24} />}
            title={t('products.tabAttributes')}
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
                  {t('products.addAttribute')}
                </button>
              </div>
            }
          />
        </>
      )}

      {/* Bulk Actions Panel */}
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
        searchPlaceholder={t('products.searchAttributes', 'Search attributes...')}
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
        onRefresh={() => qc.invalidateQueries({ queryKey: ['attributes'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'name', label: t('products.colAttributeName', 'Attribute Name') },
          { key: 'type', label: t('products.colDisplayType', 'Display Type') },
          { key: 'values', label: t('products.colValuesConfigured', 'Values Configured') },
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
                    checked={attributes.length > 0 && selectedRows.length === attributes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(attributes.map(a => a.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                </th>
                {visibleColumns.name !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colAttributeName')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.type !== false && (
                  <th onClick={() => handleSort('type')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3 w-32">
                    {t('products.colDisplayType')} {renderSortIcon('type')}
                  </th>
                )}
                {visibleColumns.values !== false && (
                  <th className="text-left py-3">{t('products.colValuesConfigured')}</th>
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
                    <td><div className="skeleton h-4 w-20 rounded" /></td>
                    <td><div className="skeleton h-4 w-48 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-12 rounded ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : (
                attributes.map((attr) => (
                  <tr key={attr.id} className="group border-b border-border/40 hover:bg-muted/30">
                    <td className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(attr.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(prev => [...prev, attr.id])
                          } else {
                            setSelectedRows(prev => prev.filter(id => id !== attr.id))
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                      />
                    </td>
                    {visibleColumns.name !== false && (
                      <td className="font-medium text-foreground text-sm py-3">
                        <span className="font-semibold text-foreground text-sm">{attr.name}</span>
                      </td>
                    )}
                    {visibleColumns.type !== false && (
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground capitalize">
                          {attr.type === 'select' && t('products.dropdownSelect', 'Dropdown Select')}
                          {attr.type === 'color' && t('products.colorSwatches', 'Color Swatches')}
                          {attr.type === 'button' && t('products.productButtons', 'Pill Buttons')}
                          {attr.type === 'text' && t('products.plainTextField', 'Text Input')}
                          {!['select', 'color', 'button', 'text'].includes(attr.type) && attr.type}
                        </span>
                      </td>
                    )}
                    {visibleColumns.values !== false && (
                      <td>
                        <div className="flex flex-wrap gap-1 items-center max-w-xs">
                          {(attr.values || []).slice(0, 4).map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {attr.type === 'color' && v.color_code && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-border"
                                  style={{ backgroundColor: v.color_code }}
                                />
                              )}
                              {v.value}
                            </span>
                          ))}
                          {(attr.values || []).length > 4 && (
                            <span className="text-[11px] text-muted-foreground font-semibold">
                              +{attr.values!.length - 4}
                            </span>
                          )}
                          {(!attr.values || attr.values.length === 0) && (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.status !== false && (
                      <td>
                        <StatusBadge status={attr.is_active} />
                      </td>
                    )}
                    <td className="text-right pr-4">
                      <TableActionMenu
                        onEdit={() => openEditModal(attr)}
                        onDelete={() => setDeleteTarget(attr)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination */}
        <div className="p-4 border-t border-border">
          <Pagination 
            currentPage={pagination.current_page} 
            lastPage={pagination.last_page} 
            total={pagination.total} 
            perPage={perPage} 
            onPageChange={setPage} 
            onPerPageChange={setPerPage} 
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <ModalHeader
              title={editingAttr ? t('products.editAttribute', 'Edit Attribute') : t('products.addAttribute', 'Add Attribute')}
              subtitle={editingAttr ? t('products.editAttributeDesc', 'Modify display type and customizable variant options') : t('products.addAttributeDesc', 'Create a new product variation dimension (e.g. Size, Color, Storage...)')}
              icon={<Sliders size={20} />}
              iconVariant="blue"
              onClose={closeModal}
            />

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[calc(85vh-130px)] overflow-y-auto">
              {/* Attribute Name */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  {t('products.colAttributeName', 'Attribute Name')} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    handleClearError('name')
                  }}
                  placeholder={t('products.attributeNamePlaceholder', 'e.g. Color, Size, Storage, RAM, Material...')}
                  className={getFieldClass(
                    formErrors.name,
                    'form-input text-sm h-11 px-3.5 rounded-xl bg-background border border-border/80 transition-all font-medium w-full'
                  )}
                />
                <FieldError error={formErrors.name} />
              </div>

              {/* Display Type + Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colDisplayType', 'Display Type')}
                  </label>
                  <ModernSelect
                    value={type}
                    onChange={(val) => setType(String(val) as any)}
                    options={[
                      { value: 'select', label: t('products.dropdownSelect', 'Dropdown Select') },
                      { value: 'color', label: t('products.colorSwatches', 'Color Swatches') },
                      { value: 'button', label: t('products.productButtons', 'Pill Buttons') },
                      { value: 'text', label: t('products.plainTextField', 'Text Input') },
                    ]}
                    placeholder={t('products.colDisplayType')}
                    size="lg"
                    className="w-full"
                    buttonClassName="font-medium text-sm border-border/80 bg-background rounded-xl h-11 px-3.5 cursor-pointer w-full"
                  />
                </div>

                {/* Status Toggle Card */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colStatus', 'Status')}
                  </label>
                  <div className="flex items-center justify-between px-3.5 rounded-xl bg-muted/30 border border-border/80 h-11 w-full box-border">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                      <span className="text-xs font-semibold text-foreground">
                        {isActive ? t('products.active', 'Active') : t('products.inactive', 'Inactive')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nested Values Builder */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ListPlus size={14} className="text-primary" />
                    {t('products.colValuesConfigured', 'Configured Values')}
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {valuesList.length} {t('products.optionsCount', 'Options')}
                  </span>
                </div>

                {/* Builder Input Strip */}
                <div className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2.5 rounded-2xl border border-border/60">
                  <div className={type === 'color' ? 'col-span-5' : 'col-span-8'}>
                    <input
                      value={newValueText}
                      onChange={(e) => setNewValueText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddValue()
                        }
                      }}
                      placeholder={type === 'color' ? t('products.attributeColorPlaceholder', 'e.g. Midnight Black') : t('products.attributeValuePlaceholder', 'e.g. Medium, 256GB, Red...')}
                      className="form-input text-xs h-10 py-2 px-3 rounded-xl bg-background border-border/80 font-medium w-full"
                    />
                  </div>

                  {type === 'color' && (
                    <div className="col-span-4 flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newColorCode}
                        onChange={(e) => setNewColorCode(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-border/80 p-0 cursor-pointer flex-shrink-0"
                      />
                      <input
                        value={newColorCode}
                        onChange={(e) => setNewColorCode(e.target.value)}
                        className="form-input h-10 py-1.5 px-2 text-[11px] font-mono rounded-lg bg-background border-border/80 w-full uppercase"
                      />
                    </div>
                  )}

                  <div className={type === 'color' ? 'col-span-3' : 'col-span-4'}>
                    <button
                      type="button"
                      onClick={handleAddValue}
                      className="w-full h-10 text-xs bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus size={13} />
                      <span>{t('products.addOption', 'Add')}</span>
                    </button>
                  </div>
                </div>

                {/* List of current values */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {valuesList.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {type === 'color' && val.color_code && (
                          <span 
                            className="w-4 h-4 rounded-full border border-border/80 flex-shrink-0 shadow-2xs" 
                            style={{ backgroundColor: val.color_code }} 
                          />
                        )}
                        <span className="font-semibold text-foreground">{val.value}</span>
                        {val.color_code && <span className="text-[10px] text-muted-foreground font-mono">({val.color_code})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(idx)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {valuesList.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/80">
                      {t('products.noValuesConfigured', 'No values added yet. Enter a value name above and click Add')}
                    </div>
                  )}
                </div>
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
                  <span>{editingAttr ? t('common.save', 'Save Changes') : t('products.addAttribute', 'Create Attribute')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
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
                subtitle={t('products.attributesImportInstruction', 'Upload CSV file to import attributes in bulk')}
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
                    id="csv-attribute-upload"
                    required
                  />
                  <label htmlFor="csv-attribute-upload" className="cursor-pointer font-bold text-xs text-primary hover:underline block">
                    {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to browse CSV / TXT file')}
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-1">UTF-8 CSV format (name, type, values)</p>
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
        title="attributes.deleteTitle"
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
        title={t('attributes.bulkDeleteTitle', 'Delete Selected Attributes')}
        message={t('attributes.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected attributes? This action cannot be undone.`
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

export default AttributesPage
