import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calculator,
  ShieldCheck,
  Percent,
  DollarSign,
  Landmark,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import {
  EnterpriseModal,
  ModalFooter,
  EnterpriseMonthPicker,
  ModernSelect,
} from '@/components/common'

interface AutoGeneratePayrollModalProps {
  isOpen: boolean
  onClose: () => void
  branchesList?: any[]
  onOpenAbaExport?: (month: string) => void
}

export const AutoGeneratePayrollModal: React.FC<AutoGeneratePayrollModalProps> = ({
  isOpen,
  onClose,
  branchesList = [],
  onOpenAbaExport,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  const [periodMonth, setPeriodMonth] = useState(
    new Date().toISOString().substring(0, 7) // e.g. 2026-09
  )
  const [branchId, setBranchId] = useState('')
  const [resultSummary, setResultSummary] = useState<any | null>(null)
  const [showItemizedTable, setShowItemizedTable] = useState<boolean>(true)

  const generateMutation = useMutation({
    mutationFn: (payload: { period_month: string; branch_id?: number }) =>
      employeeService.autoGeneratePayroll(payload),
    onSuccess: (data: any) => {
      setResultSummary(data)
      toast.success(t('employees.payroll_generated_success', 'Monthly payroll generated and calculated successfully!'))
      qc.invalidateQueries({ queryKey: ['payrolls'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to auto-generate payroll')
    },
  })

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setResultSummary(null)
    generateMutation.mutate({
      period_month: periodMonth,
      branch_id: branchId ? parseInt(branchId) : undefined,
    })
  }

  const handleClose = () => {
    setResultSummary(null)
    onClose()
  }

  const handleTriggerAbaExport = () => {
    const month = resultSummary?.period_month || periodMonth
    if (onOpenAbaExport) {
      onClose()
      onOpenAbaExport(month)
    } else {
      handleDirectDownloadAba(month)
    }
  }

  const handleDirectDownloadAba = async (month: string) => {
    const toastId = toast.loading(t('employees.exportAbaGenerating', 'Generating ABA Bank Bulk Payment CSV...'))
    try {
      await employeeService.exportAbaBulkCsv({ period_month: month })
      toast.dismiss(toastId)
      toast.success(t('employees.exportAbaSuccess', 'ABA Bulk Payroll CSV downloaded successfully!'))
    } catch {
      toast.dismiss(toastId)
      toast.error(t('employees.exportAbaError', 'Failed to export ABA Bulk CSV'))
    }
  }

  const branchOptions = [
    { value: '', label: t('employees.all_branches', 'All Branches') },
    ...branchesList.map((b: any) => ({
      value: String(b.id),
      label: b.name,
    })),
  ]

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('employees.auto_generate_payroll', 'Auto-Generate Payroll')}
      subtitle={t(
        'employees.payroll_generator_subtitle',
        'Automated Cambodian Labor Law, NSSF, Tax & POS Commission Engine'
      )}
      icon={<Calculator size={20} />}
      iconVariant="blue"
      size="2xl"
      footer={
        <ModalFooter
          onCancel={handleClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={handleGenerate}
          isSubmitting={generateMutation.isPending}
          submitLabel={
            resultSummary
              ? t('employees.recalculate', 'Recalculate')
              : t('employees.auto_generate_payroll', 'Auto-Generate Payroll')
          }
          submitVariant="primary"
        />
      }
    >
      <form onSubmit={handleGenerate} className="p-5 sm:p-6 space-y-5">
        {/* Global Policy & Law Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
              <span>{t('employees.nssf_cambodia', 'Cambodia NSSF')}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {t('employees.nssf_desc', 'Pension fund 2% calculated on base salary capped at $300 (max $6/month).')}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Percent size={15} className="text-blue-500 shrink-0" />
              <span>{t('employees.tax_on_salary', 'Tax on Salary')}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {t('employees.tax_on_salary_desc', 'Progressive tax tiers (0% to 20%) including family relief allowances.')}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <DollarSign size={15} className="text-amber-500 shrink-0" />
              <span>{t('employees.pos_commission', 'POS Sales Commission')}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {t('employees.pos_commission_desc', 'Automatically calculated from POS sales transactions in the selected month.')}
            </p>
          </div>
        </div>

        {/* Form Inputs Grid - Using Global Standard Form Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EnterpriseMonthPicker
            label={t('employees.period_month', 'Target Month')}
            required
            value={periodMonth}
            onChange={(val) => setPeriodMonth(val || new Date().toISOString().substring(0, 7))}
          />

          <ModernSelect
            label={t('employees.branch', 'Branch / Store')}
            value={branchId}
            onChange={(val) => setBranchId(String(val || ''))}
            options={branchOptions}
            placeholder={t('employees.all_branches', 'All Branches')}
          />
        </div>

        {/* Calculation Result Summary (if generated) */}
        {resultSummary && (
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 dark:border-emerald-800/40 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>
                  {t('employees.payroll_calculated_for', 'Payroll calculated successfully for {{month}}', {
                    month: resultSummary.period_month,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleTriggerAbaExport}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Landmark size={13} />
                <span>{t('employees.export_aba_bulk', 'Export ABA Bulk CSV')}</span>
              </button>
            </div>

            {/* KPI Result Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border/80">
                <p className="text-muted-foreground text-[11px] font-medium truncate">
                  {t('employees.employees_processed', 'Processed Staff')}
                </p>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  {resultSummary.generated_count}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80">
                <p className="text-muted-foreground text-[11px] font-medium truncate">
                  {t('employees.total_gross_salary', 'Total Gross Salary')}
                </p>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  ${Number(resultSummary.total_gross || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80">
                <p className="text-muted-foreground text-[11px] font-medium truncate">
                  {t('employees.pos_commission', 'POS Sales Commission')}
                </p>
                <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  ${Number(resultSummary.total_commission || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80">
                <p className="text-muted-foreground text-[11px] font-medium truncate">
                  {t('employees.nssf_contributions', 'NSSF Contributions')}
                </p>
                <p className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                  ${Number(resultSummary.total_nssf || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/80">
                <p className="text-muted-foreground text-[11px] font-medium truncate">
                  {t('employees.salary_tax_deductions', 'Salary Tax Deductions')}
                </p>
                <p className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                  ${Number(resultSummary.total_tax || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-primary text-[11px] font-semibold truncate">
                  {t('employees.total_net_payout', 'Net Payout Total')}
                </p>
                <p className="text-base font-bold font-mono text-primary mt-0.5">
                  ${Number(resultSummary.total_net || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            {resultSummary.items && resultSummary.items.length > 0 && (
              <div className="border border-emerald-500/20 dark:border-emerald-800/40 rounded-2xl overflow-hidden bg-card">
                <div
                  className="px-3.5 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setShowItemizedTable(!showItemizedTable)}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Users size={14} className="text-primary" />
                    <span>{t('employees.preview_calculated_staff', 'Calculated Staff List')}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({resultSummary.items.length} {t('employees.staffMembers', 'Staff')})
                    </span>
                  </div>
                  <button type="button" className="text-muted-foreground hover:text-foreground">
                    {showItemizedTable ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {showItemizedTable && (
                  <div className="max-h-56 overflow-y-auto divide-y divide-border text-xs">
                    {resultSummary.items.map((item: any) => (
                      <div
                        key={item.id || item.employee_id}
                        className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground truncate">
                              {item.employee_name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                              {item.employee_number}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {item.department} • {item.position}
                          </div>
                        </div>

                        {/* Breakdown pills */}
                        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
                          {item.sales_commission > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              +${item.sales_commission} Com
                            </span>
                          )}
                          {item.overtime_pay > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              +${item.overtime_pay} OT
                            </span>
                          )}
                        </div>

                        {/* Net Salary & Bank status */}
                        <div className="text-right shrink-0">
                          <div className="font-bold text-foreground font-mono">
                            ${Number(item.net_salary || 0).toFixed(2)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            {item.has_bank_account ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                                ABA: {item.bank_account_number}
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {t('employees.missing_bank_account', 'No ABA Account')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </EnterpriseModal>
  )
}

export default AutoGeneratePayrollModal
