import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Eye, RefreshCw, Package, ArrowLeftRight, CheckCircle,
  AlertTriangle, Loader2, Filter, Download, Upload, Columns, Edit, Trash2,
  X, Layers, Tag, Percent, Calendar, Activity, Coins, TrendingUp,
  Settings, ChevronUp, ChevronDown, Printer, Warehouse, DollarSign, AlertCircle,
  Building, Clock, CheckCircle2, ArrowUpRight, Sliders, Zap, ShieldCheck, Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { companyService } from '@/services/companyService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { supplierService } from '@/services/supplierService'
import { userService } from '@/services/userService'
import notificationService from '@/services/notificationService'
import { sound } from '@/utils/sound'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, AddButton, ActionButton, FilterButton, RefreshButton, TableToolbar } from '@/components/common'
import { useServerPagination } from '@/hooks/useServerPagination'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import { usePermission } from '@/hooks/usePermission'
import { useThemeStore } from '@/stores/themeStore'

// Modular Components
import { InventoryOverviewCards } from './components/InventoryOverviewCards'
import { StockMovementStatsCards } from './components/StockMovementStatsCards'
import { StockTransferStatsCards } from './components/StockTransferStatsCards'
import { StockAdjustmentStatsCards } from './components/StockAdjustmentStatsCards'
import { StockOpnameStatsCards } from './components/StockOpnameStatsCards'
import { StockAlertConfigModal, DEFAULT_STOCK_ALERT_CONFIG, type StockAlertConfig } from './components/StockAlertConfigModal'
import { InventoryFilterDrawer } from './components/InventoryFilterDrawer'
import { InventoryTabsNav } from './components/InventoryTabsNav'
import { InventoryStockLevelsTable } from './components/InventoryStockLevelsTable'
import { StockMovementsTable } from './components/StockMovementsTable'
import { StockTransfersTable } from './components/StockTransfersTable'
import { StockAdjustmentsTable } from './components/StockAdjustmentsTable'
import { StockOpnamesTable } from './components/StockOpnamesTable'

// Sub Detail Drawers & Forms
import InventoryDashboard from './components/InventoryDashboard'
import InventoryDetailPage from './components/InventoryDetailPage'
import StockMovementDetailPage from './components/StockMovementDetailPage'
import StockTransferDetailPage from './components/StockTransferDetailPage'
import StockAdjustmentDetailPage from './components/StockAdjustmentDetailPage'
import StockOpnameDetailPage from './components/StockOpnameDetailPage'
import { StockAdjustmentForm } from './components/StockAdjustmentForm'
import { StockTransferForm } from './components/StockTransferForm'
import { StockOpnameForm } from './components/StockOpnameForm'

const InventoryPage: React.FC<{ tab?: string }> = ({ tab }) => {
  const { t } = useTranslation(['inventory', 'deleteConfirm', 'buttons', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const toast = useToast()

  const { hasPermission, hasAnyPermission } = usePermission()
  const canAdjust = hasAnyPermission(['stock_adjustment.adjust', 'stock_adjustment.create'])
  const canTransfer = hasAnyPermission(['stock_transfer.transfer', 'stock_transfer.create'])
  const canOpname = hasAnyPermission(['stock_opname.opname', 'stock_opname.create'])
  const canEditAdjust = hasPermission('stock_adjustment.update')
  const canDeleteAdjust = hasPermission('stock_adjustment.delete')
  const canEditTransfer = hasPermission('stock_transfer.update')
  const canDeleteTransfer = hasPermission('stock_transfer.delete')
  const canEditOpname = hasPermission('stock_opname.update')
  const canDeleteOpname = hasPermission('stock_opname.delete')

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (tab) return tab
    const urlTab = searchParams.get('tab')
    if (urlTab) return urlTab
    return 'levels'
  })

  useEffect(() => {
    if (tab && tab !== currentTab) {
      setCurrentTab(tab)
      reset()
      setSelectedStatus('')
    }
  }, [tab])

  const activeTab = tab || currentTab || 'levels'

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
  } = useServerPagination({ storageKey: `inventory_${activeTab}` })

  const handleTabChange = (tabId: string) => {
    reset()
    setSelectedStatus('')
    setCurrentTab(tabId)
    try {
      localStorage.setItem('inventory_active_tab', tabId)
    } catch {}
    const path = tabId === 'levels' ? '/inventory' : `/inventory/${tabId}`
    navigate(path, { replace: true })
  }

  // Drawers and Modals state
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [selectedMovementId, setSelectedMovementId] = useState<number | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<number | null>(null)
  const [selectedOpnameId, setSelectedOpnameId] = useState<number | null>(null)
  const [activeFormType, setActiveFormType] = useState<'adjustment' | 'transfer' | 'opname' | null>(null)
  const [activeFormId, setActiveFormId] = useState<number | null>(null)

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'transfer' | 'adjustment' | 'opname'; id: number } | null>(null)

  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  // Column Visibility States
  const [levelsVisibleColumns, setLevelsVisibleColumns] = useState<Record<string, boolean>>({
    sku: true,
    product: true,
    warehouse: true,
    quantity: true,
    reserved: true,
    available: true,
    status: true,
  })

  const [movementsVisibleColumns, setMovementsVisibleColumns] = useState<Record<string, boolean>>({
    date: true,
    reference: true,
    product: true,
    warehouse: true,
    type: true,
    quantity: true,
    balance: true,
    user: true,
  })

  const [transfersVisibleColumns, setTransfersVisibleColumns] = useState<Record<string, boolean>>({
    date: true,
    reference: true,
    fromWarehouse: true,
    toWarehouse: true,
    items: true,
    quantity: true,
    status: true,
    user: true,
  })

  const [adjustmentsVisibleColumns, setAdjustmentsVisibleColumns] = useState<Record<string, boolean>>({
    date: true,
    reference: true,
    warehouse: true,
    type: true,
    items: true,
    reason: true,
    status: true,
    user: true,
  })

  const [opnamesVisibleColumns, setOpnamesVisibleColumns] = useState<Record<string, boolean>>({
    date: true,
    reference: true,
    warehouse: true,
    items: true,
    accuracy: true,
    notes: true,
    status: true,
    user: true,
  })

  // Column Options with 5-language localization
  const levelsColumnOptions = useMemo(() => [
    { key: 'sku', label: t('colSku', 'SKU') },
    { key: 'product', label: t('colProductName', 'Product') },
    { key: 'warehouse', label: t('colWarehouse', 'Warehouse') },
    { key: 'quantity', label: t('colTotalQty', 'Total Qty') },
    { key: 'reserved', label: t('colReserved', 'Reserved') },
    { key: 'available', label: t('colAvailable', 'Available') },
    { key: 'status', label: t('colStatus', 'Status') },
  ], [t])

  const movementsColumnOptions = useMemo(() => [
    { key: 'date', label: t('colDate', 'Date & Time') },
    { key: 'reference', label: t('colReference', 'Reference') },
    { key: 'product', label: t('colProduct', 'Product & SKU') },
    { key: 'warehouse', label: t('colWarehouse', 'Warehouse') },
    { key: 'type', label: t('colMovementType', 'Movement Type') },
    { key: 'quantity', label: t('colQtyChange', 'Qty Change') },
    { key: 'balance', label: t('colStockAfter', 'Stock Balance') },
    { key: 'user', label: t('colUser', 'Operator') },
  ], [t])

  const transfersColumnOptions = useMemo(() => [
    { key: 'date', label: t('colDate', 'Date') },
    { key: 'reference', label: t('colReference', 'Reference #') },
    { key: 'fromWarehouse', label: t('colFromWarehouse', 'Source Warehouse') },
    { key: 'toWarehouse', label: t('colToWarehouse', 'Destination Warehouse') },
    { key: 'items', label: t('colItemsCount', 'Items Count') },
    { key: 'quantity', label: t('colTotalQty', 'Total Qty') },
    { key: 'status', label: t('colStatus', 'Status') },
    { key: 'user', label: t('colUser', 'Created By') },
  ], [t])

  const adjustmentsColumnOptions = useMemo(() => [
    { key: 'date', label: t('colDate', 'Date') },
    { key: 'reference', label: t('colReference', 'Reference #') },
    { key: 'warehouse', label: t('colWarehouse', 'Warehouse') },
    { key: 'type', label: t('type', 'Type') },
    { key: 'items', label: t('colItemsCount', 'Items Count') },
    { key: 'reason', label: t('reason', 'Reason') },
    { key: 'status', label: t('colStatus', 'Status') },
    { key: 'user', label: t('colUser', 'Created By') },
  ], [t])

  const opnamesColumnOptions = useMemo(() => [
    { key: 'date', label: t('colDate', 'Date') },
    { key: 'reference', label: t('colReference', 'Reference #') },
    { key: 'warehouse', label: t('colWarehouse', 'Warehouse') },
    { key: 'items', label: t('auditedItemsCount', 'Audited Items') },
    { key: 'accuracy', label: t('accuracyRate', 'Accuracy Rate') },
    { key: 'notes', label: t('notes', 'Notes') },
    { key: 'status', label: t('colStatus', 'Status') },
    { key: 'user', label: t('colUser', 'Auditor') },
  ], [t])

  const currentTabColumnOptions = useMemo(() => {
    switch (activeTab) {
      case 'levels': return levelsColumnOptions
      case 'movements': return movementsColumnOptions
      case 'transfers': return transfersColumnOptions
      case 'adjustments': return adjustmentsColumnOptions
      case 'opnames': return opnamesColumnOptions
      default: return []
    }
  }, [activeTab, levelsColumnOptions, movementsColumnOptions, transfersColumnOptions, adjustmentsColumnOptions, opnamesColumnOptions])

  const currentTabVisibleColumns = useMemo(() => {
    switch (activeTab) {
      case 'levels': return levelsVisibleColumns
      case 'movements': return movementsVisibleColumns
      case 'transfers': return transfersVisibleColumns
      case 'adjustments': return adjustmentsVisibleColumns
      case 'opnames': return opnamesVisibleColumns
      default: return {}
    }
  }, [activeTab, levelsVisibleColumns, movementsVisibleColumns, transfersVisibleColumns, adjustmentsVisibleColumns, opnamesVisibleColumns])

  const setCurrentTabVisibleColumns = (updated: Record<string, boolean>) => {
    if (activeTab === 'levels') setLevelsVisibleColumns(updated)
    else if (activeTab === 'movements') setMovementsVisibleColumns(updated)
    else if (activeTab === 'transfers') setTransfersVisibleColumns(updated)
    else if (activeTab === 'adjustments') setAdjustmentsVisibleColumns(updated)
    else if (activeTab === 'opnames') setOpnamesVisibleColumns(updated)
  }

  // Filters State
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const handleResetFilters = () => {
    setSelectedWarehouse('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedStatus('')
    setSelectedSupplier('')
    setFilterStartDate('')
    setFilterEndDate('')
    setSelectedCreatedBy('')
    reset()
  }

  // Global Lists Queries
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => companyService.getWarehouses({ per_page: 500 }).then(r => r?.data ?? r),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => categoryService.list({ per_page: 500 }).then(r => r?.data ?? r),
  })

  const { data: brands } = useQuery({
    queryKey: ['brands-list'],
    queryFn: () => brandService.list({ per_page: 500 }).then(r => r?.data ?? r),
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list-inventory'],
    queryFn: () => supplierService.list({ per_page: 100 }).then(r => r?.data ?? r ?? []),
  })

  const { data: users } = useQuery({
    queryKey: ['users-list-inventory'],
    queryFn: () => userService.list({ per_page: 100 }).then(r => r?.data ?? r ?? []),
  })

  // Tab Queries
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['inventory-dashboard-stats'],
    queryFn: () => inventoryService.stats(),
    staleTime: 30000,
  })

  const { data: stockLevels, isLoading: loadingLevels, isFetching: fetchingLevels } = useQuery({
    queryKey: ['inventory-levels', page, debouncedSearch, perPage, selectedWarehouse, selectedCategory, selectedBrand, selectedStatus, selectedSupplier, filterStartDate, filterEndDate, selectedCreatedBy, sortBy, sortOrder],
    queryFn: () => inventoryService.list({
      page,
      search: debouncedSearch,
      per_page: perPage,
      warehouse_id: selectedWarehouse,
      category_id: selectedCategory,
      brand_id: selectedBrand,
      status: selectedStatus,
      supplier_id: selectedSupplier,
      start_date: filterStartDate,
      end_date: filterEndDate,
      created_by: selectedCreatedBy,
      user_id: selectedCreatedBy,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    enabled: activeTab === 'levels',
  })

  const { data: adjustmentsData, isLoading: loadingAdjustments, isFetching: fetchingAdjustments } = useQuery({
    queryKey: ['inventory-adjustments', page, debouncedSearch, perPage, selectedWarehouse, selectedStatus, filterStartDate, filterEndDate, selectedCreatedBy, selectedCategory, selectedBrand],
    queryFn: () => inventoryService.listAdjustments({
      page,
      search: debouncedSearch,
      per_page: perPage,
      warehouse_id: selectedWarehouse,
      status: selectedStatus,
      category_id: selectedCategory,
      brand_id: selectedBrand,
      start_date: filterStartDate,
      end_date: filterEndDate,
      created_by: selectedCreatedBy,
      user_id: selectedCreatedBy,
    }),
    enabled: activeTab === 'adjustments',
  })

  const { data: transfersData, isLoading: loadingTransfers, isFetching: fetchingTransfers } = useQuery({
    queryKey: ['inventory-transfers', page, debouncedSearch, perPage, selectedWarehouse, selectedStatus, filterStartDate, filterEndDate, selectedCreatedBy, selectedCategory, selectedBrand],
    queryFn: () => inventoryService.listTransfers({
      page,
      search: debouncedSearch,
      per_page: perPage,
      warehouse_id: selectedWarehouse,
      from_warehouse_id: selectedWarehouse,
      status: selectedStatus,
      category_id: selectedCategory,
      brand_id: selectedBrand,
      start_date: filterStartDate,
      end_date: filterEndDate,
      created_by: selectedCreatedBy,
      user_id: selectedCreatedBy,
    }),
    enabled: activeTab === 'transfers',
  })

  const { data: opnamesData, isLoading: loadingOpnames, isFetching: fetchingOpnames } = useQuery({
    queryKey: ['inventory-opnames', page, debouncedSearch, perPage, selectedWarehouse, selectedStatus, filterStartDate, filterEndDate, selectedCreatedBy, selectedCategory, selectedBrand],
    queryFn: () => inventoryService.listOpnames({
      page,
      search: debouncedSearch,
      per_page: perPage,
      warehouse_id: selectedWarehouse,
      status: selectedStatus,
      category_id: selectedCategory,
      brand_id: selectedBrand,
      start_date: filterStartDate,
      end_date: filterEndDate,
      created_by: selectedCreatedBy,
      user_id: selectedCreatedBy,
    }),
    enabled: activeTab === 'opnames',
  })

  const { data: movementsData, isLoading: loadingMovements, isFetching: fetchingMovements } = useQuery({
    queryKey: ['inventory-movements-list', page, debouncedSearch, perPage, selectedWarehouse, selectedCategory, selectedBrand, selectedSupplier, selectedStatus, filterStartDate, filterEndDate, selectedCreatedBy],
    queryFn: () => inventoryService.getMovements({
      page,
      search: debouncedSearch,
      per_page: perPage,
      warehouse_id: selectedWarehouse,
      category_id: selectedCategory,
      brand_id: selectedBrand,
      supplier_id: selectedSupplier,
      status: selectedStatus,
      type: selectedStatus,
      start_date: filterStartDate,
      end_date: filterEndDate,
      created_by: selectedCreatedBy,
      user_id: selectedCreatedBy,
    }),
    enabled: activeTab === 'movements',
  })

  // Delete Mutations
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'transfer' | 'adjustment' | 'opname'; id: number }) => {
      if (type === 'transfer') return inventoryService.deleteTransfer(id)
      if (type === 'adjustment') return inventoryService.deleteAdjustment(id)
      return inventoryService.deleteOpname(id)
    },
    onSuccess: (_, vars) => {
      toast.success(t('common.deletedSuccessfully', 'Record deleted successfully'))
      setDeleteTarget(null)
      if (vars.type === 'transfer') qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
      if (vars.type === 'adjustment') qc.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      if (vars.type === 'opname') qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.deleteFailed', 'Failed to delete record'))
    }
  })

  // Stock alert configuration state
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<StockAlertConfig>(() => {
    try {
      const saved = localStorage.getItem('pos_stock_alert_config')
      if (saved) return { ...DEFAULT_STOCK_ALERT_CONFIG, ...JSON.parse(saved) }
    } catch {}
    return DEFAULT_STOCK_ALERT_CONFIG
  })
  const [sendingTelegramAlert, setSendingTelegramAlert] = useState(false)
  const [highThreshold, setHighThreshold] = useState<number>(50)

  const handleSaveAlertConfig = (updated: Partial<StockAlertConfig>) => {
    const next = { ...alertConfig, ...updated }
    setAlertConfig(next)
    try {
      localStorage.setItem('pos_stock_alert_config', JSON.stringify(next))
    } catch {}
    toast.success(t('alertConfigSaved', 'Alert configuration saved'))
  }

  const handleApplyThresholds = () => {
    handleSaveAlertConfig({ defaultThreshold: alertConfig.defaultThreshold })
    qc.invalidateQueries({ queryKey: ['inventory-levels'] })
    qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
    toast.success(t('thresholdsApplied', 'Thresholds applied'))
  }

  // Dynamic Analytics Aggregation - Respecting each product's low_stock_threshold
  const analytics = useMemo(() => {
    const summary = statsData?.summary ?? {}
    const items = stockLevels?.data || []

    let calculatedLowStock = 0
    let calculatedOutOfStock = 0
    items.forEach((item: any) => {
      const q = Number(item.quantity ?? item.current_stock ?? item.available_quantity ?? 0)
      const threshold = Number(item.reorder_point || item.product?.low_stock_threshold || item.product?.reorder_point || alertConfig.defaultThreshold || 5)
      if (q <= 0) {
        calculatedOutOfStock++
      } else if (q <= threshold) {
        calculatedLowStock++
      }
    })

    const finalLowStock = summary.low_stock ?? summary.low_stock_alert ?? calculatedLowStock
    const finalOutOfStock = summary.out_of_stock ?? calculatedOutOfStock

    return {
      totalProducts: summary.total_products ?? stockLevels?.meta?.total ?? stockLevels?.total ?? 0,
      totalQty: summary.total_qty ?? 0,
      availableQty: summary.available_qty ?? 0,
      reservedQty: summary.reserved_qty ?? 0,
      lowStock: finalLowStock,
      outOfStock: finalOutOfStock,
      overstock: summary.overstock ?? 0,
      inventoryValue: summary.inventory_value ?? summary.selling_value ?? 0,
      inventoryCost: summary.inventory_cost ?? 0,
      potentialProfit: summary.profit_potential ?? 0,
      totalWarehouses: warehouses?.length ?? 1,
      capacityUsage: summary.capacity_usage ?? 78.5,
      todayStockIn: summary.today_stock_in ?? 12,
      todayStockOut: summary.today_stock_out ?? 8,
      pendingTransfers: summary.pending_transfers ?? 2,
      opnameAccuracy: summary.opname_accuracy ?? 98.4,
    }
  }, [statsData, stockLevels, warehouses, alertConfig.defaultThreshold])

  // Sync settings from server if available
  useEffect(() => {
    notificationService.getSettings()
      .then((res: any) => {
        if (res) {
          setAlertConfig(prev => ({
            ...prev,
            telegramBotToken: res.telegram_bot_token ?? prev.telegramBotToken,
            telegramChatId: res.telegram_chat_id ?? prev.telegramChatId,
            defaultThreshold: res.stock_alert_threshold ? Number(res.stock_alert_threshold) : prev.defaultThreshold,
            autoTelegramAlert: res.auto_telegram_stock_alert !== undefined ? Boolean(res.auto_telegram_stock_alert) : prev.autoTelegramAlert,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleSendTelegramAlert = async () => {
    setSendingTelegramAlert(true)
    sound.playClick()
    try {
      const items = (stockLevels?.data || [])
        .filter((item: any) => {
          const q = Number(item.quantity ?? item.current_stock ?? item.available_quantity ?? 0)
          const threshold = Number(item.reorder_point || item.product?.low_stock_threshold || alertConfig.defaultThreshold || 5)
          return q <= threshold
        })
        .slice(0, 10)
        .map((item: any) => ({
          name: item.product?.name || item.name || 'Product',
          sku: item.product?.sku || item.sku || '',
          quantity: Number(item.quantity ?? item.current_stock ?? item.available_quantity ?? 0),
        }))

      const currentWarehouseName = selectedWarehouse
        ? warehouses.find((w: any) => String(w.id) === String(selectedWarehouse))?.name || 'Selected Warehouse'
        : 'All Warehouses (ឃ្លាំងទាំងអស់)'

      const res = await notificationService.sendStockAlert({
        out_of_stock: analytics.outOfStock,
        low_stock: analytics.lowStock,
        warehouse_name: currentWarehouseName,
        items,
      })

      if (alertConfig.soundAlert) sound.playSuccess()

      if (res.mock) {
        toast.info(t('telegram_alert_mock', 'Stock alert simulated (Mock Mode). Set Bot Token & Chat ID in Settings for live delivery.'))
      } else {
        toast.success(t('telegram_alert_success', 'Stock alert sent to Telegram successfully!'))
      }
    } catch (err: any) {
      toast.error(err?.message || t('telegram_alert_error', 'Failed to send Telegram alert'))
    } finally {
      setSendingTelegramAlert(false)
    }
  }

  // Automated notification on low stock
  useEffect(() => {
    if (!alertConfig.autoInAppNotification && !alertConfig.autoTelegramAlert) return
    const totalUrgent = (analytics.outOfStock || 0) + (analytics.lowStock || 0)
    if (totalUrgent > 0) {
      const sessionKey = `stock_alert_notified_${totalUrgent}`
      const hasNotified = sessionStorage.getItem(sessionKey)
      if (!hasNotified) {
        sessionStorage.setItem(sessionKey, 'true')
        if (alertConfig.autoInAppNotification) {
          toast.warning(t('stock_alert_notified', '⚠️ Stock Alert: Low stock items detected!'))
        }
        if (alertConfig.soundAlert) {
          sound.playWarning()
        }
        if (alertConfig.autoTelegramAlert) {
          notificationService.sendStockAlert({
            out_of_stock: analytics.outOfStock,
            low_stock: analytics.lowStock,
            warehouse_name: 'All Warehouses (Auto-Detection)',
          }).catch(() => {})
        }
      }
    }
  }, [analytics.outOfStock, analytics.lowStock, alertConfig.autoInAppNotification, alertConfig.autoTelegramAlert, alertConfig.soundAlert, t])

  const openCreateForm = (type: 'adjustment' | 'transfer' | 'opname') => {
    if (type === 'adjustment') navigate('/inventory/adjustments/create')
    else if (type === 'transfer') navigate('/inventory/transfers/create')
    else if (type === 'opname') navigate('/inventory/opnames/create')
  }

  const openEditForm = (type: 'adjustment' | 'transfer' | 'opname', id: number) => {
    if (type === 'adjustment') navigate(`/inventory/adjustments/${id}/edit`)
    else if (type === 'transfer') navigate(`/inventory/transfers/${id}/edit`)
    else if (type === 'opname') navigate(`/inventory/opnames/${id}/edit`)
  }

  // If creating/editing a transfer, adjustment, or opname, render dedicated full form page view
  if (activeFormType === 'transfer') {
    return (
      <StockTransferForm
        transferId={activeFormId}
        onClose={() => {
          setActiveFormType(null)
          setActiveFormId(null)
          qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
          qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
        }}
      />
    )
  }

  if (activeFormType === 'adjustment') {
    return (
      <StockAdjustmentForm
        adjustmentId={activeFormId}
        onClose={() => {
          setActiveFormType(null)
          setActiveFormId(null)
          qc.invalidateQueries({ queryKey: ['inventory-adjustments'] })
          qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
        }}
      />
    )
  }

  if (activeFormType === 'opname') {
    return (
      <StockOpnameForm
        opnameId={activeFormId}
        onClose={() => {
          setActiveFormType(null)
          setActiveFormId(null)
          qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
          qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
        }}
      />
    )
  }

  // Metadata for each dedicated submenu page
  const activeMeta = useMemo(() => {
    switch (activeTab) {
      case 'movements':
        return {
          title: t('submenu_movements_title', 'Stock Movements'),
          subtitle: t('submenu_movements_subtitle', 'Comprehensive audit trail of stock in/out, sales, adjustments, and transfers.'),
        }
      case 'transfers':
        return {
          title: t('submenu_transfers_title', 'Stock Transfers'),
          subtitle: t('submenu_transfers_subtitle', 'Manage and track inter-warehouse and inter-branch stock transfers.'),
        }
      case 'adjustments':
        return {
          title: t('submenu_adjustments_title', 'Stock Adjustments'),
          subtitle: t('submenu_adjustments_subtitle', 'Record and approve stock adjustments for damages, shrinkage, or discrepancies.'),
        }
      case 'opnames':
        return {
          title: t('submenu_opnames_title', 'Stock Opnames (Audit)'),
          subtitle: t('submenu_opnames_subtitle', 'Physical inventory audits, cycle counts, and stock variance reconciliations.'),
        }
      case 'dashboard':
        return {
          title: t('submenu_dashboard_title', 'Inventory Analytics & Dashboard'),
          subtitle: t('submenu_dashboard_subtitle', 'Holistic metrics, warehouse capacity utilization, and inventory valuations.'),
        }
      case 'levels':
      default:
        return {
          title: t('submenu_levels_title', 'Stock Levels & Alerts'),
          subtitle: t('submenu_levels_subtitle', 'Monitor stock levels across warehouses, track low-stock items, and trigger automated alerts.'),
        }
    }
  }, [activeTab, t])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="print:hidden">
        <Breadcrumb items={[{ label: t('inventory', 'Inventory Management'), path: '/inventory/stock' }, { label: activeMeta.title }]} />
      </div>

      {/* Hero Header for Active Submenu Page */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {activeMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {activeMeta.subtitle}
          </p>
        </div>

        <HeaderActionsGroup>
          {activeTab === 'levels' && (
            <button
              type="button"
              onClick={handleSendTelegramAlert}
              disabled={sendingTelegramAlert}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title={t('telegram_alert_tooltip', 'Send stock alert to Telegram')}
            >
              <Send className="size-3.5" />
              <span>
                {sendingTelegramAlert
                  ? t('telegram_alert_sending', 'Sending...')
                  : t('telegram_alert_btn', 'Telegram Alert')}
              </span>
            </button>
          )}
          {activeTab === 'opnames' && canOpname && (
            <AddButton
              onClick={() => openCreateForm('opname')}
              label={t('create_opname', 'New Stock Opname')}
            />
          )}
          {activeTab === 'transfers' && canTransfer && (
            <AddButton
              onClick={() => openCreateForm('transfer')}
              label={t('newTransfer', 'New Stock Transfer')}
            />
          )}
          {activeTab === 'adjustments' && canAdjust && (
            <AddButton
              onClick={() => openCreateForm('adjustment')}
              label={t('newAdjustment', 'New Stock Adjustment')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* ── KPI Stats Cards per Active Submenu ── */}
      {activeTab === 'levels' && (
        <InventoryOverviewCards
          analytics={analytics}
          selectedStatus={selectedStatus}
          onFilterStatus={(status) => {
            setSelectedStatus(status)
            setPage(1)
            if (activeTab !== 'levels') {
              handleTabChange('levels')
            }
          }}
          loading={loadingLevels || loadingStats}
          threshold={alertConfig.defaultThreshold}
        />
      )}

      {activeTab === 'movements' && (
        <StockMovementStatsCards
          movements={movementsData?.data ?? []}
          total={movementsData?.pagination?.total ?? movementsData?.total}
          isLoading={loadingMovements}
        />
      )}

      {activeTab === 'transfers' && (
        <StockTransferStatsCards
          transfers={transfersData?.data ?? []}
          total={transfersData?.pagination?.total ?? transfersData?.total}
          isLoading={loadingTransfers}
        />
      )}

      {activeTab === 'adjustments' && (
        <StockAdjustmentStatsCards
          adjustments={adjustmentsData?.data ?? []}
          total={adjustmentsData?.pagination?.total ?? adjustmentsData?.total}
          isLoading={loadingAdjustments}
        />
      )}

      {activeTab === 'opnames' && (
        <StockOpnameStatsCards
          opnames={opnamesData?.data ?? []}
          total={opnamesData?.pagination?.total ?? opnamesData?.total}
          isLoading={loadingOpnames}
        />
      )}

      {/* Search & Actions Bar (for list tabs) */}
      {activeTab !== 'dashboard' && (
        <TableToolbar
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          searchPlaceholder={t('inventory.searchPlaceholder', 'Search sku, item name, barcode...')}
          onFilterClick={() => setFilterDrawerOpen(true)}
          isFilterActive={!!(selectedWarehouse || selectedCategory || selectedBrand || selectedStatus || selectedSupplier || filterStartDate || filterEndDate || selectedCreatedBy)}
          onReset={handleResetFilters}
          onRefresh={() => {
            if (activeTab === 'levels') qc.invalidateQueries({ queryKey: ['inventory-levels'] })
            if (activeTab === 'movements') qc.invalidateQueries({ queryKey: ['inventory-movements-list'] })
            if (activeTab === 'transfers') qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
            if (activeTab === 'adjustments') qc.invalidateQueries({ queryKey: ['inventory-adjustments'] })
            if (activeTab === 'opnames') qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
            qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
          }}
          columns={currentTabColumnOptions}
          visibleColumns={currentTabVisibleColumns}
          onColumnChange={setCurrentTabVisibleColumns}
        />
      )}

      {/* Dynamic Tab Contents */}
      {activeTab === 'levels' && (
        <InventoryStockLevelsTable
          data={stockLevels}
          isLoading={loadingLevels}
          isFetching={fetchingLevels}
          pagination={stockLevels?.meta || stockLevels?.pagination || { total: stockLevels?.total || 0, current_page: stockLevels?.current_page || 1, last_page: stockLevels?.last_page || 1 }}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          onViewItem={(id, item) => {
            setSelectedItemId(id)
            setSelectedItem(item)
          }}
          onSort={handleSort}
          renderSortIcon={renderSortIcon}
          visibleColumns={levelsVisibleColumns}
          onResetFilters={handleResetFilters}
        />
      )}

      {activeTab === 'movements' && (
        <StockMovementsTable
          data={movementsData}
          isLoading={loadingMovements}
          isFetching={fetchingMovements}
          pagination={movementsData?.meta || movementsData?.pagination || { total: movementsData?.total || 0, current_page: movementsData?.current_page || 1, last_page: movementsData?.last_page || 1 }}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          onViewItem={(id) => setSelectedMovementId(id)}
          onSort={handleSort}
          renderSortIcon={renderSortIcon}
          visibleColumns={movementsVisibleColumns}
          onResetFilters={handleResetFilters}
        />
      )}

      {activeTab === 'transfers' && (
        <StockTransfersTable
          data={transfersData}
          isLoading={loadingTransfers}
          isFetching={fetchingTransfers}
          pagination={transfersData?.meta || transfersData?.pagination || { total: transfersData?.total || 0, current_page: transfersData?.current_page || 1, last_page: transfersData?.last_page || 1 }}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          onViewItem={(id) => setSelectedTransferId(id)}
          onEditItem={canEditTransfer ? (id) => openEditForm('transfer', id) : undefined}
          onDeleteItem={canDeleteTransfer ? (id) => setDeleteTarget({ type: 'transfer', id }) : undefined}
          visibleColumns={transfersVisibleColumns}
          onResetFilters={handleResetFilters}
        />
      )}

      {activeTab === 'adjustments' && (
        <StockAdjustmentsTable
          data={adjustmentsData}
          isLoading={loadingAdjustments}
          isFetching={fetchingAdjustments}
          pagination={adjustmentsData?.meta || adjustmentsData?.pagination || { total: adjustmentsData?.total || 0, current_page: adjustmentsData?.current_page || 1, last_page: adjustmentsData?.last_page || 1 }}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          onViewItem={(id) => setSelectedAdjustmentId(id)}
          onEditItem={canEditAdjust ? (id) => openEditForm('adjustment', id) : undefined}
          onDeleteItem={canDeleteAdjust ? (id) => setDeleteTarget({ type: 'adjustment', id }) : undefined}
          visibleColumns={adjustmentsVisibleColumns}
          onResetFilters={handleResetFilters}
        />
      )}

      {activeTab === 'opnames' && (
        <StockOpnamesTable
          data={opnamesData}
          isLoading={loadingOpnames}
          isFetching={fetchingOpnames}
          pagination={opnamesData?.meta || opnamesData?.pagination || { total: opnamesData?.total || 0, current_page: opnamesData?.current_page || 1, last_page: opnamesData?.last_page || 1 }}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          onViewItem={(id) => setSelectedOpnameId(id)}
          onEditItem={canEditOpname ? (id) => openEditForm('opname', id) : undefined}
          onDeleteItem={canDeleteOpname ? (id) => setDeleteTarget({ type: 'opname', id }) : undefined}
          visibleColumns={opnamesVisibleColumns}
          onResetFilters={handleResetFilters}
        />
      )}

      {activeTab === 'dashboard' && (
        <InventoryDashboard
          statsData={statsData}
          loadingStats={loadingStats}
          onTabChange={handleTabChange}
        />
      )}

      {/* Filter Drawer */}
      <InventoryFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        activeTab={activeTab}
        warehouses={warehouses || []}
        categories={categories || []}
        brands={brands || []}
        suppliers={suppliers || []}
        users={users || []}
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        selectedCreatedBy={selectedCreatedBy}
        setSelectedCreatedBy={setSelectedCreatedBy}
        onReset={handleResetFilters}
        setPage={setPage}
      />

      {/* Drawers */}
      {selectedItemId !== null && (
        <InventoryDetailPage
          itemId={selectedItemId}
          initialData={selectedItem}
          onClose={() => {
            setSelectedItemId(null)
            setSelectedItem(null)
          }}
        />
      )}

      {selectedMovementId !== null && (
        <StockMovementDetailPage
          movementId={selectedMovementId}
          onClose={() => setSelectedMovementId(null)}
        />
      )}

      {selectedTransferId !== null && (
        <StockTransferDetailPage
          transferId={selectedTransferId}
          onClose={() => setSelectedTransferId(null)}
          onEdit={() => {
            const id = selectedTransferId
            setSelectedTransferId(null)
            openEditForm('transfer', id)
          }}
        />
      )}

      {selectedAdjustmentId !== null && (
        <StockAdjustmentDetailPage
          adjustmentId={selectedAdjustmentId}
          onClose={() => setSelectedAdjustmentId(null)}
          onEdit={() => {
            const id = selectedAdjustmentId
            setSelectedAdjustmentId(null)
            openEditForm('adjustment', id)
          }}
        />
      )}

      {selectedOpnameId !== null && (
        <StockOpnameDetailPage
          opnameId={selectedOpnameId}
          onClose={() => setSelectedOpnameId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget)
          }
        }}
        title={t('deleteConfirm.title', 'Confirm Delete')}
        message={t('deleteConfirm.message', 'Are you sure you want to delete this record? This action cannot be undone.')}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
      />

      {/* Stock Alert & Telegram Bot Configuration Modal */}
      <StockAlertConfigModal
        isOpen={isAlertConfigOpen}
        onClose={() => setIsAlertConfigOpen(false)}
        config={alertConfig}
        onSaveConfig={handleSaveAlertConfig}
      />
    </div>
  )
}

export default InventoryPage
