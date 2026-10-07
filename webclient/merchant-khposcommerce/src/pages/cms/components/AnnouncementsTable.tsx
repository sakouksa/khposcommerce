import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone,
  Sparkles,
  Eye,
  Tag,
  ExternalLink,
  Ticket,
  Check,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Power,
  Layers,
  X,
  LayoutGrid,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cmsService } from '@/services/cmsService'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import { downloadCsv } from '@/utils/export'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import TableToolbar from '@/components/common/tables/TableToolbar'
import Pagination from '@/components/shared/Pagination'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import type { AnnouncementConfig } from '../types/cms.types'

const SEASONAL_PRESETS = [
  {
    nameKey: 'cms.presetFreeShipping',
    messageKmKey: 'cms.presetFreeShippingKmMsg',
    messageEnKey: 'cms.presetFreeShippingEnMsg',
    badge: 'FREE DELIVERY',
    coupon: 'FREESHIP50',
    link: '/products',
    bg: 'from-blue-600 to-indigo-700',
  },
  {
    nameKey: 'cms.presetKny',
    messageKmKey: 'cms.presetKnyKmMsg',
    messageEnKey: 'cms.presetKnyEnMsg',
    badge: 'KHMER NEW YEAR',
    coupon: 'KNY2026',
    link: '/promotions',
    bg: 'from-amber-600 to-rose-600',
  },
  {
    nameKey: 'cms.presetMidMonth',
    messageKmKey: 'cms.presetMidMonthKmMsg',
    messageEnKey: 'cms.presetMidMonthEnMsg',
    badge: 'FLASH DEAL',
    coupon: 'MIDMONTH',
    link: '/promotions',
    bg: 'from-purple-600 to-pink-600',
  },
]

export interface AnnouncementsTableProps {
  triggerCreate?: number
  triggerExport?: number
}

