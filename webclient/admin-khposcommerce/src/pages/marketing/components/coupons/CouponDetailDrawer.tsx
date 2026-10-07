import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Printer,
  Barcode,
  QrCode,
  Store,
  Globe,
  Layers,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { CloseButton, ActionButton } from '@/components/common'
import type { Coupon } from '../../types/coupon'

interface CouponDetailDrawerProps {
  coupon: Coupon | null
  onClose: () => void
  handleDuplicate: (coupon: Coupon) => void
  openEditModal: (coupon: Coupon) => void
  onOpenVerifier?: (coupon: Coupon) => void
}

export const CouponDetailDrawer: React.FC<CouponDetailDrawerProps> = ({
  coupon,
  onClose,
  handleDuplicate,
  openEditModal,
  onOpenVerifier,
}) => {
  const toast = useToast()
  if (!coupon) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code)
    toast.success(`Copied code "${coupon.code}" to clipboard!`)
  }

  const handlePrintSlip = () => {
    window.print()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 z-50 flex justify-end print:static print:bg-transparent">
        <div className="absolute inset-0 print:hidden" onClick={onClose} />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="bg-card w-full max-w-xl h-full shadow-2xl relative z-10 p-6 flex flex-col justify-between overflow-y-auto print:static print:w-full print:p-0 print:shadow-none"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="text-lg font-bold text-foreground">
                Voucher Campaign Details
              </h3>
              <CloseButton onClose={onClose} size="md" color="rose" />
            </div>

            {/* Profile Voucher Header Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-purple-500/10 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>{coupon.type?.replace('_', ' ')}</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    coupon.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}
                >
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-foreground">{coupon.name}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-primary bg-card/90 px-3 py-1 rounded-xl border border-primary/30 tracking-widest shadow-2xs">
                    {coupon.code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Barcode & QR Code Visual Box */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3 text-center shadow-xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                POS Scannable Code & QR
              </p>
              <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border flex flex-col items-center justify-center space-y-2">
                <div className="font-mono text-2xl tracking-[0.3em] font-black py-1 text-foreground">
                  ||||| | |||| || ||||| |||
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground">{coupon.code}</span>
              </div>
            </div>

            {/* Scope & Restrictions Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-1">
                Omni-Channel & Rule Restrictions
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Channel Scope</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {coupon.channel_scope === 'pos_only'
                      ? '🔵 POS Cashier Only'
                      : coupon.channel_scope === 'storefront_only'
                      ? '🟣 Online Storefront Only'
                      : '🟢 Omni-Channel (Both)'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Min Spend Required</p>
                  <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                    ${coupon.minimum_amount || 0}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Total Redemptions</p>
                  <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                    {coupon.used_count || 0} / {coupon.usage_limit || 'Unlimited'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[11px] text-muted-foreground font-semibold">Expiry Date</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never Expires'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
              <ActionButton
                variant="soft"
                size="sm"
                icon={<Barcode size={14} />}
                label="POS Scan Test"
                onClick={() => {
                  onClose()
                  onOpenVerifier && onOpenVerifier(coupon)
                }}
              />

              <ActionButton
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                label="Print Slip"
                onClick={handlePrintSlip}
              />

              <ActionButton
                variant="secondary"
                size="sm"
                label="Close"
                onClick={onClose}
              />

              <ActionButton
                variant="primary"
                size="sm"
                label="Edit Voucher"
                onClick={() => {
                  onClose()
                  openEditModal(coupon)
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CouponDetailDrawer
