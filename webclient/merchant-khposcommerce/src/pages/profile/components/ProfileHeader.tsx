import React, { useRef, useState, useEffect } from 'react'
import { Mail, Phone, Shield, Building2, Calendar, Camera, Trash2, Edit3, KeyRound, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/services/profileService'
import { useThemeStore } from '@/stores/themeStore'
import { getAbsoluteImageUrl } from '@/utils/image'

interface ProfileHeaderProps {
  profile: UserProfile
  onAvatarUpload: (file: File) => void
  onAvatarRemove: () => void
  isUploading: boolean
  onEditClick: () => void
  onChangePasswordClick: () => void
}

const ROLE_TRANSLATIONS: Record<string, Record<string, string>> = {
  super_admin: {
    km: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
    en: 'Super Admin',
    zh: '超级管理员',
    th: 'ผู้ดูแลระบบระดับสูง',
    vi: 'Quản trị viên cấp cao',
  },
  admin: {
    km: 'អ្នកគ្រប់គ្រង',
    en: 'Admin',
    zh: '管理员',
    th: 'ผู้ดูแลระบบ',
    vi: 'Quản trị viên',
  },
  manager: {
    km: 'អ្នកចាត់ការទូទៅ',
    en: 'General Manager',
    zh: '总经理',
    th: 'ผู้จัดการทั่วไป',
    vi: 'Tổng quản lý',
  },
  cashier: {
    km: 'អ្នកគិតប្រាក់ POS',
    en: 'POS Cashier',
    zh: 'POS收银员',
    th: 'พนักงานแคชเชียร์ POS',
    vi: 'Thu ngân POS',
  },
  warehouse_manager: {
    km: 'អ្នកគ្រប់គ្រងឃ្លាំង',
    en: 'Warehouse Manager',
    zh: '仓库主管',
    th: 'ผู้จัดการคลังสินค้า',
    vi: 'Quản lý kho',
  },
  staff: {
    km: 'បុគ្គលិក',
    en: 'Staff',
    zh: '员工',
    th: 'พนักงาน',
    vi: 'Nhân viên',
  },
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onAvatarUpload,
  onAvatarRemove,
  isUploading,
  onEditClick,
  onChangePasswordClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('profile')
  const { language } = useThemeStore()
  const langKey = language || 'km'
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [profile.avatar])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAvatarUpload(e.target.files[0])
    }
  }

  const rawRole = (profile.roles?.[0] || 'super_admin').toLowerCase().replace(/\s+/g, '_')
  const roleName = ROLE_TRANSLATIONS[rawRole]?.[langKey] || ROLE_TRANSLATIONS['super_admin']?.[langKey] || profile.roles?.[0] || 'Super Admin'

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xs overflow-hidden relative">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 relative z-10">
        
        {/* Avatar Section with Glowing Ring */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-primary/30 bg-gradient-primary flex items-center justify-center shadow-lg relative ring-4 ring-primary/10 select-none">
            {profile.avatar && !imgError ? (
              <img
                src={getAbsoluteImageUrl(profile.avatar)}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-white text-4xl font-black">{profile.name?.[0] ?? 'U'}</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          {/* Avatar Actions Overlay */}
          <div className="absolute -bottom-2 -right-2 flex gap-1.5 shadow-md">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
              title={t('avatar.upload', 'Upload Avatar')}
            >
              <Camera size={15} />
            </button>
            {profile.avatar && (
              <button
                type="button"
                onClick={onAvatarRemove}
                className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                title={t('avatar.remove', 'Remove Avatar')}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* User Info Details */}
        <div className="flex-1 text-center lg:text-left space-y-4 min-w-0">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{profile.name}</h2>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                  <Shield size={13} />
                  <span>{roleName}</span>
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                  profile.is_active 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{profile.is_active ? t('overview_tab.active', 'Active') : t('overview_tab.inactive', 'Inactive')}</span>
                </span>
              </div>
            </div>
            
            {/* Quick Actions Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-muted/80 hover:bg-muted text-foreground rounded-2xl text-xs font-bold border border-border/80 transition-all cursor-pointer shadow-2xs hover:border-primary/40 active:scale-95"
              >
                <Edit3 size={14} className="text-primary" />
                <span>{t('personal_information', 'Personal Information')}</span>
              </button>
              <button
                type="button"
                onClick={onChangePasswordClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <KeyRound size={14} />
                <span>{t('change_password', 'Change Password')}</span>
              </button>
            </div>
          </div>

          {/* Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2.5 gap-x-4 pt-3.5 border-t border-border/60 text-xs text-muted-foreground font-semibold">
            <div className="flex items-center justify-center lg:justify-start gap-2 bg-muted/30 p-2 rounded-xl border border-border/40">
              <Mail size={14} className="text-primary shrink-0" />
              <span className="truncate font-mono">{profile.email}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 bg-muted/30 p-2 rounded-xl border border-border/40">
              <Phone size={14} className="text-primary shrink-0" />
              <span>{profile.phone || t('personal_tab.no_phone', 'No phone added')}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 bg-muted/30 p-2 rounded-xl border border-border/40">
              <Building2 size={14} className="text-primary shrink-0" />
              <span className="truncate">
                {profile.company?.name || t('personal_tab.no_company', 'Enterprise POS')}
                {profile.branch?.name ? ` • ${profile.branch.name}` : ''}
              </span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 bg-muted/30 p-2 rounded-xl border border-border/40">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>
                {t('joined_date', 'Joined Date:')} {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {profile.last_login_at && (
              <div className="flex items-center justify-center lg:justify-start gap-2 col-span-1 sm:col-span-2 bg-muted/30 p-2 rounded-xl border border-border/40">
                <Clock size={14} className="text-emerald-500 shrink-0" />
                <span>
                  {t('last_login', 'Last Login:')} <span className="font-mono">{new Date(profile.last_login_at).toLocaleString()}</span>
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProfileHeader
