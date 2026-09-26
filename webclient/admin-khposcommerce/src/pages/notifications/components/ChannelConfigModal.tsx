import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Button } from 'antd'
import { Settings, Shield, Server, Link as LinkIcon, Key, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.resetFields()
      if (initialValues) {
        form.setFieldsValue(initialValues)
      }
    }
  }, [open, initialValues, form])

  if (!channel) return null

  const handleFinish = (values: any) => {
    onSave(channel, values)
    sound.playSuccess()
    toast.success(`Configuration saved for channel: ${channel.toUpperCase()}`)
    onClose()
  }

  const renderFields = () => {
    switch (channel) {
      case 'email':
        return (
          <>
            <Form.Item label="SMTP Host" name="smtp_host" rules={[{ required: true }]}>
              <Input prefix={<Server className="w-4 h-4 text-muted-foreground" />} placeholder="smtp.mailtrap.io" />
            </Form.Item>
            <Form.Item label="SMTP Port" name="smtp_port" rules={[{ required: true }]}>
              <InputNumber className="w-full" placeholder="587" />
            </Form.Item>
            <Form.Item label="SMTP Username" name="smtp_user">
              <Input placeholder="smtp_user" />
            </Form.Item>
            <Form.Item label="SMTP Password" name="smtp_pass">
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          </>
        )
      case 'telegram':
        return (
          <>
            <Form.Item label="Telegram Bot Token" name="bot_token" rules={[{ required: true }]}>
              <Input prefix={<Key className="w-4 h-4 text-muted-foreground" />} placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" />
            </Form.Item>
            <Form.Item label="Default Chat ID / Channel ID" name="chat_id" rules={[{ required: true }]}>
              <Input prefix={<Radio className="w-4 h-4 text-muted-foreground" />} placeholder="-100123456789" />
            </Form.Item>
          </>
        )
      case 'sms':
        return (
          <>
            <Form.Item label="SMS Provider API Key (Twilio / AWS SNS)" name="api_key" rules={[{ required: true }]}>
              <Input prefix={<Key className="w-4 h-4 text-muted-foreground" />} placeholder="SK_twilio_secret_key" />
            </Form.Item>
            <Form.Item label="Sender Phone Number / Sender ID" name="sender_phone">
              <Input placeholder="+18005550199" />
            </Form.Item>
          </>
        )
      case 'push':
        return (
          <>
            <Form.Item label="Firebase FCM Server Key / Web Push VAPID Key" name="api_key" rules={[{ required: true }]}>
              <Input.Password prefix={<Key className="w-4 h-4 text-muted-foreground" />} placeholder="AAAA..." />
            </Form.Item>
          </>
        )
      case 'slack':
      case 'teams':
      case 'discord':
        return (
          <>
            <Form.Item label={`${channel.toUpperCase()} Incoming Webhook URL`} name="webhook_url" rules={[{ required: true }]}>
              <Input prefix={<LinkIcon className="w-4 h-4 text-muted-foreground" />} placeholder="https://hooks.slack.com/services/..." />
            </Form.Item>
          </>
        )
      default:
        return (
          <>
            <Form.Item label="API Endpoint URL" name="webhook_url">
              <Input prefix={<LinkIcon className="w-4 h-4 text-muted-foreground" />} placeholder="https://api.enterprise.com/webhook" />
            </Form.Item>
            <Form.Item label="Secret Key" name="api_key">
              <Input.Password prefix={<Key className="w-4 h-4 text-muted-foreground" />} placeholder="secret_key" />
            </Form.Item>
          </>
        )
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Settings className="w-5 h-5 text-primary" />
          <span className="capitalize">Configure {channel} Delivery Channel</span>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
        {renderFields()}
        <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
          <Button onClick={onClose}>{t('common.cancel', 'Cancel')}</Button>
          <Button type="primary" htmlType="submit">
            {t('notification.actions.save', 'Save Changes')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ChannelConfigModal
