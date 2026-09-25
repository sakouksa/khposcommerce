import React from 'react'
import { Users, Shield, ShieldCheck } from 'lucide-react'
import { EnterpriseStatsCard, EnterpriseStatsGrid } from '@/components/common'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersMonth: number
  verifiedUsers: number
  blockedUsers: number
  twoFactorUsers: number
  securityScore: number
  totalRoles: number
  totalPermissions: number
  adminUsers: number
  todayLogin: number
  activeSessions: number
  avgSessionTime: string
}

interface UserStatsCardsProps {
  analytics: AnalyticsData
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ analytics }) => {
  return (
    <EnterpriseStatsGrid columns={4} className="print:hidden">
      {/* Card 1: Total Users */}
      <EnterpriseStatsCard
        title="Total Users Directory"
        value={analytics.totalUsers}
        subtitle={
          <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {analytics.activeUsers} Active
            </span>
            <span>•</span>
            <span className="text-amber-500 font-medium">{analytics.inactiveUsers} Inactive</span>
          </span>
        }
        icon={Users}
        variant="primary"
      />

      {/* Card 2: Security & Authentication */}
      <EnterpriseStatsCard
        title="Verified Security"
        value={analytics.verifiedUsers}
        subtitle={
          <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="text-blue-500 font-bold">{analytics.twoFactorUsers} 2FA Enrolled</span>
            <span>•</span>
            <span className="text-rose-500 font-medium">{analytics.blockedUsers} Blocked</span>
          </span>
        }
        icon={ShieldCheck}
        variant="blue"
        delay={0.05}
      />

      {/* Card 3: System Roles & Permissions */}
      <EnterpriseStatsCard
        title="Roles & Permissions"
        value={analytics.totalRoles}
        suffix=" Roles"
        subtitle={
          <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="text-purple-500 font-bold">{analytics.totalPermissions} Rights</span>
            <span>•</span>
            <span className="text-foreground font-medium">{analytics.adminUsers} Admins</span>
          </span>
        }
        icon={Shield}
        variant="purple"
        delay={0.1}
      />

      {/* Card 4: Health Score Progress Ring */}
      <EnterpriseStatsCard
        title="Security Health"
        value={analytics.securityScore}
        suffix="%"
        decimals={1}
        subtitle={`${analytics.todayLogin} logins today (${analytics.activeSessions} active)`}
        progressRing={{ percentage: analytics.securityScore, colorClass: 'text-emerald-500' }}
        delay={0.15}
      />
    </EnterpriseStatsGrid>
  )
}

export default UserStatsCards

