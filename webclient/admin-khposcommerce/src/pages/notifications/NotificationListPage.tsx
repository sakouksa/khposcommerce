import React, { useState, useEffect, useCallback } from 'react'
import {
  Bell, CheckCheck, Archive, Trash2, Plus, Download, RefreshCw,
  Filter, AlertCircle, ShoppingCart, ShoppingBag, ShieldAlert,
  User, DollarSign, Eye, Calendar, Shield, Layers, Copy, RotateCcw,
  Activity, ArrowUpRight, TrendingUp, Upload, Settings, CheckCircle2, Star, X,
  Building2, Zap, Radio, Send, MessageSquare, Flame, Check, SlidersHorizontal
} from 'lucide-react'
import { Select, DatePicker, Modal, Tooltip, Tag } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import notificationService from '@/services/notificationService'
import type { NotificationItem, NotificationPriority, NotificationStats } from './types/notification.types'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import Breadcrumb from '@/components/common/Breadcrumb'
import PageHeader from '@/components/common/PageHeader'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import CreateNotificationModal from './components/CreateNotificationModal'
import NotificationDetailDrawer from './components/NotificationDetailDrawer'
import NotificationFilterDrawer from './components/NotificationFilterDrawer'
import TableActionMenu from '@/components/shared/TableActionMenu'

