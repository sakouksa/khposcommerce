import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2 } from 'lucide-react'
import { StatusBadge, CloseButton, ActionButton } from '@/components/common'

interface CompanyDetailDrawerProps {
  item: any | null
  onClose: () => void
  onEdit?: (item: any) => void
}

export const CompanyDetailDrawer: React.FC<CompanyDetailDrawerProps> = ({ item, onClose, onEdit }) => {
  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end print:static print:bg-transparent">
          <div className="absolute inset-0 print:hidden" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="bg-card w-full max-w-xl h-full shadow-2xl relative z-10 flex flex-col justify-between overflow-hidden print:static print:w-full print:p-0 print:shadow-none"
          >
            {/* 1. Header (Clean Typography, No Icon) */}
            <div className="flex items-center justify-between p-6 border-b border-border print:hidden shrink-0">
              <h3 className="text-lg font-bold text-foreground">
                Company Profile & Details
              </h3>
              <CloseButton onClose={onClose} size="md" color="rose" />
            </div>

            {/* 2. Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-2xl">
                  {item.name ? item.name.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">{item.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{item.code || item.slug || 'N/A'}</p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <StatusBadge status={item.is_active} />
                    {item.is_main && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Primary HQ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-1">Contact & Address</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{item.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{item.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="font-semibold text-foreground">{item.website || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tax NPWP ID</p>
                    <p className="font-semibold text-foreground font-mono">{item.tax_number || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-semibold text-foreground">
                      {[item.address, item.city, item.province, item.country].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-1 pt-3">Enterprise Setup</h4>
                <div className="grid grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-muted-foreground">Currency</span>
                    <p className="font-bold text-foreground font-mono">{item.currency_code || 'USD'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timezone</span>
                    <p className="font-bold text-foreground">{item.timezone || 'UTC'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language</span>
                    <p className="font-bold text-foreground uppercase">{item.language || 'en'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Footer */}
            <div className="p-4 border-t border-border bg-card/95 flex items-center justify-end gap-2 shrink-0">
              <ActionButton
                variant="secondary"
                label="Close"
                onClick={onClose}
              />
              {onEdit && (
                <ActionButton
                  variant="primary"
                  icon={<Edit2 size={14} />}
                  label="Edit Company Profile"
                  onClick={() => {
                    onClose()
                    onEdit(item)
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CompanyDetailDrawer
