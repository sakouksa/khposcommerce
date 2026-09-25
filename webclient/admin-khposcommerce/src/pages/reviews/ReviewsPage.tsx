import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Trash2, RefreshCw, Star, CheckCircle, XCircle, MessageSquare, Loader2, Filter } from 'lucide-react'
import { reviewService } from '@/services/reviewService'
import { useToast } from '@/hooks/useToast'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import StatusBadge from '@/components/common/StatusBadge'
import { TableToolbar } from '@/components/common'
import { useTranslation } from 'react-i18next'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface Review {
  id: number
  rating: number
  title?: string
  comment?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user?: { name: string; email: string }
  product?: { name: string }
}

const ReviewsPage: React.FC = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const qc = useQueryClient()
    const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'reviews' })
    const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reviews', page, debouncedSearch, perPage, statusFilter, ratingFilter],
    queryFn: () => reviewService.getReviews({
      page,
      search,
      status: statusFilter || undefined,
      rating: ratingFilter || undefined,
      per_page: 15,
    }),
    placeholderData: (prev) => prev,
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => reviewService.approveReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review approved successfully.')
    },
    onError: () => {
      toast.error(t('toast.error'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => reviewService.rejectReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review rejected successfully.')
    },
    onError: () => {
      toast.error(t('toast.error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success(t('toast.deleted', { item: t('nav.reviews') }))
      setDeleteTarget(null)
      adjustAfterDelete(reviews.length)
    },
    onError: () => {
      toast.error(t('toast.error'))
      setDeleteTarget(null)
    },
  })

  const reviews: Review[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setRatingFilter('')
    setPage(1)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < rating ? 'fill-current' : 'text-muted-foreground/30'} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">{t('nav.reviews')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('common.showing', { from: pagination.from || 0, to: pagination.to || 0, total: pagination.total })}
          </p>
        </div>
      </div>

      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1) }}
        searchPlaceholder={t('reviews.searchPlaceholder', 'Search reviews, products, users...')}
        onReset={resetFilters}
        leftActions={
          <>
            <ModernSelect
              value={statusFilter}
              onChange={(val) => { setStatusFilter(String(val)); setPage(1) }}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              placeholder="All Status"
            />
            <ModernSelect
              value={ratingFilter}
              onChange={(val) => { setRatingFilter(String(val)); setPage(1) }}
              options={[
                { value: '', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
              ]}
              placeholder="All Ratings"
            />
          </>
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['reviews'] })}
        refreshLoading={isFetching}
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">{t('reviews.reviewer')}</th>
                <th className="text-left">{t('reviews.product')}</th>
                <th className="text-left">{t('reviews.rating')}</th>
                <th className="text-left">{t('reviews.comment')}</th>
                <th className="text-left">{t('common.status')}</th>
                <th className="text-left">Date</th>
                <th className="text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton h-4 w-28 rounded" /></td>
                    <td><div className="skeleton h-4 w-28 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-48 rounded" /></td>
                    <td><div className="skeleton h-4 w-12 rounded" /></td>
                    <td><div className="skeleton h-4 w-20 rounded" /></td>
                    <td><div className="skeleton h-4 w-24 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <p className="font-medium text-foreground">{review.user?.name ?? 'Guest User'}</p>
                      <p className="text-xs text-muted-foreground">{review.user?.email}</p>
                    </td>
                    <td className="text-sm font-medium text-foreground">{review.product?.name ?? '-'}</td>
                    <td>{renderStars(review.rating)}</td>
                    <td>
                      {review.title && <p className="font-semibold text-xs mb-0.5 text-foreground">{review.title}</p>}
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{review.comment || 'No comment'}</p>
                    </td>
                    <td>
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        variant="hybrid"
                        maxInline={2}
                        onDelete={() => setDeleteTarget(review)}
                        items={[
                          ...(review.status === 'pending'
                            ? [
                                {
                                  label: t('reviews.approve', 'Approve'),
                                  icon: CheckCircle,
                                  onClick: () => approveMutation.mutate(review.id),
                                  variant: 'success' as const,
                                  disabled: approveMutation.isPending,
                                },
                                {
                                  label: t('reviews.reject', 'Reject'),
                                  icon: XCircle,
                                  onClick: () => rejectMutation.mutate(review.id),
                                  variant: 'warning' as const,
                                  disabled: rejectMutation.isPending,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <MessageSquare size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t('common.noData')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </TableWrapper>
        <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('confirm.deleteTitle', { item: 'Review' })}
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={t('confirm.confirmDelete')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ReviewsPage