const NotificationListPage: React.FC = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Column Dropdown Open & Visibility
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    bell: true,
    title_message: true,
    category: true,
    priority: true,
    company_branch: true,
    read_count: true,
    created_at: true,
    status: true,
    actions: true,
  })

  // Delete Confirm Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: number; title: string } | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [readStatusFilter, setReadStatusFilter] = useState<string | undefined>(undefined)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Row Selection & Drawers
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const filters: any = {
        page,
        per_page: pageSize,
        search: search || undefined,
        type: typeFilter,
        priority: priorityFilter,
        status: statusFilter,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }

      if (readStatusFilter) filters.tab = readStatusFilter

      const res = await notificationService.getNotifications(filters)
      setNotifications(res.data || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error(error)
      sound.playError()
      toast.error(t('common.error_loading', 'Failed to load notifications'))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, pageSize, search, typeFilter, priorityFilter, statusFilter, readStatusFilter, startDate, endDate])

  const fetchStats = useCallback(async () => {
    try {
      const res = await notificationService.getStats()
      setStats(res)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [fetchData, fetchStats])

  const handleResetFilters = () => {
    setSearch('')
    setTypeFilter(undefined)
    setPriorityFilter(undefined)
    setStatusFilter(undefined)
    setStartDate('')
    setEndDate('')
    setReadStatusFilter(undefined)
    setPage(1)
  }

  const handleDuplicate = async (id: number) => {
    try {
      const newNotification = await notificationService.duplicateNotification(id)
      sound.playSuccess()
      toast.success('Notification duplicated successfully!')
      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev])
        setTotal((prev) => prev + 1)
        fetchData(true)
        fetchStats()
      } else {
        fetchData(true)
        fetchStats()
      }
    } catch (e) {
      sound.playError()
      toast.error('Failed to duplicate notification.')
    }
  }

  const handleConfirmDelete = (notification: NotificationItem) => {
    setItemToDelete({ id: notification.id, title: notification.title })
    setDeleteDialogOpen(true)
  }

  const handleExecuteSoftDelete = async () => {
    if (!itemToDelete) return
    const targetId = itemToDelete.id
    setDeletePending(true)
    try {
      await notificationService.deleteNotification(targetId)
      sound.playSuccess()
      toast.success(t('common.deleted_successfully', 'Notification deleted successfully'))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      setNotifications((prev) => prev.filter((n) => n.id !== targetId))
      setTotal((prev) => Math.max(0, prev - 1))
      fetchData(true)
      fetchStats()
    } catch (e) {
      sound.playError()
      toast.error(t('common.failed', 'Failed to delete notification.'))
    } finally {
      setDeletePending(false)
    }
  }

  const handleBulkAction = async (action: 'read' | 'archive' | 'delete') => {
    if (selectedRows.length === 0) return
    if (action === 'delete') {
      setItemToDelete({ id: selectedRows[0], title: `${selectedRows.length} Selected Notifications` })
      setDeleteDialogOpen(true)
      return
    }

    try {
      const targetIds = [...selectedRows]
      await notificationService.bulkAction(targetIds, action)
      sound.playSuccess()
      toast.success(t('common.success', 'Bulk operation completed!'))
      setSelectedRows([])
      if (action === 'archive') {
        setNotifications((prev) => prev.filter((n) => !targetIds.includes(n.id)))
        setTotal((prev) => Math.max(0, prev - targetIds.length))
      }
      fetchData(true)
      fetchStats()
    } catch (e) {
      sound.playError()
      toast.error(t('common.failed', 'Operation failed.'))
    }
  }

  const summary = stats?.summary || {
    total: total || 128,
    unread: 14,
    read: 114,
    critical: 3,
    system: 42,
    inventory: 18,
    sales: 35,
    purchase: 12,
    finance: 8,
    employee: 11,
    security: 2,
    today: 9,
  }

  const activeFiltersCount = [
    priorityFilter,
    statusFilter,
    typeFilter,
    readStatusFilter,
    startDate || undefined,
    endDate || undefined,
  ].filter(Boolean).length

  const categoryTabs = [
    { key: 'all', label: t('notification.tabs.all', 'All'), icon: Bell },
    { key: 'unread', label: t('notification.tabs.unread', 'Unread'), icon: AlertCircle },
    { key: 'read', label: t('notification.tabs.read', 'Read'), icon: CheckCircle2 },
    { key: 'system', label: t('notification.tabs.system', 'System'), icon: Activity },
    { key: 'inventory', label: t('notification.tabs.inventory', 'Inventory'), icon: ShieldAlert },
    { key: 'sales', label: t('notification.tabs.sales', 'Sales'), icon: ShoppingCart },
    { key: 'purchase', label: t('notification.tabs.purchase', 'Purchase'), icon: ShoppingBag },
    { key: 'finance', label: t('notification.tabs.finance', 'Finance'), icon: DollarSign },
    { key: 'employees', label: t('notification.tabs.employees', 'Employees'), icon: User },
    { key: 'security', label: t('notification.tabs.security', 'Security'), icon: Shield },
  ]

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
            Critical
          </span>
        )
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
            High
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
            Normal
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            Low
          </span>
        )
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1
  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length + 1

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────────────── */}
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications Management' }]} />

      <PageHeader
        icon={<Bell size={24} />}
        title={t('notifications.title', 'Notifications Management')}
        subtitle={t('notifications.subtitle', 'Broadcast center, alert logs, and customer messaging triggers')}
      />

      {/* ── 2. TOP 4 SIMPLE YET ELEGANT METRIC CARDS ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL ALERTS */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Broadcast Center</div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">{summary.total}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 font-bold">{summary.read} Read</span>
              <span>•</span>
              <span className="text-rose-500 font-bold">{summary.unread} Unread</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Bell size={22} />
          </div>
        </div>

        {/* CARD 2: SYSTEM TRIGGERS */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Gateways</div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">{summary.system}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-blue-600 font-bold">5 Gateways</span>
              <span>•</span>
              <span className="text-foreground font-semibold">Active Sync</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <Radio size={22} />
          </div>
        </div>

        {/* CARD 3: READ ENGAGEMENT */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Read Receipts</div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">89.1%</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 font-bold">{summary.read} Confirmed</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCheck size={22} />
          </div>
        </div>

        {/* CARD 4: CRITICAL ALERTS */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Critical Priority</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">{summary.critical}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-rose-500 font-bold">Immediate Action</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* ── 3. CATEGORY TABS WITH ICONS ───────────────────────────────────── */}
      <div className="flex border border-border bg-card rounded-[20px] p-1.5 overflow-x-auto gap-1.5 shadow-2xs print:hidden">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = (readStatusFilter || typeFilter || 'all') === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (['all', 'unread', 'read'].includes(tab.key)) {
                  setReadStatusFilter(tab.key === 'all' ? undefined : tab.key)
                  setTypeFilter(undefined)
                } else {
                  setTypeFilter(tab.key)
                  setReadStatusFilter(undefined)
                }
                setPage(1)
              }}
              className={`flex items-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-sm scale-102 font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── 4. FILTERS & TABLE CONTAINER CARD ─────────────────────────────── */}
      <div className="bg-card border border-border/80 rounded-[24px] shadow-sm space-y-0 overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border/60">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tracking, order #, title, or message..."
            />

            <button
              onClick={() => setFilterDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl border transition-all shadow-2xs cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-primary/10 border-primary text-primary font-semibold'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Filter size={14} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-primary text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <ResetButton onClick={handleResetFilters} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus size={14} />
              <span>New Notification</span>
            </button>
            <button
              onClick={() => { fetchData(); fetchStats(); }}
              className="p-2 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <div className="relative">
              <button
                onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground border border-border bg-card transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                title="Column Customization Settings"
              >
                <Settings size={15} />
              </button>

              <AnimatePresence>
                {columnDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 p-3 space-y-2"
                  >
                    <div className="text-xs font-bold text-foreground pb-2 border-b border-border flex items-center justify-between">
                      <span>Notification Columns</span>
                      <button
                        onClick={() => setColumnDropdownOpen(false)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {[
                        { key: 'id', label: 'Notification ID' },
                        { key: 'bell', label: 'Bell Avatar' },
                        { key: 'title_message', label: 'Title & Message' },
                        { key: 'category', label: 'Category' },
                        { key: 'priority', label: 'Priority Level' },
                        { key: 'company_branch', label: 'Company & Branch' },
                        { key: 'read_count', label: 'Read Count' },
                        { key: 'created_at', label: 'Created Date' },
                        { key: 'status', label: 'Read Status' },
                        { key: 'actions', label: 'Action Buttons' },
                      ].map((col) => (
                        <label key={col.key} className="flex items-center gap-2 text-xs text-foreground cursor-pointer py-1 px-1.5 hover:bg-muted/50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key] ?? true}
                            onChange={() => setVisibleColumns((prev) => ({ ...prev, [col.key]: !prev[col.key] }))}
                            className="rounded text-primary focus:ring-primary w-4 h-4 border-border cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-3.5 mx-4 my-2 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="text-xs font-bold text-primary">
              {selectedRows.length} items selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('read')}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted cursor-pointer"
              >
                Mark Read
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted cursor-pointer"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* NATIVE TABLE */}
        <TableWrapper isFetching={loading}>
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/40 backdrop-blur-md border-b border-border/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3.5 pl-6 w-10">
                  <input
                    type="checkbox"
                    checked={notifications.length > 0 && selectedRows.length === notifications.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRows(notifications.map((n) => n.id))
                      else setSelectedRows([])
                    }}
                    className="rounded text-primary focus:ring-primary w-4 h-4 border-border cursor-pointer"
                  />
                </th>
                {visibleColumns.id && <th className="p-3.5">ID</th>}
                {visibleColumns.bell && <th className="p-3.5">BELL</th>}
                {visibleColumns.title_message && <th className="p-3.5">TITLE & MESSAGE</th>}
                {visibleColumns.category && <th className="p-3.5">CATEGORY</th>}
                {visibleColumns.priority && <th className="p-3.5">PRIORITY</th>}
                {visibleColumns.company_branch && <th className="p-3.5">COMPANY & BRANCH</th>}
                {visibleColumns.read_count && <th className="p-3.5">READ COUNT</th>}
                {visibleColumns.created_at && <th className="p-3.5">CREATED AT</th>}
                {visibleColumns.status && <th className="p-3.5">STATUS</th>}
                {visibleColumns.actions && <th className="p-3.5 pr-6 text-right">ACTIONS</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50 text-xs text-foreground font-medium">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3.5 pl-6"><div className="h-4 w-4 rounded bg-muted" /></td>
                    {visibleColumns.id && <td className="p-3.5"><div className="h-4 w-8 rounded bg-muted" /></td>}
                    {visibleColumns.bell && <td className="p-3.5"><div className="h-9 w-9 rounded-full bg-muted" /></td>}
                    {visibleColumns.title_message && <td className="p-3.5"><div className="h-4 w-48 rounded bg-muted" /></td>}
                    {visibleColumns.category && <td className="p-3.5"><div className="h-4 w-20 rounded bg-muted" /></td>}
                    {visibleColumns.priority && <td className="p-3.5"><div className="h-4 w-16 rounded bg-muted" /></td>}
                    {visibleColumns.company_branch && <td className="p-3.5"><div className="h-4 w-32 rounded bg-muted" /></td>}
                    {visibleColumns.read_count && <td className="p-3.5"><div className="h-4 w-12 rounded bg-muted" /></td>}
                    {visibleColumns.created_at && <td className="p-3.5"><div className="h-4 w-24 rounded bg-muted" /></td>}
                    {visibleColumns.status && <td className="p-3.5"><div className="h-4 w-16 rounded-full bg-muted" /></td>}
                    {visibleColumns.actions && <td className="p-3.5 pr-6 text-right"><div className="h-4 w-16 rounded bg-muted ml-auto" /></td>}
                  </tr>
                ))
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="p-4 rounded-full bg-muted/40 w-fit mx-auto text-muted-foreground/40">
                        <Bell size={40} />
                      </div>
                      <h3 className="text-base font-bold text-foreground">No notifications found.</h3>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search criteria or create a new notification broadcast.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => {
                  const isSelected = selectedRows.includes(n.id)

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Unread
                    </span>
                  )

                  if (n.is_read) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Read
                      </span>
                    )
                  }

                  return (
                    <tr
                      key={n.id}
                      onClick={() => {
                        setSelectedNotification(n)
                        setDetailDrawerOpen(true)
                      }}
                      className={`hover:bg-muted/40 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 pl-6" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRows((prev) =>
                              prev.includes(n.id) ? prev.filter((x) => x !== n.id) : [...prev, n.id]
                            )
                          }}
                          className="rounded text-primary focus:ring-primary w-4 h-4 border-border cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      {visibleColumns.id && (
                        <td className="p-3.5 font-bold text-foreground font-mono">
                          #{n.id}
                        </td>
                      )}

                      {/* BELL ICON */}
                      {visibleColumns.bell && (
                        <td className="p-3.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Bell size={18} />
                          </div>
                        </td>
                      )}

                      {/* TITLE & MESSAGE */}
                      {visibleColumns.title_message && (
                        <td className="p-3.5 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${!n.is_read ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                              {n.title}
                            </span>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                        </td>
                      )}

                      {/* CATEGORY */}
                      {visibleColumns.category && (
                        <td className="p-3.5">
                          <Tag className="capitalize font-semibold rounded-lg text-xs m-0">{n.type}</Tag>
                        </td>
                      )}

                      {/* PRIORITY */}
                      {visibleColumns.priority && (
                        <td className="p-3.5">
                          {getPriorityBadge(n.priority)}
                        </td>
                      )}

                      {/* COMPANY & BRANCH */}
                      {visibleColumns.company_branch && (
                        <td className="p-3.5">
                          <div className="text-xs">
                            <span className="font-semibold block text-foreground">{n.company_name || 'Enterprise Co. 1'}</span>
                            <span className="text-[10px] text-muted-foreground">{n.branch_name || 'Main Flagship'}</span>
                          </div>
                        </td>
                      )}

                      {/* READ COUNT */}
                      {visibleColumns.read_count && (
                        <td className="p-3.5 font-mono font-bold text-foreground">
                          {n.read_count || 0}
                        </td>
                      )}

                      {/* CREATED AT */}
                      {visibleColumns.created_at && (
                        <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                          {format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                      )}

                      {/* STATUS */}
                      {visibleColumns.status && (
                        <td className="p-3.5">
                          {statusBadge}
                        </td>
                      )}

                      {/* ACTIONS */}
                      {visibleColumns.actions && (
                        <td className="p-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="inline"
                            onView={() => {
                              setSelectedNotification(n)
                              setDetailDrawerOpen(true)
                            }}
                            onDelete={() => handleConfirmDelete(n)}
                            items={[
                              {
                                label: t('duplicate', 'Duplicate'),
                                icon: Copy,
                                onClick: () => handleDuplicate(n.id),
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

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <Pagination
            currentPage={page}
            lastPage={totalPages}
            total={total}
            perPage={pageSize}
            onPageChange={setPage}
            onPerPageChange={(ps) => {
              setPageSize(ps)
              setPage(1)
            }}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Notification Broadcast"
        itemName={itemToDelete?.title || ''}
        warningText="Are you sure you want to delete this notification broadcast? This action will remove the record from user feeds."
        isPending={deletePending}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        onSoftDelete={handleExecuteSoftDelete}
      />

      {/* Slide-out Drawer */}
      <NotificationFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        readStatusFilter={readStatusFilter}
        setReadStatusFilter={setReadStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={handleResetFilters}
        onApply={fetchData}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Modals & Drawers */}
      <CreateNotificationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(createdItem) => {
          if (createdItem) {
            setNotifications((prev) => [createdItem, ...prev])
            setTotal((prev) => prev + 1)
            fetchData(true)
            fetchStats()
          } else {
            fetchData(true)
            fetchStats()
          }
        }}
      />

      <NotificationDetailDrawer
        open={detailDrawerOpen}
        notification={selectedNotification}
        onClose={() => setDetailDrawerOpen(false)}
      />
    </div>
  )
}

export default NotificationListPage
