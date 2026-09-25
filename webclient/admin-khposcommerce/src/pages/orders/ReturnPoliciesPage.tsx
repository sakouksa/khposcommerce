import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  ShieldCheck,
  Edit2,
  CheckCircle2,
  XCircle,
  Layers,
  AlertTriangle,
  Info,
  RotateCcw,
} from 'lucide-react'
import { orderReturnService } from '@/services/orderReturnService'
import { categoryService } from '@/services/categoryService'
import type { ReturnPolicy } from '@/types/orderReturn.types'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv } from '@/utils/export'
import { GlobalFormat } from '@/utils/formatters'
import {
  Breadcrumb,
  HeaderActionsGroup,
  AddButton,
  SecondaryButton,
  ExportButton,
  EnterpriseStatsGrid,
  EnterpriseStatsCard,
  TableToolbar,
  TableWrapper,
  TableEmptyState,
  TableActionMenu,
} from '@/components/common'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import Pagination from '@/components/shared/Pagination'
import { ReturnPoliciesFilterDrawer } from './components/ReturnPoliciesFilterDrawer'
import { ReturnPolicyDetailDrawer } from './components/ReturnPolicyDetailDrawer'
import { AnimatePresence } from 'framer-motion'

type PolicyFilterTab = 'all' | 'storewide' | 'category' | 'final_sale'

// Helper to extract localized bilingual policy name cleanly
export const getLocalizedPolicyName = (name: string, isKhmer: boolean) => {
  const match = name.match(/^(.+?)\s*\((.+?)\)$/)
  if (!match) return { primary: name, secondary: null }
  return isKhmer
    ? { primary: match[1].trim(), secondary: match[2].trim() }
    : { primary: match[2].trim(), secondary: match[1].trim() }
}

// Category name with localization support
export const getCategoryDisplayName = (
  catName?: string,
  t?: TFunction<any, any> | ((key: string, defaultVal?: string) => string)
) => {
  if (!catName) return ''
  if (!t) return catName
  const cleanKey = catName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const translated = t(`policies.categoryNames.${cleanKey}`, '')
  if (translated && translated !== `policies.categoryNames.${cleanKey}`) return translated

  const lower = catName.toLowerCase()
  if (lower.includes('smartphone') || lower.includes('phone') || lower.includes('tablet')) return t('policies.categoryNames.smartphones', catName)
  if (lower.includes('laptop') || lower.includes('computer')) return t('policies.categoryNames.laptops', catName)
  if (lower.includes('monitor') || lower.includes('display') || lower.includes('screen')) return t('policies.categoryNames.monitors', catName)
  if (lower.includes('apparel') || lower.includes('cloth')) return t('policies.categoryNames.apparel', catName)
  if (lower.includes('shoe') || lower.includes('footwear')) return t('policies.categoryNames.shoes', catName)
  if (lower.includes('audio') || lower.includes('headphone') || lower.includes('sound')) return t('policies.categoryNames.audio', catName)
  if (lower.includes('smartwatch') || lower.includes('watch')) return t('policies.categoryNames.smartwatches', catName)
  if (lower.includes('camera')) return t('policies.categoryNames.cameras', catName)
  if (lower.includes('keyboard') || lower.includes('gaming')) return t('policies.categoryNames.keyboards', catName)
  if (lower.includes('charger') || lower.includes('accessory') || lower.includes('accessories')) return t('policies.categoryNames.chargers', catName)

  return catName
}

const CONDITION_COLORS: Record<string, string> = {
  has_receipt: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  original_packaging: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  original_box: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  original_packaging_present: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  resellable_condition: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  serial_imei_match: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  icloud_google_unlocked: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  all_in_box_accessories: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  no_screen_scratch: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  serial_match: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  undamaged_screen: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  power_brick_included: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  os_intact: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  dead_pixel_inspection: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  foam_packaging_intact: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  stand_and_cables_present: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  unwashed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  unworn: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  price_tags_attached: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  no_perfume_odor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  original_shoe_box: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  no_sole_scuffs: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  indoor_try_on_only: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  sealed_security_sticker: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  hygiene_unopened: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  tamper_proof_intact: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  account_unpaired: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  original_strap_undamaged: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  magnetic_charger_included: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  shutter_count_verified: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  sensor_scratch_free: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  lens_caps_present: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  all_keycaps_present: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  cable_functional: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  clean_switches: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  cable_undamaged: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  no_scratches: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  all_sales_final: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  sold_as_is: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
  no_refund_no_exchange: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  immediate_1_to_1_swap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  technical_qc_verified: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  hardware_defect_confirmed: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
}

