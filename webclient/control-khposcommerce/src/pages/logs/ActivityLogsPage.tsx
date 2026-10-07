import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Search, Filter, RefreshCw, Trash2, Eye, Download,
  ShieldCheck, AlertTriangle, UserCheck, CheckCircle2,
  Clock, Globe, Monitor, Copy, Check, X, ShieldAlert,
  Calendar, Layers, Database, ArrowUpRight, FileCode,
  LogIn, LogOut, Plus, Edit3, Shield, Info, ArrowRight, User
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useServerPagination } from '@/hooks/useServerPagination'
import Breadcrumb from '@/components/common/Breadcrumb'
import { CloseButton, CancelButton, ResetButton, EnterpriseDatePicker } from '@/components/common'
import SearchInput from '@/components/shared/SearchInput'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import CircularProgressRing from '@/components/shared/CircularProgressRing'
import { activityLogService, type ActivityLog, type ActivityLogDashboardStats } from '@/services/activityLogService'
import { useTranslation } from 'react-i18next'
import { downloadCsv } from '@/utils/export'
import TableActionMenu from '@/components/shared/TableActionMenu'

// ── Formatters & Helpers ───────────────────────────────────────────────────────

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatRelativeTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return d.toLocaleDateString()
}

const getEventBadge = (event?: string | null, description?: string) => {
  const evt = (event || '').toLowerCase()
  const desc = (description || '').toLowerCase()

  if (evt === 'created' || desc.includes('create') || desc.includes('added')) {
    return {
      label: 'Created',
      icon: Plus,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-500',
    }
  }
  if (evt === 'updated' || desc.includes('update') || desc.includes('edit') || desc.includes('modify')) {
    return {
      label: 'Updated',
      icon: Edit3,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-500',
    }
  }
  if (evt === 'deleted' || desc.includes('delete') || desc.includes('remove') || desc.includes('purge')) {
    return {
      label: 'Deleted',
      icon: Trash2,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-500',
    }
  }
  if (evt === 'login' || desc.includes('login') || desc.includes('signed in')) {
    return {
      label: 'Login',
      icon: LogIn,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      dotColor: 'bg-purple-500',
    }
  }
  if (evt === 'logout' || desc.includes('logout') || desc.includes('signed out')) {
    return {
      label: 'Logout',
      icon: LogOut,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-500',
    }
  }
  if (desc.includes('fail') || desc.includes('error') || desc.includes('denied') || desc.includes('unauthorized')) {
    return {
      label: 'Security Alert',
      icon: ShieldAlert,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      dotColor: 'bg-red-500',
    }
  }
  return {
    label: event || 'Activity',
    icon: Activity,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dotColor: 'bg-slate-500',
  }
}

