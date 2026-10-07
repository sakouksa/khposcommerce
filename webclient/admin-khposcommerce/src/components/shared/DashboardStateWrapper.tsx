import React from 'react'
import { WifiOff, Inbox, ShieldAlert } from 'lucide-react'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { useTranslation } from 'react-i18next'

interface DashboardStateWrapperProps {
  isLoading?: boolean
  isError?: boolean
  error?: any
  isEmpty?: boolean
  hasPermission?: boolean
  onRetry?: () => void
  children: React.ReactNode
  loadingHeight?: string
  emptyMessage?: string
}

const DashboardStateWrapper: React.FC<DashboardStateWrapperProps> = ({
  isLoading = false,
  isError = false,
  error,
  isEmpty = false,
  hasPermission = true,
  onRetry,
  children,
  loadingHeight = 'h-48',
  emptyMessage,
}) => {
  const { t } = useTranslation()

  // 1. Permission Check
  if (!hasPermission) {
    return (
      <div className={`w-full ${loadingHeight} flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center`}>
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3 shadow-xs">
          <ShieldAlert size={26} />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('errors.forbidden', 'Access Denied')}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {t('errors.403', 'You do not have permission to view this widget or perform this operation.')}
        </p>
      </div>
    )
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className={`w-full ${loadingHeight} animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-5 flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/50`}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-1/3" />
        <div className="space-y-2.5 my-auto">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-md w-5/6" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded-md w-2/3" />
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-1/4" />
      </div>
    )
  }

  // 3. Offline or Network Error
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  if (isOffline) {
    return (
      <div className={`w-full ${loadingHeight} flex flex-col items-center justify-center p-6 text-center`}>
        <CustomErrorMessage
          variant="card"
          severity="warning"
          code="OFFLINE"
          title={t('errors.networkErrorTitle', 'No Internet Connection')}
          message={t('errors.networkErrorDesc', 'Please check your network connection and try again.')}
          onRetry={onRetry}
          icon={<WifiOff className="w-5 h-5 text-amber-500" />}
          className="w-full max-w-md"
        />
      </div>
    )
  }

  // 4. Server Error State
  if (isError) {
    const errorMsg = error?.response?.data?.message || error?.message || t('errors.serverErrorDesc', 'Unable to load data from server.')
    const statusCode = error?.response?.status || 500
    const details = error?.response?.data?.errors || error?.response?.data

    return (
      <div className={`w-full ${loadingHeight} flex flex-col items-center justify-center p-4 text-center`}>
        <CustomErrorMessage
          variant="card"
          severity="error"
          code={statusCode}
          title={t('errors.serverErrorTitle', 'Unable to Load Data')}
          message={errorMsg}
          details={details}
          onRetry={onRetry}
          copyable={true}
          className="w-full max-w-lg"
        />
      </div>
    )
  }

  // 5. Empty State
  if (isEmpty) {
    return (
      <div className={`w-full ${loadingHeight} flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-center`}>
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2.5 shadow-2xs">
          <Inbox size={24} />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {emptyMessage || t('common.noData', 'No data available.')}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export default DashboardStateWrapper
