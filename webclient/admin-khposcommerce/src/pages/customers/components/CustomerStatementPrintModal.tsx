import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/utils/formatters'
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint'
import type { Customer } from '../types/customer.types'

interface CustomerStatementPrintModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
}

export const CustomerStatementPrintModal: React.FC<CustomerStatementPrintModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation(['customers', 'finance', 'common'])
  const { user: authUser } = useAuthStore()
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  if (!isOpen || !customer) return null

  const referenceNo = `SOA-${String(customer.id).padStart(5, '0')}`
  const branchName = authUser?.branch?.name || t('finance.main_branch', 'Headquarters (HQ Main Branch)')

  const sales = customer.sales || []
  const outstanding = Number(customer.outstanding_balance || 0)
  const creditLimit = Number(customer.credit_limit || 0)
  const wallet = Number(customer.wallet_balance || 0)
  const points = Number(customer.loyalty_points || 0)
  const outstandingKhr = Math.round(outstanding * 4100)

  // Primary address
  const defaultAddr = customer.addresses?.find((a) => a.is_default) || customer.addresses?.[0]
  const fullAddress = defaultAddr
    ? `${defaultAddr.address || ''}, ${defaultAddr.city || ''}, ${defaultAddr.province || ''}`.replace(/^,\s*|,\s*$/g, '')
    : '—'

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={t('customers.statementTitle', 'Customer Statement of Account')}
      documentSubtitle={`${referenceNo} • ${customer.name}`}
      layout="modal"
      width="max-w-4xl"
    >
      {/* 1. Global Standard Dynamic Header */}
      <GlobalPrintHeader
        title={t('customers.statementTitle', 'Customer Statement of Account')}
        subtitleEnglish="OFFICIAL STATEMENT OF ACCOUNT (SOA)"
        documentTypeLabel={t('customers.soaBadge', 'Statement of Account')}
        referenceNumber={referenceNo}
        referenceLabel={t('customers.soaNo', 'SOA #')}
        date={new Date()}
        status={customer.is_credit_hold ? 'hold' : customer.is_active ? 'active' : 'inactive'}
        branchName={branchName}
      />

      {/* 2. Customer Profile & Credit Terms Grid */}
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Customer Information Card */}
          <div className="p-3.5 rounded-xl border border-slate-300 bg-white text-xs space-y-1.5 shadow-none">
            <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>{t('customers.infoTitle', 'Customer Information')}</span>
              <span className="font-mono text-slate-500 text-[10px]">CUST-#{customer.id}</span>
            </h4>
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.name', 'Full Name')}:</span>
                <span className="font-bold text-slate-900">{customer.name}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.phone', 'Phone Number')}:</span>
                <span className="font-mono font-semibold text-slate-800">{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.email', 'Email Address')}:</span>
                <span className="font-mono text-slate-700 truncate max-w-[180px]">{customer.email || 'N/A'}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.tax_number', 'Tax Number (TIN)')}:</span>
                <span className="font-mono font-bold text-slate-900">{customer.tax_number || 'N/A'}</span>
              </div>
              {defaultAddr && (
                <div className="flex items-baseline justify-between gap-2 border-t border-slate-200 pt-1">
                  <span className="text-slate-500 font-medium">{t('customers.address', 'Address')}:</span>
                  <span className="text-slate-700 text-[11px] text-right truncate max-w-[200px]">{fullAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Credit & Terms Card */}
          <div className="p-3.5 rounded-xl border border-slate-300 bg-white text-xs space-y-1.5 shadow-none">
            <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>{t('customers.billingTerms', 'Credit & Billing Terms')}</span>
              <span className="font-mono font-bold text-slate-900 text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {customer.payment_terms ? customer.payment_terms.replace('_', ' ') : 'Prepaid'}
              </span>
            </h4>
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.group', 'Customer Group')}:</span>
                <span className="font-bold text-slate-900">{customer.group?.name || t('customers.regular', 'General / Standard')}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.creditStatus', 'Credit Status')}:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                  {customer.is_credit_hold ? t('customers.creditHold', 'Credit Hold') : t('customers.active', 'Active & Good Standing')}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.rfmSegment', 'RFM Segment')}:</span>
                <span className="font-semibold text-slate-800 uppercase text-[11px]">{customer.rfm_segment || 'Champions'}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-slate-500 font-medium">{t('customers.totalOrders', 'Total Invoices / Orders')}:</span>
                <span className="font-mono font-bold text-slate-900">{sales.length || customer.order_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Clean 4-Box Summary KPI Cards (Minimalist & High-Contrast) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl border border-slate-300 bg-white text-center shadow-none">
            <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider block">
              {t('customers.creditLimit', 'Credit Limit')}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-950 mt-1 block">
              {formatCurrency(creditLimit, { locale: currentLocale })}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-300 bg-white text-center shadow-none">
            <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider block">
              {t('customers.outstandingDebt', 'Outstanding Debt')}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-950 mt-1 block">
              {formatCurrency(outstanding, { locale: currentLocale })}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-300 bg-white text-center shadow-none">
            <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider block">
              {t('customers.walletBalance', 'Store Wallet')}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-950 mt-1 block">
              {formatCurrency(wallet, { locale: currentLocale })}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-300 bg-white text-center shadow-none">
            <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider block">
              {t('customers.loyaltyPoints', 'Loyalty Points')}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-950 mt-1 block">
              {points.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* 4. Invoicing & Sales Ledger Table (Clean Standard) */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider">
            {t('customers.salesLedgerTitle', 'Order & Invoicing History (ប្រវត្តិវិក្កយបត្រ)')}
          </h4>
          <div className="rounded-xl border border-slate-300 overflow-hidden shadow-none">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300">#</th>
                  <th className="py-2.5 px-4 text-left border-r border-slate-300">{t('customers.invoiceNo', 'Invoice / Ref #')}</th>
                  <th className="py-2.5 px-4 text-left border-r border-slate-300">{t('common.date', 'Date')}</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">{t('common.status', 'Payment Status')}</th>
                  <th className="py-2.5 px-4 text-right w-36">{t('common.amount', 'Amount ($)')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sales.length === 0 ? (
                  <tr className="bg-white">
                    <td colSpan={5} className="py-6 px-4 text-center text-slate-500 italic text-xs">
                      {t('customers.noRecentInvoices', 'គ្មានប្រវត្តិវិក្កយបត្រថ្មីៗឡើយ (No recent sales records)')}
                    </td>
                  </tr>
                ) : (
                  sales.map((s: any, idx: number) => {
                    const invNo = s.invoice_no || s.reference_no || `INV-${s.id}`
                    const amountVal = Number(s.total_amount || s.grand_total || 0)
                    const statusStr = (s.payment_status || 'paid').toLowerCase()

                    return (
                      <tr key={s.id || idx} className="bg-white">
                        <td className="py-2.5 px-3 text-center font-mono font-semibold border-r border-slate-200 text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {invNo}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 border-r border-slate-200">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString(currentLocale) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-slate-50 text-slate-800 border border-slate-300">
                            {statusStr}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(amountVal, { locale: currentLocale })}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-bold border-t border-slate-300">
                  <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-slate-700 text-xs border-r border-slate-300">
                    {t('customers.currentOutstanding', 'Current Outstanding Debt')}:
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm font-black text-slate-950">
                    {formatCurrency(outstanding, { locale: currentLocale })}
                  </td>
                </tr>
                <tr className="bg-white font-bold border-t border-slate-200">
                  <td colSpan={4} className="py-2 px-4 text-right uppercase text-slate-500 text-[10.5px] border-r border-slate-200">
                    {t('finance.equivalent_khr', 'Equivalent KHR (@ 4,100)')}:
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-xs font-bold text-slate-800">
                    ៛ {outstandingKhr.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Global Standard Triple Signatures Footer */}
      <GlobalPrintFooter
        signatures={[
          {
            titleLocalized: t('customers.preparedBy', 'Prepared By'),
            name: authUser?.name || 'Staff Member',
            role: t('customers.accountOfficerRole', 'Account Officer / Staff'),
          },
          {
            titleLocalized: t('customers.verifiedBy', 'Verified By'),
            name: 'Finance Controller',
            role: t('customers.financeRole', 'Credit & Finance Manager'),
          },
          {
            titleLocalized: t('customers.customerAcceptedBy', 'Customer Acceptance'),
            name: customer.name,
            role: t('customers.authorizedClientRole', 'Authorized Customer / Signatory'),
          },
        ]}
      />
    </GlobalPrintContainer>
  )
}

export default CustomerStatementPrintModal
