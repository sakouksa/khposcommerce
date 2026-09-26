import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, ShoppingBag, Package, Users, Truck, 
  Settings2, RefreshCw, BarChart2, UserPlus, Monitor
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'

export const QuickActions: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()

  const items = [
    {
      label: t('dashboard.createSale'),
      path: '/pos',
      icon: <ShoppingCart className="w-4 h-4 text-blue-500" />,
      permission: 'sale.create',
      color: 'hover:bg-blue-500/5 hover:border-blue-500/20'
    },
    {
      label: t('dashboard.openPOS'),
      path: '/pos',
      icon: <Monitor className="w-4 h-4 text-emerald-500" />,
      permission: 'sale.create',
      color: 'hover:bg-emerald-500/5 hover:border-emerald-500/20'
    },
    {
      label: t('dashboard.createPurchase'),
      path: '/purchases',
      icon: <ShoppingBag className="w-4 h-4 text-indigo-500" />,
      permission: 'purchase.create',
      color: 'hover:bg-indigo-500/5 hover:border-indigo-500/20'
    },
    {
      label: t('dashboard.addProduct'),
      path: '/products/create',
      icon: <Package className="w-4 h-4 text-violet-500" />,
      permission: 'product.create',
      color: 'hover:bg-violet-500/5 hover:border-violet-500/20'
    },
    {
      label: t('dashboard.receiveStock'),
      path: '/inventory',
      icon: <Settings2 className="w-4 h-4 text-amber-500" />,
      permission: 'inventory.edit',
      color: 'hover:bg-amber-500/5 hover:border-amber-500/20'
    },
    {
      label: t('dashboard.transferStock'),
      path: '/inventory/transfers',
      icon: <RefreshCw className="w-4 h-4 text-cyan-500" />,
      permission: 'inventory.edit',
      color: 'hover:bg-cyan-500/5 hover:border-cyan-500/20'
    },
    {
      label: t('dashboard.createCustomer'),
      path: '/customers',
      icon: <Users className="w-4 h-4 text-purple-500" />,
      permission: 'customer.create',
      color: 'hover:bg-purple-500/5 hover:border-purple-500/20'
    },
    {
      label: t('dashboard.createSupplier'),
      path: '/suppliers',
      icon: <Truck className="w-4 h-4 text-pink-500" />,
      permission: 'supplier.create',
      color: 'hover:bg-pink-500/5 hover:border-pink-500/20'
    },
    {
      label: t('dashboard.addEmployee'),
      path: '/employees',
      icon: <UserPlus className="w-4 h-4 text-teal-500" />,
      permission: 'employee.create',
      color: 'hover:bg-teal-500/5 hover:border-teal-500/20'
    },
    {
      label: t('dashboard.generateReport'),
      path: '/reports',
      icon: <BarChart2 className="w-4 h-4 text-slate-500" />,
      permission: 'reports.view',
      color: 'hover:bg-slate-500/5 hover:border-slate-500/20'
    },
  ]

  const allowedItems = items.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
      <h3 className="font-extrabold text-sm sm:text-base text-foreground mb-3.5">
        {t('dashboard.quickActions')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
        {allowedItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            className={`w-full p-2.5 sm:p-3 rounded-2xl border border-border/60 hover:border-primary/40 text-left flex items-center gap-3 transition-all duration-150 cursor-pointer shadow-2xs active:scale-98 ${item.color}`}
          >
            <span className="p-2 bg-muted/60 rounded-xl flex items-center justify-center shrink-0">
              {item.icon}
            </span>
            <span className="text-xs font-black text-foreground truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
