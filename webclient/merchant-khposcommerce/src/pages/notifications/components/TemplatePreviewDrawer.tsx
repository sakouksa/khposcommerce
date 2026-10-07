import React, { useState } from 'react'
import {
  X, Info, FileText, CheckCircle2, AlertTriangle, Clock, Send,
  Monitor, Smartphone, Mail, Bell, Sparkles, Layers, ShieldAlert,
  ShoppingCart, ShoppingBag, DollarSign, Star, Code, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatShortDate } from '@/utils/formatters'
import { CloseButton } from '@/components/common'
import type { NotificationTemplateItem } from '../types/notification.types'

interface TemplatePreviewDrawerProps {
  open: boolean
  template: NotificationTemplateItem | null
  onClose: () => void
}

const SAMPLE_DATA: Record<string, string> = {
  employee_name: 'Alexander Smith',
  customer_name: 'Ly Socheat',
  supplier_name: 'Tech Logistics Ltd',
  product_name: 'MacBook Pro M3 Max 16"',
  invoice_no: 'INV-2026-8819',
  order_no: 'PO-2026-4410',
  sale_no: 'SO-9831',
  company_name: 'Enterprise POS Inc.',
  branch_name: 'Main Flagship Store',
  warehouse_name: 'Central Warehouse Hub',
  amount: '$2,450.00',
  check_in_time: '08:45 AM',
  date: '2026-07-25',
}

const getCategoryIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'sales':
      return <ShoppingCart size={22} className="text-blue-500" />
    case 'purchase':
      return <ShoppingBag size={22} className="text-emerald-500" />
    case 'inventory':
      return <Layers size={22} className="text-amber-500" />
    case 'security':
      return <ShieldAlert size={22} className="text-rose-500" />
    case 'finance':
      return <DollarSign size={22} className="text-purple-500" />
    case 'employee':
    case 'attendance':
      return <Bell size={22} className="text-indigo-500" />
    case 'marketing':
      return <Star size={22} className="text-pink-500" />
    case 'system':
      return <Code size={22} className="text-cyan-500" />
    default:
      return <FileText size={22} className="text-primary" />
  }
}

const renderHighlightedMessage = (text: string) => {
  if (!text) return null
  const parts = text.split(/(\{[\w_]+\})/g)
  return parts.map((part, idx) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 my-0.5 rounded-md font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 shadow-2xs mx-0.5 select-all"
        >
          {part}
        </span>
      )
    }
    return <span key={idx}>{part}</span>
  })
}

const TemplatePreviewDrawer: React.FC<TemplatePreviewDrawerProps> = ({ open, template, onClose }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'general' | 'preview'>('general')

  if (!open || !template) return null

  const renderTemplateText = (text: string) => {
    let result = text || ''
    Object.entries(SAMPLE_DATA).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val)
    })
    return result
  }

  const renderedTitle = renderTemplateText(template.title_template || template.name)
  const renderedMessage = renderTemplateText(template.message_template || '')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden print:hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Panel matching Inventory Detail Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
        >
          {/* ── 1. HEADER (Clean Minimal Text) ────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
            <div>
              <h2 className="text-sm font-bold text-foreground">Template Preset Card</h2>
              <p className="text-[11px] text-muted-foreground font-mono font-semibold">
                ID: #{template.id || template.code}
              </p>
            </div>
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>

          {/* ── 2. SUB TABS (General Info / Live Multi-Channel Preview) ────── */}
          <div className="flex border-b border-border bg-muted/20 px-6 gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info size={14} />
              General Information
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={14} />
              Live Multi-Channel Preview
            </button>
          </div>

          {/* ── 3. DRAWER BODY ───────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Profile Card Banner */}
            <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center shadow-2xs shrink-0">
                {getCategoryIcon(template.type)}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground truncate">{template.name}</h3>
                <p className="text-xs font-mono font-semibold text-primary truncate">#{template.code}</p>
                <div>
                  {template.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle2 size={11} />
                      Active & Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                      <AlertTriangle size={11} />
                      Disabled Preset
                    </span>
                  )}
                </div>
              </div>
            </div>

            {activeTab === 'general' ? (
              <div className="space-y-6">
                {/* GENERAL INFORMATION */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                    GENERAL INFORMATION
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Preset Code</span>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-[11px] truncate block max-w-full" title={`#${template.code}`}>
                        #{template.code}
                      </span>
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Preset Category</span>
                      <span className="font-bold text-foreground capitalize truncate block">{template.type || 'General'} Preset</span>
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Priority Level</span>
                      <span className="font-bold text-foreground uppercase truncate block">{template.priority || 'NORMAL'}</span>
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Supported Channels</span>
                      <span className="font-bold text-foreground truncate block">Email • Push</span>
                    </div>
                  </div>
                </div>

                {/* TEMPLATE SUBJECT & PAYLOAD */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                    TEMPLATE SUBJECT & PAYLOAD
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium mb-1">Title Template (Subject)</span>
                      <div className="p-3 rounded-xl bg-card border border-border/80 font-bold text-foreground shadow-2xs">
                        {template.title_template || template.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium mb-1">Message Payload Content</span>
                      <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 font-sans text-xs leading-relaxed shadow-2xs border-l-3 border-l-primary">
                        {renderHighlightedMessage(template.message_template)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TEMPLATE METRICS & SLA (2x2 GRID MATCHING INVENTORY DRAWER) */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                    DISPATCH METRICS & AVAILABILITY
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">PRESET STATUS</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {template.is_active ? 'ACTIVE' : 'OFF'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">PRIORITY LEVEL</span>
                      <div className="text-lg font-black text-amber-700 dark:text-amber-300 uppercase">
                        {template.priority || 'NORMAL'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">GATEWAY SLA</span>
                      <div className="text-lg font-black text-blue-700 dark:text-blue-300">
                        99.9%
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">DISPATCH TIME</span>
                      <div className="text-lg font-black text-foreground">
                        &lt; 500ms
                      </div>
                    </div>
                  </div>
                </div>

                {/* SYSTEM METADATA */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                    SYSTEM METADATA
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Record Created</span>
                      <span className="font-mono text-foreground font-semibold truncate block">{formatShortDate(template.created_at)}</span>
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">Last Updated</span>
                      <span className="font-mono text-foreground font-semibold truncate block">{formatShortDate(template.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LIVE MULTI-CHANNEL PREVIEW TAB */
              <div className="space-y-5">
                {/* Desktop Toast Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Monitor size={15} className="text-primary" />
                    <span>Desktop Toast Notification</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center">
                    <div className="w-full max-w-sm bg-slate-800/90 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[11px] font-bold text-slate-200">Enterprise POS</span>
                        </div>
                        <span className="text-[9.5px] text-slate-400">Just now</span>
                      </div>
                      <h5 className="font-bold text-xs text-white">{renderedTitle}</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{renderedMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Phone Screen Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Smartphone size={15} className="text-primary" />
                    <span>Mobile Screen Push</span>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 flex justify-center">
                    <div className="w-60 h-[280px] bg-slate-950 border-4 border-slate-700 rounded-[28px] p-2.5 shadow-xl flex flex-col justify-start space-y-2 relative overflow-hidden">
                      <div className="w-16 h-2 bg-slate-800 rounded-full mx-auto" />
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-lg space-y-1">
                        <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                          <span className="font-bold text-sky-400">Enterprise POS</span>
                          <span>now</span>
                        </div>
                        <h6 className="font-bold text-[11px] text-white leading-tight">{renderedTitle}</h6>
                        <p className="text-[10px] text-slate-300 line-clamp-3 leading-snug">{renderedMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Template Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Mail size={15} className="text-primary" />
                    <span>Formatted Email Render</span>
                  </div>
                  <div className="p-4 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">From: Enterprise System &lt;notifications@enterprisepos.com&gt;</span>
                      <h5 className="font-bold text-sm text-slate-900 mt-0.5">{renderedTitle}</h5>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{renderedMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TemplatePreviewDrawer
