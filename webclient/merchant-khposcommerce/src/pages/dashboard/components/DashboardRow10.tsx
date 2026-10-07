import React from 'react'
import { UserCheck, Trophy, Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const DashboardRow10: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Attendance & Payroll */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-blue-500" />
          {t('dashboard.attendancePayroll', 'Attendance & Payroll')}
        </h4>
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold">{t('dashboard.todayAttendanceRate', 'Today Attendance Rate')}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-sm text-foreground">96.8%</span>
              <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {t('dashboard.excellent', 'Excellent')}
              </span>
            </div>
          </div>
          <div className="border-t border-border/20 pt-3">
            <span className="text-[11px] text-muted-foreground font-semibold">{t('dashboard.totalPayrollAssets', 'Total Payroll Assets')}</span>
            <h5 className="font-bold text-sm text-foreground mt-1">$8,500</h5>
          </div>
        </div>
      </div>

      {/* Top Performing Employees */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-emerald-500" />
          {t('dashboard.topPerformer', 'Top Performer')}
        </h4>
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
            SO
          </div>
          <div>
            <span className="font-bold text-xs text-foreground block">Sak ousa</span>
            <span className="text-[10px] text-muted-foreground">{t('dashboard.posSalesChampion', 'POS Sales Champion ($32,500 volume)')}</span>
          </div>
        </div>
      </div>

      {/* Active Departments */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-2xs md:col-span-2 lg:col-span-1">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-purple-500" />
          {t('dashboard.departments', 'Departments')}
        </h4>
        <div className="space-y-2">
          {[
            { name: t('dashboard.salesAndBilling', 'Sales & Billing'), staff: `12 ${t('dashboard.staff', 'staff')}` },
            { name: t('dashboard.warehouseAndLogistics', 'Warehouse & Logistics'), staff: `8 ${t('dashboard.staff', 'staff')}` },
            { name: t('dashboard.marketingAndSEO', 'Marketing & SEO'), staff: `4 ${t('dashboard.staff', 'staff')}` },
          ].map((dept, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-0.5">
              <span className="text-muted-foreground font-medium truncate max-w-[170px]">{dept.name}</span>
              <span className="font-bold text-foreground shrink-0">{dept.staff}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardRow10
