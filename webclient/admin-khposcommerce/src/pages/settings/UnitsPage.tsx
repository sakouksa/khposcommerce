import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader } from '@/components/common/ModalHeader'
import { 
  Plus, Edit2, Trash2, X, Scale, ToggleLeft, ToggleRight, Loader2, 
  ChevronUp, ChevronDown, Download, Upload, Trash, RefreshCw, AlertCircle,
  Save, Sparkles
} from 'lucide-react'
import { unitService } from '@/services/unitService'
import { useToast } from '@/hooks/useToast'
import { downloadBlob } from '@/utils/export'
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
import TableActionMenu from '@/components/shared/TableActionMenu'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import { TableToolbar } from '@/components/common'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'

interface Unit {
  id: number
  company_id: number
  name: string
  symbol: string
  description?: string | null
  is_active: boolean
  deleted_at?: string | null
}

interface UnitPreset {
  symbol: string
  names: {
    km: string
    en: string
    zh: string
    th: string
    vi: string
  }
}

const POPULAR_UNIT_PRESETS: UnitPreset[] = [
  { symbol: 'pcs', names: { km: 'គ្រាប់', en: 'Piece', zh: '件', th: 'ชิ้น', vi: 'Cái' } },
  { symbol: 'box', names: { km: 'ប្រអប់', en: 'Box', zh: '盒', th: 'กล่อง', vi: 'Hộp' } },
  { symbol: 'pack', names: { km: 'កញ្ចប់', en: 'Pack', zh: '包', th: 'แพ็ค', vi: 'Gói' } },
  { symbol: 'set', names: { km: 'ឈុត', en: 'Set', zh: '套', th: 'ชุด', vi: 'Bộ' } },
  { symbol: 'pair', names: { km: 'គូ', en: 'Pair', zh: '双', th: 'คู่', vi: 'Đôi' } },
  { symbol: 'kg', names: { km: 'គីឡូក្រាម', en: 'Kilogram', zh: '千克', th: 'กิโลกรัม', vi: 'Kilôgam' } },
  { symbol: 'g', names: { km: 'ក្រាម', en: 'Gram', zh: '克', th: 'กรัม', vi: 'Gam' } },
  { symbol: 'L', names: { km: 'លីត្រ', en: 'Liter', zh: '升', th: 'ลิตร', vi: 'Lít' } },
  { symbol: 'm', names: { km: 'ម៉ែត្រ', en: 'Meter', zh: '米', th: 'เมตร', vi: 'Mét' } },
  { symbol: 'btl', names: { km: 'ដប', en: 'Bottle', zh: '瓶', th: 'ขวด', vi: 'Chai' } },
  { symbol: 'can', names: { km: 'កំប៉ុង', en: 'Can', zh: '罐', th: 'กระป๋อง', vi: 'Lon' } },
  { symbol: 'bag', names: { km: 'បាវ', en: 'Bag', zh: '袋', th: 'กระสอบ', vi: 'Bao' } },
]

const UnitsPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
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
  } = useServerPagination({ storageKey: 'units' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null)
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    symbol: true,
    description: true,
    status: true,
  })

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

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
    queryKey: ['units', page, debouncedSearch, perPage, sortBy, sortOrder, recycleBinMode, statusFilter],
    queryFn: () => unitService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrder,
      status: recycleBinMode ? 'deleted' : (statusFilter !== 'all' ? statusFilter : undefined)
    }),
    placeholderData: (prev) => prev,
  })

  const units: Unit[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: units.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => unitService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.created'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => unitService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.updated'))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(units.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => unitService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.restored'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => unitService.forceDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
      adjustAfterDelete(units.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => unitService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => unitService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  // Handlers
  const openCreateModal = () => {
    setEditingUnit(null)
    setName('')
    setSymbol('')
    setDescription('')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit)
    setName(unit.name)
    setSymbol(unit.symbol)
    setDescription(unit.description ?? '')
    setIsActive(unit.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingUnit(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      company_id: 1,
      name,
      symbol,
      description: description || null,
      is_active: isActive,
    }

    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, payload })
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
      await unitService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['units'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    unitService.export()
      .then(res => {
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `units_export_${dateStamp}.csv`)
        toast.success(t('toast.exportSuccess'))
      })
      .catch(() => toast.error(t('toast.exportError')))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: t('dashboard.title') || 'Dashboard', path: '/dashboard' }, { label: t('products.tabUnits') }]} />

          <PageHeader
            icon={<Scale size={24} />}
            title={t('products.tabUnits')}
            subtitle={t('products.heroSubtitle')}
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Download size={15} />
                  {t('products.exportCSV')}
                </button>

                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  {t('products.addUnit')}
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
        searchPlaceholder={t('products.searchUnits', 'Search units...')}
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
        onRefresh={() => qc.invalidateQueries({ queryKey: ['units'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'name', label: t('products.colUnitName', 'Unit Name') },
          { key: 'symbol', label: t('products.colSymbol', 'Symbol') },
          { key: 'description', label: t('products.colDescription', 'Description') },
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
                    checked={units.length > 0 && selectedRows.length === units.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(units.map(u => u.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                </th>
                {visibleColumns.name !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colUnitName')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.symbol !== false && (
                  <th onClick={() => handleSort('symbol')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colSymbol')} {renderSortIcon('symbol')}
                  </th>
                )}
                {visibleColumns.description !== false && (
                  <th onClick={() => handleSort('description')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3">
                    {t('products.colDescription')} {renderSortIcon('description')}
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
                    <td><div className="skeleton h-4 w-48 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-12 rounded ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="group border-b border-border/40 hover:bg-muted/30">
                    <td className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(unit.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(prev => [...prev, unit.id])
                          } else {
                            setSelectedRows(prev => prev.filter(id => id !== unit.id))
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                      />
                    </td>
                    {visibleColumns.name !== false && (
                      <td className="font-medium text-foreground text-sm py-3 flex items-center gap-2">
                        <Scale size={16} className="text-blue-500 flex-shrink-0" />
                        <span>{unit.name}</span>
                      </td>
                    )}
                    {visibleColumns.symbol !== false && (
                      <td className="text-muted-foreground font-mono text-xs">{unit.symbol}</td>
                    )}
                    {visibleColumns.description !== false && (
                      <td className="text-muted-foreground text-sm">{unit.description ?? '—'}</td>
                    )}
                    {visibleColumns.status !== false && (
                      <td>
                        <StatusBadge status={unit.is_active} />
                      </td>
                    )}
                    <td className="text-right pr-4">
                      <TableActionMenu
                        variant="inline"
                        onEdit={() => openEditModal(unit)}
                        onDelete={() => setDeleteTarget(unit)}
                      />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && units.length === 0 && (
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

      {/* Unit Create/Edit Modal */}
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
                title={editingUnit ? t('products.editUnit', 'Edit Unit') : t('products.addUnit', 'Add Unit')}
                subtitle={editingUnit ? t('products.editUnitDesc', 'Modify measurement unit attributes and notation') : t('products.addUnitDesc', 'Create a new measurement unit for inventory tracking')}
                icon={<Scale size={20} />}
                iconVariant="blue"
                onClose={closeModal}
              />

              {/* Modal Body Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[calc(85vh-130px)] overflow-y-auto">
                {/* Popular Quick Presets */}
                {!editingUnit && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Sparkles size={13} className="text-primary" />
                      <span>{t('products.quickPresets', 'Popular Presets')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_UNIT_PRESETS.map((p) => {
                        const isSelected = symbol === p.symbol
                        const currentLang = (language || i18n.language || 'km') as 'km' | 'en' | 'zh' | 'th' | 'vi'
                        const displayName = p.names[currentLang] || p.names.en || p.symbol
                        return (
                          <button
                            key={p.symbol}
                            type="button"
                            onClick={() => {
                              setName(displayName)
                              setSymbol(p.symbol)
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-muted/50 text-foreground border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                            }`}
                          >
                            {displayName} <span className="opacity-70 font-mono text-[10px]">({p.symbol})</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Unit Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colUnitName', 'Unit Name')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('products.unitNamePlaceholder', 'e.g. Pieces, Kilograms, Boxes, Sets...')}
                    className="form-input text-sm h-11 px-3.5 rounded-xl bg-background border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium w-full"
                  />
                </div>

                {/* Side-by-side: Unit Symbol + Status Toggle Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      {t('products.colSymbol', 'Symbol')} <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      required
                      placeholder={t('products.unitSymbolPlaceholder', 'e.g. pcs, kg, box')}
                      className="form-input font-mono text-sm h-11 px-3.5 rounded-xl bg-background border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold w-full"
                    />
                  </div>

                  {/* Status Toggle Card */}
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      {t('products.colStatus', 'Status')}
                    </label>
                    <div className="flex items-center justify-between px-3.5 rounded-xl bg-muted/30 border border-border/80 h-11 w-full">
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

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colDescription', 'Description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('products.unitDescPlaceholder', 'Short overview about this measurement unit...')}
                    rows={3}
                    className="form-input text-sm py-2.5 px-3.5 rounded-xl bg-background border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
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
                    <span>{editingUnit ? t('common.save', 'Save Changes') : t('products.addUnit', 'Create Unit')}</span>
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
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border border-border/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <ModalHeader
                title={t('products.importCSV', 'Import CSV')}
                subtitle={t('products.importCSVDesc', 'Batch import measurement units via CSV/TXT file')}
                icon={<Upload size={18} />}
                iconVariant="blue"
                onClose={() => setImportOpen(false)}
              />

              <form onSubmit={handleImport} className="p-6 space-y-4">
                <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:bg-muted/10 transition-colors">
                  <Upload className="mx-auto text-primary mb-2 opacity-80" size={32} />
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-unit-upload"
                    required
                  />
                  <label htmlFor="csv-unit-upload" className="cursor-pointer font-bold text-xs text-primary hover:underline block">
                    {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to browse CSV / TXT file')}
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-1">UTF-8 CSV format (name, symbol, description)</p>
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
        title="units.deleteTitle"
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
        title={t('units.bulkDeleteTitle', 'Delete Selected Units')}
        message={t('units.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected units? This action cannot be undone.`
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

export default UnitsPage
