import React, { useState, useEffect } from 'react'
import { Store, Building2, Warehouse, Monitor, Clock, Wifi, WifiOff, User, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModernSelect } from './ModernSelect'

interface StoreOption { id: number; name: string }

interface POSHeaderProps {
  // Name for display
  selectedStoreName: string
  selectedBranchName: string
  selectedWarehouseName: string
  // ID for API
  selectedStoreId: number | null
  selectedBranchId: number | null
  selectedWarehouseId: number | null
  // Setters (ID + name together)
  onStoreChange:     (id: number, name: string) => void
  onBranchChange:    (id: number, name: string) => void
  onWarehouseChange: (id: number, name: string) => void
  // Loaded lists from API
  stores:     StoreOption[]
  branches:   StoreOption[]
  warehouses: StoreOption[]
  // Register info
  cashRegister: string
  currentShift: string
  // Auth
  cashierName: string
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  selectedStoreName,
  selectedBranchName,
  selectedWarehouseName,
  selectedStoreId,
  selectedBranchId,
  selectedWarehouseId,
  onStoreChange,
  onBranchChange,
  onWarehouseChange,
  stores,
  branches,
  warehouses,
  cashRegister,
  currentShift,
  cashierName,
}) => {
  const { t } = useTranslation(['pos', 'common'])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString())
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const timer = setInterval(() => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString())
      setDateStr(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))
    }, 1000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(timer)
    }
  }, [])

  // Build select options from real API data
  const storeOptions = stores.length > 0
    ? stores.map(s => ({ value: s.id, label: s.name }))
    : [{ value: selectedStoreId ?? 0, label: selectedStoreName || t('mainStore', 'Main Store') }]

  const branchOptions = branches.length > 0
    ? branches.map(b => ({ value: b.id, label: b.name }))
    : [{ value: selectedBranchId ?? 0, label: selectedBranchName || t('branch', 'Branch') }]

  const warehouseOptions = warehouses.length > 0
    ? warehouses.map(w => ({ value: w.id, label: w.name }))
    : [{ value: selectedWarehouseId ?? 0, label: selectedWarehouseName || t('warehouse', 'Warehouse') }]

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-3.5 sm:p-4 md:p-5 shadow-2xs backdrop-blur-md space-y-3 sm:space-y-3.5">
      {/* Top Meta info & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/50 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-medium mb-0.5">
            <span>{t('salesAndOperations', 'Sales & Operations')}</span>
            <span>/</span>
            <span className="text-primary font-semibold">{t('posTerminal', 'POS Terminal')}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2 truncate">
            <span>{t('enterprisePosTerminal', 'Enterprise POS Terminal')}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1 shrink-0">
              <ShieldCheck size={12} /> {t('activeShift', 'Active Shift')}
            </span>
          </h1>
        </div>

        {/* Live Status & Clock */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* Network Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400'
          }`}>
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Wifi size={13} /> <span className="hidden xs:inline">{t('onlineTerminal', 'Online Terminal')}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <WifiOff size={13} /> <span>{t('offlineReady', 'Offline Ready')}</span>
              </>
            )}
          </div>

          {/* Clock & Date */}
          <div className="hidden md:flex items-center gap-2 bg-muted/40 border border-border/60 px-3 py-1.5 rounded-xl text-xs font-medium text-foreground">
            <Clock size={14} className="text-primary" />
            <span>{dateStr}</span>
            <span className="font-bold text-primary font-mono">{timeStr}</span>
          </div>

          {/* Cashier Badge — dynamic from auth */}
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold text-primary">
            <User size={13} />
            <span className="truncate max-w-[120px]">{cashierName || t('cashier', 'Cashier')}</span>
          </div>
        </div>
      </div>

      {/* Selectors Bar: Store, Branch, Warehouse, Register */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
        <div className="flex items-center gap-2 bg-muted/20 border border-border/70 hover:border-primary/40 transition-colors rounded-2xl px-3 py-2">
          <Store size={15} className="text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground block leading-tight font-medium">{t('store', 'Store')}</span>
            <ModernSelect
              value={selectedStoreId ?? storeOptions[0]?.value}
              onChange={(val) => {
                const found = stores.find(s => String(s.id) === String(val))
                if (found) onStoreChange(found.id, found.name)
              }}
              options={storeOptions}
              buttonClassName="border-none bg-transparent p-0 shadow-none text-xs font-bold text-foreground hover:bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/20 border border-border/70 hover:border-primary/40 transition-colors rounded-2xl px-3 py-2">
          <Building2 size={15} className="text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground block leading-tight font-medium">{t('branch', 'Branch')}</span>
            <ModernSelect
              value={selectedBranchId ?? branchOptions[0]?.value}
              onChange={(val) => {
                const found = branches.find(b => String(b.id) === String(val))
                if (found) onBranchChange(found.id, found.name)
              }}
              options={branchOptions}
              buttonClassName="border-none bg-transparent p-0 shadow-none text-xs font-bold text-foreground hover:bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/20 border border-border/70 hover:border-primary/40 transition-colors rounded-2xl px-3 py-2">
          <Warehouse size={15} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground block leading-tight font-medium">{t('warehouse', 'Warehouse')}</span>
            <ModernSelect
              value={selectedWarehouseId ?? warehouseOptions[0]?.value}
              onChange={(val) => {
                const found = warehouses.find(w => String(w.id) === String(val))
                if (found) onWarehouseChange(found.id, found.name)
              }}
              options={warehouseOptions}
              buttonClassName="border-none bg-transparent p-0 shadow-none text-xs font-bold text-foreground hover:bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/20 border border-border/70 rounded-2xl px-3 py-2">
          <Monitor size={15} className="text-purple-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground block leading-tight font-medium">{t('registerAndShift', 'Register & Shift')}</span>
            <div className="font-bold text-foreground truncate">{cashRegister} • {currentShift}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
