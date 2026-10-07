import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Printer,
  Download,
  X,
  Building2,
  User,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { EnterpriseModal } from '@/components/common'
import { formatCurrency } from '@/utils/formatters'

interface PayslipModalProps {
  isOpen: boolean
  onClose: () => void
  payrollId: number | null
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  payrollId,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const { data: payslip, isLoading } = useQuery({
    queryKey: ['payslip-detail', payrollId],
    queryFn: () => (payrollId ? employeeService.getPayslip(payrollId) : null),
    enabled: isOpen && !!payrollId,
  })

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('employees.view_payslip', 'Employee Pay Slip')}
      subtitle={payslip?.payslip_number || t('employees.official_salary_doc', 'Official Salary Document')}
      icon={<FileText size={20} />}
      iconVariant="blue"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            {t('employees.currency_label', 'Currency')}: <span className="font-bold text-foreground">USD ($) & KHR (៛)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{t('employees.print_payslip', 'Print Payslip')}</span>
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          {t('employees.loading_payslip', 'Loading official payslip details...')}
        </div>
      ) : !payslip ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          {t('employees.payslip_not_found', 'Payslip information could not be found.')}
        </div>
      ) : (
        <div className="payslip-container p-6 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-6 text-foreground font-sans print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                  NT
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{payslip.company?.name || 'NexTech Cambodia'}</h2>
                  <p className="text-xs text-muted-foreground">{payslip.company?.address || 'Phnom Penh, Cambodia'}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold font-mono">
                {payslip.payslip_number}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {t('employees.period', 'Period')}: <span className="font-semibold text-foreground">{payslip.period_month}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('employees.issue_date', 'Issue Date')}: {payslip.issue_date}
              </p>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div>
              <p className="text-[11px] text-muted-foreground">{t('employees.employee_name', 'Employee Name')}</p>
              <p className="font-bold text-foreground text-sm">{payslip.employee?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{payslip.employee?.employee_number}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('employees.department_and_role', 'Department & Role')}</p>
              <p className="font-semibold text-foreground">{payslip.employee?.department}</p>
              <p className="text-[11px] text-muted-foreground">{payslip.employee?.position}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('employees.branch_and_nssf', 'Branch & NSSF No')}</p>
              <p className="font-semibold text-foreground">{payslip.employee?.branch}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{payslip.employee?.nssf_number || t('common.none', 'N/A')}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('employees.bank_details', 'Bank Account Details')}</p>
              <p className="font-semibold text-foreground">{payslip.employee?.bank_name || 'ABA Bank'}</p>
              <p className="text-[11px] font-mono text-primary font-bold">{payslip.employee?.bank_account_no || '-'}</p>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EARNINGS */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{t('employees.earnings', 'Earnings')}</span>
                <span className="text-xs text-muted-foreground">{t('employees.amount_usd', 'Amount ($)')}</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.basic_salary_item', 'Basic Salary')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.earnings?.basic_salary, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.allowances_item', 'Allowances')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.earnings?.allowances, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.overtime_item', 'Overtime Pay')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.earnings?.overtime_pay, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.sales_commission_item', 'POS Sales Commission')}</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(payslip.earnings?.sales_commission, 'USD')}</span>
                </div>
                {payslip.earnings?.seniority_pay > 0 && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">{t('employees.seniority_item', 'Seniority Payment')}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(payslip.earnings?.seniority_pay, 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{t('employees.gross_earnings', 'Gross Earnings')}</span>
                  <span>{formatCurrency(payslip.earnings?.total_earnings, 'USD')}</span>
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">{t('employees.deductions_label', 'Deductions')}</span>
                <span className="text-xs text-muted-foreground">{t('employees.amount_usd', 'Amount ($)')}</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.nssf_cambodia_item', 'NSSF Cambodia')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.deductions?.nssf_deduction, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.salary_tax_item', 'Salary Tax')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.deductions?.tax_deduction, 'USD')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t('employees.other_deductions', 'Other Deductions')}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(payslip.deductions?.other_deductions, 'USD')}</span>
                </div>
                <div className="flex justify-between pt-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <span>{t('employees.total_deductions', 'Total Deductions')}</span>
                  <span>{formatCurrency(payslip.deductions?.total_deductions, 'USD')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payout Box */}
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">{t('employees.net_salary_payout', 'NET SALARY PAYOUT')}</p>
              <p className="text-[11px] text-muted-foreground">{t('employees.exchange_rate', 'Exchange Rate')}: 1 USD = {payslip.exchange_rate?.toLocaleString()} KHR</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary font-mono">{formatCurrency(payslip.net_salary, 'USD')}</p>
              <p className="text-xs font-bold text-muted-foreground font-mono">≈ {formatCurrency(payslip.net_salary_khr, 'KHR')}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-muted-foreground border-t border-border/60">
            <div>
              <div className="h-12 border-b border-dashed border-border/80 mb-2"></div>
              <p className="font-semibold text-foreground">{t('employees.employer_signature', 'Employer / Authorized Signature')}</p>
              <p className="text-[11px]">{t('employees.hr_finance_dept', 'Human Resources & Finance')}</p>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-border/80 mb-2"></div>
              <p className="font-semibold text-foreground">{t('employees.employee_signature', 'Employee Signature')}</p>
              <p className="text-[11px]">{payslip.employee?.name}</p>
            </div>
          </div>
        </div>
      )}
    </EnterpriseModal>
  )
}

export default PayslipModal
