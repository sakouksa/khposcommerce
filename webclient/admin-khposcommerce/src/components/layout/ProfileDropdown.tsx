import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Settings, LogOut, ChevronRight, Globe, Sun, Moon, Monitor, 
  ScrollText, ArrowLeft, Check, Sliders, ExternalLink
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import api from '@/api/client'
import SwitchAccountModal from './SwitchAccountModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import UserAvatar from '@/components/common/UserAvatar'

interface LanguageOption {
  code: 'km' | 'en'
  name: string
  label: string
  flag: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'km', name: 'ភាសាខ្មែរ', label: 'Khmer', flag: '🇰🇭' },
  { code: 'en', name: 'English', label: 'English (US)', flag: '🇺🇸' },
]

// 5-Language Dictionary for Profile Popup
const DICT = {
  roles: {
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
  } as Record<string, Record<string, string>>,

  online: {
    km: 'អនឡាញ',
    en: 'Online',
    zh: '在线',
    th: 'ออนไลน์',
    vi: 'Trực tuyến',
  } as Record<string, string>,

  profile: {
    km: 'ព័ត៌មានផ្ទាល់ខ្លួន',
    en: 'My Profile & Account',
    zh: '个人资料与账户',
    th: 'ข้อมูลโปรไฟล์และบัญชี',
    vi: 'Hồ sơ & Tài khoản của tôi',
  } as Record<string, string>,

  language: {
    km: 'ភាសាប្រព័ន្ធ',
    en: 'System Language',
    zh: '系统语言',
    th: 'ภาษาของระบบ',
    vi: 'Ngôn ngữ hệ thống',
  } as Record<string, string>,

  appearance: {
    km: 'រូបរាង & ពណ៌ប្រព័ន្ធ',
    en: 'Appearance & Theme',
    zh: '外观与主题',
    th: 'รูปแบบและการแสดงผล',
    vi: 'Giao diện & Chủ đề',
  } as Record<string, string>,

  themeModes: {
    light: {
      km: 'ទម្រង់ភ្លឺ',
      en: 'Light Mode',
      zh: '明亮模式',
      th: 'โหมดสว่าง',
      vi: 'Giao diện sáng',
    },
    dark: {
      km: 'ទម្រង់ងងឹត',
      en: 'Dark Mode',
      zh: '暗黑模式',
      th: 'โหมดมืด',
      vi: 'Giao diện tối',
    },
    system: {
      km: 'តាមឧបករណ៍',
      en: 'System Auto',
      zh: '跟随系统',
      th: 'ตามระบบ',
      vi: 'Theo hệ thống',
    },
  } as Record<string, Record<string, string>>,

  settings: {
    km: 'ការកំណត់ប្រព័ន្ធ',
    en: 'System Settings',
    zh: '系统设置',
    th: 'การตั้งค่าระบบ',
    vi: 'Cài đặt hệ thống',
  } as Record<string, string>,

  activityLogs: {
    km: 'កំណត់ហេតុសកម្មភាព',
    en: 'Activity Logs',
    zh: '操作活动日志',
    th: 'บันทึกกิจกรรม',
    vi: 'Nhật ký hoạt động',
  } as Record<string, string>,

  logout: {
    km: 'ចាកចេញពីគណនី',
    en: 'Sign Out',
    zh: '退出登录',
    th: 'ออกจากระบบ',
    vi: 'Đăng xuất',
  } as Record<string, string>,

  back: {
    km: 'ត្រឡប់ក្រោយ',
    en: 'Back',
    zh: '返回',
    th: 'ย้อนกลับ',
    vi: 'Quay lại',
  } as Record<string, string>,

  selectLangSubtitle: {
    km: 'ជ្រើសរើសភាសាប្រព័ន្ធ',
    en: 'Select System Language',
    zh: '选择系统语言',
    th: 'เลือกภาษาของระบบ',
    vi: 'Chọn ngôn ngữ hệ thống',
  } as Record<string, string>,

  themeModeSubtitle: {
    km: 'កំណត់ទម្រង់ពន្លឺ/ងងឹត',
    en: 'Theme Display Mode',
    zh: '主题显示模式',
    th: 'โหมดการแสดงผลธีม',
    vi: 'Chế độ hiển thị giao diện',
  } as Record<string, string>,

  customizeAppearanceBtn: {
    km: 'ចូលទៅកាន់ការកំណត់រូបរាងលម្អិត',
    en: 'Advanced Theme & Panel Customizer',
    zh: '高级外观与面板定制',
    th: 'ปรับแต่งธีมและแผងควบคุมขั้นสูง',
    vi: 'Tùy chỉnh giao diện & bảng điều khiển nâng cao',
  } as Record<string, string>,

  confirmLogoutTitle: {
    km: 'ចាកចេញពីប្រព័ន្ធ',
    en: 'Confirm Sign Out',
    zh: '确认退出登录',
    th: 'ยืนยันการออกจากระบบ',
    vi: 'Xác nhận đăng xuất',
  } as Record<string, string>,

  confirmLogoutDesc: {
    km: 'តើអ្នកពិតជាចង់បញ្ចប់ Session និងចាកចេញពីប្រព័ន្ធមែនទេ?',
    en: 'Are you sure you want to end your active session and sign out?',
    zh: '您确定要结束当前会话并退出系统吗？',
    th: 'คุณแน่ใจหรือไม่ว่าต้องการสิ้นสุดเซสชันและออกจากระบบ?',
    vi: 'Bạn có chắc chắn muốn kết thúc phiên làm việc và đăng xuất?',
  } as Record<string, string>,

  cancel: {
    km: 'បោះបង់',
    en: 'Cancel',
    zh: '取消',
    th: 'ยกเลิก',
    vi: 'Hủy',
  } as Record<string, string>,
}

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { language, setLanguage, themeMode, updateThemeMode } = useThemeStore()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'main' | 'language' | 'appearance'>('main')
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Current language code fallback
  const langKey = (language && ['km', 'en', 'zh', 'th', 'vi'].includes(language) ? language : 'km') as 'km' | 'en' | 'zh' | 'th' | 'vi'

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setCurrentView('main')
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setCurrentView('main')
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    logout()
    navigate('/login')
  }

  // Get active role translated
  const rawRole = (user?.roles?.[0] || 'super_admin').toLowerCase().replace(/\s+/g, '_')
  const roleTranslated = DICT.roles[rawRole]?.[langKey] || DICT.roles['super_admin'][langKey]

  // Submenu transition configurations
  const menuVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.18, ease: 'easeOut' as any },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.12, ease: 'easeIn' as any },
    }),
  }

  const currentLangObj = LANGUAGES.find(l => l.code === langKey) || LANGUAGES[0]
  const currentThemeLabel = DICT.themeModes[themeMode]?.[langKey] || DICT.themeModes['light'][langKey]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          setCurrentView('main')
        }}
        className="flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-full cursor-pointer transition-transform active:scale-95 flex-shrink-0"
      >
        <UserAvatar
          src={user?.avatar}
          name={user?.name || 'Super Admin'}
          sizeClassName="w-8 h-8 sm:w-9 sm:h-9"
          showOnlineStatus={true}
          isOnline={true}
        />
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.16 }}
            className="fixed sm:absolute top-14 sm:top-full right-3 sm:right-0 sm:mt-2 w-[320px] max-w-[calc(100vw-24px)] bg-card/95 border border-border/90 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl flex flex-col"
          >
            {/* Header user identity */}
            <div className="p-4 border-b border-border/60 bg-muted/25">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={user?.avatar}
                  name={user?.name || 'Super Admin'}
                  sizeClassName="w-12 h-12"
                  className="rounded-2xl shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-foreground truncate">{user?.name || 'Super Admin'}</h4>
                  <p className="text-[11px] text-muted-foreground truncate font-mono">{user?.email || 'superadmin@enterprise-pos.com'}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20">
                      {roleTranslated}
                    </span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {DICT.online[langKey]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company & Branch detail */}
              <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span className="truncate max-w-[130px]">{user?.company?.name ?? 'Enterprise POS'}</span>
                <span>•</span>
                <span className="truncate max-w-[130px]">{user?.branch?.name ?? 'Head Office 1'}</span>
              </div>
            </div>

            {/* Menu screens transition */}
            <div className="p-2 min-h-[290px] flex flex-col relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                
                {/* ─── MAIN MENU VIEW ─────────────────────────────────────── */}
                {currentView === 'main' && (
                  <motion.div
                    key="main"
                    custom={-1}
                    variants={menuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full space-y-1"
                  >
                    {/* 1. Manage Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile')
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <User size={15} />
                        </div>
                        <span>{DICT.profile[langKey]}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </button>

                    {/* 2. Language Selector Submenu */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('language')
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <Globe size={15} />
                        </div>
                        <span>{DICT.language[langKey]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                          <span>{currentLangObj.flag}</span>
                          <span>{currentLangObj.name}</span>
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                      </div>
                    </button>

                    {/* 3. Appearance & Theme Submenu */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('appearance')
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          {themeMode === 'light' && <Sun size={15} />}
                          {themeMode === 'dark' && <Moon size={15} />}
                          {themeMode === 'system' && <Monitor size={15} />}
                        </div>
                        <span>{DICT.appearance[langKey]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground font-bold">
                          {currentThemeLabel}
                        </span>
                        <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                      </div>
                    </button>

                    <div className="h-px bg-border/60 my-1" />

                    {/* 4. Global Settings */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/settings')
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <Settings size={15} />
                        </div>
                        <span>{DICT.settings[langKey]}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </button>

                    {/* 5. Activity Logs */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/activity-logs')
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <ScrollText size={15} />
                        </div>
                        <span>{DICT.activityLogs[langKey]}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </button>

                    <div className="h-px bg-border/60 my-1" />

                    {/* 6. Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogoutConfirmOpen(true)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-red-500/10 text-red-500">
                          <LogOut size={15} />
                        </div>
                        <span>{DICT.logout[langKey]}</span>
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* ─── SUBMENU: LANGUAGE SELECTION ────────────────────────── */}
                {currentView === 'language' && (
                  <motion.div
                    key="language"
                    custom={1}
                    variants={menuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full space-y-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('main')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-foreground border-b border-border/50 mb-2 cursor-pointer hover:text-primary transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>{DICT.back[langKey]}</span>
                      <span className="text-muted-foreground font-normal ml-auto text-[11px]">{DICT.selectLangSubtitle[langKey]}</span>
                    </button>

                    {LANGUAGES.map((lang) => {
                      const isSel = langKey === lang.code
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code)
                            setCurrentView('main')
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg leading-none select-none drop-shadow-2xs">{lang.flag}</span>
                            <div className="text-left">
                              <p className="leading-tight">{lang.name}</p>
                              <span className={`text-[10px] font-normal ${isSel ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{lang.label}</span>
                            </div>
                          </div>
                          {isSel && <Check size={16} strokeWidth={3} className="shrink-0" />}
                        </button>
                      )
                    })}
                  </motion.div>
                )}

                {/* ─── SUBMENU: APPEARANCE & THEME ────────────────────────── */}
                {currentView === 'appearance' && (
                  <motion.div
                    key="appearance"
                    custom={1}
                    variants={menuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full space-y-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('main')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-foreground border-b border-border/50 mb-2 cursor-pointer hover:text-primary transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>{DICT.back[langKey]}</span>
                      <span className="text-muted-foreground font-normal ml-auto text-[11px]">{DICT.themeModeSubtitle[langKey]}</span>
                    </button>

                    {[
                      { id: 'light', label: DICT.themeModes['light'][langKey], icon: <Sun size={16} /> },
                      { id: 'dark', label: DICT.themeModes['dark'][langKey], icon: <Moon size={16} /> },
                      { id: 'system', label: DICT.themeModes['system'][langKey], icon: <Monitor size={16} /> },
                    ].map((mode) => {
                      const isSel = themeMode === mode.id
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            updateThemeMode(mode.id as any)
                            setCurrentView('main')
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-xl ${isSel ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {mode.icon}
                            </div>
                            <span className="leading-tight">{mode.label}</span>
                          </div>
                          {isSel && <Check size={16} strokeWidth={3} className="shrink-0" />}
                        </button>
                      )
                    })}

                    <div className="pt-2 border-t border-border/50 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/settings?tab=appearance')
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders size={14} />
                          <span>{DICT.customizeAppearanceBtn[langKey]}</span>
                        </div>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch Account Modal Overlay */}
      <SwitchAccountModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
      />

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title={DICT.confirmLogoutTitle[langKey]}
        message={DICT.confirmLogoutDesc[langKey]}
        confirmText={DICT.logout[langKey]}
        cancelText={DICT.cancel[langKey]}
        variant="danger"
      />
    </div>
  )
}

export default ProfileDropdown
