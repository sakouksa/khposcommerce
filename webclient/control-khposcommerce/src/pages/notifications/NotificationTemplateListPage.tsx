import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, RefreshCw, Search, Eye, Edit2, Trash2, Tag, Copy,
  CheckCircle2, AlertCircle, DollarSign, ShieldAlert, Settings, Star,
  Layers, X, Radio, Send, Bell, Code, Mail, Smartphone, Building2,
  HardDrive, Activity, Key, Ban
} from 'lucide-react'
import { Input, Modal, Tooltip, Switch } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import notificationService from '@/services/notificationService'
import type { NotificationTemplateItem } from './types/notification.types'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import Breadcrumb from '@/components/common/Breadcrumb'
import PageHeader from '@/components/common/PageHeader'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import TemplateEditorModal from './components/TemplateEditorModal'
import TemplatePreviewDrawer from './components/TemplatePreviewDrawer'
import ToggleSwitch from '@/components/common/ToggleSwitch'


// ─── Modern Card Helpers ──────────────────────────────────────────────────

const getPresetTypeConfig = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'broadcast':
      return {
        icon: <Radio size={16} />,
        label: 'Broadcast',
        gradientBar: 'from-indigo-500 via-purple-500 to-blue-500',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-indigo-500/10',
        badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
      }
    case 'shops':
    case 'company':
      return {
        icon: <Building2 size={16} />,
        label: 'Tenants',
        gradientBar: 'from-purple-500 via-violet-500 to-fuchsia-500',
        iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/10',
        badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
      }
    case 'billing':
    case 'payment':
    case 'finance':
      return {
        icon: <DollarSign size={16} />,
        label: 'Billing',
        gradientBar: 'from-emerald-500 via-teal-500 to-green-500',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
      }
    case 'system':
      return {
        icon: <Code size={16} />,
        label: 'System',
        gradientBar: 'from-cyan-500 via-teal-500 to-blue-500',
        iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 shadow-cyan-500/10',
        badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'
      }
    case 'security':
      return {
        icon: <ShieldAlert size={16} />,
        label: 'Security',
        gradientBar: 'from-rose-500 via-red-500 to-pink-500',
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-rose-500/10',
        badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
      }
    default:
      return {
        icon: <FileText size={16} />,
        label: 'Template',
        gradientBar: 'from-slate-400 via-slate-500 to-slate-600',
        iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 shadow-slate-500/10',
        badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
      }
  }
}

const getPriorityBadgeStyle = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 shadow-2xs'
    case 'high':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-2xs'
    case 'low':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25 shadow-2xs'
    default:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 shadow-2xs'
  }
}

const renderHighlightedMessage = (text: string) => {
  if (!text) return null
  const parts = text.split(/(\{[\w_]+\})/g)
  return parts.map((part, idx) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 mx-0.5 select-all"
        >
          {part}
        </span>
      )
    }
    return <span key={idx}>{part}</span>
  })
}


