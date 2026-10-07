import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { getAbsoluteImageUrl } from '@/utils/image'

export interface PaymentMethodsGatewaysTableProps {
  methods?: any[]
  isLoading?: boolean
  isFetching?: boolean
  visibleColumns?: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
  toggleStatus?: (row: any) => void
}

/**
 * Resolves brand monogram and subtle background colors dynamically.
 */
const getBrandMonogram = (method: any) => {
  const code = (method?.code || '').toLowerCase()
  const name = (method?.name || '').toLowerCase()
  const type = (method?.type || '').toLowerCase()

  if (code.includes('aba') || name.includes('aba')) {
    return {
      text: 'ABA',
      colorClass: 'bg-[#005e85]/10 text-[#005e85] dark:text-[#38bdf8] border-[#005e85]/20',
    }
  }

  if (code.includes('bakong') || name.includes('bakong')) {
    return {
      text: 'KHQR',
      colorClass: 'bg-[#e02020]/10 text-[#c92a2a] dark:text-[#ff6b6b] border-[#e02020]/20',
    }
  }

  if (code.includes('acleda') || name.includes('acleda')) {
    return {
      text: 'ACL',
      colorClass: 'bg-[#183884]/10 text-[#183884] dark:text-[#60a5fa] border-[#183884]/20',
    }
  }

  if (code.includes('wing') || name.includes('wing')) {
    return {
      text: 'WING',
      colorClass: 'bg-[#70b000]/10 text-[#538700] dark:text-[#a9e34b] border-[#70b000]/20',
    }
  }

  if (code.includes('canadia') || name.includes('canadia')) {
    return {
      text: 'CNB',
      colorClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    }
  }

  if (code.includes('sathapana') || name.includes('sathapana')) {
    return {
      text: 'SPN',
      colorClass: 'bg-[#0a4d8c]/10 text-[#0a4d8c] dark:text-[#74c0fc] border-[#0a4d8c]/20',
    }
  }

  if (code.includes('truemoney') || name.includes('truemoney')) {
    return {
      text: 'TRUE',
      colorClass: 'bg-[#f76707]/10 text-[#f76707] dark:text-[#ffa94d] border-[#f76707]/20',
    }
  }

  if (code.includes('card') || code.includes('visa') || code.includes('master') || type.includes('card')) {
    return {
      text: 'CARD',
      colorClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    }
  }

  if (code.includes('cash') || code.includes('cod') || type.includes('cash')) {
    return {
      text: 'CASH',
      colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    }
  }

  // Dynamic initials fallback for any custom payment method
  const words = (method?.name || 'PM').trim().split(/\s+/)
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (method?.name || 'PM').slice(0, 3).toUpperCase()

  return {
    text: initials,
    colorClass: 'bg-muted text-muted-foreground border-border',
  }
}

/**
 * Dynamically renders logo image if available, falling back to clean brand monogram/initials.
 */
