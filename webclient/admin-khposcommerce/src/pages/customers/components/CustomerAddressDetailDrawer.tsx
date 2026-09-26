import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Copy, Check,
  Edit2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Image as AntImage } from 'antd'
import { getCustomerAvatarUrl, DEFAULT_AVATAR_IMAGE } from '@/utils/image'
import { 
  DetailDrawer, 
  DetailDrawerHeader, 
  DetailDrawerBody, 
  DetailDrawerFooter,
  ActionButton,
  type CustomerAddress 
} from '@/components/common'

interface CustomerAddressDetailDrawerProps {
  address: CustomerAddress | null
  isOpen: boolean
  onClose: () => void
  onEdit: (addr: CustomerAddress) => void
  onDelete?: (addr: CustomerAddress) => void
}

export const CustomerAddressDetailDrawer: React.FC<CustomerAddressDetailDrawerProps> = ({
  address,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation(['customers', 'common'])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!isOpen || !address) return null

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const renderLabelBadge = (label?: string) => {
    if (!label) return <span className="text-muted-foreground">—</span>
    const norm = (label || '').trim().toLowerCase()
    let labelText = label || t('customers.labelOther', 'Other')

    if (norm === 'home' || norm.startsWith('home')) {
      labelText = t('customers.labelHome', 'Home')
    } else if (norm === 'office' || norm === 'work' || norm === 'hq') {
      labelText = t('customers.labelOffice', 'Office')
    } else if (norm === 'warehouse') {
      labelText = t('customers.labelWarehouse', 'Warehouse')
    } else if (norm === 'store' || norm === 'shop') {
      labelText = t('customers.labelStore', 'Store')
    } else if (norm === 'branch') {
      labelText = t('customers.labelBranch', 'Branch')
    } else if (norm === 'condo' || norm === 'apartment') {
      labelText = norm === 'condo' ? t('customers.labelCondo', 'Condo') : t('customers.labelApartment', 'Apartment')
    } else if (norm === 'villa') {
      labelText = t('customers.labelVilla', 'Villa')
    } else if (norm === 'factory') {
      labelText = t('customers.labelFactory', 'Factory')
    } else if (norm === 'hotel') {
      labelText = t('customers.labelHotel', 'Hotel')
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/60 dark:bg-slate-800 text-foreground dark:text-slate-300 border border-border/70 dark:border-slate-700 whitespace-nowrap">
        {labelText}
      </span>
    )
  }

  const fullAddressString = [
    address.address,
    address.city,
    address.province,
    address.country,
    address.postal_code ? `(${address.postal_code})` : ''
  ].filter(Boolean).join(', ')

  return (
    <DetailDrawer
      isOpen={isOpen && !!address}
      onClose={onClose}
      size="lg"
    >
      <DetailDrawerHeader
        title={t('customers.addressDetails', 'Address Details')}
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            {renderLabelBadge(address.label)}
            {address.is_default ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                {t('customers.defaultAddress', 'Default Address')}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border whitespace-nowrap">
                {t('customers.secondaryAddress', 'Secondary Address')}
              </span>
            )}
          </div>
        }
        badge={
          <span className="text-xs font-mono text-muted-foreground">#{address.id}</span>
        }
        onClose={onClose}
      />

      <DetailDrawerBody>
            {/* Recipient & Customer Card */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('customers.recipientInfo', 'Recipient & Customer Information')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.recipient', 'Recipient Name')}</span>
                  <p className="text-sm font-semibold text-foreground">{address.name || '—'}</p>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.phone', 'Phone Number')}</span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium text-foreground">{address.phone || '—'}</p>
                    {address.phone && (
                      <button
                        onClick={() => copyToClipboard(address.phone, 'phone')}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Copy phone"
                      >
                        {copiedKey === 'phone' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2.5 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground block mb-1.5">{t('customers.customerAccount', 'Customer Account')}</span>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden shadow-2xs">
                        <AntImage
                          src={getCustomerAvatarUrl(address.customer?.photo || address.customer?.avatar, address.customer?.id || address.customer_id || address.customer?.name)}
                          alt={address.customer?.name || 'Customer'}
                          className="w-full h-full object-cover"
                          {...({ wrapperClassName: 'w-full h-full !flex items-center justify-center cursor-pointer' } as any)}
                          preview={{ mask: null }}
                          fallback={DEFAULT_AVATAR_IMAGE}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">
                          {address.customer?.name || (address.customer_id ? `Customer #${address.customer_id}` : '—')}
                        </p>
                        {address.customer?.email && (
                          <span className="text-xs text-muted-foreground font-mono truncate block">{address.customer.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Location Details */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('customers.locationDetails', 'Location & Address Details')}
                </h3>
                <button
                  onClick={() => copyToClipboard(fullAddressString, 'fullAddress')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  {copiedKey === 'fullAddress' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedKey === 'fullAddress' ? t('common.copied', 'Copied') : t('customers.copyAddress', 'Copy Address')}</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.streetAddress', 'Street Address')}</span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{address.address || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-border/50">
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.city', 'City / Khan')}</span>
                    <p className="text-sm font-medium text-foreground">{address.city || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.province', 'Province / State')}</span>
                    <p className="text-sm font-medium text-foreground">{address.province || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-border/50">
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.country', 'Country')}</span>
                    <p className="text-sm font-medium text-foreground">{address.country || 'Cambodia'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block mb-0.5">{t('customers.postalCode', 'Postal Code')}</span>
                    <p className="text-sm font-mono font-medium text-foreground">{address.postal_code || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Timestamps */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-2 pt-1">
              <span className="font-medium">
                {t('customers.recordId', 'ID')}: #{address.id}
              </span>
              {address.created_at && (
                <span className="font-mono">{new Date(address.created_at).toLocaleDateString()}</span>
              )}
            </div>
      </DetailDrawerBody>

      <DetailDrawerFooter
        rightActions={
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              label={t('common.close', 'Close')}
              onClick={onClose}
            />
            <ActionButton
              variant="primary"
              icon={<Edit2 size={15} />}
              label={t('common.edit', 'Edit')}
              onClick={() => {
                onClose()
                onEdit(address)
              }}
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default CustomerAddressDetailDrawer
