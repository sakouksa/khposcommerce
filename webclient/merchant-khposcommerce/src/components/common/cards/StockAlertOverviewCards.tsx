import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Layers,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { AccentStatCard, AccentStatGrid } from './AccentStatCard'

export type StockFilterTab = 'all' | 'out_of_stock' | 'low_stock' | 'in_stock' | 'high_stock'

export interface StockAlertConfig {
  threshold?: number
  autoAlert?: boolean
  telegramEnabled?: boolean
  channelId?: string
}

export interface StockAlertCounts {
  out_of_stock?: number
  low_stock?: number
  in_stock?: number
  high_stock?: number
  total?: number
  // CamelCase aliases
  outOfStock?: number
  lowStock?: number
  inStock?: number
  highStock?: number
  totalProducts?: number
  totalItems?: number
  totalQty?: number
  // Count suffix aliases
  out_of_stock_count?: number
  low_stock_count?: number
  in_stock_count?: number
  high_stock_count?: number
}

export interface StockAlertOverviewCardsProps {
  /**
   * Directly pass stock counts in snake_case, camelCase, or with _count suffix
   */
  counts?: StockAlertCounts

  /**
   * Pass an analytics object directly from dashboard or inventory stats queries
   */
  analytics?: Record<string, any>

  /**
   * Pass an array of product or stock items to automatically calculate counts
   */
  items?: Array<Record<string, any>>

  /**
   * Low stock threshold used for calculation or display subtitle (default: 5)
   */
  threshold?: number

  /**
   * Language override ('kh' | 'en'). If omitted, automatically detects from theme store.
   */
  language?: 'kh' | 'en' | string

  /**
   * Currently active filter tab / status ('all' | 'out_of_stock' | 'low_stock' | 'in_stock' | 'high_stock')
   */
  activeTab?: StockFilterTab | string
  selectedStatus?: StockFilterTab | string

  /**
   * Callback when a card is clicked (supports multiple prop names for zero-friction usage)
   */
  onSelectTab?: (tab: StockFilterTab | string) => void
  onFilterStatus?: (status: StockFilterTab | string) => void
  onClickCard?: (status: StockFilterTab | string) => void
  onChange?: (status: StockFilterTab | string) => void

  /**
   * Loading state (renders skeleton placeholders)
   */
  loading?: boolean

  /**
   * Grid layout columns: 2 | 3 | 4 | 5 (default: 4 responsive)
   */
  columns?: 2 | 3 | 4 | 5

  /**
   * Optional title displayed in a clean toolbar header above the cards
   */
  title?: React.ReactNode

  /**
   * Optional subtitle
   */
  subtitle?: React.ReactNode

  /**
   * Optional right action node (e.g. export button, date picker, etc.)
   */
  action?: React.ReactNode

  /**
   * Optional refresh callback (renders a neat refresh button)
   */
  onRefresh?: () => void

  /**
   * Show subtitles under each card count (default: false to match ministore)
   */
  showSubtitles?: boolean

  /**
   * Show MiniStore KH style filter pill tabs under the cards (default: true)
   */
  showFilterPills?: boolean

  /**
   * Custom labels override
   */
  customLabels?: {
    total?: string
    out_of_stock?: string
    low_stock?: string
    in_stock?: string
    high_stock?: string
  }

  /**
   * Custom subtitles override
   */
  customSubtitles?: {
    total?: string
    out_of_stock?: string
    low_stock?: string
    in_stock?: string
    high_stock?: string
  }

  /**
   * Whether cards are clickable or just for display (default: false as requested "card all គ្រាន់តែ display មិនអោយ click ទេ")
   */
  clickableCards?: boolean

  /**
   * Additional container CSS classes
   */
  className?: string

  /**
   * Hide high stock card and only display 3 core cards (Out of stock, Low stock, In stock)
   */
  hideHighStock?: boolean

  /**
   * Show a 1st card for "All / Total SKUs" (e.g. for dashboard or full catalog overviews)
   */
  showTotalCard?: boolean
}

/**
 * StockAlertOverviewCards
 * 
 * Enterprise Global Card Component for stock levels & alerts.
 * Works seamlessly across Dashboard, Inventory, Products, and POS modules.
 * Accepts direct counts, analytics objects, or raw item arrays with automatic normalization.
 */
