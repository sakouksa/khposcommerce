import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { FieldError, getFieldClass } from '@/components/common'
import type { TabType } from '../types/company.types'

interface CompanyFormModalProps {
  isOpen: boolean
  onClose: () => void
  currentTab: TabType
  editingItem: any | null
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  companiesDropdown?: any[]
  branchesDropdown?: any[]
  companyId: number | string
  setCompanyId: (val: number | string) => void
  branchId: number | string
  setBranchId: (val: number | string) => void
  name: string
  setName: (val: string) => void
  code: string
  setCode: (val: string) => void
  slug: string
  setSlug: (val: string) => void
  domain: string
  setDomain: (val: string) => void
  storeType: string
  setStoreType: (val: string) => void
  email: string
  setEmail: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  website: string
  setWebsite: (val: string) => void
  address: string
  setAddress: (val: string) => void
  city: string
  setCity: (val: string) => void
  province: string
  setProvince: (val: string) => void
  country: string
  setCountry: (val: string) => void
  postalCode: string
  setPostalCode: (val: string) => void
  taxNumber: string
  setTaxNumber: (val: string) => void
  currencyCode: string
  setCurrencyCode: (val: string) => void
  timezone: string
  setTimezone: (val: string) => void
  language: string
  setLanguage: (val: string) => void
  picName: string
  setPicName: (val: string) => void
  description: string
  setDescription: (val: string) => void
  isMain: boolean
  setIsMain: (val: boolean) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  formErrors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  editingItem,
  onSubmit,
  isPending,
  companiesDropdown = [],
  branchesDropdown = [],
  companyId,
  setCompanyId,
  branchId,
  setBranchId,
  name,
  setName,
  code,
  setCode,
  slug,
  setSlug,
  domain,
  setDomain,
  storeType,
  setStoreType,
  email,
  setEmail,
  phone,
  setPhone,
  website,
  setWebsite,
  address,
  setAddress,
  city,
  setCity,
  province,
  setProvince,
  country,
  setCountry,
  postalCode,
  setPostalCode,
  taxNumber,
  setTaxNumber,
  currencyCode,
  setCurrencyCode,
  timezone,
  setTimezone,
  language,
  setLanguage,
  picName,
  setPicName,
  description,
  setDescription,
  isMain,
  setIsMain,
  isActive,
  setIsActive,
  formErrors = {},
  onClearError,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editingItem ? `Edit ${currentTab.slice(0, -1)}` : `Create ${currentTab.slice(0, -1)}`}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {['branches', 'stores', 'warehouses'].includes(currentTab) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Parent Company</label>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="input w-full"
                    >
                      {companiesDropdown.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {['stores', 'warehouses'].includes(currentTab) && (
                    <div>
                      <label className="label">Branch</label>
                      <select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="input w-full"
                      >
                        {branchesDropdown.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name <span className="text-rose-500 font-bold">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      onClearError?.('name')
                    }}
                    placeholder="Full Entity Name"
                    className={getFieldClass(formErrors.name, 'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium')}
                  />
                  <FieldError error={formErrors.name} />
                </div>
                {['branches', 'warehouses'].includes(currentTab) ? (
                  <div>
                    <label className="label">Code <span className="text-rose-500 font-bold">*</span></label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        onClearError?.('code')
                      }}
                      placeholder="e.g. HQ-01"
                      className={getFieldClass(formErrors.code, 'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium')}
                    />
                    <FieldError error={formErrors.code} />
                  </div>
                ) : (
                  <div>
                    <label className="label">Slug / Identifier</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="enterprise-hq"
                      className="input w-full"
                    />
                  </div>
                )}
              </div>

              {currentTab === 'stores' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Store Type</label>
                    <select value={storeType} onChange={(e) => setStoreType(e.target.value)} className="input w-full">
                      <option value="hybrid">Hybrid (POS & E-Commerce)</option>
                      <option value="pos">POS Retail Only</option>
                      <option value="online">E-Commerce Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Domain</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="store.enterprise.com"
                      className="input w-full"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'warehouses' && (
                <div>
                  <label className="label">Person In Charge (PIC)</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="PIC Manager Name"
                    className="input w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@enterprise.com"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ''))}
                    placeholder="012 345 678"
                    className="input w-full font-mono"
                  />
                </div>
              </div>

              {currentTab === 'companies' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Tax Number (NPWP)</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="99.999.999.9-999.000"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <input
                      type="text"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      placeholder="USD"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="America/New_York"
                      className="input w-full"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Street Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full location address..."
                  className="input w-full min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label">Province / State</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="State"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="US"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {['branches', 'warehouses'].includes(currentTab) && (
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMain}
                      onChange={(e) => setIsMain(e.target.checked)}
                      className="checkbox h-4 w-4"
                    />
                    <span>Set as Main Primary Location</span>
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="checkbox h-4 w-4"
                  />
                  <span>Active Operational Status</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary text-xs flex items-center gap-1.5">
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CompanyFormModal
