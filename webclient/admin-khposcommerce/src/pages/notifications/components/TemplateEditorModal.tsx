import React, { useState, useEffect } from 'react'
import { Form, Input, Switch, Tooltip } from 'antd'
import {
  FileText, Sparkles, Monitor, Smartphone, Save, Eye, X,
  Tag, Layers, Bell, CheckCircle2, AlertTriangle, Info, Code, Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { NotificationTemplateItem } from '../types/notification.types'
import notificationService from '@/services/notificationService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import ModernSelect from '@/pages/pos/components/ModernSelect'

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
  { value: 'system', label: 'System Alerts', subtitle: 'Automated system triggers' },
  { value: 'inventory', label: 'Inventory Presets', subtitle: 'Low stock & movements' },
  { value: 'sales', label: 'Sales Presets', subtitle: 'Orders & checkout alerts' },
  { value: 'purchase', label: 'Purchase Presets', subtitle: 'PO & supplier receipts' },
  { value: 'finance', label: 'Finance & Expense', subtitle: 'Payments & cash flow' },
  { value: 'employee', label: 'Employee & Attendance', subtitle: 'Late check-in & shifts' },
  { value: 'security', label: 'Security & Audit', subtitle: 'Login & permission alerts' },
  { value: 'marketing', label: 'Marketing Presets', subtitle: 'Promotions & announcements' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority', badge: 'LOW' },
  { value: 'normal', label: 'Normal Priority', badge: 'NORMAL' },
  { value: 'high', label: 'High Priority', badge: 'HIGH' },
  { value: 'critical', label: 'Critical Priority', badge: 'CRITICAL' },
]

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  open,
  template,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('desktop')

  const [titleTemplate, setTitleTemplate] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [isActiveStatus, setIsActiveStatus] = useState(true)

  useEffect(() => {
    if (open) {
      if (template) {
        form.setFieldsValue(template)
        setTitleTemplate(template.title_template || '')
        setMessageTemplate(template.message_template || '')
        setIsActiveStatus(!!template.is_active)
      } else {
        form.resetFields()
        const initialVal = { priority: 'normal', type: 'system', is_active: true }
        form.setFieldsValue(initialVal)
        setTitleTemplate('')
        setMessageTemplate('')
        setIsActiveStatus(true)
      }
    }
  }, [open, template, form])

  if (!open) return null

  const handleInsertVariable = (variable: string) => {
    const currentMsg = form.getFieldValue('message_template') || ''
    const updated = currentMsg ? `${currentMsg} ${variable}` : variable
    form.setFieldsValue({ message_template: updated })
    setMessageTemplate(updated)
  }

  const renderLiveText = (tmpl: string) => {
    let rendered = tmpl || ''
    Object.entries(SAMPLE_DATA).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v)
      rendered = rendered.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
    })
    return rendered
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      let resultItem: NotificationTemplateItem | null = null

      if (template) {
        resultItem = await notificationService.updateTemplate(template.id, values)
        sound.playSuccess()
        toast.success('Notification template updated successfully!')
      } else {
        resultItem = await notificationService.createTemplate(values)
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

        {/* Slide-over Drawer Panel matching Inventory & Preview Drawers */}
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
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(_, all) => {
                setTitleTemplate(all.title_template || '')
                setMessageTemplate(all.message_template || '')
                setIsActiveStatus(all.is_active !== false)
              }}
            >
              {activeTab === 'editor' ? (
                <div className="space-y-5">
                  {/* SECTION 1: BASIC IDENTIFICATION */}
                  <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                      BASIC IDENTIFICATION
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        label={<span className="text-xs font-bold text-foreground">Template Code</span>}
                        name="code"
                        rules={[{ required: true, message: 'Please enter template code' }]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="e.g. ATTENDANCE_LATE"
                          disabled={!!template}
                          className="rounded-xl text-xs h-[38px] font-mono font-bold border-border/80 focus:border-primary"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-xs font-bold text-foreground">Template Name</span>}
                        name="name"
                        rules={[{ required: true, message: 'Please enter template name' }]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="e.g. Late Attendance Alert"
                          className="rounded-xl text-xs h-[38px] font-semibold border-border/80 focus:border-primary"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* SECTION 2: CATEGORIZATION & PRIORITY (USING MODERNSELECT) */}
                  <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                      CATEGORIZATION & PRIORITY
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        label={<span className="text-xs font-bold text-foreground">Preset Category (Type)</span>}
                        name="type"
                        rules={[{ required: true, message: 'Please select preset category' }]}
                        className="mb-0"
                      >
                        <ModernSelect
                          placeholder="Select category type..."
                          options={TYPE_OPTIONS}
                          size="md"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-xs font-bold text-foreground">Priority Level</span>}
                        name="priority"
                        rules={[{ required: true, message: 'Please select priority' }]}
                        className="mb-0"
                      >
                        <ModernSelect
                          placeholder="Select priority..."
                          options={PRIORITY_OPTIONS}
                          size="md"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* SECTION 3: NOTIFICATION PAYLOAD CONTENT */}
                  <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-4 shadow-2xs">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                      NOTIFICATION PAYLOAD CONTENT
                    </h4>

                    <Form.Item
                      label={<span className="text-xs font-bold text-foreground">Title Template (Subject)</span>}
                      name="title_template"
                      rules={[{ required: true, message: 'Please enter title template' }]}
                    >
                      <Input
                        placeholder="e.g. Late Attendance Alert: {employee_name}"
                        className="rounded-xl text-xs h-[38px] font-semibold border-border/80 focus:border-primary"
                      />
                    </Form.Item>

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
                            className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Form.Item
                      label={<span className="text-xs font-bold text-foreground">Message Payload Template</span>}
                      name="message_template"
                      rules={[{ required: true, message: 'Please enter message template payload' }]}
                      className="mb-0"
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="e.g. Employee {employee_name} checked in late at {check_in_time}."
                        className="rounded-xl text-xs py-2 leading-relaxed font-sans"
                      />
                    </Form.Item>
                  </div>

                  {/* SECTION 4: ACTIVATION & STATUS TOGGLE */}
                  <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Preset Active Status</span>
                      <span className="text-[11px] text-muted-foreground">Enable this template for real-time system dispatch</span>
                    </div>

                    <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isActiveStatus ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isActiveStatus ? 'Active' : 'Off'}
                        </span>
                        <Switch
                          checked={isActiveStatus}
                          onChange={(checked) => setIsActiveStatus(checked)}
                          style={{ backgroundColor: isActiveStatus ? 'hsl(var(--primary))' : undefined }}
                        />
                      </div>
                    </Form.Item>
                  </div>
                </div>
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
                        <Smartphone size={15} />
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
                          {renderLiveText(titleTemplate) || 'Notification Subject Preview'}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {renderLiveText(messageTemplate) || 'Template payload content will render dynamically here...'}
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
                            {renderLiveText(titleTemplate) || 'Mobile Push Subject'}
                          </h6>
                          <p className="text-[11px] text-slate-300 line-clamp-3 leading-snug">
                            {renderLiveText(messageTemplate) || 'Mobile notification preview message...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Form>
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
                onClick={handleSubmit}
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
