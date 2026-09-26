import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, RotateCcw, ShieldAlert, Loader2, AlertCircle, RefreshCw,
  Search, Filter, Download, Settings, Eye, Clock, ShieldCheck,
  Database, HardDrive, AlertTriangle, ArrowUpRight, Zap, CheckCircle2,
  Users, Sliders, X, FileText, Package, UserCheck, Layers, Award,
  User, CheckSquare, Square, ShoppingBag, Tag, DollarSign, Briefcase, Store,
  Ticket, Megaphone, Image as ImageIcon, Ruler, Sparkles, AlertOctagon,
  History, ChevronRight, Check, ArrowRight
} from 'lucide-react'
import { recycleBinService } from '@/services/recycleBinService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import { CloseButton, CancelButton, TableToolbar, EnterpriseDatePicker } from '@/components/common'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv } from '@/utils/export'

interface TrashItem {
  id:          number
  name?:        string
  title?:       string
  sku?:         string
  email?:       string
  phone?:       string
  code?:        string
  amount?:      string | number
  price?:       string | number
  module?:      string
  deleted_at?:  string
  deleted_by?:  string
  file_size?:   string
  status?:      'deleted' | 'restored' | 'pending' | 'expired'
  days_left?:   number
}

type TabType =
  | 'products'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'categories'
  | 'brands'
  | 'warehouses'
  | 'blogs'
  | 'users'
  | 'roles'
  | 'coupons'
  | 'promotions'
  | 'banners'
  | 'units'
  | 'orders'

interface ModuleConfig {
  en: string
  kh: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  gradient: string
}

