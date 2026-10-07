import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'
import type { Tab, ImportResult } from '../types/employee.types'

interface EmployeeImportModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: Tab
  importFile: File | null
  setImportFile: (file: File | null) => void
  importing: boolean
  importResult: ImportResult | null
  onSubmit: (e: React.FormEvent) => void
}

const TAB_HEADERS_MAP: Record<Tab, string[]> = {
  employees: [
    'employee_number',
    'name',
    'email',
    'phone',
    'nik',
    'gender',
    'birth_date',
    'address',
    'department',
    'position',
    'basic_salary',
    'join_date',
    'status',
  ],
  departments: ['name', 'code', 'description', 'status'],
  positions: ['name', 'code', 'department', 'description', 'status'],
  attendance: ['employee_number', 'date', 'check_in', 'check_out', 'status', 'notes'],
  payrolls: [
    'employee_number',
    'period_month',
    'working_days',
    'present_days',
    'basic_salary',
    'allowances',
    'deductions',
    'overtime_pay',
    'status',
  ],
}

export const EmployeeImportModal: React.FC<EmployeeImportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  importFile,
  setImportFile,
  importing,
  importResult,
  onSubmit,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const tabLabels: Record<Tab, string> = {
    employees: t('employees.employees', 'Employees'),
    departments: t('employees.departments', 'Departments'),
    positions: t('employees.positions', 'Positions'),
    attendance: t('employees.attendance', 'Attendance'),
    payrolls: t('employees.payrolls', 'Payrolls'),
  }

  const resourceLabel = tabLabels[activeTab] || activeTab
  const expectedHeaders = TAB_HEADERS_MAP[activeTab] || []

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={resourceLabel}
      expectedHeaders={expectedHeaders}
      importFile={importFile}
      setImportFile={setImportFile}
      isImporting={importing}
      importResult={importResult}
      onSubmit={onSubmit}
    />
  )
}

export default EmployeeImportModal
