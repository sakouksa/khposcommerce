import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatters'
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint'

interface ExpenseVoucherPrintModalProps {
  expense: any | null
  isOpen: boolean
  onClose: () => void
}

export const ExpenseVoucherPrintModal: React.FC<ExpenseVoucherPrintModalProps> = ({
  expense,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const { user: authUser } = useAuthStore()
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  if (!isOpen || !expense) return null

  const referenceNo = expense.reference_number || `EXP-${String(expense.id).padStart(5, '0')}`
  const amount = Number(expense.amount || 0)
  const amountKhr = Math.round(amount * 4100)
  const categoryName = expense.category?.name || expense.category_name || t('finance.all_categories', 'General Expense')
  const branchName = expense.branch?.name || authUser?.branch?.name || t('finance.main_branch', 'Headquarters (HQ Main Branch)')

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={t('finance.voucher_preview', 'Official Expense Voucher')}
      documentSubtitle={`${referenceNo} • ${t('finance.voucher_badge', 'Official Voucher')}`}
      layout="drawer"
    >
      {/* 1. Global Standard Dynamic Header */}
      <GlobalPrintHeader
        title={t('finance.voucher_title', 'Operational Expense Voucher')}
        subtitleEnglish={t('finance.voucher_subtitle', 'OFFICIAL EXPENSE PAYMENT VOUCHER')}
        documentTypeLabel={t('finance.voucher_badge', 'Official Voucher')}
        referenceNumber={referenceNo}
        referenceLabel={t('finance.voucher_no', 'Voucher #')}
        date={expense.date}
        status={expense.status || 'approved'}
        branchName={branchName}
      />

      {/* 2. Modern Enterprise Voucher Table */}
      <div className="space-y-4 pt-1">
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">#</th>
                <th className="py-2.5 px-4 text-left border-r border-slate-200">{t('finance.title_col', 'Description / Title')}</th>
                <th className="py-2.5 px-4 text-left border-r border-slate-200 w-44">{t('finance.category_col', 'Category')}</th>
                <th className="py-2.5 px-4 text-right w-40">{t('finance.amount_col', 'Amount ($)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              <tr className="bg-white">
                <td className="py-3 px-3 text-center font-bold border-r border-slate-200/80 text-slate-500">1</td>
                <td className="py-3 px-4 border-r border-slate-200/80">
                  <div className="font-bold text-slate-900 text-sm">
                    {expense.title || `Expense #${expense.id}`}
                  </div>
                  <div className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">
                    {expense.description || 'Regular business operational expense outlay recorded into the corporate general ledger.'}
                  </div>
                </td>
                <td className="py-3 px-4 border-r border-slate-200/80">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-xs border border-slate-200/60">
                    {categoryName}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-sm text-slate-900">
                  {formatCurrency(amount, { locale: currentLocale })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-slate-600 text-xs border-r border-slate-200">
                  {t('finance.total_usd', 'Total USD')}:
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-base font-black text-slate-950">
                  {formatCurrency(amount, { locale: currentLocale })}
                </td>
              </tr>
              <tr className="bg-white font-bold border-t border-slate-200/70">
                <td colSpan={3} className="py-2 px-4 text-right uppercase text-slate-500 text-[11px] border-r border-slate-200">
                  {t('finance.equivalent_khr', 'Equivalent KHR (@ 4,100)')}:
                </td>
                <td className="py-2 px-4 text-right font-mono text-xs font-bold text-slate-700">
                  ៛ {amountKhr.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Method & Disbursement Status Card */}
        <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs shadow-2xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase text-[9.5px] tracking-wider block">
              {t('finance.payment_method', 'Payment Method')}:
            </span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">
              {expense.payment_method?.name || 'Cash / Corporate Account'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase text-[9.5px] tracking-wider block">
              {t('finance.approval_disbursement', 'Approval & Disbursement')}:
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-xs uppercase text-emerald-700 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                {expense.status === 'pending'
                  ? t('finance.status_pending', 'Pending Approval')
                  : expense.status === 'rejected'
                  ? t('finance.status_rejected', 'Rejected')
                  : t('finance.status_approved', 'Approved & Disbursed')}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Global Standard Triple Signatures Footer */}
      <GlobalPrintFooter
        signatures={[
          {
            titleLocalized: t('finance.prepared_by', 'Prepared By'),
            name: expense.created_by_user?.name || 'Staff Member',
            role: t('finance.applicant_role', 'Applicant / Staff'),
          },
          {
            titleLocalized: t('finance.verified_by', 'Verified By'),
            name: authUser?.name || 'Super Admin',
            role: t('finance.accountant_role', 'Finance Officer / Cashier'),
          },
          {
            titleLocalized: t('finance.authorized_by', 'Authorized By'),
            name: 'Finance Director',
            role: t('finance.manager_role', 'Managing Director / Approver'),
          },
        ]}
      />
    </GlobalPrintContainer>
  )
}

export default ExpenseVoucherPrintModal
