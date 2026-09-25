import React from 'react'
import { Activity, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Pagination from '@/components/shared/Pagination'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

interface ActivityLogTableProps {
  logs: any[]
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

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  logs,
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
            <Activity size={18} className="text-primary" />
            <span>{t('activities_tab.title', 'Security & Audit Activity Logs')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('activities_tab.subtitle', 'A history of administrative and critical operations performed by your session.')}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('activities_tab.search_placeholder', 'Search actions...')}
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
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('activities_tab.th_date', 'Date & Time')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('activities_tab.th_action', 'Action')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('activities_tab.th_module', 'Module')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('activities_tab.th_ip', 'IP Address')}</th>
                <th className="text-left py-3 px-4 font-extrabold text-[11px] text-muted-foreground uppercase tracking-wider">{t('activities_tab.th_ua', 'User Agent')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isFetching && logs.length === 0 ? (
                <LoadingSkeleton cols={5} rows={perPage} />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                    {t('activities_tab.no_logs', 'No activity logs found.')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateStr = new Date(log.created_at).toLocaleString()
                  const ip = log.properties?.ip || log.ip_address || '127.0.0.1'
                  const ua = log.properties?.user_agent || log.user_agent || 'Chrome / Mac'
                  
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{dateStr}</td>
                      <td className="py-3 px-4 font-bold text-foreground capitalize">{log.description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg font-extrabold bg-primary/10 text-primary uppercase text-[10px] tracking-wider border border-primary/20">
                          {log.log_name || log.module || 'System'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{ip}</td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-xs font-mono text-[11px]" title={ua}>
                        {ua}
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

export default ActivityLogTable