// Helper to format conditions using local i18n
export const getConditionBadge = (
  code: string,
  t?: TFunction<any, any> | ((key: string, defaultVal?: string) => string)
) => {
  const pretty = code.replace(/_/g, ' ')
  const label = t ? t(`policies.conditionLabels.${code}`, pretty) : pretty
  const color = CONDITION_COLORS[code] || 'bg-muted text-muted-foreground border-border/60'
  return { label, color }
}

export const ReturnPoliciesPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['returns', 'nav', 'sales', 'common'])
  const { language } = useThemeStore()
  const currentLang = i18n.language || language || 'km'
  const isKhmer = currentLang.startsWith('km')
  const toast = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const companyId = user?.company?.id || (user as any)?.company_id || 1

  // Filter & Pagination States
  const [activeTab, setActiveTab] = usePageTab<PolicyFilterTab>({
    storageKey: 'return_policies_active_tab',
    defaultTab: 'all',
    validTabs: ['all', 'storewide', 'category', 'final_sale'],
    deleteDefaultFromUrl: true,
  })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Filter Drawer State
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [returnableFilter, setReturnableFilter] = useState('all')
  const [exchangeFilter, setExchangeFilter] = useState('all')
  const [restockingFilter, setRestockingFilter] = useState('all')
  const [receiptFilter, setReceiptFilter] = useState('all')
  const [packagingFilter, setPackagingFilter] = useState('all')
  const [windowDaysFilter, setWindowDaysFilter] = useState('all')

  const activeDrawerFiltersCount = useMemo(() => {
    let count = 0
    if (categoryFilter !== 'all') count++
    if (returnableFilter !== 'all') count++
    if (exchangeFilter !== 'all') count++
    if (restockingFilter !== 'all') count++
    if (receiptFilter !== 'all') count++
    if (packagingFilter !== 'all') count++
    if (windowDaysFilter !== 'all') count++
    return count
  }, [
    categoryFilter,
    returnableFilter,
    exchangeFilter,
    restockingFilter,
    receiptFilter,
    packagingFilter,
    windowDaysFilter,
  ])

  // Column Visibility for Table View
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    appliesTo: true,
    window: true,
    restocking: true,
    shipping: true,
    exchange: true,
    requirements: true,
    actions: true,
  })

  // Preview Drawer
  const [previewPolicy, setPreviewPolicy] = useState<ReturnPolicy | null>(null)

  // 1. Fetch Categories
  const { data: catData } = useQuery({
    queryKey: ['categories-for-policies'],
    queryFn: () => categoryService.list({ per_page: 100 }),
  })
  const categories: Array<{ id: number; name: string }> = Array.isArray(catData?.data)
    ? catData.data
    : Array.isArray(catData?.data?.data)
    ? catData.data.data
    : []

  // 2. Fetch Policies
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['return-policies', companyId, search],
    queryFn: () =>
      orderReturnService.listPolicies({
        company_id: companyId,
        search: search || undefined,
        per_page: 100,
      }),
  })

  const rawPolicies: ReturnPolicy[] = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.data)) return data.data.data
    return []
  }, [data])

  // Summary Metrics for KPI Cards
  const stats = useMemo(() => {
    return {
      total: rawPolicies.length,
      categorySpecific: rawPolicies.filter((p) => p.category_id != null).length,
      storewide: rawPolicies.filter((p) => !p.category_id && p.is_returnable).length,
      finalSale: rawPolicies.filter((p) => !p.is_returnable).length,
    }
  }, [rawPolicies])

  // Workspace Tabs
  const workspaceTabs: WorkspaceTabItem[] = useMemo(() => [
    { id: 'all', label: t('policies.tabs.all', 'All Policies'), count: stats.total },
    { id: 'storewide', label: t('policies.tabs.storewide', 'Store-Wide'), count: stats.storewide },
    { id: 'category', label: t('policies.tabs.category', 'Category-Specific'), count: stats.categorySpecific },
    { id: 'final_sale', label: t('policies.tabs.finalSale', 'Non-Returnable'), count: stats.finalSale },
  ], [stats, t])

  // Filtered Policies based on Tab and Search
  const filteredPolicies = useMemo(() => {
    let result = rawPolicies

    // Apply Workspace Tab Filter
    if (activeTab === 'storewide') {
      result = result.filter((p) => !p.category_id && p.is_returnable)
    } else if (activeTab === 'category') {
      result = result.filter((p) => p.category_id != null)
    } else if (activeTab === 'final_sale') {
      result = result.filter((p) => !p.is_returnable)
    }

    // Apply Drawer Filters
    if (categoryFilter === 'storewide') {
      result = result.filter((p) => !p.category_id)
    } else if (categoryFilter !== 'all') {
      result = result.filter((p) => String(p.category_id) === categoryFilter)
    }

    if (returnableFilter === 'returnable') {
      result = result.filter((p) => p.is_returnable)
    } else if (returnableFilter === 'final_sale') {
      result = result.filter((p) => !p.is_returnable)
    }

    if (exchangeFilter === 'allowed') {
      result = result.filter((p) => p.allow_exchange)
    } else if (exchangeFilter === 'not_allowed') {
      result = result.filter((p) => !p.allow_exchange)
    }

    if (restockingFilter === 'free') {
      result = result.filter((p) => Number(p.restocking_fee_percentage || 0) === 0)
    } else if (restockingFilter === 'has_fee') {
      result = result.filter((p) => Number(p.restocking_fee_percentage || 0) > 0)
    }

    if (receiptFilter === 'required') {
      result = result.filter((p) => p.requires_receipt)
    } else if (receiptFilter === 'not_required') {
      result = result.filter((p) => !p.requires_receipt)
    }

    if (packagingFilter === 'required') {
      result = result.filter((p) => p.requires_original_packaging)
    } else if (packagingFilter === 'not_required') {
      result = result.filter((p) => !p.requires_original_packaging)
    }

    if (windowDaysFilter !== 'all') {
      const days = parseInt(windowDaysFilter, 10)
      result = result.filter((p) => p.return_window_days === days)
    }

    // Apply Client-Side Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.name.toLowerCase().includes(q))
      )
    }

    return result
  }, [
    rawPolicies,
    activeTab,
    categoryFilter,
    returnableFilter,
    exchangeFilter,
    restockingFilter,
    receiptFilter,
    packagingFilter,
    windowDaysFilter,
    search,
  ])

  // Paginated records for table/grid
  const paginatedPolicies = useMemo(() => {
    const startIndex = (page - 1) * perPage
    return filteredPolicies.slice(startIndex, startIndex + perPage)
  }, [filteredPolicies, page, perPage])

  const totalPages = Math.ceil(filteredPolicies.length / perPage) || 1

  // 3. Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderReturnService.deletePolicy(id),
    onSuccess: () => {
      toast.success(t('policyDeleted', 'Return policy deleted.'))
      queryClient.invalidateQueries({ queryKey: ['return-policies'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const seedMutation = useMutation({
    mutationFn: () => orderReturnService.seedDefaultPolicies(companyId),
    onSuccess: () => {
      toast.success(t('policies.seedSuccess', 'Default standard return policies restored!'))
      queryClient.invalidateQueries({ queryKey: ['return-policies'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const openCreateModal = () => {
    navigate('/return-policies/create')
  }

  const openEditModal = (p: ReturnPolicy) => {
    navigate(`/return-policies/${p.id}/edit`)
  }

  const handleExportCSV = () => {
    if (rawPolicies.length === 0) {
      toast.error(t('noDataToExport', 'No policy records to export'))
      return
    }
    const headers = [
      'ID',
      'Policy Name',
      'Category',
      'Return Window (Days)',
      'Is Returnable',
      'Allow Exchange',
      'Restocking Fee (%)',
      'Customer Shipping ($)',
      'Store Fault Shipping ($)',
      'Requires Receipt',
      'Requires Packaging',
      'Is Default',
    ]
    const rows = rawPolicies.map((p) => [
      p.id,
      p.name,
      p.category?.name || 'Store-Wide',
      GlobalFormat.number(p.return_window_days),
      p.is_returnable ? 'Yes' : 'No',
      p.allow_exchange ? 'Yes' : 'No',
      GlobalFormat.percent(p.restocking_fee_percentage || 0),
      GlobalFormat.currency(p.customer_fault_shipping_fee || 0),
      GlobalFormat.currency(p.store_fault_shipping_fee || 0),
      p.requires_receipt ? 'Yes' : 'No',
      p.requires_original_packaging ? 'Yes' : 'No',
      p.is_default ? 'Yes' : 'No',
    ])
    downloadCsv('return_policies', headers, rows)
    toast.success(t('exportSuccess', 'CSV exported successfully'))
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as PolicyFilterTab)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setActiveTab('all')
    setCategoryFilter('all')
    setReturnableFilter('all')
    setExchangeFilter('all')
    setRestockingFilter('all')
    setReceiptFilter('all')
    setPackagingFilter('all')
    setWindowDaysFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* ── 1. STANDARD BREADCRUMB & HERO HEADER ──────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('nav:salesManagement', 'Sales Management'), path: '/sales' },
            { label: t('title', 'Returns & Exchanges (RMA)'), path: '/returns' },
            { label: t('policies.title', 'Return Policies') },
          ]}
        />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('policies.title', 'Return & Exchange Policies')}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t('policies.countBadge', { count: rawPolicies.length, defaultValue: `${rawPolicies.length} Policies` })}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('policies.subtitle', 'Configure category eligibility, return windows, fault rules, and restocking fees')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2">
          <ExportButton
            onClick={handleExportCSV}
            label={t('exportCSV', 'Export CSV')}
            className="flex-1 sm:flex-none justify-center"
          />

          <AddButton
            onClick={openCreateModal}
            label={t('policies.addPolicy', 'Add Return Policy')}
            className="flex-1 sm:flex-none justify-center"
          />
        </HeaderActionsGroup>
      </div>

      {/* ── 2. EXECUTIVE KPI SUMMARY CARDS ──────────────────────────── */}
      <EnterpriseStatsGrid columns={4} className="print:hidden">
        <EnterpriseStatsCard
          title={t('policies.stats.total', 'Total Policies')}
          value={stats.total}
          useCounter={true}
          icon={ShieldCheck}
          variant="blue"
          delay={0.05}
          subtitle={
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {t('policies.stats.totalDesc', 'All active return & exchange rules')}
            </div>
          }
        />
        <EnterpriseStatsCard
          title={t('policies.stats.category', 'Category-Specific')}
          value={stats.categorySpecific}
          useCounter={true}
          icon={Layers}
          variant="purple"
          delay={0.1}
          subtitle={
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
              {t('policies.stats.categoryDesc', 'Smartphones, Laptops, Apparel, etc.')}
            </div>
          }
        />
        <EnterpriseStatsCard
          title={t('policies.stats.storewide', 'Store-Wide Standard')}
          value={stats.storewide}
          useCounter={true}
          icon={CheckCircle2}
          variant="emerald"
          delay={0.15}
          subtitle={
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {t('policies.stats.storewideDesc', 'Default store baseline coverage')}
            </div>
          }
        />
        <EnterpriseStatsCard
          title={t('policies.stats.finalSale', 'Non-Returnable')}
          value={stats.finalSale}
          useCounter={true}
          icon={AlertTriangle}
          variant="rose"
          delay={0.2}
          subtitle={
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
              {t('policies.stats.finalSaleDesc', 'Clearance & sold as-is items')}
            </div>
          }
        />
      </EnterpriseStatsGrid>

      {/* ── 3. WORKSPACE TABS NAVIGATION ──────────────────────────────── */}
      <div className="print:hidden">
        <WorkspaceTabs
          tabs={workspaceTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          onTabChange={handleTabChange}
          variant="underline"
        />
      </div>

      {/* ── 4. GLOBAL TABLE TOOLBAR ───────────────────────────────────── */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('policies.searchPolicies', 'Search policies by name or category...')}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        refreshLoading={isFetching}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeDrawerFiltersCount > 0}
        filterActiveCount={activeDrawerFiltersCount}
        columns={[
          { key: 'name', label: t('policies.columns.name', 'Policy Name') },
          { key: 'appliesTo', label: t('policies.columns.appliesTo', 'Applies To') },
          { key: 'window', label: t('policies.columns.window', 'Return Window') },
          { key: 'restocking', label: t('policies.columns.restocking', 'Restocking Fee') },
          { key: 'shipping', label: t('policies.columns.shipping', 'Return Shipping') },
          { key: 'exchange', label: t('policies.columns.exchange', 'Exchange') },
          { key: 'requirements', label: t('policies.columns.requirements', 'Requirements') },
          { key: 'actions', label: t('policies.columns.actions', 'Actions') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* ── 5. CONTENT: POLICIES TABLE ────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <TableWrapper isFetching={isLoading || isFetching}>
          <table className="w-full data-table border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-semibold">
                {visibleColumns.name && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.name', 'Policy Name')}
                  </th>
                )}
                {visibleColumns.appliesTo && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.appliesTo', 'Applies To')}
                  </th>
                )}
                {visibleColumns.window && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.window', 'Return Window')}
                  </th>
                )}
                {visibleColumns.restocking && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.restocking', 'Restocking Fee')}
                  </th>
                )}
                {visibleColumns.shipping && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.shipping', 'Return Shipping')}
                  </th>
                )}
                {visibleColumns.exchange && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.exchange', 'Exchange')}
                  </th>
                )}
                {visibleColumns.requirements && (
                  <th className="py-3 px-4 text-left font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.requirements', 'Requirements')}
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="py-3 px-4 text-right font-semibold text-xs text-muted-foreground normal-case tracking-normal">
                    {t('policies.columns.actions', 'Actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {filteredPolicies.length === 0 ? (
                <TableEmptyState
                  cols={8}
                  title={t('policies.noPolicies', 'No return policies defined yet.')}
                  description={t('policies.noPoliciesDesc', 'Create your first policy to control customer and store return windows.')}
                  icon={ShieldCheck}
                  action={
                    <div className="flex items-center gap-2.5 justify-center mt-3 flex-wrap">
                      <SecondaryButton
                        icon={<RotateCcw size={14} />}
                        onClick={() => seedMutation.mutate()}
                        loading={seedMutation.isPending}
                        label={t('policies.seedDefaults', 'Seed Standard Policies')}
                      />
                      <AddButton
                        onClick={openCreateModal}
                        label={t('policies.addPolicy', 'Add Return Policy')}
                      />
                    </div>
                  }
                />
              ) : (
                paginatedPolicies.map((p) => {
                  const isNonReturnable = !p.is_returnable
                  const restockPct = Number(p.restocking_fee_percentage || 0)
                  const localizedName = getLocalizedPolicyName(p.name, isKhmer)

                  // Deduplicate conditions to prevent showing "Receipt" + "#has_receipt"
                  const conditionList = Array.isArray(p.conditions_accepted) ? p.conditions_accepted : []
                  const filteredConditions = conditionList.filter(
                    (c) => !(c === 'has_receipt' && p.requires_receipt) && !(c === 'original_packaging' && p.requires_original_packaging)
                  )

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setPreviewPolicy(p)}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer"
                    >
                      {/* 1. Policy Name */}
                      {visibleColumns.name && (
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 max-w-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm">
                                {localizedName.primary}
                              </span>
                              {p.is_default && (
                                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold bg-primary/10 text-primary border border-primary/25 shrink-0">
                                  {t('policies.default', 'Default')}
                                </span>
                              )}
                              {isNonReturnable && (
                                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                                  {t('policies.tabs.finalSale', 'Final Sale')}
                                </span>
                              )}
                            </div>
                            {localizedName.secondary && (
                              <div className="text-[11px] text-muted-foreground font-normal truncate">
                                {localizedName.secondary}
                              </div>
                            )}
                          </div>
                        </td>
                      )}

                      {/* 2. Applies To */}
                      {visibleColumns.appliesTo && (
                        <td className="py-3 px-4">
                          {p.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                              {getCategoryDisplayName(p.category.name, t)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border/70">
                              {t('policies.tabs.storewide', 'Store-Wide')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* 3. Return Window */}
                      {visibleColumns.window && (
                        <td className="py-3 px-4">
                          {isNonReturnable ? (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                              {t('policies.nonReturnableDays', '0 Days (Final Sale)')}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-foreground">
                              <span className="font-semibold font-mono">{GlobalFormat.number(p.return_window_days)}</span>{' '}
                              <span className="text-muted-foreground">{t('policies.days', 'Days')}</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* 4. Restocking Fee */}
                      {visibleColumns.restocking && (
                        <td className="py-3 px-4">
                          {restockPct === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                              0% ({t('policies.free', 'Free')})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono">
                              {GlobalFormat.percent(restockPct, 0)}
                            </span>
                          )}
                        </td>
                      )}

                      {/* 5. Return Shipping */}
                      {visibleColumns.shipping && (
                        <td className="py-3 px-4">
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                              <span>{t('policies.customerFault', 'Customer')}:</span>
                              <span className="font-mono font-semibold text-foreground">
                                {Number(p.customer_fault_shipping_fee || 0) > 0
                                  ? GlobalFormat.currency(p.customer_fault_shipping_fee)
                                  : t('policies.free', 'Free')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                              <span>{t('policies.storeFault', 'Store')}:</span>
                              <span className="font-medium">
                                {Number(p.store_fault_shipping_fee || 0) > 0
                                  ? GlobalFormat.currency(p.store_fault_shipping_fee)
                                  : t('policies.freeShipping', 'Free ($0)')}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 6. Exchange Allowed */}
                      {visibleColumns.exchange && (
                        <td className="py-3 px-4">
                          {p.allow_exchange ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              {t('policies.allowed', 'Allowed')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border">
                              {t('policies.notAllowed', 'Not Allowed')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* 7. Requirements */}
                      {visibleColumns.requirements && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {p.requires_receipt && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium border border-blue-500/20">
                                {t('policies.receiptShort', 'Receipt')}
                              </span>
                            )}
                            {p.requires_original_packaging && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium border border-indigo-500/20">
                                {t('policies.boxShort', 'Box')}
                              </span>
                            )}
                            {filteredConditions.slice(0, 2).map((c, idx) => {
                              const badge = getConditionBadge(c, t)
                              return (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${badge.color}`}
                                >
                                  {badge.label}
                                </span>
                              )
                            })}
                            {filteredConditions.length > 2 && (
                              <span
                                title={filteredConditions.slice(2).map((c) => getConditionBadge(c, t).label).join(', ')}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono cursor-help"
                              >
                                +{filteredConditions.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* 8. Actions */}
                      {visibleColumns.actions && (
                        <td
                          className="py-3 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end">
                            <TableActionMenu
                              variant="inline"
                              buttonSize="sm"
                              align="right"
                              onView={() => setPreviewPolicy(p)}
                              onEdit={() => openEditModal(p)}
                              onDelete={
                                !p.is_default
                                  ? () => {
                                      if (
                                        confirm(
                                          t(
                                            'policies.confirmDelete',
                                            'Delete this return policy?'
                                          )
                                        )
                                      ) {
                                        deleteMutation.mutate(p.id)
                                      }
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableWrapper>

        {/* Pagination bar */}
        {filteredPolicies.length > 0 && (
          <Pagination
            currentPage={page}
            lastPage={totalPages}
            total={filteredPolicies.length}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(newPerPage) => {
              setPerPage(newPerPage)
              setPage(1)
            }}
            perPageOptions={[10, 15, 25, 50]}
            isLoading={isLoading}
          />
        )}
      </div>


      {/* ── 7. SLIDE-OUT DETAIL DRAWER (STANDARDIZED WITH ORDERS & SALES) ───── */}
      <AnimatePresence>
        {previewPolicy && (
          <ReturnPolicyDetailDrawer
            policy={previewPolicy}
            isOpen={!!previewPolicy}
            onClose={() => setPreviewPolicy(null)}
            onEdit={(policy) => {
              setPreviewPolicy(null)
              openEditModal(policy)
            }}
          />
        )}
      </AnimatePresence>

      {/* ── 7. FILTER DRAWER ─────────────────────────────────────────── */}
      <ReturnPoliciesFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onReset={() => {
          setCategoryFilter('all')
          setReturnableFilter('all')
          setExchangeFilter('all')
          setRestockingFilter('all')
          setReceiptFilter('all')
          setPackagingFilter('all')
          setWindowDaysFilter('all')
          setPage(1)
        }}
        activeFiltersCount={activeDrawerFiltersCount}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        returnableFilter={returnableFilter}
        setReturnableFilter={setReturnableFilter}
        exchangeFilter={exchangeFilter}
        setExchangeFilter={setExchangeFilter}
        restockingFilter={restockingFilter}
        setRestockingFilter={setRestockingFilter}
        receiptFilter={receiptFilter}
        setReceiptFilter={setReceiptFilter}
        packagingFilter={packagingFilter}
        setPackagingFilter={setPackagingFilter}
        windowDaysFilter={windowDaysFilter}
        setWindowDaysFilter={setWindowDaysFilter}
      />
    </div>
  )
}

export default ReturnPoliciesPage
