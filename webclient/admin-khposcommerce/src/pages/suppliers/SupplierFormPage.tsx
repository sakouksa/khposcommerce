import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Plus, Trash2
} from 'lucide-react'
import { supplierService } from '@/services/supplierService'
import { useToast } from '@/hooks/useToast'
import {
  FormFooter,
  LoadingSpinner,
  FieldError,
  getFieldClass
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { focusFirstInvalidField } from '@/utils/formValidation'

// Modular Form Components
import { SupplierFormHeader } from './components/SupplierFormHeader'
import { SupplierMediaSection } from './components/SupplierMediaSection'

// Types
import { BLANK_SUPPLIER_FORM, type SupplierFormData, type SupplierContact } from './types/supplier.types'

const SupplierFormPage: React.FC = () => {
  const { t } = useTranslation(['suppliers', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const supplierId = id ? parseInt(id) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Form State
  const [formData, setFormData] = useState<SupplierFormData>(BLANK_SUPPLIER_FORM)
  const [contacts, setContacts] = useState<SupplierContact[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const setFormField = (field: keyof SupplierFormData | string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Fetch supplier data if editing
  const {
    data: supplierDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['supplier-detail', supplierId],
    queryFn: () => (supplierId ? supplierService.show(supplierId) : null),
    enabled: isEdit && !isNaN(supplierId as number),
  })

  useEffect(() => {
    if (supplierDetail) {
      setFormData({
        ...supplierDetail,
        name: supplierDetail.name || '',
        code: supplierDetail.code || '',
        email: supplierDetail.email || '',
        phone: supplierDetail.phone || '',
        fax: supplierDetail.fax || '',
        website: supplierDetail.website || '',
        hotline: supplierDetail.hotline || '',
        support_email: supplierDetail.support_email || '',
        supplier_type: supplierDetail.supplier_type || 'distributor',
        tier: supplierDetail.tier || 'standard',
        address: supplierDetail.address || '',
        city: supplierDetail.city || '',
        province: supplierDetail.province || '',
        country: supplierDetail.country || '',
        postal_code: supplierDetail.postal_code || '',
        tax_number: supplierDetail.tax_number || '',
        bank_name: supplierDetail.bank_name || '',
        bank_account_number: supplierDetail.bank_account_number || '',
        bank_account_name: supplierDetail.bank_account_name || '',
        swift_code: supplierDetail.swift_code || '',
        notes: supplierDetail.notes || '',
        is_active: !!supplierDetail.is_active,
        logo: supplierDetail.logo || '',
      })
      setLogoPreview(supplierDetail.logo || null)
      setContacts(supplierDetail.contacts ? [...supplierDetail.contacts] : [])
    }
  }, [supplierDetail])

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => supplierService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['suppliers-list'] })
      toast.success(t('suppliers.toast.createdSuccess', 'Supplier created successfully.'))
      navigate('/suppliers')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('common.error', 'Failed to save supplier.'))
    },
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => supplierService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['suppliers-list'] })
      qc.invalidateQueries({ queryKey: ['supplier-detail', supplierId] })
      toast.success(t('suppliers.toast.updatedSuccess', 'Supplier updated successfully.'))
      navigate('/suppliers')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('common.error', 'Failed to update supplier.'))
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}

    if (!formData.code.trim()) {
      errors.code = t('suppliers.codeRequired', 'Supplier code is required.')
    }
    if (!formData.name.trim()) {
      errors.name = t('suppliers.nameRequired', 'Supplier name is required.')
    }

    contacts.forEach((c, idx) => {
      if (!c.name.trim()) {
        errors[`contact_${idx}_name`] = t('suppliers.contactNameRequired', 'Contact representative name is required.')
      }
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      ...formData,
      logo: logoPreview ? logoPreview : '',
      contacts: contacts.filter(c => c.name.trim().length > 0),
    }

    if (isEdit && supplierId) {
      updateMutation.mutate({ id: supplierId, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const addContactRow = () => {
    setContacts(prev => [...prev, { name: '', title: '', email: '', phone: '', is_primary: prev.length === 0 }])
  }

  const removeContactRow = (idx: number) => {
    setContacts(prev => prev.filter((_, i) => i !== idx))
    const errorKey = `contact_${idx}_name`
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[errorKey]
        return next
      })
    }
  }

  const updateContactField = (idx: number, field: keyof SupplierContact, value: any) => {
    setContacts(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
    const errorKey = `contact_${idx}_${field}`
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[errorKey]
        return next
      })
    }
  }

  const generateAutoCode = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    setFormField('code', `SPL-${randomSuffix}`)
    if (formErrors.code) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next.code
        return next
      })
    }
  }

  const getPaymentTermLabel = (term?: string) => {
    switch (term) {
      case 'Cash on Delivery':
        return t('suppliers.paymentCod', 'Cash on Delivery (COD)')
      case 'Net 15':
        return t('suppliers.paymentNet15', 'Net 15 Days')
      case 'Net 30':
        return t('suppliers.paymentNet30', 'Net 30 Days')
      case 'Net 60':
        return t('suppliers.paymentNet60', 'Net 60 Days')
      case 'Advance Payment':
        return t('suppliers.paymentAdvance', '100% Advance Payment')
      default:
        return term || t('suppliers.paymentNet30', 'Net 30 Days')
    }
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isEdit && isErrorDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 max-w-xl mx-auto text-center">
        <CustomErrorMessage
          variant="card"
          severity="error"
          code={(detailError as any)?.response?.status || 500}
          title={t('suppliers.loadErrorTitle', 'Unable to Load Supplier')}
          message={(detailError as any)?.response?.data?.message || t('suppliers.loadErrorDesc', 'Failed to retrieve supplier details.')}
          details={(detailError as any)?.response?.data}
          onRetry={() => refetchDetail()}
          action={{
            label: t('common.back', 'Back to Suppliers'),
            onClick: () => navigate('/suppliers'),
          }}
          className="w-full shadow-2xl"
        />
      </div>
    )
  }

  const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Header */}
      <SupplierFormHeader
        isEdit={isEdit}
        supplierId={supplierId}
        supplierDetail={supplierDetail}
      />

      {/* Main Form (2-Column Responsive Layout) */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── LEFT MAIN COLUMN (lg:col-span-8) ─── */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: Core Supplier Profile & General Info */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('suppliers.tabGeneral', 'General Information & Identity')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('suppliers.generalInfoDesc', 'Supplier general identification, code, business type, and tax information')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Supplier Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>
                      {t('suppliers.code', 'Supplier Code')} <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateAutoCode}
                      className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      <span>{t('suppliers.autoGenerate', t('common.autoGenerate', 'Auto Generate'))}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.code ?? ''}
                    onChange={e => setFormField('code', e.target.value)}
                    placeholder={t('suppliers.codePlaceholder', 'SPL-001')}
                    className={getFieldClass(
                      formErrors.code,
                      'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono uppercase rounded-lg border transition-all font-medium'
                    )}
                  />
                  <FieldError error={formErrors.code} />
                </div>

                {/* Supplier Name */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    {t('suppliers.companySupplierName', t('suppliers.name', 'Company / Supplier Name'))} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name ?? ''}
                    onChange={e => setFormField('name', e.target.value)}
                    placeholder={t('suppliers.namePlaceholder', 'e.g. Pioneer Electronics Co., Ltd.')}
                    className={getFieldClass(
                      formErrors.name,
                      'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-all'
                    )}
                  />
                  <FieldError error={formErrors.name} />
                </div>

                {/* Tax Number */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.taxNumberTIN', t('suppliers.taxNumber', 'Tax Identification Number (TIN)'))}
                  </label>
                  <input
                    type="text"
                    value={formData.tax_number ?? ''}
                    onChange={e => setFormField('tax_number', e.target.value)}
                    placeholder={t('suppliers.taxPlaceholder', '01.002.003.4-005.002')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Business / Supplier Type */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.supplierType', 'Supplier Type')}
                  </label>
                  <select
                    value={(formData as any).supplier_type || 'distributor'}
                    onChange={e => setFormField('supplier_type', e.target.value)}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
                  >
                    <option value="distributor" className="dark:bg-slate-900">{t('suppliers.distributor', 'Distributor')}</option>
                    <option value="manufacturer" className="dark:bg-slate-900">{t('suppliers.manufacturer', 'Direct Manufacturer')}</option>
                    <option value="importer" className="dark:bg-slate-900">{t('suppliers.importer', 'Official Importer')}</option>
                    <option value="service" className="dark:bg-slate-900">{t('suppliers.serviceProvider', 'Service / Logistics Provider')}</option>
                    <option value="other" className="dark:bg-slate-900">{t('suppliers.other', 'Other Business Partner')}</option>
                  </select>
                </div>

                {/* Partner Tier */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.partnerTier', t('suppliers.partnerStatus', 'Partner Tier'))}
                  </label>
                  <select
                    value={(formData as any).partner_tier || 'regular'}
                    onChange={e => setFormField('partner_tier', e.target.value)}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
                  >
                    <option value="topTier" className="dark:bg-slate-900">{t('suppliers.topTier', 'Strategic Partner')}</option>
                    <option value="regular" className="dark:bg-slate-900">{t('suppliers.regular', 'Regular Partner')}</option>
                    <option value="new" className="dark:bg-slate-900">{t('suppliers.new', 'New Partner')}</option>
                  </select>
                </div>
              </div>

              {/* Overview / Summary */}
              <div>
                <label className={labelCls}>
                  {t('suppliers.corporateProfile', 'Corporate Profile / Summary')}
                </label>
                <textarea
                  value={(formData as any).description || formData.notes || ''}
                  onChange={e => setFormField('description', e.target.value)}
                  rows={2}
                  placeholder={t('suppliers.summaryPlaceholder', 'Summary of manufacturing capacity, product distribution lines...')}
                  className="w-full p-3 text-xs sm:text-[13px] resize-none rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* CARD 2: Contact Details & Channels */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('suppliers.tabContact', 'Contact Details & Website')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('suppliers.contactInfoDesc', 'Company telephone, primary email, fax, and customer service lines')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary Email */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.primaryEmail', t('suppliers.email', 'Primary Email'))}
                  </label>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={e => setFormField('email', e.target.value)}
                    placeholder={t('suppliers.emailPlaceholder', 'sales@supplier.com')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Primary Telephone */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.phone', 'Phone Number')}
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={formData.phone ?? ''}
                    onChange={e => setFormField('phone', e.target.value.replace(/[^\d+ -]/g, ''))}
                    placeholder={t('suppliers.phonePlaceholder', '012 345 678')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Fax Number */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.fax', 'Fax Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.fax ?? ''}
                    onChange={e => setFormField('fax', e.target.value)}
                    placeholder={t('suppliers.faxPlaceholder', '+855 23 888 999')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Website URL */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.website', 'Official Website')}
                  </label>
                  <input
                    type="url"
                    value={(formData as any).website || ''}
                    onChange={e => setFormField('website', e.target.value)}
                    placeholder={t('suppliers.websitePlaceholder', 'https://www.supplier.com')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Hotline */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.hotline', 'Emergency Hotline')}
                  </label>
                  <input
                    type="text"
                    value={(formData as any).hotline || ''}
                    onChange={e => setFormField('hotline', e.target.value)}
                    placeholder={t('suppliers.hotlinePlaceholder', '+855 23 999 000')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Support Email */}
                <div>
                  <label className={labelCls}>
                    {t('suppliers.supportEmail', 'Customer Support Email')}
                  </label>
                  <input
                    type="email"
                    value={(formData as any).support_email || ''}
                    onChange={e => setFormField('support_email', e.target.value)}
                    placeholder={t('suppliers.supportEmailPlaceholder', 'rma@supplier.com')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Location & Dispatch Address */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('suppliers.tabLocation', 'Location & Dispatch Address')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('suppliers.locationDesc', 'Physical address for warehouse dispatch, billing, and freight transport')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    {t('suppliers.streetAddress', t('suppliers.address', 'Street Address / Building'))}
                  </label>
                  <textarea
                    value={formData.address ?? ''}
                    onChange={e => setFormField('address', e.target.value)}
                    rows={2}
                    placeholder={t('suppliers.addressPlaceholder', 'e.g. Building #12, St. 271, Boeung Tumpun, Meanchey...')}
                    className="w-full p-3 text-xs sm:text-[13px] resize-none rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>
                      {t('suppliers.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={formData.city ?? ''}
                      onChange={e => setFormField('city', e.target.value)}
                      placeholder={t('suppliers.cityPlaceholder', 'Phnom Penh')}
                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      {t('suppliers.province', 'State / Province')}
                    </label>
                    <input
                      type="text"
                      value={formData.province ?? ''}
                      onChange={e => setFormField('province', e.target.value)}
                      placeholder={t('suppliers.provincePlaceholder', 'Phnom Penh')}
                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      {t('suppliers.country', 'Country')}
                    </label>
                    <input
                      type="text"
                      value={formData.country ?? ''}
                      onChange={e => setFormField('country', e.target.value)}
                      placeholder={t('suppliers.countryPlaceholder', 'Cambodia')}
                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      {t('suppliers.postalCode', 'Postal Code')}
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code ?? ''}
                      onChange={e => setFormField('postal_code', e.target.value)}
                      placeholder={t('suppliers.postalCodePlaceholder', '12000')}
                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Banking Details & Payment Terms */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('suppliers.tabBanking', 'Banking Details & Financial Settlement')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('suppliers.bankingDesc', 'Beneficiary accounts, settlement currencies, credit limits, and payment schedules')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>
                    {t('suppliers.bankName', 'Bank Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name ?? ''}
                    onChange={e => setFormField('bank_name', e.target.value)}
                    placeholder={t('suppliers.bankNamePlaceholder', 'ABA Bank / Canadia Bank')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.bankAccountNumber', 'Bank Account Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_number ?? ''}
                    onChange={e => setFormField('bank_account_number', e.target.value)}
                    placeholder={t('suppliers.bankAccountPlaceholder', '000 123 456')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.bankAccountName', 'Beneficiary Account Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_name ?? ''}
                    onChange={e => setFormField('bank_account_name', e.target.value)}
                    placeholder={t('suppliers.bankBeneficiaryPlaceholder', 'PT Pioneer Electronics Co., Ltd.')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.swiftCode', 'SWIFT / BIC Code')}
                  </label>
                  <input
                    type="text"
                    value={(formData as any).swift_code || ''}
                    onChange={e => setFormField('swift_code', e.target.value)}
                    placeholder={t('suppliers.swiftPlaceholder', 'ABAAKHPP')}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono uppercase rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.currency', 'Settlement Currency')}
                  </label>
                  <select
                    value={(formData as any).currency_code || (formData as any).currency || 'USD'}
                    onChange={e => {
                      setFormField('currency_code', e.target.value)
                      setFormField('currency', e.target.value)
                    }}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
                  >
                    <option value="USD" className="dark:bg-slate-900">{t('suppliers.currencyUsd', 'USD ($ - US Dollar)')}</option>
                    <option value="KHR" className="dark:bg-slate-900">{t('suppliers.currencyKhr', 'KHR - Khmer Riel')}</option>
                    <option value="CNY" className="dark:bg-slate-900">{t('suppliers.currencyCny', 'CNY (¥ - Chinese Yuan)')}</option>
                    <option value="THB" className="dark:bg-slate-900">{t('suppliers.currencyThb', 'THB (฿ - Thai Baht)')}</option>
                    <option value="VND" className="dark:bg-slate-900">{t('suppliers.currencyVnd', 'VND (₫ - Vietnamese Dong)')}</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.paymentTerms', 'Payment Terms & Credit Schedule')}
                  </label>
                  <select
                    value={(formData as any).payment_terms || 'Net 30'}
                    onChange={e => setFormField('payment_terms', e.target.value)}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
                  >
                    <option value="Cash on Delivery" className="dark:bg-slate-900">{t('suppliers.paymentCod', 'Cash on Delivery (COD)')}</option>
                    <option value="Net 15" className="dark:bg-slate-900">{t('suppliers.paymentNet15', 'Net 15 Days')}</option>
                    <option value="Net 30" className="dark:bg-slate-900">{t('suppliers.paymentNet30', 'Net 30 Days')}</option>
                    <option value="Net 60" className="dark:bg-slate-900">{t('suppliers.paymentNet60', 'Net 60 Days')}</option>
                    <option value="Advance Payment" className="dark:bg-slate-900">{t('suppliers.paymentAdvance', '100% Advance Payment')}</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.creditLimit', 'Credit Limit ($)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(formData as any).credit_limit ?? 0}
                    onChange={e => setFormField('credit_limit', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('suppliers.leadTimeDays', 'Lead Time (Days)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={(formData as any).lead_time_days ?? 3}
                    onChange={e => setFormField('lead_time_days', parseInt(e.target.value) || 0)}
                    placeholder="3"
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* CARD 5: Contact Representatives */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-border/60 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                    {t('suppliers.tabRepresentatives', 'Representatives & Contact Persons')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('suppliers.representativesDesc', 'Sales representatives, account managers, and logistics coordinators')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addContactRow}
                  className="h-8 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus size={14} /> {t('suppliers.addContact', 'Add Contact Person')}
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border/80 dark:border-slate-800 rounded-xl bg-muted/10 dark:bg-slate-800/40">
                  <p className="text-xs font-semibold text-foreground dark:text-slate-200">
                    {t('suppliers.noContactsYet', 'No contact representatives added yet.')}
                  </p>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-0.5 max-w-sm mx-auto">
                    {t('suppliers.noContactsSub', 'Add sales managers or logistics coordinators for easy contact during purchasing.')}
                  </p>
                  <button
                    type="button"
                    onClick={addContactRow}
                    className="mt-3 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Plus size={13} /> {t('suppliers.addContact', 'Add Contact Person')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-muted/20 dark:bg-slate-800/40 border border-border/80 dark:border-slate-700/80 rounded-xl space-y-3 relative hover:border-border dark:hover:border-slate-600 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-mono font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground dark:text-slate-100 truncate max-w-[160px]">
                            {c.name ? c.name : t('suppliers.contactPerson', 'Contact Person')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContactRow(idx)}
                          className="p-1 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                          title={t('common.delete', 'Delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>
                            {t('suppliers.contactName', 'Full Name')} <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            value={c.name ?? ''}
                            onChange={e => updateContactField(idx, 'name', e.target.value)}
                            placeholder={t('suppliers.contactNamePlaceholder', 'e.g. Sok Chenda')}
                            className={getFieldClass(
                              formErrors[`contact_${idx}_name`],
                              'w-full h-9 px-3 py-1.5 text-xs rounded-lg border transition-all font-medium'
                            )}
                          />
                          <FieldError error={formErrors[`contact_${idx}_name`]} />
                        </div>
                        <div>
                          <label className={labelCls}>
                            {t('suppliers.contactTitle', 'Role / Designation')}
                          </label>
                          <input
                            type="text"
                            value={c.title || (c as any).position || ''}
                            onChange={e => updateContactField(idx, 'title', e.target.value)}
                            placeholder={t('suppliers.contactRolePlaceholder', 'Sales Manager')}
                            className="w-full h-9 px-3 py-1.5 text-xs rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            {t('suppliers.email', 'Email Address')}
                          </label>
                          <input
                            type="email"
                            value={c.email || ''}
                            onChange={e => updateContactField(idx, 'email', e.target.value)}
                            placeholder={t('suppliers.emailPlaceholder', 'sales@example.com')}
                            className="w-full h-9 px-3 py-1.5 text-xs rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            {t('suppliers.phone', 'Phone Number')}
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            value={c.phone || ''}
                            onChange={e => updateContactField(idx, 'phone', e.target.value.replace(/[^\d+ -]/g, ''))}
                            placeholder={t('suppliers.phonePlaceholder', '012 345 678')}
                            className="w-full h-9 px-3 py-1.5 text-xs font-mono rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 6: Notes & Agreements */}
            <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="pb-3.5 border-b border-border/60 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-slate-100">
                  {t('suppliers.tabTerms', 'Notes & Supply Agreements')}
                </h3>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('suppliers.notesDesc', 'Supplier agreements, delivery instructions, warranty policies, and internal notes')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    {t('suppliers.notesLabel', t('suppliers.internalNotes', 'Notes & Supply Conditions'))}
                  </label>
                  <textarea
                    value={formData.notes ?? ''}
                    onChange={e => setFormField('notes', e.target.value)}
                    rows={4}
                    placeholder={t('suppliers.notesPlaceholder', 'Enter key supply conditions, settlement schedules, or additional notes...')}
                    className="w-full p-3 text-xs sm:text-[13px] resize-none rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border border-primary/20 space-y-1">
                  <h4 className="text-xs font-bold text-foreground dark:text-slate-100">
                    {t('suppliers.procurementPartner', 'Procurement System & Supply Chain Integration')}
                  </h4>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-300 leading-relaxed">
                    {t('suppliers.guidelineText', 'This supplier information will be directly used in purchase orders (PO), goods received notes (GRN), and disbursements.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR (lg:col-span-4 sticky top-6) ─── */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            {/* Supplier Logo & Media Section */}
            <SupplierMediaSection
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
              dragActive={dragActive}
              setDragActive={setDragActive}
              supplierName={formData.name}
              onLogoChange={(val) => setFormField('logo', val)}
            />

            {/* SIDEBAR CARD 1: Status & Operational Flags */}
            <div className="p-6 rounded-2xl bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-border/60 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-foreground dark:text-slate-100">
                    {t('suppliers.statusAndFlags', 'Status & Badges')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('suppliers.operationalStatus', 'Account availability')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormField('is_active', !formData.is_active)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    formData.is_active
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs'
                      : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 border border-border dark:border-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${formData.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  {formData.is_active ? t('suppliers.active', 'Active') : t('suppliers.inactive', 'Inactive')}
                </button>
              </div>

              {/* Operational Checkbox Badges */}
              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-slate-700 bg-muted/15 dark:bg-slate-800/40 hover:bg-muted/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormField('is_active', e.target.checked)}
                    className="mt-0.5 rounded border-border dark:border-slate-700 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground dark:text-slate-100 block">
                      {t('suppliers.activeInDirectory', t('suppliers.active', 'Active in Directory'))}
                    </span>
                    <span className="text-[11px] text-muted-foreground dark:text-slate-400 leading-tight block">
                      {t('suppliers.activeDesc', 'Enable for purchases and inventory reception')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-slate-700 bg-muted/15 dark:bg-slate-800/40 hover:bg-muted/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!(formData as any).is_strategic}
                    onChange={e => setFormField('is_strategic', e.target.checked)}
                    className="mt-0.5 rounded border-border dark:border-slate-700 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground dark:text-slate-100 block">
                      {t('suppliers.isStrategic', 'Strategic Wholesale')}
                    </span>
                    <span className="text-[11px] text-muted-foreground dark:text-slate-400 leading-tight block">
                      {t('suppliers.strategicDesc', 'High priority procurement partner')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-slate-700 bg-muted/15 dark:bg-slate-800/40 hover:bg-muted/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!(formData as any).direct_delivery}
                    onChange={e => setFormField('direct_delivery', e.target.checked)}
                    className="mt-0.5 rounded border-border dark:border-slate-700 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground dark:text-slate-100 block">
                      {t('suppliers.directDelivery', 'Direct Delivery')}
                    </span>
                    <span className="text-[11px] text-muted-foreground dark:text-slate-400 leading-tight block">
                      {t('suppliers.directDeliveryDesc', 'Direct warehouse freight dispatch')}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-slate-700 bg-muted/15 dark:bg-slate-800/40 hover:bg-muted/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!(formData as any).credit_payment}
                    onChange={e => setFormField('credit_payment', e.target.checked)}
                    className="mt-0.5 rounded border-border dark:border-slate-700 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground dark:text-slate-100 block">
                      {t('suppliers.creditPayment', 'Credit Line Allowed')}
                    </span>
                    <span className="text-[11px] text-muted-foreground dark:text-slate-400 leading-tight block">
                      {t('suppliers.creditPaymentDesc', 'Deferred invoice settlement')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* SIDEBAR CARD 2: Procurement Live Overview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-background border border-border/80 dark:border-slate-800 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 dark:border-slate-800">
                <h4 className="text-xs font-bold text-foreground dark:text-slate-200 uppercase tracking-wider">
                  {t('suppliers.procurementSummary', 'Live Overview')}
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {formData.code || 'SPL-001'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{t('suppliers.currency', 'Currency')}:</span>
                  <span className="font-semibold text-foreground dark:text-slate-200 font-mono">
                    {(formData as any).currency_code || (formData as any).currency || 'USD'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{t('suppliers.paymentTermsLabel', t('suppliers.paymentTerms', 'Payment Terms'))}:</span>
                  <span className="font-semibold text-foreground dark:text-slate-200">
                    {getPaymentTermLabel((formData as any).payment_terms || 'Net 30')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{t('suppliers.creditLimitLabel', t('suppliers.creditLimit', 'Credit Limit'))}:</span>
                  <span className="font-semibold text-foreground dark:text-slate-200 font-mono">
                    {((formData as any).currency_code === 'KHR' || (formData as any).currency === 'KHR') ? '៛' : '$'}{Number((formData as any).credit_limit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{t('suppliers.leadTimeLabel', t('suppliers.leadTimeDays', 'Lead Time'))}:</span>
                  <span className="font-semibold text-foreground dark:text-slate-200">
                    {(formData as any).lead_time_days || 3} {t('suppliers.days', 'Days')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">{t('suppliers.contactsCount', 'Contacts')}:</span>
                  <span className="font-semibold text-foreground dark:text-slate-200">
                    {contacts.length} {t('suppliers.persons', 'Person(s)')}
                  </span>
                </div>
              </div>
            </div>

            {/* SIDEBAR CARD 3: Enterprise Guidelines */}
            <div className="p-5 rounded-2xl bg-muted/20 dark:bg-slate-900 border border-border/70 dark:border-slate-800 space-y-3 shadow-2xs">
              <div className="pb-1 border-b border-border/60 dark:border-slate-800">
                <h4 className="text-xs font-bold text-foreground dark:text-slate-200 uppercase tracking-wider">
                  {t('suppliers.vendorGuidelines', 'Enterprise Vendor Guidelines')}
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed list-disc list-inside">
                <li>{t('suppliers.guide1', 'Ensure supplier code is unique and matches warehouse naming standard.')}</li>
                <li>{t('suppliers.guide2', 'Tax Number (TIN) is strictly required for official VAT expense deduction.')}</li>
                <li>{t('suppliers.guide3', 'Credit Limit and Lead Time will be used in PO replenishment calculations.')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global Sticky Form Footer */}
        <FormFooter
          cancelPath="/suppliers"
          cancelLabel={t('common.cancel', 'Cancel')}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? t('suppliers.saveChanges', 'Save Changes') : t('suppliers.saveSupplier', t('suppliers.addSupplier', 'Create Supplier'))}
        />
      </form>
    </div>
  )
}

export default SupplierFormPage
