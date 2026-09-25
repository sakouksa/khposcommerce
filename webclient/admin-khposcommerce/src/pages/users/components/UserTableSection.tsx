import React from 'react'
import {
  User as UserIcon, Key, Lock, Edit2, Trash2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import UserAvatar from '@/components/common/UserAvatar'
import type { User } from '../types/user.types'

interface UserTableSectionProps {
  users: User[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  getAvatarUrl: (avatar?: string | null) => string | null
  setViewUser: (user: User) => void
  openEditModal: (user: User) => void
  openPermissionModal: (user: User) => void
  openResetPasswordModal: (user: User) => void
  setDeleteTarget: (user: User) => void
  toggleActiveMutation: any
}

export const UserTableSection: React.FC<UserTableSectionProps> = ({
  users,
  isLoading,
  isFetching,
  visibleColumns,
  getAvatarUrl,
  setViewUser,
  openEditModal,
  openPermissionModal,
  openResetPasswordModal,
  setDeleteTarget,
  toggleActiveMutation,
}) => {
  const { t } = useTranslation()

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.avatar && <th className="w-12 text-center">Avatar</th>}
                {visibleColumns.userInfo && <th>User Info & Contact</th>}
                {visibleColumns.phone && <th>Phone</th>}
                {visibleColumns.role && <th>Role & Permissions</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : users.length === 0 ? (
                <EmptyState cols={6} message="No user accounts found matching query parameters." />
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.avatar && (
                      <td className="text-center">
                        <div className="flex items-center justify-center">
                          <UserAvatar
                            src={u.avatar}
                            name={u.name}
                            sizeClassName="w-9 h-9"
                          />
                        </div>
                      </td>
                    )}
                    {visibleColumns.userInfo && (
                      <td>
                        <div className="space-y-0.5">
                          <p
                            onClick={() => setViewUser(u)}
                            className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm"
                          >
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                        </div>
                      </td>
                    )}
                    {visibleColumns.phone && <td className="text-xs">{u.phone || 'N/A'}</td>}
                    {visibleColumns.role && (
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {u.roles?.[0]?.name ?? 'Staff'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleActiveMutation.mutate({ id: u.id, is_active: !u.is_active })}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <StatusBadge status={u.is_active} />
                        </button>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => setViewUser(u)}
                          onEdit={() => openEditModal(u)}
                          onDelete={() => setDeleteTarget(u)}
                          items={[
                            {
                              label: 'Manage Permissions',
                              icon: Key,
                              onClick: () => openPermissionModal(u),
                            },
                            {
                              label: 'Reset Password',
                              icon: Lock,
                              onClick: () => openResetPasswordModal(u),
                            },
                          ]}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default UserTableSection
