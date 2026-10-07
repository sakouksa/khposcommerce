import React, { useState } from 'react'
import { Shield, Search, Key, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'

interface PermissionItem {
  id: string
  name: string
  group?: string
  module: string
  action: string
  guard_name: string
}

interface PermissionTableProps {
  roles: string[]
  permissions: PermissionItem[]
}

const ROLE_TRANSLATIONS: Record<string, Record<string, string>> = {
  super_admin: { km: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់', en: 'Super Admin', zh: '超级管理员', th: 'ผู้ดูแลระบบระดับสูง', vi: 'Quản trị viên cấp cao' },
  admin: { km: 'អ្នកគ្រប់គ្រង', en: 'Admin', zh: '管理员', th: 'ผู้ดูแลระบบ', vi: 'Quản trị viên' },
  manager: { km: 'អ្នកចាត់ការទូទៅ', en: 'General Manager', zh: '总经理', th: 'ผู้จัดการทั่วไป', vi: 'Tổng quản lý' },
  cashier: { km: 'អ្នកគិតប្រាក់ POS', en: 'POS Cashier', zh: 'POS收银员', th: 'พนักงานแคชเชียร์ POS', vi: 'Thu ngân POS' },
  warehouse_manager: { km: 'អ្នកគ្រប់គ្រងឃ្លាំង', en: 'Warehouse Manager', zh: '仓库主管', th: 'ผู้จัดการคลังสินค้า', vi: 'Quản lý kho' },
  staff: { km: 'បុគ្គលិក', en: 'Staff', zh: '员工', th: 'พนักงาน', vi: 'Nhân viên' },
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  roles = [],
  permissions = [],
}) => {
  const { t } = useTranslation('profile')
  const { language } = useThemeStore()
  const langKey = language || 'km'
  const [search, setSearch] = useState('')

  // Filter permissions
  const filtered = permissions.filter((perm) => {
    const term = search.toLowerCase()
    return (
      perm.name.toLowerCase().includes(term) ||
      (perm.module || '').toLowerCase().includes(term) ||
      (perm.group || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Roles Summary Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs">
        <h3 className="text-base font-extrabold text-foreground mb-4 flex items-center gap-2.5">
          <Shield size={18} className="text-primary" />
          <span>{t('permissions_tab.assigned_roles', 'Assigned Roles')}</span>
        </h3>
        {roles.length === 0 ? (
          <p className="text-xs text-muted-foreground font-semibold">{t('permissions_tab.no_roles', 'No roles assigned')}</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {roles.map((role) => {
              const rawRole = role.toLowerCase().replace(/\s+/g, '_')
              const translated = ROLE_TRANSLATIONS[rawRole]?.[langKey] || role.replace('_', ' ')
              return (
                <span
                  key={role}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shadow-2xs"
                >
                  <ShieldCheck size={13} />
                  <span>{translated}</span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Permissions Table Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2.5">
              <Key size={18} className="text-primary" />
              <span>{t('permissions_tab.effective_title', 'Effective System Permissions')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('permissions_tab.effective_subtitle', 'These permissions are inherited through your assigned roles or direct grants.')}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('permissions_tab.search_placeholder', 'Search permissions...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-muted/40 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto border border-border/80 rounded-2xl shadow-2xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border/80">
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('permissions_tab.th_name', 'Permission Name')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('permissions_tab.th_module', 'Module')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('permissions_tab.th_guard', 'Guard')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground font-semibold">
                    {t('permissions_tab.no_match', 'No permissions match your search query.')}
                  </td>
                </tr>
              ) : (
                filtered.map((perm) => (
                  <tr key={perm.id || perm.name} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      <span className="font-mono bg-muted/60 px-2 py-0.5 rounded-lg border border-border/40 text-primary">
                        {perm.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-semibold">
                      <span className="capitalize">{perm.module || 'System'}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {perm.guard_name || 'web'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PermissionTable