const getModuleColor = (logName?: string | null) => {
  const name = (logName || '').toLowerCase()
  if (name.includes('product')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  if (name.includes('order') || name.includes('sale')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  if (name.includes('user') || name.includes('role') || name.includes('permission')) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
  if (name.includes('auth') || name.includes('login')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  if (name.includes('inventory')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
  if (name.includes('setting') || name.includes('system')) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
  return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
}

// ── Detail Drawer Component ───────────────────────────────────────────────────

interface DetailDrawerProps {
  log: ActivityLog | null
  onClose: () => void
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ log, onClose }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'diff' | 'raw'>('overview')

  if (!log) return null

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const badge = getEventBadge(log.event, log.description)
  const properties = log.properties || {}
  const oldValues = properties.old || null
  const newValues = properties.attributes || null
  const hasDiff = Boolean(oldValues || newValues)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-card shadow-2xl flex flex-col z-50 border-l border-border animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${badge.color}`}>
              <badge.icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">
                  {t('activityLogs.detail.title', 'Activity Audit Log')}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  #{log.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(log.created_at)} ({formatRelativeTime(log.created_at)})
              </p>
            </div>
          </div>
          <CloseButton onClose={onClose} size="md" color="rose" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 gap-2 bg-muted/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Info size={14} />
            {t('activityLogs.detail.overview', 'Overview')}
          </button>
          {hasDiff && (
            <button
              onClick={() => setActiveTab('diff')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'diff'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 size={14} />
              {t('activityLogs.detail.changes', 'Attribute Changes')}
            </button>
          )}
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'raw'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCode size={14} />
            {t('activityLogs.detail.raw', 'Raw JSON')}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Event & Description Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Action Summary</span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {log.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Module:</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${getModuleColor(log.log_name)}`}>
                    {log.log_name || 'System'}
                  </span>
                </div>
              </div>

              {/* Causer / User Profile */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  {t('activityLogs.detail.actor', 'Operator / Causer')}
                </h4>
                {log.causer ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {log.causer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{log.causer.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{log.causer.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                    <Shield size={14} />
                    <span>System Automated Operation / Anonymous Causer</span>
                  </div>
                )}
              </div>

              {/* Target / Subject */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" />
                  {t('activityLogs.detail.subject', 'Target Subject')}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Subject Model:</span>
                    <p className="font-mono font-medium text-foreground mt-0.5 break-all">
                      {log.subject_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject ID:</span>
                    <p className="font-mono font-medium text-foreground mt-0.5">
                      {log.subject_id ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Network & Environment */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe size={14} className="text-primary" />
                  {t('activityLogs.detail.network', 'Network & Client Context')}
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client IP Address:</span>
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                      {properties.ip || '127.0.0.1 (Local)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User Agent:</span>
                    <p className="mt-1 p-2.5 rounded-lg bg-muted/60 text-muted-foreground font-mono text-[11px] break-all border border-border/40">
                      {properties.user_agent || 'Standard HTTP Client'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
                Comparison of attributes modified during this action.
              </div>
              <div className="space-y-3">
                {Object.keys({ ...(oldValues || {}), ...(newValues || {}) }).map((key) => {
                  const oldVal = oldValues?.[key]
                  const newVal = newValues?.[key]
                  const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal)

                  return (
                    <div key={key} className="p-3 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">{key}</span>
                        {isChanged && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
                            Modified
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 font-mono text-rose-600 dark:text-rose-400 break-all">
                          <span className="text-[10px] block text-muted-foreground mb-1 uppercase font-sans">Previous Value:</span>
                          {oldVal !== undefined ? JSON.stringify(oldVal, null, 1) : '<empty>'}
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 font-mono text-emerald-600 dark:text-emerald-400 break-all">
                          <span className="text-[10px] block text-muted-foreground mb-1 uppercase font-sans">New Value:</span>
                          {newVal !== undefined ? JSON.stringify(newVal, null, 1) : '<empty>'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">Full Record JSON</span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-border shadow-inner leading-relaxed">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
          <CancelButton onClick={onClose} label={t('common.close', 'Close')} />
        </div>
      </div>
    </div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────────────

const ActivityLogsPage: React.FC = () => {
  const { t } = useTranslation()
  const qc = useQueryClient()
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
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'activity-logs' })

  // Filters
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // UI state
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActivityLog | null>(null)

  // 1. Fetch Dashboard Stats
  const { data: statsData, isFetching: isFetchingStats } = useQuery<ActivityLogDashboardStats>({
    queryKey: ['activity-logs-stats'],
    queryFn: activityLogService.getDashboardStats,
    staleTime: 60 * 1000,
  })

  // 2. Fetch Activity Logs
  const queryParams = useMemo(() => ({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    log_name: selectedModule !== 'all' ? selectedModule : undefined,
    event: selectedEvent !== 'all' ? selectedEvent : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [page, perPage, debouncedSearch, selectedModule, selectedEvent, dateFrom, dateTo])

  const {
    data: logsResponse,
    isFetching: isFetchingLogs,
    refetch,
  } = useQuery({
    queryKey: ['activity-logs', queryParams],
    queryFn: () => activityLogService.getLogs(queryParams),
    staleTime: 30 * 1000,
  })

  const logs: ActivityLog[] = logsResponse?.data ?? []
  const pagination = logsResponse?.pagination ?? {
    current_page: logsResponse?.current_page ?? 1,
    last_page: logsResponse?.last_page ?? 1,
    total: logsResponse?.total ?? 0,
    per_page: perPage,
  }

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => activityLogService.deleteLog(id),
    onSuccess: () => {
      toast.success(t('activityLogs.delete_success', 'Activity log removed successfully.'))
      adjustAfterDelete(logs.length)
      qc.invalidateQueries({ queryKey: ['activity-logs'] })
      qc.invalidateQueries({ queryKey: ['activity-logs-stats'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.error_occurred', 'Failed to remove log.'))
    },
  })

  // Export Filtered Logs to CSV
  const handleExportCSV = () => {
    if (!logs.length) {
      toast.error(t('activityLogs.no_data_export', t('common.noDataToExport', 'មិនមានទិន្នន័យដើម្បីនាំចេញទេ!')))
      return
    }

    const toastId = toast.info(t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...'))
    setTimeout(() => {
      const headers = ['ID', 'Date Time', 'Causer', 'Email', 'Event', 'Module', 'Description', 'IP Address']
      const rows = logs.map((l) => [
        l.id,
        formatDateTime(l.created_at),
        l.causer?.name || 'System',
        l.causer?.email || 'N/A',
        l.event || 'Activity',
        l.log_name || 'General',
        l.description || '',
        l.properties?.ip || 'N/A',
      ])

      downloadCsv('activity_logs', headers, rows)
      toast.dismiss(toastId)
      toast.success(t('activityLogs.export_success', t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!')))
    }, 400)
  }

  const handleResetFilters = () => {
    reset()
    setSelectedModule('all')
    setSelectedEvent('all')
    setDateFrom('')
    setDateTo('')
  }

  // Quick module filters
  const modulesList = [
    { key: 'all', label: 'All Modules' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders & POS' },
    { key: 'users', label: 'Users & Roles' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* ── Breadcrumb & Title ──────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Breadcrumb
            items={[
              { label: t('nav.administration', 'Administration'), path: '/users' },
              { label: t('nav.activityLogs', 'Activity Logs'), path: '/activity-logs' },
            ]}
          />
          <div className="space-y-1 mt-2 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight break-words">
              {t('activityLogs.page_title', 'System Audit & Activity Logs')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-3xl">
              {t('activityLogs.page_subtitle', 'Comprehensive audit trails for administrative security, data modifications, and system events.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full xl:w-auto xl:justify-end shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetchingLogs}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={isFetchingLogs ? 'animate-spin text-primary' : ''} />
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm shadow-primary/20 transition-all"
          >
            <Download size={14} />
            <span>{t('common.export', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* ── Metric KPI Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Events */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('activityLogs.stats.total_events', 'Total Operations')}
            </span>
            <div className="text-2xl font-black text-foreground">
              <AnimatedCounter value={statsData?.totalActivities ?? pagination.total} />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="font-semibold text-emerald-500">+{statsData?.todayActivities ?? 0}</span> today
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
        </div>

        {/* Card 2: Successful Operations */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('activityLogs.stats.success_actions', 'Successful Actions')}
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              <AnimatedCounter value={statsData?.successActions ?? Math.max(0, pagination.total - 2)} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Verified operational integrity
            </p>
          </div>
          <div className="relative">
            <CircularProgressRing
              percentage={
                statsData?.totalActivities
                  ? Math.round((statsData.successActions / statsData.totalActivities) * 100)
                  : 98
              }
              colorClass="text-emerald-500"
              size={48}
            />
          </div>
        </div>

        {/* Card 3: Security & Alerts */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('activityLogs.stats.security_alerts', 'Security Alerts / Errors')}
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              <AnimatedCounter value={statsData?.failedActions ?? 0} />
            </div>
            <p className="text-[11px] text-rose-500 font-medium">
              {statsData?.failedLogin ?? 0} failed login attempts
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Card 4: Active Operators */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('activityLogs.stats.active_operators', 'Active Operators')}
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              <AnimatedCounter value={statsData?.activeUsers ?? 1} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              ~{statsData?.averageActionsPerUser ?? 1} actions / operator
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search Control Bar (Frameless Toolbar) ────────────────── */}
      <div className="space-y-3 py-1">
        
        {/* Top Filter Row: Search & Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-4">
            <SearchInput
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder={t('activityLogs.search_placeholder', 'Search by description, action, IP, or user...')}
            />
          </div>

          {/* Module Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value)
                setPage(1)
              }}
              className="w-full h-10 px-3 text-xs bg-background hover:bg-muted border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all font-medium"
            >
              <option value="all">All Modules</option>
              <option value="auth">Auth & Session</option>
              <option value="products">Products</option>
              <option value="orders">Orders & Sales</option>
              <option value="inventory">Inventory</option>
              <option value="users">Users & Roles</option>
              <option value="settings">Settings</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Event Action Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value)
                setPage(1)
              }}
              className="w-full h-10 px-3 text-xs bg-background hover:bg-muted border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all font-medium"
            >
              <option value="all">All Action Types</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="login">Login / Auth</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          {/* Date From */}
          <div className="lg:col-span-2 relative">
            <EnterpriseDatePicker
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val)
                setPage(1)
              }}
              placeholder="Date From"
            />
          </div>

          {/* Date To & Reset */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <div className="flex-1">
              <EnterpriseDatePicker
                value={dateTo}
                onChange={(val) => {
                  setDateTo(val)
                  setPage(1)
                }}
                placeholder="Date To"
              />
            </div>
            {(search || selectedModule !== 'all' || selectedEvent !== 'all' || dateFrom || dateTo) && (
              <ResetButton onClick={handleResetFilters} iconOnly />
            )}
          </div>
        </div>

        {/* Quick Module Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
            <Filter size={12} />
            Quick:
          </span>
          {modulesList.map((m) => {
            const active = selectedModule === m.key
            return (
              <button
                key={m.key}
                onClick={() => {
                  setSelectedModule(m.key)
                  setPage(1)
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table Section ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <TableWrapper isFetching={isFetchingLogs}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                <th className="py-3.5 px-4">{t('activityLogs.th.timestamp', 'Date & Time')}</th>
                <th className="py-3.5 px-4">{t('activityLogs.th.causer', 'Operator / Causer')}</th>
                <th className="py-3.5 px-4">{t('activityLogs.th.event', 'Action Type')}</th>
                <th className="py-3.5 px-4">{t('activityLogs.th.module', 'Module & Target')}</th>
                <th className="py-3.5 px-4">{t('activityLogs.th.description', 'Description')}</th>
                <th className="py-3.5 px-4">{t('activityLogs.th.ip', 'Client Context')}</th>
                <th className="py-3.5 px-4 text-right">{t('activityLogs.th.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isFetchingLogs && logs.length === 0 ? (
                <LoadingSkeleton cols={7} rows={perPage} />
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const badge = getEventBadge(log.event, log.description)
                  const ip = log.properties?.ip ?? '127.0.0.1'
                  const ua = log.properties?.user_agent ?? 'System'

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/25 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">
                          {formatDateTime(log.created_at)}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          {formatRelativeTime(log.created_at)}
                        </div>
                      </td>

                      {/* Causer User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.causer ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {log.causer.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{log.causer.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{log.causer.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground italic text-xs">
                            <Shield size={13} className="text-primary/70" />
                            System
                          </span>
                        )}
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                          <badge.icon size={13} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Module & Subject */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${getModuleColor(log.log_name)}`}>
                            {log.log_name || 'System'}
                          </span>
                        </div>
                        {log.subject_type && (
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate max-w-[140px]" title={log.subject_type}>
                            {log.subject_type.split('\\').pop()} #{log.subject_id}
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="font-medium text-foreground truncate" title={log.description}>
                          {log.description}
                        </p>
                      </td>

                      {/* Client Context (IP & UA) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-foreground flex items-center gap-1">
                          <Globe size={12} className="text-muted-foreground" />
                          {ip}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[160px] mt-0.5" title={ua}>
                          {ua.includes('Mozilla') ? 'Browser / Web Client' : ua}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          onView={() => setSelectedLog(log)}
                          onDelete={() => setDeleteTarget(log)}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <EmptyState
                  message={t('activityLogs.no_logs_found', 'No activity audit logs found matching the selected criteria.')}
                  cols={7}
                />
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border bg-card">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            isLoading={isFetchingLogs}
          />
        </div>
      </div>

      {/* ── Detail Slide-Over Drawer ────────────────────────────────────────── */}
      <DetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* ── Delete Confirmation Dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('activityLogs.confirm_delete_title', 'Delete Audit Log Record')}
        message={t('activityLogs.confirm_delete_msg', 'Are you sure you want to permanently delete this activity audit log entry? This operation cannot be undone.')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ActivityLogsPage
