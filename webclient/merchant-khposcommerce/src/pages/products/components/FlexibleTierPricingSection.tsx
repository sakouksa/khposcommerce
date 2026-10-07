import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  Percent,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Coins,
  TrendingDown,
  Tag,
  Zap,
  PackageCheck,
  Building2,
  Crown,
  Info,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'

export interface TierPriceItem {
  id: number | string
  price_type: string
  min_qty: number | string
  price: number | string
  currency_code?: string
  is_active?: boolean
}

interface FlexibleTierPricingSectionProps {
  prices: TierPriceItem[]
  baseSellingPrice: number | string
  costPrice?: number | string
  onAddTierPrice: (data: { price_type: string; min_qty: string; price: string }) => void
  onDeleteTierPrice: (id: number | string | Array<number | string>) => void
  isSubmitting?: boolean
}

export const FlexibleTierPricingSection: React.FC<FlexibleTierPricingSectionProps> = ({
  prices = [],
  baseSellingPrice = 0,
  costPrice = 0,
  onAddTierPrice,
  onDeleteTierPrice,
  isSubmitting = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  // Selection & Delete Modal States
  const [selectedTierIds, setSelectedTierIds] = useState<(number | string)[]>([])
  const [tierToDelete, setTierToDelete] = useState<TierPriceItem | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState<boolean>(false)

  // Form State
  const [priceType, setPriceType] = useState<string>('wholesale')
  const [minQty, setMinQty] = useState<string>('5')
  const [tierPrice, setTierPrice] = useState<string>('')

  const basePriceNum = parseFloat(String(baseSellingPrice)) || 0

  // Selection Handlers
  const isAllSelected = prices.length > 0 && selectedTierIds.length === prices.length
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTierIds([])
    } else {
      setSelectedTierIds(prices.map((p) => p.id))
    }
  }

  const handleToggleSelectRow = (id: number | string) => {
    setSelectedTierIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Calculate Savings for Form Input
  const formSavingsPercentage = useMemo(() => {
    const inputP = parseFloat(tierPrice) || 0
    if (!basePriceNum || !inputP || inputP >= basePriceNum) return 0
    return Math.round(((basePriceNum - inputP) / basePriceNum) * 100)
  }, [tierPrice, basePriceNum])

  // Top Metrics Calculations
  const metrics = useMemo(() => {
    const totalTiers = prices.length
    if (totalTiers === 0) {
      return {
        totalTiers: 0,
        maxSavingsPct: 0,
        lowestPrice: basePriceNum,
      }
    }

    let minP = basePriceNum || Infinity
    prices.forEach((p) => {
      const val = parseFloat(String(p.price)) || 0
      if (val > 0 && val < minP) minP = val
    })

    const lowest = minP === Infinity ? basePriceNum : minP
    const maxSavingsPct = basePriceNum > 0 && lowest < basePriceNum
      ? Math.round(((basePriceNum - lowest) / basePriceNum) * 100)
      : 0

    return {
      totalTiers,
      maxSavingsPct,
      lowestPrice: lowest,
    }
  }, [prices, basePriceNum])

  // Presets Helper
  const handleApplyPreset = (presetType: string, qty: string, discountPct: number) => {
    setPriceType(presetType)
    setMinQty(qty)
    if (basePriceNum > 0) {
      const calculatedPrice = (basePriceNum * (1 - discountPct / 100)).toFixed(2)
      setTierPrice(calculatedPrice)
    }
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tierPrice || parseFloat(tierPrice) <= 0) return
    onAddTierPrice({
      price_type: priceType,
      min_qty: minQty || '1',
      price: tierPrice,
    })
    setTierPrice('')
  }

  // Get Badge Style & Label for Tier Type
  const getTierTypeBadge = (type: string) => {
    const lower = (type || '').toLowerCase()
    if (lower.includes('wholesale')) {
      return {
        label: t('products.wholesaleTier', 'Wholesale Price'),
        bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        icon: <PackageCheck size={12} className="shrink-0" />,
      }
    }
    if (lower.includes('distributor') || lower.includes('agent')) {
      return {
        label: t('products.distributorTier', 'Distributor / Agent Price'),
        bg: 'bg-primary/10 text-primary border border-primary/20',
        icon: <Building2 size={12} className="shrink-0" />,
      }
    }
    if (lower.includes('vip') || lower.includes('member')) {
      return {
        label: t('products.vipTier', 'VIP Member Price'),
        bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        icon: <Crown size={12} className="shrink-0" />,
      }
    }
    if (lower.includes('special') || lower.includes('promo')) {
      return {
        label: t('products.specialPromoTier', 'Special Promo'),
        bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        icon: <Zap size={12} className="shrink-0" />,
      }
    }
    return {
      label: t('products.volumeTier', 'Volume Discount'),
      bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      icon: <Tag size={12} className="shrink-0" />,
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP METRIC KPI CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Configured Tiers Count */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('products.activeTierCount', 'Configured Tiers')}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Layers size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {metrics.totalTiers}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('products.rulesCount', 'pricing rules')}
            </span>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <CheckCircle2 size={13} /> {t('products.tierPricingActive', 'Wholesale Enabled')}
            </span>
          </div>
        </div>

        {/* Metric 2: Max Volume Savings */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('products.maxSavingsLabel', 'Max Bulk Savings')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              -{metrics.maxSavingsPct}%
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('products.offRetail', 'OFF retail')}
            </span>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Percent size={12} /> {t('products.bulkDiscountActive', 'Volume Discounts')}
            </span>
          </div>
        </div>

        {/* Metric 3: Base Retail Price */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('products.baseRetailPrice', 'Base Selling Price')}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2.5xl font-black font-mono text-slate-900 dark:text-slate-100">
            ${basePriceNum.toFixed(2)}
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {t('products.standardRetailTag', 'Standard Retail (1 unit)')}
            </span>
          </div>
        </div>

        {/* Metric 4: Wholesale Range */}
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('products.wholesalePriceRange', 'Wholesale Range')}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Coins size={16} />
            </div>
          </div>
          <div className="truncate font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
            ${metrics.lowestPrice.toFixed(2)} - ${basePriceNum.toFixed(2)}
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {t('products.tieredRatesBadge', 'Tiered Rates Available')}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. INTERACTIVE ADD TIER PRICING FORM & PRESETS ─── */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Plus size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('products.addTierPriceTitle', 'Add New Tier Pricing Rule')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('products.addTierPriceSub', 'Configure custom volume discounts based on minimum purchase quantities.')}
              </p>
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden lg:inline">
              {t('products.quickPresets', 'Quick Presets:')}
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('wholesale', '5', 10)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <PackageCheck size={12} />
              <span>Wholesale 5+ (-10%)</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('distributor', '20', 15)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <Building2 size={12} />
              <span>Distributor 20+ (-15%)</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('special', '50', 25)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <Zap size={12} />
              <span>Bulk 50+ (-25%)</span>
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmitForm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          {/* Price Type Selector */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {t('products.colPriceClass', 'Tier Type')} *
            </label>
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="wholesale">{t('products.wholesaleTier', 'Wholesale Price')}</option>
              <option value="distributor">{t('products.distributorTier', 'Distributor / Agent Price')}</option>
              <option value="vip">{t('products.vipTier', 'VIP Member Price')}</option>
              <option value="volume">{t('products.volumeTier', 'Volume Discount')}</option>
              <option value="special">{t('products.specialPromoTier', 'Special Promo')}</option>
            </select>
          </div>

          {/* Min Qty Threshold Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('products.minQuantityLabel', 'Min Quantity')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={minQty ?? ''}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="e.g. 5"
              className="w-full h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Tier Special Price Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('products.tierUnitPrice', 'Unit Price ($)')} <span className="text-rose-500">*</span>
              </label>
              {formSavingsPercentage > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span className="font-mono">-{formSavingsPercentage}%</span> {t('products.off', 'OFF')}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs font-bold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={tierPrice ?? ''}
                onChange={(e) => setTierPrice(e.target.value)}
                placeholder={basePriceNum ? `${(basePriceNum * 0.9).toFixed(2)}` : '0.00'}
                className="w-full h-9 pl-7 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting || !tierPrice}
              className="w-full h-9 bg-primary text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{t('products.addTierPrice', 'Add Tier Price')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ─── 3. MODERN TIER PRICING MATRIX TABLE ─── */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4 overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 p-5 gap-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {t('products.tierListTitle', 'Active Volume Pricing Table')}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-bold border border-primary/20">
              <span className="font-mono">{prices.length}</span> {t('products.tiersSuffix', 'tiers')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedTierIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  <AlertCircle size={13} />
                  {selectedTierIds.length} {t('products.selectedCount', 'selected')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer transition-all shadow-2xs active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>{t('products.deleteSelected', 'Delete Selected')}</span>
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Info size={13} className="text-primary" />
              <span>{t('products.tierSortedByQty', 'Sorted automatically by minimum quantity')}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="w-12 text-center py-3 px-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="text-left py-3 px-5">{t('products.colPriceClass', 'Tier Type')}</th>
                <th className="text-left py-3 px-5">{t('products.colVolumeCond', 'Min Quantity')}</th>
                <th className="text-right py-3 px-5">{t('products.colAdjustedRate', 'Tier Price ($)')}</th>
                <th className="text-right py-3 px-5">{t('products.colSavings', 'Customer Savings')}</th>
                <th className="text-center py-3 px-5">{t('products.colStatus', 'Status')}</th>
                <th className="text-right py-3 px-5">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {prices.map((p) => {
                const pPriceNum = parseFloat(String(p.price)) || 0
                const savingsVal = basePriceNum > pPriceNum ? basePriceNum - pPriceNum : 0
                const savingsPct = basePriceNum > 0 && savingsVal > 0
                  ? Math.round((savingsVal / basePriceNum) * 100)
                  : 0
                const badgeInfo = getTierTypeBadge(p.price_type)
                const isSelected = selectedTierIds.includes(p.id)

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                      isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-12 text-center py-3.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(p.id)}
                        className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                      />
                    </td>

                    {/* Tier Type Badge */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${badgeInfo.bg}`}>
                        {badgeInfo.icon}
                        <span>{badgeInfo.label}</span>
                      </span>
                    </td>

                    {/* Min Qty */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        ≥ <span className="font-mono">{p.min_qty}</span> {t('products.units', 'units')}
                      </span>
                    </td>

                    {/* Tier Price */}
                    <td className="py-3.5 px-5 text-right font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                      ${pPriceNum.toFixed(2)}
                    </td>

                    {/* Customer Savings vs Retail */}
                    <td className="py-3.5 px-5 text-right">
                      {savingsPct > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          -<span className="font-mono">{savingsPct}%</span> (<span className="font-mono">${savingsVal.toFixed(2)}</span> {t('products.off', 'OFF')})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {t('products.standardPrice', 'Standard')}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={11} /> {t('products.active', 'Active')}
                      </span>
                    </td>

                    {/* Action: Global TableActionMenu */}
                    <td className="py-3.5 px-5 text-right">
                      <TableActionMenu
                        onDelete={() => setTierToDelete(p)}
                        deleteLabel={t('common.delete', 'Delete')}
                      />
                    </td>
                  </tr>
                )
              })}

              {prices.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers size={36} className="text-slate-300 dark:text-slate-700" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        {t('products.noTierPricesConfigured', 'No tier pricing rules configured yet.')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t('products.addTierPriceHint', 'Add bulk pricing rules above to encourage volume orders.')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Tier Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={!!tierToDelete}
        title={t('products.deleteTierTitle', 'Delete Tier Pricing Rule')}
        itemName={
          tierToDelete
            ? `${getTierTypeBadge(tierToDelete.price_type).label} (≥ ${tierToDelete.min_qty} ${t('products.units', 'units')} - $${Number(tierToDelete.price).toFixed(2)})`
            : ''
        }
        warningText={t('products.confirmDeleteTierPrice', 'Are you sure you want to delete this tier pricing rule?')}
        isPending={isSubmitting}
        onCancel={() => setTierToDelete(null)}
        onSoftDelete={() => {
          if (tierToDelete) {
            onDeleteTierPrice(tierToDelete.id)
            setTierToDelete(null)
          }
        }}
      />

      {/* Delete Selected Tiers Bulk Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={isBulkDeleteOpen}
        title={t('products.deleteSelectedTiersTitle', 'Delete Selected Tier Prices')}
        itemName={`${selectedTierIds.length} ${t('products.selectedCount', 'selected')}`}
        warningText={t('products.confirmDeleteSelectedTiers', 'Are you sure you want to delete the selected tier pricing rules?')}
        isPending={isSubmitting}
        onCancel={() => setIsBulkDeleteOpen(false)}
        onSoftDelete={() => {
          onDeleteTierPrice(selectedTierIds)
          setSelectedTierIds([])
          setIsBulkDeleteOpen(false)
        }}
      />
    </div>
  )
}
