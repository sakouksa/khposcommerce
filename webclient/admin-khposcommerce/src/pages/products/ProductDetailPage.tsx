import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Edit2, Copy, Check, Printer, Warehouse, Tag, Box, DollarSign,
  Package, CheckCircle2, AlertTriangle, ArrowLeft, ExternalLink,
  Sparkles, Star, Eye, ShoppingCart, Barcode, Scale, Truck, Globe,
  Info, RefreshCw, ChevronRight, Layers, Trash2
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useToast } from '@/hooks/useToast'
import { useThemeStore } from '@/stores/themeStore'
import { formatCurrency } from '@/utils/formatters'
import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import {
  FormHeader,
  FormHeaderButton,
  StatusBadge,
  LoadingSpinner,
  DeleteConfirmDialog,
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import { ProductBarcodePrintModal } from './components/ProductBarcodePrintModal'
import { QuickStockAdjustModal } from './components/QuickStockAdjustModal'
import { ProductThumbnail } from './components/ProductThumbnail'
import type { Product } from './types/productsPage.types'

type TabKey = 'overview' | 'variants' | 'inventory' | 'dimensions' | 'pricing_tiers' | 'seo'

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const productId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { t, i18n } = useTranslation(['products', 'common'])
  const { language } = useThemeStore()
  const toast = useToast()

  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const formatMoney = (amount: number) => formatCurrency(amount, { locale })

  const [activeTab, setActiveTab] = usePageTab<TabKey>({
    storageKey: 'product_detail_active_tab',
    defaultTab: 'overview',
    validTabs: ['overview', 'variants', 'inventory', 'dimensions', 'pricing_tiers', 'seo'],
    deleteDefaultFromUrl: true,
  })
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Modals state
  const [isBarcodePrintOpen, setIsBarcodePrintOpen] = useState(false)
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false)
  const [quickAdjustTarget, setQuickAdjustTarget] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch product full details
  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => (productId ? productService.show(productId) : null),
    enabled: !!productId && !isNaN(productId),
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (target: Product) => {
      const copyName = `${target.name} (Copy)`
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const copySku = `${target.sku}-COPY-${randomSuffix}`

      const payload: any = {
        name: copyName,
        sku: copySku,
        barcode: `${target.barcode || '8880000000000'}-${randomSuffix}`,
        selling_price: Number(target.selling_price || 0),
        cost_price: Number(target.cost_price || 0),
        compare_price: target.compare_price ? Number(target.compare_price) : null,
        stock: Number(target.stock || 0),
        category_id: target.category_id || target.category?.id,
        brand_id: target.brand_id || target.brand?.id,
        unit_id: target.unit_id || target.unit?.id,
        tax_id: target.tax_id || target.tax?.id,
        description: target.description,
        short_description: (target as any).short_description,
        is_active: true,
        status: 'active',
      }
      return productService.create(payload)
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('productDuplicateSuccess', 'Product duplicated successfully!'))
      const newId = res?.id || res?.data?.id
      if (newId) {
        navigate(`/products/${newId}`)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('productDuplicateFailed', 'Failed to duplicate product'))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (targetId: number) => productService.delete(targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('productDeleteSuccess', 'Product deleted successfully'))
      navigate('/products')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('productDeleteFailed', 'Failed to delete product'))
    },
  })

  const handleCopy = (text?: string | null, key?: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (key) {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    }
    toast.success(t('copiedToClipboard', 'Copied to clipboard'))
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const product: Product | null = productData || null

  // Image list handling
  const imageList = useMemo(() => {
    if (!product) return []
    const list: string[] = []
    if (product.primary_image) list.push(getAbsoluteImageUrl(product.primary_image))
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = getAbsoluteImageUrl(img.url || img.image || img)
        if (url && !list.includes(url)) list.push(url)
      })
    }
    if (list.length === 0 && (product as any).image) {
      list.push(getAbsoluteImageUrl((product as any).image))
    }
    return list.length > 0 ? list : [DEFAULT_PRODUCT_IMAGE]
  }, [product])

  // Calculations
  const sellingPrice = Number(product?.selling_price || 0)
  const costPrice = Number(product?.cost_price || 0)
  const comparePrice = product?.compare_price ? Number(product.compare_price) : null
  const profit = sellingPrice > 0 && costPrice > 0 ? sellingPrice - costPrice : 0
  const marginPercent = sellingPrice > 0 && costPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0
  const discountPercent =
    comparePrice && comparePrice > sellingPrice
      ? Math.round(((comparePrice - sellingPrice) / comparePrice) * 100)
      : 0

  const length = Number(product?.length || 0)
  const width = Number(product?.width || 0)
  const height = Number(product?.height || 0)
  const weight = Number(product?.weight || 0)
  const volumeCm3 = length > 0 && width > 0 && height > 0 ? (length * width * height).toLocaleString() : null
  const volumetricWeightKg =
    length > 0 && width > 0 && height > 0 ? ((length * width * height) / 5000).toFixed(2) : null

  const totalStock = Number(product?.stock ?? (product as any)?.total_stock ?? 0)
  const lowStockThreshold = Number(product?.low_stock_threshold ?? 5)
  const isOutOfStock = totalStock <= 0
  const isLowStock = totalStock > 0 && totalStock <= lowStockThreshold

  const variantsList = product?.variants || []
  const warehouseStocksList = (product as any)?.warehouse_stocks || []
  const tierPricesList = (product as any)?.prices || []

  const workspaceTabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'overview',
      label: t('tabOverview', 'Overview'),
    },
    {
      id: 'variants',
      label: t('tabVariants', 'Variants'),
      count: variantsList.length,
    },
    {
      id: 'inventory',
      label: t('tabInventory', 'Warehouse Stock'),
      count: warehouseStocksList.length,
    },
    {
      id: 'dimensions',
      label: t('tabDimensions', 'Dimensions & Shipping'),
    },
    {
      id: 'pricing_tiers',
      label: t('tabTierPricing', 'Wholesale (Tiers)'),
      count: tierPricesList.length,
    },
    {
      id: 'seo',
      label: t('tabSEO', 'SEO & Marketing'),
    },
  ], [t, variantsList.length, warehouseStocksList.length, tierPricesList.length])

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 max-w-xl mx-auto text-center">
        <CustomErrorMessage
          variant="card"
          severity="error"
          code={(error as any)?.response?.status || 404}
          title={t('loadErrorTitle', 'Unable to Load Product')}
          message={
            (error as any)?.response?.data?.message ||
            t('loadErrorDesc', 'Product not found or failed to fetch product data.')
          }
          onRetry={() => refetch()}
          action={{
            label: t('common.back', 'Back'),
            onClick: () => navigate('/products'),
          }}
          className="w-full shadow-2xl"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── 1. ENTERPRISE FORM HEADER ────────────────────────────────────── */}
      <FormHeader
        title={product.name}
        subtitle={
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
            <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
              {product.sku}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(product.sku, 'sku')}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('common.copy', 'Copy')}
            >
              {copiedKey === 'sku' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>

            {product.barcode && (
              <>
                <span className="text-border">|</span>
                <span className="font-mono font-medium">{product.barcode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(product.barcode, 'barcode')}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={t('common.copy', 'Copy')}
                >
                  {copiedKey === 'barcode' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </>
            )}

            <span className="text-border">|</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              {product.category?.name || t('generalCategory', 'General')}
            </span>

            {product.brand?.name && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {product.brand.name}
              </span>
            )}

            {product.unit?.name && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground border border-border">
                {product.unit.name} ({product.unit.symbol || product.unit.name})
              </span>
            )}

            {product.is_featured ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                ★ {t('featuredBadge', 'Featured')}
              </span>
            ) : null}
          </div>
        }
        statusBadge={
          <StatusBadge
            status={product.status === 'active' || (product as any).is_active === 1 || (product as any).is_active === true}
            rounded="full"
          />
        }
        breadcrumbs={[
          { label: t('products', 'Products'), path: '/products' },
          { label: product.name },
        ]}
        backPath="/products"
        backLabel={t('common.back', 'Back')}
        extraActions={
          <div className="flex items-center gap-2 flex-wrap">
            <FormHeaderButton
              variant="secondary"
              icon={<Printer size={14} />}
              onClick={() => setIsBarcodePrintOpen(true)}
            >
              {t('printBarcodeLabels', 'Print Barcode Labels')}
            </FormHeaderButton>

            <FormHeaderButton
              variant="secondary"
              icon={<Warehouse size={14} />}
              onClick={() => {
                setQuickAdjustTarget(product)
                setIsQuickAdjustOpen(true)
              }}
            >
              {t('quickStockAdjust', 'Quick Stock Adjustment')}
            </FormHeaderButton>

            <FormHeaderButton
              variant="secondary"
              icon={<Copy size={14} />}
              onClick={() => duplicateMutation.mutate(product)}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending
                ? t('common.saving', 'Saving...')
                : t('duplicateProduct', 'Duplicate Product (Clone)')}
            </FormHeaderButton>

            <FormHeaderButton
              variant="primary"
              icon={<Edit2 size={14} />}
              onClick={() => navigate(`/products/${product.id}/edit`)}
            >
              {t('editProduct', 'Edit Product')}
            </FormHeaderButton>
          </div>
        }
      />

      {/* ── 2. TOP 4 METRIC KPI CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selling Price & Profit */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('sellingPriceAndMargin', 'Selling Price & Profit Margin')}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-mono text-foreground tracking-tight">
              {formatMoney(sellingPrice)}
            </p>
            {comparePrice && comparePrice > sellingPrice && (
              <span className="text-xs font-mono line-through text-muted-foreground">
                {formatMoney(comparePrice)}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {costPrice > 0 ? (
              <>
                {t('cost', 'Cost')}: {formatMoney(costPrice)} |{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  +{formatMoney(profit)} ({marginPercent}%)
                </span>
              </>
            ) : (
              t('noCostSet', 'No cost price set')
            )}
          </p>
        </div>

        {/* Card 2: Inventory Stock Level */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('totalInventoryStock', 'Total Inventory Stock')}
          </p>
          <div className="flex items-center gap-2">
            <p
              className={`text-2xl font-black font-mono tracking-tight ${
                isOutOfStock
                  ? 'text-rose-500'
                  : isLowStock
                  ? 'text-amber-500'
                  : 'text-foreground'
              }`}
            >
              {totalStock.toLocaleString()}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {product.unit?.symbol || product.unit?.name || t('units', 'units')}
              </span>
            </p>
          </div>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {isOutOfStock ? (
              <span className="text-rose-500 font-bold">{t('outOfStock', 'Out of Stock')}</span>
            ) : isLowStock ? (
              <span className="text-amber-500 font-bold">
                {t('lowStock', 'Low Stock')} (≤ {lowStockThreshold})
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {t('healthyStock', 'Healthy Stock')}
              </span>
            )}
          </p>
        </div>

        {/* Card 3: Units Sold & Views */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('salesAndViews', 'Sales & Views')}
          </p>
          <p className="text-2xl font-black font-mono text-primary tracking-tight">
            {(product.sold_count ?? 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              {t('soldUnits', 'sold')}
            </span>
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {(product.view_count ?? 0).toLocaleString()} {t('pageViews', 'views')}
          </p>
        </div>

        {/* Card 4: Customer Rating */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customerRating', 'Customer Rating')}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-black font-mono text-amber-500 tracking-tight">
              {product.rating_avg && Number(product.rating_avg) > 0
                ? Number(product.rating_avg).toFixed(1)
                : '5.0'}
            </p>
            <div className="flex text-amber-400 text-sm">
              {'★★★★★'.split('').map((star, idx) => (
                <span key={idx}>{star}</span>
              ))}
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {product.rating_count ?? 0} {t('reviewsCount', 'verified reviews')}
          </p>
        </div>
      </div>

      {/* ── 3. WORKSPACE TABS NAVIGATION ─────────────────────────────────── */}
      <WorkspaceTabs
        tabs={workspaceTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as TabKey)}
      />

      {/* ── 4. TAB PANELS ────────────────────────────────────────────────── */}

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Media Gallery & Quick Specs (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Media Gallery Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <h3 className="text-sm font-bold text-foreground">
                  {t('productImages', 'Product Images')}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedImageIndex + 1} / {imageList.length}
                </span>
              </div>

              {/* Main Image Display */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center group">
                <img
                  src={imageList[selectedImageIndex] || DEFAULT_PRODUCT_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE
                  }}
                />
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}%
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star size={11} fill="currentColor" />
                    <span>{t('featured', 'Featured')}</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Selector Strip */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  {imageList.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === index
                          ? 'border-primary ring-2 ring-primary/20 scale-95'
                          : 'border-border/70 hover:border-primary/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`thumb-${index}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border/80">
                {t('specifications', 'Quick Specifications')}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('colCategory', 'Category')}</span>
                  <span className="font-semibold text-foreground">{product.category?.name || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('colBrand', 'Brand')}</span>
                  <span className="font-semibold text-foreground">{product.brand?.name || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('unit', 'Unit')}</span>
                  <span className="font-semibold text-foreground">
                    {product.unit?.name ? `${product.unit.name} (${product.unit.symbol || ''})` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('taxRate', 'Tax Rate')}</span>
                  <span className="font-semibold text-foreground">
                    {product.tax?.name ? `${product.tax.name} (${product.tax.rate}%)` : 'VAT 10%'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('hasVariants', 'Has Variants')}</span>
                  <span className="font-semibold text-foreground">
                    {product.has_variants || variantsList.length > 0
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{t('trackInventory', 'Track Inventory')}</span>
                  <span className="font-semibold text-foreground">
                    {product.track_inventory ?? true ? t('common.yes', 'Yes') : t('common.no', 'No')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: General Information, Pricing Breakdown, Description (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* General Information Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('generalInfo', 'General Product Information')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('generalInfoDesc', 'Product codes, barcodes, permalinks, and system status')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('sku', 'SKU Code')}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-sm">{product.sku}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(product.sku, 'sku_card')}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copiedKey === 'sku_card' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('barcode', 'Barcode')}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-sm">{product.barcode || '—'}</span>
                    {product.barcode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(product.barcode, 'barcode_card')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedKey === 'barcode_card' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('slug', 'URL Slug')}
                  </span>
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={product.slug}>
                    {product.slug || '—'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('productType', 'Product Form')}
                  </span>
                  <p className="font-semibold text-foreground text-xs">
                    {product.is_digital
                      ? t('digitalProduct', 'Digital Product')
                      : t('physicalProduct', 'Physical Product')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('createdDate', 'Created Date')}
                  </span>
                  <p className="font-mono font-semibold text-foreground text-xs">
                    {formatDate((product as any).created_at)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {t('updatedDate', 'Last Updated')}
                  </span>
                  <p className="font-mono font-semibold text-foreground text-xs">
                    {formatDate((product as any).updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Profit Analysis Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('pricingBreakdown', 'Pricing & Profit Structure')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('pricingBreakdownDesc', 'Selling price, purchase cost, gross profit, and markup margin')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('sellingPrice', 'Selling Price')}
                  </span>
                  <p className="text-xl font-black font-mono text-foreground">
                    {formatMoney(sellingPrice)}
                  </p>
                  {comparePrice && comparePrice > sellingPrice && (
                    <p className="text-[11px] text-muted-foreground">
                      {t('originalPrice', 'Compare At')}:{' '}
                      <span className="line-through">{formatMoney(comparePrice)}</span>
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('costPrice', 'Purchase Cost (COGS)')}
                  </span>
                  <p className="text-xl font-black font-mono text-foreground">
                    {costPrice > 0 ? formatMoney(costPrice) : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t('cogs', 'Supplier purchase cost')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {t('profitPerUnit', 'Profit / Unit')}
                  </span>
                  <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(profit)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t('grossProfit', 'Gross Profit')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <span className="text-xs font-semibold text-primary">
                    {t('profitMargin', 'Profit Margin')}
                  </span>
                  <p className="text-xl font-black font-mono text-primary">
                    {marginPercent}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {marginPercent >= 30 ? t('healthyMargin', 'Optimal Margin') : t('standardMargin', 'Standard Margin')}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground pb-3 border-b border-border/80">
                {t('description', 'Product Description')}
              </h3>

              {(product as any).short_description && (
                <div className="p-3.5 rounded-xl bg-muted/40 border-l-4 border-primary text-xs text-foreground font-medium leading-relaxed">
                  {(product as any).short_description}
                </div>
              )}

              {product.description ? (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60">
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {product.description}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  {t('noDescription', 'No detailed description provided for this product yet.')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: VARIANTS ── */}
      {activeTab === 'variants' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/80">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('variantMatrix', 'Product Variant Matrix')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('variantMatrixDesc', 'Options for size, color, SKU codes, and variant specific inventory')}
                </p>
              </div>

              <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 w-fit">
                {variantsList.length} {t('variantsCount', 'variants')}
              </span>
            </div>

            {variantsList.length === 0 ? (
              <div className="py-12 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-3">
                <Box size={32} className="mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('noVariants', 'This product is a single item with no variations.')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>{t('addVariants', 'Configure Variants')}</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">#</th>
                      <th className="py-3 px-3.5">{t('variantName', 'Variant Name')}</th>
                      <th className="py-3 px-3.5">{t('sku', 'SKU')}</th>
                      <th className="py-3 px-3.5">{t('barcode', 'Barcode')}</th>
                      <th className="py-3 px-3.5 text-right">{t('costPrice', 'Cost')}</th>
                      <th className="py-3 px-3.5 text-right">{t('sellingPrice', 'Selling Price')}</th>
                      <th className="py-3 px-3.5 text-center">{t('stock', 'Stock')}</th>
                      <th className="py-3 px-3.5 text-center">{t('common.status', 'Status')}</th>
                      <th className="py-3 px-3.5 text-center">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {variantsList.map((v: any, idx: number) => {
                      const vStock = Number(v.stock ?? 0)
                      const isVLow = vStock > 0 && vStock <= lowStockThreshold
                      const isVOut = vStock <= 0

                      return (
                        <tr key={v.id || idx} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 text-center font-mono text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              {v.image ? (
                                <img
                                  src={getAbsoluteImageUrl(v.image)}
                                  alt={v.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                  <Box size={14} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-foreground text-xs">{v.name || product.name}</p>
                                {v.options && Array.isArray(v.options) && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {v.options.map((o: any) => `${o.name || o.attribute}: ${o.value}`).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-foreground">
                            <div className="flex items-center gap-1">
                              <span>{v.sku || product.sku}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(v.sku || product.sku, `v_sku_${v.id}`)}
                                className="p-0.5 hover:bg-muted rounded text-muted-foreground"
                              >
                                {copiedKey === `v_sku_${v.id}` ? (
                                  <Check size={11} className="text-emerald-500" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-mono text-muted-foreground">
                            {v.barcode || '—'}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-muted-foreground">
                            {v.cost_price ? formatMoney(Number(v.cost_price)) : formatMoney(costPrice)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                            {v.selling_price ? formatMoney(Number(v.selling_price)) : formatMoney(sellingPrice)}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                                isVOut
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : isVLow
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {vStock}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <StatusBadge status={v.is_active ?? true} rounded="full" />
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickAdjustTarget({
                                    ...product,
                                    name: `${product.name} (${v.name})`,
                                    stock: vStock,
                                    product_variant_id: v.id,
                                  })
                                  setIsQuickAdjustOpen(true)
                                }}
                                className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title={t('quickStockAdjust', 'Quick Stock Adjustment')}
                              >
                                <Warehouse size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: WAREHOUSE INVENTORY ── */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/80">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('warehouseStockLevels', 'Stock Levels by Warehouse')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('warehouseStockLevelsDesc', 'Physical on-hand quantity, reserved units, and restocking reorder thresholds')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuickAdjustTarget(product)
                  setIsQuickAdjustOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer w-fit"
              >
                <Warehouse size={13} />
                <span>{t('quickStockAdjust', 'Quick Stock Adjustment')}</span>
              </button>
            </div>

            {warehouseStocksList.length === 0 ? (
              <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('singleWarehouseInfo', 'Total stock stored in Main Warehouse:')}
                </p>
                <p className="text-xl font-mono font-black text-foreground">
                  {totalStock} {product.unit?.name || product.unit?.symbol || t('units', 'units')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">{t('warehouseName', 'Warehouse Name')}</th>
                      <th className="py-3 px-3.5 text-center">{t('stockOnHand', 'On Hand')}</th>
                      <th className="py-3 px-3.5 text-center">{t('reservedStock', 'Reserved')}</th>
                      <th className="py-3 px-3.5 text-center">{t('availableStock', 'Available')}</th>
                      <th className="py-3 px-3.5 text-center">{t('reorderPoint', 'Reorder Point')}</th>
                      <th className="py-3 px-3.5 text-center">{t('common.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {warehouseStocksList.map((wh: any, idx: number) => {
                      const qty = Number(wh.quantity || 0)
                      const reserved = Number(wh.reserved_quantity || 0)
                      const available = Math.max(0, qty - reserved)
                      const reorder = Number(wh.reorder_point || 5)

                      return (
                        <tr key={wh.warehouse_id || idx} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-foreground">
                            {wh.warehouse_name || `Warehouse #${wh.warehouse_id}`}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-foreground">
                            {qty}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono text-muted-foreground">
                            {reserved}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {available}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono text-muted-foreground">
                            {reorder}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                qty <= 0
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : qty <= reorder
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {qty <= 0
                                ? t('outOfStock', 'Out of Stock')
                                : qty <= reorder
                                ? t('reorderSoon', 'Reorder Needed')
                                : t('adequate', 'Adequate')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: DIMENSIONS & LOGISTICS ── */}
      {activeTab === 'dimensions' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-5">
            <div className="pb-3 border-b border-border/80">
              <h3 className="text-base font-bold text-foreground">
                {t('packageDimensions', 'Package Dimensions & Shipping Weight')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('packageDimensionsDesc', 'Logistics metrics for freight calculation, courier packing, and warehouse storage')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Scale size={13} className="text-primary" />
                  <span>{t('grossWeight', 'Item Weight')}</span>
                </span>
                <p className="text-2xl font-black font-mono text-foreground">
                  {weight > 0 ? `${weight} kg` : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {weight > 0 ? `${(weight * 1000).toLocaleString()} g` : t('notSpecified', 'Not specified')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Box size={13} className="text-indigo-500" />
                  <span>{t('dimensionsLWH', 'Dimensions (L × W × H)')}</span>
                </span>
                <p className="text-xl font-black font-mono text-foreground">
                  {length > 0 && width > 0 && height > 0
                    ? `${length} × ${width} × ${height} cm`
                    : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground">{t('lengthWidthHeight', 'Length × Width × Height')}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Layers size={13} className="text-sky-500" />
                  <span>{t('cubicVolume', 'Cubic Volume')}</span>
                </span>
                <p className="text-xl font-black font-mono text-foreground">
                  {volumeCm3 ? `${volumeCm3} cm³` : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground">{t('cubicCentimeters', 'cubic centimeters')}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Truck size={13} className="text-amber-500" />
                  <span>{t('volumetricWeight', 'Volumetric Weight')}</span>
                </span>
                <p className="text-xl font-black font-mono text-foreground">
                  {volumetricWeightKg ? `${volumetricWeightKg} kg` : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground">{t('airFreightFormula', 'IATA Air Freight Formula (L×W×H / 5000)')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: TIER PRICING ── */}
      {activeTab === 'pricing_tiers' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {t('tierPricing', 'Wholesale & Volume Tier Pricing')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('tierPricingDesc', 'Special discounted rates triggered by bulk order quantities')}
                </p>
              </div>
            </div>

            {tierPricesList.length === 0 ? (
              <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
                <DollarSign size={28} className="mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('noTierPricing', 'No volume pricing tiers configured for this product.')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">{t('minQty', 'Min Quantity')}</th>
                      <th className="py-3 px-3.5">{t('tierPrice', 'Unit Price')}</th>
                      <th className="py-3 px-3.5">{t('savings', 'Savings')}</th>
                      <th className="py-3 px-3.5">{t('validPeriod', 'Validity Period')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tierPricesList.map((tier: any, idx: number) => {
                      const tPrice = Number(tier.price || 0)
                      const savings = Math.max(0, sellingPrice - tPrice)
                      const savingsPct = sellingPrice > 0 ? Math.round((savings / sellingPrice) * 100) : 0

                      return (
                        <tr key={tier.id || idx} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 font-bold font-mono text-foreground">
                            ≥ {tier.min_qty} {product.unit?.symbol || product.unit?.name || 'pcs'}
                          </td>
                          <td className="py-3 px-3.5 font-bold font-mono text-foreground text-sm">
                            {formatMoney(tPrice)}
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                            {savings > 0 ? `-${formatMoney(savings)} (${savingsPct}%)` : '—'}
                          </td>
                          <td className="py-3 px-3.5 text-muted-foreground text-xs">
                            {tier.start_date || tier.end_date
                              ? `${formatDate(tier.start_date)} ➔ ${formatDate(tier.end_date)}`
                              : t('indefinite', 'Permanent / Indefinite')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: SEO & MARKETING ── */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-5">
            <div className="pb-3 border-b border-border/80">
              <h3 className="text-base font-bold text-foreground">
                {t('seoPreviewTitle', 'Google Search SERP Preview')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('seoPreviewDesc', 'How your product appears in Google search engine and social media results')}
              </p>
            </div>

            {/* Google Snippet Card */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 max-w-2xl space-y-1.5 font-sans">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono">https://pos.store</span>
                <span>›</span>
                <span className="text-primary font-medium">products</span>
                <span>›</span>
                <span className="font-mono">{product.slug}</span>
              </div>
              <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                {product.meta_title || product.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {product.meta_description ||
                  (product as any).short_description ||
                  product.description ||
                  'Discover high quality products with instant delivery and secure checkout.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {t('metaTitle', 'Meta Title')}
                </span>
                <p className="text-xs font-bold text-foreground">
                  {product.meta_title || product.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {(product.meta_title || product.name).length} {t('charsCount', 'chars')} (50-60)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {t('metaKeywords', 'Meta Keywords')}
                </span>
                <p className="text-xs font-bold text-foreground">
                  {product.meta_keywords || `${product.name}, ${product.category?.name || ''}, ${product.brand?.name || ''}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. EMBEDDED MODALS ── */}
      <ProductBarcodePrintModal
        isOpen={isBarcodePrintOpen}
        onClose={() => setIsBarcodePrintOpen(false)}
        product={product}
        formatCurrency={formatMoney}
      />

      <QuickStockAdjustModal
        isOpen={isQuickAdjustOpen}
        onClose={() => {
          setIsQuickAdjustOpen(false)
          setQuickAdjustTarget(null)
        }}
        product={quickAdjustTarget || product}
        formatCurrency={formatMoney}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(product.id)}
        itemName={product.name}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}

export default ProductDetailPage
