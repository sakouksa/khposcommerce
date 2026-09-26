import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Store,
  CreditCard,
  Barcode,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import type { Coupon, VoucherVerificationResult } from '../../types/coupon'

interface VoucherVerifierModalProps {
  isOpen: boolean
  onClose: () => void
  coupons: Coupon[]
  initialCoupon?: Coupon | null
}

export const VoucherVerifierModal: React.FC<VoucherVerifierModalProps> = ({
  isOpen,
  onClose,
  coupons = [],
  initialCoupon,
}) => {
  const toast = useToast()

  const [inputCode, setInputCode] = useState(initialCoupon?.code || '')
  const [testSubtotal, setTestSubtotal] = useState('45.00')
  const [testChannel, setTestChannel] = useState<'pos' | 'storefront'>('pos')
  const [testPayment, setTestPayment] = useState<string>('khqr_bakong')
  const [printSlipOpen, setPrintSlipOpen] = useState(false)

  // Evaluation engine
  const verificationResult: VoucherVerificationResult = useMemo(() => {
    const cleanCode = inputCode.trim().toUpperCase()
    if (!cleanCode) {
      return {
        code: '',
        isValid: false,
        status: 'invalid_code',
        discountAmount: 0,
        finalPayable: parseFloat(testSubtotal) || 0,
        reason: 'Please enter or scan a voucher code to verify.',
      }
    }

    const matched = coupons.find(
      (c) => c.code.toUpperCase() === cleanCode || c.barcode?.toUpperCase() === cleanCode
    )

    if (!matched) {
      return {
        code: cleanCode,
        isValid: false,
        status: 'invalid_code',
        discountAmount: 0,
        finalPayable: parseFloat(testSubtotal) || 0,
        reason: `Voucher code "${cleanCode}" was not found in system records.`,
      }
    }

    // Check Active Status
    if (!matched.is_active) {
      return {
        code: cleanCode,
        coupon: matched,
        isValid: false,
        status: 'invalid_code',
        discountAmount: 0,
        finalPayable: parseFloat(testSubtotal) || 0,
        reason: 'This voucher campaign is currently inactive or paused.',
      }
    }

    // Check Expiry
    if (matched.expires_at && new Date(matched.expires_at) < new Date()) {
      return {
        code: cleanCode,
        coupon: matched,
        isValid: false,
        status: 'expired',
        discountAmount: 0,
        finalPayable: parseFloat(testSubtotal) || 0,
        reason: `This voucher expired on ${new Date(matched.expires_at).toLocaleDateString()}.`,
      }
    }

    // Check Usage Limit
    if (matched.usage_limit && (matched.used_count || 0) >= matched.usage_limit) {
      return {
        code: cleanCode,
        coupon: matched,
        isValid: false,
        status: 'limit_reached',
        discountAmount: 0,
        finalPayable: parseFloat(testSubtotal) || 0,
        reason: 'This voucher has reached its maximum total redemptions.',
      }
    }

    // Check Min Spend
    const subtotal = parseFloat(testSubtotal) || 0
    const minAmount = Number(matched.minimum_amount || 0)
    if (minAmount > 0 && subtotal < minAmount) {
      return {
        code: cleanCode,
        coupon: matched,
        isValid: false,
        status: 'min_spend_unmet',
        discountAmount: 0,
        finalPayable: subtotal,
        reason: `Minimum cart spend of $${minAmount.toFixed(2)} required (Current: $${subtotal.toFixed(2)}).`,
      }
    }

    // Calculate Discount
    let discount = 0
    const val = Number(matched.value || 0)
    const maxCap = matched.max_discount_cap ? Number(matched.max_discount_cap) : null
    if (matched.type === 'percentage') {
      discount = (subtotal * val) / 100
      if (maxCap && discount > maxCap) {
        discount = maxCap
      }
    } else if (matched.type === 'fixed') {
      discount = Math.min(subtotal, val)
    } else if (matched.type === 'free_shipping') {
      discount = 2.5
    }

    const finalPayable = Math.max(0, subtotal - discount)

    return {
      code: cleanCode,
      coupon: matched,
      isValid: true,
      status: 'valid',
      discountAmount: discount,
      finalPayable,
      reason: `Successfully matched "${matched.name}"!`,
    }
  }, [inputCode, testSubtotal, testChannel, testPayment, coupons])

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Barcode size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">POS Live Voucher Scanner & Verifier</h3>
                <p className="text-xs text-muted-foreground">
                  Scan barcode / QR code at cashier counter to test redemption & print gift voucher slip.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Scan / Input Box */}
            <div className="space-y-2">
              <label className="label">Scan Barcode / Enter Voucher Code</label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Scan with barcode gun or type code (e.g. WELCOME3, KNYGIFT)..."
                  className="input w-full pl-10 font-mono text-base font-bold uppercase tracking-wider py-3"
                />
                <Barcode size={20} className="absolute left-3 top-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Cart Subtotal ($)</label>
                <input
                  type="number"
                  value={testSubtotal}
                  onChange={(e) => setTestSubtotal(e.target.value)}
                  className="input w-full font-mono text-xs py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">POS Channel</label>
                <select
                  value={testChannel}
                  onChange={(e: any) => setTestChannel(e.target.value)}
                  className="input w-full text-xs py-1.5"
                >
                  <option value="pos">🔵 In-Store POS</option>
                  <option value="storefront">🟣 Web Storefront</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Payment Method</label>
                <select
                  value={testPayment}
                  onChange={(e) => setTestPayment(e.target.value)}
                  className="input w-full text-xs py-1.5"
                >
                  <option value="khqr_bakong">🇰🇭 Bakong KHQR</option>
                  <option value="cash">💵 Cash Counter</option>
                  <option value="aba_pay">ABA PAY</option>
                </select>
              </div>
            </div>

            {/* Verification Result Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                verificationResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {verificationResult.isValid ? (
                  <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle size={28} className="text-rose-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    {verificationResult.isValid ? 'VALID VOUCHER PASS' : 'VOUCHER REJECTED / INVALID'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{verificationResult.reason}</p>
                </div>
              </div>

              {verificationResult.isValid && verificationResult.coupon && (
                <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Original Price</span>
                    <p className="font-mono font-bold text-foreground">${parseFloat(testSubtotal).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-600 font-bold">Discount Applied</span>
                    <p className="font-mono font-extrabold text-emerald-600">
                      -${verificationResult.discountAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Net Payable</span>
                    <p className="font-mono font-extrabold text-primary text-sm">
                      ${verificationResult.finalPayable.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Printable Slip Preview Toggle */}
            {verificationResult.coupon && (
              <div className="p-4 bg-card rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Printer size={14} className="text-primary" />
                    <span>Printable Voucher Slip Preview</span>
                  </span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1"
                  >
                    <Printer size={12} />
                    <span>Print Slip</span>
                  </button>
                </div>

                {/* Voucher Receipt Slip Box */}
                <div className="p-4 bg-muted/40 rounded-xl border border-dashed border-border font-mono text-xs text-center space-y-2 text-foreground">
                  <p className="font-extrabold text-sm uppercase">OptaPOS Retail Store</p>
                  <p className="text-[10px] text-muted-foreground">Phnom Penh, Cambodia • Tel: +855 23 999 888</p>
                  <div className="border-t border-b border-border py-2 my-2 space-y-1">
                    <p className="font-bold text-sm text-primary">{verificationResult.coupon.name}</p>
                    <p className="text-lg font-black tracking-widest text-foreground">
                      {verificationResult.coupon.code}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Value:{' '}
                      {verificationResult.coupon.type === 'percentage'
                        ? `${verificationResult.coupon.value}% OFF`
                        : `$${verificationResult.coupon.value}.00 OFF`}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Valid until: {verificationResult.coupon.expires_at ? new Date(verificationResult.coupon.expires_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Close Verifier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default VoucherVerifierModal
