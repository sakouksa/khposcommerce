import React, { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Coins,
  RefreshCw,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FieldError, getFieldClass } from '@/components/common'

interface TaxItem {
  id: number | string
  name: string
  rate: number | string
}

interface FlexiblePricingSectionProps {
  costPrice: string
  sellingPrice: string
  comparePrice: string
  taxId?: string
  taxes?: TaxItem[]
  sellingPriceError?: string
  onCostPriceChange: (val: string) => void
  onSellingPriceChange: (val: string) => void
  onComparePriceChange: (val: string) => void
  onTaxIdChange?: (val: string) => void
  stockQuantity?: number | string
  showTaxSelector?: boolean
}

export const FlexiblePricingSection: React.FC<FlexiblePricingSectionProps> = ({
  costPrice,
  sellingPrice,
  comparePrice,
  taxId = '',
  taxes = [],
  sellingPriceError,
  onCostPriceChange,
  onSellingPriceChange,
  onComparePriceChange,
  onTaxIdChange,
  stockQuantity = 0,
  showTaxSelector = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  // Calculation modes: 'direct' (manual entry), 'margin' (set target %), 'profit' (set target $)
  const [calcMode, setCalcMode] = useState<'direct' | 'margin' | 'profit'>('direct')
  
  // Target states for interactive modes
  const [targetMarginPct, setTargetMarginPct] = useState<string>('25')
  const [targetProfitUSD, setTargetProfitUSD] = useState<string>('50')

  // Dual Currency rate (default 1 USD = 4,100 KHR)
  const [exchangeRate, setExchangeRate] = useState<number>(4100)
  const [showExchangeRateInput, setShowExchangeRateInput] = useState<boolean>(false)

  // Tax breakdown expand toggle
  const [priceIncludesTax, setPriceIncludesTax] = useState<boolean>(false)
  const [isTaxDetailsOpen, setIsTaxDetailsOpen] = useState<boolean>(false)

  // Parse numeric values safely
  const cost = parseFloat(costPrice) || 0
  const selling = parseFloat(sellingPrice) || 0
  const compare = parseFloat(comparePrice) || 0

  // Computed values
  const profitUSD = selling - cost
  const marginPct = selling > 0 ? (profitUSD / selling) * 100 : 0
  const markupPct = cost > 0 ? (profitUSD / cost) * 100 : 0
  const discountPct = compare > selling && compare > 0 ? ((compare - selling) / compare) * 100 : 0
  const savingsUSD = compare > selling ? compare - selling : 0

  // Format currency helpers
  const formatUSD = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(num) ? 0 : num)
  }

  const formatKHR = (usdAmount: number) => {
    const khr = Math.round((usdAmount || 0) * exchangeRate)
    return new Intl.NumberFormat('km-KH').format(isNaN(khr) ? 0 : khr) + ' ៛'
  }

  // Handle Mode or Target change calculations
  const applyTargetMargin = (marginValStr: string, currentCostStr: string = costPrice) => {
    const marginVal = parseFloat(marginValStr)
    const costVal = parseFloat(currentCostStr)
    if (!isNaN(marginVal) && !isNaN(costVal) && costVal > 0 && marginVal < 100) {
      // Formula: Selling = Cost / (1 - Margin/100)
      const calculatedSelling = costVal / (1 - marginVal / 100)
      onSellingPriceChange(calculatedSelling.toFixed(2))
    }
  }

  const applyTargetProfit = (profitValStr: string, currentCostStr: string = costPrice) => {
    const profitVal = parseFloat(profitValStr)
    const costVal = parseFloat(currentCostStr) || 0
    if (!isNaN(profitVal)) {
      const calculatedSelling = costVal + profitVal
      onSellingPriceChange(calculatedSelling.toFixed(2))
    }
  }

  // Effect to recalculate when Cost Price changes while in auto calculation modes
  const handleCostChange = (newCostStr: string) => {
    onCostPriceChange(newCostStr)
    if (calcMode === 'margin') {
      applyTargetMargin(targetMarginPct, newCostStr)
    } else if (calcMode === 'profit') {
      applyTargetProfit(targetProfitUSD, newCostStr)
    }
  }

  // Quick Preset Margin Handler
  const handlePresetMarginClick = (presetPct: number) => {
    setCalcMode('margin')
    setTargetMarginPct(String(presetPct))
    applyTargetMargin(String(presetPct), costPrice)
  }

  // Health Status determination
  const getProfitHealth = () => {
    if (selling <= 0 && cost <= 0) return null
    if (profitUSD < 0) {
      return {
        label: t('products.healthLoss', 'Loss Warning! Selling price is below cost price'),
        bg: 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-500 text-white',
        icon: AlertTriangle,
      }
    }
    if (marginPct < 15) {
      return {
        label: t('products.healthLowProfit', 'Low Margin (< 15%)'),
        bg: 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-500 text-white',
        icon: ShieldAlert,
      }
    }
    if (marginPct < 35) {
      return {
        label: t('products.healthGoodProfit', 'Healthy Margin (15% - 35%)'),
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-600 text-white',
        icon: CheckCircle2,
      }
    }
    return {
      label: t('products.healthHighProfit', 'High Margin (≥ 35%)'),
        bg: 'bg-primary/10 border-primary/30 text-primary',
        badgeBg: 'bg-primary text-primary-foreground',
      icon: Sparkles,
    }
  }

  const health = getProfitHealth()

  // Selected Tax details
  const selectedTax = taxes.find(tItem => String(tItem.id) === String(taxId))
  const taxRate = selectedTax ? parseFloat(String(selectedTax.rate)) || 0 : 0
  const taxAmountUSD = taxRate > 0 ? (priceIncludesTax ? selling - selling / (1 + taxRate / 100) : (selling * taxRate) / 100) : 0
  const netSellingUSD = priceIncludesTax ? selling - taxAmountUSD : selling
  const grossSellingUSD = priceIncludesTax ? selling : selling + taxAmountUSD

  return (
    <div className="space-y-5">
      {/* ─── Sleek Calculation Mode Toolbar & Currency Exchange ─── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">{t('calcModeLabel', 'Pricing Strategy')}</h4>
            <p className="text-[11px] text-muted-foreground">{t('calcModeSubText', 'Select calculation mode for pricing and profit margin')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Exchange Pill */}
            <div className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted px-2.5 py-1.5 rounded-xl border border-border/60 text-xs transition-all select-none">
              <Coins size={13} className="text-amber-500 shrink-0" />
              {!showExchangeRateInput ? (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">1$ =</span>
                  <span className="font-mono font-bold text-foreground">{exchangeRate.toLocaleString()} ៛</span>
                  <button
                    type="button"
                    onClick={() => setShowExchangeRateInput(true)}
                    className="p-0.5 hover:text-primary text-muted-foreground transition-colors cursor-pointer"
                    title={t('editExchangeRate', 'Edit Exchange Rate')}
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">1$ =</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 4100)}
                    className="w-16 bg-background border border-primary rounded-md px-1.5 py-0.5 text-foreground font-mono text-xs focus:outline-none"
                  />
                  <span className="text-muted-foreground">៛</span>
                  <button
                    type="button"
                    onClick={() => setShowExchangeRateInput(false)}
                    className="px-2 py-0.5 bg-primary text-primary-foreground font-bold rounded text-[10px] cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>

            {/* Mode Switcher Segmented Control */}
            <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setCalcMode('direct')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  calcMode === 'direct'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <DollarSign size={13} />
                <span>{t('calcManual', 'Manual')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalcMode('margin')
                  applyTargetMargin(targetMarginPct)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  calcMode === 'margin'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Percent size={13} />
                <span>{t('calcMarginPct', 'By Margin %')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalcMode('profit')
                  applyTargetProfit(targetProfitUSD)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  calcMode === 'profit'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp size={13} />
                <span>{t('calcTargetProfit', 'By Target Profit')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode Specific Controls & Presets */}
        {calcMode === 'margin' && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Percent size={13} className="text-primary" />
                {t('targetMarginLabel', 'Target Margin (%)')}
              </span>
              <div className="relative w-28">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="99"
                  value={targetMarginPct}
                  onChange={(e) => {
                    setTargetMarginPct(e.target.value)
                    applyTargetMargin(e.target.value)
                  }}
                  className="form-input text-xs font-bold font-mono py-1 pr-6 pl-2.5 rounded-lg border-primary/50 bg-background text-foreground w-full"
                />
                <span className="absolute right-2.5 top-1 text-xs font-bold text-primary">%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-primary/20">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                {t('quickMarginPreset', 'Quick Presets:')}
              </span>
              {[10, 15, 20, 25, 30, 35, 40, 50, 60, 75].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePresetMarginClick(pct)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer ${
                    parseFloat(targetMarginPct) === pct
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60'
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {calcMode === 'profit' && (
          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
                {t('targetProfitLabel', 'Target Profit ($)')}
              </span>
              <div className="relative w-32 flex items-center">
                <span className="absolute left-2.5 text-xs font-bold text-emerald-600 pointer-events-none">$</span>
                <input
                  type="number"
                  step="0.5"
                  value={targetProfitUSD}
                  onChange={(e) => {
                    setTargetProfitUSD(e.target.value)
                    applyTargetProfit(e.target.value)
                  }}
                  className="form-input text-xs font-bold font-mono py-1 pr-2 pl-7 rounded-lg border-emerald-500/50 bg-background text-foreground w-full"
                />
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {t('targetProfitFormula', 'Selling Price = Cost Price + Target Profit')}
            </p>
          </div>
        )}
      </div>

      {/* ─── Ultra-Clean Price Inputs Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Cost Price */}
        <div>
          <label className="block text-xs font-semibold text-foreground/90 mb-1">
            {t('colCostPrice', 'Cost Price ($)')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-muted-foreground pointer-events-none">$</span>
            <input
              type="number"
              step="0.01"
              value={costPrice ?? ''}
              onChange={(e) => handleCostChange(e.target.value)}
              placeholder="0.00"
              className="form-input w-full h-9 pl-8 pr-3 py-1.5 text-xs sm:text-[13px] font-bold font-mono rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-1">
            {formatKHR(cost)}
          </div>
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">
            {t('colSellingPrice', 'Selling Price ($)')} <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-primary pointer-events-none">$</span>
            <input
              type="number"
              step="0.01"
              value={sellingPrice ?? ''}
              onChange={(e) => {
                setCalcMode('direct')
                onSellingPriceChange(e.target.value)
              }}
              placeholder="0.00"
              className={getFieldClass(
                sellingPriceError,
                'form-input w-full h-9 pl-8 pr-3 py-1.5 text-xs sm:text-[13px] font-bold font-mono rounded-lg border text-foreground transition-all'
              )}
            />
          </div>
          <FieldError error={sellingPriceError} />
          <div className="text-[11px] font-mono font-semibold text-primary mt-1">
            {formatKHR(selling)}
          </div>
        </div>

        {/* Compare-at Price */}
        <div>
          <label className="block text-xs font-semibold text-foreground/90 mb-1">
            {t('comparePrice', 'Compare-at Price ($)')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-muted-foreground pointer-events-none">$</span>
            <input
              type="number"
              step="0.01"
              value={comparePrice ?? ''}
              onChange={(e) => onComparePriceChange(e.target.value)}
              placeholder="0.00"
              className="form-input w-full h-9 pl-8 pr-3 py-1.5 text-xs sm:text-[13px] font-bold font-mono rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-1">
            {formatKHR(compare)}
          </div>
        </div>
      </div>

      {/* ─── Financial Summary KPI Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Profit Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block truncate">
            {t('expectedProfit', 'Profit')}
          </span>
          <div className={`text-base font-bold font-mono ${profitUSD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {formatUSD(profitUSD)}
          </div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {formatKHR(profitUSD)}
          </span>
        </div>

        {/* Margin % Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block truncate">
            {t('profitMargin', 'Margin %')}
          </span>
          <div className={`text-base font-bold font-mono ${marginPct >= 20 ? 'text-emerald-600 dark:text-emerald-400' : marginPct >= 10 ? 'text-amber-600' : 'text-slate-600'}`}>
            {marginPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-muted-foreground block">
            {t('profitOverSelling', 'Profit / Selling Price')}
          </span>
        </div>

        {/* Markup % Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block truncate">
            {t('markupPctLabel', 'Markup %')}
          </span>
          <div className="text-base font-bold font-mono text-primary">
            {markupPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-muted-foreground block">
            {t('profitOverCost', 'Profit / Cost Price')}
          </span>
        </div>

        {/* Discount % Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block truncate">
            {t('discountLabel', 'Discount %')}
          </span>
          <div className={`text-base font-bold font-mono ${discountPct > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
            {discountPct > 0 ? `${discountPct.toFixed(0)}% OFF` : '0%'}
          </div>
          <span className="text-[10px] text-muted-foreground block truncate">
            {discountPct > 0 ? t('saveAmount', 'Save {{amount}}', { amount: formatUSD(savingsUSD) }) : t('noDiscount', 'No Discount')}
          </span>
        </div>
      </div>

      {/* ─── Health Banner ─── */}
      {health && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${health.bg}`}>
          <div className="flex items-center gap-2.5">
            <health.icon size={18} className="shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold tracking-wide">
                {health.label}
              </h4>
              <p className="text-[11px] opacity-90 mt-0.5">
                {profitUSD >= 0
                  ? t('products.profitPerUnit', 'Expected profit of {{usd}} ({{khr}}) per unit', { usd: formatUSD(profitUSD), khr: formatKHR(profitUSD) })
                  : t('products.lossPerUnit', 'Loss of {{usd}} ({{khr}}) per unit!', { usd: formatUSD(Math.abs(profitUSD)), khr: formatKHR(Math.abs(profitUSD)) })}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${health.badgeBg} shrink-0 shadow-2xs`}>
            Margin: {marginPct.toFixed(1)}%
          </span>
        </div>
      )}

      {/* ─── Tax Calculation Accordion (Optional) ─── */}
      {showTaxSelector && (
        <div className="bg-card border border-border/80 rounded-xl shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsTaxDetailsOpen(!isTaxDetailsOpen)}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Coins size={15} />
              </div>
              <span className="text-xs sm:text-sm font-bold">{t('products.taxBreakdownTitle', 'Tax Inclusion Breakdown')}</span>
              {selectedTax && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/20">
                  {selectedTax.name} ({selectedTax.rate}%)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-[11px] font-medium">
                {isTaxDetailsOpen ? t('products.hideTaxDetails', 'Hide Tax Details') : t('products.showTaxDetails', 'Show Tax Details')}
              </span>
              {isTaxDetailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>

          {isTaxDetailsOpen && (
            <div className="p-4 pt-3 border-t border-border/60 space-y-3.5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                {onTaxIdChange && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1">
                      {t('products.selectTaxRule', 'Select Tax Rule')}
                    </label>
                    <select
                      value={taxId}
                      onChange={(e) => onTaxIdChange(e.target.value)}
                      className="form-input w-full h-9 px-3 py-1.5 text-xs sm:text-[13px] font-medium rounded-lg border border-border/80 bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">
                        {t('products.noTax', 'No Tax (0%)')}
                      </option>
                      {taxes.map((tx) => (
                        <option key={tx.id} value={tx.id}>
                          {tx.name} ({tx.rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="h-9 flex items-center px-3.5 bg-muted/20 border border-border/80 rounded-lg">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-[13px] font-medium text-foreground w-full">
                    <input
                      type="checkbox"
                      checked={priceIncludesTax}
                      onChange={(e) => setPriceIncludesTax(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span>{t('products.taxInclusive', 'Price Includes Tax (Tax Inclusive)')}</span>
                  </label>
                </div>
              </div>

              {taxRate > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/60 space-y-0.5">
                    <span className="text-muted-foreground block text-[11px] font-medium">
                      {t('products.netSellingPrice', 'Net Selling Price (Excl. Tax)')}
                    </span>
                    <span className="font-mono font-bold text-foreground text-sm block">
                      {formatUSD(netSellingUSD)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{formatKHR(netSellingUSD)}</span>
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/30 space-y-0.5">
                    <span className="text-primary block text-[11px] font-semibold">
                      {t('products.taxAmount', 'Tax Amount')} ({taxRate}%)
                    </span>
                    <span className="font-mono font-bold text-primary text-sm block">
                      +{formatUSD(taxAmountUSD)}
                    </span>
                    <span className="text-[10px] text-primary/80 font-mono">{formatKHR(taxAmountUSD)}</span>
                  </div>

                  <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/30 space-y-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px] font-semibold">
                      {t('products.grossSellingPrice', 'Gross Selling Price (Incl. Tax)')}
                    </span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">
                      {formatUSD(grossSellingUSD)}
                    </span>
                    <span className="text-[10px] text-emerald-600/80 font-mono">{formatKHR(grossSellingUSD)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic pt-0.5">
                  {t('products.taxHelpText', 'Select a tax rule above to see the tax and net price breakdown.')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Projected Inventory Total Profit ─── */}
      {Number(stockQuantity) > 0 && profitUSD > 0 && (
        <div className="p-3 bg-card border border-border/80 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Coins size={15} className="text-primary" />
            <span className="font-semibold text-foreground">
              {t('products.expectedTotalProfitStock', 'Projected Total Inventory Profit ({{qty}} units):', { qty: stockQuantity })}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-emerald-600 dark:text-emerald-400 text-sm">
              {formatUSD(profitUSD * Number(stockQuantity))}
            </span>
            <span className="text-muted-foreground text-[11px]">
              ({formatKHR(profitUSD * Number(stockQuantity))})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlexiblePricingSection
