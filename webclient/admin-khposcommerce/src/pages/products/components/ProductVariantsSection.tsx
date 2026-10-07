import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Sparkles, SlidersHorizontal, Plus, Trash2, Check,
  Tag, Palette
} from 'lucide-react'
import { SIZE_PRESET_MAP } from '../utils/productPresets'
import { COLOR_MAP, getVariantColorHex } from '../utils/colorResolver'
import type { CustomColorItem } from '../types/productForm.types'
import Pagination from '@/components/shared/Pagination'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface ProductVariantsSectionProps {
  productId: number | null
  form: any
  setField: (field: string, val: any) => void
  productDetail: any
  selectedPresetMode: string
  setSelectedPresetMode: (mode: string) => void
  customSizeCategory: string
  activeCategoryKey: string
  handleSwitchSizeCategory: (catKey: string) => void
  customSelectedSizes: string[]
  setCustomSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>
  customInputSize: string
  setCustomInputSize: (val: string) => void
  userAddedSizes: string[]
  handleAddUserCustomSize: (e?: React.SyntheticEvent) => void
  customSelectedColors: string[]
  setCustomSelectedColors: React.Dispatch<React.SetStateAction<string[]>>
  customInputColor: string
  setCustomInputColor: (val: string) => void
  customColorHex: string
  setCustomColorHex: (val: string) => void
  userAddedColors: CustomColorItem[]
  handleAddUserCustomColor: (e?: React.SyntheticEvent) => void
  isGeneratingVariants: boolean
  matrixProgress: { current: number; total: number } | null
  handleGenerateMatrix: () => void
  variantPage: number
  setVariantPage: (page: number) => void
  variantPageSize: number
  setVariantPageSize: (size: number) => void
  selectedVariantIds: number[]
  setSelectedVariantIds: React.Dispatch<React.SetStateAction<number[]>>
  onOpenEditVariant: (variant: any) => void
  onOpenViewVariant: (variant: any) => void
  onOpenDeleteVariant: (variant: { id: number; name: string }) => void
  onOpenClearAllVariants: () => void
  onOpenBulkDeleteVariants: () => void
  onQuickToggleVariantStatus: (variant: any) => void
}

