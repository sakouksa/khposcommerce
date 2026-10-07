import React, { useState } from 'react'
import { X, UserPlus, Phone, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Customer } from '../types/pos.types'

interface POSCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCustomer: (c: Customer) => void
}

export const POSCustomerModal: React.FC<POSCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer,
}) => {
  const { t } = useTranslation(['pos', 'common'])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [group, setGroup] = useState('Retail Member')
  const [address, setAddress] = useState('')
  const [creditLimit, setCreditLimit] = useState('500')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newCust: Customer = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      group,
      loyalty_points: 10,
      address: address.trim() || undefined,
      credit_limit: parseFloat(creditLimit) || 500,
    }

    onAddCustomer(newCust)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">{t('createNewCustomer', 'Create New Customer')}</h3>
              <p className="text-xs text-muted-foreground">{t('registerCustomerDesc', 'Register customer for POS loyalty & invoicing')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customerFullName', 'Customer Full Name *')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-foreground block mb-1">{t('phoneNumber', 'Phone Number')}</label>
              <div className="relative">
                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="form-input text-xs pl-8"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">{t('emailAddress', 'Email Address')}</label>
              <div className="relative">
                <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="form-input text-xs pl-8"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-foreground block mb-1">{t('customerGroup', 'Customer Group')}</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="form-input text-xs cursor-pointer"
              >
                <option value="Retail Member">{t('retailMember', 'Retail Member')}</option>
                <option value="VIP Member">{t('vipTier', 'VIP Tier (10% Off)')}</option>
                <option value="Wholesale Client">{t('wholesaleClient', 'Wholesale Client')}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">{t('creditLimit', 'Credit Limit ($)')}</label>
              <input
                type="number"
                min="0"
                step="50"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="e.g. 500"
                className="form-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">{t('address', 'Billing / Delivery Address')}</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-2.5 top-2 text-muted-foreground" />
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City..."
                className="form-input text-xs pl-8 py-1.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 flex-1"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary py-2.5 flex-1 font-bold"
            >
              {t('saveAndSelectCustomer', 'Save & Select Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