const NotificationTemplateListPage: React.FC = () => {
  const { t } = useTranslation(['notification', 'nav', 'common'])
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  // Delete Confirm Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<{ id: number; name: string } | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [togglingIds, setTogglingIds] = useState<number[]>([])

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateItem | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplateItem | null>(null)

  const fetchTemplates = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await notificationService.getTemplates({
        page,
        per_page: pageSize,
        search: search || undefined,
        type: typeFilter,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      })
      setTemplates(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      console.error(e)
      sound.playError()
      toast.error('Failed to load notification templates.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page, pageSize, search, typeFilter, statusFilter])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleResetFilters = () => {
    setSearch('')
    setTypeFilter(undefined)
    setStatusFilter(undefined)
    setPage(1)
  }

  const handleToggleActive = async (template: NotificationTemplateItem) => {
    const targetId = template.id
    const previousStatus = template.is_active
    const nextStatus = !previousStatus

    // Optimistic UI update: immediately change state for smooth, instant response
    setTemplates((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, is_active: nextStatus } : t))
    )
    setTogglingIds((prev) => [...prev, targetId])

    try {
      await notificationService.toggleTemplateStatus(targetId)
      sound.playSuccess()
      toast.success('Template status updated successfully!')
    } catch (e) {
      // Rollback state if network API call fails
      setTemplates((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, is_active: previousStatus } : t))
      )
      sound.playError()
      toast.error('Failed to update template status.')
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== targetId))
    }
  }

  const handleConfirmDelete = (template: NotificationTemplateItem) => {
    setTemplateToDelete({ id: template.id, name: template.name })
    setDeleteDialogOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (!templateToDelete) return
    const targetId = templateToDelete.id
    setDeletePending(true)
    try {
      await notificationService.deleteTemplate(targetId)
      sound.playSuccess()
      toast.success('Template deleted successfully!')
      // Optimistic delete: remove from state immediately with no page refresh
      setTemplates((prev) => prev.filter((t) => t.id !== targetId))
      setTotal((prev) => Math.max(0, prev - 1))
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      fetchTemplates(true)
    } catch (e) {
      sound.playError()
      toast.error('Failed to delete template.')
    } finally {
      setDeletePending(false)
    }
  }

  const handleDuplicate = async (id: number) => {
    try {
      const newTemplate = await notificationService.duplicateTemplate(id)
      sound.playSuccess()
      toast.success('Template duplicated successfully!')
      if (newTemplate) {
        setTemplates((prev) => [newTemplate, ...prev])
        setTotal((prev) => prev + 1)
      }
      fetchTemplates(true)
    } catch (e) {
      sound.playError()
      toast.error('Failed to duplicate template.')
    }
  }

  const handleSaveSuccess = (savedItem?: NotificationTemplateItem | null) => {
    if (savedItem) {
      if (editingTemplate) {
        // Optimistic update: replace updated item in state with no page refresh or skeleton flash
        setTemplates((prev) =>
          prev.map((t) => (t.id === savedItem.id ? { ...t, ...savedItem } : t))
        )
      } else {
        // Optimistic insert: prepend new item to list with no page refresh or skeleton flash
        setTemplates((prev) => [savedItem, ...prev])
        setTotal((prev) => prev + 1)
      }
    }
    // Silent sync with server in background
    fetchTemplates(true)
  }

  // Summary Metrics (SaaS Platform Super Admin)
  const activeCount = templates.filter((t) => t.is_active).length
  const inactiveCount = templates.filter((t) => !t.is_active).length
  const broadcastCount = templates.filter((t) => t.type === 'broadcast').length
  const shopsCount = templates.filter((t) => t.type === 'shops' || t.type === 'company').length
  const billingCount = templates.filter((t) => t.type === 'billing' || t.type === 'payment' || t.type === 'finance').length
  const systemCount = templates.filter((t) => t.type === 'system').length
  const securityCount = templates.filter((t) => t.type === 'security').length

  const categoryTabs = [
    { key: 'all', label: t('notification.tabs.all', 'All Templates') },
    { key: 'active', label: t('notification.tabs.active', 'Active Only') },
    { key: 'broadcast', label: t('notification.tabs.broadcast', 'Broadcasts') },
    { key: 'shops', label: t('notification.tabs.shops', 'Shops & Tenants') },
    { key: 'billing', label: t('notification.tabs.billing', 'SaaS Billing') },
    { key: 'system', label: t('notification.tabs.system', 'System') },
    { key: 'security', label: t('notification.tabs.security', 'Security') },
    { key: 'inactive', label: t('notification.tabs.inactive', 'Disabled') },
  ]

  return (
    <div className="space-y-5 print:p-0">
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────────────── */}
      <Breadcrumb items={[{ label: t('nav.notificationTemplates', 'Notification Templates') }]} />

      <PageHeader
        icon={<FileText size={24} className="text-primary" />}
        title={t('notification.templates_title', 'Notification Templates')}
        subtitle={t('notification.templates_subtitle', 'Manage message presets, automated triggers, and localized notification copy')}
      />

      {/* ── 2. TOP 4 SIMPLE YET ELEGANT METRIC CARDS ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL TEMPLATES */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('notification.summary.total_templates', 'Template Library')}
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">{total || templates.length} Presets</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 font-bold">{activeCount} {t('notification.tabs.active', 'Active')}</span>
              <span>•</span>
              <span className="text-muted-foreground font-semibold">{inactiveCount} {t('notification.tabs.inactive', 'Disabled')}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <FileText size={22} />
          </div>
        </div>

        {/* CARD 2: BROADCAST PRESETS */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('notification.tabs.broadcast', 'Broadcast Announcements')}
            </div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">{broadcastCount} Presets</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-indigo-600 font-bold">Global Tenant Notices</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
            <Radio size={22} />
          </div>
        </div>

        {/* CARD 3: MULTI-CHANNEL GATEWAYS */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tenant Gateways</div>
            <div className="text-2xl font-black text-foreground mt-1 tracking-tight">3 Channels</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-blue-600 font-bold">Email • Push • SMS</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
            <Send size={22} />
          </div>
        </div>

        {/* CARD 4: AUTOMATION ACCURACY */}
        <div className="p-5 rounded-[20px] bg-card border border-border/80 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dispatch SLA</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">99.8%</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 font-bold">100% Reliable</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* ── 3. SECOND ROW: 6 QUICK MINI METRIC CARDS ──────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Active Templates */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'active' ? undefined : 'active')
            setTypeFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            statusFilter === 'active' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border/70 hover:border-primary/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Plus size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-foreground">+{activeCount} Active</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">Templates Ready</div>
          </div>
        </button>

        {/* 2. Broadcast Templates */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'broadcast' ? undefined : 'broadcast')
            setStatusFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            typeFilter === 'broadcast' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5' : 'border-border/70 hover:border-indigo-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <Radio size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{broadcastCount}</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">Broadcasts</div>
          </div>
        </button>

        {/* 3. Shops & Tenants */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'shops' ? undefined : 'shops')
            setStatusFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            typeFilter === 'shops' ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5' : 'border-border/70 hover:border-purple-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
            <Building2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{shopsCount}</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">Tenant Presets</div>
          </div>
        </button>

        {/* 4. SaaS Billing */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'billing' ? undefined : 'billing')
            setStatusFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            typeFilter === 'billing' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' : 'border-border/70 hover:border-emerald-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <DollarSign size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{billingCount}</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">SaaS Billing</div>
          </div>
        </button>

        {/* 5. System Infrastructure */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'system' ? undefined : 'system')
            setStatusFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            typeFilter === 'system' ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/5' : 'border-border/70 hover:border-cyan-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
            <Code size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{systemCount}</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">System Health</div>
          </div>
        </button>

        {/* 6. Platform Security */}
        <button
          onClick={() => {
            setTypeFilter(typeFilter === 'security' ? undefined : 'security')
            setStatusFilter(undefined)
          }}
          className={`p-3.5 rounded-[20px] bg-card border shadow-2xs flex items-center gap-3 transition-all text-left cursor-pointer ${
            typeFilter === 'security' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5' : 'border-border/70 hover:border-rose-500/40'
          }`}
        >
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{securityCount}</div>
            <div className="text-[10px] text-muted-foreground font-medium truncate">Security Presets</div>
          </div>
        </button>
      </div>

      {/* ── 4. CATEGORY TABS ──────────────────────────────────────────────── */}
      <div className="flex border border-border bg-card rounded-[20px] p-1.5 overflow-x-auto gap-1.5 shadow-2xs print:hidden">
        {categoryTabs.map((tab) => {
          const isActive = (typeFilter || statusFilter || 'all') === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'all') {
                  setTypeFilter(undefined)
                  setStatusFilter(undefined)
                } else if (tab.key === 'active' || tab.key === 'inactive') {
                  setStatusFilter(tab.key)
                  setTypeFilter(undefined)
                } else {
                  setTypeFilter(tab.key)
                  setStatusFilter(undefined)
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm scale-102 font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── 5. SEARCH & TOOLBAR HEADER ────────────────────────────────────── */}
      <div className="bg-card border border-border/80 rounded-[24px] p-4 shadow-sm space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <Input
              placeholder="Search by code or template name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => fetchTemplates()}
              prefix={<Search className="w-4 h-4 text-muted-foreground" />}
              allowClear
              className="rounded-xl text-xs py-1.5"
            />
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTemplate(null)
                setCreateModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>New Template</span>
            </button>
            <button
              onClick={() => fetchTemplates()}
              className="p-2 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 6. ULTRA-MODERN NOTIFICATION TEMPLATE GRID CARDS (NO TABLE) ────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-[24px] bg-card border border-border/70 animate-pulse h-48" />
          ))
        ) : templates.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card border border-border rounded-[24px]">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-bold text-foreground text-base">No notification templates found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try resetting search or category filters</p>
          </div>
        ) : (
          templates.map((record) => {
            const typeConfig = getPresetTypeConfig(record.type)
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative group bg-card border border-border/80 hover:border-primary/40 rounded-2xl p-5 shadow-2xs hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >

                <div className="space-y-3.5">
                  {/* Card Header: Icon, Code & Clean Toggle Switch */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${typeConfig.iconBg} border flex items-center justify-center font-bold flex-shrink-0 shadow-2xs`}>
                        {typeConfig.icon}
                      </div>
                      <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50 truncate max-w-[130px]" title={`#${record.code}`}>
                          #{record.code}
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${typeConfig.badgeBg}`}>
                          {typeConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold ${record.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {record.is_active ? 'Active' : 'Off'}
                      </span>
                      <ToggleSwitch
                        checked={record.is_active}
                        loading={togglingIds.includes(record.id)}
                        onChange={() => handleToggleActive(record)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Card Body: Title, Priority, Subject & Payload Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1" title={record.name}>
                        {record.name}
                      </h3>
                      {record.priority && (
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${getPriorityBadgeStyle(record.priority)}`}>
                          {record.priority}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">Subject:</span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {record.title_template || 'Notification Alert'}
                      </span>
                    </div>

                    {record.message_template && (
                      <div className="p-3 rounded-xl bg-muted/30 dark:bg-muted/20 border border-border/50 text-foreground/90 font-sans text-xs leading-relaxed line-clamp-2">
                        {renderHighlightedMessage(record.message_template)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Channels & Action Toolbar */}
                <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-muted/50 text-muted-foreground border border-border/50">
                      <Mail size={11} /> EMAIL
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-muted/50 text-muted-foreground border border-border/50">
                      <Smartphone size={11} /> PUSH
                    </span>
                  </div>


                  <div className="flex items-center gap-0.5 bg-muted/40 dark:bg-muted/30 p-1 rounded-xl border border-border/60">
                    <Tooltip title="Preview Template">
                      <button
                        onClick={() => setPreviewTemplate(record)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Edit Template">
                      <button
                        onClick={() => {
                          setEditingTemplate(record)
                          setCreateModalOpen(true)
                        }}
                        className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Duplicate Preset">
                      <button
                        onClick={() => handleDuplicate(record.id)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Copy size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Delete Template">
                      <button
                        onClick={() => handleConfirmDelete(record)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Pagination Bar */}
      <div className="bg-card border border-border/80 rounded-[24px] p-4 shadow-2xs">
        <Pagination
          currentPage={page}
          lastPage={Math.ceil(total / pageSize) || 1}
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

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Notification Template"
        itemName={templateToDelete?.name || ''}
        warningText="Are you sure you want to delete this notification template preset? This action cannot be undone."
        isPending={deletePending}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setTemplateToDelete(null)
        }}
        onSoftDelete={handleExecuteDelete}
      />

      {/* Create / Edit Modal */}
      <TemplateEditorModal
        open={createModalOpen}
        template={editingTemplate}
        onClose={() => {
          setCreateModalOpen(false)
          setEditingTemplate(null)
        }}
        onSuccess={handleSaveSuccess}
      />

      {/* Preview Drawer (Slide-over Panel matching Inventory Detail Card) */}
      <TemplatePreviewDrawer
        open={previewTemplate !== null}
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  )
}

export default NotificationTemplateListPage
