import React, { useEffect, useState } from 'react'
import {
  ExternalLink,
  Mail, Send, Smartphone, Database,
  Activity, Users, Loader2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
        return (
          <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Critical
          </span>
        )
      case 'high':
        return (
          <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            High
          </span>
        )
      case 'normal':
        return (
          <span className="font-medium text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Normal
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Low
          </span>
        )
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col gap-0 overflow-hidden bg-card">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-bold text-base text-foreground leading-tight">
              Notification Details
            </SheetTitle>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{notification.id}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-normal">System Notification Overview</p>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Title & Status */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="capitalize font-bold rounded-lg text-xs px-2.5 py-0.5 bg-muted text-foreground border border-border">
                {notification.type}
              </span>
              <div className="flex items-center gap-2">
                {getPriorityBadge(notification.priority)}
                {notification.is_global && (
                  <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Global Broadcast
                  </span>
                )}
              </div>
            </div>

            <h2 className="font-bold text-lg text-foreground">{notification.title}</h2>
            <p className="text-xs font-medium text-foreground/90 leading-relaxed bg-card p-3.5 rounded-xl border border-border/80">
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
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">Created By</span>
              <span className="font-bold text-foreground">{notification.creator_name || 'System'}</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">Created Date</span>
              <span className="font-bold text-foreground">
                {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">Company Scope</span>
              <span className="font-bold text-foreground">{notification.company_name || 'All Companies'}</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">Branch Scope</span>
              <span className="font-bold text-foreground">{notification.branch_name || 'All Branches'}</span>
            </div>
          </div>

          {/* Tabbed Info: Delivery Log & Read Users */}
          <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-2xs">
            <Tabs defaultValue="delivery" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="delivery" className="flex items-center gap-1.5 text-xs font-bold">
                  <Activity className="size-3.5 text-primary" />
                  Delivery Timeline
                </TabsTrigger>
                <TabsTrigger value="recipients" className="flex items-center gap-1.5 text-xs font-bold">
                  <Users className="size-3.5 text-primary" />
                  Read History ({logData?.read_count || 0}/{logData?.recipient_count || 0})
                </TabsTrigger>
              </TabsList>

              {/* Delivery Tab Content */}
              <TabsContent value="delivery">
                {loading ? (
                  <div className="py-8 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
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
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  log.status === 'sent'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}
                              >
                                {log.status}
                              </span>
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
                )}
              </TabsContent>

              {/* Recipients Tab Content */}
              <TabsContent value="recipients">
                {loading ? (
                  <div className="py-8 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 max-h-64 overflow-y-auto no-scrollbar">
                    {logData?.read_users && logData.read_users.length > 0 ? (
                      logData.read_users.map((ru) => (
                        <div
                          key={ru.user_id}
                          className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-border/30 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {ru.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block">{ru.name}</span>
                              {ru.email && <span className="text-[10px] text-muted-foreground">{ru.email}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            {ru.is_read ? (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Read {ru.read_at ? format(new Date(ru.read_at), 'HH:mm') : ''}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                Unread
                              </span>
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
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NotificationDetailDrawer