const PaymentMethodLogo: React.FC<{ method: any }> = ({ method }) => {
  const [imgError, setImgError] = useState(false)
  const brand = getBrandMonogram(method)
  const logoUrl = method.logo ? getAbsoluteImageUrl(method.logo) : ''

  if (logoUrl && !imgError) {
    return (
      <div className="w-9 h-9 rounded-lg border border-border/60 bg-white dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 shadow-xs">
        <img
          src={logoUrl}
          alt={method.name || 'PM'}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 font-bold font-mono text-[11px] tracking-tight ${brand.colorClass}`}
    >
      {brand.text}
    </div>
  )
}

export const PaymentMethodsGatewaysTable: React.FC<PaymentMethodsGatewaysTableProps> = ({
  methods = [],
  isLoading = false,
  isFetching = false,
  visibleColumns = {
    pm_name: true,
    pm_code: true,
    pm_type: true,
    pm_fee: true,
    pm_channels: true,
    pm_status: true,
  },
  openEditDrawer,
  handleDelete,
  toggleStatus,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const formatType = (type?: string) => {
    if (!type) return t('finance.pm_type_cash', 'Cash')
    const key = `finance.pm_type_${type.toLowerCase()}`
    const translated = t(key, '')
    if (translated && translated !== key) return translated
    return type.replace(/_/g, ' ')
  }

  const formatFee = (method: any) => {
    const percent = Number(method.fee_percent || 0)
    const fixed = Number(method.fee_fixed || 0)
    if (percent === 0 && fixed === 0) {
      return (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {t('finance.fee_free', 'Free')}
        </span>
      )
    }
    const parts = []
    if (percent > 0) parts.push(`${percent}%`)
    if (fixed > 0) parts.push(`$${fixed.toFixed(2)}`)
    return <span className="text-xs font-semibold font-mono text-foreground">{parts.join(' + ')}</span>
  }

  return (
    <TableWrapper isFetching={isFetching} className="print:hidden">
      <table className="w-full data-table border-collapse">
        <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
          <tr>
            {visibleColumns.pm_name && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.method_name', 'Method Name')}
              </th>
            )}
            {visibleColumns.pm_code && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.code_col', 'Code')}
              </th>
            )}
            {visibleColumns.pm_type && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.type_col', 'Type')}
              </th>
            )}
            {visibleColumns.pm_fee && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.fee_col', 'Fee')}
              </th>
            )}
            {visibleColumns.pm_channels && (
              <th className="text-center px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.channels_col', 'Channels')}
              </th>
            )}
            {visibleColumns.pm_status && (
              <th className="text-center px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.status_col', 'Status')}
              </th>
            )}
            <th className="text-right px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
              {t('finance.actions_col', t('common.actions', 'Actions'))}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <LoadingSkeleton cols={7} />
          ) : methods.length === 0 ? (
            <EmptyState cols={7} message={t('finance.no_data_payment_methods', 'No payment methods found.')} />
          ) : (
            methods.map((method: any) => {
              return (
                <tr key={method.id} className="hover:bg-muted/40 transition-colors">
                  {/* Method Name & Logo / Monogram */}
                  {visibleColumns.pm_name && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PaymentMethodLogo method={method} />
                        <div className="flex flex-col min-w-0">
                          <span
                            onClick={() => openEditDrawer?.(method)}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {method.name}
                          </span>
                          {method.description && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {method.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Code */}
                  {visibleColumns.pm_code && (
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-medium">
                      {method.code}
                    </td>
                  )}

                  {/* Type */}
                  {visibleColumns.pm_type && (
                    <td className="px-4 py-3 text-xs font-medium capitalize text-muted-foreground">
                      {formatType(method.type)}
                    </td>
                  )}

                  {/* Fee */}
                  {visibleColumns.pm_fee && (
                    <td className="px-4 py-3">{formatFee(method)}</td>
                  )}

                  {/* Channels */}
                  {visibleColumns.pm_channels && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {method.available_pos && (
                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {t('finance.channel_pos', 'POS')}
                          </span>
                        )}
                        {method.available_online && (
                          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {t('finance.channel_online', 'Online')}
                          </span>
                        )}
                        {!method.available_pos && !method.available_online && (
                          <span className="text-xs text-muted-foreground">
                            {t('finance.channel_none', '-')}
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.pm_status && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus?.(method)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                            method.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              method.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{method.is_active ? t('finance.active', 'Active') : t('finance.inactive', 'Inactive')}</span>
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <TableActionMenu
                      onEdit={openEditDrawer ? () => openEditDrawer(method) : undefined}
                      onDelete={handleDelete ? () => handleDelete(method.id, method.name) : undefined}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </TableWrapper>
  )
}

export { PaymentMethodsGatewaysTable as PaymentMethodsTable, PaymentMethodsGatewaysTable as PaymentMethodsTab }
export default PaymentMethodsGatewaysTable
