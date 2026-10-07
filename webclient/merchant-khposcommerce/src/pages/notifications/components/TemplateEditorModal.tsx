import React, { useState, useEffect } from 'react'
import {
  FileText, Sparkles, Monitor, Save, X,
  Bell, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { NotificationTemplateItem } from '../types/notification.types'
import notificationService from '@/services/notificationService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import ModernSelect from '@/components/shared/ModernSelect'
import { Input } from '@/components/common/forms/Input'
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel, FieldError } from '@/components/common/forms/FormField'
import ToggleSwitch from '@/components/common/ToggleSwitch'

interface TemplateEditorModalProps {
  open: boolean
  template: NotificationTemplateItem | null
  onClose: () => void
  onSuccess: (savedItem?: NotificationTemplateItem | null) => void
}

const SUPPORTED_VARIABLES = [
  '{employee_name}',
  '{customer_name}',
  '{supplier_name}',
  '{product_name}',
  '{invoice_no}',
  '{order_no}',
  '{sale_no}',
  '{company_name}',
  '{branch_name}',
  '{warehouse_name}',
  '{amount}',
  '{check_in_time}',
  '{date}',
]

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

const TYPE_OPTIONS = [
  { value: 'system', label: 'System Alerts' },
  { value: 'inventory', label: 'Inventory Presets' },
  { value: 'sales', label: 'Sales Presets' },
  { value: 'purchase', label: 'Purchase Presets' },
  { value: 'finance', label: 'Finance & Expense' },
  { value: 'employee', label: 'Employee & Attendance' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'normal', label: 'Normal Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical Priority' },
]

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  open,
  template,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('desktop')

  const [formData, setFormData] = useState<Record<string, any>>({
    code: '',
    name: '',
    type: 'system',
    priority: 'normal',
    title_template: '',
    message_template: '',
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (template) {
        setFormData({
          code: template.code || '',
          name: template.name || '',
          type: template.type || 'system',
          priority: template.priority || 'normal',
          title_template: template.title_template || '',
          message_template: template.message_template || '',
          is_active: template.is_active !== false,
        })
      } else {
        setFormData({
          code: '',
          name: '',
          type: 'system',
          priority: 'normal',
          title_template: '',
          message_template: '',
          is_active: true,
        })
      }
      setErrors({})
    }
  }, [open, template])

  if (!open) return null

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleInsertVariable = (variable: string) => {
    const currentMsg = formData.message_template || ''
    const updated = currentMsg ? `${currentMsg} ${variable}` : variable
    handleFieldChange('message_template', updated)
  }

  const renderLiveText = (tmpl: string) => {
    let rendered = tmpl || ''
    Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v)
      rendered = rendered.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
    })
    return rendered
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.code?.trim()) newErrors.code = 'Please enter template code'
    if (!formData.name?.trim()) newErrors.name = 'Please enter template name'
    if (!formData.type) newErrors.type = 'Please select preset category'
    if (!formData.priority) newErrors.priority = 'Please select priority'
    if (!formData.title_template?.trim()) newErrors.title_template = 'Please enter title template'
    if (!formData.message_template?.trim()) newErrors.message_template = 'Please enter message template payload'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validate()) {
      sound.playError()
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      setLoading(true)
      let resultItem: NotificationTemplateItem | null = null

      if (template) {
        resultItem = await notificationService.updateTemplate(template.id, formData)
        sound.playSuccess()
        toast.success('Notification template updated successfully!')
      } else {
        resultItem = await notificationService.createTemplate(formData)
        sound.playSuccess()
        toast.success('Notification template created successfully!')
      }

      onSuccess(resultItem)
      onClose()
    } catch (error: any) {
      sound.playError()
      toast.error(error.response?.data?.message || 'Failed to save template.')
    } finally {
      setLoading(false)
    }
  }

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

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
        >
          {/* ── 1. HEADER ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-foreground truncate">
                  {template ? 'Edit Notification Template' : 'Create Notification Template'}
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium truncate">
                  Configure preset rules, variable payloads & live previews
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── 2. SUB TABS ─────────────────────────────────────────────────── */}
          <div className="flex border-b border-border bg-muted/20 px-6 gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info size={14} />
              Template Form Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={14} />
              Live Preview Panel
            </button>
          </div>

          {/* ── 3. DRAWER BODY ───────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'editor' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* SECTION 1: BASIC IDENTIFICATION */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    BASIC IDENTIFICATION
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <FieldLabel label="Template Code" required />
                      <Input
                        placeholder="e.g. ATTENDANCE_LATE"
                        disabled={!!template}
                        value={formData.code}
                        onChange={(e) => handleFieldChange('code', e.target.value)}
                        error={errors.code}
                        className="font-mono font-bold"
                      />
                      <FieldError error={errors.code} />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel label="Template Name" required />
                      <Input
                        placeholder="e.g. Late Attendance Alert"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        error={errors.name}
                        className="font-semibold"
                      />
                      <FieldError error={errors.name} />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CATEGORIZATION & PRIORITY */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    CATEGORIZATION & PRIORITY
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <FieldLabel label="Preset Category (Type)" required />
                      <ModernSelect
                        placeholder="Select category type..."
                        options={TYPE_OPTIONS}
                        value={formData.type}
                        onChange={(val) => handleFieldChange('type', val)}
                        error={errors.type}
                        size="md"
                      />
                      <FieldError error={errors.type} />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel label="Priority Level" required />
                      <ModernSelect
                        placeholder="Select priority..."
                        options={PRIORITY_OPTIONS}
                        value={formData.priority}
                        onChange={(val) => handleFieldChange('priority', val)}
                        error={errors.priority}
                        size="md"
                      />
                      <FieldError error={errors.priority} />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: NOTIFICATION PAYLOAD CONTENT */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    NOTIFICATION PAYLOAD CONTENT
                  </h4>

                  <div className="space-y-1">
                    <FieldLabel label="Title Template (Subject)" required />
                    <Input
                      placeholder="e.g. Late Attendance Alert: {employee_name}"
                      value={formData.title_template}
                      onChange={(e) => handleFieldChange('title_template', e.target.value)}
                      error={errors.title_template}
                      className="font-semibold"
                    />
                    <FieldError error={errors.title_template} />
                  </div>

                  {/* Dynamic Variable Insertion Bar */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      Click Variable to Insert into Payload Message:
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-card rounded-xl border border-border/70 shadow-2xs">
                      {SUPPORTED_VARIABLES.map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => handleInsertVariable(v)}
                          title={`Insert ${v}`}
                          className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <FieldLabel label="Message Payload Template" required />
                    <Textarea
                      rows={4}
                      placeholder="e.g. Employee {employee_name} checked in late at {check_in_time}."
                      value={formData.message_template}
                      onChange={(e) => handleFieldChange('message_template', e.target.value)}
                      className="rounded-xl text-xs py-2 leading-relaxed"
                    />
                    <FieldError error={errors.message_template} />
                  </div>
                </div>

                {/* SECTION 4: ACTIVATION & STATUS TOGGLE */}
                <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Preset Active Status</span>
                    <span className="text-[11px] text-muted-foreground">Enable this template for real-time system dispatch</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${formData.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                      {formData.is_active ? 'Active' : 'Off'}
                    </span>
                    <ToggleSwitch
                      checked={Boolean(formData.is_active)}
                      onChange={(checked) => handleFieldChange('is_active', checked)}
                    />
                  </div>
                </div>
              </form>
            ) : (
              /* LIVE PREVIEW TAB */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Eye size={16} className="text-primary" />
                    <span>Live Multi-Channel Dispatch Preview</span>
                  </div>

                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveDevice('desktop')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        activeDevice === 'desktop' ? 'bg-card text-primary shadow-2xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <Monitor size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDevice('mobile')}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        activeDevice === 'mobile' ? 'bg-card text-primary shadow-2xs font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <Bell size={15} />
                    </button>
                  </div>
                </div>

                {activeDevice === 'desktop' ? (
                  /* Desktop Toast Preview */
                  <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center min-h-[240px]">
                    <div className="w-full max-w-sm bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold text-slate-200">Enterprise POS</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <h5 className="font-bold text-sm text-white">
                        {renderLiveText(formData.title_template) || 'Notification Subject Preview'}
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {renderLiveText(formData.message_template) || 'Template payload content will render dynamically here...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Mobile Screen Push Preview */
                  <div className="flex justify-center p-4 bg-muted/20 rounded-3xl border border-border/40">
                    <div className="w-64 h-[320px] bg-slate-950 border-4 border-slate-700 rounded-[32px] p-3 shadow-2xl flex flex-col space-y-3 relative overflow-hidden">
                      <div className="w-16 h-2 bg-slate-800 rounded-full mx-auto" />
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-sky-400">Enterprise POS</span>
                          <span>now</span>
                        </div>
                        <h6 className="font-bold text-xs text-white leading-tight">
                          {renderLiveText(formData.title_template) || 'Mobile Push Subject'}
                        </h6>
                        <p className="text-[11px] text-slate-300 line-clamp-3 leading-snug">
                          {renderLiveText(formData.message_template) || 'Mobile notification preview message...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 4. STICKY FOOTER ────────────────────────────────────────────── */}
          <div className="p-4 border-t border-border bg-card flex items-center justify-between shrink-0">
            <div className="text-xs text-muted-foreground font-medium">
              {template ? `Editing preset #${template.code}` : 'Drafting new template preset'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                <Save size={14} />
                <span>{loading ? 'Saving...' : 'Save Template'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TemplateEditorModal
