import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck, CreditCard, Truck, Lock,
  QrCode, Building2, Banknote, Wallet, CheckCircle
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useSettingsStore, useAuthStore } from '@/stores'
import { usePaymentMethods, useShippingMethods, useProvinces } from '@/hooks'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import PageTransition from '@/components/common/PageTransition'
import SEOHead from '@/components/seo/SEOHead'
import { cn } from '@/lib/utils'

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, subtotal, total, coupon_code, reset: resetCart } = useCartStore()
  const { formatPrice } = useSettingsStore()
  const customer = useAuthStore((s) => s.customer)

  // Fetch real payment methods, shipping methods, and provinces from Database API
  const { data: dbPaymentMethods = [], isLoading: loadingPayments } = usePaymentMethods()
  const { data: dbShippingMethods = [], isLoading: loadingShipping } = useShippingMethods()
  const { data: dbProvinces = [] } = useProvinces()

  const [loading, setLoading] = useState(false)
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string>('aba_khqr')
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null)
  const [shippingCost, setShippingCost] = useState<number>(1.50)

  // Form fields
  const [formData, setFormData] = useState({
    shipping_name:     customer?.name || '',
    shipping_phone:    customer?.phone || '',
    shipping_address:  '',
    shipping_city:     'Phnom Penh',
    shipping_country:  'Cambodia',
    customer_notes:    '',
  })

  const [error, setError] = useState<string | null>(null)

  // Auto-select defaults when database methods load
  useEffect(() => {
    if (dbPaymentMethods.length > 0 && !dbPaymentMethods.some((pm) => pm.code === selectedPaymentCode)) {
      setSelectedPaymentCode(dbPaymentMethods[0].code)
    }
  }, [dbPaymentMethods])

  useEffect(() => {
    if (dbShippingMethods.length > 0 && selectedShippingId === null) {
      const first = dbShippingMethods[0]
      setSelectedShippingId(first.id)
      setShippingCost(first.base_price)
    }
  }, [dbShippingMethods, selectedShippingId])

  const handleSelectShipping = (methodId: number, cost: number) => {
    setSelectedShippingId(methodId)
    setShippingCost(cost)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const grandTotal = total + shippingCost

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.shipping_name || !formData.shipping_phone || !formData.shipping_address) {
      setError('Please fill in all required shipping fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/cart/checkout', {
        ...formData,
        coupon_code: coupon_code || null,
        payment_method: selectedPaymentCode,
        shipping_method_id: selectedShippingId,
        shipping_cost: shippingCost,
      })

      resetCart()
      navigate('/checkout/success', { state: { order: data.data } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (type: string, code: string) => {
    if (code.includes('khqr') || type === 'qris') return QrCode
    if (code.includes('card') || type === 'credit_card' || type === 'debit_card') return CreditCard
    if (code.includes('cod') || type === 'cash') return Banknote
    if (type === 'ewallet') return Wallet
    return Building2
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title="Secure Checkout"
        description="Complete your order details and checkout securely."
        canonical="/checkout"
        robots="noindex, nofollow"
      />
      <PageTransition className="container-site py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Checkout
        </h1>
        <p className="text-xs text-gray-500 mt-1">Complete your order details below</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left Column: Shipping & Payment ───────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Shipping Address */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Truck className="w-5 h-5 text-blue-600" /> Shipping Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="shipping_name"
                  required
                  value={formData.shipping_name}
                  onChange={handleChange}
                  placeholder="e.g. Sok Dara"
                  className="input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="shipping_phone"
                  required
                  value={formData.shipping_phone}
                  onChange={handleChange}
                  placeholder="e.g. 012 345 678"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="shipping_address"
                required
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="House No, Street Name, Sangkat, Khan"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  City / Province *
                </label>
                <select name="shipping_city" value={formData.shipping_city} onChange={handleChange} className="input">
                  {dbProvinces.length > 0 ? (
                    dbProvinces.map((prov) => (
                      <option key={prov.id} value={prov.name}>
                        {prov.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Phnom Penh">Phnom Penh</option>
                      <option value="Siem Reap">Siem Reap</option>
                      <option value="Battambang">Battambang</option>
                      <option value="Sihanoukville (Preah Sihanouk)">Sihanoukville</option>
                      <option value="Kampot">Kampot</option>
                      <option value="Kandal">Kandal</option>
                      <option value="Tbong Khmum">Tbong Khmum</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Country
                </label>
                <input type="text" name="shipping_country" readOnly value={formData.shipping_country} className="input bg-gray-50 dark:bg-slate-800" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                name="customer_notes"
                rows={2}
                value={formData.customer_notes}
                onChange={handleChange}
                placeholder="Special delivery instructions, gate code, etc."
                className="input"
              />
            </div>
          </div>

          {/* 2. Dynamic Shipping Methods (From Database) */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">
                Shipping Options
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Nationwide 25 Provinces
              </span>
            </div>

            {loadingShipping ? (
              <div className="py-6 flex justify-center"><Spinner size="sm" /></div>
            ) : dbShippingMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbShippingMethods.map((sm) => {
                  const isSelected = selectedShippingId === sm.id
                  return (
                    <button
                      key={sm.id}
                      type="button"
                      onClick={() => handleSelectShipping(sm.id, sm.base_price)}
                      className={cn(
                        'p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group',
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {sm.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Carrier: {sm.provider}
                        </div>
                      </div>
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-sm flex-shrink-0">
                        {formatPrice(sm.base_price)}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-500">Standard Shipping calculated at checkout.</div>
            )}
          </div>

          {/* 3. Dynamic Payment Gateways (From Database) */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display border-b border-gray-100 dark:border-gray-800 pb-3">
              Payment Gateway
            </h3>

            {loadingPayments ? (
              <div className="py-6 flex justify-center"><Spinner size="sm" /></div>
            ) : dbPaymentMethods.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {dbPaymentMethods.map((pm) => {
                  const isSelected = selectedPaymentCode === pm.code
                  const Icon = getPaymentIcon(pm.type, pm.code)

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentCode(pm.code)}
                      className={cn(
                        'p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative',
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                      )}
                    >
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute top-2 right-2" />
                      )}
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] leading-tight line-clamp-2">{pm.name}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No payment methods available.</div>
            )}

            {/* Dynamic Instruction notice based on selected method */}
            {selectedPaymentCode.includes('khqr') && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  Scan with ABA Mobile, ACLEDA, or any Bakong KHQR App
                </div>
                <p>After clicking Place Order, a dynamic 30-day verified KHQR code will be generated for instant payment.</p>
              </div>
            )}

            {selectedPaymentCode === 'cod' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  Cash on Delivery (COD) Selected
                </div>
                <p>Pay cash directly to the express delivery courier upon receiving and verifying your parcel.</p>
              </div>
            )}
          </div>

        </div>

        {/* ── Right Column: Order Summary ────────────────────────────── */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display border-b border-gray-100 dark:border-gray-800 pb-3">
              Items in Order ({items.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.product?.image || '/placeholder.png'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    <div className="truncate">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</div>
                      <div className="text-gray-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatPrice((item.variant?.selling_price ?? item.product?.selling_price ?? 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-800">
                <span>Grand Total</span>
                <span className="text-blue-600 dark:text-blue-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              {loading ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Processing Order...' : `Place Order • ${formatPrice(grandTotal)}`}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>Buyer Protection: 100% Refund if order is not delivered</span>
          </div>
        </div>

      </form>
    </PageTransition>
    </>
  )
}

export default CheckoutPage
