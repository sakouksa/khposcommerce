import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  CreditCard,
  Search,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Users,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { EnterpriseModal, LoadingSpinner } from '@/components/common'

interface AbaBulkExportModalProps {
  isOpen: boolean
  onClose: () => void
  initialMonth?: string
}

export const AbaBulkExportModal: React.FC<AbaBulkExportModalProps> = ({
  isOpen,
  onClose,
  initialMonth,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  const [periodMonth, setPeriodMonth] = useState<string>(
    initialMonth || new Date().toISOString().substring(0, 7)
  )
  const [debitAccount, setDebitAccount] = useState<string>('000123456')
  const [excludeMissing, setExcludeMissing] = useState<boolean>(true)
  const [markPaid, setMarkPaid] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'missing'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Query ABA Preview
  const {
    data: previewData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['aba-bulk-preview', periodMonth, debitAccount],
    queryFn: () => employeeService.getAbaPreview({ period_month: periodMonth, debit_account: debitAccount }),
    enabled: isOpen && !!periodMonth,
  })

  const items = previewData?.items || []

  // Filtered employees list
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      // Status filter
      if (activeFilter === 'ready' && !item.is_valid_aba) return false
      if (activeFilter === 'missing' && item.is_valid_aba) return false

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.employee_name?.toLowerCase().includes(q)
        const matchCode = item.employee_number?.toLowerCase().includes(q)
        const matchDept = item.department?.toLowerCase().includes(q)
        const matchAcc = item.bank_account_number?.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchDept && !matchAcc) return false
      }
      return true
    })
  }, [items, activeFilter, searchQuery])

  const handleExport = async () => {
    if (!previewData || previewData.total_count === 0) {
      toast.error(t('employees.no_payrolls_for_month', 'No payroll records found for this month.'))
      return
    }

    if (previewData.ready_count === 0 && excludeMissing) {
      toast.error(t('employees.no_valid_aba_accounts', 'No employees with valid ABA accounts to export.'))
      return
    }

    setIsExporting(true)
    const toastId = toast.loading(t('employees.exportAbaGenerating', 'Generating ABA Bank Bulk Payment CSV...'))
    try {
      await employeeService.exportAbaBulkCsv({
        period_month: periodMonth,
        debit_account: debitAccount,
        exclude_missing: excludeMissing,
        mark_paid: markPaid,
      })
      toast.dismiss(toastId)
      toast.success(t('employees.exportAbaSuccess', 'ABA Bulk Payroll CSV downloaded successfully!'))
      qc.invalidateQueries({ queryKey: ['payrolls'] })
      qc.invalidateQueries({ queryKey: ['aba-bulk-preview'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      onClose()
    } catch {
      toast.dismiss(toastId)
      toast.error(t('employees.exportAbaError', 'Failed to export ABA Bulk CSV'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('employees.aba_bulk_title', 'ABA Bulk Transfer Export')}
      subtitle={t('employees.aba_bulk_subtitle', 'Validate bank accounts and export CSV formatted for ABA Corporate iBanking')}
      icon={<Landmark size={20} />}
      iconVariant="emerald"
      size="2xl"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Filter Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <span>{t('employees.select_payroll_month', 'Payroll Month')}</span>
            </label>
            <input
              type="month"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-500" />
              <span>{t('employees.company_debit_account', 'Company Debit Account')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                placeholder="000123456"
                className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background font-mono"
              />
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                title="Refresh preview"
                className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="md" />
            <p className="text-xs text-muted-foreground">{t('common.loading', 'Verifying employee accounts...')}</p>
          </div>
        ) : !previewData || previewData.total_count === 0 ? (
          /* Empty Payroll Alert */
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">{t('employees.no_payrolls_for_month', 'No payroll records found for this month')}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('employees.no_payrolls_month_desc', 'Please run "Auto-Generate Monthly Payroll" first to calculate salaries, NSSF, and tax for this period.')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Readiness Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Payroll */}
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                  <span>{t('employees.total_processed', 'Total Payroll')}</span>
                  <Users size={15} />
                </div>
                <div className="text-xl font-bold text-foreground">
                  ${Number(previewData.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {previewData.total_count} {t('employees.employees', 'Employees')}
                </div>
              </div>

              {/* Ready for ABA Transfer */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-2xs">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
                  <span>{t('employees.ready_for_transfer', 'Ready for ABA Transfer')}</span>
                  <CheckCircle2 size={15} />
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  ${Number(previewData.ready_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5 font-medium">
                  {previewData.ready_count} {t('employees.valid_accounts', 'Valid Accounts')}
                </div>
              </div>

              {/* Missing or Invalid Account */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-2xs">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
                  <span>{t('employees.missing_or_invalid', 'Missing / Invalid')}</span>
                  <AlertTriangle size={15} />
                </div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                  ${Number(previewData.missing_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5 font-medium">
                  {previewData.missing_count} {t('employees.requires_cash_or_update', 'Needs Bank Update')}
                </div>
              </div>
            </div>

            {/* Account Verification Table Section */}
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              {/* Table Toolbar */}
              <div className="p-3 bg-muted/30 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-background text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('employees.all', 'All')} ({previewData.total_count})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('ready')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeFilter === 'ready'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>{t('employees.ready', 'Ready')} ({previewData.ready_count})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('missing')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeFilter === 'missing'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    <span>{t('employees.missing', 'Missing')} ({previewData.missing_count})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('employees.search_staff', 'Search employee or account...')}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="max-h-60 overflow-y-auto divide-y divide-border">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    {t('common.no_records_found', 'No employees match the selected filter.')}
                  </div>
                ) : (
                  filteredItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/20 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">{item.employee_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {item.employee_number}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.department} • {item.position}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-foreground">
                          ${Number(item.net_salary).toFixed(2)}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {item.is_valid_aba ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                              <Check size={10} />
                              {item.bank_account_number}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                              <X size={10} />
                              {t('employees.missing_bank_account', 'No ABA Account')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Export Settings Options */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-muted/20 border border-border text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeMissing}
                  onChange={(e) => setExcludeMissing(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-foreground">
                    {t('employees.exclude_missing_desc', 'Exclude employees without ABA accounts from CSV')}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {t('employees.exclude_missing_help', 'Recommended. Prevents the entire bulk batch from being rejected by ABA Corporate iBanking.')}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markPaid}
                  onChange={(e) => setMarkPaid(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-foreground">
                    {t('employees.mark_as_paid_desc', "Automatically mark exported payroll records as 'Paid' upon export")}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {t('employees.mark_as_paid_help', 'Sets status to paid and records paid_at date for audit tracking.')}
                  </p>
                </div>
              </label>
            </div>

            {/* 3-Step Guide to Upload to ABA */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-950 dark:text-blue-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[12px] text-blue-800 dark:text-blue-300">
                <HelpCircle size={14} />
                <span>{t('employees.how_to_upload_aba', 'How to Upload to ABA Business Portal')}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-700 dark:text-blue-300">
                <li>{t('employees.step_1_aba', 'Log in to ABA Business iBanking > Payments > Bulk Transfer')}</li>
                <li>{t('employees.step_2_aba', "Choose 'Upload CSV' and select this downloaded file")}</li>
                <li>{t('employees.step_3_aba', 'Verify employee names and totals, then click Approve')}</li>
              </ol>
            </div>
          </>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || isLoading || !previewData || previewData.total_count === 0}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            <span>
              {isExporting
                ? t('common.exporting', 'Exporting...')
                : t('employees.download_csv_btn', 'Download ABA Bulk CSV')}
            </span>
          </button>
        </div>
      </div>
    </EnterpriseModal>
  )
}

export default AbaBulkExportModal
