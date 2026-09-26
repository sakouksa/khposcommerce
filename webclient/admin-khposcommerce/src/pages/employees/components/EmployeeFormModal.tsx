import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Briefcase,
  DollarSign,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  EnterpriseModal,
  ModalFooter,
  type ModalHeaderIconVariant,
  EnterpriseDatePicker,
  EnterpriseTimePicker,
} from '@/components/common'
import type { Tab } from '../types/employee.types'
import { EmployeeAvatar } from './EmployeeAvatar'

interface EmployeeFormModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: Tab
  selectedItem: any | null
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  // Dropdowns data
  companiesList?: any[]
  branchesList?: any[]
  deptList?: any[]
  posList?: any[]
  usersList?: any[]
  empList?: any[]
  // Form fields
  formCompanyId: string
  setFormCompanyId: (val: string) => void
  formBranchId: string
  setFormBranchId: (val: string) => void
  formDeptId: string
  setFormDeptId: (val: string) => void
  formPosId: string
  setFormPosId: (val: string) => void
  formUserId: string
  setFormUserId: (val: string) => void
  formEmployeeNumber: string
  setFormEmployeeNumber: (val: string) => void
  formName: string
  setFormName: (val: string) => void
  formEmail: string
  setFormEmail: (val: string) => void
  formPhone: string
  setFormPhone: (val: string) => void
  formNik: string
  setFormNik: (val: string) => void
  formGender: string
  setFormGender: (val: string) => void
  formBirthDate: string
  setFormBirthDate: (val: string) => void
  formAddress: string
  setFormAddress: (val: string) => void
  formPhoto: string
  setFormPhoto: (val: string) => void
  uploadingPhoto: boolean
  handlePhotoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  getPhotoUrl: (photoPath?: string) => string | null
  formJoinDate: string
  setFormJoinDate: (val: string) => void
  formResignDate: string
  setFormResignDate: (val: string) => void
  formStatus: string
  setFormStatus: (val: string) => void
  formBasicSalary: string
  setFormBasicSalary: (val: string) => void
  // Attendance fields
  attEmployeeId: string
  setAttEmployeeId: (val: string) => void
  attDate: string
  setAttDate: (val: string) => void
  attCheckIn: string
  setAttCheckIn: (val: string) => void
  attCheckOut: string
  setAttCheckOut: (val: string) => void
  attStatus: string
  setAttStatus: (val: string) => void
  attNotes: string
  setAttNotes: (val: string) => void
  // Payroll fields
  payEmployeeId: string
  setPayEmployeeId: (val: string) => void
  payPeriodMonth: string
  setPayPeriodMonth: (val: string) => void
  payWorkingDays: string
  setPayWorkingDays: (val: string) => void
  payPresentDays: string
  setPayPresentDays: (val: string) => void
  payAllowances: string
  setPayAllowances: (val: string) => void
  payDeductions: string
  setPayDeductions: (val: string) => void
  payOvertimePay: string
  setPayOvertimePay: (val: string) => void
  payStatus: string
  setPayStatus: (val: string) => void
  payPaidAt: string
  setPayPaidAt: (val: string) => void
  payNotes: string
  setPayNotes: (val: string) => void
}

