import React, { useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import DailyAttendanceLogsTab from './DailyAttendanceLogsTab'
import MonthlyAttendanceSummaryTab from './MonthlyAttendanceSummaryTab'
import ShiftsTab from './ShiftsTab'
import WeeklyShiftRosterTab from './WeeklyShiftRosterTab'
import DynamicQrKioskModal from './DynamicQrKioskModal'
import QuickAttendanceModal from './QuickAttendanceModal'

interface AttendanceManagementSectionProps {
  periodMonth: string
  onMonthChange: (month: string) => void
  employeesList: any[]
  shiftsList?: any[]
  branchesList?: any[]
  companiesList?: any[]
  getPhotoUrl?: (photo?: string) => string | null
  onOpenPayrollModal?: (month: string) => void
  quickModalOpen?: boolean
  setQuickModalOpen?: (open: boolean) => void
  subView?: AttendanceSubView
  onSubViewChange?: (subView: AttendanceSubView) => void
  openShiftModalRef?: React.MutableRefObject<(() => void) | null>
  copyLastWeekRef?: React.MutableRefObject<(() => void) | null>
  printRosterRef?: React.MutableRefObject<(() => void) | null>
  exportMonthlyRef?: React.MutableRefObject<(() => void) | null>
}

export type AttendanceSubView = 'logs' | 'roster' | 'shifts' | 'summary'

export const AttendanceManagementSection: React.FC<AttendanceManagementSectionProps> = ({
  periodMonth,
  onMonthChange,
  employeesList = [],
  shiftsList = [],
  branchesList = [],
  companiesList = [],
  getPhotoUrl,
  onOpenPayrollModal,
  quickModalOpen: propQuickModalOpen,
  setQuickModalOpen: propSetQuickModalOpen,
  subView: propSubView,
  onSubViewChange,
  openShiftModalRef: propOpenShiftModalRef,
  copyLastWeekRef: propCopyLastWeekRef,
  printRosterRef: propPrintRosterRef,
  exportMonthlyRef: propExportMonthlyRef,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  // Active Sub-view (Sync with parent or internal default 'logs')
  const [internalSubView, setInternalSubView] = useState<AttendanceSubView>('logs')
  const activeSubView = propSubView ?? internalSubView
  const setActiveSubView = (tab: AttendanceSubView) => {
    setInternalSubView(tab)
    onSubViewChange?.(tab)
  }

  // Modals state
  const [kioskModalOpen, setKioskModalOpen] = useState(false)
  const [internalQuickModalOpen, setInternalQuickModalOpen] = useState(false)
  const quickModalOpen = propQuickModalOpen !== undefined ? propQuickModalOpen : internalQuickModalOpen
  const setQuickModalOpen = propSetQuickModalOpen !== undefined ? propSetQuickModalOpen : setInternalQuickModalOpen

  // Child action refs (fallback to internal if parent didn't pass)
  const internalExportMonthlyRef = useRef<(() => void) | null>(null)
  const exportMonthlyRef = propExportMonthlyRef ?? internalExportMonthlyRef

  const internalOpenShiftModalRef = useRef<(() => void) | null>(null)
  const openShiftModalRef = propOpenShiftModalRef ?? internalOpenShiftModalRef

  const internalCopyLastWeekRef = useRef<(() => void) | null>(null)
  const copyLastWeekRef = propCopyLastWeekRef ?? internalCopyLastWeekRef

  const internalPrintRosterRef = useRef<(() => void) | null>(null)
  const printRosterRef = propPrintRosterRef ?? internalPrintRosterRef

  const tabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'logs',
      label: t('employees.daily_attendance_logs', 'Daily Attendance'),
    },
    {
      id: 'roster',
      label: t('employees.weekly_shift_roster', 'Weekly Shift Roster'),
    },
    {
      id: 'shifts',
      label: t('employees.shifts', 'Shifts & Schedule'),
    },
    {
      id: 'summary',
      label: t('employees.monthly_timesheet', 'Monthly Timesheet'),
    },
  ], [t])

  return (
    <div className="space-y-4">
      {/* ─── Global Workspace Tabs Navigation (Sub-tabs only, actions unified in top header) ─── */}
      <WorkspaceTabs
        tabs={tabs}
        activeTab={activeSubView}
        onChange={(tabId) => {
          sound.playClick()
          setActiveSubView(tabId as AttendanceSubView)
        }}
        variant="underline"
        showIcons={false}
      />

      {/* ─── Active Sub-view Content ─── */}
      {activeSubView === 'logs' ? (
        <DailyAttendanceLogsTab
          getPhotoUrl={getPhotoUrl}
          employeesList={employeesList}
          shiftsList={shiftsList}
          branchesList={branchesList}
          onOpenCreateRecord={() => setQuickModalOpen(true)}
          onOpenQrKiosk={() => setKioskModalOpen(true)}
        />
      ) : activeSubView === 'roster' ? (
        <WeeklyShiftRosterTab
          employeesList={employeesList}
          shiftsList={shiftsList}
          branchesList={branchesList}
          getPhotoUrl={getPhotoUrl}
          copyRef={copyLastWeekRef}
          printRef={printRosterRef}
        />
      ) : activeSubView === 'summary' ? (
        <MonthlyAttendanceSummaryTab
          periodMonth={periodMonth}
          onMonthChange={onMonthChange}
          onOpenPayrollModal={onOpenPayrollModal}
          getPhotoUrl={getPhotoUrl}
          exportRef={exportMonthlyRef}
        />
      ) : (
        <ShiftsTab openCreateModalRef={openShiftModalRef} />
      )}

      {/* ─── Dynamic QR Kiosk Modal ─── */}
      <DynamicQrKioskModal
        open={kioskModalOpen}
        onClose={() => setKioskModalOpen(false)}
        initialCompanies={companiesList}
        initialBranches={branchesList}
      />

      {/* ─── Quick Attendance Record Modal ─── */}
      <QuickAttendanceModal
        open={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        employeesList={employeesList}
        shiftsList={shiftsList}
        branchesList={branchesList}
        getPhotoUrl={getPhotoUrl}
      />
    </div>
  )
}

export default AttendanceManagementSection
