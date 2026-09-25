export type Tab = 'employees' | 'departments' | 'positions' | 'attendance' | 'payrolls' | 'leaves' | 'holidays'

export interface HolidayItem {
  id: number | string
  title_en: string
  title_km?: string
  date: string
  end_date?: string
  description?: string
  status: 'active' | 'inactive'
  is_recurring?: boolean
  company_id?: number
  branch_id?: number
  created_at?: string
  updated_at?: string
}

export interface ImportResult {
  success_count: number
  errors: string[]
}

export interface EmployeeStatsData {
  total_employees?: number
  active_employees?: number
  resigned_employees?: number
  total_departments?: number
  total_positions?: number
  total_drivers?: number
  total_pos_supervisors?: number
  pending_leaves_count?: number
  monthly_salary_expense?: number
  average_salary?: number
  payroll_draft?: number
  new_today_employees?: number
  attendance_today?: {
    present: number
    late: number
    absent: number
    leave: number
    holiday: number
  }
}

export const INITIAL_VISIBLE_COLUMNS_MAP: Record<Tab, Record<string, boolean>> = {
  employees: {
    employee: true,
    contact: true,
    department: true,
    pos_security: true,
    logistics: true,
    basic_salary: true,
    status: true,
  },
  departments: {
    name: true,
    code: true,
    positions: true,
    employees: true,
    status: true,
  },
  positions: {
    name: true,
    code: true,
    department: true,
    employees: true,
    status: true,
  },
  attendance: {
    date: true,
    employee: true,
    shift: true,
    check_in: true,
    check_out: true,
    worked_hours: true,
    status: true,
  },
  payrolls: {
    period_month: true,
    employee: true,
    basic_salary: true,
    overtime_and_commission: true,
    deductions_and_tax: true,
    net_salary: true,
    status: true,
    actions: true,
  },
  leaves: {
    employee: true,
    leave_type: true,
    duration: true,
    reason: true,
    status: true,
    approver: true,
  },
  holidays: {
    title: true,
    date: true,
    description: true,
    status: true,
  },
}
