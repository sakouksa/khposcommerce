import React from 'react'
import {
  Phone,
  Briefcase,
  Users,
  ChevronUp,
  ChevronDown,
  Building2,
  KeyRound,
  FileText,
  DollarSign,
  Printer,
  Eye,
  Edit,
  Edit2,
  Trash2,
  CalendarCheck,
  CreditCard,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from './EmployeeAvatar'
import TableActionMenu from '@/components/shared/TableActionMenu'
import TableWrapper from '@/components/shared/TableWrapper'
import StatusBadge from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'
import type { Tab } from '../types/employee.types'

interface EmployeeTableSectionProps {
  activeTab: Tab
  isFetching: boolean
  isLoading: boolean
  records: any[]
  selectedRows: number[]
  handleSelectAll: (checked: boolean) => void
  handleSelectRow: (id: number, checked: boolean) => void
  visibleColumns: Record<string, boolean>
  sortBy: string
  sortOrder: 'asc' | 'desc'
  handleSort: (field: string) => void
  openViewDrawer: (record: any) => void
  openEditModal: (record: any) => void
  confirmDelete: (record: any, isPermanent?: boolean) => void
  restoreRecord?: (id: number) => void
  getPhotoUrl?: (photoPath?: string) => string | null | undefined
  isTrashBin?: boolean
  setSelectedAttendanceDetail?: (detail: any) => void
  onOpenPayslip?: (payrollId: number) => void
}

export const EmployeeTableSection: React.FC<EmployeeTableSectionProps> = ({
  activeTab,
  isFetching,
  isLoading,
  records,
  selectedRows,
  handleSelectAll,
  handleSelectRow,
  visibleColumns,
  sortBy,
  sortOrder,
  handleSort,
  openViewDrawer,
  openEditModal,
  confirmDelete,
  restoreRecord,
  setSelectedAttendanceDetail,
  getPhotoUrl,
  isTrashBin = false,
  onOpenPayslip,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'departments':
        return {
          icon: <Building2 size={32} className="text-muted-foreground/50 stroke-1" />,
          title: t('employees.no_departments_found', 'No departments found'),
          description: t('employees.no_departments_desc', 'Create a new department or adjust filter criteria'),
        }
      case 'positions':
        return {
          icon: <Briefcase size={32} className="text-muted-foreground/50 stroke-1" />,
          title: t('employees.no_positions_found', 'No job positions found'),
          description: t('employees.no_positions_desc', 'Create a new position or job designation'),
        }
      case 'attendance':
        return {
          icon: <CalendarCheck size={32} className="text-muted-foreground/50 stroke-1" />,
          title: t('employees.no_attendance_found', 'No attendance records found'),
          description: t('employees.no_attendance_desc', 'No attendance logs recorded for this date or criteria'),
        }
      case 'payrolls':
        return {
          icon: <CreditCard size={32} className="text-muted-foreground/50 stroke-1" />,
          title: t('employees.no_payrolls_found', 'No payroll records found'),
          description: t('employees.no_payrolls_desc', 'Run automated payroll generator or create a new payslip'),
        }
      case 'employees':
      default:
        return {
          icon: <Users size={32} className="text-muted-foreground/50 stroke-1" />,
          title: t('employees.no_records', 'No employee records found'),
          description: t('employees.no_records_desc', 'Add a new employee or adjust filter criteria'),
        }
    }
  }

  const emptyConfig = getEmptyStateConfig()

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-[#e6f4f8] dark:bg-cyan-950/30 text-[#0f5b78] dark:text-cyan-300 sticky top-0 border-b border-cyan-100 dark:border-cyan-900/40 z-10">
              <tr>
                <th className="w-8 !px-3">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={records.length > 0 && selectedRows.length === records.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                {activeTab === 'employees' && (
                  <>
                    {visibleColumns.employee !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                        {t('employees.employee', 'Employee')} {renderSortIcon('name')}
                      </th>
                    )}
                    {visibleColumns.contact !== false && (
                      <th>{t('employees.contact', 'Contact')}</th>
                    )}
                    {visibleColumns.department !== false && (
                      <th>{t('employees.department_and_position', 'Department & Role')}</th>
                    )}
                    {visibleColumns.basic_salary !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('basic_salary')}>
                        {t('employees.basic_salary', 'Basic Salary')} {renderSortIcon('basic_salary')}
                      </th>
                    )}
                    {visibleColumns.status !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                        {t('employees.status', 'Status')} {renderSortIcon('status')}
                      </th>
                    )}
                  </>
                )}
                {activeTab === 'departments' && (
                  <>
                    {visibleColumns.name !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                        {t('employees.name', 'Name')} {renderSortIcon('name')}
                      </th>
                    )}
                    {visibleColumns.code !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('code')}>
                        {t('employees.code', 'Code')} {renderSortIcon('code')}
                      </th>
                    )}
                    {visibleColumns.positions !== false && (
                      <th>{t('employees.positions', 'Positions')}</th>
                    )}
                    {visibleColumns.employees !== false && (
                      <th>{t('employees.employees', 'Employees')}</th>
                    )}
                    {visibleColumns.status !== false && (
                      <th>{t('employees.status', 'Status')}</th>
                    )}
                  </>
                )}
                {activeTab === 'positions' && (
                  <>
                    {visibleColumns.name !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                        {t('employees.name', 'Name')} {renderSortIcon('name')}
                      </th>
                    )}
                    {visibleColumns.code !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('code')}>
                        {t('employees.code', 'Code')} {renderSortIcon('code')}
                      </th>
                    )}
                    {visibleColumns.department !== false && (
                      <th>{t('employees.department', 'Department')}</th>
                    )}
                    {visibleColumns.employees !== false && (
                      <th>{t('employees.employees', 'Employees')}</th>
                    )}
                    {visibleColumns.status !== false && (
                      <th>{t('employees.status', 'Status')}</th>
                    )}
                  </>
                )}
                {activeTab === 'attendance' && (
                  <>
                    {visibleColumns.date !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('attendance_date')}>
                        {t('employees.date', 'Date')} {renderSortIcon('attendance_date')}
                      </th>
                    )}
                    {visibleColumns.employee !== false && (
                      <th>{t('employees.employee', 'Employee')}</th>
                    )}
                    {visibleColumns.shift !== false && (
                      <th>{t('employees.shift', 'Shift')}</th>
                    )}
                    {visibleColumns.check_in !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('check_in')}>
                        {t('employees.check_in', 'Check In')} {renderSortIcon('check_in')}
                      </th>
                    )}
                    {visibleColumns.check_out !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('check_out')}>
                        {t('employees.check_out', 'Check Out')} {renderSortIcon('check_out')}
                      </th>
                    )}
                    {visibleColumns.worked_hours !== false && (
                      <th>{t('employees.worked_hours', 'Worked Hours')}</th>
                    )}
                    {visibleColumns.status !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                        {t('employees.status', 'Status')} {renderSortIcon('status')}
                      </th>
                    )}
                  </>
                )}
                {activeTab === 'payrolls' && (
                  <>
                    {visibleColumns.period_month !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('period_month')}>
                        {t('employees.period_month', 'Period')} {renderSortIcon('period_month')}
                      </th>
                    )}
                    {visibleColumns.employee !== false && (
                      <th>{t('employees.employee', 'Employee')}</th>
                    )}
                    {visibleColumns.basic_salary !== false && (
                      <th>{t('employees.basic_salary', 'Basic Salary')}</th>
                    )}
                    <th>{t('employees.allowances', 'Allowances / Commission')}</th>
                    <th>{t('employees.deductions', 'NSSF / Tax Deductions')}</th>
                    {visibleColumns.net_salary !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('net_salary')}>
                        {t('employees.net_salary', 'Net Salary')} {renderSortIcon('net_salary')}
                      </th>
                    )}
                    {visibleColumns.status !== false && (
                      <th className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                        {t('employees.status', 'Status')} {renderSortIcon('status')}
                      </th>
                    )}
                  </>
                )}
                <th className="print:hidden text-right !pr-6">{t('employees.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground text-xs">
                    {t('employees.loading_records', t('common.loading', 'Loading records...'))}
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <EmptyState
                  cols={12}
                  icon={emptyConfig.icon}
                  title={emptyConfig.title}
                  description={emptyConfig.description}
                />
              ) : (
                records.map((r: any) => {
                  const isSelected = selectedRows.includes(r.id)
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="w-8 !px-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={isSelected}
                          onChange={e => handleSelectRow(r.id, e.target.checked)}
                        />
                      </td>
                      {activeTab === 'employees' && (
                        <>
                          {visibleColumns.employee !== false && (
                            <td>
                              <div className="flex items-center gap-3">
                                <EmployeeAvatar
                                  photo={r.photo}
                                  name={r.name}
                                  id={r.id}
                                  size="md"
                                  getPhotoUrl={getPhotoUrl}
                                />
                                <div>
                                  <span
                                    className="font-bold text-sm text-foreground hover:text-primary cursor-pointer transition-colors block"
                                    onClick={() => openViewDrawer(r)}
                                  >
                                    {r.name}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                      {r.employee_number || `EMP-${String(r.id).padStart(4, '0')}`}
                                    </span>
                                    {r.is_driver && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        {t('employees.driver', 'Driver')}
                                      </span>
                                    )}
                                    {r.is_pos_supervisor && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        {t('employees.pos_sup', 'POS Sup')}
                                      </span>
                                    )}
                                    {r.contract_type && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                                        {r.contract_type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleColumns.contact !== false && (
                            <td>
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                                  {r.email ? GlobalFormat.email(r.email) : t('common.none', 'N/A')}
                                </div>
                                {r.phone && (
                                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                    <Phone size={10} className="text-primary/70" />
                                    <span>{GlobalFormat.phone(r.phone)}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                          {visibleColumns.department !== false && (
                            <td>
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <Briefcase size={12} className="text-primary/80 shrink-0" />
                                  <span>{r.department?.name ?? t('employees.general_dept', 'General')}</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground pl-4">
                                  {r.position?.name ?? '-'}
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleColumns.basic_salary !== false && (
                            <td className="font-bold font-mono text-sm text-foreground">
                              {formatCurrency(r.basic_salary, 'USD')}
                            </td>
                          )}
                          {visibleColumns.status !== false && (
                            <td>
                              <StatusBadge status={r.status} />
                            </td>
                          )}
                        </>
                      )}
                      {activeTab === 'departments' && (
                        <>
                          {visibleColumns.name !== false && <td className="font-semibold text-foreground">{r.name}</td>}
                          {visibleColumns.code !== false && <td className="font-mono text-xs">{r.code ?? t('common.none', 'N/A')}</td>}
                          {visibleColumns.positions !== false && (
                            <td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <Briefcase size={12} className="opacity-70" />
                                {r.positions_count ?? 0} {t('employees.positions', 'Positions')}
                              </span>
                            </td>
                          )}
                          {visibleColumns.employees !== false && (
                            <td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <Users size={12} className="opacity-70" />
                                {r.employees_count ?? 0} {t('employees.employees', 'Employees')}
                              </span>
                            </td>
                          )}
                          {visibleColumns.status !== false && (
                            <td>
                              <StatusBadge status={r.is_active} />
                            </td>
                          )}
                        </>
                      )}
                      {activeTab === 'positions' && (
                        <>
                          {visibleColumns.name !== false && <td className="font-semibold text-foreground">{r.name}</td>}
                          {visibleColumns.code !== false && <td className="font-mono text-xs">{r.code ?? t('common.none', 'N/A')}</td>}
                          {visibleColumns.department !== false && <td>{r.department?.name ?? t('common.none', 'N/A')}</td>}
                          {visibleColumns.employees !== false && (
                            <td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <Users size={12} className="opacity-70" />
                                {r.employees_count ?? 0} {t('employees.employees', 'Employees')}
                              </span>
                            </td>
                          )}
                          {visibleColumns.status !== false && (
                            <td>
                              <StatusBadge status={r.is_active} />
                            </td>
                          )}
                        </>
                      )}
                      {activeTab === 'attendance' && (
                        <>
                          {visibleColumns.date !== false && <td className="font-semibold text-xs font-mono">{r.attendance_date ?? (r.date ? new Date(r.date).toLocaleDateString() : t('common.none', 'N/A'))}</td>}
                          {visibleColumns.employee !== false && (
                            <td>
                              <div className="flex items-center gap-2">
                                <EmployeeAvatar
                                  photo={r.employee?.photo}
                                  name={r.employee?.name}
                                  id={r.employee?.id ?? r.employee_id}
                                  size="sm"
                                  getPhotoUrl={getPhotoUrl}
                                />
                                <div>
                                  <p className="font-bold text-foreground text-xs">{r.employee?.name ?? t('common.none', 'N/A')}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground">{r.employee?.employee_number ?? t('common.none', 'N/A')}</p>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleColumns.shift !== false && <td className="text-xs font-semibold">{r.shift?.name ?? t('employees.morning_shift', 'Morning Shift')}</td>}
                          {visibleColumns.check_in !== false && <td className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{r.check_in ?? '--:--'}</td>}
                          {visibleColumns.check_out !== false && <td className="font-mono text-xs text-rose-500 font-semibold">{r.check_out ?? '--:--'}</td>}
                          {visibleColumns.worked_hours !== false && <td className="text-xs font-bold text-foreground">{r.working_hours ?? r.worked_hours_formatted ?? '-'}</td>}
                          {visibleColumns.status !== false && (
                            <td>
                              <StatusBadge status={r.status} />
                            </td>
                          )}
                        </>
                      )}
                      {activeTab === 'payrolls' && (
                        <>
                          {visibleColumns.period_month !== false && <td className="font-semibold font-mono">{r.period_month}</td>}
                          {visibleColumns.employee !== false && (
                            <td>
                              <div>
                                <p className="font-semibold text-foreground text-xs">{r.employee?.name ?? t('common.none', 'N/A')}</p>
                                <p className="font-mono text-[11px] text-muted-foreground">{r.employee?.employee_number}</p>
                              </div>
                            </td>
                          )}
                          {visibleColumns.basic_salary !== false && (
                            <td className="font-mono text-xs font-semibold">
                              {formatCurrency(r.basic_salary, 'USD')}
                            </td>
                          )}
                          <td>
                            <div className="text-xs">
                              <p className="font-medium text-foreground">
                                +{formatCurrency(Number(r.allowances || 0) + Number(r.overtime_pay || 0) + Number(r.sales_commission || 0), 'USD')}
                              </p>
                              {r.sales_commission > 0 && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                  {t('employees.comm_short', 'Comm')}: {formatCurrency(r.sales_commission, 'USD')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-xs">
                              <p className="font-medium text-rose-600 dark:text-rose-400">
                                -{formatCurrency(Number(r.deductions || 0) + Number(r.nssf_deduction || 0) + Number(r.tax_deduction || 0), 'USD')}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t('employees.nssf_short', 'NSSF')}: {formatCurrency(r.nssf_deduction || 0, 'USD')} | {t('employees.tax_short', 'Tax')}: {formatCurrency(r.tax_deduction || 0, 'USD')}
                              </p>
                            </div>
                          </td>
                          {visibleColumns.net_salary !== false && (
                            <td className="font-bold text-primary font-mono text-sm">
                              {formatCurrency(r.net_salary, 'USD')}
                            </td>
                          )}
                          {visibleColumns.status !== false && (
                            <td>
                              <StatusBadge status={r.status} />
                            </td>
                          )}
                        </>
                      )}
                      <td className="print:hidden !text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {activeTab === 'payrolls' && onOpenPayslip && (
                            <button
                              type="button"
                              onClick={() => onOpenPayslip(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer mr-1"
                              title="View Official Payslip"
                            >
                              <FileText size={12} />
                              <span>{t('employees.view_payslip', 'Payslip')}</span>
                            </button>
                          )}
                          <TableActionMenu
                            variant="hybrid"
                            maxInline={2}
                            buttonSize="sm"
                            align="right"
                            onView={
                              activeTab === 'employees'
                                ? () => openViewDrawer(r)
                                : activeTab === 'attendance'
                                ? () => setSelectedAttendanceDetail(r)
                                : undefined
                            }
                            onEdit={() => openEditModal(r)}
                            onDelete={() => confirmDelete(r, false)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default EmployeeTableSection
