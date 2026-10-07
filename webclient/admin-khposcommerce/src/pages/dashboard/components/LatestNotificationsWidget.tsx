import React, { useEffect, useState } from 'react'
import { Bell, ShieldAlert, ChevronRight, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import notificationService from '@/services/notificationService'
import type { NotificationItem } from '@/pages/notifications/types/notification.types'
import { formatDistanceToNow } from 'date-fns'


const LatestNotificationsWidget: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatest()
  }, [])

  const fetchLatest = async () => {
    try {
      const res = await notificationService.getNotifications({ per_page: 5 })
      setItems(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Latest System Notifications</h3>
              <span className="text-[11px] text-muted-foreground">Real-time operational activity</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No recent notifications</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/notifications')}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-all cursor-pointer border border-transparent hover:border-border/30"
              >
                <div className="p-2 bg-muted rounded-xl text-primary flex-shrink-0 mt-0.5">
                  {item.priority === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Bell className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground truncate">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(item.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-border/40 pt-3 mt-3">
        <button
          onClick={() => navigate('/notifications')}
          className="w-full py-2 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Open Notification Center</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>
    </div>
  )
}

export default LatestNotificationsWidget
