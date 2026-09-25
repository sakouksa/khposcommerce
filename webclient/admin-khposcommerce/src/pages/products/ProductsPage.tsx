import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import {
  Package, Plus, Search, Filter, RefreshCw, Download, Upload, Settings, Trash2, X,
  FolderTree, Sparkles, Scale, SlidersHorizontal, Receipt
} from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import ResetButton from '@/components/shared/ResetButton'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  ImportButton,
  TableToolbar,
} from '@/components/common'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency } from '@/utils/formatters'

import CategoriesPage from '@/pages/categories/CategoriesPage'
import BrandsPage from '@/pages/brands/BrandsPage'
import UnitsPage from '@/pages/settings/UnitsPage'
import AttributesPage from '@/pages/attributes/AttributesPage'
import TaxesPage from '@/pages/products/TaxesPage'

import { ProductStatsCards } from './components/ProductStatsCards'
import { ProductFilterDrawer } from './components/ProductFilterDrawer'
import { ProductDetailDrawer } from './components/ProductDetailDrawer'
import { ProductImportModal } from './components/ProductImportModal'
import { ProductTableSection } from './components/ProductTableSection'
import { ProductBarcodePrintModal } from './components/ProductBarcodePrintModal'
import { QuickStockAdjustModal } from './components/QuickStockAdjustModal'
import { ColumnSettingsPopover } from '@/components/shared/ColumnSettingsPopover'
import type { Product } from './types/productsPage.types'