export const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({
  triggerCreate = 0,
  triggerExport = 0,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  // View Mode: 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Search & Filter
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Sorting
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Selections
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  // Modal Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [messageKm, setMessageKm] = useState('')
  const [messageEn, setMessageEn] = useState('')
  const [badgeText, setBadgeText] = useState('SPECIAL PROMO')
  const [couponCode, setCouponCode] = useState('OPTAPOS2026')
  const [linkUrl, setLinkUrl] = useState('/promotions')
  const [bgGradient, setBgGradient] = useState('from-indigo-600 to-purple-700')

  // Preview language toggle: 'km' | 'en'
  const [previewLang, setPreviewLang] = useState<'km' | 'en'>('km')
  // Preset category tab: 'coupons' | 'seasonal'
  const [presetCategory, setPresetCategory] = useState<'coupons' | 'seasonal'>('coupons')

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    message: true,
    badgeCoupon: true,
    gradient: true,
    status: true,
    actions: true,
  })

  // 1. Fetch ALL announcement campaigns directly from Database table
  const {
    data: announcementsResponse,
    isLoading: isListLoading,
    isFetching,
  } = useQuery({
    queryKey: ['announcements-db-list'],
    queryFn: () => cmsService.getAnnouncementsList({ per_page: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const rawList: AnnouncementConfig[] = useMemo(() => {
    if (!announcementsResponse) return []
    const d = announcementsResponse?.data
    if (Array.isArray(d)) return d
    if (Array.isArray(d?.data)) return d.data
    if (Array.isArray(announcementsResponse)) return announcementsResponse
    return []
  }, [announcementsResponse])

  // Find currently active announcement from DB for Live Preview
  const activeAnnouncementFromDb = useMemo(() => {
    return rawList.find((a) => a.is_active) || rawList[0] || null
  }, [rawList])

  // 2. Fetch active store coupons dynamically from Database
  const { data: couponsData, isLoading: isCouponsLoading } = useQuery({
    queryKey: ['store-active-coupons-for-announcement'],
    queryFn: () => marketingService.getCoupons({ per_page: 20 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const liveCoupons = useMemo(() => {
    if (!couponsData) return []
    const d = couponsData?.data
    const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : (Array.isArray(couponsData) ? couponsData : []))
    return list.filter((c: any) => c.is_active !== false)
  }, [couponsData])

  // Sync initial form with active announcement if not editing
  useEffect(() => {
    if (activeAnnouncementFromDb && editingId === null) {
      setEditingId(activeAnnouncementFromDb.id || null)
      setTitle(activeAnnouncementFromDb.title || '')
      setEnabled(activeAnnouncementFromDb.is_active ?? true)
      setMessageKm(activeAnnouncementFromDb.message_km || '')
      setMessageEn(activeAnnouncementFromDb.message_en || activeAnnouncementFromDb.message || '')
      setBadgeText(activeAnnouncementFromDb.badge_text || 'SPECIAL PROMO')
      setCouponCode(activeAnnouncementFromDb.coupon_code || activeAnnouncementFromDb.code || '')
      setLinkUrl(activeAnnouncementFromDb.link_url || activeAnnouncementFromDb.link || '/promotions')
      setBgGradient(activeAnnouncementFromDb.bg_gradient || 'from-indigo-600 to-purple-700')
    }
  }, [activeAnnouncementFromDb])

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      // Status filter
      if (filterStatus === 'active' && !item.is_active) return false
      if (filterStatus === 'inactive' && item.is_active) return false

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(q)
        const matchKm = (item.message_km || '').toLowerCase().includes(q)
        const matchEn = (item.message_en || item.message || '').toLowerCase().includes(q)
        const matchCode = (item.coupon_code || item.code || '').toLowerCase().includes(q)
        const matchBadge = (item.badge_text || '').toLowerCase().includes(q)
        if (!matchTitle && !matchKm && !matchEn && !matchCode && !matchBadge) return false
      }

      return true
    }).sort((a: any, b: any) => {
      const fieldA = a[sortBy] ?? ''
      const fieldB = b[sortBy] ?? ''
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [rawList, filterStatus, search, sortBy, sortOrder])

  // Pagination slicing
  const totalItems = filteredList.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * perPage
    return filteredList.slice(startIndex, startIndex + perPage)
  }, [filteredList, page, perPage])

  // Status counts for workspace tabs
  const statusCounts = useMemo(() => {
    const total = rawList.length
    const active = rawList.filter((a) => Boolean(a.is_active)).length
    const inactive = rawList.filter((a) => !a.is_active).length
    return { all: total, active, inactive }
  }, [rawList])

  const statusTabs: WorkspaceTabItem[] = useMemo(() => [
    { id: 'all', label: t('cms.allCampaigns', 'All Campaigns'), count: statusCounts.all },
    { id: 'active', label: t('cms.active', 'Active'), count: statusCounts.active },
    { id: 'inactive', label: t('cms.inactive', 'Inactive'), count: statusCounts.inactive },
  ], [statusCounts, t])

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const renderSortIcon = (columnKey: string) => {
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingId) {
        return cmsService.updateAnnouncement(editingId, data)
      }
      return cmsService.createAnnouncement(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      qc.invalidateQueries({ queryKey: ['announcement-settings'] })
      setIsFormModalOpen(false)
      toast.success(editingId ? t('cms.announcementUpdated', 'Announcement updated successfully!') : t('cms.announcementCreated', 'Announcement created successfully!'))
    },
    onError: () => {
      toast.error(t('cms.announcementSaveFailed', 'Failed to save announcement'))
    },
  })

  // Toggle active announcement mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => cmsService.toggleAnnouncementActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      toast.success(t('cms.announcementActiveSuccess', 'Storefront announcement updated!'))
    },
    onError: () => {
      toast.error(t('cms.statusChangeFailed', 'Failed to update status'))
    },
  })

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsService.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      setDeleteId(null)
      toast.success(t('cms.announcementDeletedSuccess', 'Announcement deleted successfully!'))
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: () => {
      toast.error(t('cms.deleteFailed', 'Failed to delete announcement'))
    },
  })

  // Bulk Delete
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      try {
        return await cmsService.bulkDeleteItemsByTab('announcements', ids)
      } catch {
        return await Promise.all(ids.map((id) => cmsService.deleteAnnouncement(id)))
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements-db-list'] })
      qc.invalidateQueries({ queryKey: ['announcements'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(t('cms.bulkDeleteSuccess', { count: selectedRows.length, defaultValue: `Deleted ${selectedRows.length} announcements` }))
      setSelectedRows([])
    },
    onError: () => {
      toast.error(t('cms.deleteFailed', 'Failed to delete announcements'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  // Handlers
  const handleSave = () => {
    if (!messageKm.trim() && !messageEn.trim()) {
      toast.warning(t('cms.enterAnnouncementMessage', 'Please enter an announcement message'))
      return
    }

    const payload = {
      title: title.trim() || 'Store Announcement Campaign',
      message_km: messageKm,
      message_en: messageEn,
      badge_text: badgeText,
      coupon_code: couponCode,
      link_url: linkUrl,
      bg_gradient: bgGradient,
      is_active: enabled,
    }
    saveMutation.mutate(payload)
  }

  const handleEditRecord = (item: AnnouncementConfig) => {
    setEditingId(item.id || null)
    setTitle(item.title || '')
    setEnabled(item.is_active ?? true)
    setMessageKm(item.message_km || '')
    setMessageEn(item.message_en || item.message || '')
    setBadgeText(item.badge_text || 'SPECIAL PROMO')
    setCouponCode(item.coupon_code || item.code || '')
    setLinkUrl(item.link_url || item.link || '/promotions')
    setBgGradient(item.bg_gradient || 'from-indigo-600 to-purple-700')
    setIsFormModalOpen(true)
  }

  const handleCreateNew = () => {
    setEditingId(null)
    setTitle('')
    setEnabled(true)
    setMessageKm('')
    setMessageEn('')
    setBadgeText('SPECIAL PROMO')
    setCouponCode('')
    setLinkUrl('/promotions')
    setBgGradient('from-indigo-600 to-purple-700')
    setIsFormModalOpen(true)
  }

  // Handle external trigger for create
  useEffect(() => {
    if (triggerCreate > 0) {
      handleCreateNew()
    }
  }, [triggerCreate])

  // Handle external trigger for export
  useEffect(() => {
    if (triggerExport > 0) {
      handleExportCSV()
    }
  }, [triggerExport])

  const applySeasonalPreset = (preset: typeof SEASONAL_PRESETS[0]) => {
    setEditingId(null)
    const presetName = t(preset.nameKey)
    setTitle(presetName)
    setMessageKm(t(preset.messageKmKey))
    setMessageEn(t(preset.messageEnKey))
    setBadgeText(preset.badge)
    setCouponCode(preset.coupon)
    setLinkUrl(preset.link)
    setBgGradient(preset.bg)
    setIsFormModalOpen(true)
    toast.info(t('cms.loadedPresetSuccess', { name: presetName, defaultValue: `Loaded preset: ${presetName}` }))
  }

  const applyLiveCoupon = (coupon: any) => {
    const isPercent = coupon.type === 'percentage'
    const isFreeShip = coupon.type === 'free_shipping'
    const discountLabel = isFreeShip ? 'Free Delivery' : isPercent ? `${Number(coupon.value)}% OFF` : `${Number(coupon.value)} OFF`

    setEditingId(null)
    setTitle(`Campaign: ${coupon.name}`)
    setCouponCode(coupon.code)
    setBadgeText(discountLabel)
    setMessageKm(t('cms.couponAnnouncementMsgKm', { code: coupon.code, discount: discountLabel, name: coupon.name }))
    setMessageEn(t('cms.couponAnnouncementMsgEn', { code: coupon.code, discount: discountLabel, name: coupon.name }))
    setLinkUrl('/products')
    setIsFormModalOpen(true)
    toast.info(t('cms.selectedCouponSuccess', { code: coupon.code, defaultValue: `Selected coupon: ${coupon.code}` }))
  }

  const toggleSelectAll = () => {
    if (paginatedList.length > 0 && selectedRows.length === paginatedList.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(paginatedList.map((r: any) => r.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExportCSV = () => {
    const dataToExport = selectedRows.length > 0
      ? rawList.filter((r) => r.id && selectedRows.includes(r.id))
      : rawList

    if (!dataToExport.length) {
      toast.error(t('common.noDataToExport', 'No data to export'))
      return
    }
    const headers = ['ID', 'Title', 'Message KM', 'Message EN', 'Badge', 'Coupon Code', 'Link', 'Status']
    const rows = dataToExport.map((a: any) => [
      a.id,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.message_km || '').replace(/"/g, '""')}"`,
      `"${(a.message_en || a.message || '').replace(/"/g, '""')}"`,
      `"${(a.badge_text || '').replace(/"/g, '""')}"`,
      `"${(a.coupon_code || a.code || '').replace(/"/g, '""')}"`,
      `"${(a.link_url || a.link || '').replace(/"/g, '""')}"`,
      a.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('store-announcements.csv', [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n'))
    toast.success(t('common.exportSuccess', 'Export completed successfully'))
  }

  const colsCount = 1 + Object.values(visibleColumns).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* 1. Live Preview Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                <span>{t('cms.announcementLivePreview', 'Live Storefront Bar Preview')}</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Layers size={11} />
                  <span>Database Table: announcements</span>
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('cms.announcementLiveDesc', 'Real-time rendering of the banner as displayed to shoppers at the top of your store.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher for Preview */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setPreviewLang('km')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewLang === 'km' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇰🇭 {t('common.khmer', 'Khmer')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewLang === 'en' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🇺🇸 {t('common.english', 'English')}
              </button>
            </div>

            {/* Live Storefront External Link */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border text-xs font-semibold transition-all"
              title={t('cms.viewStorefrontWebsite', 'View Storefront')}
            >
              <span>{t('cms.storefront', 'Storefront')}</span>
              <ExternalLink size={12} />
            </a>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              enabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
            }`}>
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
              {enabled ? t('cms.activeOnStorefront', 'Active on Storefront') : t('cms.disabledInactive', 'Inactive')}
            </span>
          </div>
        </div>

        {/* Live Banner Mockup */}
        <div className="rounded-xl border border-border/80 p-3 bg-muted/40 dark:bg-slate-900/60">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Megaphone size={12} className="text-primary" />
              <span>{t('cms.storefrontTopHeaderStrip', 'Top Header Strip')} ({previewLang === 'km' ? t('common.khmer', 'Khmer') : t('common.english', 'English')})</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{t('cms.liveDatabaseView', 'Live Preview')}</span>
          </div>

          {enabled ? (
            <div className={`w-full py-2.5 px-4 rounded-lg bg-gradient-to-r ${bgGradient} text-white shadow-sm transition-all duration-300 flex flex-wrap items-center justify-between gap-3 text-xs`}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {badgeText && (
                  <span className="bg-white/20 backdrop-blur-xs text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-white/20">
                    {badgeText}
                  </span>
                )}
                <span className="font-semibold truncate">
                  {previewLang === 'km' ? (messageKm || messageEn) : (messageEn || messageKm)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {couponCode && (
                  <span className="bg-black/35 text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300/30 flex items-center gap-1">
                    <Tag size={11} />
                    {couponCode}
                  </span>
                )}
                {linkUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold underline hover:text-white/80 cursor-pointer">
                    <span>{t('cms.shopNow', 'Shop Now')}</span>
                    <ExternalLink size={10} />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground italic bg-background/60 rounded-lg border border-dashed border-border">
              {t('cms.announcementBarHidden', 'The top announcement strip is currently turned off.')}
            </div>
          )}
        </div>
      </div>

      {/* 2. Workspace Status Tabs */}
      <WorkspaceTabs
        tabs={statusTabs}
        activeTab={filterStatus}
        onChange={(tabId) => {
          setFilterStatus(tabId)
          setPage(1)
        }}
      />

      {/* 3. Database Announcement Campaigns List with TableToolbar & Views */}
      <div className="space-y-4">
        <TableToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          searchPlaceholder={t('cms.searchAnnouncementPlaceholder', 'Search campaigns by title, message, or coupon code...')}
          columns={[
            { key: 'title', label: t('cms.colCampaignTitle', 'Campaign Title') },
            { key: 'message', label: t('cms.colMessage', 'Announcement Message') },
            { key: 'badgeCoupon', label: t('cms.colBadgeCoupon', 'Badge & Coupon') },
            { key: 'gradient', label: t('cms.colGradient', 'Background Style') },
            { key: 'status', label: t('cms.colStatus', 'Storefront Status') },
            { key: 'actions', label: t('cms.colActions', 'Actions') },
          ]}
          visibleColumns={visibleColumns}
          onColumnChange={(col, visible) =>
            setVisibleColumns((prev) => ({ ...prev, [col]: visible }))
          }
          manageTableLabel={t('common.manageTable', 'Manage Columns')}
          leftActions={
            selectedRows.length > 0 ? (
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>
                  {t('common.deleteSelected', 'Delete Selected')} ({selectedRows.length})
                </span>
              </button>
            ) : undefined
          }
          actions={
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('common.tableView', 'Table View')}
              >
                <TableIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('common.cardsView', 'Cards View')}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          }
          onReset={() => {
            setSearch('')
            setFilterStatus('all')
            setPage(1)
          }}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['announcements-db-list'] })}
          isFiltered={Boolean(search || filterStatus !== 'all')}
        />

        {/* Bulk Selection Banner */}
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onClear={() => setSelectedRows([])}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
        />

        {/* View Mode 1: Table View */}
        {viewMode === 'table' ? (
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
            <TableWrapper isFetching={isFetching}>
              <div className="overflow-x-auto">
                <table className="w-full data-table border-collapse">
                  <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
                    <tr>
                      <th className="w-10 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedList.length > 0 && selectedRows.length === paginatedList.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                          aria-label="Select all"
                        />
                      </th>
                      {visibleColumns.title && (
                        <th
                          onClick={() => handleSort('title')}
                          className="text-left font-bold text-xs cursor-pointer hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{t('cms.colCampaignTitle', 'Campaign Title')}</span>
                            {renderSortIcon('title')}
                          </div>
                        </th>
                      )}
                      {visibleColumns.message && (
                        <th className="text-left font-bold text-xs">{t('cms.colMessage', 'Announcement Message')}</th>
                      )}
                      {visibleColumns.badgeCoupon && (
                        <th className="text-left font-bold text-xs w-36">{t('cms.colBadgeCoupon', 'Badge & Coupon')}</th>
                      )}
                      {visibleColumns.gradient && (
                        <th className="text-center font-bold text-xs w-28">{t('cms.colGradient', 'Style')}</th>
                      )}
                      {visibleColumns.status && (
                        <th
                          onClick={() => handleSort('is_active')}
                          className="text-left font-bold text-xs w-36 cursor-pointer hover:bg-muted/60 transition-colors group"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{t('cms.colStatus', 'Storefront Status')}</span>
                            {renderSortIcon('is_active')}
                          </div>
                        </th>
                      )}
                      {visibleColumns.actions && (
                        <th className="text-right font-bold text-xs w-24">{t('cms.colActions', 'Actions')}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isListLoading ? (
                      <LoadingSkeleton cols={colsCount} />
                    ) : paginatedList.length === 0 ? (
                      <EmptyState cols={colsCount} message={t('cms.noAnnouncementsDesc', 'No announcement campaigns found')} />
                    ) : (
                      paginatedList.map((item) => {
                        const isSelected = item.id ? selectedRows.includes(item.id) : false
                        const isActive = Boolean(item.is_active)

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-muted/40 transition-colors group ${
                              isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                            }`}
                          >
                            <td className="w-10 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => item.id && toggleSelectRow(item.id)}
                                className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                                aria-label={`Select campaign ${item.id}`}
                              />
                            </td>
                            {visibleColumns.title && (
                              <td>
                                <div className="flex items-center gap-2.5 py-1">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                    <Megaphone size={15} />
                                  </div>
                                  <div className="min-w-0">
                                    <p
                                      onClick={() => handleEditRecord(item)}
                                      className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors truncate"
                                    >
                                      {item.title || `Campaign #${item.id}`}
                                    </p>
                                    <p className="text-[11px] font-mono text-muted-foreground">
                                      ID: #{item.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            )}
                            {visibleColumns.message && (
                              <td>
                                <div className="max-w-md py-1">
                                  <p className="text-xs text-foreground font-medium line-clamp-1">
                                    {item.message_km || item.message_en}
                                  </p>
                                  {item.message_en && item.message_km && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-1 italic mt-0.5">
                                      {item.message_en}
                                    </p>
                                  )}
                                </div>
                              </td>
                            )}
                            {visibleColumns.badgeCoupon && (
                              <td>
                                <div className="flex flex-col gap-1 py-1">
                                  {item.badge_text && (
                                    <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full bg-muted text-foreground font-extrabold text-[10px] border border-border">
                                      {item.badge_text}
                                    </span>
                                  )}
                                  {item.coupon_code && (
                                    <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      <Tag size={10} />
                                      {item.coupon_code}
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            {visibleColumns.gradient && (
                              <td className="text-center">
                                <div className="flex items-center justify-center">
                                  <span
                                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.bg_gradient || 'from-indigo-600 to-purple-700'} border border-white/50 shadow-xs`}
                                    title={item.bg_gradient}
                                  />
                                </div>
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => item.id && toggleActiveMutation.mutate(item.id)}
                                    disabled={toggleActiveMutation.isPending}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                    }`}
                                  >
                                    <Power size={11} />
                                    <span>{isActive ? t('cms.activeStorefront', 'Active') : t('cms.inactive', 'Inactive')}</span>
                                  </button>
                                </div>
                              </td>
                            )}
                            {visibleColumns.actions && (
                              <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                <TableActionMenu
                                  onEdit={() => handleEditRecord(item)}
                                  onDelete={() => {
                                    if (item.id) {
                                      setDeleteId(item.id)
                                      setConfirmOpen(true)
                                    }
                                  }}
                                />
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </TableWrapper>
          </div>
        ) : (
          /* View Mode 2: Cards Grid View */
          <div>
            {isListLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-primary" />
                <span>{t('common.loadingData', 'Loading campaigns...')}</span>
              </div>
            ) : paginatedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {paginatedList.map((item) => {
                  const isActive = Boolean(item.is_active)
                  const isBeingEdited = editingId === item.id
                  const isSelected = item.id ? selectedRows.includes(item.id) : false

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between gap-3 ${
                        isBeingEdited
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : isSelected
                          ? 'border-primary/50 bg-primary/5'
                          : isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-border/80 bg-muted/20 hover:border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => item.id && toggleSelectRow(item.id)}
                              className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                              aria-label={`Select ${item.id}`}
                            />
                            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                            <h5 className="font-bold text-xs sm:text-sm text-foreground truncate">
                              {item.title || `Campaign #${item.id}`}
                            </h5>
                          </div>

                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {isActive ? t('cms.activeStorefront', 'Active') : t('cms.inactive', 'Inactive')}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 font-medium line-clamp-2">
                          {item.message_km || item.message_en}
                        </p>
                        {item.message_en && item.message_km && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 italic">
                            {item.message_en}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                          {item.badge_text && (
                            <span className="px-2 py-0.5 rounded bg-muted text-foreground font-extrabold text-[10px]">
                              {item.badge_text}
                            </span>
                          )}
                          {item.coupon_code && (
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {item.coupon_code}
                            </span>
                          )}
                          {item.bg_gradient && (
                            <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.bg_gradient} border border-white/40`} title={item.bg_gradient} />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => item.id && toggleActiveMutation.mutate(item.id)}
                          disabled={toggleActiveMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                          }`}
                        >
                          <Power size={12} />
                          <span>{isActive ? t('cms.activeOnStore', 'Active on Store') : t('cms.activate', 'Activate')}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditRecord(item)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 text-foreground hover:text-primary transition-colors cursor-pointer"
                            title={t('common.edit', 'Edit')}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (item.id) {
                                setDeleteId(item.id)
                                setConfirmOpen(true)
                              }
                            }}
                            className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/10 text-foreground hover:text-rose-600 transition-colors cursor-pointer"
                            title={t('common.delete', 'Delete')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                {t('cms.noAnnouncementsDesc', 'No announcement campaigns found')}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={totalItems}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(val) => {
            setPerPage(val)
            setPage(1)
          }}
          isLoading={isListLoading || isFetching}
        />
      </div>

      {/* 4. Dynamic Quick Presets from Database Coupons */}
      <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>{t('cms.campaignPresets', 'Quick Campaign Templates & Live Coupons')}</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('cms.campaignPresetsDesc', 'Click any coupon or seasonal event to auto-fill an announcement campaign.')}
            </p>
          </div>

          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setPresetCategory('coupons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                presetCategory === 'coupons' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Ticket size={13} />
              <span>🎟️ {t('cms.systemCoupons', { count: liveCoupons.length, defaultValue: `Store Coupons (${liveCoupons.length})` })}</span>
            </button>
            <button
              type="button"
              onClick={() => setPresetCategory('seasonal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                presetCategory === 'seasonal' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={13} />
              <span>⚡ {t('cms.seasonalCampaigns', 'Seasonal Promotions')}</span>
            </button>
          </div>
        </div>

        {presetCategory === 'coupons' ? (
          <div>
            {isCouponsLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-primary" />
                <span>{t('cms.loadingCoupons', 'Loading available discounts...')}</span>
              </div>
            ) : liveCoupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {liveCoupons.map((c: any) => {
                  const isPercent = c.type === 'percentage'
                  const isFreeShip = c.type === 'free_shipping'
                  const discountBadge = isFreeShip ? 'Free Shipping' : isPercent ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`
                  const isSelected = couponCode === c.code

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyLiveCoupon(c)}
                      className={`text-left p-3 rounded-xl border transition-all group cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-foreground group-hover:text-primary">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {discountBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {c.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-primary font-semibold">
                        <span>{t('cms.clickToApply', 'Click to apply')}</span>
                        {isSelected && <span className="flex items-center gap-0.5 text-emerald-600 font-bold"><Check size={12} /> Active</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                {t('cms.noCouponsAvailable', 'No active store discount coupons found')}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SEASONAL_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applySeasonalPreset(p)}
                className="text-left p-3.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 transition-all group cursor-pointer"
              >
                <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>{t(p.nameKey)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {previewLang === 'km' ? t(p.messageKmKey) : t(p.messageEnKey)}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-primary font-semibold">
                  <span>{t('cms.clickToApply', 'Click to apply')}</span>
                  <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">{p.coupon}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Announcement Form Modal Dialog */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormModalOpen(false)
          }}
        >
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>{editingId ? t('cms.editCampaignNumber', { id: editingId, defaultValue: `Edit Campaign #${editingId}` }) : t('cms.createAnnouncementCampaign', 'Create Announcement Campaign')}</span>
                    {editingId ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                        {t('cms.editingDbRecord', { id: editingId, defaultValue: `ID: ${editingId}` })}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                        {t('cms.newCampaign', 'New')}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('cms.saveToDbDesc', 'Configure banner message, links, styling, and coupon codes.')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Mini Live Preview inside Modal */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Eye size={12} className="text-primary" />
                    <span>{t('cms.livePreview', 'Live Preview')}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-background p-0.5 rounded-md border border-border text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPreviewLang('km')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        previewLang === 'km' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      🇰🇭 {t('common.khmer', 'Khmer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewLang('en')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        previewLang === 'en' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      🇺🇸 {t('common.english', 'English')}
                    </button>
                  </div>
                </div>

                <div className={`w-full py-2 px-3 rounded-lg bg-gradient-to-r ${bgGradient} text-white shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {badgeText && (
                      <span className="bg-white/20 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                        {badgeText}
                      </span>
                    )}
                    <span className="font-semibold truncate">
                      {previewLang === 'km' ? (messageKm || messageEn || 'សូមបញ្ចូលអត្ថបទប្រកាស...') : (messageEn || messageKm || 'Enter your message...')}
                    </span>
                  </div>
                  {couponCode && (
                    <span className="bg-black/30 text-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300/30">
                      {couponCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Campaign Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {t('cms.campaignTitle', 'Campaign Name')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Khmer New Year 2026 Promo"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {t('cms.colStatus', 'Storefront Status')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setEnabled(!enabled)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      enabled
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    <Power size={13} />
                    <span>{enabled ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}</span>
                  </button>
                </div>
              </div>

              {/* Message (Khmer & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>🇰🇭 {t('cms.messageKm', 'Message (Khmer)')}</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={messageKm}
                    onChange={(e) => setMessageKm(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ បញ្ចុះតម្លៃ 20% សម្រាប់ការកុម្ម៉ង់ទាំងអស់..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>🇺🇸 {t('cms.messageEn', 'Message (English)')}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={messageEn}
                    onChange={(e) => setMessageEn(e.target.value)}
                    placeholder="e.g. Huge Sale: Get 20% OFF all products..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Badge & Coupon & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {t('cms.badgeText', 'Badge Tag')}
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="FLASH DEAL"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {t('cms.couponCode', 'Coupon Code')}
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="PROMO2026"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    {t('cms.targetLink', 'Link URL')}
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Background Gradient Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t('cms.selectGradient', 'Select Header Strip Background Gradient')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Indigo Purple', val: 'from-indigo-600 to-purple-700' },
                    { label: 'Amber Red', val: 'from-amber-600 to-rose-600' },
                    { label: 'Emerald Teal', val: 'from-emerald-600 to-teal-700' },
                    { label: 'Blue Indigo', val: 'from-blue-600 to-indigo-700' },
                    { label: 'Fuchsia Pink', val: 'from-fuchsia-600 to-pink-600' },
                    { label: 'Dark Sleek', val: 'from-slate-900 to-zinc-800' },
                    { label: 'Sunset Glow', val: 'from-orange-500 to-rose-600' },
                    { label: 'Violet Indigo', val: 'from-violet-600 to-blue-600' },
                  ].map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBgGradient(grad.val)}
                      className={`h-9 rounded-xl bg-gradient-to-r ${grad.val} text-white text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        bgGradient === grad.val ? 'ring-2 ring-primary ring-offset-2 scale-102' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {bgGradient === grad.val && <Check size={14} className="mr-1" />}
                      <span>{grad.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>{editingId ? t('common.update', 'Update') : t('common.save', 'Save Campaign')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t('confirm.deleteTitle', 'Confirm Deletion')}
        message={t('confirm.deleteMessage', 'Are you sure you want to delete this announcement campaign?')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        title={t('confirm.bulkDeleteTitle', 'Confirm Bulk Deletion')}
        message={t('confirm.bulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected announcements?`,
        })}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isDanger
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default AnnouncementsTable
