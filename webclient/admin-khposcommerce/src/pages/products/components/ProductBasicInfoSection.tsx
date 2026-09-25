import React from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Tag, Box, Percent, Shield, Wand2, RefreshCw } from 'lucide-react'
import { FormCard, FieldError, getFieldClass } from '@/components/common'
import type { ProductForm } from '../types/productForm.types'

interface ProductBasicInfoSectionProps {
  form: ProductForm
  setField: (field: keyof ProductForm, value: any) => void
  categories: any[]
  brands: any[]
  units: any[]
  taxes: any[]
  isSkuManuallyEdited: boolean
  setIsSkuManuallyEdited: (val: boolean) => void
  generateSKU: (name: string) => string
  formErrors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const ProductBasicInfoSection: React.FC<ProductBasicInfoSectionProps> = ({
  form,
  setField,
  categories,
  brands,
  units,
  taxes,
  isSkuManuallyEdited,
  setIsSkuManuallyEdited,
  generateSKU,
  formErrors = {},
  onClearError,
}) => {
  const { t } = useTranslation(['products', 'common'])

  const handleNameChange = (val: string) => {
    const autoSku = (!isSkuManuallyEdited || !form.sku.trim()) ? generateSKU(val) : form.sku
    setField('name', val)
    if (!isSkuManuallyEdited || !form.sku.trim()) {
      setField('sku', autoSku)
    }
  }

  const handleAutoGenerateBarcode = () => {
    const random12 = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    setField('barcode', random12)
  }

  return (
    <FormCard
      title={t('generalInfo', 'General Information')}
      subtitle={t('generalSub', 'Basic product identifiers, category, brand, and description')}
      contentClassName="space-y-4"
    >
        {/* Row 1: Product Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground/90 mb-1">
            {t('colName', 'Product Name')} <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.name ?? ''}
              onChange={e => {
                handleNameChange(e.target.value)
                onClearError?.('name')
              }}
              placeholder={t('namePlaceholder', 'e.g. iPhone 16 Pro Max 256GB Desert Titanium')}
              className={getFieldClass(
                formErrors.name,
                'w-full h-9 px-3 py-1.5 text-xs sm:text-[13px] font-medium rounded-lg border transition-all'
              )}
            />
          </div>
          <FieldError error={formErrors.name} />
        </div>

        {/* Row 2: SKU & Barcode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('sku', 'SKU')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setField('sku', generateSKU(form.name) || `SKU-${Date.now().toString().slice(-6)}`)
                  setIsSkuManuallyEdited(false)
                  onClearError?.('sku')
                }}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>{t('autoGenerate', 'Auto Generate')}</span>
              </button>
            </div>
            <input
              type="text"
              value={form.sku ?? ''}
              onChange={e => {
                setField('sku', e.target.value)
                setIsSkuManuallyEdited(true)
                onClearError?.('sku')
              }}
              placeholder="SKU-IPHONE-16-PRO"
              className={getFieldClass(
                formErrors.sku,
                'w-full h-9 px-3 py-1.5 font-mono text-xs uppercase rounded-lg border transition-all'
              )}
            />
            <FieldError error={formErrors.sku} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('colBarcode', 'Barcode')}
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateBarcode}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
              >
                <Wand2 size={11} />
                <span>{t('generateBarcode', 'Gen EAN-13')}</span>
              </button>
            </div>
            <input
              type="text"
              value={form.barcode ?? ''}
              onChange={e => setField('barcode', e.target.value)}
              placeholder="885909123456"
              className="form-input w-full h-9 px-3 py-1.5 font-mono text-xs rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Row 3: Category, Brand, Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1">
              {t('colCategory', 'Category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id ?? ''}
              onChange={e => setField('category_id', e.target.value)}
              className="form-input w-full h-9 px-3 py-1.5 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">{t('allCategories', 'Select category...')}</option>
              {(categories || []).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1">
              {t('colBrand', 'Brand')}
            </label>
            <select
              value={form.brand_id ?? ''}
              onChange={e => setField('brand_id', e.target.value)}
              className="form-input w-full h-9 px-3 py-1.5 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">{t('allBrands', 'None / Generic...')}</option>
              {(brands || []).map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1">
              {t('productUnit', 'Product Unit')}
            </label>
            <select
              value={form.unit_id ?? ''}
              onChange={e => setField('unit_id', e.target.value)}
              className="form-input w-full h-9 px-3 py-1.5 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">{t('allUnits', 'Select unit...')}</option>
              {(units || []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol || u.code || 'pcs'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Short Description & Full Description */}
        <div>
          <label className="block text-xs font-semibold text-foreground/90 mb-1">
            {t('shortDescription', 'Short Summary')}
          </label>
          <textarea
            rows={2}
            value={form.short_description ?? ''}
            onChange={e => setField('short_description', e.target.value)}
            placeholder={t('shortDescPlaceholder', 'Brief summary sentence for POS & receipts...')}
            className="form-textarea w-full min-h-[58px] p-2.5 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 transition-all resize-y leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/90 mb-1">
            {t('colDescription', 'Specifications & Detailed Description')}
          </label>
          <textarea
            value={form.description ?? ''}
            onChange={e => setField('description', e.target.value)}
            rows={5}
            placeholder={t('descPlaceholder', 'Detailed catalog specifications and features...')}
            className="form-textarea w-full min-h-[120px] p-3 text-xs sm:text-[13px] rounded-xl border border-border/80 bg-background leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all resize-y"
          />
        </div>

        {/* Row 5: Status & Feature Switches */}
        <div className="pt-2 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
            form.status === 'active' ? 'bg-primary/5 border-primary/40 shadow-2xs' : 'border-border/70 hover:bg-muted/30'
          }`}>
            <input
              type="checkbox"
              checked={form.status === 'active'}
              onChange={e => setField('status', e.target.checked ? 'active' : 'inactive')}
              className="mt-0.5 w-3.5 h-3.5 rounded text-primary focus:ring-primary/30"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">{t('active', 'Active')}</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">{t('activeDesc', 'Visible in store & POS')}</span>
            </div>
          </label>

          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
            form.is_featured ? 'bg-amber-500/5 border-amber-500/40 shadow-2xs' : 'border-border/70 hover:bg-muted/30'
          }`}>
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setField('is_featured', e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500/30"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">{t('featured', 'Featured Product')}</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">{t('featuredDesc', 'Show on top/featured')}</span>
            </div>
          </label>

          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
            form.is_digital ? 'bg-purple-500/5 border-purple-500/40 shadow-2xs' : 'border-border/70 hover:bg-muted/30'
          }`}>
            <input
              type="checkbox"
              checked={form.is_digital}
              onChange={e => setField('is_digital', e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-600/30"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">{t('digitalProduct', 'Digital Product')}</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">{t('digitalDesc', 'No shipping required')}</span>
            </div>
          </label>

          <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
            form.track_inventory ? 'bg-emerald-500/5 border-emerald-500/40 shadow-2xs' : 'border-border/70 hover:bg-muted/30'
          }`}>
            <input
              type="checkbox"
              checked={form.track_inventory}
              onChange={e => setField('track_inventory', e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-600/30"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">{t('trackStockLevel', 'Track Stock Level')}</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">{t('trackStockDesc', 'Deduct on sale')}</span>
            </div>
          </label>
        </div>
      </FormCard>
  )
}
