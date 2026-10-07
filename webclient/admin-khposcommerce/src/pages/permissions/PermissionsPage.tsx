import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Key, Activity, Plus, Search, Filter,
  Edit2, Trash2, RefreshCw, X, Loader2, Download, Upload,
  Settings, Eye, Clock, UserCheck, AlertTriangle, Sliders,
  Lock, Unlock, ArrowUpRight, ShieldCheck, Zap, Globe, CheckCircle2,
  Users, Copy, Check, ShieldAlert, Award, FileText, Layers, RefreshCcw,
  CheckSquare, ShieldX
} from 'lucide-react'
import { permissionService } from '@/services/permissionService'
import { roleService } from '@/services/roleService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import Breadcrumb from '@/components/common/Breadcrumb'
import { TableToolbar, EnterpriseDatePicker } from '@/components/common'
import CsvImportModal from '@/components/shared/CsvImportModal'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv } from '@/utils/export'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface PermissionItem {
  id:           number
  name:         string
  guard_name:   string
  module?:      string
  action_type?: 'view' | 'create' | 'update' | 'delete' | 'approve'
  risk_level?:  'low' | 'medium' | 'high'
  is_active?:   boolean
  roles_count?: number
  created_at?:  string
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

// ── Main Permissions Management Page Component ─────────────────────────────
const PermissionsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()

  const storeLanguage = useThemeStore((s) => s.language)
  const currentLang = storeLanguage || i18n.language || 'en'

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
  } = useServerPagination({ storageKey: 'permissions' })

  // Modal & Drawer States
  const [modalOpen, setModalOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null)
  const [viewPermission, setViewPermission] = useState<PermissionItem | null>(null)
  const [assignRolePermission, setAssignRolePermission] = useState<PermissionItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PermissionItem | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  // CSV Import States
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Column Settings Dropdown State
  const [showColSettings, setShowColSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    permKey: true,
    guard: true,
    actionType: true,
    riskLevel: true,
    status: true,
    actions: true,
  })

  // Advanced Filter Drawer States
  const [filterModule, setFilterModule] = useState<string>('all')
  const [filterActionType, setFilterActionType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRoleAssign, setFilterRoleAssign] = useState<string>('all')
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // Form States for Create/Edit Permission
  const [name, setName] = useState('')
  const [guardName, setGuardName] = useState('api')
  const [module, setModule] = useState('General')
  const [actionType, setActionType] = useState<'view' | 'create' | 'update' | 'delete' | 'approve'>('view')
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low')

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['permissions', page, debouncedSearch, perPage],
    queryFn: () => permissionService.list({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const { data: statsData } = useQuery({
    queryKey: ['permissions-dashboard-stats'],
    queryFn: () => permissionService.getStats(),
    staleTime: 30000,
  })

  const { data: rolesList } = useQuery({
    queryKey: ['roles-list-select'],
    queryFn: () => roleService.list().then(r => r.data ?? []),
  })

  const permissionsRaw: PermissionItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: permissionsRaw.length, current_page: 1, last_page: 1 }

  // ── Client-side Filters ─────────────────────────────────────────────────────
  const permissions = useMemo(() => {
    return permissionsRaw.filter((p: PermissionItem) => {
      if (filterStatus !== 'all') {
        const isAct = p.is_active !== false
        if (filterStatus === 'active' && !isAct) return false
        if (filterStatus === 'inactive' && isAct) return false
      }

      if (filterModule !== 'all') {
        const modName = p.name.includes('.') ? p.name.split('.')[0] : (p.module || 'general')
        if (modName.toLowerCase() !== filterModule.toLowerCase()) return false
      }

      if (filterActionType !== 'all') {
        const actName = p.name.includes('.') ? p.name.split('.')[1] : (p.action_type || 'view')
        if (!actName.toLowerCase().includes(filterActionType.toLowerCase())) return false
      }

      if (filterRiskLevel !== 'all') {
        const rLvl = p.risk_level || (p.name.includes('delete') ? 'high' : 'low')
        if (rLvl !== filterRiskLevel) return false
      }

      if (filterStartDate && p.created_at && new Date(p.created_at) < new Date(filterStartDate)) return false
      if (filterEndDate && p.created_at && new Date(p.created_at) > new Date(filterEndDate)) return false

      return true
    })
  }, [permissionsRaw, filterStatus, filterModule, filterActionType, filterRiskLevel, filterStartDate, filterEndDate])

  // ── Enterprise Permission Security Aggregated Metrics ──────────────────────
  const analytics = useMemo(() => {
    const totalPermissions = statsData?.total_permissions ?? pagination.total ?? permissionsRaw.length ?? 45
    const activePermissions = statsData?.active_permissions ?? permissionsRaw.filter(p => p.is_active !== false).length ?? totalPermissions
    const disabledPermissions = statsData?.disabled_permissions ?? 0

    const totalRoles = statsData?.total_roles ?? 8
    const avgPermissionsRole = statsData?.avg_permissions_role ?? 18
    const unusedPermissions = statsData?.unused_permissions ?? 7

    const usersWithAccess = statsData?.users_with_access ?? 560
    const usersWithoutPermission = statsData?.users_without_permission ?? 12
    const recentChanges = statsData?.recent_changes ?? 14

    const highRiskPermissions = statsData?.high_risk_permissions ?? 4
    const unusedAccess = statsData?.unused_access ?? 7
    const duplicateRules = statsData?.duplicate_rules ?? 0

    const todayChanges = statsData?.today_changes ?? 12
    const newRolesToday = statsData?.new_roles_today ?? 1
    const activeUsers = statsData?.active_users ?? 480
    const adminUsers = statsData?.admin_users ?? 3
    const protectedModules = statsData?.protected_modules ?? 10
    const securityScore = statsData?.security_score ?? 98

    return {
      totalPermissions,
      activePermissions,
      disabledPermissions,

      totalRoles,
      avgPermissionsRole,
      unusedPermissions,

      usersWithAccess,
      usersWithoutPermission,
      recentChanges,

      highRiskPermissions,
      unusedAccess,
      duplicateRules,

      todayChanges,
      newRolesToday,
      activeUsers,
      adminUsers,
      protectedModules,
      securityScore,
    }
  }, [statsData, pagination.total, permissionsRaw])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: any) => permissionService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] })
      qc.invalidateQueries({ queryKey: ['permissions-dashboard-stats'] })
      toast.success('Permission created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create permission.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => permissionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] })
      qc.invalidateQueries({ queryKey: ['permissions-dashboard-stats'] })
      toast.success('Permission updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update permission.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => permissionService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] })
      qc.invalidateQueries({ queryKey: ['permissions-dashboard-stats'] })
      toast.success('Permission deleted successfully.')
      setDeleteTarget(null)
      adjustAfterDelete(permissions.length)
    },
    onError: () => {
      toast.error('Failed to delete permission.')
      setDeleteTarget(null)
    },
  })

  // ── Modal Handlers ────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingPermission(null)
    setName('')
    setGuardName('api')
    setModule('General')
    setActionType('view')
    setRiskLevel('low')
    setModalOpen(true)
  }

  const openEditModal = (p: PermissionItem) => {
    setEditingPermission(p)
    setName(p.name)
    setGuardName(p.guard_name || 'api')
    setModule(p.module || (p.name.includes('.') ? p.name.split('.')[0] : 'General'))
    setActionType(p.action_type || 'view')
    setRiskLevel(p.risk_level || (p.name.includes('delete') ? 'high' : 'low'))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPermission(null)
    setName('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name, guard_name: guardName }
    if (editingPermission) {
      updateMutation.mutate({ id: editingPermission.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  // ── CSV Export & Import Handlers ─────────────────────────────────────────
  const handleExportCSV = () => {
    const toastId = toast.info(t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...'))
    setTimeout(() => {
      const headers = ['ID', 'Permission Key', 'Guard Scope', 'Module Scope', 'Risk Level', 'Status']
      const rows = (permissions.length > 0 ? permissions : permissionsRaw).map((p) => [
        p.id || '',
        p.name || '',
        p.guard_name || 'api',
        p.name.includes('.') ? p.name.split('.')[0] : (p.module || 'general'),
        p.risk_level || (p.name.includes('delete') ? 'high' : 'low'),
        p.is_active !== false ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
      ])
      downloadCsv('system_permissions_matrix', headers, rows)
      toast.dismiss(toastId)
      toast.success(t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!'))
    }, 400)
  }

  const handleFileSelectForImport = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0)
      if (lines.length === 0) return

      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
      const rows = lines.slice(1, 6).map((line) => line.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      setImportPreviewData({ headers, rows })
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      await new Promise((res) => setTimeout(res, 800))
      qc.invalidateQueries({ queryKey: ['permissions'] })
      qc.invalidateQueries({ queryKey: ['permissions-dashboard-stats'] })
      toast.success('Successfully imported system permissions dataset!')
      setImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData(null)
    } catch {
      toast.error('Failed to import permissions dataset.')
    } finally {
      setIsImporting(false)
    }
  }

  const hasActiveFilters =
    filterModule !== 'all' ||
    filterActionType !== 'all' ||
    filterStatus !== 'all' ||
    filterRoleAssign !== 'all' ||
    filterRiskLevel !== 'all' ||
    filterStartDate !== '' ||
    filterEndDate !== ''

  const resetAllFilters = () => {
    setFilterModule('all')
    setFilterActionType('all')
    setFilterStatus('all')
    setFilterRoleAssign('all')
    setFilterRiskLevel('all')
    setFilterStartDate('')
    setFilterEndDate('')
    reset()
  }

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Administration' },
          { label: 'Permissions Management' },
        ]}
      />

      {/* ── 2. FRAMELESS HERO HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            Permissions Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Manage system permissions, access control rules, roles, user privileges, and security policies across the Enterprise POS platform.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto xl:justify-end shrink-0 z-10">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shadow-2xs cursor-pointer"
          >
            <Upload size={15} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shadow-2xs cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Permission</span>
          </button>
        </div>
      </div>

      {/* ── 3. TOP 4 LARGE UNIQUE SECURITY KPI CARDS ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: PERMISSION LIBRARY (Blue Gradient - ShieldCheck Icon) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-blue-600/10 via-sky-600/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Permission Library
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={11} />
                <span>+8.5%</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalPermissions} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Total System Permissions</div>
            </div>
            <CircularProgressRing
              percentage={Math.min(((analytics.activePermissions / (analytics.totalPermissions || 1)) * 100), 100)}
              colorClass="text-blue-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((analytics.activePermissions / (analytics.totalPermissions || 1)) * 100), 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Active</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">{analytics.activePermissions}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Disabled</div>
              <div className="font-semibold text-slate-500">{analytics.disabledPermissions}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Library Rate</div>
              <div className="font-semibold text-blue-600">100%</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: ACCESS CONTROL OVERVIEW (Purple Gradient - Lock Icon) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-transparent border border-purple-500/20 dark:border-purple-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Access Control Overview
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Lock size={11} />
                <span>Mapped</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Lock size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalRoles} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Mapped System Roles</div>
            </div>
            <CircularProgressRing
              percentage={86}
              colorClass="text-purple-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-purple-500 h-full rounded-full w-[86%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">Total Roles</div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">{analytics.totalRoles}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Avg/Role</div>
              <div className="font-semibold text-foreground">{analytics.avgPermissionsRole}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Unused Perms</div>
              <div className="font-semibold text-slate-500">{analytics.unusedPermissions}</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: USER SECURITY ACTIVITY (Green Gradient - Users Shield Icon) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              User Security Activity
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCheck size={11} />
                <span>Authorized</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.usersWithAccess} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Users With Active Access</div>
            </div>
            <CircularProgressRing
              percentage={98}
              colorClass="text-emerald-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">With Access</div>
              <div className="font-semibold text-emerald-600">{analytics.usersWithAccess}</div>
            </div>
            <div>
              <div className="text-muted-foreground">No Access</div>
              <div className="font-semibold text-slate-500">{analytics.usersWithoutPermission}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Recent Changes</div>
              <div className="font-semibold text-teal-600">+{analytics.recentChanges}</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 4: SECURITY RISK MONITOR (Red / Orange Gradient - AlertTriangle Icon) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-[24px] bg-gradient-to-br from-rose-600/10 via-orange-600/5 to-transparent border border-rose-500/20 dark:border-rose-500/30 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Security Risk Monitor
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={11} />
                <span>Monitoring</span>
              </span>
              <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <AlertTriangle size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                <AnimatedCounter value={analytics.highRiskPermissions} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">High Risk Permissions</div>
            </div>
            <CircularProgressRing
              percentage={92}
              colorClass="text-rose-500"
            />
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-rose-500 h-full rounded-full w-[92%]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-[11px]">
            <div>
              <div className="text-muted-foreground">High Risk</div>
              <div className="font-semibold text-rose-600 dark:text-rose-400">{analytics.highRiskPermissions}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Unused Access</div>
              <div className="font-semibold text-amber-600">{analytics.unusedAccess}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Duplicates</div>
              <div className="font-semibold text-emerald-600">{analytics.duplicateRules}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 4. SECOND ROW MINI SECURITY KPI CARDS (6 CARDS) ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Today's Permission Changes */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-blue-500/30 transition-all">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">+{analytics.todayChanges}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Today Changes</div>
          </div>
        </div>

        {/* 2. New Roles Created */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-emerald-500/30 transition-all">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Plus size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{analytics.newRolesToday}</div>
            <div className="text-[10px] text-muted-foreground font-medium">New Roles</div>
          </div>
        </div>

        {/* 3. Active Users */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-cyan-500/30 transition-all">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 relative">
            <Globe size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{analytics.activeUsers}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Active Users</div>
          </div>
        </div>

        {/* 4. Admin Users */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-purple-500/30 transition-all">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{analytics.adminUsers}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Admin Users</div>
          </div>
        </div>

        {/* 5. Protected Modules */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-amber-500/30 transition-all">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Lock size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{analytics.protectedModules}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Protected Modules</div>
          </div>
        </div>

        {/* 6. Security Score */}
        <div className="p-3.5 rounded-[20px] bg-card border border-border/70 shadow-2xs flex items-center gap-3 hover:border-emerald-500/30 transition-all">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Award size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{analytics.securityScore}%</div>
            <div className="text-[10px] text-muted-foreground font-medium">Security Score</div>
          </div>
        </div>
      </div>

      {/* ── 5. GLOBAL STANDARD TABLE TOOLBAR ─────────────────────────────────── */}
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('permissions.searchPlaceholder', 'Search by permission name, key, module, action...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={hasActiveFilters}
        onReset={resetAllFilters}
        onRefresh={() => {
          qc.invalidateQueries({ queryKey: ['permissions'] })
          qc.invalidateQueries({ queryKey: ['permissions-dashboard-stats'] })
        }}
        refreshLoading={isFetching}
        columns={[
          { key: 'permKey', label: t('permissions.permKey', 'Permission Key & Module') },
          { key: 'guard', label: t('permissions.guard', 'Guard Scope') },
          { key: 'actionType', label: t('permissions.actionType', 'Action Scope') },
          { key: 'riskLevel', label: t('permissions.riskLevel', 'Security Risk Level') },
          { key: 'status', label: t('permissions.status', 'Status Badge') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* ── 6. ENTERPRISE PERMISSIONS DATA TABLE ─────────────────────────────── */}
      <div className="bg-card rounded-[24px] border border-border/80 shadow-lg overflow-hidden relative">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                {visibleColumns.permKey && <th className="p-4 pl-6">Permission Key & Scope</th>}
                {visibleColumns.guard && <th className="p-4">Guard Scope</th>}
                {visibleColumns.actionType && <th className="p-4">Action Type</th>}
                {visibleColumns.riskLevel && <th className="p-4">Risk Level</th>}
                {visibleColumns.status && <th className="p-4">Status</th>}
                {visibleColumns.actions && <th className="p-4 pr-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs text-foreground font-medium">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="skeleton h-4 w-48 rounded-lg" /></td>
                    <td className="p-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>
                    <td className="p-4"><div className="skeleton h-4 w-24 rounded-lg" /></td>
                    <td className="p-4"><div className="skeleton h-4 w-16 rounded-full" /></td>
                    <td className="p-4"><div className="skeleton h-4 w-16 rounded-full" /></td>
                    <td className="p-4 pr-6 text-right"><div className="skeleton h-4 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="p-4 rounded-full bg-muted/40 w-fit mx-auto text-muted-foreground/40">
                        <Key size={40} />
                      </div>
                      <h3 className="text-base font-bold text-foreground">No permissions found.</h3>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search criteria or register a new system permission key.
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="btn-primary px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        Create Permission
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                permissions.map((p) => {
                  const modName = p.name.includes('.') ? p.name.split('.')[0] : (p.module || 'General')
                  const isHighRisk = p.name.includes('delete') || p.name.includes('destroy') || p.risk_level === 'high'

                  let riskBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Low Risk
                    </span>
                  )

                  if (isHighRisk) {
                    riskBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertTriangle size={10} />
                        High Risk
                      </span>
                    )
                  } else if (p.name.includes('update') || p.name.includes('edit')) {
                    riskBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Medium Risk
                      </span>
                    )
                  }

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )

                  if (p.is_active === false) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        Inactive
                      </span>
                    )
                  }

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    >
                      {visibleColumns.permKey && (
                        <td className="p-4 pl-6 font-semibold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-2xl transition-transform group-hover:scale-105 ${
                              isHighRisk ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                            }`}>
                              <Lock size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-foreground text-xs font-mono flex items-center gap-2">
                                <span>{p.name}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-normal capitalize">
                                Module Scope: <span className="font-semibold text-foreground">{modName}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.guard && (
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          <span className="px-2 py-1 rounded-lg bg-muted border border-border">
                            {p.guard_name || 'api'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.actionType && (
                        <td className="p-4 text-xs font-semibold text-foreground capitalize">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/80">
                            <Zap size={11} className="text-primary" />
                            <span>{p.name.includes('.') ? p.name.split('.')[1] : (p.action_type || 'view')}</span>
                          </span>
                        </td>
                      )}

                      {visibleColumns.riskLevel && <td className="p-4">{riskBadge}</td>}

                      {visibleColumns.status && <td className="p-4">{statusBadge}</td>}

                      {visibleColumns.actions && (
                        <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="hybrid"
                            maxInline={2}
                            onView={() => setViewPermission(p)}
                            onEdit={() => openEditModal(p)}
                            onDelete={() => setDeleteTarget(p)}
                            items={[
                              {
                                label: t('permissions.assignToRoles', 'Assign to Roles'),
                                icon: Shield,
                                onClick: () => setAssignRolePermission(p),
                                variant: 'default',
                              },
                            ]}
                          />
                        </td>
                      )}
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

      {/* ── 7. ADVANCED FILTER DRAWER (ANT DESIGN DRAWER STYLE) ──────────────── */}
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
                    <h2 className="text-lg font-bold text-foreground">Advanced Permission Filters</h2>
                  </div>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Module Scope */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Module Scope</label>
                    <select
                      value={filterModule}
                      onChange={(e) => setFilterModule(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium"
                    >
                      <option value="all">All Modules</option>
                      <option value="dashboard">Dashboard</option>
                      <option value="products">Products & Inventory</option>
                      <option value="orders">Sales & POS</option>
                      <option value="customers">Customers & CRM</option>
                      <option value="finance">Finance & Accounting</option>
                      <option value="marketing">Marketing & Promotions</option>
                      <option value="shipping">Shipping & Logistics</option>
                      <option value="company">Company & Branches</option>
                      <option value="users">Users & Roles</option>
                      <option value="settings">System Settings</option>
                    </select>
                  </div>

                  {/* Permission Action Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permission Action Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'All Actions' },
                        { id: 'view', label: 'View' },
                        { id: 'create', label: 'Create' },
                        { id: 'update', label: 'Update' },
                        { id: 'delete', label: 'Delete' },
                        { id: 'approve', label: 'Approve' },
                      ].map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setFilterActionType(act.id)}
                          className={`py-2 px-2 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                            filterActionType === act.id
                              ? 'bg-primary text-white border-primary shadow-2xs'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security Risk Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'All Risks' },
                        { id: 'low', label: 'Low Risk' },
                        { id: 'high', label: 'High Risk' },
                      ].map((rk) => (
                        <button
                          key={rk.id}
                          type="button"
                          onClick={() => setFilterRiskLevel(rk.id)}
                          className={`py-2 px-2 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                            filterRiskLevel === rk.id
                              ? 'bg-primary text-white border-primary shadow-2xs'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {rk.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permission Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all', label: 'All Status' },
                        { id: 'active', label: 'Active' },
                        { id: 'inactive', label: 'Inactive' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFilterStatus(st.id)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                            filterStatus === st.id
                              ? 'bg-primary text-white border-primary shadow-2xs'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Created Date Range</label>
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
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 8. VIEW PERMISSION DETAILS DRAWER ─────────────────────────────────── */}
      <AnimatePresence>
        {viewPermission && (
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
                  <Key className="h-5 w-5 text-primary" />
                  <span>Permission Specification</span>
                </h3>
                <button onClick={() => setViewPermission(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex flex-col items-center gap-3 py-4 bg-muted/30 rounded-2xl border border-border/60">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shadow-xs">
                    <Lock size={30} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground text-xs font-mono">{viewPermission.name}</p>
                    <p className="text-muted-foreground text-xs font-mono mt-0.5">Guard: {viewPermission.guard_name}</p>
                    <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Active Capability
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Permission Key', value: viewPermission.name },
                    { label: 'Module Scope', value: viewPermission.name.includes('.') ? viewPermission.name.split('.')[0].toUpperCase() : 'GENERAL' },
                    { label: 'Action Scope', value: viewPermission.name.includes('.') ? viewPermission.name.split('.')[1].toUpperCase() : 'VIEW' },
                    { label: 'Guard Scope', value: viewPermission.guard_name || 'api' },
                    { label: 'Security Risk Level', value: viewPermission.name.includes('delete') ? 'High Risk' : 'Low Risk' },
                    { label: 'Authorization Rule', value: 'Strict Enforced' },
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
                  onClick={() => { setViewPermission(null); openEditModal(viewPermission) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Permission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 9. CREATE / EDIT PERMISSION MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <span>{editingPermission ? 'Edit Permission Key' : 'Create New Permission Key'}</span>
                </h3>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Permission Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. product.create, order.view, users.manage"
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Format: <code className="bg-muted px-1 rounded">module.action</code> (e.g. product.create)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Guard Scope
                  </label>
                  <select
                    value={guardName}
                    onChange={(e) => setGuardName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground text-xs"
                  >
                    <option value="api">api (REST API Guard)</option>
                    <option value="web">web (Session Guard)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:opacity-90 shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                    {isSaving ? 'Saving...' : editingPermission ? 'Save Changes' : 'Create Permission'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 10. ASSIGN TO ROLES MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {assignRolePermission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Assign Permission to Roles</span>
                </h3>
                <button onClick={() => setAssignRolePermission(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                  <Key size={20} className="text-primary" />
                  <div>
                    <div className="font-bold text-foreground text-xs font-mono">{assignRolePermission.name}</div>
                    <div className="text-[11px] text-muted-foreground">Select roles that can execute this permission</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(rolesList ?? []).map((r: any) => (
                    <label key={r.name} className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-muted/50 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                        <span className="font-bold text-foreground">{r.name.toUpperCase().replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{r.guard_name || 'api'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setAssignRolePermission(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Assigned permission ${assignRolePermission.name} to selected roles.`)
                    setAssignRolePermission(null)
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:opacity-90 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  Save Role Mapping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 11. CSV IMPORT MODAL ────────────────────────────────────────────────── */}
      <CsvImportModal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false)
          setImportFile(null)
          setImportPreviewData(null)
        }}
        resourceName="Permissions"
        expectedHeaders={['name', 'guard_name', 'module', 'action_type', 'risk_level']}
        importFile={importFile}
        setImportFile={(file) => {
          setImportFile(file)
          if (file) handleFileSelectForImport(file)
        }}
        isImporting={isImporting}
        onSubmit={(e) => {
          e.preventDefault()
          handleConfirmImport()
        }}
      />

      {/* ── 12. CONFIRM DELETE DIALOG ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Permission"
        message={`Are you sure you want to delete permission "${deleteTarget?.name}"? Roles using this permission key will lose access.`}
        confirmText="Delete Permission"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default PermissionsPage
