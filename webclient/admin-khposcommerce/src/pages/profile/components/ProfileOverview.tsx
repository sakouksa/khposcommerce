import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Key, Activity, Award, CheckCircle2, History, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/services/profileService'
import { useThemeStore } from '@/stores/themeStore'

interface ProfileOverviewProps {
  profile: UserProfile
  activities: any[]
  permissionsCount: number
  loginCount: number
}

const ROLE_TRANSLATIONS: Record<string, Record<string, string>> = {
  super_admin: { km: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់', en: 'Super Admin', zh: '超级管理员', th: 'ผู้ดูแลระบบระดับสูง', vi: 'Quản trị viên cấp cao' },
  admin: { km: 'អ្នកគ្រប់គ្រង', en: 'Admin', zh: '管理员', th: 'ผู้ดูแลระบบ', vi: 'Quản trị viên' },
  manager: { km: 'អ្នកចាត់ការទូទៅ', en: 'General Manager', zh: '总经理', th: 'ผู้จัดการทั่วไป', vi: 'Tổng quản lý' },
  cashier: { km: 'អ្នកគិតប្រាក់ POS', en: 'POS Cashier', zh: 'POS收银员', th: 'พนักงานแคชเชียร์ POS', vi: 'Thu ngân POS' },
  warehouse_manager: { km: 'អ្នកគ្រប់គ្រងឃ្លាំង', en: 'Warehouse Manager', zh: '仓库主管', th: 'ผู้จัดการคลังสินค้า', vi: 'Quản lý kho' },
  staff: { km: 'បុគ្គលិក', en: 'Staff', zh: '员工', th: 'พนักงาน', vi: 'Nhân viên' },
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  profile,
  activities,
  permissionsCount,
  loginCount,
}) => {
  const { t } = useTranslation('profile')
  const { language } = useThemeStore()
  const langKey = language || 'km'

  const rawRole = (profile.roles?.[0] || 'super_admin').toLowerCase().replace(/\s+/g, '_')
  const roleName = ROLE_TRANSLATIONS[rawRole]?.[langKey] || ROLE_TRANSLATIONS['super_admin']?.[langKey] || 'Super Admin'

  const stats = [
    {
      label: t('overview_tab.account_status', 'Account Status'),
      value: profile.is_active ? t('overview_tab.active', 'Active') : t('overview_tab.inactive', 'Inactive'),
      icon: <Activity className="text-emerald-500" size={22} />,
      bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t('overview_tab.role_tier', 'Role Tier'),
      value: roleName,
      icon: <Award className="text-blue-500" size={22} />,
      bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: t('overview_tab.assigned_permissions', 'Assigned Permissions'),
      value: `${permissionsCount} ${t('overview_tab.actions', 'actions')}`,
      icon: <Key className="text-amber-500" size={22} />,
      bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      label: t('overview_tab.total_sessions', 'Total Sessions Logged'),
      value: `${loginCount} ${t('overview_tab.logins', 'logins')}`,
      icon: <Shield className="text-purple-500" size={22} />,
      bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  }

  return (
    <div className="space-y-6">
      {/* Stat KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="bg-card border border-border/80 rounded-3xl p-5 shadow-2xs flex items-center gap-4 hover:shadow-xs transition-all duration-200"
          >
            <div className={`p-3.5 rounded-2xl ${stat.bgColor} border shrink-0 flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-extrabold uppercase tracking-wider truncate">{stat.label}</p>
              <h4 className="text-lg font-black text-foreground mt-0.5 truncate">
                {stat.value}
              </h4>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Timeline Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2.5">
            <History size={18} className="text-primary" />
            <span>{t('overview_tab.recent_timeline', 'Recent Activity Timeline')}</span>
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {activities.length} {t('overview_tab.actions', 'actions')}
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/80 rounded-2xl bg-muted/20">
            <CheckCircle2 className="mx-auto mb-2 text-muted-foreground/40" size={38} />
            <p className="text-xs text-muted-foreground font-bold">{t('overview_tab.no_recent_actions', 'No recent actions logged')}</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
            {activities.slice(0, 6).map((log, idx) => {
              const date = new Date(log.created_at).toLocaleString()
              return (
                <motion.div
                  key={log.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative group"
                >
                  {/* Timeline Glowing Dot */}
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-card border-2 border-primary transition-transform duration-200 group-hover:scale-125 shadow-xs" />
                  
                  <div className="bg-muted/20 hover:bg-muted/40 p-3.5 rounded-2xl border border-border/60 transition-colors">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h5 className="text-xs font-bold text-foreground">
                        {log.description || 'System Operation'}
                      </h5>
                      <span className="text-[10px] text-muted-foreground font-mono font-bold bg-muted/60 px-2 py-0.5 rounded-lg border border-border/40">{date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-semibold mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Monitor size={12} className="text-primary" />
                        <span>IP: <span className="font-mono text-foreground">{log.properties?.ip || log.ip_address || '127.0.0.1'}</span></span>
                      </span>
                      <span>•</span>
                      <span>
                        Module: <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">{log.log_name || log.module || 'System'}</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileOverview
