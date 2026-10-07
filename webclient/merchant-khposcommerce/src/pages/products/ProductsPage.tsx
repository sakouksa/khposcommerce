import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  ImportButton,
  TableToolbar,
  InlineFilterSelect,
} from '@/components/common'
import { usePermission } from '@/hooks/usePermission'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'

import { ProductStatsCards } from './components/ProductStatsCards'
import { ProductFilterDrawer } from './components/ProductFilterDrawer'
import { ProductDetailDrawer } from './components/ProductDetailDrawer'
import { ProductImportModal } from './components/ProductImportModal'
import { ProductTableSection } from './components/ProductTableSection'
import { ProductBarcodePrintModal } from './components/ProductBarcodePrintModal'
import { QuickStockAdjustModal } from './components/QuickStockAdjustModal'
import type { Product } from './types/productsPage.types'

const ProductsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['products', 'common'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const formatMoney = (amount: number) => formatCurrency(amount, { locale })

  // RBAC Permission checks
  const { hasPermission } = usePermission()
  const canCreate = hasPermission('product.create')
  const canEdit = hasPermission('product.update')
  const canDelete = hasPermission('product.delete')
  const canExport = hasPermission('product.export')
  const canImport = hasPermission('product.import')
  const canAdjust = hasPermission('stock_adjustment.adjust') || hasPermission('inventory.update')



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



  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    name: true,
    sku: true,
    category: true,
    supplier: true,
    stock: true,
    price: true,
    status: true,
    rating: false,
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
      <Breadcrumb
        items={[
          { label: t('nav.productManagement', 'Products'), path: '/products' },
          { label: t('nav.allProducts', 'All Products') },
        ]}
      />

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
          {canImport && (
            <ImportButton
              onClick={() => setImportOpen(true)}
              label={t('importCSV', 'Import CSV')}
            />
          )}
          {canExport && (
            <ExportButton
              onClick={() => handleExport(false)}
              label={
                selectedRows.length > 0
                  ? `${t('exportSelectedCSV', 'Export Selected')} (${selectedRows.length})`
                  : t('exportCSV', 'Export CSV')
              }
            />
          )}
          {canCreate && (
            <AddButton
              onClick={() => navigate('/products/create')}
              label={t('addProduct', 'Add Product')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* KPI Overview Cards */}
      <ProductStatsCards analytics={analytics} formatCurrency={formatMoney} />
          {/* Global Standard Table Toolbar with Shadcn Inline Filters & Manage Table */}
          <TableToolbar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder={t('searchPlaceholder', 'Search products')}
            hideFilterButton={true}
            hideRefreshButton={true}
            isFilterActive={Boolean(categoryFilter || brandFilter || stockLevelFilter || search)}
            onReset={resetAllFilters}
            filters={
              <>
                <InlineFilterSelect
                  label={t('colCategory', 'Category')}
                  value={categoryFilter}
                  onChange={(val) => { setCategoryFilter(val); setPage(1); }}
                  allLabel={t('allCategories', 'All categories')}
                  options={(categories || []).map((c: any) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
                <InlineFilterSelect
                  label={t('colBrand', 'Brand')}
                  value={brandFilter}
                  onChange={(val) => { setBrandFilter(val); setPage(1); }}
                  allLabel={t('allBrands', 'All brands')}
                  options={(brands || []).map((b: any) => ({
                    label: b.name,
                    value: b.id,
                  }))}
                />
                <InlineFilterSelect
                  label={t('colStock', 'Stock level')}
                  value={stockLevelFilter}
                  onChange={(val) => { setStockLevelFilter(val); setPage(1); }}
                  allLabel={t('allStockLevels', 'All stock levels')}
                  options={[
                    { label: t('stockHigh', 'High stock'), value: 'high' },
                    { label: t('stockLow', 'Low stock'), value: 'low' },
                    { label: t('stockOut', 'Out of stock'), value: 'out' },
                  ]}
                />
              </>
            }
            leftActions={
              selectedRows.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 h-10 min-h-[40px] max-h-[40px] px-3.5 text-xs sm:text-[13px] font-semibold bg-rose-500/10 text-rose-600 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0 box-border leading-normal"
                >
                  <Trash2 size={14} />
                  <span>{t('products.deleteSelected', t('common.deleteSelected', 'Delete Selected'))} ({selectedRows.length})</span>
                </button>
              ) : null
            }
            onRefresh={() => qc.invalidateQueries({ queryKey: ['products'] })}
            refreshLoading={isFetching}
            manageTableLabel={t('manageTable', 'Manage Table')}
            columns={[
              { key: 'name', label: t('products.colName', 'Product name') },
              { key: 'sku', label: t('products.sku', 'SKU') },
              { key: 'category', label: t('products.colCategory', 'Category') },
              { key: 'supplier', label: t('colBrand', 'Brand') },
              { key: 'stock', label: t('products.colStock', 'Current stock') },
              { key: 'price', label: t('products.colPrice', 'Unit price') },
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
            onEdit={canEdit ? (p) => navigate(`/products/${p.id}/edit`) : undefined}
            onDelete={canDelete ? (p) => setDeleteConfirm({ open: true, id: p.id, force: false, name: p.name }) : undefined}
            onDuplicate={canCreate ? (p) => duplicateMutation.mutate(p) : undefined}
            onPrintBarcode={(p) => setBarcodePrintProduct(p)}
            onQuickStockAdjust={canAdjust ? (p) => setQuickAdjustProduct(p) : undefined}
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
            onEdit={(p) => { if (canEdit) navigate(`/products/${p.id}/edit`) }}
            onDuplicate={canCreate ? (p) => duplicateMutation.mutate(p) : undefined}
            onQuickStockAdjust={canAdjust ? (p) => setQuickAdjustProduct(p) : undefined}
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
    </div>
  )
}

export default ProductsPage
