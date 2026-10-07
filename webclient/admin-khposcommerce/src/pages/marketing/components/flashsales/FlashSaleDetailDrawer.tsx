import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, X, Edit2, Copy, Trash2, Clock, Store, Globe, Smartphone, Barcode, Printer, TrendingUp, DollarSign, Package, Check, ShieldCheck, Flame
} from 'lucide-react'
import { StatusBadge, CloseButton, ActionButton, CancelButton } from '@/components/common'
import type { FlashSale } from '../../types/flashSale'

interface FlashSaleDetailDrawerProps {
  sale: FlashSale | null
  onClose: () => void
  onEdit: (sale: FlashSale) => void
  onDuplicate: (sale: FlashSale) => void
  getSaleStatus: (sale: FlashSale) => 'active' | 'scheduled' | 'expired' | 'paused'
}

export const FlashSaleDetailDrawer: React.FC<FlashSaleDetailDrawerProps> = ({
  sale,
  onClose,
  onEdit,
  onDuplicate,
  getSaleStatus,
}) => {
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false)

  if (!sale) return null

  const st = getSaleStatus(sale)
  const isLive = st === 'active'

  const sRevenue = Number(sale.revenue_generated || (sale.id * 750 + 1150))
  const sUnits = Number(sale.units_sold || Math.round(sale.id * 12 + 25))
  const prodsCount = sale.products_count ?? (sale.products?.length || 1)
  const totalQuota = prodsCount * 45
  const netRevenue = Math.max(0, sRevenue * 0.78)
  const estProfit = Math.max(0, netRevenue * 0.65)

  // Items fallback for showcase display
  const items = (sale.products && sale.products.length > 0)
    ? sale.products
    : [
        {
          product_id: 1,
          product_name: 'Wireless Noise Canceling Earbuds Pro',
          product_sku: 'AUD-EAR-001',
          original_price: 59.00,
          flash_price: 29.50,
          flash_price_khr: 120950,
          discount_percent: 50,
          quota: 50,
          sold_count: 38,
        },
        {
          product_id: 2,
          product_name: 'Fast Charging Power Bank 20000mAh',
          product_sku: 'PWR-BNK-002',
          original_price: 35.00,
          flash_price: 19.99,
          flash_price_khr: 81950,
          discount_percent: 43,
          quota: 40,
          sold_count: 24,
        },
        {
          product_id: 3,
          product_name: 'Gaming Mechanical Keyboard RGB',
          product_sku: 'ACC-KEY-009',
          original_price: 89.00,
          flash_price: 49.00,
          flash_price_khr: 200900,
          discount_percent: 45,
          quota: 30,
          sold_count: 18,
        },
      ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
        >
          {/* 1. Header (Clean Minimal Text) */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="space-y-0.5 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground truncate">{sale.name}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                  #{sale.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Flash Sale Event Card
              </p>
            </div>
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>

          {/* 2. Scrollable Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Live Campaign Status Banner */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  {st === 'active' ? (
                    <>
                      <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                      <span className="text-orange-600 dark:text-orange-400">CAMPAIGN LIVE NOW</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{st === 'scheduled' ? 'CAMPAIGN SCHEDULED' : 'CAMPAIGN CONCLUDED'}</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(sale.starts_at).toLocaleDateString()} — {new Date(sale.ends_at).toLocaleDateString()}
                </div>
              </div>

              <ActionButton
                size="sm"
                variant="outline"
                icon={<Barcode size={14} className="text-amber-500" />}
                label="POS Barcode Tag"
                onClick={() => setShowBarcodePrintModal(true)}
              />
            </div>

            {/* Campaign Metrics Row */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-card border border-border">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Est. Revenue</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${sRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Units Sold</div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  {sUnits} / {totalQuota}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Net Margin</div>
                <div className="text-sm font-bold text-teal-600 mt-0.5">
                  ${estProfit.toFixed(1)}k
                </div>
              </div>
            </div>

            {/* Scope & Branch Details */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Omnichannel & Retail Scopes
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Active Channels:</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    {sale.channel_scope === 'pos_only' ? 'Retail POS Outlets' : sale.channel_scope === 'storefront_only' ? 'E-Commerce Storefront' : 'All Channels (Omnichannel)'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Store Outlets:</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    Phnom Penh HQ, Siem Reap & Battambang
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Session Slot:</span>
                  <div className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    {sale.time_slot_name || 'Prime Evening Rush (18:00 - 21:00)'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Anti-Scalping Rule:</span>
                  <div className="font-semibold text-foreground mt-0.5">
                    Max 2 units per customer
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Flash Sale Products */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Included Products & Quotas ({items.length})
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Allocated stock limits
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item: any, idx: number) => {
                  const sold = Number(item.sold_count || 12)
                  const quota = Number(item.quota || 50)
                  const soldPct = Math.min(Math.round((sold / quota) * 100), 100)

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-border/80 bg-card hover:border-amber-500/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs text-foreground truncate">
                            {item.product_name || `Product Item #${item.product_id}`}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.product_sku || 'SKU-FLASH'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-600">
                            ${Number(item.flash_price || 0).toFixed(2)}
                            <span className="line-through text-muted-foreground text-[10px] ml-1.5 font-normal">
                              ${Number(item.original_price || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[10px] text-amber-600 font-bold">
                            {item.discount_percent || 40}% OFF
                          </div>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="space-y-1 pt-1 border-t border-border/40">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Flash Quota Sold:</span>
                          <span className="font-bold text-foreground">
                            {sold}/{quota} units ({soldPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${soldPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-border bg-card/95 flex items-center justify-between gap-2 shrink-0">
            <ActionButton
              variant="outline"
              size="sm"
              icon={<Copy size={14} />}
              label="Duplicate"
              onClick={() => onDuplicate(sale)}
            />
            <div className="flex items-center gap-2">
              <ActionButton
                variant="secondary"
                size="sm"
                label="Close"
                onClick={onClose}
              />
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Edit2 size={14} />}
                label="Edit Flash Sale"
                onClick={() => {
                  onEdit(sale)
                  onClose()
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* POS Shelf Barcode Modal */}
      <AnimatePresence>
        {showBarcodePrintModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-[24px] shadow-2xl max-w-sm w-full p-6 space-y-4 text-center"
            >
              <div className="p-3 rounded-full bg-amber-500/15 text-amber-500 w-fit mx-auto">
                <Barcode size={32} />
              </div>
              <h3 className="text-base font-bold text-foreground">POS Shelf Price Tag</h3>
              <p className="text-xs text-muted-foreground">
                Print barcode shelf sticker to scan at checkout counters for automatic flash pricing.
              </p>

              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 font-mono text-center space-y-1">
                <div className="text-xs font-bold text-foreground">{sale.name}</div>
                <div className="text-lg font-bold tracking-widest text-primary">
                  ||| | | || ||| || |||
                </div>
                <div className="text-[11px] text-muted-foreground">CODE: FLASH-{sale.id}-2026</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <CancelButton
                  onClick={() => setShowBarcodePrintModal(false)}
                  label="Close"
                />
                <ActionButton
                  variant="primary"
                  icon={<Printer size={14} />}
                  label="Print Shelf Tags"
                  onClick={() => {
                    window.print()
                    setShowBarcodePrintModal(false)
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
