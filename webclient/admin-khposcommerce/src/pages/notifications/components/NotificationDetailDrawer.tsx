import React, { useEffect, useState } from 'react'
import { Drawer, Tag, Tabs, Tooltip, Avatar, Spin, Button } from 'antd'
import {
  CheckCheck, Clock, Shield, User, Building2, ExternalLink,
  Mail, Send, Smartphone, Database, CheckCircle2, X, AlertCircle,
  FileText, Activity, Users
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { CloseButton } from '@/components/common'
import type { NotificationItem, NotificationLogsResponse } from '../types/notification.types'
import notificationService from '@/services/notificationService'

interface NotificationDetailDrawerProps {
  open: boolean
  notification: NotificationItem | null
  onClose: () => void
}

const NotificationDetailDrawer: React.FC<NotificationDetailDrawerProps> = ({ open, notification, onClose }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [logData, setLogData] = useState<NotificationLogsResponse | null>(null)

  useEffect(() => {
    if (open && notification) {
      fetchLogs(notification.id)
    }
  }, [open, notification])

  const fetchLogs = async (id: number) => {
    setLoading(true)
    try {
      const res = await notificationService.getNotificationLogs(id)
      setLogData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!notification) return null

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
        return <Tag color="error" className="font-bold uppercase">Critical</Tag>
      case 'high':
        return <Tag color="warning" className="font-bold uppercase">High</Tag>
      case 'normal':
        return <Tag color="blue" className="font-medium">Normal</Tag>
      default:
        return <Tag color="default">Low</Tag>
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={540}
      closeIcon={false}
      title={
        <div className="py-0.5 space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">Notification Details</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{notification.id}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">System Notification Overview</p>
        </div>
      }
      extra={
        <CloseButton onClose={onClose} size="md" color="rose" />
      }
      className="enterprise-drawer"
    >
      <div className="space-y-6">
        {/* Header Title & Status */}
        <div className="p-4 bg-card border border-border/50 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <Tag className="capitalize font-bold rounded-lg text-xs">{notification.type}</Tag>
            <div className="flex items-center gap-2">
              {getPriorityBadge(notification.priority)}
              {notification.is_global && (
                <Tag color="purple" className="font-bold">Global Broadcast</Tag>
              )}
            </div>
          </div>

          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">{notification.title}</h2>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {notification.message}
          </p>

          {notification.action_url && (
            <a
              href={notification.action_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
            >
              <span>{t('notification.action_url', 'Action Link URL')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-card border border-border/60 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Created By</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{notification.creator_name || 'System'}</span>
          </div>
          <div className="p-3 bg-card border border-border/60 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Created Date</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <div className="p-3 bg-card border border-border/60 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Company Scope</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{notification.company_name || 'All Companies'}</span>
          </div>
          <div className="p-3 bg-card border border-border/60 rounded-xl">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Branch Scope</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{notification.branch_name || 'All Branches'}</span>
          </div>
        </div>

        {/* Tabbed Info: Delivery Log & Read Users */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <Tabs
            items={[
              {
                key: 'delivery',
                label: (
                  <span className="flex items-center gap-1.5 font-bold text-xs">
                    <Activity className="w-4 h-4 text-primary" />
                    Delivery Timeline
                  </span>
                ),
                children: (
                  <Spin spinning={loading}>
                    <div className="space-y-3 pt-2">
                      {logData?.logs && logData.logs.length > 0 ? (
                        logData.logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-2.5 bg-muted/30 rounded-xl border border-border/40 text-xs"
                          >
                            <div className="p-1.5 bg-card rounded-lg text-primary mt-0.5">
                              {log.channel === 'email' ? (
                                <Mail className="w-4 h-4 text-blue-500" />
                              ) : log.channel === 'telegram' ? (
                                <Send className="w-4 h-4 text-sky-500" />
                              ) : log.channel === 'sms' ? (
                                <Smartphone className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Database className="w-4 h-4 text-purple-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold uppercase text-[10px] text-foreground">
                                  {log.channel} Channel
                                </span>
                                <Tag color={log.status === 'sent' ? 'success' : 'error'} className="m-0 text-[10px]">
                                  {log.status}
                                </Tag>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{log.response}</p>
                              <span className="text-[10px] text-muted-foreground block mt-1">
                                {log.sent_at ? format(new Date(log.sent_at), 'HH:mm:ss dd/MM/yyyy') : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                          No delivery logs recorded
                        </div>
                      )}
                    </div>
                  </Spin>
                ),
              },
              {
                key: 'recipients',
                label: (
                  <span className="flex items-center gap-1.5 font-bold text-xs">
                    <Users className="w-4 h-4 text-primary" />
                    Read History ({logData?.read_count || 0}/{logData?.recipient_count || 0})
                  </span>
                ),
                children: (
                  <Spin spinning={loading}>
                    <div className="space-y-2 pt-2 max-h-64 overflow-y-auto no-scrollbar">
                      {logData?.read_users && logData.read_users.length > 0 ? (
                        logData.read_users.map((ru) => (
                          <div
                            key={ru.user_id}
                            className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-border/30 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar size="small" className="bg-primary/20 text-primary font-bold">
                                {ru.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>
                                <span className="font-semibold text-foreground block">{ru.name}</span>
                                {ru.email && <span className="text-[10px] text-muted-foreground">{ru.email}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              {ru.is_read ? (
                                <Tag color="success" className="m-0 text-[10px]">
                                  Read {ru.read_at ? format(new Date(ru.read_at), 'HH:mm') : ''}
                                </Tag>
                              ) : (
                                <Tag color="default" className="m-0 text-[10px]">Unread</Tag>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                          Global notification / No direct recipient list
                        </div>
                      )}
                    </div>
                  </Spin>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Drawer>
  )
}

export default NotificationDetailDrawer
