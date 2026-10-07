import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader } from '@/components/common/ModalHeader'
import { 
  Plus, Edit2, Trash2, X, Tag, ToggleLeft, ToggleRight, Loader2, 
  ChevronUp, ChevronDown, Download, Upload, Trash, RefreshCw, AlertCircle, 
  Image as ImageIcon, Package, Sparkles, Save
} from 'lucide-react'
import { brandService } from '@/services/brandService'
import { getAbsoluteImageUrl, DEFAULT_BRAND_IMAGE } from '@/utils/image'
import { downloadBlob } from '@/utils/export'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { Image as AntImage } from 'antd'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import StatusBadge from '@/components/common/StatusBadge'
import { FieldError, getFieldClass } from '@/components/common'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import { TableToolbar, AddButton, ExportButton, ImportButton } from '@/components/common'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'

interface Brand {
  id: number
  company_id: number
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  is_active: boolean
  products_count?: number
  deleted_at?: string | null
}

const getBrandVisuals = (name: string) => {
  const n = (name || '').trim()
  const initial = n.length > 0 ? n.slice(0, 2).toUpperCase() : 'BR'
  const colors = [
    'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'bg-rose-500/10 text-rose-500 border-rose-500/20',
    'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'bg-pink-500/10 text-pink-500 border-pink-500/20',
  ]
  const idx = (n.charCodeAt(0) || 0) % colors.length
  return { initial, style: colors[idx] }
}

const BrandsPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['products', 'common'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Open add modal ONLY when parent triggers it with a positive change
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
  } = useServerPagination({ storageKey: 'brands' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    brand: true,
    slug: true,
    products_count: true,
    description: true,
    status: true,
  })

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['brands', page, debouncedSearch, perPage, sortBy, sortOrder, recycleBinMode, statusFilter],
    queryFn: () => brandService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrder,
      status: recycleBinMode ? 'deleted' : (statusFilter !== 'all' ? statusFilter : undefined)
    }),
    placeholderData: (prev) => prev,
  })

  const brands: Brand[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: brands.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (fd: FormData) => brandService.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.created', { item: t('products.colBrand', 'Brand') }))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => {
      fd.append('_method', 'PUT')
      return brandService.update(id, fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.updated', { item: t('products.colBrand', 'Brand') }))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.deleted', { item: t('products.colBrand', 'Brand') }))
      setDeleteTarget(null)
      adjustAfterDelete(brands.length)
      setSelectedRows(r => r.filter(x => x !== deleteTarget?.id))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
      setDeleteTarget(null)
    }
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => brandService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.restored'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => brandService.forceDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
      setDeleteTarget(null)
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => brandService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => brandService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  // Handlers
  const openCreateModal = () => {
    setEditingBrand(null)
    setFormErrors({})
    setName('')
    setDescription('')
    setIsActive(true)
    setLogoUrl('')
    setLogoFile(null)
    setLogoPreview(null)
    setRemoveLogo(false)
    setModalOpen(true)
  }

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand)
    setFormErrors({})
    setName(brand.name)
    setDescription(brand.description ?? '')
    setIsActive(brand.is_active)
    setLogoFile(null)
    setLogoUrl(brand.logo?.startsWith('http') ? brand.logo : '')
    setLogoPreview(brand.logo ? getAbsoluteImageUrl(brand.logo) : null)
    setRemoveLogo(false)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBrand(null)
    setFormErrors({})
    setRemoveLogo(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
      setRemoveLogo(false)
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('products.errors.brandNameRequired', 'Please enter brand name')
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

    const fd = new FormData()
    fd.append('company_id', '1')
    fd.append('name', name)
    if (description) fd.append('description', description)
    fd.append('is_active', isActive ? '1' : '0')
    if (logoFile) {
      fd.append('logo_file', logoFile)
    } else if (logoUrl) {
      fd.append('logo', logoUrl)
    } else if (removeLogo) {
      fd.append('remove_logo', '1')
      fd.append('logo', '')
    }

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, fd })
    } else {
      createMutation.mutate(fd)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    const fd = new FormData()
    fd.append('file', importFile)
    try {
      await brandService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['brands'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    brandService.export()
      .then(res => {
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `brands_export_${dateStamp}.csv`)
        toast.success(t('toast.exportSuccess'))
      })
      .catch(() => toast.error(t('toast.exportError')))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: t('dashboard.title') || 'Dashboard', path: '/dashboard' }, { label: t('products.tabBrands') }]} />

          <PageHeader
            icon={<Tag size={24} />}
            title={t('products.tabBrands')}
            subtitle={t('products.heroSubtitle')}
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRecycleBinMode(!recycleBinMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition-colors
                             ${recycleBinMode 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                                : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
                >
                  <Trash size={15} />
                  {recycleBinMode ? t('products.recycleBin') : t('products.trash')}
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
                >
                  <Download size={15} />
                  {t('products.exportCSV')}
                </button>

                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
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
                  {t('products.addBrand')}
                </button>
              </div>
            }
          />
        </>
      )}

      {/* Bulk actions panel */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <AlertCircle size={16} />
            <span>{selectedRows.length} {t('products.selectedCount')}</span>
          </div>
          <div className="flex items-center gap-2">
            {recycleBinMode ? (
              <>
                <button
                  onClick={() => bulkRestoreMutation.mutate(selectedRows)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} />
                  {t('products.restoreSelected')}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Permanently delete selected brands? This cannot be undone.')) {
                      selectedRows.forEach(id => forceDeleteMutation.mutate(id))
                      setSelectedRows([])
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-xs cursor-pointer"
                >
                  <Trash size={13} />
                  {t('products.permanentDelete')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 cursor-pointer transition-colors shadow-xs"
              >
                <Trash size={13} />
                {t('products.deleteSelected')}
              </button>
            )}
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
        searchPlaceholder={t('products.searchBrands', 'Search brands...')}
        onReset={() => {
          setSearch('')
          setStatusFilter('all')
          setSortBy('id')
          setSortOrder('asc')
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
        onRefresh={() => qc.invalidateQueries({ queryKey: ['brands'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'brand', label: t('products.colBrand', 'Brand') },
          { key: 'slug', label: t('products.colSlug', 'Slug') },
          { key: 'products_count', label: t('products.productsCount', 'Products') },
          { key: 'description', label: t('products.colDescription', 'Description') },
          { key: 'status', label: t('products.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Brands Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <th className="w-12 text-center py-3.5">
                  <input
                    type="checkbox"
                    checked={brands.length > 0 && selectedRows.length === brands.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(brands.map(b => b.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                  />
                </th>
                {visibleColumns.brand !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5">
                    {t('products.colBrand', 'Brand')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.slug !== false && (
                  <th onClick={() => handleSort('slug')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5">
                    {t('products.colSlug', 'Slug')} {renderSortIcon('slug')}
                  </th>
                )}
                {visibleColumns.products_count !== false && (
                  <th className="text-center py-3.5">
                    {t('products.productsCount', 'Products')}
                  </th>
                )}
                {visibleColumns.description !== false && (
                  <th onClick={() => handleSort('description')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5">
                    {t('products.colDescription', 'Description')} {renderSortIcon('description')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 w-28">
                    {t('products.colStatus', 'Status')} {renderSortIcon('is_active')}
                  </th>
                )}
                <th className="text-right pr-4 py-3.5 select-none w-24">{t('products.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="w-12 py-3.5"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-12 w-12 rounded-2xl shrink-0" />
                        <div className="space-y-1.5">
                          <div className="skeleton h-4 w-28 rounded" />
                          <div className="skeleton h-3 w-16 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-16 rounded-xl mx-auto" /></td>
                    <td className="py-3.5"><div className="skeleton h-4 w-44 rounded" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-16 rounded-full" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-8 rounded-lg ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : (
                brands.map((brand) => {
                  const visuals = getBrandVisuals(brand.name)
                  return (
                    <tr key={brand.id} className="group border-b border-border/40 hover:bg-muted/30 transition-colors">
                      {/* Checkbox */}
                      <td className="w-12 text-center py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(brand.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(prev => [...prev, brand.id])
                            } else {
                              setSelectedRows(prev => prev.filter(id => id !== brand.id))
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* Brand Logo & Name */}
                      {visibleColumns.brand !== false && (
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3.5">
                            {/* Logo Avatar */}
                            <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 overflow-hidden shrink-0 shadow-2xs group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-1">
                              <img 
                                src={getAbsoluteImageUrl(brand.logo) || DEFAULT_BRAND_IMAGE} 
                                alt={brand.name} 
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  if (!target.src.endsWith(DEFAULT_BRAND_IMAGE)) {
                                    target.src = DEFAULT_BRAND_IMAGE
                                  }
                                }}
                              />
                            </div>

                            {/* Brand Info */}
                            <div className="min-w-0 flex flex-col">
                              <span className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                                {brand.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                                {t('products.colBrand', 'Brand')}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Slug */}
                      {visibleColumns.slug !== false && (
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-xs text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-lg border border-border/40">
                            /{brand.slug}
                          </span>
                        </td>
                      )}

                      {/* Products Count */}
                      {visibleColumns.products_count !== false && (
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => navigate(`/products?tab=products&brand_id=${brand.id}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            title="Filter products by this brand"
                          >
                            <Package size={13} />
                            <span>{brand.products_count ?? 0}</span>
                            <span className="text-[11px] opacity-80">{t('products.itemsCount', 'Items')}</span>
                          </button>
                        </td>
                      )}

                      {/* Description */}
                      {visibleColumns.description !== false && (
                        <td className="py-3.5 px-3">
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]" title={brand.description ?? ''}>
                            {brand.description || '—'}
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status !== false && (
                        <td className="py-3.5 px-3">
                          <StatusBadge status={brand.is_active} />
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 pr-4 text-right">
                        {recycleBinMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => restoreMutation.mutate(brand.id)}
                              className="p-1.5 hover:bg-muted rounded-lg text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Restore"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(brand)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              title="Permanent Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <TableActionMenu
                            onEdit={() => openEditModal(brand)}
                            onDelete={() => setDeleteTarget(brand)}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
              {!isLoading && brands.length === 0 && (
                <EmptyState cols={7} />
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

      {/* Clean Enterprise Brand Create/Edit Modal */}
      {modalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-card border border-border/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Global Modal Header */}
              <ModalHeader
                title={editingBrand ? t('products.editBrand', 'Edit Brand') : t('products.addBrand', 'Add Brand')}
                subtitle={editingBrand ? t('products.editBrandDesc', 'Update brand metadata and logo insignia') : t('products.addBrandDesc', 'Create a new manufacturer or brand mark')}
                icon={<Tag size={20} />}
                iconVariant="blue"
                onClose={closeModal}
              />

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Brand Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colBrand', 'Brand Name')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      handleClearError('name')
                    }}
                    placeholder={t('products.brandNamePlaceholder', 'e.g. Apple, Samsung, Nike, Logitech...')}
                    className={getFieldClass(
                      formErrors.name,
                      'form-input text-sm rounded-xl py-2.5 px-3.5 bg-background border border-border/80 transition-all font-medium'
                    )}
                  />
                  <FieldError error={formErrors.name} />
                </div>

                {/* Status Card */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/25 border border-border/60">
                  <div>
                    <span className="block text-xs font-bold text-foreground">{t('products.colStatus', 'Status')}</span>
                    <span className="text-[11px] text-muted-foreground">{isActive ? t('products.active', 'Active') : t('products.inactive', 'Inactive')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="text-primary hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                  >
                    {isActive ? <ToggleRight size={34} /> : <ToggleLeft size={34} className="text-muted-foreground" />}
                  </button>
                </div>

                {/* Clean Image / Logo Card */}
                <div className="p-4 rounded-2xl bg-muted/25 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      {t('products.colPhoto', 'Brand Logo / Icon')}
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3.5">
                    {/* Visual Preview Box */}
                    <div className="w-16 h-16 rounded-2xl border border-border/80 overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-2xs relative group p-1">
                      {logoPreview ? (
                        <AntImage
                          src={logoPreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                          fallback={DEFAULT_BRAND_IMAGE}
                        />
                      ) : (
                        <img
                          src={DEFAULT_BRAND_IMAGE}
                          alt="Default Brand"
                          className="w-full h-full object-contain opacity-70"
                        />
                      )}
                    </div>

                    {/* Logo Inputs */}
                    <div className="flex-grow space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="clean-brand-logo-upload"
                        />
                        <label
                          htmlFor="clean-brand-logo-upload"
                          className="inline-flex items-center justify-center px-3.5 py-1.5 border border-border/80 rounded-xl text-xs font-semibold text-foreground bg-background hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                        >
                          <Upload size={13} className="mr-1.5" />
                          {t('products.uploadLogo', 'Choose File')}
                        </label>

                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null)
                              setLogoPreview(null)
                              setLogoUrl('')
                              setRemoveLogo(true)
                            }}
                            className="px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          >
                            {t('common.remove', 'Remove')}
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value)
                          if (e.target.value) {
                            setLogoPreview(e.target.value)
                            setRemoveLogo(false)
                          } else if (!logoFile) {
                            setLogoPreview(null)
                          }
                        }}
                        placeholder={t('products.pasteImageUrl', 'Or paste logo URL (https://...)')}
                        className="form-input text-xs rounded-xl py-1.5 px-3 bg-background border-border/80 w-full"
                      />
                      <p className="text-[10px] text-muted-foreground">{t('products.uploadLogoRecommendation', 'Recommended 300x300 PNG, JPG or WebP')}</p>
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
                    placeholder={t('products.brandDescPlaceholder', 'Short overview about this brand...')}
                    rows={2}
                    className="form-input text-sm rounded-xl py-2 px-3 bg-background border-border/80 resize-none"
                  />
                </div>

                {/* Clean Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 shadow-md shadow-primary/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{editingBrand ? t('common.save', 'Save Changes') : t('products.addBrand', 'Create Brand')}</span>
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
              className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <ModalHeader
                title={t('products.importCSV', 'Import CSV')}
                subtitle={t('products.brandsImportInstruction', 'Upload CSV file to import brands in bulk')}
                icon={<Upload size={20} />}
                iconVariant="blue"
                onClose={() => setImportOpen(false)}
              />

              <form onSubmit={handleImport} className="p-6 space-y-4">
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted/10 transition-colors">
                  <Upload className="mx-auto text-muted-foreground mb-2" size={32} />
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-brand-upload"
                    required
                  />
                  <label htmlFor="csv-brand-upload" className="cursor-pointer font-medium text-primary hover:underline">
                    {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to upload CSV')}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{t('products.brandsImportInstruction', 'CSV format: Name, Description')}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setImportOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importFile}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {importing && <Loader2 size={14} className="animate-spin" />}
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
        title="brands.deleteTitle"
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
        title={t('brands.bulkDeleteTitle', 'Delete Selected Brands')}
        message={t('brands.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected brands? This action cannot be undone.`
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

export default BrandsPage
