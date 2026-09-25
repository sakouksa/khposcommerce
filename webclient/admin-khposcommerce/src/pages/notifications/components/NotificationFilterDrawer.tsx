import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, RotateCcw, Check, Calendar, Shield, Building2, Layers, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CloseButton, ResetButton, ActionButton, EnterpriseDatePicker } from '@/components/common'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'

interface NotificationFilterDrawerProps {
  open: boolean
  onClose: () => void
  priorityFilter?: string
  setPriorityFilter: (val?: string) => void
  statusFilter?: string
  setStatusFilter: (val?: string) => void
  typeFilter?: string
  setTypeFilter: (val?: string) => void
  readStatusFilter?: string
  setReadStatusFilter: (val?: string) => void
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  onReset: () => void
  onApply: () => void
  activeFiltersCount: number
}

const NotificationFilterDrawer: React.FC<NotificationFilterDrawerProps> = ({
  open,
  onClose,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  readStatusFilter,
  setReadStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  onApply,
  activeFiltersCount,
}) => {
  const { t } = useTranslation()

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'system', label: 'System Alerts' },
    { value: 'inventory', label: 'Inventory Stock' },
    { value: 'sales', label: 'Sales Orders' },
    { value: 'purchase', label: 'Purchase Orders' },
    { value: 'finance', label: 'Finance & Payment' },
    { value: 'employees', label: 'Employees & HR' },
    { value: 'security', label: 'Security Policy' },
  ]

  const statusOptions = [
    { value: '', label: 'All Gateway Statuses' },
    { value: 'sent', label: 'Sent / Delivered' },
    { value: 'pending', label: 'Pending Queue' },
    { value: 'failed', label: 'Failed / Bounced' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-card dark:bg-slate-900 border-l border-border dark:border-slate-800 shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-border dark:border-slate-800 flex items-center justify-between bg-muted/30 dark:bg-slate-900">
                <div>
                  <h3 className="font-bold text-base text-foreground dark:text-slate-100">Advanced Notification Filters</h3>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">Filter alerts by priority, type, status & date range</p>
                </div>

                <CloseButton onClose={onClose} size="md" color="rose" />
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. Priority Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: '', label: 'All' },
                      { id: 'critical', label: 'Critical' },
                      { id: 'high', label: 'High' },
                      { id: 'normal', label: 'Normal' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriorityFilter(p.id || undefined)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                          (priorityFilter || '') === p.id
                            ? 'bg-primary text-white border-primary shadow-2xs'
                            : 'bg-card border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Read Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Read Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '', label: 'All Status' },
                      { id: 'unread', label: 'Unread' },
                      { id: 'read', label: 'Read' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setReadStatusFilter(st.id || undefined)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl capitalize transition-all border cursor-pointer ${
                          (readStatusFilter || '') === st.id
                            ? 'bg-primary text-white border-primary shadow-2xs font-bold'
                            : 'bg-card border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Category Type with ModernSelect */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notification Category</label>
                  <ModernSelect
                    value={typeFilter || ''}
                    onChange={(val) => setTypeFilter(String(val) || undefined)}
                    options={categoryOptions}
                    placeholder="Select Notification Category"
                    icon={<Layers size={15} className="text-primary" />}
                  />
                </div>

                {/* 4. Dispatch Gateway Status with ModernSelect */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dispatch Gateway Status</label>
                  <ModernSelect
                    value={statusFilter || ''}
                    onChange={(val) => setStatusFilter(String(val) || undefined)}
                    options={statusOptions}
                    placeholder="Select Gateway Status"
                    icon={<Radio size={15} className="text-primary" />}
                  />
                </div>

                {/* 5. Modern Created Date Range */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Created Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 block mb-1">Start Date</span>
                      <EnterpriseDatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Start Date"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 block mb-1">End Date</span>
                      <EnterpriseDatePicker
                        value={endDate}
                        minDate={startDate}
                        onChange={setEndDate}
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border dark:border-slate-800 bg-muted/20 dark:bg-slate-900 flex items-center justify-between gap-3">
                <ResetButton onClick={onReset} label="Reset Filters" className="flex-1" />
                <ActionButton
                  variant="primary"
                  icon={<Check size={14} />}
                  label="Apply Filters"
                  className="flex-1"
                  onClick={() => {
                    onApply()
                    onClose()
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default NotificationFilterDrawer
