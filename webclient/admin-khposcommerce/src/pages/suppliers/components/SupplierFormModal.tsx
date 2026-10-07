import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Truck, Building, Mail, CreditCard, User, FileText, Upload } from 'lucide-react'
import { EnterpriseModal, ModalFooter, FieldError, getFieldClass, SupplierLogo } from '@/components/common'
import type { Supplier, SupplierFormData, SupplierContact } from '../types/supplier.types'

interface SupplierFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingSupplier: Supplier | null
  formData: SupplierFormData
  setFormField: (field: keyof SupplierFormData, value: any) => void
  contacts: SupplierContact[]
  setContacts: React.Dispatch<React.SetStateAction<SupplierContact[]>>
  isSubmitting: boolean
  formErrors?: Record<string, string>
  onSubmit: (e: React.FormEvent) => void
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  editingSupplier,
  formData,
  setFormField,
  contacts,
  setContacts,
  isSubmitting,
  formErrors = {},
  onSubmit,
}) => {
  const { t } = useTranslation(['suppliers', 'common'])
  const modalFileInputRef = useRef<HTMLInputElement>(null)

  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        setFormField('logo', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addContactRow = () => {
    setContacts(prev => [...prev, { name: '', title: '', email: '', phone: '', is_primary: prev.length === 0 }])
  }

  const removeContactRow = (idx: number) => {
    setContacts(prev => prev.filter((_, i) => i !== idx))
  }

  const updateContactField = (idx: number, field: keyof SupplierContact, value: any) => {
    setContacts(prev => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      icon={<Truck size={18} />}
      iconVariant="emerald"
      title={editingSupplier ? t('suppliers.editSupplier', 'Edit Supplier') : t('suppliers.addSupplier', 'Create New Supplier')}
      subtitle={
        editingSupplier
          ? t('suppliers.editSubtitle', 'Update supplier profile and credentials')
          : t('suppliers.createSubtitle', 'Fill in the information to register a new vendor')
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={(e) => {
            if (e) onSubmit(e)
            else onSubmit({ preventDefault: () => {} } as any)
          }}
          isSubmitting={isSubmitting}
          submitLabel={editingSupplier ? t('common.saveChanges', 'Save Changes') : t('suppliers.saveSupplier', 'Create Supplier')}
        />
      }
    >
      <form onSubmit={onSubmit} id="supplier-modal-form" className="p-5 sm:p-6 space-y-5 text-xs">
        {/* Section 1: Basic Information */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-2xl space-y-3.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Building size={13} className="text-primary" />
            {t('suppliers.basicInfo', 'Basic Information')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                {t('suppliers.code', 'Supplier Code')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                value={formData.code}
                onChange={e => setFormField('code', e.target.value)}
                placeholder="SPL-001"
                className={getFieldClass(formErrors.code, 'form-input text-xs w-full font-mono uppercase rounded-xl border transition-all')}
              />
              <FieldError error={formErrors.code} />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                {t('suppliers.name', 'Supplier / Company Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                value={formData.name}
                onChange={e => setFormField('name', e.target.value)}
                placeholder="e.g. Pioneer Electronics"
                className={getFieldClass(formErrors.name, 'form-input text-xs w-full font-medium rounded-xl border transition-all')}
              />
              <FieldError error={formErrors.name} />
            </div>

            {/* Logo Preview & Upload */}
            <div className="sm:col-span-2 pt-2 border-t border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <SupplierLogo
                  logo={formData.logo}
                  name={formData.name}
                  size="sm"
                  className="rounded-xl shadow-xs"
                />
                <div>
                  <span className="text-xs font-semibold text-foreground block leading-tight">
                    {t('suppliers.logo', 'Logo / Insignia')}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {formData.logo ? t('suppliers.customApplied', 'Custom logo applied') : t('suppliers.defaultLogoNoticeShort', 'Default logo is used')}
                  </span>
                </div>
              </div>

              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleModalFileUpload}
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  <Upload size={11} />
                  <span>{formData.logo ? t('common.change', 'Change') : t('common.upload', 'Upload')}</span>
                </button>
                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormField('logo', '')
                      if (modalFileInputRef.current) modalFileInputRef.current.value = ''
                    }}
                    className="px-2 py-1 text-[11px] text-red-500 hover:underline cursor-pointer"
                  >
                    {t('common.reset', 'Reset')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-2xl space-y-3.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Mail size={13} className="text-blue-500" />
            {t('suppliers.contactInfo', 'Contact & Location')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.email', 'Email Address')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormField('email', e.target.value)}
                placeholder="sales@supplier.com"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.phone', 'Phone Number')}</label>
              <input
                type="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={e => setFormField('phone', e.target.value.replace(/[^\d+ -]/g, ''))}
                placeholder="012 345 678"
                className="form-input text-xs w-full font-mono rounded-xl border border-border bg-card text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.fax', 'Fax Number')}</label>
              <input
                value={formData.fax}
                onChange={e => setFormField('fax', e.target.value)}
                placeholder="+855 23 888 999"
                className="form-input text-xs w-full font-mono rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.taxNumber', 'Tax ID / NPWP')}</label>
              <input
                value={formData.tax_number}
                onChange={e => setFormField('tax_number', e.target.value)}
                placeholder="01.002.003.4-005.002"
                className="form-input text-xs w-full font-mono rounded-xl border border-border bg-card text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.address', 'Street Address')}</label>
            <textarea
              value={formData.address}
              onChange={e => setFormField('address', e.target.value)}
              rows={2}
              placeholder="Building #12, Street 271, Sangkat Boeung Tumpun..."
              className="form-input text-xs w-full resize-none rounded-xl border border-border bg-card text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.city', 'City')}</label>
              <input
                value={formData.city}
                onChange={e => setFormField('city', e.target.value)}
                placeholder="Phnom Penh"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.province', 'Province / State')}</label>
              <input
                value={formData.province}
                onChange={e => setFormField('province', e.target.value)}
                placeholder="Phnom Penh"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.country', 'Country')}</label>
              <input
                value={formData.country}
                onChange={e => setFormField('country', e.target.value)}
                placeholder="Cambodia"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Banking Info */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-2xl space-y-3.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
            <CreditCard size={13} className="text-purple-500" />
            {t('suppliers.bankingAndTax', 'Banking & Tax Details')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.bankName', 'Bank Name')}</label>
              <input
                value={formData.bank_name}
                onChange={e => setFormField('bank_name', e.target.value)}
                placeholder="ABA Bank / Canadia"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.bankAccountNumber', 'Account Number')}</label>
              <input
                value={formData.bank_account_number}
                onChange={e => setFormField('bank_account_number', e.target.value)}
                placeholder="000 123 456"
                className="form-input text-xs w-full font-mono rounded-xl border border-border bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1.5">{t('suppliers.bankAccountName', 'Beneficiary Name')}</label>
              <input
                value={formData.bank_account_name}
                onChange={e => setFormField('bank_account_name', e.target.value)}
                placeholder="Pioneer Co., Ltd"
                className="form-input text-xs w-full rounded-xl border border-border bg-card text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Key Representatives */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-2xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
              <User size={13} className="text-emerald-500" />
              {t('suppliers.tabRepresentatives', 'Key Representatives')} ({contacts.length})
            </span>
            <button
              type="button"
              onClick={addContactRow}
              className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>{t('suppliers.addContact', 'Add Contact')}</span>
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-5 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
              {t('suppliers.noContacts', 'No representatives added yet.')}
            </div>
          ) : (
            contacts.map((c, idx) => (
              <div key={idx} className="p-3 bg-card border border-border rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-2">
                    <span>Contact #{idx + 1}</span>
                    {c.is_primary && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {t('common.primary', 'Primary')}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {!c.is_primary && (
                      <button
                        type="button"
                        onClick={() => {
                          setContacts(prev => prev.map((item, i) => ({ ...item, is_primary: i === idx })))
                        }}
                        className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeContactRow(idx)}
                      className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold mb-1 block">
                      {t('suppliers.contactName', 'Full Name')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={c.name}
                      onChange={e => updateContactField(idx, 'name', e.target.value)}
                      placeholder="e.g. Sok Dara"
                      className="form-input text-xs w-full rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold mb-1 block">
                      {t('suppliers.contactTitle', 'Role / Position')}
                    </label>
                    <input
                      value={c.title || c.position || ''}
                      onChange={e => updateContactField(idx, 'title', e.target.value)}
                      placeholder="Key Account Manager"
                      className="form-input text-xs w-full rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold mb-1 block">
                      {t('suppliers.email', 'Email')}
                    </label>
                    <input
                      type="email"
                      value={c.email || ''}
                      onChange={e => updateContactField(idx, 'email', e.target.value)}
                      placeholder="contact@supplier.com"
                      className="form-input text-xs w-full rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold mb-1 block">
                      {t('suppliers.phone', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={c.phone || ''}
                      onChange={e => updateContactField(idx, 'phone', e.target.value.replace(/[^\d+ -]/g, ''))}
                      placeholder="012 345 678"
                      className="form-input text-xs w-full font-mono rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section 5: Notes */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-2xl space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
            <FileText size={13} className="text-amber-500" />
            {t('suppliers.notes', 'Notes & Logistics Terms')}
          </span>
          <textarea
            value={formData.notes}
            onChange={e => setFormField('notes', e.target.value)}
            rows={2}
            placeholder={t('suppliers.notesPlaceholder', 'Enter key vendor terms, payment schedules, or remarks...')}
            className="form-input text-xs w-full resize-none rounded-xl border border-border bg-card text-foreground"
          />
        </div>

        {/* Status Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border">
          <div>
            <span className="font-bold text-foreground block">{t('suppliers.status', 'Supplier Status')}</span>
            <span className="text-[11px] text-muted-foreground">{t('suppliers.statusDesc', 'Toggle supplier active state in procurement and POS')}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormField('is_active', !formData.is_active)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              formData.is_active
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            {formData.is_active ? t('suppliers.active', 'Active') : t('suppliers.inactive', 'Inactive')}
          </button>
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default SupplierFormModal
