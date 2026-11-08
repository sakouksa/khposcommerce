import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Truck,
  DollarSign,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Command,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'

interface QuickActionItem {
  id: string
  rank?: number
  label: string
  subtitle: string
  path: string
  icon: React.ReactNode
  iconBg: string
  permission?: string | string[]
  tier: 1 | 2 | 3
}

const QuickActionDropdown: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Action Hierarchy based on approved plan (Tier 1: 1, 2, 3; Tier 2: 4, 5, 6; Tier 3: 7, 8)
  const allActions: QuickActionItem[] = [
    // ── Tier 1: Core Daily Operations (លំដាប់ ១, ២, ៣) ───────────────────────
    {
      id: 'pos',
      rank: 1,
      tier: 1,
      label: t('nav.posTerminal', 'POS Terminal'),
      subtitle: t('quick_actions_pos_sub', 'ផ្ទាំងលក់ & គិតលុយផ្ទាល់'),
      path: '/pos',
      icon: <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/40',
      permission: ['pos.access', 'sale.create', 'sales.create'],
    },
    {
      id: 'product',
      rank: 2,
      tier: 1,
      label: t('products.create', 'New Product'),
      subtitle: t('quick_actions_prod_sub', 'បង្កើតមុខទំនិញថ្មី'),
      path: '/products/create',
      icon: <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/40',
      permission: ['products.create', 'product.create'],
    },
    {
      id: 'expense',
      rank: 3,
      tier: 1,
      label: t('finance.create_expense', 'New Expense'),
      subtitle: t('quick_actions_exp_sub', 'កត់ត្រាចំណាយ Petty Cash'),
      path: '/expenses/create',
      icon: <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/40',
      permission: ['expenses.create', 'expense.create'],
    },

    // ── Tier 2: Secondary Daily & Weekly Operations ────────────────────────
    {
      id: 'po',
      tier: 2,
      label: t('purchases.createPO', 'New Purchase Order'),
      subtitle: t('quick_actions_po_sub', 'បញ្ជាទិញចូលស្តុក (PO)'),
      path: '/purchases/create',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/40',
      permission: ['purchases.create', 'purchase.create'],
    },
    {
      id: 'customer',
      tier: 2,
      label: t('customers.create', 'New Customer'),
      subtitle: t('quick_actions_cust_sub', 'ចុះឈ្មោះអតិថិជនថ្មី'),
      path: '/customers/create',
      icon: <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/40',
      permission: ['customers.create', 'customer.create'],
    },
    {
      id: 'transfer',
      tier: 2,
      label: t('inventory.stock_transfer', 'New Transfer'),
      subtitle: t('quick_actions_trans_sub', 'ផ្ទេរស្តុករវាងសាខា/ឃ្លាំង'),
      path: '/inventory/transfers/create',
      icon: <RefreshCw className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/60 dark:border-cyan-800/40',
      permission: ['inventory.create', 'inventory.edit'],
    },

    // ── Tier 3: Management & Periodic Operations ───────────────────────────
    {
      id: 'supplier',
      tier: 3,
      label: t('suppliers.create', 'New Supplier'),
      subtitle: t('quick_actions_sup_sub', 'ចុះឈ្មោះដៃគូផ្គត់ផ្គង់'),
      path: '/suppliers/create',
      icon: <Truck className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/40',
      permission: ['suppliers.create', 'supplier.create'],
    },
    {
      id: 'adjustment',
      tier: 3,
      label: t('inventory.stock_adjustment', 'Stock Adjustment'),
      subtitle: t('quick_actions_adj_sub', 'កែតម្រូវចំនួនស្តុកក្នុងឃ្លាំង'),
      path: '/inventory/adjustments/create',
      icon: <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200/60 dark:border-teal-800/40',
      permission: ['inventory.create', 'inventory.edit'],
    },
  ]

  // Filter actions based on permissions
  const allowedActions = allActions.filter(
    (act) => !act.permission || hasPermission(act.permission)
  )

  const tier1Actions = allowedActions.filter((a) => a.tier === 1)
  const otherActions = allowedActions.filter((a) => a.tier !== 1)

  if (allowedActions.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={t('quick_add', 'Quick Add')}
        className="group relative flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary/95 hover:to-blue-700 text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95"
      >
        <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
        <span className="hidden sm:inline font-medium">{t('quick_add', 'Quick Add')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-card/95 border border-border rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl overflow-hidden"
          >
            {/* Header Title */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  {t('quick_actions', 'Quick Actions')}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                Tier 1 • 2 • 3
              </span>
            </div>

            <div className="max-h-[75vh] overflow-y-auto space-y-3 pr-0.5 custom-scrollbar">
              {/* ── Section 1: Core Daily (លំដាប់ 1, 2, 3) ───────────────── */}
              {tier1Actions.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {t('quick_actions_tier_core', 'ស្នូលប្រចាំថ្ងៃ (Core 1, 2, 3)')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {tier1Actions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => {
                          navigate(act.path)
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-primary/10 transition-all duration-150 group border border-transparent hover:border-primary/20"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${act.iconBg}`}
                          >
                            {act.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {act.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {act.subtitle}
                            </div>
                          </div>
                        </div>

                        {act.rank && (
                          <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-primary/15 text-primary font-black text-[10px] flex items-center justify-center shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
                            {act.rank}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 2: General & Management (Tier 2 & 3) ──────────── */}
              {otherActions.length > 0 && (
                <div className="border-t border-border/50 pt-2">
                  <div className="px-2.5 py-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('quick_actions_tier_general', 'ប្រតិបត្តិការទូទៅ (General Operations)')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {otherActions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => {
                          navigate(act.path)
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left hover:bg-muted/60 transition-all duration-150 group"
                      >
                        <span
                          className={`p-1.5 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${act.iconBg}`}
                        >
                          {act.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {act.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {act.subtitle}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Shortcut Hint */}
            <div className="mt-2 pt-2 border-t border-border/60 px-2.5 py-1 flex items-center justify-between text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
              <span className="flex items-center gap-1 font-medium">
                <Command className="w-3 h-3" /> ស្វែងរកទំព័រ & ទិន្នន័យ
              </span>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-card border border-border rounded shadow-2xs font-semibold">
                ⌘K
              </kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuickActionDropdown
