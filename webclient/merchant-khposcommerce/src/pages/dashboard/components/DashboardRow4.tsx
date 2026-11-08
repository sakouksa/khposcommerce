import React from 'react'
import { Warehouse, Boxes, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FlattenCard } from '@/components/common/cards'
import { formatCurrency } from '@/utils/formatters'

interface DashboardRow4Props {
  lowStockList: any[]
  stats?: any
}

export const DashboardRow4: React.FC<DashboardRow4Props> = ({ lowStockList, stats }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Warehouse Status Summary */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-blue-500" />
            <span>{t('dashboard.warehouseStockStatus', 'Warehouse Stock Status')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/warehouses')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.totalWarehouses')}</span>
            <span className="font-bold text-slate-800 dark:text-white font-mono">{stats?.total_warehouses || 1}</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.todayTransfers')}</span>
            <span className="font-bold text-slate-800 dark:text-white font-mono">{stats?.today_transfers || 0}</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.todayStockMovements', "Today's Stock Movements")}</span>
            <span className="font-bold text-slate-800 dark:text-white font-mono">{stats?.today_stock_movement || 0}</span>
          </div>
        </div>
      </FlattenCard>

      {/* 2. Low Stock Alerts */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{t('dashboard.stockHealthAlerts', 'Stock Health Alerts')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewInventory')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-3.5">
          {lowStockList?.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-bold text-slate-800 dark:text-white block truncate">{item.product_name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.warehouse_name || 'Main Warehouse'}</span>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 text-[10px] font-bold rounded-full shrink-0">
                {item.quantity} {t('dashboard.left', 'left')}
              </span>
            </div>
          ))}
          {(!lowStockList || lowStockList.length === 0) && (
            <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              🎉 {t('dashboard.allStockHealthy', 'All stock levels are healthy')}
            </div>
          )}
        </div>
      </FlattenCard>

      {/* 3. Inventory Financial Assets Valuation */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-purple-500" />
            <span>{t('dashboard.inventoryValue', 'Inventory Value')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/reports/inventory')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewReport', 'View Report')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
        className="md:col-span-2 lg:col-span-1"
      >
        <div className="py-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.inventoryValuation', 'Total Stock Valuation')}</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 font-mono tracking-tight">
            {formatCurrency(stats?.inventory_value || 0, { locale })}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Estimated wholesale asset valuation across all warehouse facilities.
          </p>
        </div>
      </FlattenCard>
    </div>
  )
}

export default DashboardRow4
