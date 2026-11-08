import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ShoppingBag, ShoppingCart, ShieldAlert, User, Cpu, Circle,
  Search, CheckCheck, ExternalLink, Archive, AlertTriangle, AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'
import { useThemeStore } from '@/stores/themeStore'
import type { NotificationItem, NotificationType } from '@/pages/notifications/types/notification.types'
import { formatDistanceToNow } from 'date-fns'


const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ tab: activeTab, search: searchQuery })
    }
  }, [isOpen, activeTab, searchQuery, fetchNotifications])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />
      case 'sales':
        return <ShoppingCart className="w-4 h-4 text-blue-500" />
      case 'inventory':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />
      case 'customer':
      case 'employee':
        return <User className="w-4 h-4 text-purple-500" />
      case 'security':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      default:
        return <Cpu className="w-4 h-4 text-primary" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">Critical</span>
      case 'high':
        return <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">High</span>
      default:
        return null
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return dateStr
    }
  }

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.id)
    }
    if (item.action_url) {
      navigate(item.action_url)
      setIsOpen(false)
    }
  }

  const { navbar } = useThemeStore()
  const customTextColor = navbar?.textColor

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: customTextColor || undefined }}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-200 relative flex-shrink-0 cursor-pointer"
        title={t('common.notifications', 'Notifications')}
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-card animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed sm:absolute top-14 sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none bg-card border border-border rounded-2xl shadow-xl z-50 p-2 backdrop-blur-md flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {t('common.notifications', 'Notifications')}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} {t('common.new', 'new')}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] text-primary hover:text-primary/80 font-bold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  {t('common.mark_all_read', 'Mark all read')}
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="p-2 border-b border-border/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('common.search_notifications', 'Search notifications...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/30 bg-muted/20 text-[11px]">
              {(['all', 'unread', 'read', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {t(`common.${tab}`, tab)}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-border/40 max-h-80 overflow-y-auto no-scrollbar py-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="w-6 h-6 opacity-30" />
                  <span>{t('common.no_notifications', 'No notifications found')}</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full flex items-start gap-3 p-2.5 text-left transition-all duration-150 rounded-xl mt-0.5
                      ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10 font-medium' : 'hover:bg-muted/40 opacity-85'}`}
                  >
                    <div className="p-2 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-foreground truncate">{n.title}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getPriorityBadge(n.priority)}
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(n.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.is_read && (
                      <Circle className="w-2 h-2 text-primary fill-primary mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 mt-1 pt-1.5 text-center">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/notifications')
                }}
                className="w-full py-1.5 text-[11px] text-primary hover:text-primary/80 font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t('common.view_all_notifications', 'View All Notifications')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown
