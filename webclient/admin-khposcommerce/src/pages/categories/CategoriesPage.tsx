import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ModalHeader } from '@/components/common/ModalHeader'
import { 
  Plus, X, Folder, FolderTree, ToggleLeft, ToggleRight, Loader2, Edit2, Trash2, 
  ChevronUp, ChevronDown, ChevronRight, Download, Upload, Trash, RefreshCw, 
  AlertCircle, CheckCircle2, Image as ImageIcon, Settings, Package, Eye,
  Smartphone, Laptop, Monitor, Watch, Keyboard, Headphones, Camera, Zap, 
  Footprints, Shirt, ExternalLink, Sparkles, Link, Check, Save
} from 'lucide-react'
import { categoryService } from '@/services/categoryService'
import { getAbsoluteImageUrl, DEFAULT_CATEGORY_IMAGE } from '@/utils/image'
import { downloadBlob } from '@/utils/export'
import { Image as AntImage } from 'antd'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import { focusFirstInvalidField } from '@/utils/formValidation'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/common/StatusBadge'
import { FieldError, getFieldClass, TableToolbar, AddButton, ExportButton, ImportButton } from '@/components/common'
import { useTranslation } from 'react-i18next'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { useThemeStore } from '@/stores/themeStore'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'

interface Category {
  id: number
  company_id: number
  parent_id?: number | null
  name: string
  slug: string
  description?: string
  image?: string | null
  sort_order: number
  is_active: boolean
  parent?: Category | null
  products_count?: number
  deleted_at?: string | null
}

interface TreeCategory extends Category {
  children?: TreeCategory[]
}

const CATEGORY_NAMES_LOCALE: Record<string, Record<string, string>> = {
  Smartphones: { km: 'ទូរស័ព្ទស្មាតហ្វូន', zh: '智能手机', th: 'สมาร์ทโฟน', vi: 'Điện thoại thông minh', en: 'Smartphones' },
  Laptops: { km: 'កុំព្យូទ័រយួរដៃ', zh: '笔记本电脑', th: 'แล็ปท็อป', vi: 'Máy tính xách tay', en: 'Laptops' },
  Monitors: { km: 'អេក្រង់កុំព្យូទ័រ', zh: '显示器', th: 'จอมอนิเตอร์', vi: 'Màn hình máy tính', en: 'Monitors' },
  Smartwatches: { km: 'នាឡិកាឆ្លាតវៃ', zh: '智能手表', th: 'สมาร์ทวอทช์', vi: 'Đồng hồ thông minh', en: 'Smartwatches' },
  Keyboards: { km: 'ក្ដារចុច', zh: '键盘', th: 'คีย์บอร์ด', vi: 'Bàn phím', en: 'Keyboards' },
  Audio: { km: 'ឧបករណ៍សំឡេង', zh: '音频设备', th: 'อุปกรณ์เสียง', vi: 'Thiết bị âm thanh', en: 'Audio' },
  Cameras: { km: 'ម៉ាស៊ីនថតរូប', zh: '相机', th: 'กล้องถ่ายรูป', vi: 'Máy ảnh', en: 'Cameras' },
  Chargers: { km: 'ឧបករណ៍សាកថ្ម', zh: '充电器', th: 'ที่ชาร์จ', vi: 'Bộ sạc', en: 'Chargers' },
  Shoes: { km: 'ស្បែកជើង', zh: '鞋类', th: 'รองเท้า', vi: 'Giày dép', en: 'Shoes' },
  Apparel: { km: 'សម្លៀកបំពាក់', zh: '服装', th: 'เครื่องแต่งกาย', vi: 'Quần áo', en: 'Apparel' },
}