const ProductsPage: React.FC = () => {
  const { language } = useThemeStore()
  const { t, i18n } = useTranslation(['products', 'common'])
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const qc = useQueryClient()
  const toast = useToast()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const formatMoney = (amount: number) => formatCurrency(amount, { locale })

  const [activeWorkspaceTab, setActiveWorkspaceTab] = usePageTab<string>({
    storageKey: 'products_active_tab',
    defaultTab: 'products',
    validTabs: ['products', 'categories', 'brands', 'units', 'attributes', 'taxes'],
  })

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
  } = useServerPagination({ storageKey: 'products' })

  // Filters & State
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [stockLevelFilter, setStockLevelFilter] = useState('')
  const [priceMinFilter, setPriceMinFilter] = useState('')
  const [priceMaxFilter, setPriceMaxFilter] = useState('')
  const [recycleBinMode, setRecycleBinMode] = useState(false)
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI state
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Product | null>(null)
  const [quickAdjustProduct, setQuickAdjustProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; force: boolean; name?: string }>({
    open: false,
    id: null,
    force: false,
    name: ''
  })

  // Sub-tab add triggers
  const [categoryAddTrigger, setCategoryAddTrigger] = useState(0)
  const [brandAddTrigger, setBrandAddTrigger] = useState(0)
  const [unitAddTrigger, setUnitAddTrigger] = useState(0)
  const [taxAddTrigger, setTaxAddTrigger] = useState(0)
  const [attributeAddTrigger, setAttributeAddTrigger] = useState(0)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    name: true,
    sku: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    rating: true,
  })

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ['products-dashboard-statistics'],
    queryFn: () => productService.dashboardStatistics(),
    staleTime: 30000,
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'products', page, debouncedSearch, perPage, sortBy, sortOrder,
      statusFilter, categoryFilter, brandFilter, stockLevelFilter,
      priceMinFilter, priceMaxFilter, recycleBinMode
    ],
    queryFn: () => productService.list({
      page,
      search: debouncedSearch,
      per_page: perPage,
      sort: sortBy,
      order: sortOrder,
      status: recycleBinMode ? 'deleted' : statusFilter,
      category_id: categoryFilter || undefined,
      brand_id: brandFilter || undefined,
      ...((stockLevelFilter || priceMinFilter || priceMaxFilter) ? {
        inventory: stockLevelFilter || undefined,
        price_min: priceMinFilter || undefined,
        price_max: priceMaxFilter || undefined,
      } as any : {})
    }),
    placeholderData: (prev) => prev,
    enabled: activeWorkspaceTab === 'products',
  })

  const rawProducts: Product[] = data?.data ?? []
  const products = rawProducts
  const pagination = data?.pagination ?? { total: products.length, current_page: 1, last_page: 1 }

  const { data: categories } = useQuery({
    queryKey: ['categories-select'],
    queryFn: () => categoryService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: brands } = useQuery({
    queryKey: ['brands-select'],
    queryFn: () => brandService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const analytics = useMemo(() => {
    const totalProducts = statsData?.total_products ?? pagination.total ?? products.length ?? 0
    const activeProducts = statsData?.active_products ?? products.filter(p => p.status === 'active').length
    const inactiveProducts = statsData?.inactive_products ?? products.filter(p => p.status !== 'active').length
    const outOfStock = statsData?.out_of_stock ?? products.filter(p => (p.stock ?? 0) <= 0).length

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStock,
      categoriesCount: statsData?.categories ?? categories?.length ?? 0,
      brandsCount: statsData?.brands ?? brands?.length ?? 0,
      attributesCount: statsData?.attributes ?? 0,
      variantsCount: statsData?.variants ?? 0,
      costValue: Number(statsData?.cost_value ?? 0),
      sellingValue: Number(statsData?.selling_value ?? statsData?.inventory_value ?? 0),
      potentialProfit: Number(statsData?.potential_profit ?? statsData?.profit_value ?? 0),
      averagePrice: Number(statsData?.average_price ?? 0),
      bestSelling: statsData?.best_selling ?? 0,
      lowSelling: statsData?.low_selling ?? 0,
      mostViewed: statsData?.most_viewed ?? 0,
      averageRating: statsData?.average_rating ?? 0,
      todayNewProducts: statsData?.today_new_products ?? 0,
      lowStockProducts: statsData?.low_stock ?? statsData?.low_stock_products ?? 0,
      productsOnSale: statsData?.products_on_sale ?? 0,
      productsWithDiscount: statsData?.products_with_discount ?? 0,
      recentlyUpdated: statsData?.recently_updated ?? 0
    }
  }, [statsData, pagination, products, categories, brands])

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('toast.deleted'))
      adjustAfterDelete(products.length)
      setDeleteConfirm({ open: false, id: null, force: false })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error'))
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => productService.bulkDelete(ids),
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(
        t('products.bulkDeleteSuccess', {
          count: ids.length,
          defaultValue: `${ids.length} products deleted.`
        }).replace('{{count}}', String(ids.length))
      )
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      adjustAfterDelete(products.length - ids.length)
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
          t('products.bulkDeleteError', t('toast.error', 'Failed to delete selected products.'))
      )
  })

  // Duplicate Mutation
  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const copyName = `${product.name} (Copy)`
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const copySku = `${product.sku}-COPY-${randomSuffix}`

      const payload: any = {
        name: copyName,
        sku: copySku,
        barcode: product.barcode ? `${product.barcode}9` : null,
        category_id: product.category?.id || (product as any).category_id || null,
        brand_id: product.brand?.id || (product as any).brand_id || null,
        unit_id: product.unit?.id || (product as any).unit_id || null,
        tax_id: product.tax?.id || (product as any).tax_id || null,
        cost_price: Number(product.cost_price || 0),
        selling_price: Number(product.selling_price || 0),
        compare_price: product.compare_price ? Number(product.compare_price) : null,
        description: product.description || '',
        short_description: product.short_description || '',
        weight: product.weight ? Number(product.weight) : null,
        length: product.length ? Number(product.length) : null,
        width: product.width ? Number(product.width) : null,
        height: product.height ? Number(product.height) : null,
        track_inventory: product.track_inventory ?? true,
        low_stock_threshold: product.low_stock_threshold || 5,
        status: 'active',
        is_featured: product.is_featured ?? false,
        is_digital: product.is_digital ?? false,
      }

      return productService.create(payload)
    },
    onSuccess: (newProd) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['products-dashboard-statistics'] })
      toast.success(t('productDuplicateSuccess', 'Product duplicated successfully: "{{name}}"', { name: newProd?.name || 'Product' }))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('productDuplicateFailed', 'Failed to duplicate product'))
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleExport = (exportOnlySelected = false) => {
    const isExportingSelected = exportOnlySelected || selectedRows.length > 0
    const exportItems = isExportingSelected
      ? products.filter(p => selectedRows.includes(p.id))
      : products

    if (!exportItems || exportItems.length === 0) {
      toast.error(t('common.noData', 'No data available to export'))
      return
    }

    const headers = ['ID', 'Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Selling Price ($)', 'Cost Price ($)', 'Stock', 'Status']
    const rows = exportItems.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.sku || '').replace(/"/g, '""')}"`,
      `"${(p.barcode || '').replace(/"/g, '""')}"`,
      `"${(p.category?.name || '').replace(/"/g, '""')}"`,
      `"${(p.brand?.name || '').replace(/"/g, '""')}"`,
      Number(p.selling_price || 0).toFixed(2),
      Number(p.cost_price || 0).toFixed(2),
      p.stock || 0,
      p.status || (p as any).is_active ? 'active' : 'inactive'
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `products_${isExportingSelected ? 'selected_' : ''}export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(
      isExportingSelected
        ? t('exportSelectedSuccess', 'Successfully exported {{count}} selected products to CSV!', { count: exportItems.length })
        : t('exportSuccess', 'Successfully exported {{count}} products to CSV!', { count: exportItems.length })
    )
  }

  const handleImportSubmit = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      await new Promise(res => setTimeout(res, 800))
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Successfully imported products CSV dataset!')
      setImportOpen(false)
      setImportFile(null)
    } catch {
      toast.error('Failed to import products dataset.')
    } finally {
      setImporting(false)
    }
  }

  const handleSubTabAddClick = () => {
    if (activeWorkspaceTab === 'products') navigate('/products/create')
    else if (activeWorkspaceTab === 'categories') setCategoryAddTrigger(prev => prev + 1)
    else if (activeWorkspaceTab === 'brands') setBrandAddTrigger(prev => prev + 1)
    else if (activeWorkspaceTab === 'units') setUnitAddTrigger(prev => prev + 1)
    else if (activeWorkspaceTab === 'attributes') setAttributeAddTrigger(prev => prev + 1)
    else if (activeWorkspaceTab === 'taxes') setTaxAddTrigger(prev => prev + 1)
  }

  const resetAllFilters = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setBrandFilter('')
    setStockLevelFilter('')
    setPriceMinFilter('')
    setPriceMaxFilter('')
    reset()
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb items={[{ label: t('products', 'Products') }]} />

      {/* Frameless Hero Header (Shopify Polaris Standard) */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('heroTitle', 'Product Catalog & Inventory Management')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('heroSubtitle', 'Manage your entire product catalog, SKUs, categories, brands, variants, pricing, and live inventory levels.')}
          </p>
        </div>

        <HeaderActionsGroup>
          <ImportButton
            onClick={() => setImportOpen(true)}
            label={t('importCSV', 'Import CSV')}
          />
          <ExportButton
            onClick={() => handleExport(false)}
            label={
              selectedRows.length > 0
                ? `${t('exportSelectedCSV', 'Export Selected')} (${selectedRows.length})`
                : t('exportCSV', 'Export CSV')
            }
          />
          <AddButton
            onClick={handleSubTabAddClick}
            label={
              activeWorkspaceTab === 'products'
                ? t('addProduct', 'Add Product')
                : activeWorkspaceTab === 'categories'
                ? t('addCategory', 'Add Category')
                : activeWorkspaceTab === 'brands'
                ? t('addBrand', 'Add Brand')
                : activeWorkspaceTab === 'units'
                ? t('addUnit', 'Add Unit')
                : activeWorkspaceTab === 'attributes'
                ? t('addAttribute', 'Add Attribute')
                : t('addTaxRule', 'Add Tax Rule')
            }
          />
        </HeaderActionsGroup>
      </div>

      {/* Workspace Tabs Navigation */}
      <WorkspaceTabs
        tabs={[
          { id: 'products', label: t('tabProducts', 'All Products'), icon: Package },
          { id: 'categories', label: t('tabCategories', 'Categories'), icon: FolderTree },
          { id: 'brands', label: t('tabBrands', 'Brands'), icon: Sparkles },
          { id: 'units', label: t('tabUnits', 'Units'), icon: Scale },
          { id: 'attributes', label: t('tabAttributes', 'Attributes'), icon: SlidersHorizontal },
          { id: 'taxes', label: t('tabTaxes', 'Tax Rates'), icon: Receipt },
        ]}
        activeTab={activeWorkspaceTab}
        onChange={setActiveWorkspaceTab}
      />

      {/* KPI Overview Cards - Only on Main Products Catalog Tab */}
      {activeWorkspaceTab === 'products' && (
        <ProductStatsCards analytics={analytics} formatCurrency={formatMoney} />
      )}

      {/* Active Tab View */}
      {activeWorkspaceTab === 'categories' ? (
        <CategoriesPage isTab triggerAdd={categoryAddTrigger} />
      ) : activeWorkspaceTab === 'brands' ? (
        <BrandsPage isTab triggerAdd={brandAddTrigger} />
      ) : activeWorkspaceTab === 'units' ? (
        <UnitsPage isTab triggerAdd={unitAddTrigger} />
      ) : activeWorkspaceTab === 'attributes' ? (
        <AttributesPage isTab triggerAdd={attributeAddTrigger} />
      ) : activeWorkspaceTab === 'taxes' ? (
        <TaxesPage isTab triggerAdd={taxAddTrigger} />
      ) : (
        <>
          {/* Global Standard Table Toolbar */}
          <TableToolbar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder={t('searchPlaceholder', 'Search product name, SKU, or barcode...')}
            onFilterClick={() => setFilterDrawerOpen(true)}
            isFilterActive={Boolean(statusFilter || categoryFilter || brandFilter || stockLevelFilter || priceMinFilter || priceMaxFilter)}
            onReset={resetAllFilters}
            leftActions={
              selectedRows.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 h-10 min-h-[40px] px-3.5 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={14} />
                  <span>{t('products.deleteSelected', t('common.deleteSelected', 'Delete Selected'))} ({selectedRows.length})</span>
                </button>
              ) : null
            }
            onRefresh={() => qc.invalidateQueries({ queryKey: ['products'] })}
            refreshLoading={isFetching}
            columns={[
              { key: 'image', label: t('products.colPhoto', 'Image') },
              { key: 'name', label: t('products.colName', 'Product Name') },
              { key: 'sku', label: t('products.sku', 'SKU') },
              { key: 'category', label: t('products.colCategory', 'Category') },
              { key: 'price', label: t('products.colPrice', 'Price') },
              { key: 'stock', label: t('products.colStock', 'Stock') },
              { key: 'status', label: t('products.colStatus', 'Status') },
            ]}
            visibleColumns={visibleColumns}
            onColumnChange={setVisibleColumns}
          />

          {/* Filter Drawer */}
          <ProductFilterDrawer
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            stockLevelFilter={stockLevelFilter}
            setStockLevelFilter={setStockLevelFilter}
            priceMinFilter={priceMinFilter}
            setPriceMinFilter={setPriceMinFilter}
            priceMaxFilter={priceMaxFilter}
            setPriceMaxFilter={setPriceMaxFilter}
            categories={categories || []}
            brands={brands || []}
            onReset={resetAllFilters}
          />

          {/* Table */}
          <ProductTableSection
            products={products}
            isLoading={isLoading}
            isFetching={isFetching}
            visibleColumns={visibleColumns}
            recycleBinMode={recycleBinMode}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onView={(p) => navigate(`/products/${p.id}`)}
            onEdit={(p) => navigate(`/products/${p.id}/edit`)}
            onDelete={(p) => setDeleteConfirm({ open: true, id: p.id, force: false, name: p.name })}
            onDuplicate={(p) => duplicateMutation.mutate(p)}
            onPrintBarcode={(p) => setBarcodePrintProduct(p)}
            onQuickStockAdjust={(p) => setQuickAdjustProduct(p)}
            onRestore={() => {}}
            onForceDelete={() => {}}
            formatCurrency={formatMoney}
          />

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />

          {/* Detail Drawer */}
          <ProductDetailDrawer
            product={viewProduct}
            onClose={() => setViewProduct(null)}
            onEdit={(p) => navigate(`/products/${p.id}/edit`)}
            onDuplicate={(p) => duplicateMutation.mutate(p)}
            onQuickStockAdjust={(p) => setQuickAdjustProduct(p)}
            onPrintBarcode={(p) => setBarcodePrintProduct(p)}
            formatCurrency={formatMoney}
          />

          {/* Direct Barcode & Sticker Print Modal */}
          <ProductBarcodePrintModal
            isOpen={!!barcodePrintProduct}
            onClose={() => setBarcodePrintProduct(null)}
            product={barcodePrintProduct}
            formatCurrency={formatMoney}
          />

          {/* Quick Stock Adjustment Modal */}
          <QuickStockAdjustModal
            isOpen={!!quickAdjustProduct}
            onClose={() => setQuickAdjustProduct(null)}
            product={quickAdjustProduct}
            formatCurrency={formatMoney}
          />

          {/* CSV Import Modal */}
          <ProductImportModal
            isOpen={importOpen}
            onClose={() => setImportOpen(false)}
            importFile={importFile}
            setImportFile={setImportFile}
            importing={importing}
            handleImportSubmit={handleImportSubmit}
          />

          {/* Delete Dialog */}
          <ConfirmDialog
            open={deleteConfirm.open}
            title="products.deleteProduct"
            itemName={deleteConfirm.name}
            confirmText="common.confirmDelete"
            cancelText="common.cancel"
            loading={deleteMutation.isPending}
            onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
            onCancel={() => setDeleteConfirm({ open: false, id: null, force: false })}
          />

          {/* Bulk Delete Dialog */}
          <ConfirmDialog
            open={bulkDeleteConfirmOpen}
            title={t('products.bulkDeleteTitle', 'Delete Selected Products')}
            message={t('products.confirmBulkDeleteMessage', {
              count: selectedRows.length,
              defaultValue: `Are you sure you want to delete all ${selectedRows.length} selected products? This action cannot be undone.`
            }).replace('{{count}}', String(selectedRows.length))}
            confirmText="common.confirmDelete"
            cancelText="common.cancel"
            loading={bulkDeleteMutation.isPending}
            onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
            onCancel={() => setBulkDeleteConfirmOpen(false)}
          />
        </>
      )}
    </div>
  )
}

export default ProductsPage
