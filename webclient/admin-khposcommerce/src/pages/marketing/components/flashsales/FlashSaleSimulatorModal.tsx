import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, X, Search, Barcode, Calculator, CheckCircle2, AlertTriangle, ShieldCheck, ShoppingCart, ArrowRight, Store, Globe, RefreshCw
} from 'lucide-react'
import type { FlashSale, FlashSimulationResult } from '../../types/flashSale'

interface FlashSaleSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  activeSales: FlashSale[]
}

export const FlashSaleSimulatorModal: React.FC<FlashSaleSimulatorModalProps> = ({
  isOpen,
  onClose,
  activeSales,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'pos' | 'storefront'>('pos')
  const [orderQuantity, setOrderQuantity] = useState<number>(1)
  const [hasScanned, setHasScanned] = useState(false)

  // Sample items for simulator catalog
  const sampleSimulatorItems = [
    {
      id: 1,
      name: 'Wireless Noise Canceling Earbuds Pro',
      sku: 'AUD-EAR-001',
      barcode: '885002910012',
      regular_price: 59.00,
      stock: 45,
      flash_price: 29.50,
      flash_sale_name: '🌸 Khmer New Year Mega Flash 50% OFF',
      discount_percent: 50,
      quota_total: 50,
      quota_sold: 38,
      per_customer_limit: 2,
      is_in_flash_sale: true,
      flash_status: 'active' as const,
    },
    {
      id: 2,
      name: 'Fast Charging Power Bank 20000mAh',
      sku: 'PWR-BNK-002',
      barcode: '885002910029',
      regular_price: 35.00,
      stock: 80,
      flash_price: 19.99,
      flash_sale_name: '⚡ 11.11 Midnight Madness',
      discount_percent: 43,
      quota_total: 40,
      quota_sold: 24,
      per_customer_limit: 2,
      is_in_flash_sale: true,
      flash_status: 'active' as const,
    },
    {
      id: 3,
      name: 'Mechanical Gaming Keyboard RGB',
      sku: 'ACC-KEY-009',
      barcode: '885002910036',
      regular_price: 89.00,
      stock: 15,
      flash_price: 49.00,
      flash_sale_name: '🏮 Pchum Ben Family Rush',
      discount_percent: 45,
      quota_total: 30,
      quota_sold: 30,
      per_customer_limit: 1,
      is_in_flash_sale: true,
      flash_status: 'sold_out' as const,
    },
    {
      id: 4,
      name: 'Standard USB-C Fast Cable 1.5m',
      sku: 'CAB-USB-004',
      barcode: '885002910043',
      regular_price: 9.99,
      stock: 200,
      is_in_flash_sale: false,
    },
  ]

  const [activeItem, setActiveItem] = useState(sampleSimulatorItems[0])

  const handleSelectProduct = (item: any) => {
    setActiveItem(item)
    setHasScanned(true)
  }

  // Simulation calculation
  const isFlashActive = activeItem.is_in_flash_sale && activeItem.flash_status !== 'sold_out'
  const regularPrice = activeItem.regular_price
  const flashPrice = isFlashActive && activeItem.flash_price ? activeItem.flash_price : regularPrice
  const discountAmount = regularPrice - flashPrice
  const discountPercent = activeItem.discount_percent || 0
  const quotaRemaining = (activeItem.quota_total || 0) - (activeItem.quota_sold || 0)
  const isQuotaAvailable = quotaRemaining > 0
  const customerLimit = activeItem.per_customer_limit || 2
  const isQtyExceeded = orderQuantity > customerLimit

  const regularSubtotal = regularPrice * orderQuantity
  const flashSubtotal = flashPrice * orderQuantity
  const totalSavings = (regularPrice - flashPrice) * orderQuantity

  const regularPriceKhr = Math.round(regularSubtotal * 4100)
  const finalPriceKhr = Math.round(flashSubtotal * 4100)
  const totalSavingsKhr = Math.round(totalSavings * 4100)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-[28px] shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-500">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Flash Sale Live Simulator & Price Checker
              </h3>
              <p className="text-xs text-muted-foreground">
                Test and verify product barcode/SKU scanning for POS checkout registers and Storefront.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Test Barcode Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Select Test Product or Scan Barcode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {sampleSimulatorItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectProduct(item)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeItem.id === item.id
                    ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                    : 'border-border bg-card hover:bg-muted/60'
                }`}
              >
                <div className="font-bold text-xs text-foreground truncate">{item.name}</div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="font-mono text-muted-foreground">{item.sku}</span>
                  {item.is_in_flash_sale ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {item.discount_percent}% Flash
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Regular</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Settings Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
          {/* Target Channel */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Checkout Channel
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('pos')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  selectedChannel === 'pos'
                    ? 'bg-primary text-white border-primary shadow-2xs'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Store size={13} />
                <span>POS Register</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('storefront')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  selectedChannel === 'storefront'
                    ? 'bg-primary text-white border-primary shadow-2xs'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Globe size={13} />
                <span>Storefront Cart</span>
              </button>
            </div>
          </div>

          {/* Test Order Quantity */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Test Purchase Quantity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                className="w-24 p-2 rounded-xl border border-border bg-card text-foreground font-bold text-xs"
              />
              <span className="text-xs text-muted-foreground font-medium">
                (Customer Limit: {customerLimit} max)
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Calculation Display & POS Preview Receipt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Product & Flash Sale Status */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Product Details
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{activeItem.barcode}</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-foreground">{activeItem.name}</h4>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {activeItem.sku}</div>
            </div>

            {activeItem.is_in_flash_sale ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Zap size={14} className="fill-amber-500" />
                  <span>{activeItem.flash_sale_name}</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Quota Status:</span>
                  <span className="font-semibold text-foreground">
                    {quotaRemaining} units remaining ({activeItem.quota_sold}/{activeItem.quota_total} sold)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                Item is not enrolled in any active flash sale session. Standard pricing applies.
              </div>
            )}

            {isQtyExceeded && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 text-xs">
                <AlertTriangle size={14} />
                <span>Quantity ({orderQuantity}) exceeds the anti-scalping limit ({customerLimit}).</span>
              </div>
            )}
          </div>

          {/* Right: Price Breakdown ($ USD & ៛ KHR) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-border space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
              POS Price Ring-Up Preview
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Regular Subtotal:</span>
                <span>${regularSubtotal.toFixed(2)}</span>
              </div>

              {isFlashActive && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Flash Sale Discount ({discountPercent}%):</span>
                  <span>-${totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border flex justify-between items-baseline">
                <span className="font-bold text-foreground font-sans">Final Payable (USD):</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${flashSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>Final Payable (KHR ៛):</span>
                <span className="font-bold text-foreground">{finalPriceKhr.toLocaleString()} ៛</span>
              </div>

              {isFlashActive && (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-sans font-semibold text-center mt-2">
                  Customer Saves ${totalSavings.toFixed(2)} ({totalSavingsKhr.toLocaleString()} ៛)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
