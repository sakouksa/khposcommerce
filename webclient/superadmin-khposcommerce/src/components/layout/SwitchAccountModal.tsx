import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, UserCheck, Users, Briefcase, Warehouse, Store } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface SwitchAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const MOCK_ACCOUNTS = [
  {
    role: 'super_admin',
    name: 'Super Admin',
    email: 'admin@enterprise.com',
    company: 'Enterprise POS',
    branch: 'Head Office',
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    permissions: ['*'],
  },
  {
    role: 'manager',
    name: 'Manager John',
    email: 'manager@enterprise.com',
    company: 'Enterprise POS',
    branch: 'Phnom Penh Branch',
    icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
    permissions: [
      'product.view', 'product.create', 'product.edit', 
      'inventory.view', 'sale.view', 'purchase.view', 
      'supplier.view', 'employee.view'
    ],
  },
  {
    role: 'cashier',
    name: 'Cashier Alice',
    email: 'cashier@enterprise.com',
    company: 'Enterprise POS',
    branch: 'Siem Reap Branch',
    icon: <UserCheck className="w-5 h-5 text-amber-500" />,
    permissions: ['sale.create', 'sale.view'],
  },
  {
    role: 'warehouse_manager',
    name: 'Warehouse Bob',
    email: 'warehouse@enterprise.com',
    company: 'Enterprise POS',
    branch: 'Main Warehouse',
    icon: <Warehouse className="w-5 h-5 text-purple-500" />,
    permissions: ['product.view', 'inventory.view', 'purchase.view', 'purchase_return.view'],
  },
  {
    role: 'branch_user',
    name: 'Branch User David',
    email: 'david@enterprise.com',
    company: 'Enterprise POS',
    branch: 'Head Office 4',
    icon: <Store className="w-5 h-5 text-slate-500" />,
    permissions: ['sale.view'],
  },
]

const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSwitch = (acc: typeof MOCK_ACCOUNTS[0]) => {
    updateUser({
      name: acc.name,
      email: acc.email,
      roles: [acc.role],
      permissions: acc.permissions,
      company: { id: 1, name: acc.company },
      branch: { id: 1, name: acc.branch },
    })
    navigate('/dashboard')
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {t('auth.switch_account', 'Switch Account')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('auth.switch_account_desc', 'Switch dynamically between mock roles and permission layers.')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              {MOCK_ACCOUNTS.map((acc) => {
                const isActive = user?.roles?.includes(acc.role)
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleSwitch(acc)}
                    disabled={isActive}
                    className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-4 transition-all duration-200
                      ${
                        isActive
                          ? 'border-primary bg-primary/5 cursor-default'
                          : 'border-border bg-card hover:bg-muted/30 hover:border-muted-foreground/30'
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-muted rounded-lg flex items-center justify-center">
                        {acc.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{acc.name}</span>
                          {isActive && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {t('common.current', 'Current')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{acc.email}</p>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                          <span className="font-medium">{acc.company}</span>
                          <span>•</span>
                          <span>{acc.branch}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SwitchAccountModal