const getCategoryVisuals = (name: string) => {
  const n = (name || '').toLowerCase()
  if (n.includes('phone') || n.includes('mobile') || n.includes('smart')) {
    return { Icon: Smartphone, bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
  }
  if (n.includes('laptop') || n.includes('computer') || n.includes('macbook')) {
    return { Icon: Laptop, bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' }
  }
  if (n.includes('monitor') || n.includes('display') || n.includes('screen')) {
    return { Icon: Monitor, bg: 'bg-sky-500/10 text-sky-500 border-sky-500/20' }
  }
  if (n.includes('watch')) {
    return { Icon: Watch, bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
  }
  if (n.includes('keyboard')) {
    return { Icon: Keyboard, bg: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }
  }
  if (n.includes('audio') || n.includes('headphone') || n.includes('speaker') || n.includes('sound')) {
    return { Icon: Headphones, bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }
  }
  if (n.includes('camera') || n.includes('lens')) {
    return { Icon: Camera, bg: 'bg-red-500/10 text-red-500 border-red-500/20' }
  }
  if (n.includes('charger') || n.includes('power') || n.includes('adapter')) {
    return { Icon: Zap, bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
  }
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('footwear')) {
    return { Icon: Footprints, bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  }
  if (n.includes('apparel') || n.includes('clothing') || n.includes('shirt')) {
    return { Icon: Shirt, bg: 'bg-pink-500/10 text-pink-500 border-pink-500/20' }
  }
  return { Icon: Folder, bg: 'bg-primary/10 text-primary border-primary/20' }
}

const CategoriesPage: React.FC<{ isTab?: boolean; triggerAdd?: number }> = ({ isTab, triggerAdd }) => {
  const { language } = useThemeStore()
  const { t, i18n } = useTranslation(['products', 'common'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Open add modal ONLY when parent triggers it with an active change
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
  } = useServerPagination({ storageKey: 'categories' })

  // UI state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({})
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    category: true,
    parent: true,
    slug: true,
    products_count: true,
    description: true,
    sort_order: true,
    status: true,
  })

  // CSV Import Modal
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Sorting states
  const [sortBy, setSortBy] = useState('sort_order')
  const [sortOrderField, setSortOrderField] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrderField(sortOrderField === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrderField('asc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrderField === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  // Fetch all categories for dropdown (exclude current editing category children)
  const { data: allCatsData } = useQuery({
    queryKey: ['categories-list-dropdown'],
    queryFn: () => categoryService.list({ per_page: 500 }).then(r => r.data),
  })
  const dropdownCats: Category[] = allCatsData ?? []

  // Main Categories query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['categories', page, debouncedSearch, perPage, sortBy, sortOrderField, recycleBinMode, statusFilter],
    queryFn: () => categoryService.list({ 
      page, 
      search: debouncedSearch, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_order: sortOrderField,
      status: recycleBinMode ? 'deleted' : (statusFilter !== 'all' ? statusFilter : undefined)
    }),
    placeholderData: (prev) => prev,
  })

  const categories: Category[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: categories.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (fd: FormData) => categoryService.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      closeModal()
      toast.success(t('toast.created', { item: t('products.colCategory', 'Category') }))
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t('toast.error')
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => {
      fd.append('_method', 'PUT')
      return categoryService.update(id, fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      closeModal()
      toast.success(t('toast.updated', { item: t('products.colCategory', 'Category') }))
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t('toast.error')
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      toast.success(t('toast.deleted', { item: t('products.colCategory', 'Category') }))
      setDeleteTarget(null)
      adjustAfterDelete(categories.length)
      setSelectedRows(r => r.filter(x => x !== deleteTarget?.id))
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t('toast.error')
      toast.error(msg)
      setDeleteTarget(null)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => categoryService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      toast.success(t('toast.restored'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.forceDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      toast.success(t('toast.deleted'))
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
      setDeleteTarget(null)
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => categoryService.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      toast.success(t('toast.deleted'))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const bulkRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => categoryService.bulkRestore(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
      toast.success(t('toast.restored'))
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    }
  })

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormErrors({})
    setName('')
    setParentId('')
    setDescription('')
    setSortOrder('0')
    setIsActive(true)
    setImageMode('upload')
    setImageUrl('')
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(false)
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setFormErrors({})
    setName(cat.name)
    setParentId(cat.parent_id ? String(cat.parent_id) : '')
    setDescription(cat.description ?? '')
    setSortOrder(String(cat.sort_order ?? 0))
    setIsActive(cat.is_active)
    setImageFile(null)
    setImageMode(cat.image?.startsWith('http') ? 'url' : 'upload')
    setImageUrl(cat.image?.startsWith('http') ? cat.image : '')
    setRemoveImage(false)
    if (cat.image) {
      setImagePreview(getAbsoluteImageUrl(cat.image))
    } else {
      setImagePreview(null)
    }
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCategory(null)
    setFormErrors({})
    setRemoveImage(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setRemoveImage(false)
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('products.errors.categoryNameRequired', 'Please enter category name')
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
    if (parentId) fd.append('parent_id', parentId)
    fd.append('description', description)
    fd.append('sort_order', sortOrder)
    fd.append('is_active', isActive ? '1' : '0')
    if (imageFile) {
      fd.append('image_file', imageFile)
    } else if (imageUrl) {
      fd.append('image', imageUrl)
    } else if (removeImage) {
      fd.append('remove_image', '1')
      fd.append('image', '')
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, fd })
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
      await categoryService.import(fd)
      toast.success(t('toast.importSuccess'))
      setImportOpen(false)
      setImportFile(null)
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['categories-list-dropdown'] })
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('toast.importError'))
    } finally {
      setImporting(false)
    }
  }

  const handleExport = () => {
    categoryService.export()
      .then(res => {
        const blob = new Blob(['\uFEFF', res.data], { type: 'text/csv;charset=utf-8;' })
        const dateStamp = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `categories_export_${dateStamp}.csv`)
        toast.success(t('toast.exportSuccess'))
      })
      .catch(() => toast.error(t('toast.exportError')))
  }

  // Construct Tree structure if not in search or recycle bin
  const buildTree = (flatList: Category[]): TreeCategory[] => {
    const map: Record<number, TreeCategory> = {}
    const roots: TreeCategory[] = []
    
    flatList.forEach(item => {
      map[item.id] = { ...item, children: [] }
    })
    
    flatList.forEach(item => {
      const mapped = map[item.id]
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children?.push(mapped)
      } else {
        roots.push(mapped)
      }
    })
    
    const sortTree = (nodes: TreeCategory[]) => {
      nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      nodes.forEach(node => {
        if (node.children) {
          sortTree(node.children)
        }
      })
    }
    sortTree(roots)
    return roots
  }

  const isTreeView = !debouncedSearch && !recycleBinMode
  const treeData = buildTree(categories)

  const toggleNode = (id: number) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getLocalizedName = (catName: string) => {
    const lang = language || i18n.language || 'en'
    if (lang === 'en') return null
    return CATEGORY_NAMES_LOCALE[catName]?.[lang] || null
  }

  // Render Row Helper
  const renderCategoryRow = (node: TreeCategory | Category, depth = 0, isTree = false) => {
    const hasChildren = (node as TreeCategory).children && (node as TreeCategory).children!.length > 0
    const isExpanded = expandedNodes[node.id] ?? true
    const visuals = getCategoryVisuals(node.name)
    const localized = getLocalizedName(node.name)

    return (
      <tr key={node.id} className="group hover:bg-muted/30 border-b border-border/40 transition-colors">
        {/* Checkbox */}
        <td className="w-12 text-center py-3.5">
          <input
            type="checkbox"
            checked={selectedRows.includes(node.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(prev => [...prev, node.id])
              } else {
                setSelectedRows(prev => prev.filter(id => id !== node.id))
              }
            }}
            className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary"
          />
        </td>

        {/* Category Image & Name */}
        {visibleColumns.category !== false && (
          <td className="py-3.5 pr-4">
            <div className="flex items-center gap-3.5" style={{ paddingLeft: isTree ? `${depth * 24}px` : undefined }}>
              {isTree && hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : isTree && depth > 0 ? (
                <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/40 shrink-0 font-bold">↳</div>
              ) : null}

              {/* Category Image Avatar */}
              <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-border/80 overflow-hidden shrink-0 shadow-2xs group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300 p-1 flex items-center justify-center">
                <img
                  src={getAbsoluteImageUrl(node.image) || DEFAULT_CATEGORY_IMAGE}
                  alt={node.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-115"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (!target.src.endsWith(DEFAULT_CATEGORY_IMAGE)) {
                      target.src = DEFAULT_CATEGORY_IMAGE
                    }
                  }}
                />
              </div>

              {/* Name + Localized translation subtext */}
              <div className="min-w-0 flex flex-col">
                <span className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                  {language !== 'en' && localized ? localized : node.name}
                </span>
                <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                  {language !== 'en' ? node.name : t('products.colCategory', 'Category')}
                </span>
              </div>
            </div>
          </td>
        )}

        {/* Parent Category */}
        {visibleColumns.parent !== false && (
          <td className="py-3.5 px-3">
            {node.parent ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <FolderTree size={12} />
                {node.parent.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-muted/70 text-muted-foreground border border-border/50">
                <Folder size={12} />
                {t('products.rootCategory', 'Root')}
              </span>
            )}
          </td>
        )}

        {/* Slug */}
        {visibleColumns.slug !== false && (
          <td className="py-3.5 px-3">
            <span className="font-mono text-xs text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-lg border border-border/40">
              /{node.slug}
            </span>
          </td>
        )}

        {/* Products Count */}
        {visibleColumns.products_count !== false && (
          <td className="py-3.5 px-3 text-center">
            <button
              onClick={() => navigate(`/products?tab=products&category_id=${node.id}`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Filter products by this category"
            >
              <Package size={13} />
              <span>{node.products_count ?? 0}</span>
              <span className="text-[11px] opacity-80">{t('products.itemsCount', 'Items')}</span>
            </button>
          </td>
        )}

        {/* Description */}
        {visibleColumns.description !== false && (
          <td className="py-3.5 px-3">
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]" title={node.description ?? ''}>
              {node.description || '—'}
            </span>
          </td>
        )}

        {/* Sort Order */}
        {visibleColumns.sort_order !== false && (
          <td className="py-3.5 px-3 text-center">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-muted text-xs font-bold text-foreground border border-border/60 shadow-2xs">
              #{node.sort_order ?? 0}
            </span>
          </td>
        )}

        {/* Status */}
        {visibleColumns.status !== false && (
          <td className="py-3.5 px-3">
            <StatusBadge status={node.is_active} />
          </td>
        )}

        {/* Actions */}
        <td className="py-3.5 pr-4 text-right">
          {recycleBinMode ? (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => restoreMutation.mutate(node.id)}
                className="p-1.5 hover:bg-muted rounded-lg text-indigo-500 hover:text-indigo-600 transition-colors"
                title="Restore"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setDeleteTarget(node)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                title="Permanent Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <TableActionMenu
              onEdit={() => openEditModal(node)}
              onDelete={() => setDeleteTarget(node)}
            />
          )}
        </td>
      </tr>
    )
  }

  // Render tree rows recursively
  const renderTreeRows = (nodes: TreeCategory[], depth = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = []
    nodes.forEach(node => {
      const isExpanded = expandedNodes[node.id] ?? true
      const hasChildren = node.children && node.children.length > 0
      rows.push(renderCategoryRow(node, depth, true))
      if (hasChildren && isExpanded) {
        rows = rows.concat(renderTreeRows(node.children!, depth + 1))
      }
    })
    return rows
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: t('nav.group.productInventory') }, { label: t('nav.categories') }]} />

          <PageHeader
            icon={<FolderTree size={24} />}
            title={t('nav.categories')}
            subtitle={t('pageContent.categoriesConfigured', { count: pagination.total, defaultValue: `${pagination.total} categories configured` })}
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
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                >
                  <Download size={15} />
                  {t('products.exportCSV')}
                </button>

                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                >
                  <Upload size={15} />
                  {t('products.importCSV')}
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white
                             bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Plus size={16} />
                  {t('products.addCategory')}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  <RefreshCw size={13} />
                  {t('products.restoreSelected')}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Permanently delete selected categories? This cannot be undone.')) {
                      selectedRows.forEach(id => forceDeleteMutation.mutate(id))
                      setSelectedRows([])
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-xs"
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
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
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
        searchPlaceholder={t('products.searchCategories', 'Search categories...')}
        onReset={() => {
          setSearch('')
          setStatusFilter('all')
          setSortBy('sort_order')
          setSortOrderField('asc')
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
        onRefresh={() => qc.invalidateQueries({ queryKey: ['categories'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'category', label: t('products.colCategory', 'Category') },
          { key: 'parent', label: t('products.parentCategory', 'Parent') },
          { key: 'slug', label: t('products.colSlug', 'Slug') },
          { key: 'products_count', label: t('products.productsCount', 'Products') },
          { key: 'description', label: t('products.colDescription', 'Description') },
          { key: 'sort_order', label: t('products.colSortOrder', 'Sort Order') },
          { key: 'status', label: t('products.colStatus', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Categories Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="w-12 text-center py-3.5">
                  <input
                    type="checkbox"
                    checked={categories.length > 0 && selectedRows.length === categories.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(categories.map(c => c.id))
                      } else {
                        setSelectedRows([])
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary"
                  />
                </th>
                {visibleColumns.category !== false && (
                  <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 font-semibold">
                    {t('products.colCategory', 'Category')} {renderSortIcon('name')}
                  </th>
                )}
                {visibleColumns.parent !== false && (
                  <th onClick={() => handleSort('parent_id')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 font-semibold">
                    {t('products.parentCategory', 'Parent')} {renderSortIcon('parent_id')}
                  </th>
                )}
                {visibleColumns.slug !== false && (
                  <th onClick={() => handleSort('slug')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 font-semibold">
                    {t('products.colSlug', 'Slug')} {renderSortIcon('slug')}
                  </th>
                )}
                {visibleColumns.products_count !== false && (
                  <th className="text-center py-3.5 font-semibold">
                    {t('products.productsCount', 'Products')}
                  </th>
                )}
                {visibleColumns.description !== false && (
                  <th onClick={() => handleSort('description')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 font-semibold">
                    {t('products.colDescription', 'Description')} {renderSortIcon('description')}
                  </th>
                )}
                {visibleColumns.sort_order !== false && (
                  <th onClick={() => handleSort('sort_order')} className="text-center cursor-pointer hover:bg-muted/65 select-none py-3.5 w-24 font-semibold">
                    {t('products.colSortOrder', 'Sort')} {renderSortIcon('sort_order')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted/65 select-none py-3.5 w-28 font-semibold">
                    {t('products.colStatus', 'Status')} {renderSortIcon('is_active')}
                  </th>
                )}
                <th className="text-right pr-4 py-3.5 select-none w-24 font-semibold">
                  {t('products.colActions', 'Actions')}
                </th>
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
                          <div className="skeleton h-3 w-20 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5"><div className="skeleton h-6 w-20 rounded-xl" /></td>
                    <td className="py-3.5"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-16 rounded-xl mx-auto" /></td>
                    <td className="py-3.5"><div className="skeleton h-4 w-40 rounded" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-10 rounded-lg mx-auto" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-16 rounded-full" /></td>
                    <td className="py-3.5"><div className="skeleton h-6 w-8 rounded-lg ml-auto pr-4" /></td>
                  </tr>
                ))
              ) : isTreeView ? (
                renderTreeRows(treeData)
              ) : (
                categories.map((cat) => renderCategoryRow(cat, 0, false))
              )}
              {!isLoading && categories.length === 0 && (
                <EmptyState cols={9} />
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

      {/* Clean Enterprise Category Create/Edit Modal */}
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
                title={editingCategory ? t('pageContent.Edit Category', 'Edit Category') : t('products.addCategory', 'Add Category')}
                subtitle={editingCategory ? t('products.editCategoryDesc', 'Modify category attributes, parent relation and media') : t('products.addCategoryDesc', 'Create a new catalog category for organizing products')}
                icon={<Folder size={20} />}
                iconVariant="blue"
                onClose={closeModal}
              />

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.colCategory', 'Category Name')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      handleClearError('name')
                    }}
                    placeholder={t('products.categoryNamePlaceholder', 'e.g. Smartphones, Laptops, Keyboards...')}
                    className={getFieldClass(
                      formErrors.name,
                      'form-input text-sm rounded-xl py-2.5 px-3.5 bg-background border border-border/80 transition-all font-medium'
                    )}
                  />
                  <FieldError error={formErrors.name} />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    {t('products.parentCategory', 'Parent Category')}
                  </label>
                  <ModernSelect
                    value={parentId}
                    onChange={(val) => setParentId(String(val))}
                    options={[
                      { value: '', label: t('products.rootCategoryOption', 'Root Level (No Parent)') },
                      ...dropdownCats
                        .filter(c => !editingCategory || (c.id !== editingCategory.id && c.parent_id !== editingCategory.id))
                        .map(c => ({ value: c.id, label: c.name })),
                    ]}
                    placeholder={t('products.parentCategoryPlaceholder', 'Select parent category')}
                    buttonClassName="font-normal text-sm border-border/80 bg-background cursor-pointer rounded-xl py-2.5"
                  />
                </div>

                {/* Sort Order & Status Compact Card */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/25 border border-border/60 items-center">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {t('products.sortOrder', 'Sort Order')}
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      min="0"
                      className="form-input text-xs rounded-xl py-1.5 px-3 bg-background border-border/80"
                    />
                  </div>

                  <div className="flex items-center justify-between pl-3 border-l border-border/50">
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
                </div>

                {/* Clean Image / Media Card */}
                <div className="p-4 rounded-2xl bg-muted/25 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                      {t('products.categoryImage', 'Category Image / Cover')}
                    </label>
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageMode === 'upload' ? 'bg-card text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('products.uploadFileTab', 'Upload')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageMode === 'url' ? 'bg-card text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('products.imageUrlTab', 'URL')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3.5">
                    {/* Visual Preview Box */}
                    <div className="w-16 h-16 rounded-2xl border border-border/80 overflow-hidden bg-background flex items-center justify-center shrink-0 shadow-2xs relative group p-1">
                      {imagePreview ? (
                        <AntImage
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                          fallback={DEFAULT_CATEGORY_IMAGE}
                        />
                      ) : (
                        <img
                          src={DEFAULT_CATEGORY_IMAGE}
                          alt="Default Category"
                          className="w-full h-full object-contain opacity-70"
                        />
                      )}
                    </div>

                    {/* Mode Inputs */}
                    <div className="flex-grow space-y-1.5 min-w-0">
                      {imageMode === 'upload' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="clean-category-image-upload"
                          />
                          <label
                            htmlFor="clean-category-image-upload"
                            className="inline-flex items-center justify-center px-3.5 py-1.5 border border-border/80 rounded-xl text-xs font-semibold text-foreground bg-background hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                          >
                            <Upload size={13} className="mr-1.5" />
                            {t('products.uploadImage', 'Choose File')}
                          </label>

                          {imagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null)
                                setImagePreview(null)
                                setImageUrl('')
                                setRemoveImage(true)
                              }}
                              className="px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                            >
                              {t('common.remove', 'Remove')}
                            </button>
                          )}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value)
                            if (e.target.value) {
                              setImagePreview(e.target.value)
                              setRemoveImage(false)
                            } else if (!imageFile) {
                              setImagePreview(null)
                            }
                          }}
                          placeholder={t('products.pasteImageUrl', 'Paste image URL (https://...)')}
                          className="form-input text-xs rounded-xl py-1.5 px-3 bg-background border-border/80 w-full"
                        />
                      )}
                      <p className="text-[10px] text-muted-foreground">{t('products.imageRecommendation', 'Recommended 400x400 JPG, PNG or WebP')}</p>
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
                    placeholder={t('products.categoryDescPlaceholder', 'Short overview about products in this category...')}
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:opacity-90 shadow-md shadow-primary/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>{editingCategory ? t('common.save', 'Save Changes') : t('products.addCategory', 'Create Category')}</span>
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
                subtitle={t('products.categoriesImportInstruction', 'Upload CSV file to import categories in bulk')}
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
                    id="csv-file-upload"
                    required
                  />
                  <label htmlFor="csv-file-upload" className="cursor-pointer font-medium text-primary hover:underline">
                    {importFile ? importFile.name : t('products.clickToUploadCSV', 'Click to upload CSV')}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{t('products.categoriesImportInstruction', 'CSV format: Name, Parent, Description')}</p>
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
        title="categories.deleteTitle"
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
        title={t('categories.bulkDeleteTitle', 'Delete Selected Categories')}
        message={t('categories.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected categories? This action cannot be undone.`
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

export default CategoriesPage
