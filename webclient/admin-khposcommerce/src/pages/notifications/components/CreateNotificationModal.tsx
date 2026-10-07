import React, { useState, useEffect } from 'react'
import { Drawer, Form, Input, Switch } from 'antd'
import {
  Bell, Send, Sparkles, Image as ImageIcon, Link as LinkIcon, Users, Shield, X,
  Layers, Radio, AlertTriangle, CheckCircle2, MessageSquare, Globe, ChevronRight
} from 'lucide-react'
import notificationService from '@/services/notificationService'
import type { NotificationTemplateItem } from '../types/notification.types'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'

interface CreateNotificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (newItem?: NotificationTemplateItem | any) => void
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ open, onClose, onSuccess }) => {
  const toast = useToast()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([])

  // Watch fields for ModernSelect synchronization
  const templateCodeValue = Form.useWatch('template_code', form)
  const typeValue = Form.useWatch('type', form)
  const priorityValue = Form.useWatch('priority', form)
  const channelsValue = Form.useWatch('channels', form)

  useEffect(() => {
    if (open) {
      fetchDropdowns()
    }
  }, [open])

  const fetchDropdowns = async () => {
    try {
      const tmplRes = await notificationService.getTemplates({ is_active: true, per_page: 100 })
      setTemplates(tmplRes.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleTemplateSelect = (code: string) => {
    const tmpl = templates.find((t) => t.code === code)
    if (tmpl) {
      form.setFieldsValue({
        title: tmpl.title_template,
        message: tmpl.message_template,
        type: tmpl.type,
        priority: tmpl.priority,
        icon: tmpl.icon,
        color: tmpl.color,
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        ...values,
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
      }

      const createdItem = await notificationService.createNotification(payload)
      sound.playSuccess()
      toast.success('Notification created and dispatched successfully!')
      form.resetFields()
      onSuccess(createdItem)
      onClose()
    } catch (error: any) {
      sound.playError()
      toast.error(error.response?.data?.message || 'Failed to create notification.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = [
    'system', 'inventory', 'purchase', 'sales', 'customer', 'supplier',
    'employee', 'attendance', 'payroll', 'finance', 'expense', 'payment',
    'security', 'report', 'warning', 'success', 'error'
  ].map((cat) => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
  }))

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' },
  ]

  const channelOptions = [
    { value: 'database', label: 'Database (In-App)' },
    { value: 'email', label: 'Email Gateway' },
    { value: 'telegram', label: 'Telegram Bot' },
    { value: 'sms', label: 'SMS Gateway' },
    { value: 'push', label: 'Mobile Push' },
  ]

  const templateOptions = [
    { value: '', label: '-- None (Custom) --' },
    ...templates.map((tmpl) => ({
      value: tmpl.code,
      label: `[${tmpl.code}] ${tmpl.name}`,
    }))
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={660}
      closeIcon={false}
      title={
        <div className="py-1">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
            Create Notification
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Publish instant alert message across all channels & targeted roles
          </p>
        </div>
      }
      extra={
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground rounded-2xl hover:bg-muted/80 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      }
      footer={
        <div className="flex items-center justify-between py-2 px-1">
          <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant delivery dispatch mode</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-muted-foreground border border-border/80 bg-card rounded-xl hover:bg-muted transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Notification</span>
            </button>
          </div>
        </div>
      }
      className="enterprise-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ priority: 'normal', type: 'system', is_global: false, channels: ['database'] }}
        className="space-y-5"
      >
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl space-y-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-foreground">Basic Information</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">Required</span>
          </div>

          <Form.Item
            label={<span className="text-xs font-bold text-foreground">Quick Fill from Preset Template</span>}
            name="template_code"
            className="mb-3"
          >
            <ModernSelect
              value={templateCodeValue || ''}
              onChange={(val) => {
                const strVal = String(val || '')
                form.setFieldValue('template_code', strVal)
                if (strVal) handleTemplateSelect(strVal)
              }}
              options={templateOptions}
              placeholder="Select preset template..."
              icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notification Title <span className="text-rose-500">*</span></span>}
              name="title"
              rules={[{ required: true, message: 'Please enter title' }]}
              className="mb-0"
            >
              <Input
                placeholder="e.g. System Maintenance Scheduled"
                className="h-10 rounded-xl text-xs py-2 bg-background border-border/80 text-foreground focus:border-primary"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notification Category <span className="text-rose-500">*</span></span>}
              name="type"
              rules={[{ required: true }]}
              className="mb-0"
            >
              <ModernSelect
                value={typeValue || 'system'}
                onChange={(val) => form.setFieldValue('type', String(val))}
                options={categoryOptions}
                placeholder="Select Category"
                icon={<Layers className="w-4 h-4 text-primary" />}
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 2: MESSAGE CONTENT & CHANNELS */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl space-y-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Message & Delivery Channels</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Multi-channel routing</span>
          </div>

          <Form.Item
            label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notification Message Detail <span className="text-rose-500">*</span></span>}
            name="message"
            rules={[{ required: true, message: 'Please enter message' }]}
            className="mb-4"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter detailed alert notification content..."
              className="rounded-xl text-xs p-3 bg-background border-border/80 text-foreground focus:border-primary"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Priority Level <span className="text-rose-500">*</span></span>}
              name="priority"
              rules={[{ required: true }]}
              className="mb-0"
            >
              <ModernSelect
                value={priorityValue || 'normal'}
                onChange={(val) => form.setFieldValue('priority', String(val))}
                options={priorityOptions}
                placeholder="Select Priority"
                icon={<Shield className="w-4 h-4 text-rose-500" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Delivery Channels</span>}
              name="channels"
              className="mb-0"
            >
              <ModernSelect
                multiple
                value={channelsValue || ['database']}
                onChange={(val) => form.setFieldValue('channels', val)}
                options={channelOptions}
                placeholder="Select channels"
                icon={<Radio className="w-4 h-4 text-indigo-500" />}
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 3: MEDIA & ACTION LINKS */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl space-y-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Media & Action Link</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Optional attachments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Image Banner URL</span>}
              name="image"
              className="mb-0"
            >
              <Input
                prefix={<ImageIcon className="w-4 h-4 text-muted-foreground" />}
                placeholder="https://example.com/banner.jpg"
                className="h-10 rounded-xl text-xs py-2 bg-background border-border/80 text-foreground"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Action Target Link</span>}
              name="action_url"
              className="mb-0"
            >
              <Input
                prefix={<LinkIcon className="w-4 h-4 text-muted-foreground" />}
                placeholder="/sales/123 or https://..."
                className="h-10 rounded-xl text-xs py-2 bg-background border-border/80 text-foreground"
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 4: TARGETING & SCOPE */}
        <div className="p-5 bg-card border border-border/80 rounded-2xl space-y-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Target Role & Scope</span>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">Access Control</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Target Role</span>}
              name="role"
              className="mb-0"
            >
              <Input
                prefix={<Shield className="w-4 h-4 text-muted-foreground" />}
                placeholder="e.g. Store Manager, Cashier"
                className="h-10 rounded-xl text-xs py-2 bg-background border-border/80 text-foreground"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-100">Target Permission</span>}
              name="permission"
              className="mb-0"
            >
              <Input
                prefix={<Users className="w-4 h-4 text-muted-foreground" />}
                placeholder="e.g. sales.view, orders.create"
                className="h-10 rounded-xl text-xs py-2 bg-background border-border/80 text-foreground"
              />
            </Form.Item>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block">Global System Broadcast</span>
                <span className="text-[11px] text-muted-foreground font-medium">Send alert to all active users across all enterprise branches</span>
              </div>
            </div>
            <Form.Item name="is_global" valuePropName="checked" noStyle>
              <Switch className="bg-muted" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Drawer>
  )
}

export default CreateNotificationModal
