import React, { useState, useEffect } from 'react'
import {
  Send, Sparkles, Image as ImageIcon, Link as LinkIcon, Users, Shield,
  Layers, Radio, Globe, Loader2
} from 'lucide-react'
import notificationService from '@/services/notificationService'
import type { NotificationTemplateItem } from '../types/notification.types'
import { ModernSelect } from '@/components/shared/ModernSelect'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/common/forms/Input'
import { Textarea } from '@/components/ui/textarea'
import { FieldLabel, FieldError } from '@/components/common/forms/FormField'
import ToggleSwitch from '@/components/common/ToggleSwitch'

interface CreateNotificationModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (newItem?: NotificationTemplateItem | any) => void
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ open, onClose, onSuccess }) => {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([])

  const [formData, setFormData] = useState<Record<string, any>>({
    template_code: '',
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    channels: ['database'],
    image: '',
    action_url: '',
    role: '',
    permission: '',
    is_global: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      fetchDropdowns()
      setFormData({
        template_code: '',
        title: '',
        message: '',
        type: 'system',
        priority: 'normal',
        channels: ['database'],
        image: '',
        action_url: '',
        role: '',
        permission: '',
        is_global: false,
      })
      setErrors({})
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

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleTemplateSelect = (code: string) => {
    handleFieldChange('template_code', code)
    const tmpl = templates.find((t) => t.code === code)
    if (tmpl) {
      setFormData((prev) => ({
        ...prev,
        template_code: code,
        title: tmpl.title_template || '',
        message: tmpl.message_template || '',
        type: tmpl.type || 'system',
        priority: tmpl.priority || 'normal',
      }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title?.trim()) newErrors.title = 'Please enter title'
    if (!formData.message?.trim()) newErrors.message = 'Please enter message'
    if (!formData.type) newErrors.type = 'Please select category'
    if (!formData.priority) newErrors.priority = 'Please select priority'

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
      const payload = {
        ...formData,
      }

      const createdItem = await notificationService.createNotification(payload)
      sound.playSuccess()
      toast.success('Notification created and dispatched successfully!')
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
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0 overflow-hidden bg-card">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-card">
          <SheetTitle className="font-extrabold text-base text-foreground leading-snug tracking-tight">
            Create Notification
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground font-medium">
            Publish instant alert message across all channels & targeted roles
          </p>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="p-5 bg-muted/20 border border-border/80 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-foreground">Basic Information</span>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">Required</span>
            </div>

            <div className="space-y-1">
              <FieldLabel label="Quick Fill from Preset Template" />
              <ModernSelect
                value={formData.template_code || ''}
                onChange={(val) => handleTemplateSelect(String(val || ''))}
                options={templateOptions}
                placeholder="Select preset template..."
                icon={<Sparkles className="w-4 h-4 text-amber-500" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1">
                <FieldLabel label="Notification Title" required />
                <Input
                  placeholder="e.g. System Maintenance Scheduled"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  error={errors.title}
                  className="font-semibold"
                />
                <FieldError error={errors.title} />
              </div>

              <div className="space-y-1">
                <FieldLabel label="Notification Category" required />
                <ModernSelect
                  value={formData.type || 'system'}
                  onChange={(val) => handleFieldChange('type', String(val))}
                  options={categoryOptions}
                  placeholder="Select Category"
                  icon={<Layers className="w-4 h-4 text-primary" />}
                  error={errors.type}
                />
                <FieldError error={errors.type} />
              </div>
            </div>
          </div>

          {/* SECTION 2: MESSAGE CONTENT & CHANNELS */}
          <div className="p-5 bg-muted/20 border border-border/80 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-foreground">Message & Delivery Channels</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Multi-channel routing</span>
            </div>

            <div className="space-y-1">
              <FieldLabel label="Notification Message Detail" required />
              <Textarea
                rows={3}
                placeholder="Enter detailed alert notification content..."
                value={formData.message}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                className="rounded-xl text-xs p-3 leading-relaxed"
              />
              <FieldError error={errors.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1">
                <FieldLabel label="Priority Level" required />
                <ModernSelect
                  value={formData.priority || 'normal'}
                  onChange={(val) => handleFieldChange('priority', String(val))}
                  options={priorityOptions}
                  placeholder="Select Priority"
                  icon={<Shield className="w-4 h-4 text-rose-500" />}
                  error={errors.priority}
                />
                <FieldError error={errors.priority} />
              </div>

              <div className="space-y-1">
                <FieldLabel label="Delivery Channels" />
                <ModernSelect
                  multiple
                  value={formData.channels || ['database']}
                  onChange={(val) => handleFieldChange('channels', val)}
                  options={channelOptions}
                  placeholder="Select channels"
                  icon={<Radio className="w-4 h-4 text-indigo-500" />}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MEDIA & ACTION LINKS */}
          <div className="p-5 bg-muted/20 border border-border/80 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-foreground">Media & Action Link</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Optional attachments</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1">
                <FieldLabel label="Image Banner URL" />
                <Input
                  icon={<ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  placeholder="https://example.com/banner.jpg"
                  value={formData.image}
                  onChange={(e) => handleFieldChange('image', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <FieldLabel label="Action Target Link" />
                <Input
                  icon={<LinkIcon className="w-4 h-4 text-muted-foreground" />}
                  placeholder="/sales/123 or https://..."
                  value={formData.action_url}
                  onChange={(e) => handleFieldChange('action_url', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: TARGETING & SCOPE */}
          <div className="p-5 bg-muted/20 border border-border/80 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-foreground">Target Role & Scope</span>
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">Access Control</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1">
                <FieldLabel label="Target Role" />
                <Input
                  icon={<Shield className="w-4 h-4 text-muted-foreground" />}
                  placeholder="e.g. Store Manager, Cashier"
                  value={formData.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <FieldLabel label="Target Permission" />
                <Input
                  icon={<Users className="w-4 h-4 text-muted-foreground" />}
                  placeholder="e.g. sales.view, orders.create"
                  value={formData.permission}
                  onChange={(e) => handleFieldChange('permission', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/70 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-foreground block">Global System Broadcast</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Send alert to all active users across all enterprise branches</span>
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(formData.is_global)}
                onChange={(checked) => handleFieldChange('is_global', checked)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-3 px-6 border-t border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant delivery dispatch mode</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => handleSubmit()}
              disabled={loading}
              className="gap-2 font-bold shadow-md shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Dispatch Notification</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CreateNotificationModal
