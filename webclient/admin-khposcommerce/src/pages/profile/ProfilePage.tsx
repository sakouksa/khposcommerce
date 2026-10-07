import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { profileService } from '@/services/profileService'
import type { UserProfile } from '@/services/profileService'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileOverview } from './components/ProfileOverview'
import { PersonalInfoForm } from './components/PersonalInfoForm'
import { SecurityTab } from './components/SecurityTab'
import { PermissionTable } from './components/PermissionTable'
import { ActivityLogTable } from './components/ActivityLogTable'
import { LoginHistoryTable } from './components/LoginHistoryTable'
import { ProfileSettings } from './components/ProfileSettings'
import { useServerPagination } from '@/hooks/useServerPagination'
import { LoadingSpinner } from '@/components/common'
import { 
  User, LayoutDashboard, Shield, Key, History, Monitor, Settings, Sparkles 
} from 'lucide-react'

const ProfilePage: React.FC = () => {
  const { t } = useTranslation('profile')
  const qc = useQueryClient()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'security' | 'permissions' | 'activities' | 'logins' | 'settings'>('overview')

  // Pagination for Activity Logs
  const actPage = useServerPagination({ storageKey: 'profile-activity-logs' })
  // Pagination for Login History
  const loginPage = useServerPagination({ storageKey: 'profile-login-histories' })

  // Preferences State
  const [timezone, setTimezone] = useState('Asia/Phnom_Penh')
  const [emailNotify, setEmailNotify] = useState(true)
  const [pushNotify, setPushNotify] = useState(true)
  const [smsNotify, setSmsNotify] = useState(false)

  // Sync preference states when profile is loaded
  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  })

  useEffect(() => {
    if (profile) {
      setTimezone(profile.timezone || 'Asia/Phnom_Penh')
      setEmailNotify(profile.email_notify ?? true)
      setPushNotify(profile.push_notify ?? true)
      setSmsNotify(profile.sms_notify ?? false)
    }
  }, [profile])

  const { data: permissionsData } = useQuery<any>({
    queryKey: ['profile-permissions'],
    queryFn: () => profileService.getPermissions(),
    enabled: activeTab === 'permissions' || activeTab === 'overview',
  })

  const { data: activityLogsData, isFetching: isFetchingLogs } = useQuery({
    queryKey: ['profile-activity-logs', actPage.page, actPage.perPage, actPage.debouncedSearch],
    queryFn: () => profileService.getActivityLogs({
      page: actPage.page,
      per_page: actPage.perPage,
      search: actPage.debouncedSearch
    }),
    enabled: activeTab === 'activities' || activeTab === 'overview',
  })

  const { data: loginHistoryData, isFetching: isFetchingLogins } = useQuery({
    queryKey: ['profile-login-histories', loginPage.page, loginPage.perPage, loginPage.debouncedSearch],
    queryFn: () => profileService.getLoginHistory({
      page: loginPage.page,
      per_page: loginPage.perPage,
      search: loginPage.debouncedSearch
    }),
    enabled: activeTab === 'logins' || activeTab === 'overview',
  })

  // ─── Mutations ────────────────────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      useAuthStore.getState().updateUser(updatedUser as any)
      toast.success(t('personal_tab.success_update', 'Personal details updated successfully.'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('personal_tab.fail_update', 'Failed to update personal details.'))
    }
  })

  const avatarUploadMutation = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: (avatarUrl) => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      useAuthStore.getState().updateUser({ avatar: avatarUrl })
      toast.success(t('avatar.upload_success', 'Avatar uploaded successfully.'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('avatar.upload_fail', 'Failed to upload avatar.'))
    }
  })

  const avatarRemoveMutation = useMutation({
    mutationFn: profileService.removeAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      useAuthStore.getState().updateUser({ avatar: null })
      toast.success(t('avatar.remove_success', 'Avatar removed successfully.'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('avatar.remove_fail', 'Failed to remove avatar.'))
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: () => {
      toast.success(t('security_tab.password_success', 'Password changed successfully.'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('security_tab.password_fail', 'Failed to change password.'))
    }
  })

  const logoutDevicesMutation = useMutation({
    mutationFn: profileService.logoutOtherDevices,
    onSuccess: () => {
      toast.success(t('security_tab.revoke_success', 'Logged out other devices successfully.'))
      qc.invalidateQueries({ queryKey: ['profile-sessions'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('security_tab.revoke_fail', 'Failed to log out other devices.'))
    }
  })

  // Mock Active Sessions derived from current session & login history for visual engagement
  const activeSessions = profile ? [
    {
      id: 1,
      ip_address: profile.last_login_at ? '127.0.0.1' : '192.168.1.1',
      browser: 'Chrome',
      device: 'Desktop',
      platform: 'Mac OS / Web',
      last_activity: profile.last_login_at || new Date().toISOString(),
      is_current: true
    }
  ] : []

  if (isProfileLoading || !profile) {
    return <LoadingSpinner fullPage label={t('loading_specs', 'Loading profile specifications...')} />
  }

  const handleUpdateProfile = (data: any) => {
    updateProfileMutation.mutate(data)
  }

  const handleAvatarUpload = (file: File) => {
    avatarUploadMutation.mutate(file)
  }

  const handleAvatarRemove = () => {
    avatarRemoveMutation.mutate()
  }

  const handleChangePassword = (data: any) => {
    changePasswordMutation.mutate(data)
  }

  const handleLogoutOtherDevices = () => {
    logoutDevicesMutation.mutate()
  }

  const handleSavePreferences = () => {
    updateProfileMutation.mutate({
      timezone,
      language: localStorage.getItem('enterprise-pos-lang') || 'km',
      email_notify: emailNotify,
      push_notify: pushNotify,
      sms_notify: smsNotify,
    })
  }

  const tabs = [
    { id: 'overview', label: t('overview', 'Overview'), icon: LayoutDashboard },
    { id: 'personal', label: t('personal_information', 'Personal Information'), icon: User },
    { id: 'security', label: t('security', 'Security'), icon: Shield },
    { id: 'permissions', label: t('permissions', 'Permissions'), icon: Key },
    { id: 'activities', label: t('activity_logs', 'Activity Logs'), icon: History },
    { id: 'logins', label: t('login_history', 'Login History'), icon: Monitor },
    { id: 'settings', label: t('settings', 'Settings & Preferences'), icon: Settings }
  ] as const

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── 1. PAGE HEADER & BREADCRUMBS ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
          <span>{t('overview', 'Dashboard')}</span>
          <span>/</span>
          <span className="text-foreground font-bold">{t('title', 'Profile')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          {t('title', 'Account & Profile Settings')}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {t('subtitle', 'Manage your identity, personal details, system preferences, and session security.')}
        </p>
      </div>

      {/* ── 2. PROFILE HERO BANNER ──────────────────────────────────────────── */}
      <ProfileHeader
        profile={profile}
        onAvatarUpload={handleAvatarUpload}
        onAvatarRemove={handleAvatarRemove}
        isUploading={avatarUploadMutation.isPending}
        onEditClick={() => setActiveTab('personal')}
        onChangePasswordClick={() => setActiveTab('security')}
      />

      {/* ── 3. TABS NAVIGATION (RESPONSIVE & CLEAN) ────────────────────────── */}
      <div className="space-y-6">
        <div className="bg-muted/40 p-1.5 rounded-2xl border border-border/80 overflow-x-auto max-w-full shadow-2xs">
          <nav className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-card text-primary shadow-xs border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* ── 4. TAB BODY CONTENT ──────────────────────────────────────────── */}
        <div>
          {activeTab === 'overview' && (
            <ProfileOverview
              profile={profile}
              activities={activityLogsData?.data ?? []}
              permissionsCount={permissionsData?.data?.permissions?.length ?? 0}
              loginCount={loginHistoryData?.pagination?.total ?? 0}
            />
          )}

          {activeTab === 'personal' && (
            <PersonalInfoForm
              profile={profile}
              onSave={handleUpdateProfile}
              isSaving={updateProfileMutation.isPending}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              sessions={activeSessions}
              onChangePassword={handleChangePassword}
              isChangingPassword={changePasswordMutation.isPending}
              onLogoutOtherDevices={handleLogoutOtherDevices}
              isLoggingOutDevices={logoutDevicesMutation.isPending}
            />
          )}

          {activeTab === 'permissions' && (
            <PermissionTable
              roles={permissionsData?.data?.roles ?? []}
              permissions={permissionsData?.data?.permissions ?? []}
            />
          )}

          {activeTab === 'activities' && (
            <ActivityLogTable
              logs={activityLogsData?.data ?? []}
              pagination={activityLogsData?.pagination ?? { current_page: 1, last_page: 1, total: 0 }}
              page={actPage.page}
              setPage={actPage.setPage}
              perPage={actPage.perPage}
              setPerPage={actPage.setPerPage}
              search={actPage.search}
              setSearch={actPage.setSearch}
              isFetching={isFetchingLogs}
            />
          )}

          {activeTab === 'logins' && (
            <LoginHistoryTable
              histories={loginHistoryData?.data ?? []}
              pagination={loginHistoryData?.pagination ?? { current_page: 1, last_page: 1, total: 0 }}
              page={loginPage.page}
              setPage={loginPage.setPage}
              perPage={loginPage.perPage}
              setPerPage={loginPage.setPerPage}
              search={loginPage.search}
              setSearch={loginPage.setSearch}
              isFetching={isFetchingLogins}
            />
          )}

          {activeTab === 'settings' && (
            <ProfileSettings
              timezone={timezone}
              setTimezone={setTimezone}
              emailNotify={emailNotify}
              setEmailNotify={setEmailNotify}
              pushNotify={pushNotify}
              setPushNotify={setPushNotify}
              smsNotify={smsNotify}
              setSmsNotify={setSmsNotify}
              onSave={handleSavePreferences}
              isSaving={updateProfileMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
