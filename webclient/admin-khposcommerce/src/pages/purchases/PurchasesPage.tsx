import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Eye, RefreshCw, X, ShoppingBag, CheckCircle, Trash2, Loader2,
  Printer, Download, DollarSign, Calendar, Landmark, Warehouse as WarehouseIcon,
  Tag, Percent, PlusCircle, ArrowLeft, Trash, Save, Edit, RefreshCw as ResetIcon,
  ChevronUp, ChevronDown, Wallet, FileCheck, Truck, ShoppingCart,
  Settings, Filter, AlertCircle, ShieldAlert, Sliders,
  EditIcon, Edit2, Copy, FileSpreadsheet, RotateCcw, PackageCheck, Ban, ExternalLink
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

import { purchaseService } from '@/services/purchaseService'
import { supplierService } from '@/services/supplierService'
import { companyService } from '@/services/companyService'
import { productService } from '@/services/productService'
import { reportService } from '@/services/reportService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import ResetButton from '@/components/shared/ResetButton'
import TableActionMenu, { type TableActionItem } from '@/components/shared/TableActionMenu'
import Breadcrumb from '@/components/common/Breadcrumb'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  TableToolbar,
  SupplierLogo,
} from '@/components/common'
import { downloadCsv, getDateRangeBounds } from '@/utils/export'

// Modular Components & Helpers
import { STATUS_BADGE, PAYMENT_BADGE, getDeliveryStatusLabel, getPaymentStatusLabel, type Purchase, type PurchaseItem } from './types/purchase.types'
import { formatCurrency, getDualValues, getDetailDualValues, formatListDualCurrency } from './utils/purchaseCurrency'
import { PurchasesStatsCards } from './components/PurchasesStatsCards'
import { PurchasesFilterDrawer } from './components/PurchasesFilterDrawer'
import { PurchaseFormSection } from './components/PurchaseFormSection'
import { ReceiveShipmentModal } from './components/ReceiveShipmentModal'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { PurchasePrintVoucher } from './components/PurchasePrintVoucher'

