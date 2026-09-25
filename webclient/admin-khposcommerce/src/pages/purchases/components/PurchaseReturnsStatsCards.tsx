import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { RotateCcw, Wallet, CheckCircle2, Truck, AlertCircle, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '../utils/purchaseCurrency'
import type { PurchaseReturn } from '../types/purchaseReturn.types'

interface PurchaseReturnsStatsCardsProps {
  returns: PurchaseReturn[]
  totalAmount: number
}

export const PurchaseReturnsStatsCards: React.FC<PurchaseReturnsStatsCardsProps> = ({
  returns,
  totalAmount,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  const settledReturns = returns.filter(r => r.status === 'completed' || r.refund_status === 'offset' || r.refund_status === 'refunded' || r.refund_status === 'credited')
  const shippedReturns = returns.filter(r => r.status === 'shipped')
  const approvedReturns = returns.filter(r => r.status === 'approved')
  const pendingReturns = returns.filter(r => r.status === 'draft' || r.status === 'pending')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      {/* Card 1: Total Returns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 hover:border-orange-500/40 dark:hover:border-orange-500/50 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300"
      >
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider truncate">
            {t('purchases.totalReturns', 'Total Returns')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground dark:text-slate-100 tracking-tight font-mono">
              {returns.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground dark:text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {settledReturns.length + approvedReturns.length} {t('purchases.active', 'Active')}
            </span>
            <span>•</span>
            <span className="text-muted-foreground dark:text-slate-400">
              {pendingReturns.length} {t('purchases.draft', 'Draft')}
            </span>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
          <RotateCcw size={22} />
        </div>
      </motion.div>

      {/* Card 2: Return Amount */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="group relative overflow-hidden bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 hover:border-purple-500/40 dark:hover:border-purple-500/50 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300"
      >
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider truncate">
            {t('purchases.returnedValue', 'Total Refund Value')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground dark:text-slate-100 tracking-tight font-mono truncate max-w-[190px]">
              {formatCurrency(totalAmount, 'USD')}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground dark:text-slate-400 truncate font-mono">
            ≈ {formatCurrency(totalAmount * 4100, 'KHR')}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
          <Wallet size={22} />
        </div>
      </motion.div>

      {/* Card 3: Settled & Credited */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="group relative overflow-hidden bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300"
      >
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider truncate">
            {t('purchases.settledAndOffset', 'Settled & Offset AP')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              {settledReturns.length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground dark:text-slate-400 truncate flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>{shippedReturns.length} {t('purchases.shipped', 'Shipped')} • {approvedReturns.length} {t('purchases.approved', 'Approved')}</span>
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
          <CheckCircle2 size={22} />
        </div>
      </motion.div>

      {/* Card 4: Action Required */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`group relative overflow-hidden bg-card dark:bg-slate-900 border p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300 ${
          pendingReturns.length > 0
            ? 'border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/20'
            : 'border-border/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/50'
        }`}
      >
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">
            {t('purchases.pendingApproval', 'Pending Action')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              {pendingReturns.length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground dark:text-slate-400 truncate flex items-center gap-1">
            {pendingReturns.length > 0 ? (
              <>
                <AlertCircle size={12} className="text-amber-500 shrink-0" />
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{t('purchases.awaitingCreditNote', 'Awaiting review & debit approval')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>{t('purchases.allSettled', 'All returns processed')}</span>
              </>
            )}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
          <Truck size={22} />
        </div>
      </motion.div>
    </div>
  )
}

export default PurchaseReturnsStatsCards
