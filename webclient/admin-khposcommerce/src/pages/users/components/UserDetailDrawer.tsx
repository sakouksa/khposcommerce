import React from 'react'
import { Shield, Key, Lock } from 'lucide-react'
import { 
  StatusBadge, 
  UserAvatar, 
  DetailDrawer, 
  DetailDrawerHeader, 
  DetailDrawerBody, 
  DetailDrawerFooter,
  ActionButton,
} from '@/components/common'
import type { User } from '../types/user.types'

interface UserDetailDrawerProps {
  user: User | null
  onClose: () => void
  getAvatarUrl?: (avatar?: string | null) => string | null
  openResetPasswordModal: (user: User) => void
  openPermissionModal: (user: User) => void
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  user,
  onClose,
  openResetPasswordModal,
  openPermissionModal,
}) => {
  if (!user) return null

  return (
    <DetailDrawer
      isOpen={!!user}
      onClose={onClose}
      size="xl"
    >
      <DetailDrawerHeader
        title="User Profile & Access Control"
        subtitle={user.email}
        badge={
          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-mono font-semibold border border-border/60">
            USR-#{String(user.id).padStart(4, '0')}
          </span>
        }
        onClose={onClose}
      />

      <DetailDrawerBody>
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-muted/30 dark:bg-slate-800/40 p-4 rounded-2xl border border-border dark:border-slate-800">
          <UserAvatar
            src={user.avatar}
            name={user.name}
            sizeClassName="w-16 h-16"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{user.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <StatusBadge status={user.is_active} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {user.roles?.[0]?.name ?? 'Staff'}
              </span>
            </div>
          </div>
        </div>

        {/* General Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-1">
            Personal & Contact Info
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="font-semibold text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="font-semibold text-foreground">{user.phone || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Location Address</p>
              <p className="font-semibold text-foreground">
                {[user.address, user.city, user.province, user.country].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-1 pt-3">
            Security & Access Logs
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Last Login Activity</p>
              <p className="font-semibold text-foreground">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never Logged In'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Created</p>
              <p className="font-semibold text-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </DetailDrawerBody>

      <DetailDrawerFooter
        rightActions={
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              size="sm"
              label="Close"
              onClick={onClose}
            />
            <ActionButton
              variant="outline"
              size="sm"
              icon={<Key size={14} className="text-amber-500" />}
              label="Reset Password"
              onClick={() => openResetPasswordModal(user)}
            />
            <ActionButton
              variant="primary"
              size="sm"
              icon={<Lock size={14} />}
              label="Permissions"
              onClick={() => openPermissionModal(user)}
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default UserDetailDrawer
