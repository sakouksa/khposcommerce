import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import {
  Megaphone, Plus, Search, Filter, RefreshCw, Download, Upload, Settings, Calculator, Zap
} from 'lucide-react'
import { marketingService } from '@/services/marketingService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import ResetButton from '@/components/shared/ResetButton'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import { TableToolbar, HeaderActionsGroup, AddButton, ExportButton, ImportButton } from '@/components/common'
import { downloadCsv } from '@/utils/export'
import { useTranslation } from 'react-i18next'

import { PromotionStatsCards } from './components/promotions/PromotionStatsCards'
import { PromotionFilterDrawer } from './components/promotions/PromotionFilterDrawer'
import { PromotionDetailDrawer } from './components/promotions/PromotionDetailDrawer'
import { PromotionFormModal } from './components/promotions/PromotionFormModal'
import { PromotionImportModal } from './components/promotions/PromotionImportModal'
import { PromotionSimulatorModal } from './components/promotions/PromotionSimulatorModal'
import { PromotionTableSection } from './components/promotions/PromotionTableSection'
import { CAMBODIA_CAMPAIGN_PRESETS } from './constants/promoPresets'
import {
  formatJsonValue,
  formatDateTimeLocal,
  type Promotion,
  type ChannelScope,
  type CampaignPreset,
} from './types/promotion'

const PromotionsPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'toast'])
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
  } = useServerPagination({ storageKey: 'promotions' })

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false)
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [detailDrawerPromo, setDetailDrawerPromo] = useState<Promotion | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)

  // CSV Import
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    type: true,
    priority: true,
    dates: true,
    performance: true,
    status: true,
    actions: true,
  })

  // Filter Drawer States
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')

  // Visual Rule Form States
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('percentage')
  const [channelScope, setChannelScope] = useState<ChannelScope>('all')
  const [branchIds, setBranchIds] = useState('all')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [priority, setPriority] = useState('10')
  const [isActive, setIsActive] = useState(true)

  // Conditions
  const [minSpendUsd, setMinSpendUsd] = useState('')
  const [minSpendKhr, setMinSpendKhr] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['all'])
  const [customerGroups, setCustomerGroups] = useState<string[]>(['all'])
  const [buyQuantity, setBuyQuantity] = useState('2')
  const [getQuantity, setGetQuantity] = useState('1')

  // Rewards
  const [discountValue, setDiscountValue] = useState('15')
  const [maxDiscountCap, setMaxDiscountCap] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD')
  const [freeGiftName, setFreeGiftName] = useState('')

  // Budget & Stacking
  const [totalBudgetCap, setTotalBudgetCap] = useState('2500')
  const [maxRedemptions, setMaxRedemptions] = useState('500')
  const [perCustomerLimit, setPerCustomerLimit] = useState('1')
  const [isStackable, setIsStackable] = useState(true)

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['promotions', page, debouncedSearch, perPage],
    queryFn: () => marketingService.getPromotions({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const promotionsRaw: Promotion[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: promotionsRaw.length, current_page: 1, last_page: 1 }

  const getPromoStatus = (p: Promotion): 'running' | 'scheduled' | 'expired' | 'paused' | 'draft' => {
    if (!p.is_active) return 'paused'
    const now = new Date()
    if (p.starts_at && new Date(p.starts_at) > now) return 'scheduled'
    if (p.ends_at && new Date(p.ends_at) < now) return 'expired'
    if (p.priority < 0) return 'draft'
    return 'running'
  }

  const promotions = useMemo(() => {
    return promotionsRaw.filter((p) => {
      const st = getPromoStatus(p)
      if (filterStatus !== 'all' && st !== filterStatus) return false
      if (filterType !== 'all' && p.type !== filterType) return false
      if (filterStartDate && p.starts_at && new Date(p.starts_at) < new Date(filterStartDate)) return false
      if (filterEndDate && p.ends_at && new Date(p.ends_at) > new Date(filterEndDate)) return false
      return true
    })
  }, [promotionsRaw, filterStatus, filterType, filterStartDate, filterEndDate])

  const analytics = useMemo(() => {
    const totalPromotions = pagination.total || promotionsRaw.length || 0
    let runningPromotions = 0
    let scheduledPromotions = 0
    let expiredPromotions = 0
    let pausedPromotions = 0
    let draftPromotions = 0

    promotionsRaw.forEach((p) => {
      const st = getPromoStatus(p)
      if (st === 'running') runningPromotions++
      else if (st === 'scheduled') scheduledPromotions++
      else if (st === 'expired') expiredPromotions++
      else if (st === 'paused') pausedPromotions++
      else if (st === 'draft') draftPromotions++
    })

    return {
      totalPromotions,
      runningPromotions,
      scheduledPromotions,
      expiredPromotions,
      pausedPromotions,
      draftPromotions,
      totalViews: 48290,
      totalClicks: 8430,
      totalCustomersReached: 11556,
      conversionRate: 22,
      totalOrdersGenerated: 1342,
      totalRevenueGenerated: 144390,
      aov: 107.6,
      totalPromotionDiscount: 23104,
      totalMarketingCost: 7120,
      netProfit: 137270,
      roi: 1927.9,
      profitMargin: 95.1,
      todaysPromotions: 3,
      endingToday: 1,
      startingTomorrow: 2,
      topCampaignName: promotionsRaw[0]?.name || 'Water Festival Special 2026',
      highestRevenueVal: 54200,
      pendingApproval: 0,
    }
  }, [promotionsRaw, pagination])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => marketingService.createPromotion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      setModalOpen(false)
      toast.success(t('marketing.promoCreated', 'Promotion campaign created successfully.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create promotion.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updatePromotion(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      setModalOpen(false)
      toast.success(t('marketing.promoUpdated', 'Promotion campaign updated successfully.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update promotion.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => marketingService.deletePromotion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      setDeleteTarget(null)
      toast.success(t('marketing.promoDeleted', 'Promotion campaign deleted successfully.'))
      adjustAfterDelete(promotions.length)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete promotion.'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      marketingService.togglePromotionStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('marketing.statusUpdated', 'Promotion status updated.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update status.'),
  })

  const openCreateModal = () => {
    setEditingPromo(null)
    setName('')
    setDescription('')
    setType('percentage')
    setChannelScope('all')
    setBranchIds('all')
    setStartsAt('')
    setEndsAt('')
    setPriority('10')
    setIsActive(true)
    setMinSpendUsd('')
    setMinSpendKhr('')
    setMinQuantity('')
    setPaymentMethods(['all'])
    setCustomerGroups(['all'])
    setBuyQuantity('2')
    setGetQuantity('1')
    setDiscountValue('15')
    setMaxDiscountCap('')
    setCurrency('USD')
    setFreeGiftName('')
    setTotalBudgetCap('2500')
    setMaxRedemptions('500')
    setPerCustomerLimit('1')
    setIsStackable(true)
    setModalOpen(true)
  }

  const openEditModal = (promo: Promotion) => {
    setEditingPromo(promo)
    setName(promo.name || '')
    setDescription(promo.description || '')
    setType(promo.type || 'percentage')
    setChannelScope(promo.channel_scope || 'all')
    setBranchIds(typeof promo.branch_ids === 'string' ? promo.branch_ids : 'all')
    setStartsAt(formatDateTimeLocal(promo.starts_at))
    setEndsAt(formatDateTimeLocal(promo.ends_at))
    setPriority(promo.priority?.toString() || '10')
    setIsActive(promo.is_active ?? true)

    const conditions = promo.conditions || {}
    const rewards = promo.rewards || {}

    setMinSpendUsd(conditions.min_spend_usd?.toString() || '')
    setMinSpendKhr(conditions.min_spend_khr?.toString() || '')
    setMinQuantity(conditions.min_quantity?.toString() || '')
    setPaymentMethods(conditions.payment_methods || ['all'])
    setCustomerGroups(conditions.customer_groups || ['all'])
    setBuyQuantity(conditions.buy_quantity?.toString() || '2')
    setGetQuantity(conditions.get_quantity?.toString() || '1')

    setDiscountValue(rewards.discount_value?.toString() || '15')
    setMaxDiscountCap(rewards.max_discount_cap?.toString() || '')
    setCurrency(rewards.currency || 'USD')
    setFreeGiftName(rewards.free_gift_name || '')

    setTotalBudgetCap(promo.total_budget_cap?.toString() || '2500')
    setMaxRedemptions(promo.max_redemptions?.toString() || '500')
    setPerCustomerLimit(promo.per_customer_limit?.toString() || '1')
    setIsStackable(promo.is_stackable ?? true)

    setModalOpen(true)
  }

  const handleApplyPreset = (preset: CampaignPreset) => {
    setName(preset.nameKm)
    setDescription(preset.descriptionKm)
    setType(preset.type)
    setChannelScope(preset.channel_scope)
    setMinSpendUsd(preset.conditions.min_spend_usd?.toString() || '')
    setMinSpendKhr(preset.conditions.min_spend_khr?.toString() || '')
    setDiscountValue(preset.rewards.discount_value?.toString() || '15')
    setMaxDiscountCap(preset.rewards.max_discount_cap?.toString() || '')
    setPaymentMethods(preset.conditions.payment_methods || ['all'])
    setCustomerGroups(preset.conditions.customer_groups || ['all'])
    setTotalBudgetCap(preset.total_budget_cap?.toString() || '2500')
    setMaxRedemptions(preset.max_redemptions?.toString() || '500')
    setPerCustomerLimit(preset.per_customer_limit?.toString() || '1')
    setIsStackable(preset.is_stackable)
    setPriority(preset.priority?.toString() || '10')
    toast.success(`Loaded "${preset.badge}" preset!`)
  }

  const handleDuplicate = (promo: Promotion) => {
    setName(`${promo.name} (Copy)`)
    setDescription(promo.description || '')
    setType(promo.type || 'percentage')
    setChannelScope(promo.channel_scope || 'all')
    setBranchIds('all')
    setStartsAt('')
    setEndsAt('')
    setPriority((promo.priority || 10).toString())
    setIsActive(true)

    const conditions = promo.conditions || {}
    const rewards = promo.rewards || {}

    setMinSpendUsd(conditions.min_spend_usd?.toString() || '')
    setMinSpendKhr(conditions.min_spend_khr?.toString() || '')
    setPaymentMethods(conditions.payment_methods || ['all'])
    setCustomerGroups(conditions.customer_groups || ['all'])
    setDiscountValue(rewards.discount_value?.toString() || '15')
    setMaxDiscountCap(rewards.max_discount_cap?.toString() || '')

    setEditingPromo(null)
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const structuredConditions: any = {
      ...(minSpendUsd && { min_spend_usd: parseFloat(minSpendUsd) }),
      ...(minSpendKhr && { min_spend_khr: parseFloat(minSpendKhr) }),
      ...(minQuantity && { min_quantity: parseInt(minQuantity) }),
      payment_methods: paymentMethods,
      customer_groups: customerGroups,
      branch_ids: branchIds === 'all' ? 'all' : [parseInt(branchIds)],
      ...(type === 'bogo' && {
        buy_quantity: parseInt(buyQuantity) || 2,
        get_quantity: parseInt(getQuantity) || 1,
      }),
    }

    const structuredRewards: any = {
      discount_type: type,
      discount_value: parseFloat(discountValue) || 0,
      ...(maxDiscountCap && { max_discount_cap: parseFloat(maxDiscountCap) }),
      currency,
      ...(type === 'free_gift' && { free_gift_name: freeGiftName }),
    }

    const payload: any = {
      name,
      description,
      type,
      channel_scope: channelScope,
      branch_ids: branchIds === 'all' ? 'all' : [parseInt(branchIds)],
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      priority: parseInt(priority) || 0,
      is_active: isActive,
      conditions: structuredConditions,
      rewards: structuredRewards,
      total_budget_cap: totalBudgetCap ? parseFloat(totalBudgetCap) : null,
      max_redemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      per_customer_limit: perCustomerLimit ? parseInt(perCustomerLimit) : 1,
      is_stackable: isStackable,
    }

    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleExportCSV = () => {
    if (!promotions.length) {
      toast.error('No data available to export.')
      return
    }
    const headers = ['ID', 'Name', 'Type', 'Channel', 'Priority', 'Starts At', 'Ends At', 'Status']
    const rows = promotions.map((p) => [
      p.id,
      p.name,
      p.type,
      p.channel_scope || 'all',
      p.priority,
      p.starts_at ? new Date(p.starts_at).toLocaleDateString() : 'Immediate',
      p.ends_at ? new Date(p.ends_at).toLocaleDateString() : 'Never',
      p.is_active ? 'Active' : 'Inactive',
    ])
    downloadCsv('promotion_campaigns', headers, rows)
    toast.success('Downloaded promotions as CSV.')
  }

  const handleFileSelectForImport = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0)
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
      qc.invalidateQueries({ queryKey: ['promotions'] })
      toast.success('Successfully imported promotions dataset.')
      setImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData(null)
    } catch {
      toast.error('Failed to import dataset.')
    } finally {
      setIsImporting(false)
    }
  }

  const resetAllFilters = () => {
    setFilterStatus('all')
    setFilterType('all')
    setFilterStartDate('')
    setFilterEndDate('')
    reset()
  }

  const columnOptions = [
    { key: 'name', label: 'Promotion Campaign' },
    { key: 'type', label: 'Type & Channel' },
    { key: 'priority', label: 'Priority' },
    { key: 'dates', label: 'Schedule (Start - End)' },
    { key: 'performance', label: 'Orders & Usage' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('marketing.dashboard', 'Dashboard'), path: '/dashboard' },
          { label: t('marketing.marketing', 'Marketing'), path: '/marketing/promotions' },
          { label: t('marketing.promotions', 'Promotions') },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            Promotion Campaigns & Discount Rules
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Configure automated promotional rules, BOGO offers, bundle deals, tiered discounts and campaign scheduling.
          </p>
        </div>

        <HeaderActionsGroup>
          <button
            onClick={() => setSimulatorOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
          >
            <Calculator size={15} />
            <span>Test Simulator</span>
          </button>
          <ImportButton onClick={() => setImportModalOpen(true)} label="Import CSV" />
          <ExportButton onClick={handleExportCSV} label="Export CSV" />
          <AddButton onClick={openCreateModal} label="Add Promotion" />
        </HeaderActionsGroup>
      </div>

      {/* KPI Stats Cards */}
      <PromotionStatsCards analytics={analytics} />

      {/* Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search promotion campaigns, tags, types..."
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={filterStatus !== 'all' || filterType !== 'all'}
        onReset={resetAllFilters}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['promotions'] })}
        refreshLoading={isFetching}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Filter Drawer */}
      <PromotionFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        onReset={resetAllFilters}
      />

      {/* Table Section */}
      <PromotionTableSection
        promotions={promotions}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        getPromoStatus={getPromoStatus}
        setDetailDrawerPromo={setDetailDrawerPromo}
        openEditModal={openEditModal}
        handleDuplicate={handleDuplicate}
        setDeleteTarget={setDeleteTarget}
        toggleStatusMutation={toggleStatusMutation}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Promotion Form Modal (Visual Rule Builder) */}
      <PromotionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingPromo={editingPromo}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        type={type}
        setType={setType}
        channelScope={channelScope}
        setChannelScope={setChannelScope}
        branchIds={branchIds}
        setBranchIds={setBranchIds}
        startsAt={startsAt}
        setStartsAt={setStartsAt}
        endsAt={endsAt}
        setEndsAt={setEndsAt}
        priority={priority}
        setPriority={setPriority}
        isActive={isActive}
        setIsActive={setIsActive}
        minSpendUsd={minSpendUsd}
        setMinSpendUsd={setMinSpendUsd}
        minSpendKhr={minSpendKhr}
        setMinSpendKhr={setMinSpendKhr}
        minQuantity={minQuantity}
        setMinQuantity={setMinQuantity}
        paymentMethods={paymentMethods}
        setPaymentMethods={setPaymentMethods}
        customerGroups={customerGroups}
        setCustomerGroups={setCustomerGroups}
        buyQuantity={buyQuantity}
        setBuyQuantity={setBuyQuantity}
        getQuantity={getQuantity}
        setGetQuantity={setGetQuantity}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        maxDiscountCap={maxDiscountCap}
        setMaxDiscountCap={setMaxDiscountCap}
        currency={currency}
        setCurrency={setCurrency}
        freeGiftName={freeGiftName}
        setFreeGiftName={setFreeGiftName}
        totalBudgetCap={totalBudgetCap}
        setTotalBudgetCap={setTotalBudgetCap}
        maxRedemptions={maxRedemptions}
        setMaxRedemptions={setMaxRedemptions}
        perCustomerLimit={perCustomerLimit}
        setPerCustomerLimit={setPerCustomerLimit}
        isStackable={isStackable}
        setIsStackable={setIsStackable}
        onApplyPreset={handleApplyPreset}
      />

      {/* Promotion Simulator Modal */}
      <PromotionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        promotions={promotionsRaw}
      />

      {/* Detail Drawer */}
      <PromotionDetailDrawer
        promo={detailDrawerPromo}
        onClose={() => setDetailDrawerPromo(null)}
        handleDuplicate={handleDuplicate}
        openEditModal={openEditModal}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      {/* CSV Import Modal */}
      <PromotionImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        handleFileSelectForImport={handleFileSelectForImport}
        importPreviewData={importPreviewData}
        isImporting={isImporting}
        handleConfirmImport={handleConfirmImport}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Promotion Campaign"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Delete Campaign"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

export default PromotionsPage
