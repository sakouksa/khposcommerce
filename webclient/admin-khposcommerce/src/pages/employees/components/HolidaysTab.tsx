import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Repeat, Loader2, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import {
  TableToolbar,
  TableActionMenu,
  StatusBadge,
  EmptyState,
  EnterpriseModal,
  ModalFooter,
  FormField,
  EnterpriseInput,
  EnterpriseTextarea,
  EnterpriseDatePicker,
  ToggleSwitch,
} from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import type { HolidayItem } from '../types/employee.types'

interface HolidaysTabProps {
  createModalOpen?: boolean
  setCreateModalOpen?: (open: boolean) => void
}

export const HolidaysTab: React.FC<HolidaysTabProps> = ({
  createModalOpen: propModalOpen,
  setCreateModalOpen: propSetModalOpen,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKhmer = i18n.language === 'km'
  const toast = useToast()
  const qc = useQueryClient()

  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([])

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    date: true,
    day: true,
    is_recurring: true,
    description: true,
    status: true,
  })

  const columnOptions: ColumnOption[] = useMemo(() => [
    { key: 'title', label: t('employees.holiday_title', 'Title') },
    { key: 'date', label: t('employees.holiday_date', 'Date') },
    { key: 'day', label: t('employees.holiday_day', 'Day') },
    { key: 'is_recurring', label: t('employees.holiday_recurring', 'Recurring Yearly') },
    { key: 'description', label: t('employees.holiday_description', 'Description') },
    { key: 'status', label: t('employees.holiday_status', 'Status') },
  ], [t])

  // Modal states
  const [internalModalOpen, setInternalModalOpen] = useState(false)
  const modalOpen = Boolean(propModalOpen) || internalModalOpen
  const setModalOpen = (open: boolean) => {
    setInternalModalOpen(open)
    if (propSetModalOpen) {
      propSetModalOpen(open)
    }
  }

  const [editingItem, setEditingItem] = useState<HolidayItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HolidayItem | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Form inputs
  const [formTitleEn, setFormTitleEn] = useState('')
  const [formTitleKm, setFormTitleKm] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [formRecurring, setFormRecurring] = useState(true)

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: t('employees.active_holidays', 'Active') },
      { value: 'inactive', label: t('employees.inactive_holidays', 'Inactive') },
    ],
    [t]
  )

  // Current active year for HR operations
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  // Fetch holidays for current year
  const { data: holidaysResponse, isLoading, isFetching } = useQuery({
    queryKey: ['holidays', page, perPage, search, currentYear],
    queryFn: () =>
      employeeService.holidays({
        page,
        per_page: perPage,
        search,
        year: currentYear,
      }),
    staleTime: 30_000,
  })

  const records: HolidayItem[] = useMemo(() => {
    return holidaysResponse?.data || []
  }, [holidaysResponse])

  const totalRecords = holidaysResponse?.total || 0
  const totalPages = Math.ceil(totalRecords / perPage) || 1

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => employeeService.createHoliday(payload),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.holiday_created_success', 'Holiday created successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      closeModal()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to create holiday')
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      employeeService.updateHoliday(id, data),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.holiday_updated_success', 'Holiday updated successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      closeModal()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to update holiday')
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => employeeService.deleteHoliday(id),
    onSuccess: () => {
      sound.playDelete()
      toast.success(t('employees.holiday_deleted_success', 'Holiday deleted successfully'))
      qc.invalidateQueries({ queryKey: ['holidays'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to delete holiday')
      toast.error(msg)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => employeeService.bulkDeleteHolidays(ids),
    onSuccess: (res: any) => {
      sound.playDelete()
      const count = res?.data?.deleted_count ?? selectedRows.length
      toast.success(t('employees.holiday_deleted_success', `${count} holidays deleted successfully`))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      qc.invalidateQueries({ queryKey: ['holidays'] })
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to delete selected holidays')
      toast.error(msg)
    },
  })

  const syncLiveApiMutation = useMutation({
    mutationFn: () => employeeService.syncLiveHolidays(currentYear),
    onSuccess: (res: any) => {
      sound.playSuccess()
      const count = res?.data?.synced_count ?? 0
      toast.success(
        t('employees.sync_live_success', {
          count,
          year: currentYear,
          defaultValue: `Successfully synchronized ${count} public holidays for year ${currentYear} from Live API!`,
        })
      )
      qc.invalidateQueries({ queryKey: ['holidays'] })
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.error_occurred', 'Failed to sync live holidays API')
      toast.error(msg)
    },
  })


  // Sync form inputs when modalOpen changes from outside (e.g. from EmployeesPage header Add button)
  useEffect(() => {
    if (modalOpen && !editingItem) {
      setFormTitleEn('')
      setFormTitleKm('')
      setFormDate(new Date().toISOString().split('T')[0])
      setFormDescription('')
      setFormStatus('active')
      setFormRecurring(true)
    }
  }, [modalOpen, editingItem])

  // Modal helpers
  const openCreateModal = () => {
    sound.playClick()
    setEditingItem(null)
    setFormTitleEn('')
    setFormTitleKm('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormDescription('')
    setFormStatus('active')
    setFormRecurring(true)
    setModalOpen(true)
  }

  const openEditModal = (item: HolidayItem) => {
    sound.playClick()
    setEditingItem(item)
    setFormTitleEn(item.title_en || '')
    setFormTitleKm(item.title_km || '')
    setFormDate(item.date ? String(item.date).split('T')[0] : new Date().toISOString().split('T')[0])
    setFormDescription(item.description || '')
    setFormStatus(item.status || 'active')
    setFormRecurring(Boolean(item.is_recurring))
    setModalOpen(true)
  }

  const closeModal = () => {
    setInternalModalOpen(false)
    if (propSetModalOpen) {
      propSetModalOpen(false)
    }
    setEditingItem(null)
  }

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!formTitleEn.trim() && !formTitleKm.trim()) {
      sound.playWarning()
      toast.warning(t('employees.holiday_title_required', 'Please enter a holiday title'))
      return
    }

    if (!formDate) {
      sound.playWarning()
      toast.warning(t('employees.holiday_date_required', 'Please select a holiday date'))
      return
    }

    const payload = {
      title_en: formTitleEn.trim() || formTitleKm.trim(),
      title_km: formTitleKm.trim() || formTitleEn.trim(),
      date: formDate,
      description: formDescription.trim(),
      status: formStatus,
      is_recurring: formRecurring,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // Multi-select helpers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(records.map((r) => r.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number | string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedRows)
  }

  // Format Date & Day Name
  const formatHolidayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString(isKhmer ? 'km-KH' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', { weekday: 'long' })
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── Global Standard Table Toolbar ─── */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('employees.search_holiday_placeholder', 'Search holiday title, description...')}
        onReset={() => {
          sound.playClick()
          setSearch('')
          setPage(1)
        }}
        hideResetButton={!search}
        onRefresh={() => {
          sound.playClick()
          qc.invalidateQueries({ queryKey: ['holidays'] })
        }}
        refreshLoading={isFetching || isLoading}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Column Visibility')}
        rightActions={
          <button
            type="button"
            onClick={() => syncLiveApiMutation.mutate()}
            disabled={syncLiveApiMutation.isPending}
            className="group h-10 min-h-[40px] px-3.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs sm:text-[13px] font-medium text-foreground hover:text-foreground flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-xs hover:shadow shrink-0 whitespace-nowrap"
            title={t('employees.sync_current_year_holidays_tooltip', {
              year: currentYear,
              defaultValue: `Fetch official Cambodian public holidays for ${currentYear} from Live API`,
            })}
          >
            {syncLiveApiMutation.isPending ? (
              <Loader2 size={14} className="animate-spin text-primary shrink-0" />
            ) : (
              <Globe size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            )}
            <span className="hidden sm:inline">
              {t('employees.sync_current_year_holidays', {
                year: currentYear,
                defaultValue: `Sync Holidays (${currentYear})`,
              })}
            </span>
          </button>
        }
      />

      {/* ─── Bulk actions banner ─── */}
      <BulkSelectionBanner
        selectedCount={selectedRows.length}
        onDelete={() => setBulkDeleteConfirmOpen(true)}
        onClear={() => setSelectedRows([])}
        deleteLabel={t('employees.deleteSelected', 'Delete Selected')}
        deleteLoading={bulkDeleteMutation.isPending}
      />

      {/* ─── Main Content: Global Standard Table ─── */}
      <TableWrapper isFetching={isLoading || isFetching}>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="w-8 !px-3">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedRows.length === records.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="checkbox"
                />
              </th>
              {visibleColumns.title && (
                <th className="py-3.5 px-4 font-bold min-w-[200px]">
                  {t('employees.holiday_title', 'Title')}
                </th>
              )}
              {visibleColumns.date && (
                <th className="py-3.5 px-4 font-bold min-w-[130px]">
                  {t('employees.holiday_date', 'Date')}
                </th>
              )}
              {visibleColumns.day && (
                <th className="py-3.5 px-4 font-bold min-w-[110px]">
                  {t('employees.holiday_day', 'Day')}
                </th>
              )}
              {visibleColumns.is_recurring && (
                <th className="py-3.5 px-4 font-bold min-w-[120px] text-center">
                  {t('employees.holiday_recurring', 'Recurring Yearly')}
                </th>
              )}
              {visibleColumns.description && (
                <th className="py-3.5 px-4 font-bold min-w-[220px]">
                  {t('employees.holiday_description', 'Description')}
                </th>
              )}
              {visibleColumns.status && (
                <th className="py-3.5 px-4 font-bold min-w-[100px] text-center">
                  {t('employees.holiday_status', 'Status')}
                </th>
              )}
              <th className="text-right !pr-6">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {records.length === 0 ? (
              <EmptyState
                cols={8}
                icon={<Calendar className="text-muted-foreground/50 stroke-1" size={32} />}
                title={t('common.noRecordsFound', 'No holidays found')}
                description={
                  search
                    ? t('common.tryDifferentSearch', 'Try searching for a different keyword.')
                    : t('employees.no_holidays_for_year_desc', {
                        year: currentYear,
                        defaultValue: `No public holidays recorded for year ${currentYear} yet. Click below to fetch from Live API.`,
                      })
                }
                actionLabel={
                  !search
                    ? t('employees.sync_current_year_holidays', {
                        year: currentYear,
                        defaultValue: `Sync Holidays (${currentYear})`,
                      })
                    : undefined
                }
                onAction={!search ? () => syncLiveApiMutation.mutate() : undefined}
              />
            ) : (
              records.map((item) => {
                const isSelected = selectedRows.includes(item.id)
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/30 transition-colors group ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-8 !px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                        className="checkbox"
                      />
                    </td>

                    {/* Title */}
                    {visibleColumns.title && (
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-xs sm:text-sm">
                          {item.title_km || item.title_en}
                        </div>
                        {item.title_en && item.title_en !== item.title_km && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 font-normal">
                            <span className="text-[10px] font-semibold text-primary/70 tracking-wider">EN:</span>
                            <span>{item.title_en}</span>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Date */}
                    {visibleColumns.date && (
                      <td className="py-3 px-4 text-xs font-medium text-foreground whitespace-nowrap font-mono">
                        {formatHolidayDate(item.date)}
                      </td>
                    )}

                    {/* Day Name */}
                    {visibleColumns.day && (
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {getDayName(item.date)}
                      </td>
                    )}

                    {/* Recurring Yearly */}
                    {visibleColumns.is_recurring && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.is_recurring ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                            <Repeat size={12} className="stroke-[2.5]" />
                            {t('employees.recurring_yearly', 'Yearly')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/60">
                            {t('employees.one_time', 'One-time')}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Description */}
                    {visibleColumns.description && (
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={item.status || 'active'} />
                      </td>
                    )}

                    {/* Actions: Global TableActionMenu */}
                    <td className="py-3 px-4 text-right whitespace-nowrap print:hidden !pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        <TableActionMenu
                          variant="inline"
                          buttonSize="sm"
                          align="right"
                          onEdit={() => openEditModal(item)}
                          editLabel={t('common.edit', 'Edit')}
                          onDelete={() => {
                            sound.playDelete()
                            setDeleteTarget(item)
                          }}
                          deleteLabel={t('common.delete', 'Delete')}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* ─── Standard Pagination ─── */}
      {totalRecords > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={totalRecords}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            sound.playClick()
            setPerPage(newPerPage)
            setPage(1)
          }}
        />
      )}

      {/* ─── ADD / EDIT HOLIDAY MODAL (Enterprise Standard) ─── */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingItem
            ? t('employees.edit_holiday', 'Edit Holiday')
            : t('employees.add_holiday', 'Add Holiday')
        }
        subtitle={t('employees.holiday_modal_subtitle', 'Configure public holiday and non-working schedule')}
        icon={<Calendar size={20} />}
        iconVariant="emerald"
        size="2xl"
        badge={
          editingItem?.id ? (
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 border border-border/60 dark:border-slate-700">
              #{editingItem.id}
            </span>
          ) : undefined
        }
        footer={
          <ModalFooter
            onCancel={closeModal}
            cancelLabel={t('common.cancel', 'Cancel')}
            submitLabel={
              editingItem
                ? t('common.saveChanges', 'Save Changes')
                : t('employees.add_holiday', 'Add Holiday')
            }
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            disabled={createMutation.isPending || updateMutation.isPending}
            isEdit={!!editingItem}
            submitButtonType="submit"
            onSubmit={() => handleFormSubmit()}
          />
        }
      >
        <form id="holiday-modal-form" onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Holiday Title: Khmer (Primary) & English (Secondary) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField
              label={t('employees.holiday_title_km', 'Holiday Title (Khmer)')}
              required
            >
              <EnterpriseInput
                value={formTitleKm}
                onChange={(e) => setFormTitleKm(e.target.value)}
                placeholder={t('employees.holiday_title_km_placeholder', 'e.g. Traditional Khmer New Year')}
              />
            </FormField>

            <FormField
              label={t('employees.holiday_title_en', 'Holiday Title (English)')}
            >
              <EnterpriseInput
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
                placeholder={t('employees.holiday_title_en_placeholder', 'e.g. Khmer New Year Traditional Holiday')}
              />
            </FormField>
          </div>

          {/* Date & Status (Native Standard Select) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField
              label={t('employees.holiday_date', 'Date')}
              required
            >
              <EnterpriseDatePicker
                value={formDate}
                onChange={(val) => setFormDate(val || '')}
                placeholder="YYYY-MM-DD"
                clearable={false}
              />
            </FormField>

            <FormField
              label={t('employees.holiday_status', 'Status')}
            >
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                className="form-select"
              >
                <option value="active">{t('employees.active_holidays', 'Active')}</option>
                <option value="inactive">{t('employees.inactive_holidays', 'Inactive')}</option>
              </select>
            </FormField>
          </div>

          {/* Description */}
          <FormField
            label={t('employees.holiday_description', 'Description')}
          >
            <EnterpriseTextarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t('employees.holiday_description_placeholder', 'Brief description of holiday...')}
            />
          </FormField>

          {/* Recurring Toggle with Global ToggleSwitch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/40">
            <div className="space-y-0.5">
              <label
                onClick={() => setFormRecurring(!formRecurring)}
                className="text-xs font-semibold text-foreground cursor-pointer block select-none"
              >
                {t('employees.holiday_recurring', 'Recurring Yearly')}
              </label>
              <p className="text-[11px] text-muted-foreground select-none">
                {t('employees.holiday_recurring_desc', 'Automatically repeat this holiday every year on the same date')}
              </p>
            </div>
            <ToggleSwitch
              checked={formRecurring}
              onChange={setFormRecurring}
              size="md"
              activeColor="emerald"
            />
          </div>
        </form>
      </EnterpriseModal>

      {/* ─── DELETE CONFIRM DIALOG ─── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        isOpen={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title={t('employees.delete_holiday_title', 'Delete Holiday')}
        itemName={deleteTarget?.title_km || deleteTarget?.title_en || ''}
        message={t('employees.delete_holiday_confirm', {
          title: deleteTarget?.title_km || deleteTarget?.title_en || '',
          defaultValue: `Are you sure you want to delete holiday «${deleteTarget?.title_km || deleteTarget?.title_en}»?`
        })}
        confirmText={t('common.delete', 'Delete')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {/* ─── BULK DELETE CONFIRM DIALOG ─── */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        isOpen={bulkDeleteConfirmOpen}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t('employees.bulkDeleteTitle', 'Delete Selected Holidays')}
        message={t('employees.confirmBulkDeleteMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected holidays?`
        })}
        confirmText={t('common.delete', 'Delete')}
        confirmLabel={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}

export default HolidaysTab