export const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  form,
  setField,
  productDetail,
  activeCategoryKey,
  handleSwitchSizeCategory,
  customSelectedSizes,
  setCustomSelectedSizes,
  customInputSize,
  setCustomInputSize,
  userAddedSizes,
  handleAddUserCustomSize,
  customSelectedColors,
  setCustomSelectedColors,
  customInputColor,
  setCustomInputColor,
  customColorHex,
  setCustomColorHex,
  userAddedColors,
  handleAddUserCustomColor,
  isGeneratingVariants,
  matrixProgress,
  handleGenerateMatrix,
  variantPage,
  setVariantPage,
  variantPageSize,
  setVariantPageSize,
  selectedVariantIds,
  setSelectedVariantIds,
  onOpenEditVariant,
  onOpenViewVariant,
  onOpenDeleteVariant,
  onOpenClearAllVariants,
  onOpenBulkDeleteVariants,
  onQuickToggleVariantStatus,
}) => {
  const { t } = useTranslation(['products', 'common', 'pagination'])
  const variants: any[] = productDetail?.variants || []

  // Pagination calculation
  const totalVariants = variants.length
  const totalPages = Math.ceil(totalVariants / variantPageSize) || 1
  const paginatedVariants = variants.slice((variantPage - 1) * variantPageSize, variantPage * variantPageSize)

  const activePresetObj = SIZE_PRESET_MAP[activeCategoryKey] || SIZE_PRESET_MAP.smartphones

  return (
    <div className="space-y-6">
      {/* Variants Enable Toggle Card */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-bold text-xs sm:text-sm text-foreground">
            {t('products.enableVariants', 'Multi-Dimensional Variants')}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t('products.enableVariantsSub', 'Generate color, storage, size, or material matrix for this product')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.has_variants}
            onChange={e => setField('has_variants', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {form.has_variants && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Preset Builder Card */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Header & Category Presets Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-foreground">
                  {t('products.smartPresetBuilder', 'Smart Variant Matrix Generator')}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {t('products.smartPresetSub', 'Select sizes/specs and colors to auto-calculate SKU and pricing')}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {Object.entries(SIZE_PRESET_MAP).map(([key, config]) => {
                  const IconComp = config.icon
                  const isActive = activeCategoryKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSwitchSizeCategory(key)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60'
                      }`}
                    >
                      <IconComp size={13} />
                      <span className="capitalize">{key}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Spec & Size Options */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Tag size={15} className="text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {t('products.selectSpecsOrSizes', '1. Select Sizes / Specifications:')}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activePresetObj.options.map(opt => {
                  const isSelected = customSelectedSizes.includes(opt.code)
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setCustomSelectedSizes(prev =>
                          isSelected ? prev.filter(s => s !== opt.code) : [...prev, opt.code]
                        )
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{opt.code}</span>
                      {opt.badge && <span className="text-[10px] font-normal opacity-80">({opt.badge})</span>}
                    </button>
                  )
                })}

                {userAddedSizes.map(s => {
                  const isSelected = customSelectedSizes.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setCustomSelectedSizes(prev =>
                          isSelected ? prev.filter(x => x !== s) : [...prev, s]
                        )
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{s}</span>
                    </button>
                  )
                })}
              </div>

              {/* Custom Size Adder Input */}
              <div className="flex items-center gap-2 max-w-sm pt-0.5">
                <input
                  type="text"
                  value={customInputSize ?? ''}
                  onChange={e => setCustomInputSize(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddUserCustomSize(e)
                    }
                  }}
                  placeholder={t('products.addCustomSizePlaceholder', '+ Add custom size (e.g. 2TB, XXL)...')}
                  className="w-full h-9 px-3 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={handleAddUserCustomSize}
                  className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer shrink-0 shadow-xs transition-colors active:scale-95"
                  title={t('common.add', 'Add')}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Colors Selection */}
            <div className="space-y-2.5 pt-2.5 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Palette size={15} className="text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {t('products.selectColors', '2. Select Colors & Swatches:')}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Black', 'White', 'Silver', 'Space Gray', 'Natural Titanium',
                  'Midnight', 'Starlight', 'Red', 'Blue', 'Gold', 'Green', 'Purple', 'Pink'
                ].map(c => {
                  const isSelected = customSelectedColors.includes(c)
                  const hex = COLOR_MAP[c.toLowerCase()] || '#6b7280'
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCustomSelectedColors(prev =>
                          isSelected ? prev.filter(x => x !== c) : [...prev, c]
                        )
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/40 shadow-xs'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20 shadow-2xs shrink-0" style={{ backgroundColor: hex }} />
                      <span>{c}</span>
                    </button>
                  )
                })}

                {userAddedColors.map(c => {
                  const isSelected = customSelectedColors.includes(c.key)
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCustomSelectedColors(prev =>
                          isSelected ? prev.filter(x => x !== c.key) : [...prev, c.key]
                        )
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary/15 text-primary border border-primary/40 shadow-xs'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20 shadow-2xs shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Custom Color Adder */}
              <div className="flex items-center gap-2 max-w-md pt-0.5">
                <input
                  type="color"
                  value={customColorHex ?? '#6366f1'}
                  onChange={e => setCustomColorHex(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg cursor-pointer border border-border/80 bg-background shrink-0"
                  title="Pick Color Hex"
                />
                <input
                  type="text"
                  value={customInputColor ?? ''}
                  onChange={e => setCustomInputColor(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddUserCustomColor(e)
                    }
                  }}
                  placeholder={t('products.addCustomColorPlaceholder', '+ Add custom color (e.g. Cobalt Blue)...')}
                  className="w-full h-9 px-3 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={handleAddUserCustomColor}
                  className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer shrink-0 shadow-xs transition-colors active:scale-95"
                  title={t('common.add', 'Add')}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Matrix Generation Action Bar */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {customSelectedSizes.length} sizes × {customSelectedColors.length} colors = <strong className="text-foreground">{customSelectedSizes.length * customSelectedColors.length} variants</strong>
              </span>

              <button
                type="button"
                onClick={handleGenerateMatrix}
                disabled={isGeneratingVariants || customSelectedSizes.length === 0 || customSelectedColors.length === 0}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Sparkles size={14} />
                <span>{isGeneratingVariants ? t('products.generating', 'Generating...') : t('products.generateMatrix', 'Generate Matrix')}</span>
              </button>
            </div>

            {matrixProgress && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-primary">
                  <span>{isGeneratingVariants ? t('products.generating', 'Generating...') : t('products.generateMatrix', 'Generate Matrix')}</span>
                  <span>{matrixProgress.current} / {matrixProgress.total}</span>
                </div>
                <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(matrixProgress.current / matrixProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generated Variants Table */}
          {variants.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {t('products.existingVariants', 'Existing Product Variants')} ({variants.length})
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('products.variantsTableSub', 'Individual SKU codes, barcodes, price overrides and POS status')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedVariantIds.length > 0 && (
                    <button
                      type="button"
                      onClick={onOpenBulkDeleteVariants}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>{t('products.deleteSelected', t('common.deleteSelected', 'Delete Selected'))} ({selectedVariantIds.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenClearAllVariants}
                    className="px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    {t('products.clearAllVariants', 'Clear All')}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.length === variants.length && variants.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedVariantIds(variants.map(v => v.id))
                            else setSelectedVariantIds([])
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">{t('products.variant', 'Variant')}</th>
                      <th className="p-3.5 font-mono">{t('products.sku', 'SKU')}</th>
                      <th className="p-3.5">{t('products.colPrice', 'Selling Price')}</th>
                      <th className="p-3.5">{t('products.colCostPrice', 'Cost Price')}</th>
                      <th className="p-3.5">{t('products.colStock', 'Stock')}</th>
                      <th className="p-3.5 text-center">{t('products.colStatus', 'Status')}</th>
                      <th className="p-3.5 text-right">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedVariants.map((v: any) => {
                      const hex = getVariantColorHex(v)
                      const isSelected = selectedVariantIds.includes(v.id)
                      return (
                        <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setSelectedVariantIds(prev => [...prev, v.id])
                                else setSelectedVariantIds(prev => prev.filter(x => x !== v.id))
                              }}
                              className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-medium text-foreground flex items-center gap-2">
                            {hex && (
                              <span className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: hex }} />
                            )}
                            <span className="truncate max-w-[200px] font-semibold">{v.name}</span>
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground">{v.sku || '—'}</td>
                          <td className="p-3.5 font-bold text-primary font-mono">${Number(v.selling_price || 0).toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-muted-foreground">${Number(v.cost_price || 0).toFixed(2)}</td>
                          <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{v.stock ?? 0}</td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => onQuickToggleVariantStatus(v)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                v.is_active
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                              }`}
                            >
                              {v.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end">
                              <TableActionMenu
                                onView={() => onOpenViewVariant(v)}
                                onEdit={() => onOpenEditVariant(v)}
                                onDelete={() => onOpenDeleteVariant({ id: v.id, name: v.name })}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Global Pagination Component */}
                {totalVariants > 0 && (
                  <Pagination
                    currentPage={variantPage}
                    lastPage={totalPages}
                    total={totalVariants}
                    perPage={variantPageSize}
                    onPageChange={setVariantPage}
                    onPerPageChange={setVariantPageSize}
                    perPageOptions={[5, 10, 15, 20, 50]}
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ProductVariantsSection
