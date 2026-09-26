import React from 'react'
import { Shield, Search, Monitor, CheckCircle, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Pagination from '@/components/shared/Pagination'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

interface LoginHistoryTableProps {
  histories: any[]
  pagination: {
    current_page: number
    last_page: number
    total: number
  }
  page: number
  setPage: (page: number) => void
  perPage: number
  setPerPage: (perPage: number) => void
  search: string
  setSearch: (search: string) => void
  isFetching: boolean
}

export const LoginHistoryTable: React.FC<LoginHistoryTableProps> = ({
  histories,
  pagination,
  page,
  setPage,
  perPage,
  setPerPage,
  search,
  setSearch,
  isFetching,
}) => {
  const { t } = useTranslation('profile')
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2.5">
            <Shield size={18} className="text-primary" />
            <span>{t('logins_tab.title', 'Session Login History')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('logins_tab.subtitle', 'A comprehensive list of authentication attempts on your account.')}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('logins_tab.search_placeholder', 'Search logins...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-muted/40 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-x-auto border border-border/80 rounded-2xl shadow-2xs">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border/80">
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('logins_tab.th_device', 'Device')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('logins_tab.th_browser', 'Browser')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('logins_tab.th_ip', 'IP Address')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('logins_tab.th_time', 'Login Time')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('logins_tab.th_status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isFetching && histories.length === 0 ? (
                <LoadingSkeleton cols={5} rows={perPage} />
              ) : histories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                    {t('logins_tab.no_logins', 'No login histories found.')}
                  </td>
                </tr>
              ) : (
                histories.map((h) => {
                  const dateStr = new Date(h.created_at).toLocaleString()
                  return (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground capitalize">
                        <div className="flex items-center gap-2">
                          <Monitor size={14} className="text-primary" />
                          <span>{h.device || 'Desktop'} ({h.platform || 'Web'})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground font-semibold">{h.browser || 'Chrome'}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{h.ip_address}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{dateStr}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                          h.success 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {h.success ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          <span>{h.success ? t('logins_tab.status_success', 'Success') : t('logins_tab.status_failed', 'Failed')}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={page}
          lastPage={pagination.last_page || 1}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}

export default LoginHistoryTable
