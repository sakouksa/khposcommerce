import React from 'react'
import { useTranslation } from 'react-i18next'
import { Layers, RefreshCw, CheckCircle2, Shield, Building2, Truck, CreditCard } from 'lucide-react'
import type { SupplierFormData } from '../types/supplier.types'

interface SupplierBasicInfoSectionProps {
  form: SupplierFormData
  setField: (field: keyof SupplierFormData | string, value: any) => void
  generateAutoCode: () => void
}

export const SupplierBasicInfoSection: React.FC<SupplierBasicInfoSectionProps> = ({
  form,
  setField,
  generateAutoCode,
}) => {
  const { t } = useTranslation(['suppliers', 'common'])

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-border/70">
        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Layers size={18} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">
            {t('suppliers.generalInfo', 'General Information')}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {t('suppliers.generalInfoDesc', 'Basic supplier identifiers, code, tax credentials and status')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Row 1: Supplier Name */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            {t('suppliers.name', 'Supplier / Company Name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder={t('suppliers.namePlaceholder', 'e.g. Pioneer Electronics Co., Ltd.')}
            className="form-input w-full text-sm font-medium rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Row 2: Code & Tax Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-foreground">
                {t('suppliers.code', 'Supplier Code')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateAutoCode}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>{t('common.autoGenerate', 'Auto Generate')}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={form.code}
              onChange={e => setField('code', e.target.value)}
              placeholder="SPL-001"
              className="form-input w-full text-xs font-mono uppercase rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('suppliers.taxNumber', 'Tax ID / NPWP / VAT')}
            </label>
            <input
              type="text"
              value={form.tax_number}
              onChange={e => setField('tax_number', e.target.value)}
              placeholder="01.002.003.4-005.002"
              className="form-input w-full text-xs font-mono rounded-xl border border-border bg-background"
            />
          </div>
        </div>

        {/* Row 3: Supplier Type & Strategic Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('suppliers.supplierType', 'Business / Supplier Type')}
            </label>
            <select
              value={(form as any).supplier_type || 'distributor'}
              onChange={e => setField('supplier_type', e.target.value)}
              className="form-input w-full text-xs rounded-xl border border-border bg-background"
            >
              <option value="distributor">{t('suppliers.distributor', 'Distributor / Wholesaler')}</option>
              <option value="manufacturer">{t('suppliers.manufacturer', 'Direct Manufacturer')}</option>
              <option value="importer">{t('suppliers.importer', 'Authorized Importer')}</option>
              <option value="service">{t('suppliers.serviceProvider', 'Logistics / Service Provider')}</option>
              <option value="other">{t('suppliers.other', 'Other Business Entity')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {t('suppliers.partnerStatus', 'Partner Tier & Priority')}
            </label>
            <select
              value={(form as any).partner_tier || 'regular'}
              onChange={e => setField('partner_tier', e.target.value)}
              className="form-input w-full text-xs rounded-xl border border-border bg-background"
            >
              <option value="topTier">{t('suppliers.topTier', 'Top Tier / Strategic Partner')}</option>
              <option value="regular">{t('suppliers.regular', 'Regular Standard Vendor')}</option>
              <option value="new">{t('suppliers.new', 'New Vendor / Probation')}</option>
            </select>
          </div>
        </div>

        {/* Row 4: Summary / Description */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            {t('suppliers.corporateProfile', 'Company Overview & Summary')}
          </label>
          <textarea
            value={(form as any).description || form.notes || ''}
            onChange={e => setField('description', e.target.value)}
            rows={2}
            placeholder={t('suppliers.summaryPlaceholder', 'Brief overview of vendor capabilities, authorized brands, or primary product categories...')}
            className="form-input w-full text-xs resize-none rounded-xl border border-border bg-background"
          />
        </div>

        {/* Row 5: 4 Interactive Checkbox Badges (Matching Product Form) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* 1: Active Status */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setField('is_active', e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                {t('suppliers.active', 'Active')}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                {t('suppliers.activeDesc', 'Available for purchase orders & inventory')}
              </span>
            </div>
          </label>

          {/* 2: Strategic Partner */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={!!(form as any).is_strategic}
              onChange={e => setField('is_strategic', e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                {t('suppliers.strategicPartner', 'Strategic Partner')}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                {t('suppliers.strategicDesc', 'Priority fulfillment & vendor agreements')}
              </span>
            </div>
          </label>

          {/* 3: Direct Delivery */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={!!(form as any).direct_delivery}
              onChange={e => setField('direct_delivery', e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                {t('suppliers.directDelivery', 'Direct Delivery')}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                {t('suppliers.directDeliveryDesc', 'Delivers directly to store & warehouse')}
              </span>
            </div>
          </label>

          {/* 4: Credit Payment Terms */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={!!(form as any).allow_credit}
              onChange={e => setField('allow_credit', e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                {t('suppliers.creditPayment', 'Credit Terms')}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                {t('suppliers.creditPaymentDesc', 'Supports Net-30/60 post payment')}
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
