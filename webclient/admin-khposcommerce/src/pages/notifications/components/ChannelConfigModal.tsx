import React, { useState, useEffect } from 'react'
import { Settings, Server, Link as LinkIcon, Key, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/common/forms/Input'
import { FieldLabel } from '@/components/common/forms/FormField'
import type { ChannelCredentials } from '../types/notification.types'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'

interface ChannelConfigModalProps {
  open: boolean
  channel: string | null
  initialValues?: ChannelCredentials
  onClose: () => void
  onSave: (channel: string, creds: ChannelCredentials) => void
}

const ChannelConfigModal: React.FC<ChannelConfigModalProps> = ({
  open,
  channel,
  initialValues,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation()
  const toast = useToast()
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (open) {
      setFormData(initialValues || {})
    }
  }, [open, initialValues])

  if (!channel) return null

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(channel, formData as ChannelCredentials)
    sound.playSuccess()
    toast.success(`Configuration saved for channel: ${channel.toUpperCase()}`)
    onClose()
  }

  const renderFields = () => {
    switch (channel) {
      case 'email':
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label="SMTP Host" required />
              <Input
                icon={<Server className="w-4 h-4 text-muted-foreground" />}
                placeholder="smtp.mailtrap.io"
                value={formData.smtp_host || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="SMTP Port" required />
              <Input
                type="number"
                placeholder="587"
                value={formData.smtp_port || ''}
                onChange={(e) => handleChange('smtp_port', Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="SMTP Username" />
              <Input
                placeholder="smtp_user"
                value={formData.smtp_user || ''}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="SMTP Password" />
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.smtp_pass || ''}
                onChange={(e) => handleChange('smtp_pass', e.target.value)}
              />
            </div>
          </>
        )
      case 'telegram':
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label="Telegram Bot Token" required />
              <Input
                icon={<Key className="w-4 h-4 text-muted-foreground" />}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={formData.bot_token || ''}
                onChange={(e) => handleChange('bot_token', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="Default Chat ID / Channel ID" required />
              <Input
                icon={<Radio className="w-4 h-4 text-muted-foreground" />}
                placeholder="-100123456789"
                value={formData.chat_id || ''}
                onChange={(e) => handleChange('chat_id', e.target.value)}
                required
              />
            </div>
          </>
        )
      case 'sms':
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label="SMS Provider API Key (Twilio / AWS SNS)" required />
              <Input
                icon={<Key className="w-4 h-4 text-muted-foreground" />}
                placeholder="SK_twilio_secret_key"
                value={formData.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="Sender Phone Number / Sender ID" />
              <Input
                placeholder="+18005550199"
                value={formData.sender_phone || ''}
                onChange={(e) => handleChange('sender_phone', e.target.value)}
              />
            </div>
          </>
        )
      case 'push':
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label="Firebase FCM Server Key / Web Push VAPID Key" required />
              <Input
                type="password"
                icon={<Key className="w-4 h-4 text-muted-foreground" />}
                placeholder="AAAA..."
                value={formData.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
                required
              />
            </div>
          </>
        )
      case 'slack':
      case 'teams':
      case 'discord':
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label={`${channel.toUpperCase()} Incoming Webhook URL`} required />
              <Input
                icon={<LinkIcon className="w-4 h-4 text-muted-foreground" />}
                placeholder="https://hooks.slack.com/services/..."
                value={formData.webhook_url || ''}
                onChange={(e) => handleChange('webhook_url', e.target.value)}
                required
              />
            </div>
          </>
        )
      default:
        return (
          <>
            <div className="space-y-1.5">
              <FieldLabel label="API Endpoint URL" />
              <Input
                icon={<LinkIcon className="w-4 h-4 text-muted-foreground" />}
                placeholder="https://api.enterprise.com/webhook"
                value={formData.webhook_url || ''}
                onChange={(e) => handleChange('webhook_url', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel label="Secret Key" />
              <Input
                type="password"
                icon={<Key className="w-4 h-4 text-muted-foreground" />}
                placeholder="secret_key"
                value={formData.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
              />
            </div>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Settings className="w-5 h-5 text-primary" />
            <DialogTitle className="capitalize">
              Configure {channel} Delivery Channel
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {renderFields()}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="default">
              {t('notification.actions.save', 'Save Changes')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChannelConfigModal
