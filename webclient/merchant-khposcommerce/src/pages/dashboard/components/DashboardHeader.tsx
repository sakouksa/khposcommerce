import React from 'react'
import { Calendar, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'

interface DashboardHeaderProps {
  onBranchChange?: (branchId: number) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

const formatLocalizedDate = (date: Date, lang: string): string => {
  const day = date.getDate()
  const year = date.getFullYear()
  const weekdayIndex = date.getDay()
  const monthIndex = date.getMonth()

  const weekdays: Record<string, string[]> = {
    km: ['ថ្ងៃអាទិត្យ', 'ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
    vi: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  }

  const months: Record<string, string[]> = {
    km: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  }

  const currentLang = ['km', 'en', 'zh', 'th', 'vi'].includes(lang) ? lang : 'km'
  const weekdayStr = weekdays[currentLang][weekdayIndex]
  const monthStr = months[currentLang][monthIndex]

  if (currentLang === 'km') {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
    const toKhmerNum = (num: number) => String(num).padStart(2, '0').split('').map(d => khmerNumerals[parseInt(d)] || d).join('')
    const toKhmerYear = (num: number) => String(num).split('').map(d => khmerNumerals[parseInt(d)] || d).join('')
    return `${weekdayStr} ទី${toKhmerNum(day)} ខែ${monthStr} ឆ្នាំ${toKhmerYear(year)}`
  }

  if (currentLang === 'zh') {
    return `${year}年${monthIndex + 1}月${day}日 ${weekdayStr}`
  }

  if (currentLang === 'th') {
    return `${weekdayStr}ที่ ${day} ${monthStr} ${year}`
  }

  if (currentLang === 'vi') {
    return `${weekdayStr}, ${day} ${monthStr}, ${year}`
  }

  return `${weekdayStr}, ${monthStr} ${day}, ${year}`
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onBranchChange, 
  onRefresh, 
  isRefreshing 
}) => {
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation()

  const todayStr = formatLocalizedDate(new Date(), i18n.language)

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 md:p-6 bg-card border border-border/60 rounded-2xl shadow-sm">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1 flex-wrap">
            <span>{t('dashboard.title')}</span>
            <span>/</span>
            <span className="text-primary font-bold">{user?.branch?.name || t('dashboard.allBranches')}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground break-words">
            {t('dashboard.welcome_back')}, {user?.name || 'Super Admin'} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed max-w-3xl">
            {t('dashboard.header_subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Business Date */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border border-border/50 rounded-xl text-xs text-foreground font-bold shadow-2xs">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span>{todayStr}</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