const PurchasesPage: React.FC = () => {
  const { t } = useTranslation(['purchases', 'common', 'nav'])
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ id?: string }>()
  const qc = useQueryClient()
  const toast = useToast()

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'list' | 'create' | 'edit'>('list')
  const [printPurchase, setPrintPurchase] = useState<Purchase | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [receiveTarget, setReceiveTarget] = useState<Purchase | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Purchase | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Selection state for bulk actions
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkCancelConfirmOpen, setBulkCancelConfirmOpen] = useState(false)

  // Server pagination hook
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete
  } = useServerPagination({ storageKey: 'purchases' })

  // Filters state
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [purchaseDateStartFilter, setPurchaseDateStartFilter] = useState('')
  const [purchaseDateEndFilter, setPurchaseDateEndFilter] = useState('')
  const [dueDateStartFilter, setDueDateStartFilter] = useState('')
  const [dueDateEndFilter, setDueDateEndFilter] = useState('')
  const [minAmountFilter, setMinAmountFilter] = useState('')
  const [maxAmountFilter, setMaxAmountFilter] = useState('')
  const [createdByFilter, setCreatedByFilter] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Column customization (8 standard columns)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    reference: true,
    date: true,
    supplier: true,
    warehouse: true,
    items: true,
    grandTotal: true,
    paymentStatus: true,
    status: true,
  })

  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const activeFiltersCount = [
    statusFilter,
    supplierFilter,
    warehouseFilter,
    branchFilter,
    paymentStatusFilter,
    purchaseDateStartFilter,
    purchaseDateEndFilter,
    dueDateStartFilter,
    dueDateEndFilter,
    minAmountFilter,
    maxAmountFilter,
    createdByFilter
  ].filter(Boolean).length

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  const handleResetFilters = () => {
    setStatusFilter('')
    setSupplierFilter('')
    setWarehouseFilter('')
    setBranchFilter('')
    setPaymentStatusFilter('')
    setPurchaseDateStartFilter('')
    setPurchaseDateEndFilter('')
    setDueDateStartFilter('')
    setDueDateEndFilter('')
    setMinAmountFilter('')
    setMaxAmountFilter('')
    setCreatedByFilter('')
    setSortBy('created_at')
    setSortOrder('desc')
    setSelectedRows([])
    reset()
  }

  // Form inputs for creation/edition
  const [editPurchaseId, setEditPurchaseId] = useState<number | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [branchId, setBranchId] = useState('1')
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [shippingCost, setShippingCost] = useState('0')
  const [paidAmount, setPaidAmount] = useState('0')
  const [notes, setNotes] = useState('')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('4100')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Payment recording target
  const [paymentTarget, setPaymentTarget] = useState<Purchase | null>(null)

  // Create / Edit items list
  const [formItems, setFormItems] = useState<any[]>([])

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currencyCode) return
    const rate = parseFloat(exchangeRate) || 4100
    const updatedItems = formItems.map(item => {
      const currentCost = parseFloat(item.unit_cost) || 0
      let newCost = currentCost
      if (newCurrency === 'KHR') {
        newCost = currentCost * rate
      } else {
        newCost = currentCost / rate
      }
      return {
        ...item,
        unit_cost: newCost.toFixed(2)
      }
    })
    setFormItems(updatedItems)
    setCurrencyCode(newCurrency)
  }

  // Search & add product helper
  const [prodSearch, setProdSearch] = useState('')
  const [prodDropdownOpen, setProdDropdownOpen] = useState(false)
  const [recvQuantities, setRecvQuantities] = useState<Record<number, string>>({})
  const [isExporting, setIsExporting] = useState(false)

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => supplierService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => companyService.getWarehouses().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: products } = useQuery({
    queryKey: ['products-for-po-select'],
    queryFn: () => productService.list({ per_page: 500 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const selectableProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []
    const items: any[] = []
    products.forEach((product: any) => {
      if (product.has_variants && product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
          let displayName = v.name || ''
          if (!displayName) displayName = product.name
          else if (!displayName.toLowerCase().startsWith(product.name.toLowerCase())) {
            displayName = `${product.name} - ${v.name}`
          }
          const sku = v.sku || product.sku || ''
          const barcode = v.barcode || product.barcode || ''
          const searchText = `${product.name} ${v.name || ''} ${displayName} ${sku} ${barcode}`.toLowerCase()
          items.push({
            id: `${product.id}-${v.id}`,
            product_id: product.id,
            product_variant_id: v.id,
            name: displayName,
            sku,
            barcode,
            cost_price: v.cost_price ?? product.cost_price ?? 0,
            search_text: searchText,
          })
        })
      } else {
        const sku = product.sku || ''
        const barcode = product.barcode || ''
        const searchText = `${product.name} ${sku} ${barcode}`.toLowerCase()
        items.push({
          id: String(product.id),
          product_id: product.id,
          product_variant_id: null,
          name: product.name,
          sku,
          barcode,
          cost_price: product.cost_price ?? 0,
          search_text: searchText,
        })
      }
    })
    return items
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = prodSearch.trim().toLowerCase()
    if (!query) return selectableProducts
    const tokens = query.split(/[\s()/-]+/).filter(Boolean)
    if (tokens.length === 0) return selectableProducts
    return selectableProducts.filter((item: any) => {
      if (item.search_text.includes(query)) return true
      return tokens.every((token: string) => item.search_text.includes(token))
    })
  }, [selectableProducts, prodSearch])

  const { data: reportData } = useQuery({
    queryKey: ['purchase-dashboard-stats'],
    queryFn: () => reportService.purchaseSummary(),
  })

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'purchases',
      page,
      debouncedSearch,
      perPage,
      statusFilter,
      supplierFilter,
      warehouseFilter,
      branchFilter,
      paymentStatusFilter,
      purchaseDateStartFilter,
      purchaseDateEndFilter,
      dueDateStartFilter,
      dueDateEndFilter,
      minAmountFilter,
      maxAmountFilter,
      createdByFilter,
      sortBy,
      sortOrder
    ],
    queryFn: () => purchaseService.list({
      page,
      search: debouncedSearch,
      per_page: perPage,
      status: statusFilter || undefined,
      supplier_id: supplierFilter || undefined,
      warehouse_id: warehouseFilter || undefined,
      branch_id: branchFilter || undefined,
      payment_status: paymentStatusFilter || undefined,
      purchase_date_start: purchaseDateStartFilter || undefined,
      purchase_date_end: purchaseDateEndFilter || undefined,
      due_date_start: dueDateStartFilter || undefined,
      due_date_end: dueDateEndFilter || undefined,
      min_amount: minAmountFilter || undefined,
      max_amount: maxAmountFilter || undefined,
      created_by: createdByFilter || undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    placeholderData: (prev) => prev,
  })

  const purchases: Purchase[] = Array.isArray(data?.data) ? data.data : []
  const pagination = data?.pagination ?? { total: purchases.length, current_page: page, last_page: 1 }

  // ─── Selection Helpers ───────────────────────────────────────────────────
  const isAllSelected = purchases.length > 0 && purchases.every(p => selectedRows.includes(p.id))
  const isIndeterminate = purchases.some(p => selectedRows.includes(p.id)) && !isAllSelected

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(purchases.map(p => p.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  // Safe Bulk Action Selection Sets
  const selectedPurchases = React.useMemo(() => {
    return purchases.filter((p) => selectedRows.includes(p.id))
  }, [purchases, selectedRows])

  const cancellablePurchases = React.useMemo(() => {
    return selectedPurchases.filter((p) => p.status === 'draft' || p.status === 'ordered')
  }, [selectedPurchases])



  // ─── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (newPO: any) => purchaseService.create(newPO),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.createSuccess', 'Purchase order created successfully!'))
      setActiveWorkspaceTab('list')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.createFailed', 'Failed to create purchase order.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => purchaseService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.updateSuccess', 'Purchase order updated successfully!'))
      setActiveWorkspaceTab('list')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.updateFailed', 'Failed to update purchase order.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.deleteSuccess', 'Purchase order deleted successfully.'))
      setDeleteTarget(null)
      setSelectedRows(prev => prev.filter(r => r !== deleteTarget?.id))
      adjustAfterDelete(1)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.deleteFailed', 'Failed to delete purchase order.')),
  })

  const handleBulkCancelClick = () => {
    if (selectedRows.length === 0) return
    if (cancellablePurchases.length === 0) {
      toast.error(t('purchases.noCancellableOrders', 'Selected purchase orders are already received and cannot be cancelled. Use Purchase Returns instead.'))
      return
    }
    setBulkCancelConfirmOpen(true)
  }

  const bulkCancelMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.allSettled(ids.map(id => purchaseService.cancel(id)))
      const rejected = results.filter(r => r.status === 'rejected')
      if (rejected.length > 0 && rejected.length === ids.length) {
        const firstErr: any = (rejected[0] as PromiseRejectedResult).reason
        throw firstErr
      }
      return { successCount: ids.length - rejected.length }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.bulkCancelSuccess', 'Selected purchase orders cancelled successfully.'))
      setBulkCancelConfirmOpen(false)
      setSelectedRows([])
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.bulkCancelFailed', 'Failed to cancel selected purchase orders.')),
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => purchaseService.receiveShipment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('purchases.toast.receiveSuccess', 'Shipment receiving recorded!'))
      setReceiveTarget(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.receiveFailed', 'Failed to receive shipment.')),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => purchaseService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.cancelledSuccess', 'Purchase order cancelled successfully.'))
      setCancelTarget(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.cancelFailed', 'Failed to cancel purchase order.')),
  })

  const paymentMutation = useMutation({
    mutationFn: ({ id, amount, notes }: { id: number; amount: number; notes: string }) =>
      purchaseService.recordPayment(id, { amount, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
      toast.success(t('purchases.toast.paymentSuccess', 'Payment recorded successfully!'))
      setPaymentTarget(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('purchases.toast.paymentFailed', 'Failed to record payment.')),
  })

  // ─── Route & Workspace Sync ─────────────────────────────────────────────
  React.useEffect(() => {
    if (location.pathname === '/purchases/create') {
      setActiveWorkspaceTab('create')
      setEditPurchaseId(null)
      setSupplierId('')
      setWarehouseId('')
      setBranchId('1')
      setPoDate(new Date().toISOString().split('T')[0])
      setDueDate('')
      setShippingCost('0')
      setPaidAmount('0')
      setNotes('')
      setCurrencyCode('USD')
      setExchangeRate('4100')
      setFormItems([])
    } else if (location.pathname.endsWith('/edit') && params.id) {
      const pId = Number(params.id)
      if (pId) {
        setActiveWorkspaceTab('edit')
        setEditLoading(true)
        setEditPurchaseId(pId)
        purchaseService.show(pId)
          .then(res => {
            const fullPO = (res?.data || res) as Purchase
            setSupplierId(fullPO.supplier?.id?.toString() ?? (fullPO as any).supplier_id?.toString() ?? '')
            setWarehouseId(fullPO.warehouse?.id?.toString() ?? (fullPO as any).warehouse_id?.toString() ?? '')
            setBranchId(fullPO.branch?.id?.toString() ?? (fullPO as any).branch_id?.toString() ?? '1')
            setPoDate(fullPO.date)
            setDueDate(fullPO.due_date ?? '')
            setShippingCost((fullPO.shipping_cost ?? 0).toString())
            setNotes(fullPO.notes ?? '')
            setCurrencyCode(fullPO.currency_code ?? 'USD')
            setExchangeRate((fullPO.exchange_rate ?? 4100).toString())
            const mapped = (fullPO.items ?? []).map(item => ({
              id: item.id,
              product_id: item.product_id,
              product_variant_id: item.product_variant_id || null,
              product_name: item.variant?.name ? `${item.product_name ?? item.product?.name ?? `Product #${item.product_id}`} (${item.variant.name})` : (item.product_name ?? item.product?.name ?? `Product #${item.product_id}`),
              quantity: (item.quantity ?? 1).toString(),
              unit_cost: (item.unit_cost ?? 0).toString(),
              discount_percent: (item.discount_percent ?? 0).toString(),
              tax_percent: (item.tax_percent ?? 0).toString(),
              notes: item.notes ?? ''
            }))
            setFormItems(mapped)
          })
          .catch(() => toast.error(t('purchases.failedLoadItems', 'Failed to load purchase items.')))
          .finally(() => setEditLoading(false))
      }
    } else {
      setActiveWorkspaceTab('list')
    }
  }, [location.pathname, params.id])

  // ─── Actions ──────────────────────────────────────────────────────────────
  const switchToTab = (tab: 'list' | 'create' | 'edit', poToEdit?: Purchase) => {
    if (tab === 'create') {
      navigate('/purchases/create')
    } else if (tab === 'edit' && poToEdit) {
      navigate(`/purchases/${poToEdit.id}/edit`)
    } else {
      navigate('/purchases')
    }
  }

  const handleViewPurchase = (po: Purchase) => {
    navigate(`/purchases/${po.id}`)
  }

  const handlePrintPurchase = (po: Purchase) => {
    if (po.items && po.items.length > 0) {
      setPrintPurchase(po)
      setIsPrintModalOpen(true)
    } else {
      purchaseService.show(po.id)
        .then(res => {
          const fullPO = (res?.data || res) as Purchase
          setPrintPurchase(fullPO)
          setIsPrintModalOpen(true)
        })
        .catch(() => toast.error(t('purchases.failedLoadItems', 'Failed to load full purchase order details.')))
    }
  }

  // Duplicate / Re-order PO
  const handleDuplicatePO = async (po: Purchase) => {
    try {
      let fullPO = po
      if (!po.items || po.items.length === 0) {
        const res = await purchaseService.show(po.id)
        fullPO = (res?.data || res) as Purchase
      }
      setEditPurchaseId(null)
      setSupplierId(fullPO.supplier?.id?.toString() ?? (fullPO as any).supplier_id?.toString() ?? '')
      setWarehouseId(fullPO.warehouse?.id?.toString() ?? (fullPO as any).warehouse_id?.toString() ?? '')
      setBranchId(fullPO.branch?.id?.toString() ?? (fullPO as any).branch_id?.toString() ?? '1')
      setPoDate(new Date().toISOString().split('T')[0])
      setDueDate('')
      setShippingCost((fullPO.shipping_cost ?? 0).toString())
      setPaidAmount('0')
      setNotes(fullPO.notes ? `Re-order from PO #${fullPO.reference_number}: ${fullPO.notes}` : `Re-order from PO #${fullPO.reference_number}`)
      setCurrencyCode(fullPO.currency_code ?? 'USD')
      setExchangeRate((fullPO.exchange_rate ?? 4100).toString())
      const mapped = (fullPO.items ?? []).map(item => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || null,
        product_name: item.variant?.name ? `${item.product_name ?? item.product?.name ?? `Product #${item.product_id}`} (${item.variant.name})` : (item.product_name ?? item.product?.name ?? `Product #${item.product_id}`),
        quantity: (item.quantity ?? 1).toString(),
        unit_cost: (item.unit_cost ?? 0).toString(),
        discount_percent: (item.discount_percent ?? 0).toString(),
        tax_percent: (item.tax_percent ?? 0).toString(),
        notes: item.notes ?? ''
      }))
      setFormItems(mapped)
      setActiveWorkspaceTab('create')
      navigate('/purchases/create')
      toast.success(t('purchases.duplicateSuccess', 'Purchase order copied to create form successfully!'))
    } catch {
      toast.error(t('purchases.failedLoadItems', 'Failed to load purchase items for duplication.'))
    }
  }

  // Export Data to CSV with progress and localized feedback
  const handleExportData = async (exportSelectedOnly = false, range: string = 'all') => {
    if (isExporting) return
    let listToExport = exportSelectedOnly
      ? purchases.filter(p => selectedRows.includes(p.id))
      : purchases

    if (!exportSelectedOnly && range && range !== 'all') {
      const bounds = getDateRangeBounds(range)
      if (bounds.startDate && bounds.endDate) {
        const start = new Date(bounds.startDate).getTime()
        const end = new Date(bounds.endDate).getTime() + 86400000
        listToExport = purchases.filter(p => {
          const pDate = new Date(p.date || p.created_at).getTime()
          return pDate >= start && pDate <= end
        })
      }
    }

    if (listToExport.length === 0) {
      toast.error(t('purchases.toast.exportEmpty', t('common.noDataToExport', 'មិនមានទិន្នន័យដើម្បីនាំចេញទេ!')))
      return
    }

    setIsExporting(true)
    const toastId = toast.info({
      title: t('common.downloading', 'កំពុងទាញយក'),
      message: t('purchases.toast.exportDownloading', t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...')),
      duration: 2500,
    })

    try {
      // Smooth loading experience so users know download is progressing
      await new Promise(resolve => setTimeout(resolve, 600))

      const headers = [
        'Reference Number',
        'Order Date',
        'Due Date',
        'Supplier',
        'Warehouse',
        'Branch',
        'Items Count',
        'Subtotal ($)',
        'Discount ($)',
        'Tax ($)',
        'Shipping ($)',
        'Grand Total ($)',
        'Paid ($)',
        'Due ($)',
        'Payment Status',
        'Delivery Status',
        'Created By',
        'Notes'
      ]

      const rows = listToExport.map(p => [
        p.reference_number || '',
        p.date || '',
        p.due_date || '',
        p.supplier?.name || '',
        p.warehouse?.name || '',
        p.branch?.name || 'Main Branch',
        p.items_count ?? (p.items?.length || 0),
        Number(p.subtotal || 0).toFixed(2),
        Number(p.discount_amount || 0).toFixed(2),
        Number(p.tax_amount || 0).toFixed(2),
        Number(p.shipping_cost || 0).toFixed(2),
        Number(p.grand_total || 0).toFixed(2),
        Number(p.paid_amount || 0).toFixed(2),
        Number(p.due_amount || 0).toFixed(2),
        p.payment_status || '',
        p.status || '',
        p.creator?.name || '',
        p.notes || ''
      ])

      downloadCsv('purchase_orders', headers, rows)
      if (toastId) {
        toast.dismiss(toastId)
      }
      toast.success({
        title: t('common.success', 'ជោគជ័យ'),
        message: t('purchases.toast.exportSuccess', t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!')),
        duration: 3500,
      })
    } catch {
      if (toastId) {
        toast.dismiss(toastId)
      }
      toast.error({
        title: t('common.error', 'កំហុស'),
        message: t('purchases.toast.exportError', t('common.exportError', 'ការនាំចេញទិន្នន័យបានបរាជ័យ!')),
      })
    } finally {
      setIsExporting(false)
    }
  }

  const addProductToForm = (item: any) => {
    const prodId = item.product_id ?? item.id
    const varId = item.product_variant_id ?? null
    const existingIndex = formItems.findIndex(i => i.product_id === prodId && (i.product_variant_id || null) === varId)
    if (existingIndex !== -1) {
      const updated = [...formItems]
      const currentQty = parseFloat(updated[existingIndex].quantity) || 1
      const newQty = currentQty + 1
      updated[existingIndex].quantity = newQty.toString()
      setFormItems(updated)
      setProdSearch('')
      setProdDropdownOpen(false)
      return
    }

    let baseCost = parseFloat(item.cost_price) || 0
    if (currencyCode === 'KHR') {
      const rate = parseFloat(exchangeRate) || 4100
      baseCost = baseCost * rate
    }

    setFormItems(prev => [
      ...prev,
      {
        product_id: prodId,
        product_variant_id: varId,
        product_name: item.name,
        quantity: '1',
        unit_cost: currencyCode === 'KHR' ? Math.round(baseCost).toString() : baseCost.toFixed(2),
        discount_percent: '0',
        tax_percent: '0',
        notes: ''
      }
    ])
    setProdSearch('')
    setProdDropdownOpen(false)
  }

  const updateFormItem = (index: number, key: string, value: string) => {
    const updated = [...formItems]
    updated[index][key] = value
    setFormItems(updated)
  }

  const removeFormItem = (index: number) => {
    const updated = [...formItems]
    updated.splice(index, 1)
    setFormItems(updated)
  }

  const getFormTotals = () => {
    let subtotal = 0
    let totalDiscount = 0
    let totalTax = 0

    formItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0
      const cost = parseFloat(item.unit_cost) || 0
      const itemSubtotal = qty * cost
      const discAmt = itemSubtotal * ((parseFloat(item.discount_percent) || 0) / 100)
      const taxAmt = (itemSubtotal - discAmt) * ((parseFloat(item.tax_percent) || 0) / 100)
      subtotal += itemSubtotal
      totalDiscount += discAmt
      totalTax += taxAmt
    })

    const ship = parseFloat(shippingCost) || 0
    return {
      subtotal,
      discount_amount: totalDiscount,
      tax_amount: totalTax,
      grand_total: subtotal - totalDiscount + totalTax + ship
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!supplierId) {
      errors.supplierId = t('purchases.errors.supplierRequired', 'Please select a supplier')
    }
    if (!warehouseId) {
      errors.warehouseId = t('purchases.errors.warehouseRequired', 'Please select a warehouse')
    }
    if (!branchId) {
      errors.branchId = t('purchases.errors.branchRequired', 'Please select a branch')
    }
    if (!poDate) {
      errors.poDate = t('purchases.errors.dateRequired', 'Please select a purchase order date')
    }

    if (!formItems || formItems.length === 0) {
      errors.items = t('purchases.addProductRequired', 'Please add at least one product item')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      company_id: 1,
      branch_id: Number(branchId),
      warehouse_id: Number(warehouseId),
      supplier_id: Number(supplierId),
      date: poDate,
      due_date: dueDate || null,
      shipping_cost: parseFloat(shippingCost) || 0,
      paid_amount: parseFloat(paidAmount) || 0,
      notes: notes,
      currency_code: currencyCode,
      exchange_rate: currencyCode === 'KHR' ? 1 : (parseFloat(exchangeRate) || 4100),
      items: formItems.map(item => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || null,
        quantity: parseFloat(item.quantity) || 1,
        unit_cost: parseFloat(item.unit_cost) || 0,
        discount_percent: parseFloat(item.discount_percent) || 0,
        tax_percent: parseFloat(item.tax_percent) || 0,
        notes: item.notes || null
      }))
    }

    if (editPurchaseId) {
      updateMutation.mutate({ id: editPurchaseId, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const openReceiveModal = (po: Purchase) => {
    if (po.items && po.items.length > 0) {
      setReceiveTarget(po)
      const initialQtys: Record<number, string> = {}
      po.items.forEach(item => {
        initialQtys[item.id] = (item.quantity - item.quantity_received).toString()
      })
      setRecvQuantities(initialQtys)
      return
    }
    purchaseService.show(po.id).then(res => {
      const fullPO = (res?.data || res) as Purchase
      setReceiveTarget(fullPO)
      const initialQtys: Record<number, string> = {}
      ;(fullPO.items ?? []).forEach(item => {
        initialQtys[item.id] = (item.quantity - item.quantity_received).toString()
      })
      setRecvQuantities(initialQtys)
    }).catch(() => toast.error(t('purchases.failedLoadItems', 'Failed to load purchase items.')))
  }

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiveTarget) return
    const payload = {
      items: (receiveTarget.items ?? []).map(item => ({
        purchase_item_id: item.id,
        quantity_received: parseFloat(recvQuantities[item.id]) || 0
      })).filter(i => i.quantity_received > 0)
    }
    if (payload.items.length === 0) {
      toast.error(t('purchases.inputReceivingQuantity', 'Please input receiving quantity for at least one item.'))
      return
    }
    receiveMutation.mutate({ id: receiveTarget.id, payload })
  }

  const totals = getFormTotals()

  const breadcrumbItems = useMemo(() => {
    if (activeWorkspaceTab === 'create') {
      return [
        { label: t('nav.purchaseManagement', 'Purchase Management') },
        { label: t('nav.purchaseOrders', 'Purchase Orders'), path: '/purchases' },
        { label: t('purchases.createPO', 'Create Purchase Order') }
      ]
    }
    if (activeWorkspaceTab === 'edit') {
      return [
        { label: t('nav.purchaseManagement', 'Purchase Management') },
        { label: t('nav.purchaseOrders', 'Purchase Orders'), path: '/purchases' },
        { label: t('purchases.editPO', 'Edit Purchase Order') }
      ]
    }
    return [
      { label: t('nav.purchaseManagement', 'Purchase Management') },
      { label: t('nav.purchaseOrders', 'Purchase Orders') }
    ]
  }, [activeWorkspaceTab, t])

  return (
    <div className="space-y-6">
      {activeWorkspaceTab === 'list' ? (
        <>
          {/* Page Breadcrumb */}
          <div className="print:hidden">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* List Page Header */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-1 print:hidden">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
                {t('nav.purchaseOrders', 'Purchase Orders')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {t('purchases.subtitle', 'Manage purchase orders, suppliers, receiving status, payments, inventory replenishment, and procurement operations.')}
              </p>
            </div>
            
            <HeaderActionsGroup>
              <ExportButton
                onExportRange={(range) => handleExportData(false, range)}
                loading={isExporting}
                label={t('common.exportCsv')}
              />
              <AddButton
                onClick={() => switchToTab('create')}
                label={t('purchases.createPO', 'Add Purchase')}
              />
            </HeaderActionsGroup>
          </div>

          {/* Dashboard Metrics */}
          <PurchasesStatsCards
            reportData={reportData}
            purchases={purchases}
            suppliersCount={suppliers?.length ?? 0}
            totalOrdersCount={pagination?.total ?? data?.total ?? purchases.length}
            warehousesCount={warehouses?.length ?? 0}
          />

          {/* Bulk Selection Action Banner */}
          <BulkSelectionBanner
            selectedCount={selectedRows.length}
            onClear={() => setSelectedRows([])}
            extraActions={
              <>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleExportData(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card border border-primary/30 text-primary hover:bg-primary/10 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  <span>{t('purchases.bulkExport', 'នាំចេញដែលបានជ្រើស')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBulkCancelClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-card border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer shadow-xs"
                >
                  <Ban size={13} />
                  <span>{t('purchases.bulkCancel', 'Cancel Selected')}</span>
                </button>
              </>
            }
          />

          {/* Global Standard Table Toolbar */}
          <TableToolbar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder={t('purchases.searchPlaceholder', 'Search PO number, supplier, warehouse...')}
            onFilterClick={() => setFilterDrawerOpen(true)}
            isFilterActive={activeFiltersCount > 0}
            onReset={handleResetFilters}
            onRefresh={() => {
              qc.invalidateQueries({ queryKey: ['purchases'] })
              qc.invalidateQueries({ queryKey: ['purchase-dashboard-stats'] })
            }}
            refreshLoading={isFetching}
            columns={[
              { key: 'reference', label: t('purchases.referenceNumber', 'Reference') },
              { key: 'date', label: t('purchases.date', 'Date') },
              { key: 'supplier', label: t('purchases.supplier', 'Supplier') },
              { key: 'warehouse', label: t('purchases.warehouse', 'Warehouse') },
              { key: 'items', label: t('purchases.items', 'Items') },
              { key: 'grandTotal', label: t('purchases.grandTotal', 'Grand Total') },
              { key: 'paymentStatus', label: t('purchases.paymentStatus', 'Payment Status') },
              { key: 'status', label: t('purchases.status', 'Status') },
            ]}
            visibleColumns={visibleColumns}
            onColumnChange={(cols) => setVisibleColumns(cols as any)}
          />

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
            <TableWrapper isFetching={isFetching}>
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-muted/40 dark:bg-muted/20 border-b border-border">
                    {/* Checkbox Column */}
                    <th className="w-10 px-3.5 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate
                        }}
                        onChange={toggleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-4 w-4"
                        aria-label="Select all purchase orders"
                      />
                    </th>

                    {visibleColumns.reference !== false && (
                      <th onClick={() => handleSort('reference_number')} className="sticky left-0 z-20 bg-card dark:bg-card border-r border-border text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.referenceNumber', 'Reference')} {renderSortIcon('reference_number')}
                      </th>
                    )}
                    {visibleColumns.date !== false && (
                      <th onClick={() => handleSort('date')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.date', 'Date')} {renderSortIcon('date')}
                      </th>
                    )}
                    {visibleColumns.supplier !== false && (
                      <th onClick={() => handleSort('supplier_id')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.supplier', 'Supplier')} {renderSortIcon('supplier_id')}
                      </th>
                    )}
                    {visibleColumns.warehouse !== false && (
                      <th onClick={() => handleSort('warehouse_id')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.warehouse', 'Warehouse')} {renderSortIcon('warehouse_id')}
                      </th>
                    )}
                    {visibleColumns.items !== false && (
                      <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.items', 'Items')}
                      </th>
                    )}
                    {visibleColumns.grandTotal !== false && (
                      <th onClick={() => handleSort('grand_total')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.grandTotal', 'Grand Total')} {renderSortIcon('grand_total')}
                      </th>
                    )}
                    {visibleColumns.paymentStatus !== false && (
                      <th onClick={() => handleSort('payment_status')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.paymentStatus', 'Payment Status')} {renderSortIcon('payment_status')}
                      </th>
                    )}
                    {visibleColumns.status !== false && (
                      <th onClick={() => handleSort('status')} className="text-left cursor-pointer hover:bg-muted/50 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                        {t('purchases.status', 'Status')} {renderSortIcon('status')}
                      </th>
                    )}
                    <th className="sticky right-0 z-20 bg-card dark:bg-card border-l border-border text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap min-w-[96px]">
                      {t('common.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="p-4 text-center"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                        {visibleColumns.reference !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                        {visibleColumns.date !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                        {visibleColumns.supplier !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                        {visibleColumns.warehouse !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                        {visibleColumns.items !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded" /></td>}
                        {visibleColumns.grandTotal !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                        {visibleColumns.paymentStatus !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                        {visibleColumns.status !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                        <td className="p-4"><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <ShoppingBag size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-muted-foreground text-sm font-medium">{t('purchases.noPurchasesFound', 'No purchase orders found')}</p>
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => {
                      const isRowSelected = selectedRows.includes(purchase.id)
                      const isDraft = purchase.status === 'draft'
                      const isOrdered = purchase.status === 'ordered'
                      const isReceived = purchase.status === 'received' || purchase.status === 'completed'
                      const isPartial = purchase.status === 'partial'
                      const isCancelled = purchase.status === 'cancelled'
                      const isPaid = purchase.payment_status === 'paid'

                      const rowActionItems: TableActionItem[] = [
                        {
                          label: t('common.view', 'View Details'),
                          icon: Eye,
                          onClick: () => handleViewPurchase(purchase),
                          variant: 'default',
                        },
                        {
                          label: t('common.print', 'Print Voucher'),
                          icon: Printer,
                          onClick: () => handlePrintPurchase(purchase),
                          variant: 'default',
                        },
                        {
                          label: t('common.edit', 'Edit Order'),
                          icon: Edit2,
                          onClick: () => switchToTab('edit', purchase),
                          variant: 'default',
                          hidden: !isDraft && !isOrdered,
                        },
                        {
                          label: t('purchases.receiveShipment', 'Receive Shipment (GRN)'),
                          icon: PackageCheck,
                          onClick: () => openReceiveModal(purchase),
                          variant: 'success',
                          hidden: isReceived || isCancelled,
                        },
                        {
                          label: t('purchases.recordPayment', 'Record Payment'),
                          icon: DollarSign,
                          onClick: () => setPaymentTarget(purchase),
                          variant: 'success',
                          hidden: isPaid || isCancelled,
                        },
                        {
                          label: t('purchases.returnToSupplier', 'Return to Supplier'),
                          icon: RotateCcw,
                          onClick: () => navigate(`/purchases/returns?purchase_id=${purchase.id}`),
                          variant: 'warning',
                          hidden: !isReceived && !isPartial,
                        },
                        {
                          label: t('purchases.duplicatePO', 'Duplicate / Re-order'),
                          icon: Copy,
                          onClick: () => handleDuplicatePO(purchase),
                          variant: 'default',
                        },
                        {
                          label: t('purchases.cancelPO', 'Cancel Order'),
                          icon: Ban,
                          onClick: () => setCancelTarget(purchase),
                          variant: 'danger',
                          hidden: isReceived || isCancelled || isPartial,
                        },
                        {
                          label: t('common.delete', 'Delete Order'),
                          icon: Trash2,
                          onClick: () => setDeleteTarget(purchase),
                          variant: 'danger',
                          hidden: !isDraft,
                        }
                      ]

                      return (
                        <tr
                          key={purchase.id}
                          className={`hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors group cursor-pointer ${
                            isRowSelected ? 'bg-primary/10 dark:bg-primary/15' : ''
                          }`}
                          onClick={() => handleViewPurchase(purchase)}
                        >
                          {/* Row Checkbox */}
                          <td className="w-10 px-3.5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => toggleSelectRow(purchase.id)}
                              className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-4 w-4"
                              aria-label={`Select purchase ${purchase.reference_number}`}
                            />
                          </td>

                          {visibleColumns.reference !== false && (
                            <td className={`sticky left-0 z-10 ${isRowSelected ? 'bg-primary/10 dark:bg-primary/15' : 'bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20'} transition-colors border-r border-border py-3 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap`}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/purchases/${purchase.id}`)
                                }}
                                className="hover:underline font-bold text-left cursor-pointer flex items-center gap-1 text-primary group-hover:text-primary/90"
                                title={t('purchases.openFullDetail', 'Open Full Page')}
                              >
                                <span>{purchase.reference_number}</span>
                                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </td>
                          )}
                          {visibleColumns.date !== false && (
                            <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              {purchase.date || '—'}
                            </td>
                          )}
                          {visibleColumns.supplier !== false && (
                            <td className="py-3 px-4 font-medium text-foreground text-xs whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {purchase.supplier?.name && (
                                  <SupplierLogo
                                    logo={purchase.supplier?.logo}
                                    name={purchase.supplier?.name}
                                    size="xs"
                                    className="rounded-md"
                                  />
                                )}
                                <span>{purchase.supplier?.name || '—'}</span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.warehouse !== false && (
                            <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              {purchase.warehouse?.name || '—'}
                            </td>
                          )}
                          {visibleColumns.items !== false && (
                            <td className="py-3 px-4 text-xs text-foreground font-semibold whitespace-nowrap">
                              {purchase.items_count ?? (purchase.items ? purchase.items.length : 0)}
                            </td>
                          )}
                          {visibleColumns.grandTotal !== false && (
                            <td className="py-3 px-4 font-mono font-bold text-xs text-foreground whitespace-nowrap">
                              ${Number(purchase.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          )}
                          {visibleColumns.paymentStatus !== false && (
                            <td className="py-3 px-4 whitespace-nowrap text-xs font-bold">
                              <span className={PAYMENT_BADGE[purchase.payment_status] ?? 'px-2 py-0.5 rounded text-[11px] bg-muted'}>
                                {getPaymentStatusLabel(purchase.payment_status, t)}
                              </span>
                            </td>
                          )}
                          {visibleColumns.status !== false && (
                            <td className="py-3 px-4 whitespace-nowrap text-xs font-bold">
                              <span className={STATUS_BADGE[purchase.status] ?? 'px-2 py-0.5 rounded text-[11px] bg-muted'}>
                                {getDeliveryStatusLabel(purchase.status, t)}
                              </span>
                            </td>
                          )}
                          <td className={`sticky right-0 z-10 ${isRowSelected ? 'bg-primary/10 dark:bg-primary/15' : 'bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20'} transition-colors border-l border-border py-3 px-4 text-center whitespace-nowrap min-w-[96px]`} onClick={(e) => e.stopPropagation()}>
                            <TableActionMenu items={rowActionItems} />
                          </td>
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
        </>
      ) : (
        /* Create & Edit PO Form Section */
        <PurchaseFormSection
          editPurchaseId={editPurchaseId}
          editLoading={editLoading}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          branchId={branchId}
          setBranchId={setBranchId}
          poDate={poDate}
          setPoDate={setPoDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          currencyCode={currencyCode}
          handleCurrencyChange={handleCurrencyChange}
          exchangeRate={exchangeRate}
          setExchangeRate={setExchangeRate}
          shippingCost={shippingCost}
          setShippingCost={setShippingCost}
          notes={notes}
          setNotes={setNotes}
          formItems={formItems}
          updateFormItem={updateFormItem}
          removeFormItem={removeFormItem}
          addProductToForm={addProductToForm}
          suppliers={suppliers || []}
          warehouses={warehouses || []}
          branches={branches || []}
          filteredProducts={filteredProducts}
          prodSearch={prodSearch}
          setProdSearch={setProdSearch}
          prodDropdownOpen={prodDropdownOpen}
          setProdDropdownOpen={setProdDropdownOpen}
          totals={totals}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          formErrors={formErrors}
          onClearError={handleClearError}
          onSubmit={handleFormSubmit}
          onCancel={() => switchToTab('list')}
        />
      )}

      {/* Shipment Receiving Modal */}
      <ReceiveShipmentModal
        receiveTarget={receiveTarget}
        onClose={() => setReceiveTarget(null)}
        recvQuantities={recvQuantities}
        setRecvQuantities={setRecvQuantities}
        onSubmit={handleReceiveSubmit}
        isSubmitting={receiveMutation.isPending}
      />

      {/* Single Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title={t('purchases.cancelPOTitle', 'Cancel Purchase Order')}
        message={
          cancelTarget
            ? t('purchases.cancelPOConfirm', 'Are you sure you want to cancel purchase order {{ref}}? This action cannot be undone.', { ref: `#${cancelTarget.reference_number}` })
            : ''
        }
        warningText={t('purchases.cancelPOWarning', 'This action will lock the purchase order and prevent inventory receiving.')}
        confirmText={t('common.confirm', 'Confirm Cancel')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={cancelMutation.isPending}
        variant="danger"
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('purchases.deletePOTitle', 'Delete Purchase Order')}
        message={
          deleteTarget
            ? t('purchases.deletePOConfirm', 'Are you sure you want to delete purchase order {{ref}}? This action cannot be undone.', { ref: `#${deleteTarget.reference_number}` })
            : ''
        }
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
        onCancel={() => setDeleteTarget(null)}
      />



      {/* Bulk Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={bulkCancelConfirmOpen}
        variant="warning"
        title={t('purchases.bulkCancel', 'Bulk Cancel Purchase Orders')}
        message={
          cancellablePurchases.length < selectedRows.length
            ? t('purchases.bulkCancelPartialDesc', 'Only {{cancellableCount}} purchase orders can be cancelled ({{skippedCount}} orders are already received and will be skipped). Do you want to proceed with cancelling {{cancellableCount}} orders?', {
                cancellableCount: cancellablePurchases.length,
                skippedCount: selectedRows.length - cancellablePurchases.length
              })
            : t('purchases.bulkCancelConfirm', 'Are you sure you want to cancel {{count}} selected purchase orders?', {
                count: cancellablePurchases.length
              })
        }
        confirmText={t('common.confirm', 'Confirm Cancel')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkCancelMutation.isPending}
        onConfirm={() => bulkCancelMutation.mutate(cancellablePurchases.map(p => p.id))}
        onCancel={() => setBulkCancelConfirmOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={Boolean(paymentTarget)}
        purchase={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSubmit={(amount, notes) => {
          if (!paymentTarget) return
          paymentMutation.mutate({ id: paymentTarget.id, amount, notes })
        }}
        isSubmitting={paymentMutation.isPending}
      />

      {/* Filter Drawer */}
      <PurchasesFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        suppliers={suppliers || []}
        warehouses={warehouses || []}
        branches={branches || []}
        users={users || []}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        purchaseDateStartFilter={purchaseDateStartFilter}
        setPurchaseDateStartFilter={setPurchaseDateStartFilter}
        purchaseDateEndFilter={purchaseDateEndFilter}
        setPurchaseDateEndFilter={setPurchaseDateEndFilter}
        dueDateStartFilter={dueDateStartFilter}
        setDueDateStartFilter={setDueDateStartFilter}
        dueDateEndFilter={dueDateEndFilter}
        setDueDateEndFilter={setDueDateEndFilter}
        minAmountFilter={minAmountFilter}
        setMinAmountFilter={setMinAmountFilter}
        maxAmountFilter={maxAmountFilter}
        setMaxAmountFilter={setMaxAmountFilter}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        onReset={handleResetFilters}
        setPage={setPage}
      />

      {/* Direct Table Action Printable Voucher */}
      <PurchasePrintVoucher
        purchase={printPurchase}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintPurchase(null)
        }}
      />
    </div>
  )
}

export default PurchasesPage