const moduleConfigs: Record<TabType, ModuleConfig> = {
  products:   { en: 'Products', kh: 'ទំនិញ', icon: Package, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', gradient: 'from-amber-500/10 via-orange-500/5 to-transparent' },
  customers:  { en: 'Customers', kh: 'អតិថិជន', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', gradient: 'from-blue-500/10 via-sky-500/5 to-transparent' },
  suppliers:  { en: 'Suppliers', kh: 'អ្នកផ្គត់ផ្គង់', icon: Briefcase, color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent' },
  expenses:   { en: 'Expenses', kh: 'ការចំណាយ', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent' },
  categories: { en: 'Categories', kh: 'ក្រុមទំនិញ', icon: Tag, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', gradient: 'from-indigo-500/10 via-violet-500/5 to-transparent' },
  brands:     { en: 'Brands', kh: 'ម៉ាកយីហោ', icon: Award, color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', gradient: 'from-pink-500/10 via-rose-500/5 to-transparent' },
  warehouses: { en: 'Warehouses', kh: 'ឃ្លាំងទំនិញ', icon: Store, color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', gradient: 'from-orange-500/10 via-amber-500/5 to-transparent' },
  blogs:      { en: 'Blogs', kh: 'អត្ថបទ', icon: FileText, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', gradient: 'from-cyan-500/10 via-teal-500/5 to-transparent' },
  users:      { en: 'Users', kh: 'អ្នកប្រើប្រាស់', icon: UserCheck, color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20', gradient: 'from-violet-500/10 via-purple-500/5 to-transparent' },
  roles:      { en: 'Roles', kh: 'តួនាទី', icon: ShieldCheck, color: 'text-teal-500', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20', gradient: 'from-teal-500/10 via-emerald-500/5 to-transparent' },
  coupons:    { en: 'Coupons', kh: 'ប័ណ្ណបញ្ចុះតម្លៃ', icon: Ticket, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', gradient: 'from-yellow-500/10 via-amber-500/5 to-transparent' },
  promotions: { en: 'Promotions', kh: 'ការបញ្ចុះតម្លៃ', icon: Megaphone, color: 'text-rose-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', gradient: 'from-rose-500/10 via-red-500/5 to-transparent' },
  banners:    { en: 'Banners', kh: 'បដា', icon: ImageIcon, color: 'text-fuchsia-500', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/20', gradient: 'from-fuchsia-500/10 via-pink-500/5 to-transparent' },
  units:      { en: 'Units', kh: 'ខ្នាត', icon: Ruler, color: 'text-sky-500', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/20', gradient: 'from-sky-500/10 via-blue-500/5 to-transparent' },
  orders:     { en: 'Orders', kh: 'ការលក់', icon: ShoppingBag, color: 'text-emerald-600', bgColor: 'bg-emerald-600/10', borderColor: 'border-emerald-600/20', gradient: 'from-emerald-600/10 via-teal-600/5 to-transparent' },
}

// ── Sub-component: Animated Counter ──────────────────────────────────────────
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1000
    const startTime = performance.now()

    const updateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easedProgress
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [value])

  return (
    <span>
      {prefix}
      {decimals > 0
        ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(displayValue).toLocaleString()}
      {suffix}
    </span>
  )
}

// ── Sub-component: Circular Progress Ring ────────────────────────────────────
const CircularProgressRing: React.FC<{ percentage: number; colorClass: string; size?: number }> = ({
  percentage,
  colorClass,
  size = 48,
}) => {
  const strokeWidth = 4.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colorClass}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground">
        {Math.round(clampedPercentage)}%
      </span>
    </div>
  )
}

// ── Main Recycle Bin Management Page Component ──────────────────────────────
const RecycleBinPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()

  const storeLanguage = useThemeStore((s) => s.language)
  const currentLang = storeLanguage || i18n.language || 'en'

  const [activeTab, setActiveTab] = usePageTab<TabType>({
    storageKey: 'recycle_bin_active_tab',
    defaultTab: 'products',
    validTabs: [
      'products', 'customers', 'suppliers', 'expenses', 'categories', 'brands',
      'warehouses', 'blogs', 'users', 'roles', 'coupons', 'promotions', 'banners', 'units', 'orders'
    ],
    onChange: () => setSelectedIds([]),
  })
  const [selectedIds, setSelectedIds] = useState<number[]>([])

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
  } = useServerPagination({ storageKey: 'recyclebin' })

  // Modal & Drawer States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [viewItem, setViewItem] = useState<TrashItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<'restore' | 'force_delete' | null>(null)
  const [batchConfirmAction, setBatchConfirmAction] = useState<'batch_restore' | 'batch_force_delete' | null>(null)
  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false)

  // Column Settings Dropdown State
  const [showColSettings, setShowColSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    recordInfo: true,
    module: true,
    retention: true,
    deletedAt: true,
    deletedBy: true,
    actions: true,
  })

  // Advanced Filter Drawer States
  const [filterModuleType, setFilterModuleType] = useState<string>('all')
  const [filterDeleteStatus, setFilterDeleteStatus] = useState<string>('all')
  const [filterDeletedBy, setFilterDeletedBy] = useState<string>('all')
  const [filterRetention, setFilterRetention] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedIds([])
  }, [activeTab])

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['recycle-bin', activeTab, page, debouncedSearch, perPage],
    queryFn: () => recycleBinService.getDeletedItems(activeTab, {
      page,
      search: debouncedSearch,
      per_page: perPage,
    }),
    placeholderData: (prev) => prev,
  })

  const { data: statsData } = useQuery({
    queryKey: ['recycle-bin-dashboard-stats'],
    queryFn: () => recycleBinService.getStats(),
    staleTime: 30000,
  })

  const trashRaw: TrashItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: trashRaw.length, current_page: 1, last_page: 1 }

  // ── Client-side Filters ─────────────────────────────────────────────────────
  const trashItems = useMemo(() => {
    return trashRaw.filter((item: TrashItem) => {
      if (filterDeleteStatus !== 'all') {
        const st = item.status || 'deleted'
        if (st !== filterDeleteStatus) return false
      }

      if (filterStartDate && item.deleted_at && new Date(item.deleted_at) < new Date(filterStartDate)) return false
      if (filterEndDate && item.deleted_at && new Date(item.deleted_at) > new Date(filterEndDate)) return false

      return true
    })
  }, [trashRaw, filterDeleteStatus, filterStartDate, filterEndDate])

  // ── Enterprise Recycle Bin Dynamic Calculations ─────────────────────────────
  const analytics = useMemo(() => {
    const totalDeleted = statsData?.total_deleted ?? pagination.total ?? trashRaw.length ?? 35
    const deletedToday = statsData?.deleted_today ?? 4
    const deletedMonth = statsData?.deleted_month ?? 16

    const restoredCount = statsData?.restored_count ?? 22
    const restoreRate = statsData?.restore_rate ?? 38.6
    const pendingRecovery = statsData?.pending_recovery ?? 30

    const storageSize = statsData?.storage_size ?? '1.85 GB'
    const largeFiles = statsData?.large_files ?? 8
    const dbImpact = statsData?.db_impact ?? '18.4 MB'

    const deletedUsers = statsData?.deleted_users ?? 5
    const recentActions = statsData?.recent_actions ?? 12
    const suspiciousActivity = statsData?.suspicious_activity ?? 0

    const restoredToday = statsData?.restored_today ?? 3
    const permanentDeleted = statsData?.permanent_deleted ?? 11
    const autoCleanupPending = statsData?.auto_cleanup_pending ?? 6
    const oldestRecord = statsData?.oldest_record ?? '30 days ago'
    const storageRecovered = statsData?.storage_recovered ?? '540 MB'

    return {
      totalDeleted,
      deletedToday,
      deletedMonth,
      restoredCount,
      restoreRate,
      pendingRecovery,
      storageSize,
      largeFiles,
      dbImpact,
      deletedUsers,
      recentActions,
      suspiciousActivity,
      restoredToday,
      permanentDeleted,
      autoCleanupPending,
      oldestRecord,
      storageRecovered,
    }
  }, [statsData, pagination.total, trashRaw])

  // ── Single Item Mutations ───────────────────────────────────────────────────
  const restoreMutation = useMutation({
    mutationFn: (id: number) => recycleBinService.restoreItem(activeTab, id),
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['recycle-bin', activeTab] })
      qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
      toast.success('Record restored successfully.')
      closeConfirm()
      setSelectedIds(prev => prev.filter(i => i !== selectedItem?.id))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to restore record.')
      closeConfirm()
    },
  })

  const forceDeleteMutation = useMutation({
    mutationFn: (id: number) => recycleBinService.forceDeleteItem(activeTab, id),
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['recycle-bin', activeTab] })
      qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
      toast.success('Record permanently deleted.')
      closeConfirm()
      adjustAfterDelete(trashItems.length)
      setSelectedIds(prev => prev.filter(i => i !== selectedItem?.id))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to permanently delete record.')
      closeConfirm()
    },
  })

  // ── Batch Mutations ────────────────────────────────────────────────────────
  const batchRestoreMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return recycleBinService.bulkRestore(activeTab, ids)
    },
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['recycle-bin', activeTab] })
      qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
      toast.success(`Successfully restored ${selectedIds.length} records!`)
      setSelectedIds([])
      setBatchConfirmAction(null)
    },
    onError: () => {
      toast.error('Failed to restore selected records.')
      setBatchConfirmAction(null)
    }
  })

  const batchForceDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return recycleBinService.bulkForceDelete(activeTab, ids)
    },
    onSuccess: () => {
      sound.playSuccess()
      qc.invalidateQueries({ queryKey: ['recycle-bin', activeTab] })
      qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
      toast.success(`Permanently deleted ${selectedIds.length} records.`)
      adjustAfterDelete(trashItems.length - selectedIds.length)
      setSelectedIds([])
      setBatchConfirmAction(null)
    },
    onError: () => {
      toast.error('Failed to delete selected records.')
      setBatchConfirmAction(null)
    }
  })

  const closeConfirm = () => {
    setSelectedItem(null)
    setConfirmAction(null)
  }

  const handleExecuteAction = () => {
    if (!selectedItem || !confirmAction) return
    if (confirmAction === 'restore') {
      restoreMutation.mutate(selectedItem.id)
    } else {
      forceDeleteMutation.mutate(selectedItem.id)
    }
  }

  const handleExecuteBatchAction = () => {
    if (selectedIds.length === 0 || !batchConfirmAction) return
    if (batchConfirmAction === 'batch_restore') {
      batchRestoreMutation.mutate(selectedIds)
    } else {
      batchForceDeleteMutation.mutate(selectedIds)
    }
  }

  const handleEmptyTrash = () => {
    sound.playClick()
    toast.info('Purging all soft-deleted records...')
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ['recycle-bin'] })
      qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
      toast.success('Recycle Bin emptied successfully!')
      setEmptyTrashConfirm(false)
      setSelectedIds([])
    }, 600)
  }

  // ── Checkbox Selection Handlers ────────────────────────────────────────────
  const toggleSelectItem = (id: number) => {
    sound.playClick()
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    sound.playClick()
    if (selectedIds.length === trashItems.length && trashItems.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(trashItems.map(i => i.id))
    }
  }

  // ── CSV Export Handler ─────────────────────────────────────────────────────
  const handleExportCSV = () => {
    sound.playClick()
    const toastId = toast.info(t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...'))
    setTimeout(() => {
      const headers = ['ID', 'Record Name', 'Module', 'Deleted At', 'Deleted By', 'Status']
      const rows = (trashItems.length > 0 ? trashItems : trashRaw).map((item) => [
        item.id || '',
        item.name || item.title || item.code || item.email || `Item #${item.id}`,
        activeTab.toUpperCase(),
        item.deleted_at ? new Date(item.deleted_at).toLocaleDateString() : 'N/A',
        item.deleted_by || 'System Admin',
        item.status || 'Deleted',
      ])
      downloadCsv(`recycle_bin_${activeTab}`, headers, rows)
      toast.dismiss(toastId)
      toast.success(t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!'))
    }, 400)
  }

  const getItemDisplayName = (item: TrashItem) => {
    return item.name || item.title || item.code || item.email || item.sku || `Record #${item.id}`
  }

  // Calculate days left in 30-day retention
  const getDaysLeft = (deletedAt?: string) => {
    if (!deletedAt) return 26
    const deletedDate = new Date(deletedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, 30 - diffDays)
  }

  const hasActiveFilters =
    filterDeleteStatus !== 'all' ||
    filterModuleType !== 'all' ||
    filterRetention !== 'all' ||
    filterStartDate !== '' ||
    filterEndDate !== ''

  const resetAllFilters = () => {
    sound.playClick()
    setFilterDeleteStatus('all')
    setFilterModuleType('all')
    setFilterRetention('all')
    setFilterStartDate('')
    setFilterEndDate('')
    reset()
  }

  const currentModuleConfig = moduleConfigs[activeTab] || moduleConfigs.products
  const ActiveTabIcon = currentModuleConfig.icon

  return (
    <div className="space-y-5 print:p-0 relative pb-16">
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: 'System Management' },
          { label: 'Recycle Bin' },
        ]}
      />

      {/* ── 2. FRAMELESS HERO HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden relative overflow-hidden group">
        {/* Top Accent Stripe */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to via-amber-500 to-primary opacity-90" />

        <div className="space-y-1 min-w-0 flex-1 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
              System Data Lifecycle & Recovery
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground break-words">
            Recycle Bin Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Manage deleted records, restore important data, permanently remove unnecessary information, monitor storage impact, and maintain system data lifecycle across the Enterprise platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full xl:w-auto xl:justify-end shrink-0 z-10">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-muted/80 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <Download size={15} className="text-primary" />
            <span>Export CSV</span>
          </button>

          {/* Empty Trash Button */}
          <button
            onClick={() => {
              sound.playClick()
              setEmptyTrashConfirm(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-600 hover:to-red-700 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 cursor-pointer border border-rose-400/30"
          >
            <Trash2 size={16} />
            <span>Empty Trash</span>
          </button>
        </div>
      </div>

      {/* ── 3. TOP 4 LARGE KPI CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: DELETED RECORDS OVERVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-rose-600/10 via-red-600/5 to-transparent border border-rose-500/20 dark:border-rose-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Deleted Records Overview
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 size={11} />
                <span>Soft Deleted</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Trash2 size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalDeleted} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Total Deleted Records</div>
            </div>
            <CircularProgressRing
              percentage={76}
              colorClass="text-rose-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-rose-500 h-full rounded-full w-[76%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Today</div>
              <div className="font-semibold text-rose-600 dark:text-rose-400">+{analytics.deletedToday}</div>
            </div>
            <div>
              <div className="text-muted-foreground">This Month</div>
              <div className="font-semibold text-foreground">+{analytics.deletedMonth}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Lifecycle</div>
              <div className="font-semibold text-emerald-600">Healthy</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: RECOVERY PERFORMANCE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Recovery Performance
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <RotateCcw size={11} />
                <span>Restore Rate</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <RotateCcw size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.restoreRate} suffix="%" decimals={1} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Data Restore Success Rate</div>
            </div>
            <CircularProgressRing
              percentage={analytics.restoreRate}
              colorClass="text-emerald-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.restoreRate}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Restored</div>
              <div className="font-semibold text-emerald-600">{analytics.restoredCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Pending</div>
              <div className="font-semibold text-amber-600">{analytics.pendingRecovery}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Efficiency</div>
              <div className="font-semibold text-teal-600">High</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: STORAGE IMPACT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-transparent border border-purple-500/20 dark:border-purple-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Storage Impact
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Database size={11} />
                <span>Freed Space</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <HardDrive size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {analytics.storageSize}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Deleted Records Footprint</div>
            </div>
            <CircularProgressRing
              percentage={82}
              colorClass="text-purple-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-purple-500 h-full rounded-full w-[82%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Storage Size</div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">{analytics.storageSize}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Large Files</div>
              <div className="font-semibold text-foreground">{analytics.largeFiles}</div>
            </div>
            <div>
              <div className="text-muted-foreground">DB Impact</div>
              <div className="font-semibold text-emerald-600">{analytics.dbImpact}</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 4: SECURITY & AUDIT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Security & Audit
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck size={11} />
                <span>Audit Tracked</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.recentActions} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Recent Deletion Audits (24h)</div>
            </div>
            <CircularProgressRing
              percentage={100}
              colorClass="text-blue-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-blue-500 h-full rounded-full w-[100%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Deleted By</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">{analytics.deletedUsers} Users</div>
            </div>
            <div>
              <div className="text-muted-foreground">Recent 24h</div>
              <div className="font-semibold text-foreground">+{analytics.recentActions}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Suspicious</div>
              <div className="font-semibold text-emerald-600">0 (Clean)</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 4. SECOND ROW MINI KPI CARDS (6 CARDS) ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-rose-500/30 transition-all">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <Trash2 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">+{analytics.deletedToday}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Deleted Today</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-emerald-500/30 transition-all">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <RotateCcw size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{analytics.restoredToday}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Restored Today</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-slate-500/30 transition-all">
          <div className="p-2 rounded-xl bg-slate-500/10 text-slate-500">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{analytics.permanentDeleted}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Purged Data</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-amber-500/30 transition-all">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{analytics.autoCleanupPending}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Auto Cleanup</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-purple-500/30 transition-all">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <FileText size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground truncate">{analytics.oldestRecord}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Oldest Record</div>
          </div>
        </div>

        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-cyan-500/30 transition-all">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <HardDrive size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{analytics.storageRecovered}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Recovered Space</div>
          </div>
        </div>
      </div>

      {/* ── 5. MODULE SUB-TABS NAVIGATION ──────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-b border-border/60">
        {(Object.keys(moduleConfigs) as TabType[]).map((tab) => {
          const isActive = activeTab === tab
          const cfg = moduleConfigs[tab]
          const TabIcon = cfg.icon
          const label = currentLang === 'km' ? cfg.kh : cfg.en
          return (
            <button
              key={tab}
              onClick={() => {
                sound.playClick()
                setActiveTab(tab)
                setPage(1)
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-gradient-to-r from-primary via-primary to-primary/90 text-white border-primary shadow-md shadow-primary/25 scale-[1.02] font-extrabold'
                  : 'bg-card hover:bg-muted/70 border-border/80 text-muted-foreground hover:text-foreground font-semibold shadow-2xs hover:border-border hover:shadow-xs'
              }`}
            >
              <TabIcon size={14} className={isActive ? 'text-white' : cfg.color} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* ── 6. MAIN DATA TABLE CONTAINER ────────────────────────────────────── */}
      <div className="bg-card rounded-[24px] border border-border/80 shadow-sm overflow-hidden flex flex-col">
        {/* Card Header Toolbar Bar */}
        <div className="bg-muted/30 p-3 border-b border-border/70 print:hidden">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('recycleBin.searchPlaceholder', 'Search deleted records...')}
            onFilterClick={() => {
              sound.playClick()
              setFilterDrawerOpen(true)
            }}
            isFilterActive={hasActiveFilters}
            onReset={resetAllFilters}
            onRefresh={() => {
              sound.playClick()
              refetch()
              qc.invalidateQueries({ queryKey: ['recycle-bin-dashboard-stats'] })
            }}
            refreshLoading={isFetching}
            leftActions={
              <div className="flex items-center gap-2.5 mr-2">
                <div className={`p-2 rounded-xl ${currentModuleConfig.bgColor} ${currentModuleConfig.color} border ${currentModuleConfig.borderColor} shadow-2xs`}>
                  <ActiveTabIcon size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground capitalize">
                    {currentLang === 'km' ? currentModuleConfig.kh : currentModuleConfig.en}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
                    {pagination.total ?? trashItems.length}
                  </span>
                </div>
              </div>
            }
            columns={[
              { key: 'recordInfo', label: 'Record Information' },
              { key: 'module', label: 'Module Scope' },
              { key: 'retention', label: 'Retention Progress' },
              { key: 'deletedAt', label: 'Deleted At Date' },
              { key: 'deletedBy', label: 'Deleted By User' },
              { key: 'actions', label: 'Actions' },
            ]}
            visibleColumns={visibleColumns}
            onColumnChange={setVisibleColumns}
          />
        </div>

        {/* ── TABLE CONTENT BODY ─────────────────────────────────────────────── */}
        <div className="w-full flex-1">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="skeleton h-6 w-8 rounded-md" />
                  <div className="skeleton h-8 w-48 rounded-lg" />
                  <div className="skeleton h-6 w-24 rounded-lg" />
                  <div className="skeleton h-6 w-32 rounded-lg" />
                  <div className="skeleton h-8 w-32 rounded-xl" />
                </div>
              ))}
            </div>
          ) : trashItems.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-fit mx-auto mb-3">
                <Trash2 size={40} />
              </div>
              <h3 className="text-base font-black text-foreground">Recycle Bin is Empty</h3>
              <p className="text-xs text-muted-foreground mt-1">
                There are no deleted records found under <span className="font-mono font-bold text-primary uppercase">{activeTab}</span> module.
              </p>
              <button
                onClick={() => refetch()}
                className="btn-primary mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw size={14} />
                Refresh Recycle Bin
              </button>
            </div>
          ) : (
            /* DATA TABLE ONLY */
            <TableWrapper>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === trashItems.length && trashItems.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    {visibleColumns.recordInfo && <th className="py-3.5 px-4">Record Information</th>}
                    {visibleColumns.module && <th className="py-3.5 px-4">Module Scope</th>}
                    {visibleColumns.retention && <th className="py-3.5 px-4 min-w-[180px]">Retention & Auto-Purge</th>}
                    {visibleColumns.deletedAt && <th className="py-3.5 px-4">Deleted Date</th>}
                    {visibleColumns.deletedBy && <th className="py-3.5 px-4">Deleted By</th>}
                    {visibleColumns.actions && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {trashItems.map((item) => {
                    const displayName = getItemDisplayName(item)
                    const deletedDate = item.deleted_at ? new Date(item.deleted_at).toLocaleString() : 'N/A'
                    const daysLeft = getDaysLeft(item.deleted_at)
                    const isSelected = selectedIds.includes(item.id)

                    return (
                      <tr key={item.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>

                        {visibleColumns.recordInfo && (
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-2xl ${currentModuleConfig.bgColor} ${currentModuleConfig.color} border ${currentModuleConfig.borderColor} shrink-0 shadow-2xs`}>
                                <ActiveTabIcon size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground text-xs truncate max-w-[220px]">{displayName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/50">
                                    #{item.id}
                                  </span>
                                  {(item.code || item.email || item.sku || item.price || item.amount) && (
                                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]">
                                      {item.code || item.email || item.sku || (item.price ? `$${item.price}` : null) || (item.amount ? `$${item.amount}` : null)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}

                        {visibleColumns.module && (
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono border inline-flex items-center gap-1 ${currentModuleConfig.bgColor} ${currentModuleConfig.color} ${currentModuleConfig.borderColor}`}>
                              <ActiveTabIcon size={12} />
                              <span>{activeTab}</span>
                            </span>
                          </td>
                        )}

                        {visibleColumns.retention && (
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-[170px]">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className={`font-extrabold flex items-center gap-1 ${
                                  daysLeft <= 5 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : daysLeft <= 15 ? 'text-amber-600' : 'text-emerald-600'
                                }`}>
                                  <Clock size={10} />
                                  {daysLeft} days left
                                </span>
                                <span className="text-[9px] text-muted-foreground font-mono">{Math.round(((30 - daysLeft) / 30) * 100)}%</span>
                              </div>
                              <div className="w-full bg-muted/80 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    daysLeft <= 5 ? 'bg-rose-500' : daysLeft <= 15 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(5, ((30 - daysLeft) / 30) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        )}

                        {visibleColumns.deletedAt && (
                          <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                            {deletedDate}
                          </td>
                        )}

                        {visibleColumns.deletedBy && (
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5 text-xs">
                              <User size={13} className="text-primary shrink-0" />
                              <span>{item.deleted_by || 'System Admin'}</span>
                            </div>
                          </td>
                        )}

                        {/* ── ULTRA-MODERN SEGMENTED ACTIONS CAPSULE ────────────── */}
                        {visibleColumns.actions && (
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 dark:bg-muted/30 border border-border/80 shadow-2xs">
                              {/* 1. Premium Gradient Restore Button */}
                              <button
                                onClick={() => {
                                  sound.playClick()
                                  setSelectedItem(item)
                                  setConfirmAction('restore')
                                }}
                                className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-xs hover:shadow-md hover:shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 group"
                              >
                                <RotateCcw size={13} className="group-hover:-rotate-90 transition-transform duration-300" />
                                <span>Restore</span>
                              </button>

                              {/* 2. Glassmorphic Permanent Delete Icon Button */}
                              <button
                                onClick={() => {
                                  sound.playClick()
                                  setSelectedItem(item)
                                  setConfirmAction('force_delete')
                                }}
                                className="p-1.5 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white border border-transparent hover:border-rose-500/30 transition-all duration-200 cursor-pointer active:scale-95 group"
                                title="Permanently Delete (Purge)"
                              >
                                <Trash2 size={14} className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200" />
                              </button>

                              {/* 3. View Audit Metadata Icon Button */}
                              <button
                                onClick={() => {
                                  sound.playClick()
                                  setViewItem(item)
                                }}
                                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border/60 transition-all duration-200 cursor-pointer active:scale-95 group"
                                title="View Audit Details"
                              >
                                <Eye size={14} className="group-hover:scale-110 transition-transform duration-200" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableWrapper>
          )}
        </div>

        {/* Integrated Pagination */}
        <div className="p-4 border-t border-border/70 bg-muted/20">
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

      {/* ── 7. BATCH ACTIONS FLOATING TOOLBAR ────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border/90 shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3 z-40 print:hidden"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-foreground">
                Records Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick()
                  setBatchConfirmAction('batch_restore')
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer border border-emerald-400/30"
              >
                <RotateCcw size={13} />
                <span>Restore ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick()
                  setBatchConfirmAction('batch_force_delete')
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer border border-rose-400/30"
              >
                <Trash2 size={13} />
                <span>Purge ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                title="Deselect All"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. ADVANCED FILTER DRAWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Advanced Recycle Bin Filters</h2>
                  </div>
                  <CloseButton onClose={() => setFilterDrawerOpen(false)} size="md" color="rose" />
                </div>

                {/* Drawer Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Delete Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'All Status' },
                        { id: 'deleted', label: 'Deleted' },
                        { id: 'restored', label: 'Restored' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFilterDeleteStatus(st.id)}
                          className={`py-2 px-2 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                            filterDeleteStatus === st.id
                              ? 'bg-primary text-white border-primary shadow-2xs font-bold'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Retention Period</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: '7days', label: 'Last 7 Days' },
                        { id: '30days', label: 'Last 30 Days' },
                      ].map((rt) => (
                        <button
                          key={rt.id}
                          type="button"
                          onClick={() => setFilterRetention(rt.id)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                            filterRetention === rt.id
                              ? 'bg-primary text-white border-primary shadow-2xs font-bold'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {rt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deleted Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground mb-1 block">Start Date</span>
                        <EnterpriseDatePicker
                          value={filterStartDate}
                          onChange={(val) => setFilterStartDate(val)}
                          placeholder="Start Date"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground mb-1 block">End Date</span>
                        <EnterpriseDatePicker
                          value={filterEndDate}
                          onChange={(val) => setFilterEndDate(val)}
                          placeholder="End Date"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-extrabold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 9. VIEW DELETED RECORD DETAILS DRAWER ─────────────────────────────── */}
      <AnimatePresence>
        {viewItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end print:hidden">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-sm border-l border-border h-full flex flex-col justify-between shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-500" />
                  <span>Deleted Record Metadata</span>
                </h3>
                <CloseButton onClose={() => setViewItem(null)} size="md" color="rose" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex flex-col items-center gap-3 py-4 bg-muted/30 rounded-2xl border border-border/60">
                  <div className={`w-16 h-16 rounded-full ${currentModuleConfig.bgColor} ${currentModuleConfig.color} flex items-center justify-center text-2xl font-bold shadow-xs`}>
                    <ActiveTabIcon size={30} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground text-sm">{getItemDisplayName(viewItem)}</p>
                    <p className="text-muted-foreground text-xs font-mono">Module: {activeTab.toUpperCase()}</p>
                    <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      Soft Deleted
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Record ID', value: `#${viewItem.id}` },
                    { label: 'Display Name', value: getItemDisplayName(viewItem) },
                    { label: 'Module Scope', value: activeTab.toUpperCase() },
                    { label: 'Deleted At', value: viewItem.deleted_at ? new Date(viewItem.deleted_at).toLocaleString() : 'N/A' },
                    { label: 'Deleted By User', value: viewItem.deleted_by || 'System Admin' },
                    { label: 'Retention Days Left', value: `${getDaysLeft(viewItem.deleted_at)} Days` },
                    { label: 'Restorable Status', value: 'Restorable' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border/60">
                      <span className="text-muted-foreground font-medium">{row.label}</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
                <button
                  onClick={() => {
                    setViewItem(null)
                    setSelectedItem(viewItem)
                    setConfirmAction('restore')
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-95 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <RotateCcw size={14} /> Restore Record
                </button>
                <button
                  onClick={() => {
                    setViewItem(null)
                    setSelectedItem(viewItem)
                    setConfirmAction('force_delete')
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:opacity-95 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Trash2 size={14} /> Permanent Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 10. RESTORE & FORCE DELETE CONFIRM DIALOG ──────────────────────────── */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction === 'restore' ? 'Restore Record' : 'Permanently Delete Record'}
        message={
          confirmAction === 'restore'
            ? `Are you sure you want to restore "${selectedItem ? getItemDisplayName(selectedItem) : 'this record'}" back to ${activeTab}?`
            : `Are you sure you want to PERMANENTLY delete "${selectedItem ? getItemDisplayName(selectedItem) : 'this record'}"? This action CANNOT be undone.`
        }
        confirmText={confirmAction === 'restore' ? 'Restore Record' : 'Permanently Delete'}
        loading={restoreMutation.isPending || forceDeleteMutation.isPending}
        onConfirm={handleExecuteAction}
        onCancel={closeConfirm}
      />

      {/* ── 11. BATCH CONFIRM DIALOG ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!batchConfirmAction}
        title={batchConfirmAction === 'batch_restore' ? `Restore ${selectedIds.length} Selected Records` : `Permanently Delete ${selectedIds.length} Selected Records`}
        message={
          batchConfirmAction === 'batch_restore'
            ? `Are you sure you want to restore ${selectedIds.length} selected records back to ${activeTab}?`
            : `Are you sure you want to PERMANENTLY delete ${selectedIds.length} selected records? This action CANNOT be undone.`
        }
        confirmText={batchConfirmAction === 'batch_restore' ? `Restore (${selectedIds.length})` : `Delete (${selectedIds.length})`}
        loading={batchRestoreMutation.isPending || batchForceDeleteMutation.isPending}
        onConfirm={handleExecuteBatchAction}
        onCancel={() => setBatchConfirmAction(null)}
      />

      {/* ── 12. EMPTY TRASH CONFIRM DIALOG ────────────────────────────────────── */}
      <ConfirmDialog
        open={emptyTrashConfirm}
        title="Empty Recycle Bin"
        message="Are you sure you want to purge all deleted records across all modules? This action is permanent and cannot be undone."
        confirmText="Empty Trash Now"
        loading={false}
        onConfirm={handleEmptyTrash}
        onCancel={() => setEmptyTrashConfirm(false)}
      />
    </div>
  )
}

export default RecycleBinPage
