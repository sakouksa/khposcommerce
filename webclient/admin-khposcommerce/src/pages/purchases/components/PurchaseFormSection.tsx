import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Trash, Loader2, Plus, Minus, ShoppingCart
} from 'lucide-react'
import { FormHeader, FormFooter, FieldLabel, FieldError, getFieldClass, EnterpriseDatePicker } from '@/components/common'
import { formatCurrency, getDualValues } from '../utils/purchaseCurrency'

interface PurchaseFormSectionProps {
  editPurchaseId: number | null
  editLoading: boolean
  supplierId: string
  setSupplierId: (val: string) => void
  warehouseId: string
  setWarehouseId: (val: string) => void
  branchId: string
  setBranchId: (val: string) => void
  poDate: string
  setPoDate: (val: string) => void
  dueDate: string
  setDueDate: (val: string) => void
  currencyCode: string
  handleCurrencyChange: (val: string) => void
  exchangeRate: string
  setExchangeRate: (val: string) => void
  shippingCost: string
  setShippingCost: (val: string) => void
  notes: string
  setNotes: (val: string) => void
  formItems: any[]
  updateFormItem: (index: number, key: string, value: string) => void
  removeFormItem: (index: number) => void
  addProductToForm: (item: any) => void
  suppliers: any[]
  warehouses: any[]
  branches: any[]
  filteredProducts: any[]
  prodSearch?: string
  setProdSearch?: (val: string) => void
  prodDropdownOpen?: boolean
  setProdDropdownOpen?: (val: boolean) => void
  totals: { subtotal: number; discount_amount: number; tax_amount: number; grand_total: number }
  isSubmitting: boolean
  formErrors?: Record<string, string>
  onClearError?: (field: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const PurchaseFormSection: React.FC<PurchaseFormSectionProps> = ({
  editPurchaseId,
  editLoading,
  supplierId,
  setSupplierId,
  warehouseId,
  setWarehouseId,
  branchId,
  setBranchId,
  poDate,
  setPoDate,
  dueDate,
  setDueDate,
  currencyCode,
  handleCurrencyChange,
  exchangeRate,
  setExchangeRate,
  shippingCost,
  setShippingCost,
  notes,
  setNotes,
  formItems,
  updateFormItem,
  removeFormItem,
  addProductToForm,
  suppliers = [],
  warehouses = [],
  branches = [],
  filteredProducts = [],
  totals,
  isSubmitting,
  formErrors = {},
  onClearError,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation(['purchases', 'common', 'nav'])

  const isEdit = !!editPurchaseId

  // Statistics & Meta Objects
  const totalItemsCount = formItems.length
  const totalUnitsCount = formItems.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0)
  const selectedSupplierObj = suppliers.find((s: any) => String(s.id) === String(supplierId))
  const selectedWarehouseObj = warehouses.find((w: any) => String(w.id) === String(warehouseId))
  const selectedBranchObj = branches.find((b: any) => String(b.id) === String(branchId))

  const grandTotalUSD = getDualValues(totals.grand_total, currencyCode, exchangeRate).usd
  const grandTotalKHR = grandTotalUSD * (parseFloat(exchangeRate) || 4100)

  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
      {/* ─── Global Form Header (Unboxed, Clean & Distinct) ─── */}
      <FormHeader
        isEdit={isEdit}
        title={
          isEdit
            ? t('purchases.editPOTitle', 'Edit Purchase Order: {{ref}}', { ref: `#${editPurchaseId}` })
            : t('purchases.createPOTitle', 'Create Purchase Order')
        }
        subtitle={
          isEdit
            ? t('purchases.editPOSubtitle', 'Update items, pricing, and purchase order details')
            : t('purchases.createPOSubtitle', 'Select supplier, destination warehouse, and products to create an inbound purchase order')
        }
        breadcrumbs={[
          { label: t('purchases.title', 'Purchases'), path: '/purchases' },
          {
            label: isEdit
              ? t('purchases.editPO', 'Edit Purchase Order')
              : t('purchases.createPO', 'Create Purchase Order'),
          },
        ]}
        backPath="/purchases"
        backLabel={t('common.back', 'Back')}
        onBack={onCancel}
      />

      {editLoading && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs font-semibold text-primary">
          <Loader2 size={16} className="animate-spin" />
          <span>{t('purchases.loadingItems', 'Loading purchase order items...')}</span>
        </div>
      )}

      {/* ─── 2-Column Responsive Layout (8 Cols Main Content + 4 Cols Sticky Summary) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT COLUMN: Main Form Area (8 / 12) ─── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Order General Information */}
          <div className="bg-card dark:bg-slate-900 rounded-2xl border border-border/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
              <h3 className="text-sm font-bold text-foreground dark:text-slate-100">
                {t('purchases.orderInformation', 'Order Information')}
              </h3>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('purchases.orderInformationDesc', 'Specify supplier, destination warehouse, order date, and transaction currency')}
              </p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {/* 1. Supplier */}
              <div>
                <FieldLabel
                  label={t('purchases.supplier', 'Supplier')}
                  required
                />
                <select
                  value={supplierId}
                  onChange={(e) => {
                    setSupplierId(e.target.value)
                    onClearError?.('supplierId')
                  }}
                  className={getFieldClass(
                    formErrors.supplierId,
                    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border font-medium cursor-pointer bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                  )}
                >
                  <option value="" className="dark:bg-slate-900">{t('purchases.selectSupplier', 'Select Supplier')}</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id} className="dark:bg-slate-900">
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
                <FieldError error={formErrors.supplierId} />
              </div>

              {/* 2. Warehouse */}
              <div>
                <FieldLabel
                  label={t('purchases.warehouse', 'Receiving Warehouse')}
                  required
                />
                <select
                  value={warehouseId}
                  onChange={(e) => {
                    setWarehouseId(e.target.value)
                    onClearError?.('warehouseId')
                  }}
                  className={getFieldClass(
                    formErrors.warehouseId,
                    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border font-medium cursor-pointer bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                  )}
                >
                  <option value="" className="dark:bg-slate-900">{t('purchases.selectWarehouse', 'Select Warehouse')}</option>
                  {warehouses.map((w: any) => (
                    <option key={w.id} value={w.id} className="dark:bg-slate-900">
                      {w.name} {w.code ? `(${w.code})` : ''}
                    </option>
                  ))}
                </select>
                <FieldError error={formErrors.warehouseId} />
              </div>

              {/* 3. Branch */}
              <div>
                <FieldLabel
                  label={t('purchases.branch', 'Branch')}
                  required
                />
                <select
                  value={branchId}
                  onChange={(e) => {
                    setBranchId(e.target.value)
                    onClearError?.('branchId')
                  }}
                  className={getFieldClass(
                    formErrors.branchId,
                    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border font-medium cursor-pointer bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                  )}
                >
                  <option value="" className="dark:bg-slate-900">{t('purchases.selectBranch', 'Select Branch')}</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id} className="dark:bg-slate-900">
                      {b.name} {b.code ? `(${b.code})` : ''}
                    </option>
                  ))}
                </select>
                <FieldError error={formErrors.branchId} />
              </div>

              {/* 4. PO Date */}
              <div>
                <EnterpriseDatePicker
                  label={t('purchases.date', 'Order Date')}
                  required
                  value={poDate}
                  onChange={(val) => {
                    setPoDate(val)
                    onClearError?.('poDate')
                  }}
                  error={Boolean(formErrors?.poDate)}
                />
                <FieldError error={formErrors?.poDate} />
              </div>

              {/* 5. Due Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {t('purchases.dueDate', 'Due Date')}
                  </label>
                  <div className="flex items-center gap-1">
                    {[7, 15, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          const base = poDate ? new Date(poDate) : new Date()
                          base.setDate(base.getDate() + days)
                          setDueDate(base.toISOString().split('T')[0])
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted dark:bg-slate-800 hover:bg-muted/80 dark:hover:bg-slate-700 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-slate-100 font-mono transition-colors cursor-pointer border border-border/40 dark:border-slate-700/60"
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                </div>
                <EnterpriseDatePicker
                  value={dueDate}
                  minDate={poDate}
                  onChange={setDueDate}
                />
              </div>

              {/* 6. Currency */}
              <div>
                <FieldLabel
                  label={t('purchases.currency', 'Currency')}
                  required
                />
                <select
                  value={currencyCode}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer dark:[color-scheme:dark]"
                >
                  <option value="USD" className="dark:bg-slate-900">{t('purchases.usdOption', 'USD ($ - US Dollar)')}</option>
                  <option value="KHR" className="dark:bg-slate-900">{t('purchases.khrOption', 'KHR - Khmer Riel')}</option>
                </select>
              </div>

              {/* 7. Exchange Rate */}
              <div>
                <FieldLabel
                  label={t('purchases.exchangeRate', 'Exchange Rate')}
                />
                <input
                  type="number"
                  value={currencyCode === 'KHR' ? '1' : exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  disabled={currencyCode === 'KHR'}
                  min="0.000001"
                  step="any"
                  className="form-input w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 font-mono font-medium disabled:opacity-60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* 8. Shipping Cost */}
              <div>
                <FieldLabel
                  label={`${t('purchases.shippingCost', 'Shipping Cost')} (${currencyCode})`}
                />
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  min="0"
                  step="any"
                  className="form-input w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 font-mono font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Product Catalog Search & Item Table */}
          <div
            id="items"
            data-field="items"
            className={`bg-card dark:bg-slate-900 rounded-2xl border ${
              formErrors?.items ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-border/80 dark:border-slate-800'
            } p-5 sm:p-6 shadow-xs space-y-5`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-border/60 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-foreground dark:text-slate-100 flex items-center gap-2">
                  <span>{t('purchases.orderItems', 'Order Items')}</span>
                  {totalItemsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {totalItemsCount} {totalItemsCount === 1 ? t('purchases.item', 'item') : t('purchases.items', 'items')} ({totalUnitsCount} {t('purchases.units', 'units')})
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('purchases.orderItemsDesc', 'Search and select items from product catalog to add to purchase order')}
                </p>
                <FieldError error={formErrors?.items} />
              </div>
            </div>

            {/* Standard Clean Product Dropdown */}
            <div className="space-y-1.5">
              <FieldLabel
                label={t('purchases.searchAndAddProduct', 'Search & Add Product')}
              />
              <select
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value
                  if (selectedId) {
                    const item = filteredProducts.find(
                      (p: any) => String(p.id) === selectedId
                    )
                    if (item) {
                      addProductToForm(item)
                    }
                  }
                }}
                className="w-full h-11 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer dark:[color-scheme:dark] shadow-2xs"
              >
                <option value="" className="dark:bg-slate-900">
                  {t('purchases.clickToSearchCatalog', '-- Select or search catalog items... --')}
                </option>
                {filteredProducts.map((item: any) => (
                  <option key={item.id} value={String(item.id)} className="dark:bg-slate-900">
                    {item.name} {item.sku ? `(SKU: ${item.sku})` : ''} {item.barcode ? `[${item.barcode}]` : ''} — ${Number(item.cost_price || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Items Table */}
            <div className="border border-border/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs bg-card dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 dark:bg-slate-800/50 border-b border-border/70 dark:border-slate-800 text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[180px]">{t('purchases.product', 'Product')}</th>
                    <th className="py-3 px-2 text-center w-28">{t('purchases.quantity', 'Quantity')}</th>
                    <th className="py-3 px-2 text-center w-28">{t('purchases.unitCost', 'Unit Cost')} ({currencyCode})</th>
                    <th className="py-3 px-2 text-center w-20">{t('purchases.disc', 'Disc %')}</th>
                    <th className="py-3 px-2 text-center w-20">{t('purchases.taxPercent', 'Tax %')}</th>
                    <th className="py-3 px-4 text-right w-28">{t('purchases.total', 'Total')}</th>
                    <th className="py-3 px-2 text-center w-12">{t('common.action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 dark:divide-slate-800">
                  {formItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground dark:text-slate-400">
                        <p className="text-xs font-semibold text-foreground dark:text-slate-200">
                          {t('purchases.noProductsAdded', 'No products added yet.')}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {t('purchases.searchToAddHint', 'Use the search bar above to add products to this purchase order.')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    formItems.map((item, idx) => {
                      const qty = parseFloat(item.quantity) || 0
                      const cost = parseFloat(item.unit_cost) || 0
                      const disc = (qty * cost) * ((parseFloat(item.discount_percent) || 0) / 100)
                      const tax = ((qty * cost) - disc) * ((parseFloat(item.tax_percent) || 0) / 100)
                      const lineTotal = (qty * cost) - disc + tax

                      return (
                        <tr key={idx} className="hover:bg-muted/20 dark:hover:bg-slate-800/30 transition-colors">
                          {/* Product Name & SKU */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-foreground dark:text-slate-100 text-xs sm:text-[13px] block leading-tight">
                              {item.product_name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.sku && (
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/40 dark:border-slate-700">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-[11px] text-muted-foreground dark:text-slate-400 italic truncate max-w-[150px]">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Quantity Stepper */}
                          <td className="py-3 px-2 text-center">
                            <div className="inline-flex items-center justify-center border border-border/70 dark:border-slate-700 rounded-lg bg-background dark:bg-slate-900 overflow-hidden shadow-2xs h-8">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = parseFloat(item.quantity) || 1
                                  if (current > 1) {
                                    updateFormItem(idx, 'quantity', (current - 1).toString())
                                  } else {
                                    removeFormItem(idx)
                                  }
                                }}
                                className="w-7 h-full flex items-center justify-center hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                                title={t('common.decrease', 'Decrease')}
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                step="any"
                                value={item.quantity}
                                onChange={e => updateFormItem(idx, 'quantity', e.target.value)}
                                className="w-10 h-full text-center text-xs font-bold font-mono bg-transparent border-0 focus:ring-0 p-0 text-foreground dark:text-slate-100"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const current = parseFloat(item.quantity) || 1
                                  updateFormItem(idx, 'quantity', (current + 1).toString())
                                }}
                                className="w-7 h-full flex items-center justify-center hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                                title={t('common.increase', 'Increase')}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Unit Cost */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unit_cost}
                              onChange={e => updateFormItem(idx, 'unit_cost', e.target.value)}
                              className="w-24 h-8 px-2 text-center text-xs font-mono font-medium rounded-lg border border-border/70 dark:border-slate-700 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mx-auto block"
                            />
                          </td>

                          {/* Discount % */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.discount_percent}
                              onChange={e => updateFormItem(idx, 'discount_percent', e.target.value)}
                              className="w-16 h-8 px-1.5 text-center text-xs font-mono rounded-lg border border-border/70 dark:border-slate-700 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mx-auto block"
                            />
                          </td>

                          {/* Tax % */}
                          <td className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.tax_percent}
                              onChange={e => updateFormItem(idx, 'tax_percent', e.target.value)}
                              className="w-16 h-8 px-1.5 text-center text-xs font-mono rounded-lg border border-border/70 dark:border-slate-700 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mx-auto block"
                            />
                          </td>

                          {/* Total */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground dark:text-slate-100 text-xs sm:text-[13px]">
                            {formatCurrency(lineTotal, currencyCode)}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeFormItem(idx)}
                              className="p-1.5 text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title={t('common.delete', 'Delete')}
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
                {/* Table Footer Summary Bar */}
                {formItems.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/30 dark:bg-slate-800/40 border-t border-border/70 dark:border-slate-800 text-xs font-medium">
                      <td className="py-2.5 px-4 text-muted-foreground dark:text-slate-400" colSpan={2}>
                        <span className="font-bold text-foreground dark:text-slate-100">{totalItemsCount}</span> {totalItemsCount === 1 ? t('purchases.item', 'item') : t('purchases.items', 'items')} ({totalUnitsCount} {t('purchases.units', 'units')})
                      </td>
                      <td colSpan={3}></td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-foreground dark:text-slate-100 text-xs sm:text-[13px]">
                        {formatCurrency(totals.subtotal, currencyCode)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Card 3: Notes & Purchasing Terms */}
          <div className="bg-card dark:bg-slate-900 rounded-2xl border border-border/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="pb-2.5 border-b border-border/60 dark:border-slate-800">
              <h4 className="text-xs font-bold text-foreground dark:text-slate-100">
                {t('purchases.notes', 'Notes & Purchasing Terms')}
              </h4>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder={t('purchases.notesPlaceholder', 'Enter purchasing terms, special notes, delivery instructions...')}
              className="form-input w-full text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900 p-3 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground dark:text-slate-100"
            />
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Sticky Summary & Operational Workflow (4 / 12) ─── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Grand Financial Summary Card */}
            <div className="bg-gradient-to-br from-card via-card to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10 rounded-2xl border border-primary/20 dark:border-primary/30 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 dark:border-slate-800">
                <h4 className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider">
                  {t('purchases.financialSummary', 'Financial Summary')}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                  {currencyCode}
                </span>
              </div>

              {/* Big Grand Total Display */}
              <div className="space-y-1 py-1">
                <span className="text-[11px] font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider block">
                  {t('purchases.grandTotal', 'Grand Total')}
                </span>
                <div className="text-3xl font-black text-primary font-mono tracking-tight">
                  {formatCurrency(grandTotalUSD, 'USD')}
                </div>
                {currencyCode === 'USD' && (
                  <div className="text-xs font-mono font-medium text-muted-foreground dark:text-slate-400">
                    ≈ {formatCurrency(grandTotalKHR, 'KHR')}
                  </div>
                )}
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-border/60 dark:border-slate-800 text-xs sm:text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground dark:text-slate-400">{t('purchases.subtotal', 'Subtotal')}</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-100">
                    {formatCurrency(getDualValues(totals.subtotal, currencyCode, exchangeRate).usd, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-rose-500">
                  <span>{t('purchases.discount', 'Discount')}</span>
                  <span className="font-mono font-bold">
                    - {formatCurrency(getDualValues(totals.discount_amount, currencyCode, exchangeRate).usd, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground dark:text-slate-400">{t('purchases.tax', 'Tax')}</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-100">
                    {formatCurrency(getDualValues(totals.tax_amount, currencyCode, exchangeRate).usd, 'USD')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground dark:text-slate-400">{t('purchases.shippingCost', 'Shipping Cost')}</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-100">
                    {formatCurrency(getDualValues(parseFloat(shippingCost) || 0, currencyCode, exchangeRate).usd, 'USD')}
                  </span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 dark:border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-slate-800/50 border border-border/40 dark:border-slate-700/60">
                  <span className="text-[10px] text-muted-foreground dark:text-slate-400 block">{t('purchases.totalItems', 'Total Items')}</span>
                  <span className="font-mono font-bold text-sm text-foreground dark:text-slate-100">{totalItemsCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-slate-800/50 border border-border/40 dark:border-slate-700/60">
                  <span className="text-[10px] text-muted-foreground dark:text-slate-400 block">{t('purchases.totalUnits', 'Total Units')}</span>
                  <span className="font-mono font-bold text-sm text-primary">{totalUnitsCount}</span>
                </div>
              </div>
            </div>

            {/* Destination & Supplier Quick Glance Card */}
            {(selectedSupplierObj || selectedWarehouseObj || selectedBranchObj) && (
              <div className="bg-card dark:bg-slate-900 rounded-2xl border border-border/80 dark:border-slate-800 p-5 shadow-xs space-y-3.5">
                <div className="text-xs font-bold text-foreground dark:text-slate-100 uppercase tracking-wider border-b border-border/60 dark:border-slate-800 pb-3">
                  <span>{t('purchases.orderDestination', 'Destination & Partner')}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {selectedSupplierObj && (
                    <div>
                      <span className="text-[10px] text-muted-foreground dark:text-slate-400 block">{t('purchases.supplier', 'Supplier')}</span>
                      <span className="font-bold text-foreground dark:text-slate-100">{selectedSupplierObj.name}</span>
                    </div>
                  )}
                  {selectedWarehouseObj && (
                    <div>
                      <span className="text-[10px] text-muted-foreground dark:text-slate-400 block">{t('purchases.warehouse', 'Warehouse')}</span>
                      <span className="font-semibold text-foreground dark:text-slate-100">{selectedWarehouseObj.name}</span>
                    </div>
                  )}
                  {selectedBranchObj && (
                    <div>
                      <span className="text-[10px] text-muted-foreground dark:text-slate-400 block">{t('purchases.branch', 'Branch')}</span>
                      <span className="font-semibold text-foreground dark:text-slate-100">{selectedBranchObj.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Automated Operations Overview */}
            <div className="bg-primary/5 dark:bg-slate-900/60 rounded-2xl border border-primary/20 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                <span>{t('purchases.automatedProcesses', 'Automated Operations')}</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{t('purchases.autoInbound', 'Creates pending inbound shipment on receive')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{t('purchases.autoPayable', 'Calculates supplier accounts payable & due balance')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Global Form Footer ─── */}
      <FormFooter
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        disabled={isSubmitting || formItems.length === 0}
        onCancel={onCancel}
        cancelLabel={t('common.cancel', 'Cancel')}
        submitLabel={isEdit ? t('purchases.updatePO', 'Save Changes') : t('purchases.createPO', 'Create Purchase Order')}
      />
    </form>
  )
}

export default PurchaseFormSection
