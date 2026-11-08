import React, { useMemo } from 'react'
import {
  Scale,
  Ruler,
  Box,
  Truck,
  Save,
  Check,
  Package,
  Layers,
  Smartphone,
  Shirt,
  Laptop,
  Tv,
  Navigation,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FlexibleDimensionsSectionProps {
  weight: string
  length: string
  width: string
  height: string
  onWeightChange: (val: string) => void
  onLengthChange: (val: string) => void
  onWidthChange: (val: string) => void
  onHeightChange: (val: string) => void
  onSave?: () => void
  isSaving?: boolean
}

export const FlexibleDimensionsSection: React.FC<FlexibleDimensionsSectionProps> = ({
  weight,
  length,
  width,
  height,
  onWeightChange,
  onLengthChange,
  onWidthChange,
  onHeightChange,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const w = parseFloat(weight) || 0
  const l = parseFloat(length) || 0
  const wi = parseFloat(width) || 0
  const h = parseFloat(height) || 0

  // 1. Calculations
  const volumeCm3 = useMemo(() => l * wi * h, [l, wi, h])
  const volumeM3 = useMemo(() => volumeCm3 / 1000000, [volumeCm3])
  const volumetricWeightKg = useMemo(() => volumeCm3 / 5000, [volumeCm3]) // Standard Logistics Formula (L*W*H / 5000)
  const billableWeight = useMemo(() => Math.max(w, volumetricWeightKg), [w, volumetricWeightKg])
  const isVolumetricHigher = volumetricWeightKg > w

  // Package Classification Preset
  const packageCategory = useMemo(() => {
    if (l === 0 && wi === 0 && h === 0 && w === 0) return t('pkgUnset', 'Not Specified')
    if (w <= 1 && l <= 25 && wi <= 20 && h <= 10) return t('pkgSmall', 'Small Parcel (< 1kg)')
    if (w <= 5 && l <= 45 && wi <= 35 && h <= 25) return t('pkgStandard', 'Standard Box (1 - 5kg)')
    if (w <= 15 && l <= 60 && wi <= 50 && h <= 40) return t('pkgLarge', 'Large Carton (5 - 15kg)')
    return t('pkgBulky', 'Bulky / Heavy Cargo (> 15kg)')
  }, [w, l, wi, h, t])

  // Presets with SVG icons instead of emojis
  const dimensionPresets = [
    { label: t('presetSmallAccessory', 'Small Accessory'), Icon: Smartphone, color: 'text-primary', l: '15', w: '10', h: '5', wt: '0.3' },
    { label: t('presetApparelBox', 'Apparel Box'), Icon: Shirt, color: 'text-purple-500', l: '30', w: '22', h: '6', wt: '0.5' },
    { label: t('presetLaptopBox', 'Laptop Box'), Icon: Laptop, color: 'text-blue-500', l: '42', w: '30', h: '8', wt: '2.5' },
    { label: t('presetStandardParcel', 'Standard Parcel'), Icon: Package, color: 'text-amber-500', l: '35', w: '25', h: '15', wt: '3.0' },
    { label: t('presetLargeCarton', 'Large Carton'), Icon: Tv, color: 'text-rose-500', l: '55', w: '40', h: '30', wt: '8.0' },
  ]

  const applyPreset = (preset: typeof dimensionPresets[0]) => {
    onLengthChange(preset.l)
    onWidthChange(preset.w)
    onHeightChange(preset.h)
    if (preset.wt) onWeightChange(preset.wt)
  }

  const handleQuickWeightAdd = (amount: number) => {
    const current = parseFloat(weight) || 0
    const next = Math.max(0, current + amount)
    onWeightChange(next.toFixed(3).replace(/\.?0+$/, ''))
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP METRIC CARDS HEADER (SPACIOUS, ELEGANT, ZERO CLIPPING) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Metric 1: Actual Weight */}
        <div className="bg-card/90 dark:bg-card/60 p-3.5 rounded-2xl border border-border/80 shadow-2xs relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('actualWeightLabel', 'Actual Weight')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Scale size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {w > 0 ? w : '0'}
              </span>
              <span className="text-xs font-bold text-muted-foreground">kg</span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground">
              = {(w * 1000).toLocaleString()} {t('gramsUnit', 'g')}
            </span>
          </div>
        </div>

        {/* Metric 2: Volume CBM */}
        <div className="bg-card/90 dark:bg-card/60 p-3.5 rounded-2xl border border-border/80 shadow-2xs relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('volumeLabel', 'Volume')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                <Box size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {volumeM3 > 0 ? volumeM3.toFixed(4) : '0.0000'}
              </span>
              <span className="text-xs font-bold text-muted-foreground">m³ (CBM)</span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span className="text-[10px] font-mono text-muted-foreground">
              {volumeCm3.toLocaleString()} cm³
            </span>
          </div>
        </div>

        {/* Metric 3: Volumetric Weight */}
        <div className="bg-card/90 dark:bg-card/60 p-3.5 rounded-2xl border border-border/80 shadow-2xs relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('volumetricWeightLabel', 'Dim Weight')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                <Ruler size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {volumetricWeightKg > 0 ? volumetricWeightKg.toFixed(2) : '0.00'}
              </span>
              <span className="text-xs font-bold text-muted-foreground">kg (Dim)</span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {t('volumetricFormula', '(L × W × H) / 5000')}
            </span>
          </div>
        </div>

        {/* Metric 4: Billable Weight Tier */}
        <div className="bg-card/90 dark:bg-card/60 p-3.5 rounded-2xl border border-border/80 shadow-2xs relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('billableWeightLabel', 'Billable Weight')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <Truck size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {billableWeight > 0 ? billableWeight.toFixed(2) : '0.00'}
              </span>
              <span className="text-xs font-bold text-muted-foreground">kg</span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            {isVolumetricHigher ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] font-bold truncate">
                <AlertTriangle size={11} className="shrink-0" />
                <span className="truncate">{t('billableVolumetricAlert', 'Charged by Volumetric Weight (Dim > Actual)')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold truncate">
                <CheckCircle2 size={11} className="shrink-0" />
                <span className="truncate">{t('billableActualAlert', 'Charged by Actual Weight')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN CONTENT GRID (FORM & CALCULATOR) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Dimensions & Weight Form Inputs (2 Columns width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Input Card */}
          <div className="bg-card border border-border/80 p-5 rounded-xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {t('itemPackageTitle', 'Item Package & Dimensions')}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t('itemPackageDesc', 'Configure item weight and dimensions to calculate shipping costs and package sizing')}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <CheckCircle2 size={13} />
                <span>{packageCategory}</span>
              </div>
            </div>

            {/* Weight Input Row */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('totalWeightKgLabel', 'Total Package Weight (Weight in Kilograms)')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground pointer-events-none">
                  <Scale size={16} />
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={weight ?? ''}
                  onChange={(e) => onWeightChange(e.target.value)}
                  placeholder="0.000"
                  className="w-full h-9 pl-10 pr-12 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-mono font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
                <span className="absolute right-3 font-mono font-bold text-xs text-muted-foreground">
                  KG
                </span>
              </div>

              {/* Quick Weight Adjust Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">{t('quickAddWeight', 'Quick Add Weight:')}</span>
                {[
                  { label: '+100g', val: 0.1 },
                  { label: '+500g', val: 0.5 },
                  { label: '+1kg', val: 1.0 },
                  { label: '+2kg', val: 2.0 },
                  { label: '+5kg', val: 5.0 },
                ].map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickWeightAdd(b.val)}
                    className="px-2.5 py-0.5 rounded-md bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/60 text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Dimensions Grid */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('packageDimensionsTitle', 'Package Dimensions (L × W × H)')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Length */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {t('lengthCmLabel', 'Length (cm)')}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={length ?? ''}
                      onChange={(e) => onLengthChange(e.target.value)}
                      placeholder="0.0"
                      className="w-full h-9 px-3 pr-9 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-mono font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                    />
                    <span className="absolute right-2.5 font-mono text-[10px] font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>

                {/* Width */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {t('widthCmLabel', 'Width (cm)')}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={width ?? ''}
                      onChange={(e) => onWidthChange(e.target.value)}
                      placeholder="0.0"
                      className="w-full h-9 px-3 pr-9 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-mono font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                    />
                    <span className="absolute right-2.5 font-mono text-[10px] font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    {t('heightCmLabel', 'Height (cm)')}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={height ?? ''}
                      onChange={(e) => onHeightChange(e.target.value)}
                      placeholder="0.0"
                      className="w-full h-9 px-3 pr-9 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-mono font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                    />
                    <span className="absolute right-2.5 font-mono text-[10px] font-bold text-muted-foreground">
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Dimension Templates (Lucide SVG Icons) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('presetTemplatesTitle', 'Preset Dimension Templates')}
              </span>
              <div className="flex flex-wrap gap-2">
                {dimensionPresets.map((p, idx) => {
                  const IconComp = p.Icon
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:bg-primary/10 hover:text-primary border border-slate-200 dark:border-slate-700/80 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconComp size={14} className={`${p.color} shrink-0`} />
                      <span>{p.label}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        ({p.l}x{p.w}x{p.h}cm)
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Package Diagram & Shipping Rules (1 Column width) */}
        <div className="space-y-6">
          {/* Visual 3D Package Box Diagram */}
          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('boxVisualizerTitle', 'Box Visualizer')}
              </h4>
            </div>

            {/* Interactive Box Illustration */}
            <div className="relative h-44 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-primary/20 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 text-primary shadow-inner">
                  <Box size={40} className="animate-pulse" />
                </div>
                <div className="font-mono text-xs font-black text-slate-900 dark:text-slate-100">
                  {l || 0} cm × {wi || 0} cm × {h || 0} cm
                </div>
                <div className="inline-block px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono border border-primary/20">
                  {volumeM3.toFixed(4)} CBM
                </div>
              </div>
            </div>

            {/* Logistics Class Guidance with Lucide SVG Icons */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('suitableDeliveryService', 'Suitable Delivery Service:')}</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  {w > 10 || volumetricWeightKg > 10 ? (
                    <>
                      <Truck size={14} className="text-primary shrink-0" />
                      <span>{t('expressVan', 'Express Van')}</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={14} className="text-primary shrink-0" />
                      <span>{t('bikeDelivery', 'Bike Delivery')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('packageCategoryLabel', 'Package Category:')}</span>
                <span className="font-bold text-primary">
                  {packageCategory}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. BOTTOM ACTION BAR ─── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="px-6 py-2.5 bg-gradient-primary text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <span className="animate-spin text-white">⌛</span>
          ) : (
            <Save size={16} />
          )}
          <span>{t('saveShippingDetails', 'Save Dimensions & Weight')}</span>
        </button>
      </div>
    </div>
  )
}