const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  selectedItem,
  onSubmit,
  isPending,
  companiesList = [],
  branchesList = [],
  deptList = [],
  posList = [],
  empList = [],
  formCompanyId,
  setFormCompanyId,
  formBranchId,
  setFormBranchId,
  formDeptId,
  setFormDeptId,
  formPosId,
  setFormPosId,
  formEmployeeNumber,
  setFormEmployeeNumber,
  formName,
  setFormName,
  formEmail,
  setFormEmail,
  formPhone,
  setFormPhone,
  formNik,
  setFormNik,
  formGender,
  setFormGender,
  formBirthDate,
  setFormBirthDate,
  formAddress,
  setFormAddress,
  formPhoto,
  uploadingPhoto,
  handlePhotoFileChange,
  getPhotoUrl,
  formJoinDate,
  setFormJoinDate,
  formStatus,
  setFormStatus,
  formBasicSalary,
  setFormBasicSalary,
  attEmployeeId,
  setAttEmployeeId,
  attDate,
  setAttDate,
  attCheckIn,
  setAttCheckIn,
  attCheckOut,
  setAttCheckOut,
  attStatus,
  setAttStatus,
  attNotes,
  setAttNotes,
  payEmployeeId,
  setPayEmployeeId,
  payPeriodMonth,
  setPayPeriodMonth,
  payAllowances,
  setPayAllowances,
  payDeductions,
  setPayDeductions,
  payOvertimePay,
  setPayOvertimePay,
  payStatus,
  setPayStatus,
  payPaidAt,
  setPayPaidAt,
  payNotes,
  setPayNotes,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const [formSection, setFormSection] = useState<'personal' | 'job' | 'salary'>('personal')
  const isEdit = Boolean(selectedItem)

  const generateDeptCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setFormEmployeeNumber(`DEPT-${randomNum}`)
  }

  const generatePosCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setFormEmployeeNumber(`POS-${randomNum}`)
  }

  const getModalConfig = () => {
    switch (activeTab) {
      case 'departments':
        return {
          title: isEdit
            ? t('employees.edit_department_title', 'Edit Department')
            : t('employees.add_department_title', 'Add New Department'),
          subtitle: t('employees.dept_subtitle', 'Manage and configure organizational departments.'),
          icon: <Building2 size={20} />,
          variant: 'amber' as ModalHeaderIconVariant,
          size: 'lg' as const,
        }
      case 'positions':
        return {
          title: isEdit
            ? t('employees.edit_position_title', 'Edit Position')
            : t('employees.add_position_title', 'Add New Position'),
          subtitle: t('employees.pos_subtitle', 'Manage job roles and positions within the organization.'),
          icon: <Briefcase size={20} />,
          variant: 'purple' as ModalHeaderIconVariant,
          size: 'lg' as const,
        }
      case 'attendance':
        return {
          title: isEdit
            ? t('employees.edit_attendance_title', 'Edit Attendance Record')
            : t('employees.add_attendance_title', 'Record Attendance'),
          subtitle: t('employees.att_subtitle', 'Log or update employee check-in and check-out times.'),
          icon: <Calendar size={20} />,
          variant: 'sky' as ModalHeaderIconVariant,
          size: 'lg' as const,
        }
      case 'payrolls':
        return {
          title: isEdit
            ? t('employees.edit_payroll_title', 'Edit Payroll Slip')
            : t('employees.add_payroll_title', 'Create Payroll Slip'),
          subtitle: t('employees.pay_subtitle', 'Calculate and adjust monthly salary, allowances, and deductions.'),
          icon: <DollarSign size={20} />,
          variant: 'emerald' as ModalHeaderIconVariant,
          size: 'xl' as const,
        }
      default:
        return {
          title: isEdit
            ? t('employees.editEmployee', 'Edit Employee')
            : t('employees.createEmployeeTitle', 'Create New Employee'),
          subtitle: t('employees.createSubtitle', 'Complete employee profile, department, position, salary, and contact info.'),
          icon: <User size={20} />,
          variant: 'blue' as ModalHeaderIconVariant,
          size: '2xl' as const,
        }
    }
  }

  const config = getModalConfig()

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconVariant={config.variant}
      size={config.size}
      badge={
        isEdit && selectedItem?.id ? (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            #{selectedItem.id}
          </span>
        ) : undefined
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('employees.cancel', 'Cancel')}
          onSubmit={(e) => onSubmit(e || ({ preventDefault: () => {} } as any))}
          isSubmitting={isPending || uploadingPhoto}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('employees.saveChanges', 'Save Changes')
              : t('common.save', 'Save')
          }
        />
      }
    >
      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
        {/* ─── 1. EMPLOYEES TAB (Multi-Section Form) ─────────── */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            {/* Segmented Section Navigator */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 dark:bg-slate-800/60 rounded-xl border border-border/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setFormSection('personal')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formSection === 'personal'
                    ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                    : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-muted/60'
                }`}
              >
                <User size={14} />
                <span className="truncate">{t('employees.tab_personal', 'Personal Information')}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormSection('job')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formSection === 'job'
                    ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                    : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-muted/60'
                }`}
              >
                <Briefcase size={14} />
                <span className="truncate">{t('employees.tab_job', 'Job & Position')}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormSection('salary')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formSection === 'salary'
                    ? 'bg-card dark:bg-slate-900 text-primary shadow-xs border border-border/60 dark:border-slate-700'
                    : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-muted/60'
                }`}
              >
                <DollarSign size={14} />
                <span className="truncate">{t('employees.tab_salary', 'Salary & Photo')}</span>
              </button>
            </div>

            {/* Section 1: Personal Info */}
            {formSection === 'personal' && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>
                      {t('employees.full_name', 'Full Name')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t('employees.namePlaceholder', 'e.g. Sok Chenda')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t('employees.employee_number', 'Employee ID')}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formEmployeeNumber}
                      onChange={(e) => setFormEmployeeNumber(e.target.value)}
                      className={`${inputCls} font-mono`}
                      placeholder={t('employees.codePlaceholder', 'EMP-0001')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>{t('employees.gender', 'Gender')}</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value)}
                      className={selectCls}
                    >
                      <option value="male">{t('employees.male', 'Male')}</option>
                      <option value="female">{t('employees.female', 'Female')}</option>
                      <option value="other">{t('employees.other', 'Other')}</option>
                    </select>
                  </div>
                  <div>
                    <EnterpriseDatePicker
                      label={t('employees.birth_date', 'Birth Date')}
                      value={formBirthDate}
                      onChange={(v) => setFormBirthDate(v)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>{t('employees.nik', 'National ID (NIK)')}</label>
                    <input
                      type="text"
                      value={formNik}
                      onChange={(e) => setFormNik(e.target.value)}
                      placeholder={t('employees.nikPlaceholder', 'KH-01234567')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('employees.phone', 'Phone')}</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/[^\d+ -]/g, ''))}
                      placeholder={t('employees.phonePlaceholder', '012 345 678')}
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>{t('employees.email', 'Email')}</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={t('employees.emailPlaceholder', 'employee@enterprise-pos.com')}
                    className={inputCls}
                  />
                </div>
              </motion.div>
            )}

            {/* Section 2: Job */}
            {formSection === 'job' && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>
                      {t('employees.company', 'Company')} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formCompanyId}
                      onChange={(e) => setFormCompanyId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">{t('employees.select_company', '-- Select Company --')}</option>
                      {companiesList.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t('employees.branch', 'Branch')} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formBranchId}
                      onChange={(e) => setFormBranchId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">{t('employees.select_branch', '-- Select Branch --')}</option>
                      {branchesList.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>{t('employees.department', 'Department')}</label>
                    <select
                      value={formDeptId}
                      onChange={(e) => setFormDeptId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">{t('employees.select_department', '-- Select Department --')}</option>
                      {deptList.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{t('employees.position', 'Position')}</label>
                    <select
                      value={formPosId}
                      onChange={(e) => setFormPosId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">{t('employees.select_position', '-- Select Position --')}</option>
                      {posList.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <EnterpriseDatePicker
                      label={t('employees.join_date', 'Join Date')}
                      required
                      value={formJoinDate}
                      onChange={(v) => setFormJoinDate(v)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('employees.status', 'Status')}</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className={selectCls}
                    >
                      <option value="active">{t('employees.active', 'Active')}</option>
                      <option value="inactive">{t('employees.inactive', 'Inactive')}</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Section 3: Salary & Photo */}
            {formSection === 'salary' && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>{t('employees.basic_salary', 'Basic Salary ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formBasicSalary}
                      onChange={(e) => setFormBasicSalary(e.target.value)}
                      placeholder="850.00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t('employees.address', 'Current Address')}</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder={t('employees.addressPlaceholder', 'House / Street, Sangkat, Khan, Province')}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Photo Upload Box */}
                <div className="p-3.5 rounded-lg border border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-800/40">
                  <label className={labelCls}>{t('employees.profilePhoto', 'Profile Photo')}</label>
                  <div className="flex items-center gap-4 mt-2">
                    <EmployeeAvatar
                      name={formName}
                      photo={formPhoto}
                      getPhotoUrl={getPhotoUrl}
                      size="lg"
                    />
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        disabled={uploadingPhoto}
                        className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                        {t('employees.photoNote', 'PNG, JPG, WEBP (Max 5MB)')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ─── 2. DEPARTMENTS TAB ───────────────────────────── */}
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>
                  {t('employees.company', 'Company')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t('employees.select_company', '-- Select Company --')}</option>
                  {companiesList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  {t('employees.branch', 'Branch')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formBranchId}
                  onChange={(e) => setFormBranchId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t('employees.select_branch', '-- Select Branch --')}</option>
                  {branchesList.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>
                  {t('employees.department_name', 'Department Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('employees.dept_placeholder', 'e.g. Information Technology (IT)')}
                  className={inputCls}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground/90 dark:text-slate-200">
                    {t('employees.department_code', 'Department Code')}
                  </label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={generateDeptCode}
                      className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles size={12} />
                      <span>{t('employees.autoGenerate', 'Auto Generate')}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formEmployeeNumber}
                  onChange={(e) => setFormEmployeeNumber(e.target.value)}
                  className={`${inputCls} font-mono`}
                  placeholder={t('employees.dept_code_placeholder', 'e.g. DEPT-IT')}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('employees.description', 'Description / Notes')}</label>
              <textarea
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder={t('employees.description_placeholder', 'Enter additional details or notes...')}
                className={textareaCls}
              />
            </div>

            {/* Clean CMS Style Status Checkbox Card */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('employees.status', 'Status')}</p>
                <p className="text-[11px] text-muted-foreground">{t('employees.status_help', 'Enable or disable this department')}</p>
              </div>
              <input
                type="checkbox"
                id="deptStatus"
                checked={formStatus === 'active'}
                onChange={(e) => setFormStatus(e.target.checked ? 'active' : 'inactive')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ─── 3. POSITIONS TAB ─────────────────────────────── */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>
                  {t('employees.company', 'Company')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t('employees.select_company', '-- Select Company --')}</option>
                  {companiesList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  {t('employees.department', 'Department')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t('employees.select_department', '-- Select Department --')}</option>
                  {deptList.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>
                  {t('employees.position_name', 'Position Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('employees.pos_placeholder', 'e.g. Senior Software Engineer')}
                  className={inputCls}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground/90 dark:text-slate-200">
                    {t('employees.position_code', 'Position Code')}
                  </label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={generatePosCode}
                      className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles size={12} />
                      <span>{t('employees.autoGenerate', 'Auto Generate')}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formEmployeeNumber}
                  onChange={(e) => setFormEmployeeNumber(e.target.value)}
                  className={`${inputCls} font-mono`}
                  placeholder={t('employees.pos_code_placeholder', 'e.g. POS-ENG')}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('employees.description', 'Description / Notes')}</label>
              <textarea
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder={t('employees.description_placeholder', 'Enter additional details or notes...')}
                className={textareaCls}
              />
            </div>

            {/* Clean CMS Style Status Checkbox Card */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('employees.status', 'Status')}</p>
                <p className="text-[11px] text-muted-foreground">{t('employees.status_help', 'Enable or disable this position')}</p>
              </div>
              <input
                type="checkbox"
                id="posStatus"
                checked={formStatus === 'active'}
                onChange={(e) => setFormStatus(e.target.checked ? 'active' : 'inactive')}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ─── 4. ATTENDANCE TAB ────────────────────────────── */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('employees.employee', 'Employee')} <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={attEmployeeId}
                onChange={(e) => setAttEmployeeId(e.target.value)}
                className={selectCls}
              >
                <option value="">{t('employees.select_employee', '-- Select Employee --')}</option>
                {empList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employee_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <EnterpriseDatePicker
                  label={t('employees.date', 'Date')}
                  required
                  value={attDate}
                  onChange={(v) => setAttDate(v)}
                />
              </div>
              <div>
                <EnterpriseTimePicker
                  label={t('employees.check_in_time', 'Check-in Time')}
                  value={attCheckIn}
                  onChange={(v) => setAttCheckIn(v)}
                />
              </div>
              <div>
                <EnterpriseTimePicker
                  label={t('employees.check_out_time', 'Check-out Time')}
                  value={attCheckOut}
                  onChange={(v) => setAttCheckOut(v)}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('employees.status', 'Status')}</label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value)}
                className={selectCls}
              >
                <option value="present">{t('employees.present', 'Present')}</option>
                <option value="late">{t('employees.late', 'Late')}</option>
                <option value="absent">{t('employees.absent', 'Absent')}</option>
                <option value="leave">{t('employees.leave', 'Leave')}</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>{t('employees.notes', 'Notes')}</label>
              <textarea
                rows={2}
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder={t('employees.notes_placeholder', 'Enter reason or notes...')}
                className={textareaCls}
              />
            </div>
          </div>
        )}

        {/* ─── 5. PAYROLL TAB ──────────────────────────────── */}
        {activeTab === 'payrolls' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>
                  {t('employees.employee', 'Employee')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={payEmployeeId}
                  onChange={(e) => setPayEmployeeId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t('employees.select_employee', '-- Select Employee --')}</option>
                  {empList.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  {t('employees.period_month', 'Payroll Period Month')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="month"
                  required
                  value={payPeriodMonth}
                  onChange={(e) => setPayPeriodMonth(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('employees.basic_salary', 'Basic Salary ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formBasicSalary}
                  onChange={(e) => setFormBasicSalary(e.target.value)}
                  placeholder="850.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('employees.allowances', 'Allowances ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAllowances}
                  onChange={(e) => setPayAllowances(e.target.value)}
                  placeholder="50.00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('employees.deductions', 'Deductions ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={payDeductions}
                  onChange={(e) => setPayDeductions(e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('employees.overtime_pay', 'Overtime Pay ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={payOvertimePay}
                  onChange={(e) => setPayOvertimePay(e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('employees.status', 'Status')}</label>
                <select
                  value={payStatus}
                  onChange={(e) => setPayStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="pending">{t('employees.pending', 'Pending')}</option>
                  <option value="paid">{t('employees.paid', 'Paid')}</option>
                </select>
              </div>
              <div>
                <EnterpriseDatePicker
                  label={t('employees.paid_date', 'Paid Date')}
                  value={payPaidAt}
                  onChange={(v) => setPayPaidAt(v)}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('employees.notes', 'Notes')}</label>
              <textarea
                rows={2}
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder={t('employees.notes_placeholder', 'Enter reason or notes...')}
                className={textareaCls}
              />
            </div>
          </div>
        )}
      </form>
    </EnterpriseModal>
  )
}

export default EmployeeFormModal