export const StockAlertOverviewCards: React.FC<StockAlertOverviewCardsProps> = ({
  counts,
  analytics,
  items,
  threshold = 5,
  language: _propLanguage,
  activeTab,
  selectedStatus,
  onSelectTab,
  onFilterStatus,
  onClickCard,
  onChange,
  loading = false,
  className = '',
  columns,
  title,
  subtitle,
  action,
  onRefresh,
  showSubtitles = false,
  showFilterPills = true,
  clickableCards = false,
  customLabels = {},
  customSubtitles = {},
  hideHighStock = false,
  showTotalCard = false,
}) => {
  const { t } = useTranslation(['inventory', 'common'])

  // 1. Universal Data Normalizer
  const normalizedCounts = useMemo(() => {
    // A. If items array is provided, compute live tallies
    if (items && Array.isArray(items) && items.length > 0) {
      let outOfStock = 0
      let lowStock = 0
      let inStock = 0
      let highStock = 0

      items.forEach((item) => {
        const qty = Number(
          item.quantity ??
          item.current_stock ??
          item.available_quantity ??
          item.stock_quantity ??
          item.total_stock ??
          item.stock ??
          item.qty ??
          0
        )
        const t = Number(
          item.reorder_point ??
          item.low_stock_threshold ??
          item.min_stock ??
          item.min_quantity ??
          item.safety_stock ??
          item.product?.low_stock_threshold ??
          threshold
        )
        const highT = Number(item.high_stock_threshold ?? 50)

        if (qty <= 0) {
          outOfStock++
        } else if (qty <= t) {
          lowStock++
        } else if (qty >= highT) {
          highStock++
        } else {
          inStock++
        }
      })

      return {
        total: items.length,
        out_of_stock: outOfStock,
        low_stock: lowStock,
        in_stock: inStock,
        high_stock: highStock,
      }
    }

    // B. If counts prop is provided (snake_case or camelCase or count suffixes)
    if (counts) {
      const out = counts.out_of_stock ?? counts.outOfStock ?? counts.out_of_stock_count ?? 0
      const low = counts.low_stock ?? counts.lowStock ?? counts.low_stock_count ?? 0
      const instk = counts.in_stock ?? counts.inStock ?? counts.in_stock_count ?? 0
      const high = counts.high_stock ?? counts.highStock ?? counts.high_stock_count ?? 0
      const tot = counts.total ?? counts.totalProducts ?? counts.totalItems ?? counts.totalQty ?? (out + low + instk + high)

      return {
        total: tot,
        out_of_stock: out,
        low_stock: low,
        in_stock: instk,
        high_stock: high,
      }
    }

    // C. If analytics object is provided
    if (analytics) {
      const out = analytics.out_of_stock ?? analytics.outOfStock ?? analytics.out_of_stock_count ?? 0
      const low = analytics.low_stock ?? analytics.lowStock ?? analytics.low_stock_count ?? 0
      const instk = analytics.in_stock ?? analytics.inStock ?? analytics.availableProducts ?? analytics.in_stock_count ?? 0
      const high = analytics.high_stock ?? analytics.highStock ?? analytics.high_stock_count ?? 0
      const tot = analytics.total_products ?? analytics.totalProducts ?? analytics.total_items ?? analytics.totalItems ?? analytics.total ?? (out + low + instk + high)

      return {
        total: tot,
        out_of_stock: out,
        low_stock: low,
        in_stock: instk,
        high_stock: high,
      }
    }

    return {
      total: 0,
      out_of_stock: 0,
      low_stock: 0,
      in_stock: 0,
      high_stock: 0,
    }
  }, [counts, analytics, items, threshold])

  // 2. Active Tab & Click Resolution
  const currentActive = (activeTab || selectedStatus || 'all').toLowerCase()
  const isInteractive = Boolean(onSelectTab || onFilterStatus || onClickCard || onChange)

  const handleCardClick = (targetTab: StockFilterTab) => {
    if (!isInteractive) return
    const nextTab = currentActive === targetTab ? 'all' : targetTab
    onSelectTab?.(nextTab)
    onFilterStatus?.(nextTab)
    onClickCard?.(nextTab)
    onChange?.(nextTab)
  }

  // 3. Grid Columns Count
  const effectiveColumns: 2 | 3 | 4 | 5 = columns || (
    showTotalCard
      ? (hideHighStock ? 4 : 5)
      : (hideHighStock ? 3 : 4)
  )

  return (
    <div className={`space-y-3 select-none ${className}`}>
      {/* Optional Top Header / Toolbar */}
      {(title || action || onRefresh) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {action}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
                title={t('stock_refresh', 'Refresh')}
              >
                <RefreshCw className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Accent Stat Cards */}
      <AccentStatGrid columns={effectiveColumns}>
        {/* Card 0: Total SKUs / All (Optional) */}
        {showTotalCard && (
          <AccentStatCard
            variant="blue"
            label={
              customLabels.total ||
              t('stock_total_items', 'Total Items')
            }
            value={normalizedCounts.total}
            icon={<Package className="size-5" />}
            isActive={clickableCards && isInteractive && currentActive === 'all'}
            onClick={clickableCards && isInteractive ? () => handleCardClick('all') : undefined}
            loading={loading}
            subtitle={
              showSubtitles
                ? (customSubtitles.total ||
                  t('stock_all_catalog', 'All catalog products'))
                : undefined
            }
          />
        )}

        {/* Card 1: Out of Stock */}
        <AccentStatCard
          variant="out_of_stock"
          label={
            customLabels.out_of_stock ||
            t('stock_out_of_stock', 'Out of Stock')
          }
          value={normalizedCounts.out_of_stock}
          icon={<AlertTriangle className="size-5" />}
          isActive={clickableCards && isInteractive && (currentActive === 'out_of_stock' || currentActive === 'outofstock')}
          onClick={clickableCards && isInteractive ? () => handleCardClick('out_of_stock') : undefined}
          loading={loading}
          subtitle={
            showSubtitles
              ? (customSubtitles.out_of_stock ||
                (normalizedCounts.out_of_stock > 0
                  ? t('stock_immediate_reorder', 'Immediate reorder needed')
                  : t('stock_no_out_of_stock', 'No items out of stock')))
              : undefined
          }
        />

        {/* Card 2: Low Stock */}
        <AccentStatCard
          variant="low_stock"
          label={
            customLabels.low_stock ||
            t('stock_low_stock', 'Low Stock')
          }
          value={normalizedCounts.low_stock}
          icon={<Package className="size-5" />}
          isActive={clickableCards && isInteractive && (currentActive === 'low_stock' || currentActive === 'lowstock')}
          onClick={clickableCards && isInteractive ? () => handleCardClick('low_stock') : undefined}
          loading={loading}
          subtitle={
            showSubtitles
              ? (customSubtitles.low_stock ||
                (normalizedCounts.low_stock > 0
                  ? t('qty_under_threshold', 'Quantity ≤ {{threshold}} units', { threshold })
                  : t('stock_healthy', 'Stock healthy')))
              : undefined
          }
        />

        {/* Card 3: In Stock */}
        <AccentStatCard
          variant="in_stock"
          label={
            customLabels.in_stock ||
            t('stock_in_stock', 'In Stock')
          }
          value={normalizedCounts.in_stock}
          icon={<CheckCircle2 className="size-5" />}
          isActive={clickableCards && isInteractive && (currentActive === 'in_stock' || currentActive === 'instock')}
          onClick={clickableCards && isInteractive ? () => handleCardClick('in_stock') : undefined}
          loading={loading}
          subtitle={
            showSubtitles
              ? (customSubtitles.in_stock ||
                t('stock_normal_levels', 'Normal stock levels'))
              : undefined
          }
        />

        {/* Card 4: High Stock (Optional) */}
        {!hideHighStock && (
          <AccentStatCard
            variant="high_stock"
            label={
              customLabels.high_stock ||
              t('stock_high_stock', 'High Stock')
            }
            value={normalizedCounts.high_stock}
            icon={<Package className="size-5" />}
            isActive={clickableCards && isInteractive && (currentActive === 'high_stock' || currentActive === 'highstock' || currentActive === 'overstock')}
            onClick={clickableCards && isInteractive ? () => handleCardClick('high_stock') : undefined}
            loading={loading}
            subtitle={
              showSubtitles
                ? (customSubtitles.high_stock ||
                  t('stock_optimal_capacity', 'Optimal capacity'))
                : undefined
            }
          />
        )}
      </AccentStatGrid>

      {/* 2. MiniStore KH Style Filter Pill Tabs */}
      {showFilterPills && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          {/* All Tab */}
          <button
            type="button"
            onClick={() => handleCardClick('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              currentActive === 'all' || currentActive === ''
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{t('stock_all', 'All')}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentActive === 'all' || currentActive === ''
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {normalizedCounts.total}
            </span>
          </button>

          {/* Out of Stock Tab */}
          <button
            type="button"
            onClick={() => handleCardClick('out_of_stock')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              currentActive === 'out_of_stock' || currentActive === 'outofstock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{customLabels.out_of_stock || t('stock_out_of_stock', 'Out of Stock')}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentActive === 'out_of_stock' || currentActive === 'outofstock'
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {normalizedCounts.out_of_stock}
            </span>
          </button>

          {/* Low Stock Tab */}
          <button
            type="button"
            onClick={() => handleCardClick('low_stock')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              currentActive === 'low_stock' || currentActive === 'lowstock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{customLabels.low_stock || t('stock_low_stock', 'Low Stock')}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentActive === 'low_stock' || currentActive === 'lowstock'
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {normalizedCounts.low_stock}
            </span>
          </button>

          {/* In Stock Tab */}
          <button
            type="button"
            onClick={() => handleCardClick('in_stock')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              currentActive === 'in_stock' || currentActive === 'instock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground'
            }`}
          >
            <span>{customLabels.in_stock || t('stock_in_stock', 'In Stock')}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentActive === 'in_stock' || currentActive === 'instock'
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {normalizedCounts.in_stock}
            </span>
          </button>

          {/* High Stock Tab */}
          {!hideHighStock && (
            <button
              type="button"
              onClick={() => handleCardClick('high_stock')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentActive === 'high_stock' || currentActive === 'highstock' || currentActive === 'overstock'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{customLabels.high_stock || t('stock_high_stock', 'High Stock')}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentActive === 'high_stock' || currentActive === 'highstock' || currentActive === 'overstock'
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {normalizedCounts.high_stock}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default StockAlertOverviewCards
